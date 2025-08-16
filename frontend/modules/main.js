// Import all modules as namespaces to avoid naming conflicts
import * as State from './state.js';
import * as Utils from './utils.js';
import * as Dashboard from './dashboard.js';
import * as Registration from './registration.js';
import * as Attendance from './attendance.js';
import * as Reports from './reports.js';
import * as Misc from './misc.js';
import * as Calendar from './calendar.js';
import * as Settings from './settings.js';
import * as Hijri from './hijri.js';
import { t, changeLanguage, initializeLanguage, updateAllTexts } from '../translations.js';
import * as Teachers from './teachers.js';

// Debug: Check if Settings module is loaded
console.log('🔍 Settings module loaded:', Settings);
console.log('🔍 Settings.loadEducationProgress:', Settings.loadEducationProgress);
console.log('🔍 Settings.loadBooks:', Settings.loadBooks);
console.log('🔍 Settings.updateBookDropdowns:', Settings.updateBookDropdowns);
console.log('🔍 typeof Settings.loadEducationProgress:', typeof Settings.loadEducationProgress);
console.log('🔍 typeof Settings.loadBooks:', typeof Settings.loadBooks);
console.log('🔍 typeof Settings.updateBookDropdowns:', typeof Settings.updateBookDropdowns);

// Expose translation function globally
window.t = t;
window.changeLanguage = changeLanguage;
window.initializeLanguage = initializeLanguage;
window.updateAllTexts = updateAllTexts;

// Expose all functions to global scope for HTML onclick handlers
// This is necessary because the HTML uses onclick handlers that expect global functions
// while the code is organized in ES6 modules

// Navigation functions
window.showSection = Misc.showSection;
window.openSettingsTab = Misc.openSettingsTab;

// Registration functions
window.hideBulkImport = Registration.hideBulkImport;
window.downloadAllStudentsCSV = Registration.downloadAllStudentsCSV;
window.processExcelFile = Registration.processExcelFile;
window.hideStudentRegistrationForm = Registration.hideStudentRegistrationForm;
window.displayStudentsList = Registration.displayStudentsList;
window.showStudentRegistrationForm = Registration.showStudentRegistrationForm;
window.showBulkImport = Registration.showBulkImport;
window.deleteAllStudents = Registration.deleteAllStudents;
window.editStudent = Registration.editStudent;
window.deleteStudent = Registration.deleteStudent;
window.updateStudentStatus = Registration.updateStudentStatus;
window.showInactiveStudentsList = Registration.showInactiveStudentsList; // <-- ADD THIS LINE
window.updateStudentFilter = Registration.updateStudentFilter;
window.clearStudentFilters = Registration.clearStudentFilters;

// Attendance functions
window.markAllPresent = Attendance.markAllPresent;
window.showMarkAllAbsentModal = Attendance.showMarkAllAbsentModal;
window.markAllNeutral = Attendance.markAllNeutral;
window.copyPreviousDayAttendance = Attendance.copyPreviousDayAttendance;
window.saveAttendance = Attendance.saveAttendance;
window.toggleAttendance = Attendance.toggleAttendance;
window.updateAbsenceReason = Attendance.updateAbsenceReason;
window.showAttendanceCalendar = Misc.showAttendanceCalendar;
window.loadAttendanceForDate = Attendance.loadAttendanceForDate;
window.showStudentDetail = Attendance.showStudentDetail;
window.updateDateInputMax = Attendance.updateDateInputMax;
window.calculateStudentAttendanceStats = Attendance.calculateStudentAttendanceStats;
window.getStudentAbsentDays = Attendance.getStudentAbsentDays;
window.showAbsentDaysModal = Attendance.showAbsentDaysModal;
window.changeSummaryPeriod = Attendance.changeSummaryPeriod;

// Report functions
window.generateReport = Misc.generateReport;
window.generateFromBeginningReport = Misc.generateFromBeginningReport;
window.backToReports = Attendance.backToReports;
window.addHijriToReports = Misc.addHijriToReports;

// Settings functions
window.showAddBookForm = Settings.showAddBookForm;
window.showDeleteAllEducationModal = Settings.showDeleteAllEducationModal;
window.deleteAllEducationData = Settings.deleteAllEducationData;
window.hideAddBookForm = Settings.hideAddBookForm;
window.closeEditBookModal = Settings.closeEditBookModal;
window.initializeAcademicYearStart = Settings.initializeAcademicYearStart;
window.saveAcademicYearStart = Settings.saveAcademicYearStart;
window.clearAcademicYearStart = Settings.clearAcademicYearStart;
window.saveAppName = Settings.saveAppName;
window.displayAcademicYearStart = Settings.displayAcademicYearStart;
window.updateDateRestrictions = Settings.updateDateRestrictions;
window.clearDateRestrictions = Settings.clearDateRestrictions;
window.addClass = Settings.addClass;
window.addBook = Settings.addBook;
window.addHoliday = Settings.addHoliday;
window.deleteHoliday = Settings.deleteHoliday;
window.getHolidayName = Settings.getHolidayName;
window.showResetAttendanceModal = Attendance.showResetAttendanceModal;
window.displayClasses = Settings.displayClasses;
window.displayHolidays = Settings.displayHolidays;
window.loadBooks = Settings.loadBooks;
window.loadEducationProgress = Settings.loadEducationProgress;
window.updateClassFilterOptions = Registration.updateClassFilterOptions;
window.updateClassDropdowns = Settings.updateClassDropdowns;

