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

            // Check API health
            const apiHealthy = await checkAPIHealth();
            if (!apiHealthy) {
                throw new Error('API is not available');
            }

            // Load application data
            await this.loadApplicationData();

            // Mark as initialized
            this.initialized = true;
            appState.updateState({ isInitialized: true });
            
            console.log('Madani Maktab application core initialized successfully');
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
            
            const data = await loadAllData();
            
            // Update saved attendance dates
            const savedDates = new Set();
            if (data.attendance) {
                Object.keys(data.attendance).forEach(date => {
                    if (data.attendance[date] && Object.keys(data.attendance[date]).length > 0) {
                        savedDates.add(date);
                    }
                });
            }

            // Update application state
            appState.updateState({
                students: data.students || [],
                attendance: data.attendance || {},
                holidays: data.holidays || [],
                classes: data.classes || DEFAULT_CLASSES,
                savedAttendanceDates: savedDates
            });

            console.log(`Loaded ${data.students?.length || 0} students, ${Object.keys(data.attendance || {}).length} attendance records, ${data.holidays?.length || 0} holidays`);
            
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
            if (window.initializeLanguage) {
                window.initializeLanguage();
            }

            // Initialize app name
            this.initializeAppName();

            // Set today's date in relevant fields
            const today = getTodayDateString();
            this.setDateInputs(today);

            // This logic is now handled by the attendance manager
            // if (!appState.attendance[today]) {
            //     this.initializeTodayAttendance();
            // }

            // Initialize settings from other modules after they are loaded
            // This is to avoid race conditions
            
        } catch (error) {
            console.error('Failed to initialize UI:', error);
        }
    }

    /**
     * Initialize modules (placeholder - real initialization is in script-modular.js)
     */
    async initializeModules() {
        console.log('All modules will be initialized by script-modular.js');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // This is now handled in individual modules
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // This is now handled by the navigation module
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
        // This is now handled in script-modular.js and translations.js
        console.log('Language system will be initialized externally.');
    }

    /**
     * Initialize app name
     */
    initializeAppName() {
        const savedName = localStorage.getItem(STORAGE_KEYS.appName);
        if (savedName) {
            const titleElement = document.querySelector('.header h1');
            const appNameInput = document.getElementById('appNameInput');
            
            if (titleElement) {
                // To keep the icon, we can set just the text content of the node
                // Assuming the structure is <i ...></i> Text
                const textNode = Array.from(titleElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = ` ${savedName}`;
                }
            }

            if (appNameInput) {
                appNameInput.value = savedName;
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
        // This is now handled by the attendance manager
        console.warn('initializeTodayAttendance is deprecated in AppManager');
    }

    /**
     * Initialize settings
     */
    initializeSettings() {
        // This is now handled by the settings manager
        console.warn('initializeSettings is deprecated in AppManager');
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
    // The main initialization is now triggered from script-modular.js
    // This is to ensure all modules are loaded before initialization starts.
    console.log('app.js: DOMContentLoaded - waiting for script-modular.js to initialize.');
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

/**
 * Get application state
 */
export function getState() {
    return appState.getState ? appState.getState() : appState;
}