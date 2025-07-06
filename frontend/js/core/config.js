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
 * Form validation rules
 */
export const VALIDATION_RULES = {
    student: {
        required: ['name', 'fatherName', 'rollNumber', 'mobileNumber', 'district', 'upazila', 'class'],
        minLength: {
            name: 2,
            fatherName: 2,
            rollNumber: 1,
            mobileNumber: 11
        },
        maxLength: {
            name: 50,
            fatherName: 50,
            rollNumber: 10,
            mobileNumber: 15,
            district: 30,
            upazila: 30
        }
    },
    holiday: {
        required: ['name', 'date'],
        minLength: {
            name: 2
        },
        maxLength: {
            name: 100
        }
    }
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
    // Mobile breakpoint
    mobileBreakpoint: 768,
    
    // Pagination settings
    pagination: {
        defaultPageSize: 20,
        maxPageSize: 100
    },
    
    // Debounce delays
    debounceDelay: {
        search: 300,
        save: 1000
    },
    
    // Modal settings
    modal: {
        animationDuration: 300
    },
    
    // Toast notification duration
    toastDuration: 3000
};

/**
 * Date format configurations
 */
export const DATE_CONFIG = {
    display: {
        short: 'DD/MM/YYYY',
        long: 'DD MMMM YYYY'
    },
    input: 'YYYY-MM-DD',
    locales: {
        en: 'en-GB',
        bn: 'bn-BD'
    }
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    language: 'madani_maktab_language',
    appName: 'madani_maktab_app_name',
    hijriAdjustment: 'madani_maktab_hijri_adjustment',
    academicYearStart: 'madani_maktab_academic_year_start',
    studentFilters: 'madani_maktab_student_filters',
    lastVisitedSection: 'madani_maktab_last_section'
};

/**
 * API Configuration
 */
export const API_CONFIG = {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
};

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
    allowedTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxBatchSize: 1000 // Maximum students per batch import
};

/**
 * Student ID configuration
 */
export const STUDENT_ID_CONFIG = {
    prefix: 'ST',
    length: 3,
    startNumber: 1
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
 * Report configurations
 */
export const REPORT_CONFIG = {
    maxDateRange: 365, // Maximum days for report generation
    defaultSummaryPeriod: 'last30Days',
    summaryPeriods: {
        last30Days: 30,
        fromBeginning: null
    }
};

/**
 * Calendar configuration
 */
export const CALENDAR_CONFIG = {
    firstDayOfWeek: 6, // Saturday
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
};

/**
 * Hijri date configuration
 */
export const HIJRI_CONFIG = {
    adjustmentOptions: {
        '-1': 'hijriMinusOne',
        '0': 'hijriNoAdjustment',
        '1': 'hijriPlusOne'
    },
    defaultAdjustment: 0
};

/**
 * Export validation helper
 */
export function validateConfig() {
    const errors = [];
    
    // Check required configurations
    if (!APP_CONFIG.name) errors.push('App name is required');
    if (!DEFAULT_CLASSES.length) errors.push('Default classes are required');
    if (!API_CONFIG.baseUrl) errors.push('API base URL is required');
    
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
    
    return true;
}