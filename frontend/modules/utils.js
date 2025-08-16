// Global variables that need to be exported
const bengaliToEnglish = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

const bengaliClassMap = {
    'প্রথম শ্রেণি': 1,
    'দ্বিতীয় শ্রেণি': 2,
    'তৃতীয় শ্রেণি': 3,
    'চতুর্থ শ্রেণি': 4,
    'পঞ্চম শ্রেণি': 5
};

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function convertBengaliToEnglishNumbers(str) {
    if (!str) return str;
    return str.toString().replace(/[০-৯]/g, match => bengaliToEnglish[match]);
}

function parseRollNumber(rollNumber) {
    if (!rollNumber) return 0;
    const englishNumber = convertBengaliToEnglishNumbers(rollNumber);
    return parseInt(englishNumber) || 0;
}

function getClassNumber(className) {
    if (!className) return 0;
    
    if (bengaliClassMap[className]) {
        return bengaliClassMap[className];
    }
    
    // Fallback to extracting number from class name
    const match = className.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

// Helper functions that might be needed
function englishNumber(str) {
    return convertBengaliToEnglishNumbers(str);
}

function date(dateString) {
    return formatDate(dateString);
}

function match(str, pattern) {
    return str.match(pattern);
}

// Utility function to get today's date in YYYY-MM-DD format using local timezone
function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Helper function to parse inactivation date
function parseInactivationDate(inactivationDate) {
    if (!inactivationDate) return null;
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof inactivationDate === 'string' && inactivationDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return inactivationDate;
    }
    
    // If it's a datetime string, extract the date part
    if (typeof inactivationDate === 'string') {
        try {
            const date = new Date(inactivationDate);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
            }
        } catch (e) {
            console.warn('Failed to parse inactivation date:', inactivationDate);
        }
    }
    
    return null;
}

export { bengaliClassMap, bengaliToEnglish, convertBengaliToEnglishNumbers, date, englishNumber, formatDate, getClassNumber, match, parseRollNumber, getTodayString, parseInactivationDate }
