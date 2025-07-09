/**
 * Main application script - Modularized version
 * This replaces the monolithic script.js with a modular approach
 */

// Core modules
import { appManager, registerModule } from './core/app.js';
import { validateConfig } from './core/config.js';

// Feature modules
import { studentManager } from './modules/students/student-manager.js';
import { attendanceManager } from './modules/attendance/attendance-manager.js';
import { dashboardManager } from './modules/dashboard/dashboard.js';
import { navigationManager } from './modules/ui/navigation.js';
import { reportsManager } from './modules/reports/reports-manager.js';
import { settingsManager } from './modules/settings/settings-manager.js';
import { calendarManager } from './modules/calendar/calendar-manager.js';
import { modalManager } from './modules/ui/modal-manager.js';

/**
 * Export for backward compatibility with HTML onclick handlers
 * These must be available immediately when the script loads
 */
window.showSection = (sectionId) => {
    if (navigationManager && navigationManager.showSection) {
        navigationManager.showSection(sectionId);
    } else {
        console.warn('Navigation manager not ready yet');
    }
};

window.toggleMobileMenu = () => {
    if (navigationManager && navigationManager.toggleMobileMenu) {
        navigationManager.toggleMobileMenu();
    } else {
        console.warn('Navigation manager not ready yet');
    }
};

