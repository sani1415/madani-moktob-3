/**
 * Core utility functions for the Madani Maktab application
 */

/**
 * Format a date string to localized format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

/**
 * Convert Bengali numbers to English numbers
 * @param {string} str - String containing Bengali numbers
 * @returns {string} String with English numbers
 */
export function convertBengaliToEnglishNumbers(str) {
    if (!str) return str;
    const bengaliToEnglish = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return str.toString().replace(/[০-৯]/g, match => bengaliToEnglish[match]);
}

/**
 * Parse roll number from string, handling Bengali numbers
 * @param {string} rollNumber - Roll number string
 * @returns {number} Parsed roll number
 */
export function parseRollNumber(rollNumber) {
    if (!rollNumber) return 0;
    const englishNumber = convertBengaliToEnglishNumbers(rollNumber);
    return parseInt(englishNumber) || 0;
}

/**
 * Get numeric class value from class name
 * @param {string} className - Class name in Bengali
 * @returns {number} Numeric class value
 */
export function getClassNumber(className) {
    if (!className) return 0;
    const bengaliClassMap = {
        'প্রথম শ্রেণি': 1,
        'দ্বিতীয় শ্রেণি': 2,
        'তৃতীয় শ্রেণি': 3,
        'চতুর্থ শ্রেণি': 4,
        'পঞ্চম শ্রেণি': 5
    };
    
    if (bengaliClassMap[className]) {
        return bengaliClassMap[className];
    }
    
    // Fallback to extracting number from class name
    const match = className.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Generate a unique student ID
 * @param {Array} students - Array of existing students
 * @returns {string} Generated student ID
 */
export function generateStudentId(students) {
    // Generate clean sequential internal ID (ST026, ST027, etc.)
    let maxIdNumber = 0;
    
    students.forEach(student => {
        if (student.id && student.id.startsWith('ST')) {
            const idNumber = parseInt(student.id.substring(2));
            if (!isNaN(idNumber) && idNumber > maxIdNumber) {
                maxIdNumber = idNumber;
            }
        }
    });
    
    const nextId = maxIdNumber + 1;
    return `ST${nextId.toString().padStart(3, '0')}`; // ST026, ST027, ST028...
}

/**
 * Sort students by class and roll number
 * @param {Array} students - Array of students
 * @returns {Array} Sorted array of students
 */
export function sortStudents(students) {
    return [...students].sort((a, b) => {
        const classA = getClassNumber(a.class);
        const classB = getClassNumber(b.class);
        if (classA !== classB) return classA - classB;
        
        const rollA = parseRollNumber(a.rollNumber);
        const rollB = parseRollNumber(b.rollNumber);
        return rollA - rollB;
    });
}

/**
 * Validate form data
 * @param {Object} formData - Form data object
 * @param {Array} requiredFields - Array of required field names
 * @returns {boolean} Whether all required fields are filled
 */
export function validateFormData(formData, requiredFields) {
    return requiredFields.every(field => {
        const value = formData[field];
        return value && value.toString().trim() !== '';
    });
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date string
 */
export function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date is a holiday
 * @param {string} date - Date string
 * @param {Array} holidays - Array of holiday objects
 * @returns {boolean} Whether the date is a holiday
 */
export function isHoliday(date, holidays) {
    if (!holidays || holidays.length === 0) return false;
    
    return holidays.some(holiday => {
        if (holiday.date === date) return true;
        
        // Check if it's a date range holiday
        if (holiday.startDate && holiday.endDate) {
            return date >= holiday.startDate && date <= holiday.endDate;
        }
        
        return false;
    });
}

/**
 * Get holiday name for a given date
 * @param {string} date - Date string
 * @param {Array} holidays - Array of holiday objects
 * @returns {string|null} Holiday name or null if not a holiday
 */
export function getHolidayName(date, holidays) {
    if (!holidays || holidays.length === 0) return null;
    
    const holiday = holidays.find(holiday => {
        if (holiday.date === date) return true;
        
        // Check if it's a date range holiday
        if (holiday.startDate && holiday.endDate) {
            return date >= holiday.startDate && date <= holiday.endDate;
        }
        
        return false;
    });
    
    return holiday ? holiday.name : null;
}