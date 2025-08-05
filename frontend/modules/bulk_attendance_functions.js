function updateFilteredStudentCount(count) {
    const countElement = document.getElementById('filteredStudentCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

function getFilteredStudents() {
    const selectedClass = document.getElementById('classFilter').value;
    let filteredStudents = students;
    if (selectedClass) {
        filteredStudents = students.filter(student => student.class === selectedClass);
    }
    return filteredStudents;
}

export async function markAllPresent() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    // Prevent bulk actions on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), t('cannotMarkAttendanceOnHolidays'));
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
        showModal(t('error'), t('noStudentsFound'));
        return;
    }
    
    // Initialize attendance for the date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    // Mark all filtered students as present
    filteredStudents.forEach(student => {
        attendance[selectedDate][student.id] = {
            status: 'present',
            reason: ''
        };
    });
    
    // Refresh display without saving to database
    await loadAttendanceForDate();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes*';
    }
    
    // Refresh attendance calendar if it's visible to show updated status
    refreshAttendanceCalendarIfVisible();
    
    // Also try force refresh as backup (for debugging)
    setTimeout(() => forceRefreshAttendanceCalendar(), 100);
    
    showModal(t('success'), `${filteredStudents.length} ${t('studentsConfirmedPresent')}`);
}

export function showMarkAllAbsentModal() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
        showModal(t('error'), t('noStudentsFound'));
        return;
    }
    
    // Clear previous reason
    document.getElementById('bulkAbsentReason').value = '';
    
    // Show modal
    document.getElementById('bulkAbsentModal').style.display = 'block';
}

function closeBulkAbsentModal() {
    document.getElementById('bulkAbsentModal').style.display = 'none';
}

async function confirmMarkAllAbsent() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const reason = document.getElementById('bulkAbsentReason').value.trim();
    
    if (!reason) {
        showModal(t('error'), t('pleaseProvideReason'));
        return;
    }
    
    // Prevent bulk actions on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), t('cannotMarkAttendanceOnHolidays'));
        closeBulkAbsentModal();
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    
    // Initialize attendance for the date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    // Mark all filtered students as absent with the provided reason
    filteredStudents.forEach(student => {
        attendance[selectedDate][student.id] = {
            status: 'absent',
            reason: reason
        };
    });
    
    // Refresh display without saving to database
    await loadAttendanceForDate();
    closeBulkAbsentModal();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes*';
    }
    
    // Refresh attendance calendar if it's visible to show updated status
    refreshAttendanceCalendarIfVisible();
    
    showModal(t('success'), `${filteredStudents.length} ${t('studentsMarkedAbsent')}`);
}

export async function markAllNeutral() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    // Prevent bulk actions on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), t('cannotMarkAttendanceOnHolidays'));
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
        showModal(t('error'), t('noStudentsFound'));
        return;
    }
    
    // Initialize attendance for the date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    // Remove all filtered students from attendance record (set to neutral)
    filteredStudents.forEach(student => {
        if (attendance[selectedDate][student.id]) {
            delete attendance[selectedDate][student.id];
        }
    });
    
    // Refresh display without saving to database
    await loadAttendanceForDate();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes*';
    }
    
    // Refresh attendance calendar if it's visible to show updated status
    refreshAttendanceCalendarIfVisible();
    
    showModal(t('success'), `${filteredStudents.length} ${t('studentsMarkedNeutral')}`);
}

async function autoCopyFromPreviousDay(targetDate) {
    // Don't auto-copy to holidays
    if (isHoliday(targetDate)) {
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
        return;
    }
    
    // Find the most recent attendance for each student (sticky behavior)
    const targetDateObj = new Date(targetDate);
    let mostRecentAttendance = {};
    let foundAnyAttendance = false;
    let copyFromDate = null;
    
    // Look back up to 30 days for attendance data
    for (let i = 1; i <= 30; i++) {
        const checkDate = new Date(targetDateObj);
        checkDate.setDate(targetDateObj.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (!isHoliday(checkDateStr) && attendance[checkDateStr] && 
            Object.keys(attendance[checkDateStr]).length > 0) {
            
            if (!foundAnyAttendance) {
                copyFromDate = checkDateStr;
                foundAnyAttendance = true;
            }
            
            // For each student, use their most recent attendance status
            filteredStudents.forEach(student => {
                if (attendance[checkDateStr][student.id] && !mostRecentAttendance[student.id]) {
                    mostRecentAttendance[student.id] = {
                        status: attendance[checkDateStr][student.id].status,
                        reason: attendance[checkDateStr][student.id].reason || ''
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
        if (!attendance[targetDate]) {
            attendance[targetDate] = {};
        }
        
        // Apply the most recent attendance status for each student (sticky behavior)
        let absentCount = 0;
    filteredStudents.forEach(student => {
            if (mostRecentAttendance[student.id]) {
                attendance[targetDate][student.id] = {
                    status: mostRecentAttendance[student.id].status,
                    reason: mostRecentAttendance[student.id].reason || ''
                };
                if (mostRecentAttendance[student.id].status === 'absent') {
                    absentCount++;
                }
        } else {
                // Default to present for students with no previous attendance
                attendance[targetDate][student.id] = {
                status: 'present',
                reason: ''
            };
        }
    });
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes*';
    }
    
        // Refresh attendance calendar if it's visible to show updated status
        refreshAttendanceCalendarIfVisible();
        
        // Show sticky attendance notification
        const presentCount = filteredStudents.length - absentCount;
        if (absentCount > 0) {
            showModal(t('success'), `📌 Sticky attendance applied! ${presentCount} present, ${absentCount} still absent from last time. Change any student's status as needed.`);
        } else {
            showModal(t('success'), `📌 Sticky attendance applied! All ${presentCount} students present. Change any student's status as needed.`);
        }
    } else {
        // No previous attendance found, default all to present
        filteredStudents.forEach(student => {
            attendance[targetDate][student.id] = {
                status: 'present',
                reason: ''
            };
        });
    }
}

// expose functions globally
Object.assign(window, { closeBulkAbsentModal, getFilteredStudents, showMarkAllAbsentModal, updateFilteredStudentCount });
