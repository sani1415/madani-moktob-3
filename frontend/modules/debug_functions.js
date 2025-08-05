// ===== DEBUG FUNCTIONS =====
// Consolidated debug functions for development and troubleshooting

function debugClassNames() {
    console.log("=== CLASS NAME DEBUG ===");
    console.log("Predefined classes:");
    classes.forEach((className, index) => {
        console.log(`${index + 1}. "${className}" (Length: ${className.length})`);
    });
    
    console.log("\nClasses found in student data:");
    const studentClasses = [...new Set(students.map(s => s.class))];
    studentClasses.forEach((className, index) => {
        const isMatching = classes.includes(className);
        console.log(`${index + 1}. "${className}" (Length: ${className.length}) - ${isMatching ? '✅ MATCHES' : '❌ NO MATCH'}`);
        
        if (!isMatching) {
            console.log(`   Character codes: ${Array.from(className).map(c => c.charCodeAt(0)).join(', ')}`);
        }
    });
    
    console.log("\nPredefined class character codes:");
    classes.forEach((className, index) => {
        console.log(`${index + 1}. "${className}" - ${Array.from(className).map(c => c.charCodeAt(0)).join(', ')}`);
    });
}

function debugSavedDates() {
    console.log('=== DEBUG SAVED DATES ===');
    console.log('savedAttendanceDates:', Array.from(savedAttendanceDates));
    console.log('Total saved dates:', savedAttendanceDates.size);
    console.log('Current attendance object keys:', Object.keys(attendance));
    console.log('Current attendance object:', attendance);
    console.log('========================');
}

function testCalendarRefresh() {
    console.log('=== Testing Calendar Refresh ===');
    console.log('Current attendance data:', attendance);
    console.log('Saved attendance dates:', Array.from(savedAttendanceDates));
    refreshAttendanceCalendarIfVisible();
    forceRefreshAttendanceCalendar();
    console.log('=== Test Complete ===');
}

function refreshAttendanceCalendarIfVisible() {
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
        console.log('Current savedAttendanceDates:', Array.from(savedAttendanceDates));
        
        // Force refresh the calendar
        refreshCalendar();
        
        // Also update the attendance summary
        const summaryElement = document.getElementById('attendanceSummary');
        if (summaryElement) {
            summaryElement.innerHTML = generateAttendanceSummary(currentCalendarYear, currentCalendarMonth);
        }
    }
}

function goToCurrentMonth() {
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
    
    currentCalendarMonth = targetMonth;
    currentCalendarYear = targetYear;
    refreshCalendar();
}

function generateCalendarDays(year, month, startDayOfWeek, daysInMonth) {
    let calendarHTML = '';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Ensure global variables are initialized
    if (!window.attendance) {
        window.attendance = {};
    }
    if (!window.holidays) {
        window.holidays = [];
    }
    
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
        else if (isHoliday(dateStr)) {
            dayClass += ' holiday-day';
            const holidayName = getHolidayName(dateStr);
            dayTitle = `Holiday: ${holidayName}`;
        }
        // Check if attendance was saved to database (priority over future date)
        else if (savedAttendanceDates.has(dateStr)) {
            dayClass += ' attendance-taken';
            dayTitle = `Attendance saved on ${dateStr}`;
            console.log(`Date ${dateStr} marked as attendance-taken (saved)`);
        }
        // Check if it's a future date (after checking attendance status)
        else if (date > today) {
            dayClass += ' future-day disabled';
            dayTitle = 'Future date - Cannot take attendance';
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

function generateAttendanceSummary(year, month) {
    const summaryDiv = document.getElementById('attendance-summary');
    if (!summaryDiv) return;

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

        if (isHoliday(dateString)) {
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

    summaryDiv.innerHTML = `
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
                        const hijriDate = getHijriDate(dateString, hijriAdjustment);
                        return `<li>${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })} 
                                    <span class="hijri-date-small">${hijriDate.day} ${hijriDate.monthName}, ${hijriDate.year}</span></li>`;
                    }).join('')}
                </ul>
        </div>
        ` : `
            <div class="no-missed-dates">
                <p><i class="fas fa-check-circle"></i> Great job! No missed attendance this month.</p>
            </div>
        `}
    `;
}

// Export all debug functions
export { 
    debugClassNames, 
    debugSavedDates, 
    testCalendarRefresh, 
    refreshAttendanceCalendarIfVisible,
    goToCurrentMonth,
    generateCalendarDays,
    generateAttendanceSummary
}; 