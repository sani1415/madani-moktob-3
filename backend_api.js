
// Backend API client for Madani Maktab
class MadaniMaktabAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Students API
    async getStudents() {
        return this.request('/students');
    }

    async addStudent(studentData) {
        return this.request('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    }

    async getStudent(studentId) {
        return this.request(`/students/${studentId}`);
    }

    // Classes API
    async getClasses() {
        return this.request('/classes');
    }

    async addClass(className) {
        return this.request('/classes', {
            method: 'POST',
            body: JSON.stringify({ name: className })
        });
    }

    async deleteClass(className) {
        return this.request(`/classes/${encodeURIComponent(className)}`, {
            method: 'DELETE'
        });
    }

    // Attendance API
    async getAttendance() {
        return this.request('/attendance');
    }

    async getAttendanceByDate(date) {
        return this.request(`/attendance/${date}`);
    }

    async saveAttendance(date, attendanceData) {
        return this.request(`/attendance/${date}`, {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    }

    async updateStudentAttendance(date, studentId, attendanceData) {
        return this.request(`/attendance/${date}/student/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(attendanceData)
        });
    }

    // Holidays API
    async getHolidays() {
        return this.request('/holidays');
    }

    async addHoliday(holidayData) {
        return this.request('/holidays', {
            method: 'POST',
            body: JSON.stringify(holidayData)
        });
    }

    async deleteHoliday(index) {
        return this.request(`/holidays/${index}`, {
            method: 'DELETE'
        });
    }

    // Reports API
    async generateAttendanceReport(startDate, endDate) {
        return this.request('/reports/attendance', {
            method: 'POST',
            body: JSON.stringify({ startDate, endDate })
        });
    }
}

// Initialize API client
const api = new MadaniMaktabAPI();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MadaniMaktabAPI;
}
