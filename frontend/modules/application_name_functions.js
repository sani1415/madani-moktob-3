function initializeAppName() {
    const savedName = localStorage.getItem('madaniMaktabAppName');
    const input = document.getElementById('appNameInput');
    if (input && savedName) {
        input.value = savedName;
    }
    updateHeaderTexts();
}

function saveAppName() {
    const input = document.getElementById('appNameInput');
    if (!input) return;
    const newName = input.value.trim();
    if (!newName) {
        showModal(t('error'), t('enterAppName'));
        return;
    }
    localStorage.setItem('madaniMaktabAppName', newName);
    updateHeaderTexts();
    showModal(t('success'), t('appNameUpdated'));
}

function saveAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const startDate = academicYearStartInput.value;
    
    if (!startDate) {
        showModal(t('error'), t('selectAcademicYearStart'));
        return;
    }
    
    // Save academic year start date
    academicYearStartDate = startDate;
    localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
    
    // Update date restrictions for all date inputs
    updateDateRestrictions();
    
    // Initialize calendar to start from academic year start date
    initializeCalendarToAcademicYear();
    
    showModal(t('success'), t('academicYearStartUpdated'));
    
    // Clear the input
    academicYearStartInput.value = '';
    
    // Update the display
    displayAcademicYearStart();
}

function initializeAcademicYearStart() {
    // Load academic year start date from localStorage
    const savedStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
    if (savedStartDate) {
        academicYearStartDate = savedStartDate;
        console.log('Loaded academic year start date:', academicYearStartDate);
        
        // Initialize calendar to start from academic year start date
        initializeCalendarToAcademicYear();
    }
    displayAcademicYearStart();
    
    // Apply date restrictions if academic year start is set
    updateDateRestrictions();
}

function initializeCalendarToAcademicYear() {
    if (academicYearStartDate) {
        const academicYearStart = new Date(academicYearStartDate);
        const today = new Date();
        
        // If today is before academic year start, start calendar from academic year start
        // Otherwise, start from current month
        if (today.toISOString().split('T')[0] < academicYearStartDate) {
            currentCalendarMonth = academicYearStart.getMonth();
            currentCalendarYear = academicYearStart.getFullYear();
            console.log('Initialized calendar to academic year start date:', academicYearStartDate);
        }
    }
}

function displayAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const currentDisplay = document.getElementById('currentAcademicYearDisplay');
    const displaySpan = document.getElementById('academicYearStartDisplay');
    
    if (academicYearStartDate) {
        // Show the current academic year start date in the input (for editing)
        if (academicYearStartInput) {
            academicYearStartInput.value = academicYearStartDate;
        }
        
        // Show the current academic year display
        if (currentDisplay && displaySpan) {
            displaySpan.textContent = formatDate(academicYearStartDate);
            currentDisplay.style.display = 'block';
        }
    } else {
        // Clear the input and hide the display
        if (academicYearStartInput) {
            academicYearStartInput.value = '';
        }
        if (currentDisplay) {
            currentDisplay.style.display = 'none';
        }
    }
}

function clearAcademicYearStart() {
    // Show confirmation dialog
    if (!confirm(t('confirmClearAcademicYear'))) {
        return;
    }
    
    // Clear the academic year start date
    academicYearStartDate = null;
    localStorage.removeItem('madaniMaktabAcademicYearStart');
    
    // Clear all date restrictions
    clearDateRestrictions();
    hideAllDateRestrictionNotices();
    
    // Update the display
    displayAcademicYearStart();
    
    showModal(t('success'), t('academicYearStartCleared'));
}

