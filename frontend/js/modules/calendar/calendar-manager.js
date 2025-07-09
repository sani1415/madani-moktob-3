/**
 * Calendar Manager Module
 * Handles calendar display, navigation, and date management
 */

import { appManager } from '../../core/app.js';
import { formatDate } from '../../core/utils.js';

export const calendarManager = {
    // Calendar navigation state
    currentCalendarMonth: new Date().getMonth(),
    currentCalendarYear: new Date().getFullYear(),

    /**
     * Initialize the Calendar Module
     */
    async initialize() {
        console.log('📅 Initializing Calendar Module...');
        
        // Initialize calendar to current month, but will be updated to academic year start if set
        this.initializeCalendarToAcademicYear();
        
        console.log('✅ Calendar Module initialized successfully');
    },

    /**
     * Initialize calendar to academic year start if set
     */
    initializeCalendarToAcademicYear() {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        if (academicYearStartDate) {
            const academicYearStart = new Date(academicYearStartDate);
            this.currentCalendarMonth = academicYearStart.getMonth();
            this.currentCalendarYear = academicYearStart.getFullYear();
            console.log('Calendar initialized to academic year start:', this.currentCalendarMonth + 1, this.currentCalendarYear);
        }
    },

    /**
     * Generate attendance tracking calendar
     */
    generateAttendanceTrackingCalendar(month = null, year = null) {
        console.log('📅 Generating attendance tracking calendar...');
        
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
        
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        const calendarHTML = `
            <div class="attendance-tracking-section">
                <h3>📅 Attendance Tracking Calendar</h3>
                
                <!-- Month Navigation -->
                <div class="calendar-navigation">
                    <button onclick="calendarManager.navigateCalendar(-1)" class="nav-btn" title="Previous Month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="month-year-display">
                        <select id="monthSelector" onchange="calendarManager.changeCalendarMonth()" class="month-selector">
                            ${monthNames.map((month, index) => 
                                `<option value="${index}" ${index === displayMonth ? 'selected' : ''}>${month}</option>`
                            ).join('')}
                        </select>
                        <input type="number" id="yearSelector" value="${displayYear}" min="2020" max="2030" 
                               onchange="calendarManager.changeCalendarYear()" class="year-selector">
                    </div>
                    <button onclick="calendarManager.navigateCalendar(1)" class="nav-btn" title="Next Month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button onclick="calendarManager.goToCurrentMonth()" class="nav-btn today-btn" title="Go to Current Month">
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
                    ${academicYearStartDate ? `
                    <div class="legend-item">
                        <span class="legend-color before-academic-year"></span>
                        <span>Before Academic Year</span>
                    </div>` : ''}
                </div>
                <div class="attendance-summary" id="attendanceSummary">
                    ${this.generateAttendanceSummary(displayYear, displayMonth)}
                </div>
            </div>
        `;
        
        return calendarHTML;
    },

    /**
     * Generate calendar days
     */
    generateCalendarDays(year, month, startDayOfWeek, daysInMonth) {
        const appState = appManager.getState();
        const { attendance, holidays, academicYearStartDate, savedAttendanceDates } = appState;
        
        const settingsManager = appManager.getModule('settingsManager');
        
        let calendarHTML = '';
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            // Use local date to avoid timezone issues with toISOString()
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            let dayClass = 'calendar-day';
            let dayTitle = dateStr;
            
            // Check if date is before academic year start
            if (academicYearStartDate && dateStr < academicYearStartDate) {
                dayClass += ' before-academic-year';
                dayTitle = `Before academic year start (${formatDate(academicYearStartDate)})`;
            }
            // Check if it's a holiday
            else if (settingsManager && settingsManager.isHoliday(dateStr)) {
                dayClass += ' holiday-day';
                const holidayName = settingsManager.getHolidayName(dateStr);
                dayTitle = `Holiday: ${holidayName}`;
            }
            // Check if attendance was saved to database (priority over future date)
            else if (savedAttendanceDates && savedAttendanceDates.has(dateStr)) {
                dayClass += ' attendance-taken';
                dayTitle = `Attendance saved on ${dateStr}`;
                console.log(`Date ${dateStr} marked as attendance-taken (saved)`);
            }
            // Check if it's a future date (after checking attendance status)
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
    },

    /**
     * Generate attendance summary
     */
    generateAttendanceSummary(year, month) {
        const appState = appManager.getState();
        const { attendance, holidays } = appState;
        
        const settingsManager = appManager.getModule('settingsManager');
        
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

            if (settingsManager && settingsManager.isHoliday(dateString)) {
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
                        ${missedDates.map(date => {
                            const dateString = date.toISOString().split('T')[0];
                            return `<li>${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</li>`;
                        }).join('')}
                    </ul>
                </div>
            ` : `
                <div class="no-missed-dates">
                    <p><i class="fas fa-check-circle"></i> Great job! No missed attendance this month.</p>
                </div>
            `}
        `;
    },

    /**
     * Navigate calendar by direction
     */
    navigateCalendar(direction) {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        const proposedMonth = this.currentCalendarMonth + direction;
        const proposedYear = this.currentCalendarYear;
        
        if (proposedMonth > 11) {
            const nextMonth = 0;
            const nextYear = this.currentCalendarYear + 1;
            
            this.currentCalendarMonth = nextMonth;
            this.currentCalendarYear = nextYear;
        } else if (proposedMonth < 0) {
            const prevMonth = 11;
            const prevYear = this.currentCalendarYear - 1;
            
            // Check if this would go before academic year start
            if (academicYearStartDate && !this.canNavigateToMonth(prevMonth, prevYear)) {
                console.log('Cannot navigate to month before academic year start');
                return; // Don't navigate
            }
            
            this.currentCalendarMonth = prevMonth;
            this.currentCalendarYear = prevYear;
        } else {
            // Check if this would go before academic year start
            if (academicYearStartDate && !this.canNavigateToMonth(proposedMonth, proposedYear)) {
                console.log('Cannot navigate to month before academic year start');
                return; // Don't navigate
            }
            
            this.currentCalendarMonth = proposedMonth;
            this.currentCalendarYear = proposedYear;
        }
        
        this.refreshCalendar();
    },

    /**
     * Check if can navigate to month
     */
    canNavigateToMonth(month, year) {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        if (!academicYearStartDate) {
            return true; // No restrictions if no academic year start date
        }
        
        const academicYearStart = new Date(academicYearStartDate);
        const academicYearStartMonth = academicYearStart.getMonth();
        const academicYearStartYear = academicYearStart.getFullYear();
        
        // Check if the proposed month/year is before the academic year start
        if (year < academicYearStartYear) {
            return false;
        } else if (year === academicYearStartYear && month < academicYearStartMonth) {
            return false;
        }
        
        return true;
    },

    /**
     * Change calendar month
     */
    changeCalendarMonth() {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        const monthSelector = document.getElementById('monthSelector');
        if (monthSelector) {
            const proposedMonth = parseInt(monthSelector.value);
            
            if (academicYearStartDate && !this.canNavigateToMonth(proposedMonth, this.currentCalendarYear)) {
                console.log('Cannot navigate to month before academic year start');
                // Reset to current month
                monthSelector.value = this.currentCalendarMonth;
                return;
            }
            
            this.currentCalendarMonth = proposedMonth;
            this.refreshCalendar();
        }
    },

    /**
     * Change calendar year
     */
    changeCalendarYear() {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        const yearSelector = document.getElementById('yearSelector');
        if (yearSelector) {
            const proposedYear = parseInt(yearSelector.value);
            
            if (academicYearStartDate && !this.canNavigateToMonth(this.currentCalendarMonth, proposedYear)) {
                console.log('Cannot navigate to year before academic year start');
                // Reset to current year
                yearSelector.value = this.currentCalendarYear;
                return;
            }
            
            this.currentCalendarYear = proposedYear;
            this.refreshCalendar();
        }
    },

    /**
     * Refresh calendar
     */
    refreshCalendar() {
        const calendarSection = document.querySelector('.attendance-tracking-section');
        if (calendarSection) {
            console.log('Refreshing calendar for month:', this.currentCalendarMonth + 1, 'year:', this.currentCalendarYear);
            const newCalendarHTML = this.generateAttendanceTrackingCalendar(this.currentCalendarMonth, this.currentCalendarYear);
            calendarSection.outerHTML = newCalendarHTML;
            console.log('Calendar refreshed successfully');
        } else {
            console.log('Calendar section not found for refresh');
        }
    },

    /**
     * Go to current month
     */
    goToCurrentMonth() {
        const appState = appManager.getState();
        const { academicYearStartDate } = appState;
        
        const today = new Date();
        let targetMonth = today.getMonth();
        let targetYear = today.getFullYear();
        
        // If academic year start date is set and today is before it, start from academic year start
        if (academicYearStartDate) {
            const academicYearStart = new Date(academicYearStartDate);
            const todayStr = today.toISOString().split('T')[0];
            
            if (todayStr < academicYearStartDate) {
                targetMonth = academicYearStart.getMonth();
                targetYear = academicYearStart.getFullYear();
                console.log('Starting calendar from academic year start date instead of today');
            }
        }
        
        this.currentCalendarMonth = targetMonth;
        this.currentCalendarYear = targetYear;
        this.refreshCalendar();
    },

    /**
     * Force refresh attendance calendar
     */
    forceRefreshAttendanceCalendar() {
        // Force refresh regardless of visibility - useful for debugging
        const calendarSection = document.querySelector('.attendance-tracking-section');
        console.log('Force refreshing calendar...', calendarSection ? 'Found calendar' : 'Calendar not found');
        
        if (calendarSection) {
            this.refreshCalendar();
            console.log('Force refresh completed');
        }
    },

    /**
     * Refresh attendance calendar if visible
     */
    refreshAttendanceCalendarIfVisible() {
        // Check if attendance calendar exists and refresh it
        const calendarSection = document.querySelector('.attendance-tracking-section');
        console.log('Checking calendar visibility...', calendarSection ? 'Calendar exists' : 'Calendar not found');
        
        if (calendarSection) {
            // Always refresh the calendar when it exists, regardless of visibility
            // This ensures it has updated data when shown later
            const computedStyle = window.getComputedStyle(calendarSection);
            const isVisible = computedStyle.display !== 'none' && calendarSection.offsetHeight > 0;
            
            console.log('Calendar visibility check:', {
                display: computedStyle.display,
                offsetHeight: calendarSection.offsetHeight,
                isVisible: isVisible
            });
            
            console.log('Refreshing attendance calendar with updated data...');
            const appState = appManager.getState();
            const { savedAttendanceDates } = appState;
            console.log('Current savedAttendanceDates:', Array.from(savedAttendanceDates || []));
            
            // Refresh the calendar
            this.refreshCalendar();
            
            console.log('Attendance calendar refreshed successfully');
        }
    },

    /**
     * Show attendance calendar
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
                    toggleButton.innerHTML = '📅 Hide Attendance Calendar';
                    console.log('Calendar shown');
                } else {
                    existingCalendar.style.display = 'none';
                    toggleButton.innerHTML = '📅 Show Attendance Calendar';
                    console.log('Calendar hidden');
                }
            } else {
                // If calendar doesn't exist, create it
                console.log('Creating new calendar...');
                const calendarHTML = this.generateAttendanceTrackingCalendar();
                const calendarDiv = document.createElement('div');
                calendarDiv.innerHTML = calendarHTML;
                
                // Insert after the toggle button
                const toggleSection = reportsSection.querySelector('.calendar-toggle');
                if (toggleSection) {
                    toggleSection.insertAdjacentHTML('afterend', calendarHTML);
                    toggleButton.innerHTML = '📅 Hide Attendance Calendar';
                    console.log('Calendar created and shown');
                } else {
                    console.error('Toggle section not found');
                }
            }
        } catch (error) {
            console.error('Error in showAttendanceCalendar:', error);
        }
    },

    /**
     * Test calendar refresh (for debugging)
     */
    testCalendarRefresh() {
        console.log('=== Testing Calendar Refresh ===');
        const appState = appManager.getState();
        const { attendance, savedAttendanceDates } = appState;
        console.log('Current attendance data:', attendance);
        console.log('Saved attendance dates:', Array.from(savedAttendanceDates || []));
        this.refreshAttendanceCalendarIfVisible();
        this.forceRefreshAttendanceCalendar();
        console.log('=== Test Complete ===');
    },

    /**
     * Debug saved dates (for debugging)
     */
    debugSavedDates() {
        console.log('=== DEBUG SAVED DATES ===');
        const appState = appManager.getState();
        const { attendance, savedAttendanceDates } = appState;
        console.log('savedAttendanceDates:', Array.from(savedAttendanceDates || []));
        console.log('Total saved dates:', savedAttendanceDates ? savedAttendanceDates.size : 0);
        console.log('Current attendance object keys:', Object.keys(attendance || {}));
        console.log('Current attendance object:', attendance);
        console.log('========================');
    }
};

// Export for window global access (backward compatibility)
window.calendarManager = calendarManager; 