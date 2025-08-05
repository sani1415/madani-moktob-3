// ===== APPLICATION STATE =====
// Consolidated application state and global variables

// Core application data
window.students = [];
window.classes = ['প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি'];
window.attendance = {};
window.holidays = [];
window.academicYearStartDate = null; // Store academic year start date
window.savedAttendanceDates = new Set(); // Track which dates have been saved to database

// Student filter state
window.studentFilters = {
    roll: '',
    name: '',
    class: '',
    mobile: ''
};

// Calendar state
window.currentCalendarMonth = new Date().getMonth();
window.currentCalendarYear = new Date().getFullYear(); 