function updateDateRestrictions() {
    if (!academicYearStartDate) {
        // Hide notices and clear restrictions if no academic year start date is set
        hideAllDateRestrictionNotices();
        clearDateRestrictions();
        return;
    }
    
    console.log('Updating date restrictions from academic year start:', academicYearStartDate);
    
    // List of date input IDs that should be restricted
    const dateInputIds = [
        'reportStartDate',
        'reportEndDate',
        'attendanceDate'
    ];
    
    dateInputIds.forEach(inputId => {
        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            // Set minimum date to academic year start
            dateInput.min = academicYearStartDate;
            
            // If current value is before academic year start, clear it
            if (dateInput.value && dateInput.value < academicYearStartDate) {
                dateInput.value = '';
                console.log(`Cleared ${inputId} as it was before academic year start`);
            }
            
            console.log(`Set minimum date for ${inputId} to ${academicYearStartDate}`);
        }
    });
    
    // Update holiday date input as well
    const holidayDateInput = document.getElementById('holidayDate');
    if (holidayDateInput) {
        holidayDateInput.min = academicYearStartDate;
        if (holidayDateInput.value && holidayDateInput.value < academicYearStartDate) {
            holidayDateInput.value = '';
        }
    }
    
    // Update academic year start input itself to prevent selecting past dates
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    if (academicYearStartInput) {
        // Allow changing academic year start to any date, but show current value
        academicYearStartInput.value = academicYearStartDate;
    }
    
    // Show date restriction notices
    showDateRestrictionNotices();
}

function clearDateRestrictions() {
    console.log('Clearing all date restrictions');
    
    const dateInputIds = [
        'reportStartDate',
        'reportEndDate',
        'attendanceDate',
        'holidayDate'
    ];
    
    dateInputIds.forEach(inputId => {
        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            dateInput.removeAttribute('min');
            console.log(`Removed minimum date restriction for ${inputId}`);
        }
    });
}

function showDateRestrictionNotices() {
    const notices = [
        'dateRestrictionNotice', // Reports section
        'attendanceDateRestrictionNotice' // Attendance section
    ];
    
    notices.forEach(noticeId => {
        const notice = document.getElementById(noticeId);
        if (notice) {
            notice.style.display = 'flex';
            
            // Update the notice text to include the actual start date
            const span = notice.querySelector('span');
            if (span && academicYearStartDate) {
                const formattedDate = formatDate(academicYearStartDate);
                const noticeText = t('dateRestrictionNoticeFrom').replace('{date}', formattedDate);
                span.textContent = noticeText;
            }
        }
    });
}

function hideAllDateRestrictionNotices() {
    const notices = [
        'dateRestrictionNotice',
        'attendanceDateRestrictionNotice'
    ];
    
    notices.forEach(noticeId => {
        const notice = document.getElementById(noticeId);
        if (notice) {
            notice.style.display = 'none';
        }
    });
}

function addHijriToReports() {
    // This function can be called when generating reports to include Hijri dates
    const reportTable = document.querySelector('#reportTable');
    if (reportTable && window.hijriCalendar) {
        // Add Hijri date information to report headers if needed
        const currentLang = localStorage.getItem('language') || 'en';
        const startDate = document.getElementById('reportStartDate')?.value;
        const endDate = document.getElementById('reportEndDate')?.value;
        
        if (startDate && endDate) {
            const startHijri = hijriCalendar.getHijriForDate(startDate);
            const endHijri = hijriCalendar.getHijriForDate(endDate);
            
            let reportHeader = document.getElementById('reportHijriHeader');
            if (!reportHeader) {
                reportHeader = document.createElement('div');
                reportHeader.id = 'reportHijriHeader';
                reportHeader.className = 'report-hijri-header';
                reportTable.parentNode.insertBefore(reportHeader, reportTable);
            }
            
            const startHijriStr = hijriCalendar.formatHijriDate(startHijri, currentLang);
            const endHijriStr = hijriCalendar.formatHijriDate(endHijri, currentLang);
            
            reportHeader.innerHTML = `
                <div class="hijri-date-range">
                    <i class="fas fa-moon"></i>
                    <span>${startHijriStr} - ${endHijriStr}</span>
                </div>
            `;
        }
    }
}

// expose functions globally
Object.assign(window, { addHijriToReports, clearAcademicYearStart, clearDateRestrictions, displayAcademicYearStart, hideAllDateRestrictionNotices, initializeAcademicYearStart, initializeAppName, initializeCalendarToAcademicYear, saveAcademicYearStart, saveAppName, showDateRestrictionNotices, updateDateRestrictions });