// Export main functions for HTML compatibility
window.loadAttendanceForDate = () => {
    if (attendanceManager && attendanceManager.loadAttendanceForDate) {
        attendanceManager.loadAttendanceForDate();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.saveAttendance = () => {
    if (attendanceManager && attendanceManager.saveAttendance) {
        attendanceManager.saveAttendance();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.toggleAttendance = (studentId, date, status) => {
    if (attendanceManager && attendanceManager.toggleAttendance) {
        attendanceManager.toggleAttendance(studentId, date, status);
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.markAllPresent = () => {
    if (attendanceManager && attendanceManager.markAllPresent) {
        attendanceManager.markAllPresent();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.markAllAbsent = () => {
    if (attendanceManager && attendanceManager.showMarkAllAbsentModal) {
        attendanceManager.showMarkAllAbsentModal();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.markAllNeutral = () => {
    if (attendanceManager && attendanceManager.markAllNeutral) {
        attendanceManager.markAllNeutral();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.copyPreviousDayAttendance = () => {
    if (attendanceManager && attendanceManager.copyPreviousDayAttendance) {
        attendanceManager.copyPreviousDayAttendance();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.updateAbsenceReason = (studentId, date, reason) => {
    if (attendanceManager && attendanceManager.updateAbsenceReason) {
        attendanceManager.updateAbsenceReason(studentId, date, reason);
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.showMarkAllAbsentModal = () => {
    if (attendanceManager && attendanceManager.showMarkAllAbsentModal) {
        attendanceManager.showMarkAllAbsentModal();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.closeBulkAbsentModal = () => {
    if (attendanceManager && attendanceManager.closeBulkAbsentModal) {
        attendanceManager.closeBulkAbsentModal();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

window.confirmMarkAllAbsent = () => {
    if (attendanceManager && attendanceManager.confirmMarkAllAbsent) {
        attendanceManager.confirmMarkAllAbsent();
    } else {
        console.warn('Attendance manager not ready yet');
    }
};

// Export student management functions for HTML compatibility
window.registerStudent = () => {
    if (studentManager && studentManager.registerStudent) {
        studentManager.registerStudent();
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.editStudent = (studentId) => {
    if (studentManager && studentManager.editStudent) {
        studentManager.editStudent(studentId);
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.updateStudent = (studentId) => {
    if (studentManager && studentManager.updateStudent) {
        studentManager.updateStudent(studentId);
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.deleteStudent = (studentId) => {
    if (studentManager && studentManager.deleteStudent) {
        studentManager.deleteStudent(studentId);
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.deleteAllStudents = () => {
    if (studentManager && studentManager.deleteAllStudents) {
        studentManager.deleteAllStudents();
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.showStudentRegistrationForm = () => {
    if (studentManager && studentManager.showRegistrationForm) {
        studentManager.showRegistrationForm();
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.hideStudentRegistrationForm = () => {
    if (studentManager && studentManager.hideRegistrationForm) {
        studentManager.hideRegistrationForm();
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.resetStudentForm = () => {
    if (studentManager && studentManager.resetForm) {
        studentManager.resetForm();
    } else {
        console.warn('Student manager not ready yet');
    }
};

window.displayStudentsList = () => {
    if (studentManager && studentManager.displayStudentsList) {
        studentManager.displayStudentsList();
    } else {
        console.warn('Student manager not ready yet');
    }
};

// Export dashboard functions for HTML compatibility
window.updateDashboard = () => {
    if (dashboardManager && dashboardManager.updateDashboard) {
        dashboardManager.updateDashboard();
    } else {
        console.warn('Dashboard manager not ready yet');
    }
};

window.forceUpdateDashboard = () => {
    if (dashboardManager && dashboardManager.forceUpdate) {
        dashboardManager.forceUpdate();
    } else {
        console.warn('Dashboard manager not ready yet');
    }
};

// Export reports functions for HTML compatibility
window.generateReport = () => {
    if (reportsManager && reportsManager.generateReport) {
        reportsManager.generateReport();
    } else {
        console.warn('Reports manager not ready yet');
    }
};

window.generateFromBeginningReport = () => {
    if (reportsManager && reportsManager.generateFromBeginningReport) {
        reportsManager.generateFromBeginningReport();
    } else {
        console.warn('Reports manager not ready yet');
    }
};

window.showStudentDetail = (studentId, source) => {
    if (reportsManager && reportsManager.showStudentDetail) {
        reportsManager.showStudentDetail(studentId, source);
    } else {
        console.warn('Reports manager not ready yet');
    }
};

window.backToReports = () => {
    if (reportsManager && reportsManager.backToReports) {
        reportsManager.backToReports();
    } else {
        console.warn('Reports manager not ready yet');
    }
};

// Export settings functions for HTML compatibility
window.addClass = () => {
    if (settingsManager && settingsManager.addClass) {
        settingsManager.addClass();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.deleteClass = (className) => {
    if (settingsManager && settingsManager.deleteClass) {
        settingsManager.deleteClass(className);
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.editClass = (className) => {
    if (settingsManager && settingsManager.editClass) {
        settingsManager.editClass(className);
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.addHoliday = () => {
    if (settingsManager && settingsManager.addHoliday) {
        settingsManager.addHoliday();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.deleteHoliday = (index) => {
    if (settingsManager && settingsManager.deleteHoliday) {
        settingsManager.deleteHoliday(index);
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.saveAppName = () => {
    if (settingsManager && settingsManager.saveAppName) {
        settingsManager.saveAppName();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.saveAcademicYearStart = () => {
    if (settingsManager && settingsManager.saveAcademicYearStart) {
        settingsManager.saveAcademicYearStart();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.clearAcademicYearStart = () => {
    if (settingsManager && settingsManager.clearAcademicYearStart) {
        settingsManager.clearAcademicYearStart();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.updateHijriAdjustment = () => {
    if (settingsManager && settingsManager.updateHijriAdjustment) {
        settingsManager.updateHijriAdjustment();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.showBulkImport = () => {
    if (settingsManager && settingsManager.showBulkImport) {
        settingsManager.showBulkImport();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.hideBulkImport = () => {
    if (settingsManager && settingsManager.hideBulkImport) {
        settingsManager.hideBulkImport();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.downloadAllStudentsCSV = () => {
    if (settingsManager && settingsManager.downloadAllStudentsCSV) {
        settingsManager.downloadAllStudentsCSV();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.handleFileSelect = (event) => {
    if (settingsManager && settingsManager.handleFileSelect) {
        settingsManager.handleFileSelect(event);
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.processExcelFile = () => {
    if (settingsManager && settingsManager.processExcelFile) {
        settingsManager.processExcelFile();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.resetBulkImport = () => {
    if (settingsManager && settingsManager.resetBulkImport) {
        settingsManager.resetBulkImport();
    } else {
        console.warn('Settings manager not ready yet');
    }
};

window.showModal = (title, message) => {
    if (modalManager && modalManager.showModal) {
        modalManager.showModal(title, message);
    } else {
        console.warn('Modal manager not ready yet');
    }
};

window.closeModal = () => {
    if (modalManager && modalManager.closeModal) {
        modalManager.closeModal();
    } else {
        console.warn('Modal manager not ready yet');
    }
};

window.showEncodingErrorModal = (message) => {
    if (modalManager && modalManager.showEncodingErrorModal) {
        modalManager.showEncodingErrorModal(message);
    } else {
        console.warn('Modal manager not ready yet');
    }
};

window.showResetAttendanceModal = () => {
    if (modalManager && modalManager.showResetAttendanceModal) {
        modalManager.showResetAttendanceModal();
    } else {
        console.warn('Modal manager not ready yet');
    }
};

window.closeResetAttendanceModal = () => {
    if (modalManager && modalManager.closeResetAttendanceModal) {
        modalManager.closeResetAttendanceModal();
    } else {
        console.warn('Modal manager not ready yet');
    }
};

window.confirmResetAttendance = () => {
    if (modalManager && modalManager.confirmResetAttendance) {
        modalManager.confirmResetAttendance();
    } else {
        console.warn('Modal manager not ready yet');
    }
};

window.debugClassNames = () => {
    if (modalManager && modalManager.debugClassNames) {
        modalManager.debugClassNames();
    } else {
        console.warn('Modal manager not ready yet');
    }
};

// Export calendar functions for HTML compatibility
window.generateAttendanceTrackingCalendar = (month, year) => {
    if (calendarManager && calendarManager.generateAttendanceTrackingCalendar) {
        calendarManager.generateAttendanceTrackingCalendar(month, year);
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.navigateCalendar = (direction) => {
    if (calendarManager && calendarManager.navigateCalendar) {
        calendarManager.navigateCalendar(direction);
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.changeCalendarMonth = () => {
    if (calendarManager && calendarManager.changeCalendarMonth) {
        calendarManager.changeCalendarMonth();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.changeCalendarYear = () => {
    if (calendarManager && calendarManager.changeCalendarYear) {
        calendarManager.changeCalendarYear();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.goToCurrentMonth = () => {
    if (calendarManager && calendarManager.goToCurrentMonth) {
        calendarManager.goToCurrentMonth();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.refreshCalendar = () => {
    if (calendarManager && calendarManager.refreshCalendar) {
        calendarManager.refreshCalendar();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.forceRefreshAttendanceCalendar = () => {
    if (calendarManager && calendarManager.forceRefreshAttendanceCalendar) {
        calendarManager.forceRefreshAttendanceCalendar();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.refreshAttendanceCalendarIfVisible = () => {
    if (calendarManager && calendarManager.refreshAttendanceCalendarIfVisible) {
        calendarManager.refreshAttendanceCalendarIfVisible();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.showAttendanceCalendar = () => {
    if (calendarManager && calendarManager.showAttendanceCalendar) {
        calendarManager.showAttendanceCalendar();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.testCalendarRefresh = () => {
    if (calendarManager && calendarManager.testCalendarRefresh) {
        calendarManager.testCalendarRefresh();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

window.debugSavedDates = () => {
    if (calendarManager && calendarManager.debugSavedDates) {
        calendarManager.debugSavedDates();
    } else {
        console.warn('Calendar manager not ready yet');
    }
};

// Export translation functions for HTML compatibility (these should be available from translations.js)
window.changeLanguage = window.changeLanguage || function(lang) { console.warn('changeLanguage not available yet', lang); };
window.t = window.t || function(key) { console.warn('t() not available yet'); return key; };



/**
 * Initialize all application modules
 */
async function initializeModules() {
    try {
        console.log('🚀 Initializing Madani Maktab application modules...');
        
        // Validate configuration
        validateConfig();
        
        // Register core modules
        registerModule('studentManager', studentManager);
        registerModule('attendanceManager', attendanceManager);
        registerModule('dashboardManager', dashboardManager);
        registerModule('navigationManager', navigationManager);
        registerModule('reportsManager', reportsManager);
        registerModule('settingsManager', settingsManager);
        registerModule('calendarManager', calendarManager);
        registerModule('modalManager', modalManager);
        
        console.log('✅ All modules registered successfully');
        
        // Initialize modules in proper order
        await initializeInOrder();
        
        console.log('🎉 Application initialization complete!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application modules:', error);
        showErrorMessage('Failed to initialize application. Please refresh the page.');
    }
}

/**
 * Initialize modules in proper dependency order
 */
async function initializeInOrder() {
    console.log('📋 Initializing modules in order...');
    
    // Phase 1: Core infrastructure
    console.log('Phase 1: Core infrastructure');
    await appManager.initialize();
    
    // Phase 2: Initialize translation system
    if (window.initializeLanguage) {
        window.initializeLanguage();
    }

    // Phase 3: UI and navigation
    console.log('Phase 3: UI and navigation');
    await navigationManager.initialize();
    
    // Phase 4: Data management modules
    console.log('Phase 4: Data management');
    await studentManager.initialize();
    await attendanceManager.initialize();
    
    // Phase 5: UI modules that depend on data
    console.log('Phase 5: UI modules');
    await dashboardManager.initialize();
    await reportsManager.initialize();
    await settingsManager.initialize();
    await calendarManager.initialize();
    await modalManager.initialize();
    
    console.log('✅ All modules initialized successfully');

    // Final UI update after all modules are ready
    if (window.updateAllTexts) {
        window.updateAllTexts();
    }
    
    // Initialize UI state for all modules
    await initializeUIState();
    
    // Show the initial section
    const currentSection = navigationManager.getCurrentSection() || 'dashboard';
    console.log('Showing initial section:', currentSection);
    navigationManager.showSection(currentSection, true);
}

/**
 * Initialize UI state for all modules
 */
async function initializeUIState() {
    console.log('📋 Initializing UI state...');
    
    // Set today's date in attendance date input
    const today = new Date().toISOString().split('T')[0];
    const attendanceDate = document.getElementById('attendanceDate');
    if (attendanceDate) {
        attendanceDate.value = today;
    }
    
    // Initialize report date inputs
    const reportStartDate = document.getElementById('reportStartDate');
    const reportEndDate = document.getElementById('reportEndDate');
    if (reportStartDate) reportStartDate.value = today;
    if (reportEndDate) reportEndDate.value = today;
    
    // Update class dropdowns
    const studentManager = appManager.getModule('studentManager');
    const settingsManager = appManager.getModule('settingsManager');
    const attendanceManager = appManager.getModule('attendanceManager');
    
    if (settingsManager) {
        // Update class dropdowns in all sections
        if (settingsManager.updateClassDropdowns) {
            settingsManager.updateClassDropdowns();
        }
        
        // Display initial settings data
        if (settingsManager.displayClasses) {
            settingsManager.displayClasses();
        }
        if (settingsManager.displayHolidays) {
            settingsManager.displayHolidays();
        }
        if (settingsManager.initializeHijriSettings) {
            settingsManager.initializeHijriSettings();
        }
        if (settingsManager.initializeAcademicYearStart) {
            settingsManager.initializeAcademicYearStart();
        }
    }
    
    // Initialize attendance for today
    if (attendanceManager && attendanceManager.initializeTodayAttendance) {
        attendanceManager.initializeTodayAttendance();
    }
    
    console.log('✅ UI state initialized');
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        showErrorMessage('An unexpected error occurred. Please check the console for details.');
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        showErrorMessage('An unexpected error occurred. Please check the console for details.');
    });
}

/**
 * Setup development helpers
 */
function setupDevelopmentHelpers() {
    // Make managers available globally for debugging (always in development mode for now)
    window.studentManager = studentManager;
    window.attendanceManager = attendanceManager;
    window.dashboardManager = dashboardManager;
    window.navigationManager = navigationManager;
    window.appManager = appManager;
    window.reportsManager = reportsManager;
    window.settingsManager = settingsManager;
    window.calendarManager = calendarManager;
    window.modalManager = modalManager;
    
    console.log('🔧 Development helpers enabled');
}

/**
 * Handle DOM content loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM Content Loaded');
    
    // Setup error handlers first
    setupGlobalErrorHandlers();
    
    // Setup development helpers
    setupDevelopmentHelpers();
    
    // Initialize all modules
    await initializeModules();
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('🔄 Page became visible - refreshing dashboard');
        dashboardManager.forceUpdate();
    }
});

/**
 * Additional missing form handlers
 */
window.handleFileSelect = (event) => settingsManager.handleFileSelect(event);
window.processExcelFile = () => settingsManager.processExcelFile();
window.resetBulkImport = () => settingsManager.resetBulkImport();

// Setup critical event listeners that were missing
document.addEventListener('DOMContentLoaded', () => {
    // Form submission handler
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            studentManager.registerStudent();
        });
    }
    
    // Date change listeners
    const attendanceDate = document.getElementById('attendanceDate');
    if (attendanceDate) {
        attendanceDate.addEventListener('change', function() {
            attendanceManager.loadAttendanceForDate();
            if (settingsManager.updateAttendancePageHijri) {
                settingsManager.updateAttendancePageHijri();
            }
        });
    }
    
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
        classFilter.addEventListener('change', function() {
            attendanceManager.loadAttendanceForDate();
        });
    }
    
    // Language selector
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            if (window.changeLanguage) {
                window.changeLanguage(this.value);
            }
        });
    }
});


console.log('📦 Modular script loaded successfully');