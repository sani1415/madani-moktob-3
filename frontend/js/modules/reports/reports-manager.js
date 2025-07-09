/**
 * Reports Manager Module
 * Handles report generation, student detail views, and attendance tracking
 */

import { appManager } from '../../core/app.js';
import { API_ENDPOINTS } from '../../core/config.js';
import { formatDate, getClassNumber, parseRollNumber } from '../../core/utils.js';

export const reportsManager = {
    // Module state
    currentStudentDetailMonth: new Date().getMonth(),
    currentStudentDetailYear: new Date().getFullYear(),
    currentStudentData: null,
    currentSummaryPeriod: 'last30Days',
    studentDetailSource: 'attendance',

    /**
     * Initialize the Reports Module
     */
    async initialize() {
        console.log('📊 Initializing Reports Module...');
        
        // Set up report event listeners
        this.setupEventListeners();
        
        console.log('✅ Reports Module initialized successfully');
    },

    /**
     * Setup event listeners for reports
     */
    setupEventListeners() {
        // Report generation event listeners
        const reportStartDate = document.getElementById('reportStartDate');
        const reportEndDate = document.getElementById('reportEndDate');
        const reportClass = document.getElementById('reportClass');
        
        if (reportStartDate) {
            reportStartDate.addEventListener('change', this.updateReportClassDropdown.bind(this));
        }
        
        if (reportEndDate) {
            reportEndDate.addEventListener('change', this.updateReportClassDropdown.bind(this));
        }
        
        if (reportClass) {
            reportClass.addEventListener('change', this.updateReportClassDropdown.bind(this));
        }
    },

    /**
     * Generate attendance report
     */
    generateReport() {
        console.log("📊 Generating report...");
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
    },

    /**
     * Generate report from beginning of academic year
     */
    generateFromBeginningReport() {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        if (!academicYearStartDate) {
            this.showModal('Error', 'Academic year start date is not configured. Please set it in Settings.');
            return;
        }
        
        const startDate = academicYearStartDate;
        const endDate = new Date().toISOString().split('T')[0];
        const reportResults = document.getElementById('reportResults');
        const reportClassElement = document.getElementById('reportClass');
        const selectedClass = reportClassElement ? reportClassElement.value : '';
        
        console.log(`From Beginning Date Range: ${startDate} to ${endDate}, Class: ${selectedClass || 'All'}`);
        
        this.generateReportWithDates(startDate, endDate, selectedClass, true);
    },

    /**
     * Generate report with specific dates
     */
    generateReportWithDates(startDate, endDate, selectedClass, fromBeginning) {
        const reportResults = document.getElementById('reportResults');
        const appState = appManager.getState();
        const { students } = appState;
        
        reportResults.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating report...</p>';
        
        // Use a short timeout to allow the UI to update before processing
        setTimeout(() => {
            try {
                console.log("📊 Filtering students...");
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
                
                console.log("📊 Report data calculated:", reportData);

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
                
                // Add Hijri date to the report
                this.addHijriToReports(startDate, endDate);
                console.log("📊 Report display updated.");
            } catch (error) {
                console.error("❌ Error generating report:", error);
                reportResults.innerHTML = '<p class="text-danger">An error occurred while generating the report. Please check the console for details.</p>';
            }
        }, 50);
    },

    /**
     * Calculate attendance statistics for a student
     */
    calculateStudentAttendanceStats(student, startDate, endDate) {
        const appState = appManager.getState();
        const { attendance, holidays } = appState;
        
        let present = 0;
        let absent = 0;
        let leave = 0;
        let totalDays = 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Iterate through each day in the date range
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            
            // Skip weekends (Friday and Saturday in Bangladesh)
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                continue;
            }
            
            // Check if this date is a holiday
            const isHoliday = holidays.some(holiday => {
                const holidayStart = new Date(holiday.startDate || holiday.date);
                const holidayEnd = new Date(holiday.endDate || holiday.date);
                return date >= holidayStart && date <= holidayEnd;
            });
            
            if (isHoliday) {
                continue;
            }
            
            totalDays++;
            
            // Check attendance for this date
            if (attendance[dateStr] && attendance[dateStr][student.id]) {
                const status = attendance[dateStr][student.id].status;
                if (status === 'present') {
                    present++;
                } else if (status === 'absent') {
                    absent++;
                } else if (status === 'leave') {
                    leave++;
                }
            }
        }
        
        const attendanceRate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
        
        return {
            present,
            absent,
            leave,
            attendanceRate
        };
    },

    /**
     * Show student detail view
     */
    showStudentDetail(studentId, source = 'attendance') {
        const appState = appManager.getState();
        const { students } = appState;
        const student = students.find(s => s.id === studentId);
        
        if (!student) {
            this.showModal('Error', 'Student not found');
            return;
        }
        
        // Store the source for navigation back
        this.studentDetailSource = source;
        
        // Hide all sections and show student detail as separate page
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('student-detail').classList.add('active');
        
        // Update page title
        document.getElementById('studentDetailTitle').textContent = `${student.name} - Student Details`;
        
        // Update back button text based on source
        const backButton = document.querySelector('#student-detail .btn-secondary');
        if (backButton) {
            if (source === 'registration') {
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Registration';
            } else {
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Reports';
            }
        }
        
        // Generate student detail content
        this.generateStudentDetailContent(student);
        
        // Update URL hash for navigation
        window.location.hash = `student/${studentId}`;
    },

    /**
     * Navigate back to reports
     */
    backToReports() {
        document.getElementById('student-detail').classList.remove('active');
        
        // Navigate back to the correct section based on where we came from
        if (this.studentDetailSource === 'registration') {
            document.getElementById('registration').classList.add('active');
            window.location.hash = 'registration';
        } else {
            document.getElementById('reports').classList.add('active');
            window.location.hash = 'reports';
        }
    },

    /**
     * Generate student detail content
     */
    generateStudentDetailContent(student) {
        const detailContent = document.getElementById('studentDetailContent');
        
        // Store current student data for calendar navigation
        this.currentStudentData = student;
        
        // Calculate attendance statistics based on selected period
        let startDateStr, endDateStr, periodLabel;
        const today = new Date();
        const endDateStr_today = today.toISOString().split('T')[0];
        
        if (this.currentSummaryPeriod === 'last30Days') {
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
            endDateStr = endDateStr_today;
            periodLabel = 'Last 30 Days';
        } else {
            // From beginning - use academic year start date or student registration date
            const appState = appManager.getState();
            const { academicYearStartDate } = appState;
            const registrationDate = student.registrationDate;
            
            if (academicYearStartDate) {
                startDateStr = academicYearStartDate;
            } else if (registrationDate) {
                startDateStr = registrationDate;
            } else {
                // Fallback to 6 months ago if no academic year or registration date
                const sixMonthsAgo = new Date(today);
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                startDateStr = sixMonthsAgo.toISOString().split('T')[0];
            }
            endDateStr = endDateStr_today;
            periodLabel = 'From Beginning';
        }
        
        const attendanceStats = this.calculateStudentAttendanceStats(student, startDateStr, endDateStr);
        
        detailContent.innerHTML = `
            <div class="student-info-card">
                <div class="student-basic-info">
                    <div class="info-group">
                        <h4>Personal Information</h4>
                        <div class="info-item">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value">${student.name} বিন ${student.fatherName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Roll Number:</span>
                            <span class="info-value">${student.rollNumber || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Class:</span>
                            <span class="info-value">${student.class}</span>
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <h4>Contact Information</h4>
                        <div class="info-item">
                            <span class="info-label">Mobile Number:</span>
                            <span class="info-value">${student.mobileNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">District:</span>
                            <span class="info-value">${student.district}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Sub-District:</span>
                            <span class="info-value">${student.upazila}</span>
                        </div>
                    </div>
                    
                    <div class="info-group">
                        <h4>Academic Information</h4>
                        <div class="info-item">
                            <span class="info-label">Registration Date:</span>
                            <span class="info-value">${student.registrationDate}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Roll Number:</span>
                            <span class="info-value">${student.rollNumber || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="attendance-history">
                    <div class="attendance-summary-header">
                        <h4>Attendance Summary (${periodLabel})</h4>
                        <div class="summary-period-toggle">
                            <label>Summary Period:</label>
                            <button onclick="reportsManager.changeSummaryPeriod('last30Days')" class="period-btn ${this.currentSummaryPeriod === 'last30Days' ? 'active' : ''}">
                                Last 30 Days
                            </button>
                            <button onclick="reportsManager.changeSummaryPeriod('fromBeginning')" class="period-btn ${this.currentSummaryPeriod === 'fromBeginning' ? 'active' : ''}">
                                From Beginning
                            </button>
                        </div>
                    </div>
                    <div class="attendance-summary">
                        <div class="summary-item present">
                            <h5>Total Present</h5>
                            <div class="number">${attendanceStats.present}</div>
                        </div>
                        <div class="summary-item absent">
                            <h5>Total Absent</h5>
                            <div class="number">${attendanceStats.absent}</div>
                        </div>
                        <div class="summary-item">
                            <h5>Leave Days</h5>
                            <div class="number">${attendanceStats.leave}</div>
                        </div>
                        <div class="summary-item">
                            <h5>Attendance Rate</h5>
                            <div class="number">${attendanceStats.attendanceRate}%</div>
                        </div>
                    </div>
                    
                    <div class="attendance-calendar">
                        <div class="calendar-header">
                            <h5>Attendance Calendar</h5>
                        </div>
                        <div class="student-calendar-navigation">
                            <button onclick="reportsManager.navigateStudentCalendar(-1)" class="nav-btn" title="Previous Month">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="month-year-display">
                                <select id="studentMonthSelector" onchange="reportsManager.changeStudentCalendarMonth()" class="month-selector">
                                    ${this.generateMonthOptions()}
                                </select>
                                <input type="number" id="studentYearSelector" value="${this.currentStudentDetailYear}" min="2020" max="2030" 
                                       onchange="reportsManager.changeStudentCalendarYear()" class="year-selector">
                            </div>
                            <button onclick="reportsManager.navigateStudentCalendar(1)" class="nav-btn" title="Next Month">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        <div id="studentAttendanceCalendar">
                            ${this.generateStudentAttendanceCalendar(student, this.currentStudentDetailMonth, this.currentStudentDetailYear)}
                        </div>
                        <div class="calendar-actions">
                            <button onclick="reportsManager.goToCurrentMonthStudent()" class="btn btn-secondary btn-sm">
                                <i class="fas fa-calendar-day"></i> Current Month
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate month options for calendar
     */
    generateMonthOptions() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return months.map((month, index) => 
            `<option value="${index}" ${index === this.currentStudentDetailMonth ? 'selected' : ''}>${month}</option>`
        ).join('');
    },

    /**
     * Generate student attendance calendar
     */
    generateStudentAttendanceCalendar(student, month, year) {
        const appState = appManager.getState();
        const { attendance, holidays } = appState;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1);
        const startingDayOfWeek = firstDay.getDay();
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        let html = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <h6>${monthNames[month]} ${year}</h6>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        <div class="weekday">Sun</div>
                        <div class="weekday">Mon</div>
                        <div class="weekday">Tue</div>
                        <div class="weekday">Wed</div>
                        <div class="weekday">Thu</div>
                        <div class="weekday">Fri</div>
                        <div class="weekday">Sat</div>
                    </div>
                    <div class="calendar-days">
        `;
        
        // Empty cells for days before the start of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            let dayClass = 'calendar-day';
            let dayContent = day;
            let statusIcon = '';
            
            // Check if it's a weekend
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                dayClass += ' weekend';
                statusIcon = '<i class="fas fa-moon"></i>';
            } else {
                // Check if it's a holiday
                const isHoliday = holidays.some(holiday => {
                    const holidayStart = new Date(holiday.startDate || holiday.date);
                    const holidayEnd = new Date(holiday.endDate || holiday.date);
                    return date >= holidayStart && date <= holidayEnd;
                });
                
                if (isHoliday) {
                    dayClass += ' holiday';
                    statusIcon = '<i class="fas fa-star"></i>';
                } else {
                    // Check attendance
                    if (attendance[dateStr] && attendance[dateStr][student.id]) {
                        const status = attendance[dateStr][student.id].status;
                        if (status === 'present') {
                            dayClass += ' present';
                            statusIcon = '<i class="fas fa-check"></i>';
                        } else if (status === 'absent') {
                            dayClass += ' absent';
                            statusIcon = '<i class="fas fa-times"></i>';
                        } else if (status === 'leave') {
                            dayClass += ' leave';
                            statusIcon = '<i class="fas fa-plane"></i>';
                        }
                    }
                }
            }
            
            html += `
                <div class="${dayClass}">
                    <div class="day-number">${dayContent}</div>
                    <div class="day-status">${statusIcon}</div>
                </div>
            `;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    },

    /**
     * Navigate student calendar
     */
    navigateStudentCalendar(direction) {
        this.currentStudentDetailMonth += direction;
        
        if (this.currentStudentDetailMonth < 0) {
            this.currentStudentDetailMonth = 11;
            this.currentStudentDetailYear--;
        } else if (this.currentStudentDetailMonth > 11) {
            this.currentStudentDetailMonth = 0;
            this.currentStudentDetailYear++;
        }
        
        this.refreshStudentCalendar();
    },

    /**
     * Change student calendar month
     */
    changeStudentCalendarMonth() {
        const monthSelector = document.getElementById('studentMonthSelector');
        this.currentStudentDetailMonth = parseInt(monthSelector.value);
        this.refreshStudentCalendar();
    },

    /**
     * Change student calendar year
     */
    changeStudentCalendarYear() {
        const yearSelector = document.getElementById('studentYearSelector');
        this.currentStudentDetailYear = parseInt(yearSelector.value);
        this.refreshStudentCalendar();
    },

    /**
     * Refresh student calendar
     */
    refreshStudentCalendar() {
        if (this.currentStudentData) {
            const calendarContainer = document.getElementById('studentAttendanceCalendar');
            if (calendarContainer) {
                calendarContainer.innerHTML = this.generateStudentAttendanceCalendar(
                    this.currentStudentData, 
                    this.currentStudentDetailMonth, 
                    this.currentStudentDetailYear
                );
            }
            
            // Update month selector
            const monthSelector = document.getElementById('studentMonthSelector');
            if (monthSelector) {
                monthSelector.value = this.currentStudentDetailMonth;
            }
            
            // Update year selector
            const yearSelector = document.getElementById('studentYearSelector');
            if (yearSelector) {
                yearSelector.value = this.currentStudentDetailYear;
            }
        }
    },

    /**
     * Go to current month in student calendar
     */
    goToCurrentMonthStudent() {
        const today = new Date();
        this.currentStudentDetailMonth = today.getMonth();
        this.currentStudentDetailYear = today.getFullYear();
        this.refreshStudentCalendar();
    },

    /**
     * Change summary period
     */
    changeSummaryPeriod(period) {
        this.currentSummaryPeriod = period;
        if (this.currentStudentData) {
            this.generateStudentDetailContent(this.currentStudentData);
        }
    },

    /**
     * Update report class dropdown
     */
    updateReportClassDropdown() {
        const appState = appManager.getState();
        const { classes } = appState;
        const reportClassSelect = document.getElementById('reportClass');
        
        if (reportClassSelect) {
            const currentValue = reportClassSelect.value;
            reportClassSelect.innerHTML = `
                <option value="">All Classes</option>
                ${classes.map(className => 
                    `<option value="${className}" ${currentValue === className ? 'selected' : ''}>${className}</option>`
                ).join('')}
            `;
        }
    },

    /**
     * Add Hijri date to reports
     */
    addHijriToReports(startDate, endDate) {
        const appState = appManager.getState();
        const { hijriEnabled, hijriAdjustment } = appState;
        
        if (hijriEnabled) {
            const reportHeader = document.querySelector('.report-header');
            if (reportHeader) {
                const hijriStartDate = this.convertToHijri(startDate, hijriAdjustment);
                const hijriEndDate = this.convertToHijri(endDate, hijriAdjustment);
                
                const hijriInfo = document.createElement('p');
                hijriInfo.style.cssText = 'color: #7f8c8d; font-size: 0.9em; margin-top: 5px;';
                hijriInfo.innerHTML = `📅 Hijri: ${hijriStartDate} to ${hijriEndDate}`;
                reportHeader.appendChild(hijriInfo);
            }
        }
    },

    /**
     * Convert date to Hijri
     */
    convertToHijri(dateStr, adjustment) {
        // This is a simplified conversion - in a real application,
        // you would use a proper Hijri calendar library
        const date = new Date(dateStr);
        // Add adjustment days
        date.setDate(date.getDate() + adjustment);
        
        // Simplified Hijri conversion (placeholder)
        const hijriYear = date.getFullYear() - 579; // Approximate
        const hijriMonth = date.getMonth() + 1;
        const hijriDay = date.getDate();
        
        return `${hijriDay}/${hijriMonth}/${hijriYear}`;
    },

    /**
     * Show modal (utility function)
     */
    showModal(title, message) {
        // This would integrate with a modal system
        alert(`${title}: ${message}`);
    }
};

// Export for window global access (backward compatibility)
window.reportsManager = reportsManager; 