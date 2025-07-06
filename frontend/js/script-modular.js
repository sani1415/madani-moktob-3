/**
 * Main application script - Modularized version
 * This replaces the monolithic script.js with a modular approach
 */

// Core modules
import { appManager, registerModule } from './core/app.js';
import { validateConfig } from './core/config.js';

// Feature modules
import { studentManager } from './modules/students/student-manager.js';

/**
 * Initialize all application modules
 */
async function initializeModules() {
    try {
        console.log('Registering application modules...');
        
        // Register core modules
        registerModule('studentManager', studentManager);
        
        // Additional modules will be registered here as we extract them:
        // registerModule('attendanceManager', attendanceManager);
        // registerModule('reportGenerator', reportGenerator);
        // registerModule('dashboardManager', dashboardManager);
        // registerModule('settingsManager', settingsManager);
        
        console.log('All modules registered successfully');
        
    } catch (error) {
        console.error('Failed to register modules:', error);
        throw error;
    }
}

/**
 * Setup global functions for backward compatibility
 * These functions maintain the same interface as the original script.js
 */
function setupGlobalFunctions() {
    // Student management functions
    window.registerStudent = () => studentManager.registerStudent();
    window.updateStudent = (id) => studentManager.updateStudent(id);
    window.deleteStudent = (id) => studentManager.deleteStudent(id);
    window.deleteAllStudents = () => studentManager.deleteAllStudents();
    window.editStudent = (id) => studentManager.editStudent(id);
    window.showStudentRegistrationForm = () => studentManager.showRegistrationForm();
    window.hideStudentRegistrationForm = () => studentManager.hideRegistrationForm();
    window.resetStudentForm = () => studentManager.resetForm();
    
    // Navigation functions (these will be moved to navigation module later)
    window.toggleMobileMenu = toggleMobileMenu;
    window.showSection = showSection;
    
    // Class management functions (these will be moved to settings module later)
    window.addClass = addClass;
    window.deleteClass = deleteClass;
    window.editClass = editClass;
    
    // Other functions will be added here as we extract more modules
    // window.markAllPresent = () => attendanceManager.markAllPresent();
    // window.generateReport = () => reportGenerator.generate();
    // etc.
    
    console.log('Global functions setup complete');
}

/**
 * Temporary functions for features not yet modularized
 * These will be removed as we extract them into proper modules
 */

// Mobile Menu Functions (will be moved to navigation module)
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

// Navigation Functions (will be moved to navigation module)
async function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav link
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Close mobile menu on mobile devices
    const navList = document.getElementById('navList');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    if (window.innerWidth <= 768) {
        navList.classList.remove('active');
        toggleButton.className = 'fas fa-bars';
    }
    
    // Update content based on section
    if (sectionId === 'dashboard') {
        // updateDashboard(); // Will be moved to dashboard module
    } else if (sectionId === 'attendance') {
        // await loadAttendanceForDate(); // Will be moved to attendance module
    } else if (sectionId === 'registration') {
        // displayStudentsList(); // Already handled by student module
        // Show student list by default, hide form
        const studentsListContainer = document.getElementById('studentsListContainer');
        const studentRegistrationForm = document.getElementById('studentRegistrationForm');
        if (studentsListContainer && studentRegistrationForm) {
            studentsListContainer.style.display = 'block';
            studentRegistrationForm.style.display = 'none';
        }
    }
}

// Class Management Functions (will be moved to settings module)
function addClass() {
    const newClassName = document.getElementById('newClassName').value.trim();
    
    if (!newClassName) {
        alert('Please enter a class name.');
        return;
    }
    
    // Implementation will be moved to settings module
    console.log('Adding class:', newClassName);
}

function deleteClass(className) {
    if (confirm(`Are you sure you want to delete class "${className}"?`)) {
        // Implementation will be moved to settings module
        console.log('Deleting class:', className);
    }
}

function editClass(oldClassName) {
    // Implementation will be moved to settings module
    console.log('Editing class:', oldClassName);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Listen for module updates
    document.addEventListener('studentUpdate', (event) => {
        console.log('Student data updated:', event.detail);
        // Trigger UI updates for components that depend on student data
        // updateDashboard();
        // updateStudentsList();
    });
    
    // Setup other global event listeners
    console.log('Event listeners setup complete');
}

/**
 * Main initialization function
 */
async function initialize() {
    try {
        console.log('Starting modular application initialization...');
        
        // Validate configuration
        validateConfig();
        
        // Initialize modules
        await initializeModules();
        
        // Setup global functions for backward compatibility
        setupGlobalFunctions();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Modular application initialization complete');
        
    } catch (error) {
        console.error('Modular application initialization failed:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
}

/**
 * Start the application when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

/**
 * Export for external use
 */
export { initialize, appManager, studentManager };