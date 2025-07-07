/**
 * Reports Manager Module
 * Handles all report generation functionality including:
 * - Attendance reports
 * - Attendance tracking calendar
 * - Student statistics
 * - Calendar navigation
 */

import { appManager } from '../../core/app.js';
import { API_CONFIG } from '../../core/config.js';
import { formatDate, parseRollNumber, getClassNumber } from '../../core/utils.js';

class ReportsManager {
    constructor() {
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        this.currentReportData = [];
        this.sortDirection = {};
        this.columnFilters = {};
    }

    /**
     * Initialize the reports manager
     */
    async initialize() {
        console.log('🔧 Initializing Reports Manager...');
        
        // Initialize calendar to academic year start if set
        this.initializeCalendarToAcademicYear();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Reports Manager initialized successfully');
    }

    /**
     * Initialize calendar to academic year start date
     */
    initializeCalendarToAcademicYear() {
        const academicYearStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
        if (academicYearStartDate) {
            const academicYearStart = new Date(academicYearStartDate);
            const today = new Date();
            
            // If today is before academic year start, start calendar from academic year start
            if (today.toISOString().split('T')[0] < academicYearStartDate) {
                this.currentCalendarMonth = academicYearStart.getMonth();
                this.currentCalendarYear = academicYearStart.getFullYear();
                console.log('Initialized calendar to academic year start date:', academicYearStartDate);
            }
        }
    }

    /**
     * Set up event listeners for report functionality
     */
    setupEventListeners() {
        // Calendar navigation event listeners will be added dynamically
        console.log('Report event listeners set up');
    }

    /**
     * Generate attendance report for date range
     */
    generateReport() {
        console.log("Generating report...");
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        const reportResults = document.getElementById('reportResults');
        const reportClassElement = document.getElementById('reportClass');
        const selectedClass = reportClassElement ? reportClassElement.value : '';
        
        console.log(`Date Range: ${startDate} to ${endDate}, Class: ${selectedClass || 'All'}`);
        
        if (!startDate || !endDate) {
            this.showModal('Error', 'Please select both a start and end date.');
            return;
        }
        
        this.generateReportWithDates(startDate, endDate, selectedClass, false);
    }

    /**
     * Generate report from beginning of academic year
     */
    generateFromBeginningReport() {
        console.log("Generating from beginning report...");
        
        const academicYearStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
        if (!academicYearStartDate) {
            this.showModal('Error', 'No academic year start date set. Please set it in Settings.');
            return;
        }
        
        const startDate = academicYearStartDate;
        const endDate = new Date().toISOString().split('T')[0];
        const reportResults = document.getElementById('reportResults');
        const reportClassElement = document.getElementById('reportClass');
        const selectedClass = reportClassElement ? reportClassElement.value : '';
        
        console.log(`From Beginning Date Range: ${startDate} to ${endDate}, Class: ${selectedClass || 'All'}`);
        
        this.generateReportWithDates(startDate, endDate, selectedClass, true);
    }

    /**
     * Generate report with specific date range
     */
    generateReportWithDates(startDate, endDate, selectedClass, fromBeginning) {
        const reportResults = document.getElementById('reportResults');
        
        reportResults.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating report...</p>';
        
        // Use a short timeout to allow the UI to update before processing
        setTimeout(() => {
            try {
                console.log("Filtering students...");
                const students = appManager.getState('students') || [];
                let filteredStudents = students;
                if (selectedClass) {
                    filteredStudents = students.filter(student => student.class === selectedClass);
                }
                console.log(`${filteredStudents.length} students to process.`);
                
                const reportData = filteredStudents.map(student => {
                    const stats = this.calculateStudentAttendanceStats(student, startDate, endDate);
                    return {
                        ...student,
                        presentDays: stats.present,
                        absentDays: stats.absent,
                        leaveDays: stats.leave,
                        attendanceRate: stats.attendanceRate
                    };
                }).sort((a, b) => {
                    const classA = getClassNumber(a.class);
                    const classB = getClassNumber(b.class);
                    if (classA !== classB) return classA - classB;
                    return parseRollNumber(a.rollNumber) - parseRollNumber(b.rollNumber);
                });
                
                console.log("Report data calculated:", reportData);

                if (reportData.length === 0) {
                    reportResults.innerHTML = '<p>No attendance data found for the selected criteria.</p>';
                    return;
                }
                
                const reportTitle = fromBeginning ? 'Academic Year Report' : 'Attendance Report';
                
                reportResults.innerHTML = `
                    <div class="report-header">
                        <h4>${reportTitle} (${formatDate(startDate)} to ${formatDate(endDate)})</h4>
                        ${fromBeginning ? '<p style="color: #27ae60; font-weight: bold;">📚 Academic Year Report - From Beginning</p>' : ''}
                    </div>
                    <div class="report-table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Roll</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Leave Days</th>
                                    <th>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.map(data => `
                                    <tr>
                                        <td>${data.rollNumber}</td>
                                        <td><span class="clickable-name" onclick="showStudentDetail('${data.id}')">${data.name} বিন ${data.fatherName}</span></td>
                                        <td>${data.class}</td>
                                        <td class="status-present">${data.presentDays}</td>
                                        <td class="status-absent">${data.absentDays}</td>
                                        <td>${data.leaveDays}</td>
                                        <td><strong>${data.attendanceRate}%</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                
                console.log("Report display updated.");
            } catch (error) {
                console.error("Error generating report:", error);
                reportResults.innerHTML = '<p class="text-danger">An error occurred while generating the report. Please check the console for details.</p>';
            }
        }, 50);
    }

