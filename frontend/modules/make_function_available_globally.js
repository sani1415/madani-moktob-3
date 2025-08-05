import { showSection } from './navigation_functions.js';
import { loadAttendanceForDate, saveAttendance } from './attendance_functions.js';
import { updateDashboard } from './dashboard_functions.js';
import { markAllPresent, showMarkAllAbsentModal, markAllNeutral } from './bulk_attendance_functions.js';
import { hideBulkImport } from './bulk_import_functions.js';
import { calculateStudentAttendanceStats } from './global_variables_for_student_detail_calendar.js';
import { debugClassNames, debugSavedDates, testCalendarRefresh, refreshAttendanceCalendarIfVisible, goToCurrentMonth, generateCalendarDays, generateAttendanceSummary } from './debug_functions.js';
import { formatDate, convertBengaliToEnglishNumbers, parseRollNumber, getClassNumber, toggleMobileMenu, initializeHijriSettings, updateHijriAdjustment, updateHijriPreview, updateDashboardWithHijri, updateAttendancePageHijri } from './utility_functions.js';
import { loadBooks, addBook, editBook, deleteBook, updateBook, closeBookManagementEditModal, updateBookDropdownForClass, loadEducationProgress, updateBookProgress, deleteBookProgress, editBookDetails, closeEditBookModal, updateBookDetails, showDeleteAllEducationModal, deleteAllEducationData, addBookProgress, showAddBookForm, hideAddBookForm, filterBooksByClass } from './book_functions.js';
import { showModal, closeModal } from './database_only_approach_no_localstorage_functions_needed.js';
import { displayStudentsList, showStudentRegistrationForm, hideStudentRegistrationForm, editStudent, updateStudent, deleteStudent, deleteAllStudents, resetStudentForm, generateStudentId, registerStudent, applyStudentFilters, updateStudentFilter, clearStudentFilters, updateStudentTableBody, updateClassFilterOptions, showStudentDetail, backToReports } from './student_functions.js';
import { navigateCalendar, canNavigateToMonth, changeCalendarMonth, changeCalendarYear, refreshCalendar, forceRefreshAttendanceCalendar, showAttendanceCalendar, generateFromBeginningReport, generateReport, generateReportWithDates } from './calendar_functions.js';

// Make functions globally available for HTML onclick handlers and cross-module access
window.showSection = showSection;
window.loadAttendanceForDate = loadAttendanceForDate;
window.saveAttendance = saveAttendance;
window.updateDashboard = updateDashboard;
window.markAllPresent = markAllPresent;
window.showMarkAllAbsentModal = showMarkAllAbsentModal;
window.markAllNeutral = markAllNeutral;
window.hideBulkImport = hideBulkImport;
window.calculateStudentAttendanceStats = calculateStudentAttendanceStats;

// Debug functions
window.debugClassNames = debugClassNames;
window.debugSavedDates = debugSavedDates;
window.testCalendarRefresh = testCalendarRefresh;
window.refreshAttendanceCalendarIfVisible = refreshAttendanceCalendarIfVisible;
window.goToCurrentMonth = goToCurrentMonth;
window.generateCalendarDays = generateCalendarDays;
window.generateAttendanceSummary = generateAttendanceSummary;

// Utility functions
window.formatDate = formatDate;
window.convertBengaliToEnglishNumbers = convertBengaliToEnglishNumbers;
window.parseRollNumber = parseRollNumber;
window.getClassNumber = getClassNumber;
window.toggleMobileMenu = toggleMobileMenu;
window.initializeHijriSettings = initializeHijriSettings;
window.updateHijriAdjustment = updateHijriAdjustment;
window.updateHijriPreview = updateHijriPreview;
window.updateDashboardWithHijri = updateDashboardWithHijri;
window.updateAttendancePageHijri = updateAttendancePageHijri;

// Book functions
window.loadBooks = loadBooks;
window.addBook = addBook;
window.editBook = editBook;
window.deleteBook = deleteBook;
window.updateBook = updateBook;
window.closeBookManagementEditModal = closeBookManagementEditModal;
window.updateBookDropdownForClass = updateBookDropdownForClass;
window.loadEducationProgress = loadEducationProgress;
window.updateBookProgress = updateBookProgress;
window.deleteBookProgress = deleteBookProgress;
window.editBookDetails = editBookDetails;
window.closeEditBookModal = closeEditBookModal;
window.updateBookDetails = updateBookDetails;
window.showDeleteAllEducationModal = showDeleteAllEducationModal;
window.deleteAllEducationData = deleteAllEducationData;
window.addBookProgress = addBookProgress;
window.showAddBookForm = showAddBookForm;
window.hideAddBookForm = hideAddBookForm;
window.filterBooksByClass = filterBooksByClass;

// Student functions
window.displayStudentsList = displayStudentsList;
window.showStudentRegistrationForm = showStudentRegistrationForm;
window.hideStudentRegistrationForm = hideStudentRegistrationForm;
window.editStudent = editStudent;
window.updateStudent = updateStudent;
window.deleteStudent = deleteStudent;
window.deleteAllStudents = deleteAllStudents;
window.resetStudentForm = resetStudentForm;
window.generateStudentId = generateStudentId;
window.registerStudent = registerStudent;
window.applyStudentFilters = applyStudentFilters;
window.updateStudentFilter = updateStudentFilter;
window.clearStudentFilters = clearStudentFilters;
window.updateStudentTableBody = updateStudentTableBody;
window.updateClassFilterOptions = updateClassFilterOptions;
window.showStudentDetail = showStudentDetail;
window.backToReports = backToReports;

// Calendar functions
window.navigateCalendar = navigateCalendar;
window.canNavigateToMonth = canNavigateToMonth;
window.changeCalendarMonth = changeCalendarMonth;
window.changeCalendarYear = changeCalendarYear;
window.refreshCalendar = refreshCalendar;
window.forceRefreshAttendanceCalendar = forceRefreshAttendanceCalendar;
window.showAttendanceCalendar = showAttendanceCalendar;
window.generateFromBeginningReport = generateFromBeginningReport;
window.generateReport = generateReport;
window.generateReportWithDates = generateReportWithDates;

// Modal functions
window.showModal = showModal;
window.closeModal = closeModal;
