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
    
    // Phase 2: UI and navigation
    console.log('Phase 2: UI and navigation');
    await navigationManager.initialize();
    
    // Phase 3: Data management modules
    console.log('Phase 3: Data management');
    await studentManager.initialize();
    await attendanceManager.initialize();
    
    // Phase 4: UI modules that depend on data
    console.log('Phase 4: UI modules');
    await dashboardManager.initialize();
    
    console.log('✅ All modules initialized successfully');
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
    if (process.env.NODE_ENV === 'development') {
        // Make managers available globally for debugging
        window.studentManager = studentManager;
        window.attendanceManager = attendanceManager;
        window.dashboardManager = dashboardManager;
        window.navigationManager = navigationManager;
        window.appManager = appManager;
        
        console.log('🔧 Development helpers enabled');
    }
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
 * Export for backward compatibility with HTML onclick handlers
 */
window.showSection = (sectionId) => navigationManager.showSection(sectionId);
window.toggleMobileMenu = () => navigationManager.toggleMobileMenu();

// Export main functions for HTML compatibility
window.loadAttendanceForDate = () => attendanceManager.loadAttendanceForDate();
window.saveAttendance = () => attendanceManager.saveAttendance();
window.toggleAttendance = (studentId, date, status) => attendanceManager.toggleAttendance(studentId, date, status);
window.markAllPresent = () => attendanceManager.markAllPresent();
window.markAllAbsent = () => attendanceManager.showMarkAllAbsentModal();
window.markAllNeutral = () => attendanceManager.markAllNeutral();
window.copyPreviousDayAttendance = () => attendanceManager.copyPreviousDayAttendance();
window.updateAbsenceReason = (studentId, date, reason) => attendanceManager.updateAbsenceReason(studentId, date, reason);
window.showMarkAllAbsentModal = () => attendanceManager.showMarkAllAbsentModal();
window.closeBulkAbsentModal = () => attendanceManager.closeBulkAbsentModal();
window.confirmMarkAllAbsent = () => attendanceManager.confirmMarkAllAbsent();

// Export student management functions for HTML compatibility
window.registerStudent = () => studentManager.registerStudent();
window.editStudent = (studentId) => studentManager.editStudent(studentId);
window.deleteStudent = (studentId) => studentManager.deleteStudent(studentId);
window.showStudentRegistrationForm = () => studentManager.showRegistrationForm();
window.hideStudentRegistrationForm = () => studentManager.hideRegistrationForm();
window.resetStudentForm = () => studentManager.resetForm();

// Export dashboard functions for HTML compatibility
window.updateDashboard = () => dashboardManager.updateDashboard();
window.forceUpdateDashboard = () => dashboardManager.forceUpdate();

console.log('📦 Modular script loaded successfully');