// Dashboard functions
window.refreshAttendanceData = Dashboard.refreshAttendanceData;
window.refreshStudentsData = refreshStudentsData;
window.updateBookDropdowns = Settings.updateBookDropdowns;

// Debug: Check if functions are properly exposed
console.log('🔍 After exposing to window:');
console.log('🔍 window.loadBooks:', window.loadBooks);
console.log('🔍 window.loadEducationProgress:', window.loadEducationProgress);
console.log('🔍 window.updateBookDropdowns:', window.updateBookDropdowns);
console.log('🔍 typeof window.loadBooks:', typeof window.loadBooks);
console.log('🔍 typeof window.loadEducationProgress:', typeof window.loadEducationProgress);
console.log('🔍 typeof window.updateBookDropdowns:', typeof window.updateBookDropdowns);
window.isHoliday = Settings.isHoliday;
window.editClass = Settings.editClass;
window.deleteClass = Settings.deleteClass;
window.editBook = Settings.editBook;
window.deleteBook = Settings.deleteBook;
window.editBookDetails = Settings.editBookDetails;
window.addBookProgress = Settings.addBookProgress;
window.updateBookProgress = Settings.updateBookProgress;
window.deleteBookProgress = Settings.deleteBookProgress;

// Test function for debugging
window.testAddBookProgress = function() {
    console.log('testAddBookProgress called');
    console.log('window.addBookProgress:', window.addBookProgress);
    console.log('typeof window.addBookProgress:', typeof window.addBookProgress);
    if (typeof window.addBookProgress === 'function') {
        console.log('Calling addBookProgress...');
        window.addBookProgress();
    } else {
        console.error('addBookProgress is not a function!');
    }
};

// Modal functions
window.showModal = Misc.showModal;
window.closeModal = Misc.closeModal;
window.closeBulkAbsentModal = Attendance.closeBulkAbsentModal;
window.saveData = Misc.saveData;
window.confirmMarkAllAbsent = Attendance.confirmMarkAllAbsent;
window.closeResetAttendanceModal = Attendance.closeResetAttendanceModal;
window.confirmResetAttendance = Attendance.confirmResetAttendance;
window.cleanupStickyAttendanceData = Attendance.cleanupStickyAttendanceData;
window.closeBookManagementEditModal = Settings.closeBookManagementEditModal;

// Mobile menu
window.toggleMobileMenu = Misc.toggleMobileMenu;

// Calendar functions
window.testCalendarRefresh = Misc.testCalendarRefresh;
window.forceRefreshAttendanceCalendar = Calendar.forceRefreshAttendanceCalendar;
window.refreshAttendanceCalendarIfVisible = Calendar.refreshAttendanceCalendarIfVisible;
window.debugSavedDates = Misc.debugSavedDates;
window.generateCalendarDays = Calendar.generateCalendarDays;
window.generateAttendanceSummary = Calendar.generateAttendanceSummary;
window.selectCalendarDate = Calendar.selectCalendarDate;

// Hijri functions
window.updateDashboardWithHijri = Hijri.updateDashboardWithHijri;
window.updateAttendancePageHijri = Hijri.updateAttendancePageHijri;
window.initializeHijriSettings = Hijri.initializeHijriSettings;
window.updateHijriAdjustment = Hijri.updateHijriAdjustment;
window.updateHijriPreview = Hijri.updateHijriPreview;
window.navigateCalendar = Calendar.navigateCalendar;
window.canNavigateToMonth = Calendar.canNavigateToMonth;
window.changeCalendarMonth = Calendar.changeCalendarMonth;
window.changeCalendarYear = Calendar.changeCalendarYear;
window.refreshCalendar = Calendar.refreshCalendar;
window.goToCurrentMonth = Calendar.goToCurrentMonth;

// Dashboard functions
window.updateDashboard = Dashboard.updateDashboard;
window.updateTodayOverview = Dashboard.updateTodayOverview;
window.updateClassWiseStats = Dashboard.updateClassWiseStats;
window.generateAttendanceTrackingCalendar = Dashboard.generateAttendanceTrackingCalendar;

// Make state variables globally accessible
window.students = State.students;
// window.classes will be loaded from database in initializeApp()
window.attendance = State.attendance;
window.holidays = State.holidays;
window.academicYearStartDate = State.academicYearStartDate;
window.savedAttendanceDates = State.savedAttendanceDates;

// Debug: Check state variables
// console.log('🔍 State.classes:', State.classes); // Removed - classes now loaded from database
console.log('🔍 window.classes:', window.classes);
console.log('🔍 classes length:', window.classes ? window.classes.length : 'undefined');

