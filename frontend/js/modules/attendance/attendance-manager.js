/**
 * Attendance Management Module
 * Handles all attendance-related operations including daily tracking, bulk operations, and saving
 */

import { attendanceAPI } from '../../core/api.js';
import { ATTENDANCE_STATUS, UI_CONFIG } from '../../core/config.js';
import { getTodayDateString, formatDate, parseRollNumber, getClassNumber } from '../../core/utils.js';
import { appState, updateAppState, getModule } from '../../core/app.js';

/**
 * Attendance Manager Class
 */
export class AttendanceManager {
    constructor() {
        this.currentDate = getTodayDateString();
        this.initialized = false;
        this.bulkAbsentModalVisible = false;
    }

    /**
     * Initialize the attendance manager
     */
    async initialize() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        await this.loadTodayAttendance();
        this.initialized = true;
        console.log('Attendance Manager initialized');
    }

    /**
     * Setup event listeners for attendance functionality
     */
    setupEventListeners() {
        // Listen for date changes
        const attendanceDateInput = document.getElementById('attendanceDate');
        if (attendanceDateInput) {
            attendanceDateInput.addEventListener('change', () => {
                this.loadAttendanceForDate();
            });
        }

        // Listen for class filter changes
        const classFilterInput = document.getElementById('classFilter');
        if (classFilterInput) {
            classFilterInput.addEventListener('change', () => {
                this.loadAttendanceForDate();
            });
        }

        // Setup bulk absent modal if it exists
        this.setupBulkAbsentModal();
    }

    /**
     * Setup bulk absent modal event listeners
     */
    setupBulkAbsentModal() {
        const modal = document.getElementById('bulkAbsentModal');
        if (modal) {
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeBulkAbsentModal();
                }
            });

            // Setup form submission
            const confirmButton = document.getElementById('confirmBulkAbsent');
            if (confirmButton) {
                confirmButton.addEventListener('click', () => {
                    this.confirmMarkAllAbsent();
                });
            }
        }
    }

    /**
     * Load today's attendance
     */
    async loadTodayAttendance() {
        const today = getTodayDateString();
        const attendanceDateInput = document.getElementById('attendanceDate');
        if (attendanceDateInput) {
            attendanceDateInput.value = today;
        }
        await this.loadAttendanceForDate();
    }

    /**
     * Load attendance for the selected date
     */
    async loadAttendanceForDate() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        const attendanceList = document.getElementById('attendanceList');
        
        if (!selectedDate) {
            this.showModal('error', 'Please select a date.');
            return;
        }

        if (!attendanceList) return;

        // Initialize attendance record for the day if it doesn't exist
        if (!appState.attendance[selectedDate]) {
            const updatedAttendance = { ...appState.attendance };
            updatedAttendance[selectedDate] = {};
            updateAppState({ attendance: updatedAttendance });
        }

        // Get filtered students
        const filteredStudents = this.getFilteredStudents();
        
        // Sort students by class and roll number
        filteredStudents.sort((a, b) => {
            const classA = this.getClassNumber(a.class);
            const classB = this.getClassNumber(b.class);
            if (classA !== classB) return classA - classB;
            
            const rollA = this.parseRollNumber(a.rollNumber);
            const rollB = this.parseRollNumber(b.rollNumber);
            return rollA - rollB;
        });

        this.updateFilteredStudentCount(filteredStudents.length);

        if (filteredStudents.length === 0) {
            attendanceList.innerHTML = '<p>No students found.</p>';
            return;
        }

        // Generate attendance list HTML
        attendanceList.innerHTML = filteredStudents.map(student => {
            const studentAttendance = appState.attendance[selectedDate][student.id] || { 
                status: ATTENDANCE_STATUS.NEUTRAL, 
                reason: '' 
            };
            const status = studentAttendance.status;
            const isAbsent = status === ATTENDANCE_STATUS.ABSENT;
            const isPresent = status === ATTENDANCE_STATUS.PRESENT;
            const isNeutral = status === ATTENDANCE_STATUS.NEUTRAL || !status;
            
            // Set toggle appearance and next status based on current status
            let toggleClass, nextStatus;
            if (isNeutral) {
                toggleClass = 'neutral';
                nextStatus = ATTENDANCE_STATUS.PRESENT;
            } else if (isPresent) {
                toggleClass = 'present';
                nextStatus = ATTENDANCE_STATUS.ABSENT;
            } else if (isAbsent) {
                toggleClass = 'absent';
                nextStatus = ATTENDANCE_STATUS.NEUTRAL;
            }

            return `
                <div class="student-row">
                    <div class="student-info-with-toggle">
                        <div class="student-info">
                            <h4>Roll: ${student.rollNumber || 'N/A'} - <span class="clickable-name" onclick="showStudentDetail('${student.id}')">${student.name} বিন ${student.fatherName}</span></h4>
                        </div>
                        <div class="attendance-toggle">
                            <div class="toggle-switch ${toggleClass}" 
                                 onclick="attendanceManager.toggleAttendance('${student.id}', '${selectedDate}', '${nextStatus}')">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                    </div>
                    ${isAbsent ? `
                        <div class="absence-reason">
                            <input type="text" 
                                   placeholder="Reason for absence"
                                   value="${studentAttendance.reason || ''}"
                                   onchange="attendanceManager.updateAbsenceReason('${student.id}', '${selectedDate}', this.value)">
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Auto-copy from previous day if this is a new date
        if (!appState.savedAttendanceDates.has(selectedDate)) {
            await this.autoCopyFromPreviousDay(selectedDate);
        }

        // Refresh attendance calendar if visible
        this.refreshAttendanceCalendarIfVisible();
    }

    /**
     * Toggle attendance for a student
     * @param {string} studentId - Student ID
     * @param {string} date - Date string
     * @param {string} status - New attendance status
     */
    async toggleAttendance(studentId, date, status) {
        // Prevent attendance marking on holidays
        if (isHoliday(date, appState.holidays)) {
            this.showModal('error', 'Cannot mark attendance on holidays');
            return;
        }

        const updatedAttendance = { ...appState.attendance };
        
        if (!updatedAttendance[date]) {
            updatedAttendance[date] = {};
        }

        // Update attendance in memory only (don't save to database yet)
        if (status === ATTENDANCE_STATUS.NEUTRAL) {
            // Remove the student from attendance record if setting to neutral
            delete updatedAttendance[date][studentId];
        } else {
            updatedAttendance[date][studentId] = {
                status: status || ATTENDANCE_STATUS.NEUTRAL,
                reason: status === ATTENDANCE_STATUS.PRESENT || status === ATTENDANCE_STATUS.NEUTRAL ? 
                    '' : (updatedAttendance[date][studentId]?.reason || '')
            };
        }

        // Update application state
        updateAppState({ attendance: updatedAttendance });

        // Refresh the display without saving to database
        await this.loadAttendanceForDate();

        // Show visual indication that changes are pending
        this.showUnsavedChanges();

        // Refresh attendance calendar if visible
        this.refreshAttendanceCalendarIfVisible();
    }

    /**
     * Update absence reason for a student
     * @param {string} studentId - Student ID
     * @param {string} date - Date string
     * @param {string} reason - Absence reason
     */
    updateAbsenceReason(studentId, date, reason) {
        const updatedAttendance = { ...appState.attendance };
        
        if (!updatedAttendance[date]) {
            updatedAttendance[date] = {};
        }

        if (!updatedAttendance[date][studentId]) {
            updatedAttendance[date][studentId] = { 
                status: ATTENDANCE_STATUS.ABSENT, 
                reason: '' 
            };
        }

        // Update reason in memory only
        updatedAttendance[date][studentId].reason = reason;

        // Update application state
        updateAppState({ attendance: updatedAttendance });

        // Show visual indication that changes are pending
        this.showUnsavedChanges();
    }

    /**
     * Save attendance to database
     */
    async saveAttendance() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        
        console.log('Saving attendance for date:', selectedDate);

        // Prevent saving attendance on holidays
        if (isHoliday(selectedDate, appState.holidays)) {
            this.showModal('error', 'Cannot save attendance on holidays');
            return;
        }

        // Initialize attendance record for the day if it doesn't exist
        const updatedAttendance = { ...appState.attendance };
        if (!updatedAttendance[selectedDate]) {
            updatedAttendance[selectedDate] = {};
        }

        // Get all filtered students for the current date
        const filteredStudents = this.getFilteredStudents();

        // Only save attendance for students who have been explicitly marked (not neutral)
        // Remove neutral/unset students from the attendance record
        filteredStudents.forEach(student => {
            if (!updatedAttendance[selectedDate][student.id] || 
                updatedAttendance[selectedDate][student.id].status === ATTENDANCE_STATUS.NEUTRAL) {
                // Remove neutral students from the attendance record
                if (updatedAttendance[selectedDate][student.id]) {
                    delete updatedAttendance[selectedDate][student.id];
                }
            }
        });

        // Count present and absent students
        let presentCount = 0;
        let absentCount = 0;

        Object.values(updatedAttendance[selectedDate]).forEach(record => {
            if (record.status === ATTENDANCE_STATUS.PRESENT) {
                presentCount++;
            } else if (record.status === ATTENDANCE_STATUS.ABSENT) {
                absentCount++;
            }
        });

        console.log(`Saving attendance: ${presentCount} present, ${absentCount} absent (${filteredStudents.length} total)`);

        try {
            // Save to database via API
            await attendanceAPI.save(selectedDate, updatedAttendance[selectedDate]);

            console.log('Attendance saved successfully to database');

            // Mark this date as saved
            const updatedSavedDates = new Set(appState.savedAttendanceDates);
            updatedSavedDates.add(selectedDate);
            
            // Update application state
            updateAppState({ 
                attendance: updatedAttendance,
                savedAttendanceDates: updatedSavedDates
            });

            console.log(`Added ${selectedDate} to savedAttendanceDates, total saved dates: ${updatedSavedDates.size}`);

            // Apply sticky attendance to future dates
            await this.applyStickyAttendanceToFuture(selectedDate);

            // Reset save button appearance
            this.showSaveSuccess();

            // Notify other components about attendance update
            this.notifyAttendanceUpdate();

            this.showModal('success', `Attendance saved successfully! ${presentCount} present, ${absentCount} absent (${filteredStudents.length} total).`);

            // Refresh attendance calendar if visible
            this.refreshAttendanceCalendarIfVisible();

        } catch (error) {
            console.error('Error saving attendance:', error);
            this.showModal('error', 'Failed to save attendance. Please try again.');
        }
    }

    /**
     * Apply sticky attendance to future dates
     * @param {string} savedDate - The date that was just saved
     */
    async applyStickyAttendanceToFuture(savedDate) {
        console.log('Applying sticky attendance to future dates from:', savedDate);

        const today = new Date();
        const savedDateObj = new Date(savedDate);

        // Only apply to future dates, not past dates
        if (savedDateObj < today) {
            console.log('Saved date is in the past, not applying to future');
            return;
        }

        // Get the attendance for the saved date
        const savedAttendance = appState.attendance[savedDate];
        if (!savedAttendance) {
            console.log('No attendance found for saved date');
            return;
        }

        // Find all future dates (up to 30 days ahead) and apply the same attendance
        const futureDates = [];
        for (let i = 1; i <= 30; i++) {
            const futureDate = new Date(savedDateObj);
            futureDate.setDate(savedDateObj.getDate() + i);
            const futureDateStr = futureDate.toISOString().split('T')[0];

            // Skip holidays
            if (!isHoliday(futureDateStr, appState.holidays)) {
                futureDates.push(futureDateStr);
            }
        }

        console.log(`Found ${futureDates.length} future dates to apply sticky attendance to`);

        // Apply the saved attendance to all future dates
        const updatedAttendance = { ...appState.attendance };
        const updatedSavedDates = new Set(appState.savedAttendanceDates);

        futureDates.forEach(futureDate => {
            // Only apply if there's no existing attendance for this date
            if (!updatedAttendance[futureDate] || Object.keys(updatedAttendance[futureDate]).length === 0) {
                updatedAttendance[futureDate] = {};

                // Copy each student's attendance status
                Object.keys(savedAttendance).forEach(studentId => {
                    updatedAttendance[futureDate][studentId] = {
                        status: savedAttendance[studentId].status,
                        reason: savedAttendance[studentId].reason || ''
                    };
                });

                // Mark future date as having data
                if (Object.keys(updatedAttendance[futureDate]).length > 0) {
                    updatedSavedDates.add(futureDate);
                }
            }
        });

        try {
            // Save the updated attendance to the database
            for (const futureDate of futureDates) {
                if (updatedAttendance[futureDate] && Object.keys(updatedAttendance[futureDate]).length > 0) {
                    await attendanceAPI.save(futureDate, updatedAttendance[futureDate]);
                }
            }

            // Update application state
            updateAppState({ 
                attendance: updatedAttendance,
                savedAttendanceDates: updatedSavedDates
            });

            console.log('Sticky attendance applied to future dates successfully');

            // Refresh attendance calendar if visible
            this.refreshAttendanceCalendarIfVisible();

        } catch (error) {
            console.error('Error applying sticky attendance to future:', error);
        }
    }

    /**
     * Copy attendance from previous day
     */
    async copyPreviousDayAttendance() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        if (!selectedDate) {
            this.showModal('error', 'Please select a date.');
            return;
        }

        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setDate(selectedDateObj.getDate() - 1);
        const previousDate = selectedDateObj.toISOString().split('T')[0];

        if (appState.attendance[previousDate] && Object.keys(appState.attendance[previousDate]).length > 0) {
            // Deep copy the attendance data
            const updatedAttendance = { ...appState.attendance };
            updatedAttendance[selectedDate] = JSON.parse(JSON.stringify(updatedAttendance[previousDate]));

            // Update application state
            updateAppState({ attendance: updatedAttendance });

            // Refresh the attendance list to show the copied data
            await this.loadAttendanceForDate();

            this.showModal('success', 'Successfully copied attendance from the previous day.');

            // Show visual indication that changes are pending
            this.showUnsavedChanges();
        } else {
            this.showModal('error', 'No attendance data available for the previous day.');
        }
    }

    /**
     * Auto-copy attendance from previous day with sticky behavior
     * @param {string} targetDate - Date to copy attendance to
     */
    async autoCopyFromPreviousDay(targetDate) {
        // Don't auto-copy to holidays
        if (isHoliday(targetDate, appState.holidays)) {
            return;
        }

        const filteredStudents = this.getFilteredStudents();
        if (filteredStudents.length === 0) {
            return;
        }

        // Find the most recent attendance for each student (sticky behavior)
        const targetDateObj = new Date(targetDate);
        let mostRecentAttendance = {};
        let foundAnyAttendance = false;

        // Look back up to 30 days for attendance data
        for (let i = 1; i <= 30; i++) {
            const checkDate = new Date(targetDateObj);
            checkDate.setDate(targetDateObj.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];

            if (!isHoliday(checkDateStr, appState.holidays) && 
                appState.attendance[checkDateStr] && 
                Object.keys(appState.attendance[checkDateStr]).length > 0) {

                if (!foundAnyAttendance) {
                    foundAnyAttendance = true;
                }

                // For each student, use their most recent attendance status
                filteredStudents.forEach(student => {
                    if (appState.attendance[checkDateStr][student.id] && !mostRecentAttendance[student.id]) {
                        mostRecentAttendance[student.id] = {
                            status: appState.attendance[checkDateStr][student.id].status,
                            reason: appState.attendance[checkDateStr][student.id].reason || ''
                        };
                    }
                });

                // If we have attendance for all students, no need to look further back
                if (Object.keys(mostRecentAttendance).length >= filteredStudents.length) {
                    break;
                }
            }
        }

        if (foundAnyAttendance) {
            // Initialize the target date
            const updatedAttendance = { ...appState.attendance };
            if (!updatedAttendance[targetDate]) {
                updatedAttendance[targetDate] = {};
            }

            // Apply the most recent attendance status for each student (sticky behavior)
            let absentCount = 0;
            filteredStudents.forEach(student => {
                if (mostRecentAttendance[student.id]) {
                    updatedAttendance[targetDate][student.id] = {
                        status: mostRecentAttendance[student.id].status,
                        reason: mostRecentAttendance[student.id].reason || ''
                    };
                    if (mostRecentAttendance[student.id].status === ATTENDANCE_STATUS.ABSENT) {
                        absentCount++;
                    }
                } else {
                    // Default to present for students with no previous attendance
                    updatedAttendance[targetDate][student.id] = {
                        status: ATTENDANCE_STATUS.PRESENT,
                        reason: ''
                    };
                }
            });

            // Update application state
            updateAppState({ attendance: updatedAttendance });

            // Show visual indication that changes are pending
            this.showUnsavedChanges();

            // Refresh attendance calendar if visible
            this.refreshAttendanceCalendarIfVisible();

            // Show sticky attendance notification
            const presentCount = filteredStudents.length - absentCount;
            if (absentCount > 0) {
                this.showModal('success', `📌 Sticky attendance applied! ${presentCount} present, ${absentCount} still absent from last time. Change any student's status as needed.`);
            } else {
                this.showModal('success', `📌 Sticky attendance applied! All ${presentCount} students present. Change any student's status as needed.`);
            }
        } else {
            // No previous attendance found, default all to present
            const updatedAttendance = { ...appState.attendance };
            if (!updatedAttendance[targetDate]) {
                updatedAttendance[targetDate] = {};
            }

            filteredStudents.forEach(student => {
                updatedAttendance[targetDate][student.id] = {
                    status: ATTENDANCE_STATUS.PRESENT,
                    reason: ''
                };
            });

            // Update application state
            updateAppState({ attendance: updatedAttendance });
        }
    }

    /**
     * Mark all students as present
     */
    async markAllPresent() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        if (!selectedDate) {
            this.showModal('error', 'Please select a date.');
            return;
        }

        // Prevent bulk actions on holidays
        if (isHoliday(selectedDate, appState.holidays)) {
            this.showModal('error', 'Cannot mark attendance on holidays');
            return;
        }

        const filteredStudents = this.getFilteredStudents();
        if (filteredStudents.length === 0) {
            this.showModal('error', 'No students found.');
            return;
        }

        // Initialize attendance for the date if it doesn't exist
        const updatedAttendance = { ...appState.attendance };
        if (!updatedAttendance[selectedDate]) {
            updatedAttendance[selectedDate] = {};
        }

        // Mark all filtered students as present
        filteredStudents.forEach(student => {
            updatedAttendance[selectedDate][student.id] = {
                status: ATTENDANCE_STATUS.PRESENT,
                reason: ''
            };
        });

        // Update application state
        updateAppState({ attendance: updatedAttendance });

        // Refresh display without saving to database
        await this.loadAttendanceForDate();

        // Show visual indication that changes are pending
        this.showUnsavedChanges();

        // Refresh attendance calendar if visible
        this.refreshAttendanceCalendarIfVisible();

        this.showModal('success', `${filteredStudents.length} students confirmed present`);
    }

    /**
     * Show modal for marking all students absent
     */
    showMarkAllAbsentModal() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        if (!selectedDate) {
            this.showModal('error', 'Please select a date.');
            return;
        }

        const filteredStudents = this.getFilteredStudents();
        if (filteredStudents.length === 0) {
            this.showModal('error', 'No students found.');
            return;
        }

        // Clear previous reason
        const reasonInput = document.getElementById('bulkAbsentReason');
        if (reasonInput) {
            reasonInput.value = '';
        }

        // Show modal
        const modal = document.getElementById('bulkAbsentModal');
        if (modal) {
            modal.style.display = 'block';
            this.bulkAbsentModalVisible = true;
        }
    }

    /**
     * Close bulk absent modal
     */
    closeBulkAbsentModal() {
        const modal = document.getElementById('bulkAbsentModal');
        if (modal) {
            modal.style.display = 'none';
            this.bulkAbsentModalVisible = false;
        }
    }

    /**
     * Confirm marking all students absent
     */
    async confirmMarkAllAbsent() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        const reasonInput = document.getElementById('bulkAbsentReason');
        const reason = reasonInput?.value.trim() || '';

        if (!reason) {
            this.showModal('error', 'Please provide a reason for the absence');
            return;
        }

        // Prevent bulk actions on holidays
        if (isHoliday(selectedDate, appState.holidays)) {
            this.showModal('error', 'Cannot mark attendance on holidays');
            this.closeBulkAbsentModal();
            return;
        }

        const filteredStudents = this.getFilteredStudents();

        // Initialize attendance for the date if it doesn't exist
        const updatedAttendance = { ...appState.attendance };
        if (!updatedAttendance[selectedDate]) {
            updatedAttendance[selectedDate] = {};
        }

        // Mark all filtered students as absent with the provided reason
        filteredStudents.forEach(student => {
            updatedAttendance[selectedDate][student.id] = {
                status: ATTENDANCE_STATUS.ABSENT,
                reason: reason
            };
        });

        // Update application state
        updateAppState({ attendance: updatedAttendance });

        // Refresh display without saving to database
        await this.loadAttendanceForDate();
        this.closeBulkAbsentModal();

        // Show visual indication that changes are pending
        this.showUnsavedChanges();

        // Refresh attendance calendar if visible
        this.refreshAttendanceCalendarIfVisible();

        this.showModal('success', `${filteredStudents.length} students marked as absent`);
    }

    /**
     * Mark all students as neutral (clear attendance)
     */
    async markAllNeutral() {
        const selectedDate = document.getElementById('attendanceDate')?.value;
        if (!selectedDate) {
            this.showModal('error', 'Please select a date.');
            return;
        }

        // Prevent bulk actions on holidays
        if (isHoliday(selectedDate, appState.holidays)) {
            this.showModal('error', 'Cannot mark attendance on holidays');
            return;
        }

        const filteredStudents = this.getFilteredStudents();
        if (filteredStudents.length === 0) {
            this.showModal('error', 'No students found.');
            return;
        }

        // Initialize attendance for the date if it doesn't exist
        const updatedAttendance = { ...appState.attendance };
        if (!updatedAttendance[selectedDate]) {
            updatedAttendance[selectedDate] = {};
        }

        // Remove all filtered students from attendance record (set to neutral)
        filteredStudents.forEach(student => {
            if (updatedAttendance[selectedDate][student.id]) {
                delete updatedAttendance[selectedDate][student.id];
            }
        });

        // Update application state
        updateAppState({ attendance: updatedAttendance });

        // Refresh display without saving to database
        await this.loadAttendanceForDate();

        // Show visual indication that changes are pending
        this.showUnsavedChanges();

        // Refresh attendance calendar if visible
        this.refreshAttendanceCalendarIfVisible();

        this.showModal('success', `${filteredStudents.length} students marked as neutral`);
    }

    /**
     * Get filtered students based on class filter
     * @returns {Array} Filtered students array
     */
    getFilteredStudents() {
        const classFilter = document.getElementById('classFilter');
        const selectedClass = classFilter?.value || '';
        
        let filteredStudents = appState.students;
        if (selectedClass) {
            filteredStudents = appState.students.filter(student => student.class === selectedClass);
        }
        return filteredStudents;
    }

    /**
     * Update filtered student count in UI
     * @param {number} count - Number of filtered students
     */
    updateFilteredStudentCount(count) {
        const countElement = document.getElementById('filteredStudentCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    /**
     * Show unsaved changes indicator
     */
    showUnsavedChanges() {
        const saveButton = document.querySelector('.btn-save-attendance');
        if (saveButton) {
            saveButton.style.background = '#e67e22';
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes*';
        }
    }

    /**
     * Show save success indicator
     */
    showSaveSuccess() {
        const saveButton = document.querySelector('.btn-save-attendance');
        if (saveButton) {
            saveButton.style.background = '#27ae60';
            saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveButton.style.background = '';
                saveButton.innerHTML = '<i class="fas fa-save"></i> Save Attendance';
            }, 2000);
        }
    }

    /**
     * Refresh attendance calendar if visible (placeholder)
     */
    refreshAttendanceCalendarIfVisible() {
        // This will be implemented when we extract the calendar module
        console.log('Refreshing attendance calendar...');
    }

    /**
     * Initialize attendance for today
     */
    initializeTodayAttendance() {
        const today = getTodayDateString();
        const state = appState.getState ? appState.getState() : appState;
        
        if (!state.attendance[today]) {
            console.log('Initializing attendance for today:', today);
            
            // Create empty attendance record for today
            const updatedAttendance = { ...state.attendance };
            updatedAttendance[today] = {};
            
            // Initialize all students as neutral for today
            if (state.students) {
                state.students.forEach(student => {
                    updatedAttendance[today][student.id] = {
                        status: ATTENDANCE_STATUS.NEUTRAL,
                        reason: ''
                    };
                });
            }
            
            // Update application state
            updateAppState({ attendance: updatedAttendance });
            
            console.log('Today attendance initialized with neutral status for all students');
        }
    }

    /**
     * Show modal message
     * @param {string} type - Modal type (success, error, info)
     * @param {string} message - Message to display
     */
    showModal(type, message) {
        const modalManager = getModule('modalManager');
        if (modalManager && modalManager.showModal) {
            const title = type === 'success' ? 'Success' : 'Error';
            modalManager.showModal(title, message);
        } else {
            // Fallback to alert if modal manager not available
            const title = type === 'success' ? 'Success' : 'Error';
            alert(`${title}: ${message}`);
        }
    }

    /**
     * Notify other components about attendance updates
     */
    notifyAttendanceUpdate() {
        // Dispatch custom event for attendance updates
        const event = new CustomEvent('attendanceUpdate', {
            detail: { 
                attendance: appState.attendance,
                savedDates: Array.from(appState.savedAttendanceDates)
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Helper function to get class number (duplicated from utils for internal use)
     * @param {string} className - Class name
     * @returns {number} Class number
     */
    getClassNumber(className) {
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
        
        const match = className.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Helper function to parse roll number (duplicated from utils for internal use)
     * @param {string} rollNumber - Roll number string
     * @returns {number} Parsed roll number
     */
    parseRollNumber(rollNumber) {
        if (!rollNumber) return 0;
        // Simple conversion for now
        const englishNumber = rollNumber.toString().replace(/[০-৯]/g, match => {
            const bengaliToEnglish = {
                '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
                '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
            };
            return bengaliToEnglish[match];
        });
        return parseInt(englishNumber) || 0;
    }

    /**
     * Get attendance status for a specific student and date
     * @param {string} studentId - Student ID
     * @param {string} date - Date string
     * @returns {Object} Attendance record
     */
    getAttendanceStatus(studentId, date) {
        return appState.attendance[date]?.[studentId] || { 
            status: ATTENDANCE_STATUS.NEUTRAL, 
            reason: '' 
        };
    }

    /**
     * Check if attendance is saved for a date
     * @param {string} date - Date string
     * @returns {boolean} Whether attendance is saved
     */
    isAttendanceSaved(date) {
        return appState.savedAttendanceDates.has(date);
    }

    /**
     * Get attendance statistics for a date
     * @param {string} date - Date string
     * @returns {Object} Attendance statistics
     */
    getAttendanceStats(date) {
        const dayAttendance = appState.attendance[date] || {};
        const stats = {
            present: 0,
            absent: 0,
            neutral: 0,
            total: appState.students.length
        };

        Object.values(dayAttendance).forEach(record => {
            if (record.status === ATTENDANCE_STATUS.PRESENT) {
                stats.present++;
            } else if (record.status === ATTENDANCE_STATUS.ABSENT) {
                stats.absent++;
            }
        });

        stats.neutral = stats.total - stats.present - stats.absent;
        return stats;
    }

    /**
     * Shutdown the attendance manager
     */
    shutdown() {
        this.initialized = false;
        this.bulkAbsentModalVisible = false;
        console.log('Attendance Manager shutdown');
    }
}

// Create and export singleton instance
export const attendanceManager = new AttendanceManager();

// Export individual functions for backward compatibility
export const loadAttendanceForDate = () => attendanceManager.loadAttendanceForDate();
export const saveAttendance = () => attendanceManager.saveAttendance();
export const toggleAttendance = (studentId, date, status) => attendanceManager.toggleAttendance(studentId, date, status);
export const markAllPresent = () => attendanceManager.markAllPresent();
export const markAllAbsent = () => attendanceManager.showMarkAllAbsentModal();
export const markAllNeutral = () => attendanceManager.markAllNeutral();
export const copyPreviousDayAttendance = () => attendanceManager.copyPreviousDayAttendance();
export const showMarkAllAbsentModal = () => attendanceManager.showMarkAllAbsentModal();
export const closeBulkAbsentModal = () => attendanceManager.closeBulkAbsentModal();
export const confirmMarkAllAbsent = () => attendanceManager.confirmMarkAllAbsent();
export const updateAbsenceReason = (studentId, date, reason) => attendanceManager.updateAbsenceReason(studentId, date, reason);