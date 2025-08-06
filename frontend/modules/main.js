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
import { t } from '../translations.js';

// Expose translation function globally
window.t = t;

// Expose all functions to global scope for HTML onclick handlers
// This is necessary because the HTML uses onclick handlers that expect global functions
// while the code is organized in ES6 modules

// Navigation functions
window.showSection = Misc.showSection;

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

// Report functions
window.generateReport = Misc.generateReport;
window.generateFromBeginningReport = Misc.generateFromBeginningReport;
window.backToReports = Attendance.backToReports;
window.addHijriToReports = Misc.addHijriToReports;

// Settings functions
window.showAddBookForm = Settings.showAddBookForm;
window.showDeleteAllEducationModal = Settings.showDeleteAllEducationModal;
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
window.isHoliday = Settings.isHoliday;
window.editClass = Settings.editClass;
window.deleteClass = Settings.deleteClass;
window.editBook = Settings.editBook;
window.deleteBook = Settings.deleteBook;

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
window.classes = State.classes;
window.attendance = State.attendance;
window.holidays = State.holidays;
window.academicYearStartDate = State.academicYearStartDate;
window.savedAttendanceDates = State.savedAttendanceDates;

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
        
        // Update class dropdowns after loading data
        if (typeof updateClassDropdowns === 'function') {
            updateClassDropdowns();
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);