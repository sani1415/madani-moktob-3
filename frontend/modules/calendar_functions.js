// ===== CALENDAR FUNCTIONS =====
// Consolidated calendar navigation and helper functions

// Calendar navigation functions
function navigateCalendar(direction) {
    const proposedMonth = currentCalendarMonth + direction;
    const proposedYear = currentCalendarYear;
    
    if (proposedMonth > 11) {
        const nextMonth = 0;
        const nextYear = currentCalendarYear + 1;
        
        currentCalendarMonth = nextMonth;
        currentCalendarYear = nextYear;
    } else if (proposedMonth < 0) {
        const prevMonth = 11;
        const prevYear = currentCalendarYear - 1;
        
        // Check if this would go before academic year start
        if (academicYearStartDate && !canNavigateToMonth(prevMonth, prevYear)) {
            console.log('Cannot navigate to month before academic year start');
            return; // Don't navigate
        }
        
        currentCalendarMonth = prevMonth;
        currentCalendarYear = prevYear;
    } else {
        // Check if this would go before academic year start
        if (academicYearStartDate && !canNavigateToMonth(proposedMonth, proposedYear)) {
            console.log('Cannot navigate to month before academic year start');
            return; // Don't navigate
        }
        
        currentCalendarMonth = proposedMonth;
        currentCalendarYear = proposedYear;
    }
    
    refreshCalendar();
}

function canNavigateToMonth(month, year) {
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
}

function changeCalendarMonth() {
    const monthSelector = document.getElementById('monthSelector');
    if (monthSelector) {
        const proposedMonth = parseInt(monthSelector.value);
        
        if (academicYearStartDate && !canNavigateToMonth(proposedMonth, currentCalendarYear)) {
            console.log('Cannot navigate to month before academic year start');
            // Reset to current month
            monthSelector.value = currentCalendarMonth;
            return;
        }
        
        currentCalendarMonth = proposedMonth;
        refreshCalendar();
    }
}

function changeCalendarYear() {
    const yearSelector = document.getElementById('yearSelector');
    if (yearSelector) {
        const proposedYear = parseInt(yearSelector.value);
        
        if (academicYearStartDate && !canNavigateToMonth(currentCalendarMonth, proposedYear)) {
            console.log('Cannot navigate to year before academic year start');
            // Reset to current year
            yearSelector.value = currentCalendarYear;
            return;
        }
        
        currentCalendarYear = proposedYear;
        refreshCalendar();
    }
}

function refreshCalendar() {
    const calendarSection = document.querySelector('.attendance-tracking-section');
    if (calendarSection) {
        console.log('Refreshing calendar for month:', currentCalendarMonth + 1, 'year:', currentCalendarYear);
        const newCalendarHTML = generateAttendanceTrackingCalendar(currentCalendarMonth, currentCalendarYear);
        calendarSection.outerHTML = newCalendarHTML;
        console.log('Calendar refreshed successfully');
    } else {
        console.log('Calendar section not found for refresh');
    }
}

function forceRefreshAttendanceCalendar() {
    console.log('Force refreshing attendance calendar...');
    // Force a complete refresh of the calendar
    refreshCalendar();
}

// Calendar helper functions
function showAttendanceCalendar() {
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
                toggleButton.innerHTML = `📅 ${t('hideAttendanceTrackingCalendar')}`;
                console.log('Calendar shown');
            } else {
                existingCalendar.style.display = 'none';
                toggleButton.innerHTML = `📅 ${t('showAttendanceTrackingCalendar')}`;
                console.log('Calendar hidden');
            }
        } else {
            // Create new calendar
            console.log('Creating new calendar...');
            console.log('Attendance data:', Object.keys(attendance).length, 'dates');
            console.log('Holidays data:', holidays.length, 'holidays');
            
            const calendarHTML = generateAttendanceTrackingCalendar();
            const calendarToggle = reportsSection.querySelector('.calendar-toggle');
            
            if (calendarToggle) {
                calendarToggle.insertAdjacentHTML('afterend', calendarHTML);
                toggleButton.innerHTML = `📅 ${t('hideAttendanceTrackingCalendar')}`;
                console.log('Calendar created and inserted successfully');
            } else {
                console.error('Calendar toggle section not found');
            }
        }
    } catch (error) {
        console.error('Error in showAttendanceCalendar:', error);
        showModal('Error', 'Failed to load attendance calendar. Please try again.');
    }
}

function generateFromBeginningReport() {
    console.log("Generating from beginning report...");
    
    if (!academicYearStartDate) {
        showModal(t('error'), t('noAcademicYearSet'));
        return;
    }
    
    const startDate = academicYearStartDate;
    const endDate = new Date().toISOString().split('T')[0]; // Today's date
    const reportResults = document.getElementById('reportResults');
    const reportClassElement = document.getElementById('reportClass');
    const selectedClass = reportClassElement ? reportClassElement.value : '';
    
    console.log(`From Beginning Date Range: ${startDate} to ${endDate}, Class: ${selectedClass || 'All'}`);
    
    generateReportWithDates(startDate, endDate, selectedClass, true);
}

function generateReport() {
    console.log("Generating report...");
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const reportResults = document.getElementById('reportResults');
    const reportClassElement = document.getElementById('reportClass');
    const selectedClass = reportClassElement ? reportClassElement.value : '';
    
    console.log(`Date Range: ${startDate} to ${endDate}, Class: ${selectedClass || 'All'}`);
    
    if (!startDate || !endDate) {
        showModal(t('error'), 'Please select both a start and end date.');
        return;
    }
    
    generateReportWithDates(startDate, endDate, selectedClass, false);
}

function generateReportWithDates(startDate, endDate, selectedClass, fromBeginning) {
    const reportResults = document.getElementById('reportResults');
    
    reportResults.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating report...</p>';
    
    // Use a short timeout to allow the UI to update before processing
    setTimeout(() => {
        try {
            console.log("Filtering students...");
            
            // Filter students by class if specified
            let filteredStudents = students;
            if (selectedClass && selectedClass !== '') {
                filteredStudents = students.filter(student => student.class === selectedClass);
                console.log(`Filtered to ${filteredStudents.length} students in class: ${selectedClass}`);
            }
            
            if (filteredStudents.length === 0) {
                reportResults.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${selectedClass ? `No students found in class: ${selectedClass}` : 'No students registered yet'}</p>
                    </div>
                `;
                return;
            }
            
            // Calculate attendance statistics
            const stats = calculateAttendanceStats(filteredStudents, startDate, endDate);
            
            // Generate report HTML
            const reportHTML = generateReportHTML(stats, startDate, endDate, selectedClass, fromBeginning);
            
            reportResults.innerHTML = reportHTML;
            
            console.log("Report generated successfully");
            
        } catch (error) {
            console.error("Error generating report:", error);
            reportResults.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error generating report. Please try again.</p>
                </div>
            `;
        }
    }, 100);
}

// Export all calendar-related functions
export {
    // Calendar navigation functions
    navigateCalendar,
    canNavigateToMonth,
    changeCalendarMonth,
    changeCalendarYear,
    refreshCalendar,
    forceRefreshAttendanceCalendar,
    
    // Calendar helper functions
    showAttendanceCalendar,
    generateFromBeginningReport,
    generateReport,
    generateReportWithDates
}; 