    /**
     * Calculate attendance statistics for a student
     */
    calculateStudentAttendanceStats(student, startDate, endDate) {
        const attendance = appManager.getState('attendance') || {};
        const holidays = appManager.getState('holidays') || [];
        
        let present = 0, absent = 0, leave = 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();
            
            // Skip weekends (assuming Friday is weekend)
            if (dayOfWeek === 5) continue;
            
            // Skip holidays
            if (this.isHoliday(dateStr, holidays)) continue;
            
            const studentAttendance = attendance[dateStr]?.[student.id];
            if (studentAttendance) {
                switch (studentAttendance.status) {
                    case 'present':
                        present++;
                        break;
                    case 'absent':
                        absent++;
                        break;
                    case 'leave':
                        leave++;
                        break;
                }
            }
        }
        
        const total = present + absent + leave;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { present, absent, leave, attendanceRate };
    }

    /**
     * Show attendance tracking calendar
     */
    showAttendanceCalendar() {
        try {
            console.log('Starting showAttendanceCalendar function...');
            
            const reportsSection = document.getElementById('reports');
            if (!reportsSection) {
                console.error('Reports section not found');
                return;
            }
            
            const existingCalendar = reportsSection.querySelector('.attendance-tracking-section');
            const toggleButton = reportsSection.querySelector('.calendar-toggle button');
            
            if (!toggleButton) {
                console.error('Toggle button not found');
                return;
            }
            
            if (existingCalendar) {
                // If calendar exists, toggle its visibility
                console.log('Calendar exists, toggling visibility...');
                if (existingCalendar.style.display === 'none') {
                    existingCalendar.style.display = 'block';
                    toggleButton.innerHTML = `📅 Hide Attendance Tracking Calendar`;
                    console.log('Calendar shown');
                } else {
                    existingCalendar.style.display = 'none';
                    toggleButton.innerHTML = `📅 Show Attendance Tracking Calendar`;
                    console.log('Calendar hidden');
                }
            } else {
                // Create new calendar
                console.log('Creating new calendar...');
                const attendance = appManager.getState('attendance') || {};
                const holidays = appManager.getState('holidays') || [];
                
                console.log('Attendance data:', Object.keys(attendance).length, 'dates');
                console.log('Holidays data:', holidays.length, 'holidays');
                
                const calendarHTML = this.generateAttendanceTrackingCalendar();
                const calendarToggle = reportsSection.querySelector('.calendar-toggle');
                
                if (calendarToggle) {
                    calendarToggle.insertAdjacentHTML('afterend', calendarHTML);
                    toggleButton.innerHTML = `📅 Hide Attendance Tracking Calendar`;
                    console.log('Calendar created and inserted successfully');
                } else {
                    console.error('Calendar toggle section not found');
                }
            }
        } catch (error) {
            console.error('Error in showAttendanceCalendar:', error);
            this.showModal('Error', 'Failed to load attendance calendar. Please try again.');
        }
    }

    /**
     * Generate attendance tracking calendar HTML
     */
    generateAttendanceTrackingCalendar(month = null, year = null) {
        console.log('Generating attendance tracking calendar...');
        
        // Use provided month/year or current values
        const displayMonth = month !== null ? month : this.currentCalendarMonth;
        const displayYear = year !== null ? year : this.currentCalendarYear;
        
        console.log('Display date:', displayMonth + 1, displayYear);
        
        // Generate calendar for specified month
        const firstDay = new Date(displayYear, displayMonth, 1);
        const lastDay = new Date(displayYear, displayMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
        
        console.log('Days in month:', daysInMonth, 'Start day of week:', startDayOfWeek);
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const calendarHTML = `
            <div class="attendance-tracking-section">
                <h3>📅 Attendance Tracking Calendar</h3>
                
                <!-- Month Navigation -->
                <div class="calendar-navigation">
                    <button onclick="window.reportsManager.navigateCalendar(-1)" class="nav-btn" title="Previous Month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="month-year-display">
                        <select id="monthSelector" onchange="window.reportsManager.changeCalendarMonth()" class="month-selector">
                            ${monthNames.map((month, index) => 
                                `<option value="${index}" ${index === displayMonth ? 'selected' : ''}>${month}</option>`
                            ).join('')}
                        </select>
                        <input type="number" id="yearSelector" value="${displayYear}" min="2020" max="2030" 
                               onchange="window.reportsManager.changeCalendarYear()" class="year-selector">
                    </div>
                    <button onclick="window.reportsManager.navigateCalendar(1)" class="nav-btn" title="Next Month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button onclick="window.reportsManager.goToCurrentMonth()" class="nav-btn today-btn" title="Go to Current Month">
                        <i class="fas fa-calendar-day"></i>
                    </button>
                </div>
                
                <div class="calendar-container">
                    <div class="calendar-grid">
                        <div class="calendar-header">Sun</div>
                        <div class="calendar-header">Mon</div>
                        <div class="calendar-header">Tue</div>
                        <div class="calendar-header">Wed</div>
                        <div class="calendar-header">Thu</div>
                        <div class="calendar-header">Fri</div>
                        <div class="calendar-header">Sat</div>
                        ${this.generateCalendarDays(displayYear, displayMonth, startDayOfWeek, daysInMonth)}
                    </div>
                </div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-color attendance-taken"></span>
                        <span>Attendance Saved</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color attendance-missed"></span>
                        <span>Attendance NOT Taken</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color holiday-day"></span>
                        <span>Holiday</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color future-day"></span>
                        <span>Future Date</span>
                    </div>
                </div>
                <div class="attendance-summary" id="attendanceSummary">
                    ${this.generateAttendanceSummary(displayYear, displayMonth)}
                </div>
            </div>
        `;
        
        return calendarHTML;
    }

    /**
     * Generate calendar days HTML
     */
    generateCalendarDays(year, month, startDayOfWeek, daysInMonth) {
        let calendarHTML = '';
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const attendance = appManager.getState('attendance') || {};
        const holidays = appManager.getState('holidays') || [];
        const savedAttendanceDates = appManager.getState('savedAttendanceDates') || new Set();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            let dayClass = 'calendar-day';
            let dayTitle = dateStr;
            
            // Check if it's a holiday
            if (this.isHoliday(dateStr, holidays)) {
                dayClass += ' holiday-day';
                const holidayName = this.getHolidayName(dateStr, holidays);
                dayTitle = `Holiday: ${holidayName}`;
            }
            // Check if attendance was saved to database
            else if (savedAttendanceDates.has(dateStr)) {
                dayClass += ' attendance-taken';
                dayTitle = `Attendance saved on ${dateStr}`;
            }
            // Check if it's a future date
            else if (date > today) {
                dayClass += ' future-day';
                dayTitle = 'Future date';
            }
            // School day but no attendance taken
            else {
                dayClass += ' attendance-missed';
                dayTitle = `Attendance NOT taken on ${dateStr}`;
            }
            
            calendarHTML += `
                <div class="${dayClass}" title="${dayTitle}">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }
        
        return calendarHTML;
    }

    /**
     * Generate attendance summary for a month
     */
    generateAttendanceSummary(year, month) {
        const attendance = appManager.getState('attendance') || {};
        const holidays = appManager.getState('holidays') || [];
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        let totalTaken = 0;
        let totalMissed = 0;
        let holidaysCount = 0;
        const missedDates = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();
            const isWeekend = dayOfWeek === 5; // Assuming Friday is the weekend

            if (this.isHoliday(dateString, holidays)) {
                holidaysCount++;
            } else if (!isWeekend) {
                if (attendance[dateString] && Object.keys(attendance[dateString]).length > 0) {
                    totalTaken++;
                } else {
                    if (d < new Date()) { // Only count missed days in the past
                        totalMissed++;
                        missedDates.push(new Date(d));
                    }
                }
            }
        }

        const totalDays = totalTaken + totalMissed;
        const takenPercentage = totalDays > 0 ? ((totalTaken / totalDays) * 100).toFixed(0) : 0;
        const missedPercentage = totalDays > 0 ? ((totalMissed / totalDays) * 100).toFixed(0) : 0;
        
        const monthName = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        return `
            <div class="summary-header">
                <h4>Attendance Summary for ${monthName}</h4>
            </div>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-value">${totalTaken}</span>
                    <span class="stat-label">Days Taken</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalMissed}</span>
                    <span class="stat-label">Days Missed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${holidaysCount}</span>
                    <span class="stat-label">Holidays</span>
                </div>
            </div>
            <div class="summary-chart">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${takenPercentage}%; background-color: #28a745;" title="Taken: ${takenPercentage}%"></div>
                    <div class="progress-bar" style="width: ${missedPercentage}%; background-color: #dc3545;" title="Missed: ${missedPercentage}%"></div>
                </div>
            </div>
            ${missedDates.length > 0 ? `
                <div class="missed-dates">
                    <h5><i class="fas fa-exclamation-triangle"></i> Missed Attendance Dates:</h5>
                    <ul>
                        ${missedDates.map(date => 
                            `<li>${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</li>`
                        ).join('')}
                    </ul>
                </div>
            ` : `
                <div class="no-missed-dates">
                    <p><i class="fas fa-check-circle"></i> Great job! No missed attendance this month.</p>
                </div>
            `}
        `;
    }

    /**
     * Navigate calendar by months
     */
    navigateCalendar(direction) {
        const proposedMonth = this.currentCalendarMonth + direction;
        
        if (proposedMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear += 1;
        } else if (proposedMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear -= 1;
        } else {
            this.currentCalendarMonth = proposedMonth;
        }
        
        this.refreshCalendar();
    }

    /**
     * Change calendar month
     */
    changeCalendarMonth() {
        const monthSelector = document.getElementById('monthSelector');
        if (monthSelector) {
            this.currentCalendarMonth = parseInt(monthSelector.value);
            this.refreshCalendar();
        }
    }

    /**
     * Change calendar year
     */
    changeCalendarYear() {
        const yearSelector = document.getElementById('yearSelector');
        if (yearSelector) {
            this.currentCalendarYear = parseInt(yearSelector.value);
            this.refreshCalendar();
        }
    }

    /**
     * Go to current month
     */
    goToCurrentMonth() {
        const today = new Date();
        this.currentCalendarMonth = today.getMonth();
        this.currentCalendarYear = today.getFullYear();
        this.refreshCalendar();
    }

    /**
     * Refresh calendar display
     */
    refreshCalendar() {
        const calendarSection = document.querySelector('.attendance-tracking-section');
        if (calendarSection) {
            console.log('Refreshing calendar for month:', this.currentCalendarMonth + 1, 'year:', this.currentCalendarYear);
            const newCalendarHTML = this.generateAttendanceTrackingCalendar(this.currentCalendarMonth, this.currentCalendarYear);
            calendarSection.outerHTML = newCalendarHTML;
            console.log('Calendar refreshed successfully');
        }
    }

    /**
     * Check if a date is a holiday
     */
    isHoliday(date, holidays) {
        if (!holidays || holidays.length === 0) return false;
        
        return holidays.some(h => {
            const startDate = h.startDate || h.date;
            const endDate = h.endDate || h.date;
            
            const checkDate = new Date(date);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const startDateStr = new Date(startDate).toISOString().split('T')[0];
            const endDateStr = new Date(endDate).toISOString().split('T')[0];
            
            return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
        });
    }

    /**
     * Get holiday name for a date
     */
    getHolidayName(date, holidays) {
        if (!holidays || holidays.length === 0) return '';
        
        const holiday = holidays.find(h => {
            const startDate = h.startDate || h.date;
            const endDate = h.endDate || h.date;
            
            const checkDate = new Date(date);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const startDateStr = new Date(startDate).toISOString().split('T')[0];
            const endDateStr = new Date(endDate).toISOString().split('T')[0];
            
            return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
        });
        
        return holiday ? holiday.name : '';
    }

    /**
     * Show modal (temporary implementation)
     */
    showModal(title, message) {
        alert(`${title}: ${message}`);
    }
}

// Create and export the reports manager instance
export const reportsManager = new ReportsManager();

// Make it available globally for HTML onclick handlers
window.reportsManager = reportsManager;