// Make calendar variables globally accessible
window.currentCalendarMonth = Misc.currentCalendarMonth;
window.currentCalendarYear = Misc.currentCalendarYear;

// Make utility functions globally accessible
window.formatDate = Utils.formatDate;
window.getClassNumber = Utils.getClassNumber;
window.parseRollNumber = Utils.parseRollNumber;
window.convertBengaliToEnglishNumbers = Utils.convertBengaliToEnglishNumbers;
window.bengaliToEnglish = Utils.bengaliToEnglish;
window.englishNumber = Utils.englishNumber;
window.date = Utils.date;
window.match = Utils.match;
window.bengaliClassMap = Utils.bengaliClassMap;

// Make translation function globally accessible
window.t = t;

// Add a function to refresh students data from server
async function refreshStudentsData() {
    try {
        console.log('🔄 Refreshing students data from server...');
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            // Update the global window variables directly
            window.students = studentsData;
            console.log(`✅ Students data refreshed successfully - ${studentsData.length} students`);
            return true;
        } else {
            console.error('❌ Failed to refresh students data');
            return false;
        }
    } catch (error) {
        console.error('❌ Error refreshing students data:', error);
        return false;
    }
}

// Initialize application data from database
async function initializeApp() {
    try {
        console.log('🔄 Initializing application data...');
        
        // Load students from database
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            // Update the global window variables directly
            window.students = studentsData;
            console.log(`✅ Loaded ${studentsData.length} students from database`);
        }
        
        // Load attendance from database
        const attendanceResponse = await fetch('/api/attendance');
        if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            // Update the global window variables directly
            window.attendance = attendanceData;
            
            // Populate savedAttendanceDates with dates that have attendance data
            if (attendanceData && typeof attendanceData === 'object') {
                const savedDates = Object.keys(attendanceData).filter(date => {
                    const dateAttendance = attendanceData[date];
                    return dateAttendance && typeof dateAttendance === 'object' && Object.keys(dateAttendance).length > 0;
                });
                
                // Clear and populate the savedAttendanceDates Set
                window.savedAttendanceDates.clear();
                savedDates.forEach(date => window.savedAttendanceDates.add(date));
                
                console.log(`✅ Loaded attendance data from database`);
                console.log(`✅ Populated savedAttendanceDates with ${savedDates.length} dates:`, savedDates);
            }
        }
        
        // Load holidays from database
        const holidaysResponse = await fetch('/api/holidays');
        if (holidaysResponse.ok) {
            const holidaysData = await holidaysResponse.json();
            // Update the global window variables directly
            window.holidays = holidaysData;
            console.log(`✅ Loaded ${holidaysData.length} holidays from database`);
        }
        
        // Load classes from database
        const classesResponse = await fetch('/api/classes');
        if (classesResponse.ok) {
            const classesData = await classesResponse.json();
            // Update the global window variables directly
            window.classes = classesData; // This will be an array of objects like [{id: 1, name: '...'}, ...]
            console.log(`✅ Loaded ${classesData.length} classes from database`);
        }
        
        // Load education progress and books from database
        if (typeof loadEducationProgress === 'function') {
            await loadEducationProgress();
            console.log('✅ Loaded education progress from database');
        }
        
        if (typeof loadBooks === 'function') {
            await loadBooks();
            console.log('✅ Loaded books from database');
        }
        
        // Update class dropdowns after loading data
        if (typeof updateClassDropdowns === 'function') {
            updateClassDropdowns();
        }
        
        // Update book dropdowns after loading books
        if (typeof updateBookDropdowns === 'function') {
            updateBookDropdowns();
        }
        
        // Update dashboard
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        
        // Initialize academic year start date
        if (typeof initializeAcademicYearStart === 'function') {
            initializeAcademicYearStart();
        }
        
        // Initialize Hijri settings
        if (typeof initializeHijriSettings === 'function') {
            initializeHijriSettings();
        }
        
        // Clean up any auto-applied future attendance data
        if (typeof cleanupStickyAttendanceData === 'function') {
            await cleanupStickyAttendanceData();
        }
        
        // Add event listeners for attendance page
        const attendanceDateInput = document.getElementById('attendanceDate');
        const classFilterInput = document.getElementById('classFilter');
        
        if (attendanceDateInput) {
            attendanceDateInput.addEventListener('change', function() {
                loadAttendanceForDate();
                // Update Hijri date when attendance date changes
                if (typeof updateAttendancePageHijri === 'function') {
                    updateAttendancePageHijri();
                }
            });
        }
        
        if (classFilterInput) {
            classFilterInput.addEventListener('change', function() {
                loadAttendanceForDate();
            });
        }
        
        console.log('✅ Application initialization completed');
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
    }
}

// Expose Teachers Corner functions
window.showTeachersCorner = Teachers.showTeachersCorner;
window.selectTeachersClass = Teachers.selectTeachersClass;
window.viewProgressHistory = Teachers.viewProgressHistory;
window.closeProgressHistoryModal = Teachers.closeProgressHistoryModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);