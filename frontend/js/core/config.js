/**
 * Configuration constants for the Madani Maktab application
 */

/**
 * Default application configuration
 */
export const APP_CONFIG = {
    name: 'Madani Maktab',
    version: '1.0.0',
    description: 'Student Attendance Management System',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'bn']
};

/**
 * Attendance status constants
 */
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    NEUTRAL: 'neutral'
};

/**
 * UI configuration constants
 */
export const UI_CONFIG = {
    mobileBreakpoint: 768,
    animationDuration: 300,
    debounceDelay: 300,
    maxModalZIndex: 9999
};

/**
 * Default class list
 */
export const DEFAULT_CLASSES = [
    'প্রথম শ্রেণি',
    'দ্বিতীয় শ্রেণি',
    'তৃতীয় শ্রেণি',
    'চতুর্থ শ্রেণি',
    'পঞ্চম শ্রেণি'
];

/**
 * Bengali to English number mapping
 */
export const BENGALI_TO_ENGLISH_NUMBERS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

/**
 * Bengali class to number mapping
 */
export const BENGALI_CLASS_MAP = {
    'প্রথম শ্রেণি': 1,
    'দ্বিতীয় শ্রেণি': 2,
    'তৃতীয় শ্রেণি': 3,
    'চতুর্থ শ্রেণি': 4,
    'পঞ্চম শ্রেণি': 5
};

/**
 * Validation rules for form inputs
 */
export const VALIDATION_RULES = {
    student: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        fatherName: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        rollNumber: {
            required: false,
            minLength: 1,
            maxLength: 10
        },
        class: {
            required: true
        },
        mobileNumber: {
            required: true,
            pattern: /^[0-9+\-\s()]+$/,
            minLength: 10,
            maxLength: 15
        },
        district: {
            required: true,
            minLength: 2,
            maxLength: 50
        },
        upazila: {
            required: true,
            minLength: 2,
            maxLength: 50
        }
    },
    class: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50
        }
    },
    holiday: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        date: {
            required: true
        }
    }
};

/**
 * API configuration
 */
export const API_CONFIG = {
    baseURL: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    students: '/students',
    attendance: '/attendance',
    holidays: '/holidays',
    settings: '/settings',
    health: '/health'
};

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
    students: 'maktab_students',
    attendance: 'maktab_attendance',
    holidays: 'maktab_holidays',
    classes: 'maktab_classes',
    settings: 'maktab_settings',
    appName: 'maktab_app_name',
    academicYearStart: 'maktab_academic_year_start',
    hijriAdjustment: 'maktab_hijri_adjustment',
    lastVisitedSection: 'maktab_last_section'
};

/**
 * Date format configuration
 */
export const DATE_CONFIG = {
    defaultFormat: 'YYYY-MM-DD',
    displayFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD/MM/YYYY HH:mm'
};

/**
 * Modal configuration
 */
export const MODAL_CONFIG = {
    types: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info',
        CONFIRM: 'confirm'
    },
    defaultDuration: 3000,
    maxWidth: 600
};

/**
 * Report configuration
 */
export const REPORT_CONFIG = {
    dateRanges: {
        LAST_7_DAYS: 7,
        LAST_30_DAYS: 30,
        LAST_90_DAYS: 90
    },
    exportFormats: ['PDF', 'Excel', 'CSV']
};

/**
 * Import/Export configuration
 */
export const IMPORT_CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['.xlsx', '.xls', '.csv'],
    batchSize: 100
};

/**
 * Notification configuration
 */
export const NOTIFICATION_CONFIG = {
    position: 'top-right',
    duration: 5000,
    maxNotifications: 5
};

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
    colors: {
        primary: '#3498db',
        secondary: '#2c3e50',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#17a2b8'
    },
    fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif'
    }
};

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
    debounceDelay: 300,
    throttleDelay: 100,
    maxCacheSize: 1000,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

/**
 * Validate configuration object
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} Whether configuration is valid
 */
export function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }

    // Add validation logic here
    return true;
}