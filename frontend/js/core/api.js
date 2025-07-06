/**
 * API communication module for the Madani Maktab application
 */

/**
 * Base API configuration
 */
const API_BASE_URL = '/api';

/**
 * Handle API response errors
 * @param {Response} response - Fetch response object
 * @returns {Promise} Response or throws error
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response;
}

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} API response
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        await handleResponse(response);
        return await response.json();
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

/**
 * Student API functions
 */
export const studentAPI = {
    /**
     * Get all students
     * @returns {Promise<Array>} Array of students
     */
    async getAll() {
        return await apiRequest('/students');
    },

    /**
     * Create a new student
     * @param {Object} studentData - Student data
     * @returns {Promise<Object>} Created student object
     */
    async create(studentData) {
        return await apiRequest('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    },

    /**
     * Update a student
     * @param {string} studentId - Student ID
     * @param {Object} studentData - Updated student data
     * @returns {Promise<Object>} Updated student object
     */
    async update(studentId, studentData) {
        return await apiRequest(`/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
    },

    /**
     * Delete a student
     * @param {string} studentId - Student ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async delete(studentId) {
        return await apiRequest(`/students/${studentId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Delete all students
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteAll() {
        return await apiRequest('/students', {
            method: 'DELETE'
        });
    },

    /**
     * Bulk import students
     * @param {Array} studentsData - Array of student data
     * @returns {Promise<Object>} Import results
     */
    async bulkImport(studentsData) {
        return await apiRequest('/students/bulk-import', {
            method: 'POST',
            body: JSON.stringify({ students: studentsData })
        });
    }
};

/**
 * Attendance API functions
 */
export const attendanceAPI = {
    /**
     * Get all attendance data
     * @returns {Promise<Object>} Attendance data object
     */
    async getAll() {
        return await apiRequest('/attendance');
    },

    /**
     * Save attendance for a specific date
     * @param {string} date - Date string
     * @param {Object} attendanceData - Attendance data for the date
     * @returns {Promise<Object>} Save confirmation
     */
    async save(date, attendanceData) {
        return await apiRequest('/attendance', {
            method: 'POST',
            body: JSON.stringify({ date, attendance: attendanceData })
        });
    },

    /**
     * Get attendance for a specific date
     * @param {string} date - Date string
     * @returns {Promise<Object>} Attendance data for the date
     */
    async getByDate(date) {
        return await apiRequest(`/attendance/${date}`);
    },

    /**
     * Reset all attendance data
     * @returns {Promise<Object>} Reset confirmation
     */
    async resetAll() {
        return await apiRequest('/attendance/reset', {
            method: 'DELETE'
        });
    }
};

/**
 * Holiday API functions
 */
export const holidayAPI = {
    /**
     * Get all holidays
     * @returns {Promise<Array>} Array of holidays
     */
    async getAll() {
        return await apiRequest('/holidays');
    },

    /**
     * Add a new holiday
     * @param {Object} holidayData - Holiday data
     * @returns {Promise<Object>} Created holiday object
     */
    async create(holidayData) {
        return await apiRequest('/holidays', {
            method: 'POST',
            body: JSON.stringify(holidayData)
        });
    },

    /**
     * Delete a holiday
     * @param {number} index - Holiday index
     * @returns {Promise<Object>} Deletion confirmation
     */
    async delete(index) {
        return await apiRequest(`/holidays/${index}`, {
            method: 'DELETE'
        });
    }
};

/**
 * Settings API functions
 */
export const settingsAPI = {
    /**
     * Get application settings
     * @returns {Promise<Object>} Application settings
     */
    async getSettings() {
        return await apiRequest('/settings');
    },

    /**
     * Update application settings
     * @param {Object} settings - Settings object
     * @returns {Promise<Object>} Updated settings
     */
    async updateSettings(settings) {
        return await apiRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }
};

/**
 * Load all application data from the database
 * @returns {Promise<Object>} Object containing all application data
 */
export async function loadAllData() {
    try {
        const [students, attendance, holidays] = await Promise.all([
            studentAPI.getAll(),
            attendanceAPI.getAll(),
            holidayAPI.getAll()
        ]);

        return {
            students,
            attendance,
            holidays
        };
    } catch (error) {
        console.error('Failed to load application data:', error);
        throw error;
    }
}

/**
 * Check if API is available
 * @returns {Promise<boolean>} Whether API is available
 */
export async function checkAPIHealth() {
    try {
        const response = await fetch('/api/health');
        return response.ok;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}