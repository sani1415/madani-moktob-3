/**
 * Dashboard Management Module
 * Handles all dashboard-related operations including statistics, overview, and class-wise information
 */

import { 
    getTodayDateString, 
    isHoliday, 
    getHolidayName,
    getClassNumber,
    parseRollNumber
} from '../../core/utils.js';
import { ATTENDANCE_STATUS } from '../../core/config.js';
import { appState } from '../../core/app.js';
import { studentAPI } from '../../core/api.js'; // Ensure studentAPI is imported if needed for direct fetching

/**
 * Dashboard Manager Class
 */
export class DashboardManager {
    constructor() {
        this.initialized = false;
        this.updateInterval = null;
        this.fields = []; // New: To store dynamic field configurations
    }

    /**
     * Initialize the dashboard manager
     */
    async initialize() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        await this.loadFieldConfig(); // New: Load field configuration
        this.updateDashboard();
        this.startAutoUpdate();
        this.initialized = true;
        console.log('Dashboard Manager initialized');
    }

    /**
     * New: Load dynamic field configurations
     */
    async loadFieldConfig() {
        try {
            const response = await fetch('/api/fields');
            this.fields = await response.json();
            // Sort fields for consistent rendering, e.g., by label or a custom order
            this.fields.sort((a, b) => a.label.localeCompare(b.label));
        } catch (error) {
            console.error('Failed to load field config for dashboard:', error);
            // Even if fields fail to load, proceed with existing students (which might be flat)
        }
    }

    /**
     * Setup event listeners for dashboard functionality
     */
    setupEventListeners() {
        // Listen for student updates
        document.addEventListener('studentUpdate', () => {
            this.updateDashboard();
        });

        // Listen for attendance updates
        document.addEventListener('attendanceUpdate', () => {
            this.updateDashboard();
        });

        // Listen for application state changes
        document.addEventListener('appStateChange', (event) => {
            if (event.detail.state.isInitialized) {
                this.updateDashboard();
            }
        });
    }

    /**
     * Start automatic dashboard updates
     */
    startAutoUpdate() {
        // Update dashboard every 30 seconds to reflect real-time changes
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, 30000);
    }

    /**
     * Stop automatic dashboard updates
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Main dashboard update function
     */
    updateDashboard() {
        try {
            const today = getTodayDateString();
            
            console.log('Updating dashboard for date:', today);
            // Note: appState.students should already be populated with dynamic fields due to backend changes
            console.log('Total students:', appState.students.length);
            console.log('Today attendance data:', appState.attendance[today]);

            // Update total students
            this.updateTotalStudents();

            // Check if today is a holiday and display holiday notice
            this.updateHolidayNotice(today);

            // Update attendance statistics
            this.updateAttendanceStats(today);

            // Update today's overview
            this.updateTodayOverview();

            // Update class-wise information
            this.updateClassWiseStats();

            console.log('Dashboard updated successfully');

        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    /**
     * Update total students count
     */
    updateTotalStudents() {
        const totalElement = document.getElementById('totalStudents');
        if (totalElement) {
            totalElement.textContent = appState.students.length;
            totalElement.style.color = '#2c3e50';
        }
    }

    /**
     * Update holiday notice
     * @param {string} today - Today's date string
     */
    updateHolidayNotice(today) {
        const holidayNotice = document.getElementById('holidayNotice');
        
        if (isHoliday(today, appState.holidays)) {
            const holidayName = getHolidayName(today, appState.holidays);
            console.log('Today is a holiday:', holidayName);
            
            if (holidayNotice) {
                holidayNotice.innerHTML = `
                    <div class="dashboard-holiday-notice">
                        <i class="fas fa-calendar-times"></i>
                        <span>Today is a holiday: <strong>${holidayName}</strong></span>
                    </div>
                `;
                holidayNotice.style.display = 'block';
            }
        } else {
            if (holidayNotice) {
                holidayNotice.style.display = 'none';
            }
        }
    }

    /**
     * Update attendance statistics
     * @param {string} today - Today's date string
     */
    updateAttendanceStats(today) {
        const presentElement = document.getElementById('presentToday');
        const absentElement = document.getElementById('absentToday');
        const rateElement = document.getElementById('attendanceRate');

        if (isHoliday(today, appState.holidays)) {
            // On holidays, show all students as present
            if (presentElement) {
                presentElement.textContent = appState.students.length;
                presentElement.style.color = '#27ae60';
            }
            if (absentElement) {
                absentElement.textContent = 0;
                absentElement.style.color = '#e74c3c';
            }
            if (rateElement) {
                rateElement.textContent = '100%';
                rateElement.style.color = '#27ae60';
            }
        } else {
            const todayAttendance = appState.attendance[today] || {};
            console.log('Processing attendance for non-holiday:', todayAttendance);

            let presentCount = 0;
            let absentCount = 0;

            // Count attendance properly
            for (const studentId in todayAttendance) {
                const att = todayAttendance[studentId];
                if (att && att.status === ATTENDANCE_STATUS.PRESENT) {
                    presentCount++;
                } else if (att && att.status === ATTENDANCE_STATUS.ABSENT) {
                    absentCount++;
                }
            }

            const unmarkedCount = appState.students.length - presentCount - absentCount;

            console.log('Attendance counts - Present:', presentCount, 'Absent:', absentCount, 'Unmarked:', unmarkedCount);

            // Update present count
            if (presentElement) {
                presentElement.textContent = presentCount;
                presentElement.style.color = '#27ae60';
            }

            // Update absent count
            if (absentElement) {
                absentElement.textContent = absentCount;
                absentElement.style.color = '#e74c3c';
            }

            // Calculate and update attendance rate
            let attendanceRate;
            if (presentCount + absentCount === 0) {
                attendanceRate = 0;
            } else {
                attendanceRate = Math.round((presentCount / (presentCount + absentCount)) * 100);
            }

            console.log('Final dashboard values - Total:', appState.students.length, 'Present:', presentCount, 'Absent:', absentCount, 'Rate:', attendanceRate + '%');

            if (rateElement) {
                rateElement.textContent = `${attendanceRate}%`;
                rateElement.style.color = attendanceRate >= 80 ? '#27ae60' : attendanceRate >= 60 ? '#f39c12' : '#e74c3c';
            }
        }
    }

    /**
     * Update today's overview section
     */
    updateTodayOverview() {
        const today = getTodayDateString();
        const todayAttendance = appState.attendance[today] || {};
        const overviewDiv = document.getElementById('todayOverview');

        if (!overviewDiv) return;

        if (appState.students.length === 0) {
            overviewDiv.innerHTML = '<p>No students registered yet.</p>';
            return;
        }

        const presentStudents = appState.students.filter(student => 
            todayAttendance[student.id] && todayAttendance[student.id].status === ATTENDANCE_STATUS.PRESENT
        );

        const absentStudents = appState.students.filter(student => 
            todayAttendance[student.id] && todayAttendance[student.id].status === ATTENDANCE_STATUS.ABSENT
        );

        // Filter visible fields for display in overview
        const visibleFields = this.fields.filter(field => field.visible);
        // Exclude 'id' and 'created_at' if they are fields and not desired in the overview table
        const displayFields = visibleFields.filter(field => field.name !== 'id' && field.name !== 'created_at');

        let htmlContent = '';

        if (presentStudents.length > 0) {
            htmlContent += '<h3>Present Students:</h3>';
            htmlContent += '<table class="data-table"><thead><tr>';
            displayFields.forEach(field => {
                htmlContent += `<th>${field.label}</th>`;
            });
            htmlContent += '</tr></thead><tbody>';
            presentStudents.forEach(student => {
                htmlContent += '<tr>';
                displayFields.forEach(field => {
                    htmlContent += `<td>${student[field.name] || ''}</td>`;
                });
                htmlContent += '</tr>';
            });
            htmlContent += '</tbody></table>';
        } else {
            htmlContent += '<p>No students marked present today.</p>';
        }

        if (absentStudents.length > 0) {
            htmlContent += '<h3>Absent Students:</h3>';
            htmlContent += '<table class="data-table"><thead><tr>';
            displayFields.forEach(field => {
                htmlContent += `<th>${field.label}</th>`;
            });
            htmlContent += '</tr></thead><tbody>';
            absentStudents.forEach(student => {
                htmlContent += '<tr>';
                displayFields.forEach(field => {
                    htmlContent += `<td>${student[field.name] || ''}</td>`;
                });
                htmlContent += '</tr>';
            });
            htmlContent += '</tbody></table>';
        } else {
            htmlContent += '<p>No students marked absent today.</p>';
        }

        if (presentStudents.length === 0 && absentStudents.length === 0) {
            htmlContent = '<p>No attendance data for today yet.</p>'; // Fallback if no attendance recorded
        }

        overviewDiv.innerHTML = htmlContent;
    }


    /**
     * Update class-wise information section
     */
    updateClassWiseStats() {
        const classWiseStatsDiv = document.getElementById('classWiseStats');
        if (!classWiseStatsDiv) return;

        classWiseStatsDiv.innerHTML = ''; // Clear existing content

        if (appState.students.length === 0) {
            classWiseStatsDiv.innerHTML = '<p>No students registered yet to show class-wise statistics.</p>';
            return;
        }

        const classes = [...appState.classes]; // Get list of classes from config
        
        // Ensure 'class' field exists and is visible for proper class-wise grouping
        const classField = this.fields.find(f => f.name === 'class' && f.visible);
        if (!classField) {
            classWiseStatsDiv.innerHTML = '<p>Cannot display class-wise statistics: "class" field is not configured or not visible.</p>';
            return;
        }

        const visibleFields = this.fields.filter(field => field.visible);
        const displayFields = visibleFields.filter(field => field.name !== 'id' && field.name !== 'created_at'); // Exclude system fields

        classes.forEach(className => {
            const studentsInClass = appState.students.filter(student => student[classField.name] === className);

            if (studentsInClass.length > 0) {
                let classHtml = `
                    <h3>Class: ${className} (${studentsInClass.length} Students)</h3>
                    <table class="data-table">
                        <thead>
                            <tr>`;
                displayFields.forEach(field => {
                    classHtml += `<th>${field.label}</th>`;
                });
                classHtml += `
                            </tr>
                        </thead>
                        <tbody>`;
                
                studentsInClass.forEach(student => {
                    classHtml += '<tr>';
                    displayFields.forEach(field => {
                        classHtml += `<td>${student[field.name] || ''}</td>`;
                    });
                    classHtml += '</tr>';
                });
                classHtml += `
                        </tbody>
                    </table>
                `;
                classWiseStatsDiv.innerHTML += classHtml;
            }
        });

        if (classWiseStatsDiv.innerHTML === '') {
            classWiseStatsDiv.innerHTML = '<p>No students found for configured classes.</p>';
        }
    }

    /**
     * Get dashboard statistics for today
     * @returns {Object} Dashboard statistics
     */
    getTodayStats() {
        const today = getTodayDateString();
        const todayAttendance = appState.attendance[today] || {};

        let presentCount = 0;
        let absentCount = 0;

        for (const studentId in todayAttendance) {
            const att = todayAttendance[studentId];
            if (att && att.status === ATTENDANCE_STATUS.PRESENT) {
                presentCount++;
            } else if (att && att.status === ATTENDANCE_STATUS.ABSENT) {
                absentCount++;
            }
        }

        const totalStudents = appState.students.length;
        const unmarkedCount = totalStudents - presentCount - absentCount;
        const attendanceRate = presentCount + absentCount > 0 ? 
            Math.round((presentCount / (presentCount + absentCount)) * 100) : 0;

        return {
            totalStudents,
            presentCount,
            absentCount,
            unmarkedCount,
            attendanceRate,
            isHoliday: isHoliday(today, appState.holidays),
            holidayName: isHoliday(today, appState.holidays) ? getHolidayName(today, appState.holidays) : null
        };
    }

    /**
     * Get class-wise statistics
     * @returns {Object} Class-wise statistics
     */
    getClassWiseStats() {
        const today = getTodayDateString();
        const todayAttendance = appState.attendance[today] || {};
        const classSummary = {};

        // Initialize all classes
        appState.classes.forEach(className => {
            classSummary[className] = {
                total: 0,
                present: 0,
                absent: 0,
                unmarked: 0,
                rate: 0
            };
        });

        // Count students by class
        appState.students.forEach(student => {
            if (student.class) {
                if (!classSummary[student.class]) {
                    classSummary[student.class] = {
                        total: 0,
                        present: 0,
                        absent: 0,
                        unmarked: 0,
                        rate: 0
                    };
                }

                classSummary[student.class].total++;

                const attendance = todayAttendance[student.id];
                if (attendance) {
                    if (attendance.status === ATTENDANCE_STATUS.PRESENT) {
                        classSummary[student.class].present++;
                    } else if (attendance.status === ATTENDANCE_STATUS.ABSENT) {
                        classSummary[student.class].absent++;
                    } else {
                        classSummary[student.class].unmarked++;
                    }
                } else {
                    classSummary[student.class].unmarked++;
                }
            }
        });

        // Calculate rates
        Object.keys(classSummary).forEach(className => {
            const classData = classSummary[className];
            if (classData.total > 0) {
                const markedStudents = classData.present + classData.absent;
                classData.rate = markedStudents > 0 ? 
                    Math.round((classData.present / markedStudents) * 100) : 0;
            }
        });

        return classSummary;
    }

    /**
     * Get absent students list for today
     * @returns {Array} List of absent students with details
     */
    getAbsentStudentsToday() {
        const today = getTodayDateString();
        const todayAttendance = appState.attendance[today] || {};

        return appState.students
            .filter(student => 
                todayAttendance[student.id] && 
                todayAttendance[student.id].status === ATTENDANCE_STATUS.ABSENT
            )
            .map(student => ({
                id: student.id,
                name: student.name,
                fatherName: student.fatherName,
                rollNumber: student.rollNumber,
                class: student.class,
                reason: todayAttendance[student.id].reason || 'No reason provided'
            }));
    }

    /**
     * Force update dashboard (public method)
     */
    forceUpdate() {
        this.updateDashboard();
    }

    /**
     * Update dashboard with Hijri date information (placeholder)
     */
    updateDashboardWithHijri() {
        // This will be implemented when we extract the Hijri module
        console.log('Updating dashboard with Hijri date information...');
    }

    /**
     * Initialize today's attendance (moved from attendance module for dashboard needs)
     */
    initializeTodayAttendance() {
        const today = getTodayDateString();
        if (!appState.attendance[today]) {
            const updatedAttendance = { ...appState.attendance };
            updatedAttendance[today] = {};
            
            // Don't auto-mark anyone as present - leave neutral
            appState.students.forEach(student => {
                if (!updatedAttendance[today][student.id]) {
                    updatedAttendance[today][student.id] = {
                        status: ATTENDANCE_STATUS.NEUTRAL,
                        reason: ''
                    };
                }
            });

            // Update application state (this would need to be connected to the app state management)
            console.log('Today attendance initialized for dashboard');
        }
    }

    /**
     * Shutdown the dashboard manager
     */
    shutdown() {
        this.stopAutoUpdate();
        this.initialized = false;
        console.log('Dashboard Manager shutdown');
    }
}

// Create and export singleton instance
export const dashboardManager = new DashboardManager();

// Export individual functions for backward compatibility
export const updateDashboard = () => dashboardManager.updateDashboard();
export const updateTodayOverview = () => dashboardManager.updateTodayOverview();
export const updateClassWiseStats = () => dashboardManager.updateClassWiseStats();
export const forceUpdateDashboard = () => dashboardManager.forceUpdate();
export const initializeTodayAttendance = () => dashboardManager.initializeTodayAttendance();