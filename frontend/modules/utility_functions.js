// ===== UTILITY FUNCTIONS =====
// Consolidated utility functions for the application

// Date formatting utilities
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function convertBengaliToEnglishNumbers(str) {
    if (!str) return str;
    const bengaliToEnglish = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return str.toString().replace(/[০-৯]/g, match => bengaliToEnglish[match]);
}

function parseRollNumber(rollNumber) {
    if (!rollNumber) return 0;
    const englishNumber = convertBengaliToEnglishNumbers(rollNumber);
    return parseInt(englishNumber) || 0;
}

function getClassNumber(className) {
    if (!className) return 0;
    const bengaliClassMap = {
        'প্রথম শ্রেণি': 1,
        'দ্বিতীয় শ্রেণি': 2,
        'তৃতীয় শ্রেণি': 3,
        'চতুর্থ শ্রেণি': 4,
        'পঞ্চম শ্রেণি': 5
    };
    
    if (bengaliClassMap[className]) {
        return bengaliClassMap[className];
    }
    
    // Fallback to extracting number from class name
    const match = className.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

// Mobile menu functions
function toggleMobileMenu() {
    const navList = document.getElementById('navList');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    
    navList.classList.toggle('active');
    
    // Change icon
    if (navList.classList.contains('active')) {
        toggleButton.className = 'fas fa-times';
    } else {
        toggleButton.className = 'fas fa-bars';
    }
}

// Hijri date functions
function initializeHijriSettings() {
    console.log('Initializing Hijri settings...');
    const hijriSelect = document.getElementById('hijriAdjustment');
    
    if (!window.hijriCalendar) {
        console.error('Hijri calendar not loaded');
        return;
    }
    
    if (!hijriSelect) {
        console.error('Hijri select element not found');
        return;
    }
    
    try {
        // Load saved adjustment value
        const savedAdjustment = hijriCalendar.getAdjustment();
        hijriSelect.value = savedAdjustment;
        console.log('Hijri adjustment loaded:', savedAdjustment);
        
        // Update preview
        updateHijriPreview();
        
        // Add Hijri dates to dashboard and other sections
        updateDashboardWithHijri();
        updateAttendancePageHijri();
        
        console.log('Hijri settings initialized successfully');
    } catch (error) {
        console.error('Error initializing Hijri settings:', error);
    }
}

function updateHijriAdjustment() {
    const hijriSelect = document.getElementById('hijriAdjustment');
    if (hijriSelect && window.hijriCalendar) {
        const adjustment = parseInt(hijriSelect.value);
        hijriCalendar.setAdjustment(adjustment);
        updateHijriPreview();
        
        // Update all displays with new Hijri dates
        updateDashboardWithHijri();
        updateAttendancePageHijri();
        
        showModal(t('success'), 'Hijri date adjustment updated successfully');
    }
}

function updateHijriPreview() {
    console.log('Updating Hijri preview...');
    const previewElement = document.getElementById('hijriPreview');
    
    if (!previewElement) {
        console.error('Hijri preview element not found');
        return;
    }
    
    if (!window.hijriCalendar) {
        console.error('Hijri calendar not available');
        return;
    }
    
    try {
        const currentLang = localStorage.getItem('language') || 'en';
        const hijriDate = hijriCalendar.getCurrentHijriDate();
        console.log('Current Hijri date:', hijriDate);
        
        const hijriString = hijriCalendar.formatHijriDate(hijriDate, currentLang);
        console.log('Formatted Hijri string:', hijriString);
        
        const today = new Date();
        const gregorianString = today.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-GB');
        
        if (currentLang === 'bn') {
            previewElement.innerHTML = `
                <div><strong>গ্রেগরিয়ান:</strong> ${gregorianString}</div>
                <div><strong>হিজরি:</strong> ${hijriString}</div>
            `;
        } else {
            previewElement.innerHTML = `
                <div><strong>Gregorian:</strong> ${gregorianString}</div>
                <div><strong>Hijri:</strong> ${hijriString}</div>
            `;
        }
        
        console.log('Hijri preview updated successfully');
    } catch (error) {
        console.error('Error updating Hijri preview:', error);
        previewElement.innerHTML = '<div style="color: red;">Error loading Hijri date</div>';
    }
}

function updateDashboardWithHijri() {
    console.log('Updating dashboard with Hijri date...');
    
    // Add Hijri date to dashboard header
    const dashboardSection = document.querySelector('#dashboard');
    if (!dashboardSection) {
        console.error('Dashboard section not found');
        return;
    }
    
    const today = new Date();
    const hijriDate = getHijriDate(today.toISOString().split('T')[0], hijriAdjustment);
    
    // Update dashboard date display
    const dateDisplay = dashboardSection.querySelector('.dashboard-date');
    if (dateDisplay) {
        const currentLang = localStorage.getItem('language') || 'en';
        if (currentLang === 'bn') {
            dateDisplay.innerHTML = `
                <div class="gregorian-date">${today.toLocaleDateString('bn-BD')}</div>
                <div class="hijri-date">${hijriDate.day} ${hijriDate.monthName}, ${hijriDate.year}</div>
            `;
        } else {
            dateDisplay.innerHTML = `
                <div class="gregorian-date">${today.toLocaleDateString('en-GB')}</div>
                <div class="hijri-date">${hijriDate.day} ${hijriDate.monthName}, ${hijriDate.year}</div>
            `;
        }
    }
}

function updateAttendancePageHijri() {
    console.log('Updating attendance page with Hijri date...');
    
    // Add Hijri date to attendance page header
    const attendanceSection = document.querySelector('#attendance');
    if (!attendanceSection) {
        console.error('Attendance section not found');
        return;
    }
    
    const today = new Date();
    const hijriDate = getHijriDate(today.toISOString().split('T')[0], hijriAdjustment);
    
    // Update attendance date display
    const dateDisplay = attendanceSection.querySelector('.attendance-date-display');
    if (dateDisplay) {
        const currentLang = localStorage.getItem('language') || 'en';
        if (currentLang === 'bn') {
            dateDisplay.innerHTML = `
                <div class="gregorian-date">${today.toLocaleDateString('bn-BD')}</div>
                <div class="hijri-date">${hijriDate.day} ${hijriDate.monthName}, ${hijriDate.year}</div>
            `;
        } else {
            dateDisplay.innerHTML = `
                <div class="gregorian-date">${today.toLocaleDateString('en-GB')}</div>
                <div class="hijri-date">${hijriDate.day} ${hijriDate.monthName}, ${hijriDate.year}</div>
            `;
        }
    }
}

// Export all utility functions
export { 
    formatDate, 
    convertBengaliToEnglishNumbers, 
    parseRollNumber, 
    getClassNumber,
    toggleMobileMenu,
    initializeHijriSettings,
    updateHijriAdjustment,
    updateHijriPreview,
    updateDashboardWithHijri,
    updateAttendancePageHijri
};
