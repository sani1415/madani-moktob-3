/**
 * Main application initialization and coordination module
 */

import { validateConfig, DEFAULT_CLASSES, STORAGE_KEYS } from './config.js';
import { loadAllData, checkAPIHealth } from './api.js';
import { getTodayDateString } from './utils.js';

/**
 * Application state management
 */
export class AppState {
    constructor() {
        this.students = [];
        this.classes = [...DEFAULT_CLASSES];
        this.attendance = {};
        this.holidays = [];
        this.academicYearStartDate = null;
        this.savedAttendanceDates = new Set();
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        this.isInitialized = false;
    }

    /**
     * Update application state
     * @param {Object} newState - Partial state to update
     */
    updateState(newState) {
        Object.assign(this, newState);
        this.notifyStateChange();
    }

    /**
     * Notify state change listeners
     */
    notifyStateChange() {
        // Dispatch custom event for state changes
        const event = new CustomEvent('appStateChange', {
            detail: { state: this }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get current state
     * @returns {Object} Current application state
     */
    getState() {
        return {
            students: this.students,
            classes: this.classes,
            attendance: this.attendance,
            holidays: this.holidays,
            academicYearStartDate: this.academicYearStartDate,
            savedAttendanceDates: Array.from(this.savedAttendanceDates),
            currentCalendarMonth: this.currentCalendarMonth,
            currentCalendarYear: this.currentCalendarYear,
            isInitialized: this.isInitialized
        };
    }
}

/**
 * Global application state instance
 */
export const appState = new AppState();

/**
 * Application initialization manager
 */
export class AppManager {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
    }

    /**
     * Register a module
     * @param {string} name - Module name
     * @param {Object} module - Module instance
     */
    registerModule(name, module) {
        this.modules.set(name, module);
    }

    /**
     * Get a registered module
     * @param {string} name - Module name
     * @returns {Object|null} Module instance or null
     */
    getModule(name) {
        return this.modules.get(name) || null;
    }

    /**
     * Initialize the application
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.initialized) {
            console.warn('Application already initialized');
            return true;
        }

        try {
            console.log('Starting Madani Maktab application initialization...');

            // Validate configuration
            validateConfig();

            // Check API health
            const apiHealthy = await checkAPIHealth();
            if (!apiHealthy) {
                throw new Error('API is not available');
            }

            // Load application data
            await this.loadApplicationData();

            // Initialize UI components
            await this.initializeUI();

            // Initialize modules
            await this.initializeModules();

            // Setup event listeners
            this.setupEventListeners();

            // Mark as initialized
            this.initialized = true;
            appState.updateState({ isInitialized: true });

            console.log('Madani Maktab application initialized successfully');
            return true;

        } catch (error) {
            console.error('Application initialization failed:', error);
            this.handleInitializationError(error);
            return false;
        }
    }

    /**
     * Load application data from the backend
     * @returns {Promise<void>}
     */
    async loadApplicationData() {
        try {
            console.log('Loading application data...');
            
            const { students, attendance, holidays } = await loadAllData();
            
            // Update saved attendance dates
            const savedDates = new Set();
            Object.keys(attendance).forEach(date => {
                if (attendance[date] && Object.keys(attendance[date]).length > 0) {
                    savedDates.add(date);
                }
            });

            // Update application state
            appState.updateState({
                students,
                attendance,
                holidays,
                savedAttendanceDates: savedDates
            });

            console.log(`Loaded ${students.length} students, ${Object.keys(attendance).length} attendance records, ${holidays.length} holidays`);
            
        } catch (error) {
            console.error('Failed to load application data:', error);
            throw error;
        }
    }

    /**
     * Initialize UI components
     * @returns {Promise<void>}
     */
    async initializeUI() {
        try {
            // Initialize language
            await this.initializeLanguage();

            // Initialize app name
            this.initializeAppName();

            // Set today's date in relevant fields
            const today = getTodayDateString();
            this.setDateInputs(today);

            // Initialize attendance for today if not exists
            if (!appState.attendance[today]) {
                this.initializeTodayAttendance();
            }

            // Initialize settings
            this.initializeSettings();

        } catch (error) {
            console.error('UI initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize all registered modules
     * @returns {Promise<void>}
     */
    async initializeModules() {
        try {
            const initPromises = Array.from(this.modules.entries()).map(async ([name, module]) => {
                if (typeof module.initialize === 'function') {
                    console.log(`Initializing module: ${name}`);
                    await module.initialize();
                }
            });

            await Promise.all(initPromises);
            console.log('All modules initialized successfully');

        } catch (error) {
            console.error('Module initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Listen for state changes
        document.addEventListener('appStateChange', (event) => {
            console.log('Application state changed:', event.detail.state);
        });

        // Listen for DOM content loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM content loaded');
        });

        // Listen for window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Listen for beforeunload
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Update mobile menu state
        const navList = document.getElementById('navList');
        if (navList && window.innerWidth > 768) {
            navList.classList.remove('active');
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        // Save current state to localStorage if needed
        this.saveCurrentState();
    }

    /**
     * Initialize language system
     */
    async initializeLanguage() {
        // This will be implemented when we extract the translation module
        console.log('Language system initialized');
    }

    /**
     * Initialize app name
     */
    initializeAppName() {
        const savedName = localStorage.getItem(STORAGE_KEYS.appName);
        if (savedName) {
            const titleElement = document.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = savedName;
            }
        }
    }

    /**
     * Set date inputs to today's date
     * @param {string} today - Today's date string
     */
    setDateInputs(today) {
        const dateInputs = [
            'attendanceDate',
            'reportStartDate',
            'reportEndDate'
        ];

        dateInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = today;
            }
        });
    }

    /**
     * Initialize attendance for today
     */
    initializeTodayAttendance() {
        const today = getTodayDateString();
        if (!appState.attendance[today]) {
            appState.attendance[today] = {};
        }
    }

    /**
     * Initialize settings
     */
    initializeSettings() {
        // Initialize academic year start date
        const savedAcademicYear = localStorage.getItem(STORAGE_KEYS.academicYearStart);
        if (savedAcademicYear) {
            appState.updateState({ academicYearStartDate: savedAcademicYear });
        }

        // Initialize hijri settings
        const savedHijriAdjustment = localStorage.getItem(STORAGE_KEYS.hijriAdjustment);
        if (savedHijriAdjustment) {
            // This will be handled by the hijri module
            console.log('Hijri adjustment loaded:', savedHijriAdjustment);
        }
    }

    /**
     * Save current application state
     */
    saveCurrentState() {
        try {
            // Save last visited section
            const activeSection = document.querySelector('.section.active');
            if (activeSection) {
                localStorage.setItem(STORAGE_KEYS.lastVisitedSection, activeSection.id);
            }

            console.log('Current state saved');
        } catch (error) {
            console.error('Failed to save current state:', error);
        }
    }

    /**
     * Handle initialization error
     * @param {Error} error - The error that occurred
     */
    handleInitializationError(error) {
        const errorMessage = error.message || 'Unknown error occurred';
        
        // Show error modal or message
        const errorModal = document.getElementById('errorModal');
        if (errorModal) {
            const errorContent = errorModal.querySelector('.error-content');
            if (errorContent) {
                errorContent.textContent = `Failed to initialize the application: ${errorMessage}`;
            }
            errorModal.style.display = 'block';
        } else {
            // Fallback alert
            alert(`Failed to initialize the application: ${errorMessage}`);
        }
    }

    /**
     * Shutdown the application
     */
    shutdown() {
        console.log('Shutting down application...');
        
        // Save current state
        this.saveCurrentState();

        // Shutdown all modules
        this.modules.forEach((module, name) => {
            if (typeof module.shutdown === 'function') {
                console.log(`Shutting down module: ${name}`);
                module.shutdown();
            }
        });

        // Clear modules
        this.modules.clear();

        // Reset state
        this.initialized = false;
        appState.updateState({ isInitialized: false });

        console.log('Application shutdown complete');
    }
}

/**
 * Global application manager instance
 */
export const appManager = new AppManager();

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await appManager.initialize();
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
});

/**
 * Export utility functions for external use
 */
export function getAppState() {
    return appState.getState();
}

export function updateAppState(newState) {
    appState.updateState(newState);
}

export function registerModule(name, module) {
    appManager.registerModule(name, module);
}

export function getModule(name) {
    return appManager.getModule(name);
}