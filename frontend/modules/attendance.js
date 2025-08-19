function initializeTodayAttendance() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!attendance[todayStr]) {
        attendance[todayStr] = {};
    }
    
    // Only initialize empty attendance structure, don't auto-mark anyone as present
    students.forEach(student => {
        if (!attendance[today][student.id]) {
            attendance[today][student.id] = {
                status: 'unmarked', // Change from 'present' to 'unmarked'
                reason: ''
            };
        }
    });
    
    saveData();
}

async function loadTodayAttendance() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const attendanceDateInput = document.getElementById('attendanceDate');
    attendanceDateInput.value = todayStr;
    attendanceDateInput.max = todayStr; // Set max date to today
    await loadAttendanceForDate();
}

function updateDateInputMax() {
    // Use local date methods to avoid timezone issues
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const attendanceDateInput = document.getElementById('attendanceDate');
    if (attendanceDateInput) {
        attendanceDateInput.max = todayStr;
    }
}

async function loadAttendanceForDate() {
    console.log('=== loadAttendanceForDate called ===');
    let selectedDate = document.getElementById('attendanceDate').value;
    const attendanceList = document.getElementById('attendanceList');
    
    console.log('Selected date:', selectedDate);
    console.log('Attendance list element:', attendanceList);
    
    // If no date is selected, automatically set today's date
    if (!selectedDate) {
        const today = new Date();
        selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        document.getElementById('attendanceDate').value = selectedDate;
    }
    
    // Check if selected date is in the future
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Debug: Log date comparison
    console.log('Selected date:', selectedDate);
    console.log('Today string:', todayStr);
    console.log('Date comparison:', selectedDate, '>', todayStr, '=', selectedDate > todayStr);
    
    // Compare dates as strings to avoid timezone issues
    if (selectedDate > todayStr) {
        showModal(t('error'), t('cannotTakeAttendanceForFutureDate'));
        return;
    }
    
    // Initialize attendance record for the day if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    let filteredStudents = getFilteredStudents();
    
    // Debug: Log students data
    console.log('Total students available:', students.length);
    console.log('Filtered students:', filteredStudents.length);
    console.log('Students data:', students);
    
    // Sort students by class and then roll number
    filteredStudents.sort((a, b) => {
        const classA = getClassNumber(a.class);
        const classB = getClassNumber(b.class);
        if (classA !== classB) return classA - classB;
        return parseRollNumber(a.rollNumber) - parseRollNumber(b.rollNumber);
    });
    
    updateFilteredStudentCount(filteredStudents.length);
    
    if (filteredStudents.length === 0) {
        attendanceList.innerHTML = `<p>${t('noStudentsFound')}</p>`;
        console.log('No students found - showing empty message');
        return;
    }
    
    console.log('Generating HTML for', filteredStudents.length, 'students');
    attendanceList.innerHTML = filteredStudents.map(student => {
        const studentAttendance = attendance[selectedDate][student.id] || { status: 'neutral', reason: '' };
        const status = studentAttendance.status;
        const isAbsent = status === 'absent';
        const isPresent = status === 'present';
        const isNeutral = status === 'neutral' || !status;
        
        // Set toggle appearance and next status based on current status
        let toggleClass, nextStatus;
        if (isNeutral) {
            toggleClass = 'neutral';
            nextStatus = 'present';
        } else if (isPresent) {
            toggleClass = 'present';
            nextStatus = 'absent';
        } else if (isAbsent) {
            toggleClass = 'absent';
            nextStatus = 'neutral';
        }
        
        return `
            <div class="student-row">
                <div class="student-info-with-toggle">
                    <div class="student-info">
                        <h4>Roll: ${student.rollNumber || 'N/A'} - <span class="clickable-name" onclick="showStudentDetail('${student.id}')">${student.name} বিন ${student.fatherName}</span></h4>
                    </div>
                    <div class="attendance-toggle">
                        <div class="toggle-switch ${toggleClass}" 
                             onclick="toggleAttendance('${student.id}', '${selectedDate}', '${nextStatus}')">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
                ${isAbsent ? `
                    <div class="absence-reason">
                        <input type="text" 
                               placeholder="${t('reasonForAbsence')}"
                               value="${studentAttendance.reason || ''}"
                               onchange="updateAbsenceReason('${student.id}', '${selectedDate}', this.value)">
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Refresh attendance calendar if it's visible to show current date status
    refreshAttendanceCalendarIfVisible();
    
    // Update Hijri date for attendance page
    if (typeof updateAttendancePageHijri === 'function') {
        updateAttendancePageHijri();
    }
    
    console.log('=== loadAttendanceForDate completed ===');
    console.log('Generated HTML length:', attendanceList.innerHTML.length);
    console.log('Students displayed:', filteredStudents.length);
}

async function copyPreviousDayAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }

    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setDate(selectedDateObj.getDate() - 1);
    const previousDate = selectedDateObj.toISOString().split('T')[0];

    if (attendance[previousDate] && Object.keys(attendance[previousDate]).length > 0) {
        // Deep copy the attendance data
        attendance[selectedDate] = JSON.parse(JSON.stringify(attendance[previousDate]));
        
        // Refresh the attendance list to show the copied data
        await loadAttendanceForDate();
        
        showModal(t('success'), t('successfullyCopiedAttendance'));

        // Show visual indication that changes are pending
        const saveButton = document.querySelector('.btn-save-attendance');
        if (saveButton) {
            saveButton.style.background = '#e67e22';
            saveButton.textContent = 'Save Changes*';
        }
    } else {
        showModal(t('error'), t('noAttendanceDataForPreviousDay'));
    }
}

async function toggleAttendance(studentId, date, status) {
    // Prevent attendance marking on holidays
    if (isHoliday(date)) {
        showModal(t('error'), t('cannotMarkAttendanceOnHolidays'));
        return;
    }
    
    if (!attendance[date]) {
        attendance[date] = {};
    }
    
    // Only update in memory, don't save to database yet
    if (status === 'neutral') {
        // Remove the student from attendance record if setting to neutral
        delete attendance[date][studentId];
    } else {
        attendance[date][studentId] = {
            status: status || 'neutral',
            reason: status === 'present' || status === 'neutral' ? '' : (attendance[date][studentId]?.reason || '')
        };
        
        // Show message when marking as absent to remind about reason requirement
        if (status === 'absent') {
            const student = students.find(s => s.id === studentId);
            const studentName = student ? student.name : studentId;
            showModal(t('info'), `Please provide a reason for ${studentName}'s absence before saving.`);
        }
    }
    
    // Refresh the display without saving to database
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
}

function updateAbsenceReason(studentId, date, reason) {
    if (!attendance[date]) {
        attendance[date] = {};
    }
    
    if (!attendance[date][studentId]) {
        attendance[date][studentId] = { status: 'absent', reason: '' };
    }
    
    // Only update in memory, don't save to database yet
    attendance[date][studentId].reason = reason;
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes*';
    }
}

async function saveAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    
    console.log('Saving attendance for date:', selectedDate);
    
    // Prevent saving attendance on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), t('cannotSaveAttendanceOnHolidays'));
        return;
    }
    
    // Initialize attendance record for the day if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    // Get all filtered students for the current date
    const filteredStudents = getFilteredStudents();
    
    // Only save attendance for students who have been explicitly marked (not neutral)
    // Remove neutral/unset students from the attendance record
    filteredStudents.forEach(student => {
        if (!attendance[selectedDate][student.id] || attendance[selectedDate][student.id].status === 'neutral') {
            // Remove neutral students from the attendance record
            if (attendance[selectedDate][student.id]) {
                delete attendance[selectedDate][student.id];
            }
        }
    });
    
    // Count present and absent students
    let presentCount = 0;
    let absentCount = 0;
    
    // Check if any absent students don't have a reason
    const absentStudentsWithoutReason = [];
    
    Object.entries(attendance[selectedDate]).forEach(([studentId, record]) => {
        if (record.status === 'present') {
            presentCount++;
        } else if (record.status === 'absent') {
            absentCount++;
            // Check if absent student has no reason
            if (!record.reason || record.reason.trim() === '') {
                const student = students.find(s => s.id === studentId);
                absentStudentsWithoutReason.push(student ? student.name : studentId);
            }
        }
    });
    
    // If there are absent students without reasons, show error and prevent saving
    if (absentStudentsWithoutReason.length > 0) {
        const studentNames = absentStudentsWithoutReason.join(', ');
        showModal(t('error'), `Please provide absence reasons for: ${studentNames}`);
        return;
    }
    
    console.log(`Saving attendance: ${presentCount} present, ${absentCount} absent (${filteredStudents.length} total)`);
    
    console.log('Current attendance object before save:', attendance);
    
    try {
        // Save to database via API
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance)
        });
        
        if (response.ok) {
        console.log('Attendance saved successfully to database');
        
        // Mark this date as saved
        savedAttendanceDates.add(selectedDate);
        console.log(`Added ${selectedDate} to savedAttendanceDates, total saved dates: ${savedAttendanceDates.size}`);
        
        // Note: Removed automatic sticky attendance to future dates
        // Users can manually use "Copy Previous Day" feature if needed
        
        // Clean up any existing sticky attendance data
        await cleanupStickyAttendanceData();
        
        // Reset save button appearance
        const saveButton = document.querySelector('.btn-save-attendance');
        if (saveButton) {
            saveButton.style.background = '#27ae60';
            saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
            setTimeout(() => {
                saveButton.innerHTML = '<i class="fas fa-save"></i> Save Attendance';
            }, 2000);
        }
        
        // Force dashboard update after saving attendance
        if (typeof forceUpdateDashboard === 'function') {
            forceUpdateDashboard();
        } else {
            updateDashboard();
        }
        
            showModal(t('success'), `${t('attendanceSavedSuccessfully')} ${presentCount} ${t('present')}, ${absentCount} ${t('absent')} (${filteredStudents.length} ${t('total')}).`);
            
            // Refresh attendance calendar if it's visible to show updated attendance data
            refreshAttendanceCalendarIfVisible();
            
            // Force refresh the calendar after a short delay to ensure data is updated
            setTimeout(() => {
                refreshAttendanceCalendarIfVisible();
                forceRefreshAttendanceCalendar();
            }, 500);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save attendance');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        showModal(t('error'), t('failedToSaveAttendance'));
    }
}

async function applyStickyAttendanceToFuture(savedDate) {
    console.log('Applying sticky attendance to future dates from:', savedDate);
    
    const today = new Date();
    const savedDateObj = new Date(savedDate);
    
    // Only apply to future dates, not past dates
    if (savedDateObj < today) {
        console.log('Saved date is in the past, not applying to future');
        return;
    }
    
    // Get the attendance for the saved date
    const savedAttendance = attendance[savedDate];
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
        if (!isHoliday(futureDateStr)) {
            futureDates.push(futureDateStr);
        }
    }
    
    console.log(`Found ${futureDates.length} future dates to apply sticky attendance to`);
    
    // Apply the saved attendance to all future dates
    futureDates.forEach(futureDate => {
        // Only apply if there's no existing attendance for this date
        if (!attendance[futureDate] || Object.keys(attendance[futureDate]).length === 0) {
            attendance[futureDate] = {};
            
            // Copy each student's attendance status
            Object.keys(savedAttendance).forEach(studentId => {
                attendance[futureDate][studentId] = {
                    status: savedAttendance[studentId].status,
                    reason: savedAttendance[studentId].reason || ''
                };
            });
        }
    });
    
    // Save the updated attendance to the database
    try {
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance)
        });
        
                 if (response.ok) {
             console.log('Sticky attendance applied to future dates successfully');
             
             // Mark all future dates as saved
             futureDates.forEach(futureDate => {
                 if (attendance[futureDate] && Object.keys(attendance[futureDate]).length > 0) {
                     savedAttendanceDates.add(futureDate);
                 }
             });
             
             // Refresh attendance calendar if it's visible to show updated attendance data
             refreshAttendanceCalendarIfVisible();
         } else {
             console.error('Failed to save sticky attendance to database');
         }
    } catch (error) {
        console.error('Error applying sticky attendance to future:', error);
    }
}

async function cleanupStickyAttendanceData() {
    console.log('Cleaning up sticky attendance data...');
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Get all dates that have attendance data
    const attendanceDates = Object.keys(attendance);
    const datesToRemove = [];
    
    // Find dates that are in the future and were automatically applied
    attendanceDates.forEach(dateStr => {
        if (dateStr > todayStr) {
            // Check if this date has the same attendance pattern as today
            const todayAttendance = attendance[todayStr];
            const futureAttendance = attendance[dateStr];
            
            if (todayAttendance && futureAttendance) {
                // Compare if the attendance patterns are identical (indicating auto-application)
                const todayKeys = Object.keys(todayAttendance);
                const futureKeys = Object.keys(futureAttendance);
                
                if (todayKeys.length === futureKeys.length) {
                    let isIdentical = true;
                    for (const studentId of todayKeys) {
                        if (!futureAttendance[studentId] || 
                            futureAttendance[studentId].status !== todayAttendance[studentId].status) {
                            isIdentical = false;
                            break;
                        }
                    }
                    
                    if (isIdentical) {
                        datesToRemove.push(dateStr);
                    }
                }
            }
        }
    });
    
    // Remove the automatically applied future dates
    datesToRemove.forEach(dateStr => {
        delete attendance[dateStr];
        savedAttendanceDates.delete(dateStr);
        console.log(`Removed auto-applied attendance for date: ${dateStr}`);
    });
    
    if (datesToRemove.length > 0) {
        console.log(`Cleaned up ${datesToRemove.length} auto-applied future dates`);
        
        // Save the cleaned attendance data to database
        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attendance)
            });
            
            if (response.ok) {
                console.log('Cleaned attendance data saved to database');
                // Refresh attendance calendar if it's visible
                refreshAttendanceCalendarIfVisible();
            } else {
                console.error('Failed to save cleaned attendance data');
            }
        } catch (error) {
            console.error('Error saving cleaned attendance data:', error);
        }
    } else {
        console.log('No auto-applied future dates found to clean up');
    }
}

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

async function markAllPresent() {
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

function showMarkAllAbsentModal() {
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

async function markAllNeutral() {
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

let studentDetailSource = 'attendance'; // Track where student detail was opened from

function showStudentDetail(studentId, source = 'attendance') {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showModal(t('error'), t('studentNotFound'));
        return;
    }
    
    // Store the source for navigation back
    studentDetailSource = source;
    
    // Hide all sections and show student detail as separate page
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('student-detail').classList.add('active');
    
    // Update page title
    document.getElementById('studentDetailTitle').textContent = `${student.name} - ${t('studentDetails')}`;
    
    // Update back button text based on source
    const backButton = document.querySelector('#student-detail .btn-secondary');
    if (backButton) {
        if (source === 'registration') {
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('backToRegistration')}`;
        } else {
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('backToReports')}`;
        }
    }
    
    // Generate student detail content
    generateStudentDetailContent(student);
    
    // Update URL hash for navigation
    window.location.hash = `student/${studentId}`;
}

function backToReports() {
    document.getElementById('student-detail').classList.remove('active');
    
    // Navigate back to the correct section based on where we came from
    if (studentDetailSource === 'registration') {
        document.getElementById('registration').classList.add('active');
        window.location.hash = 'registration';
    } else {
        document.getElementById('attendance').classList.add('active');
        window.location.hash = 'attendance';
    }
}

let currentStudentDetailMonth = new Date().getMonth();
let currentStudentDetailYear = new Date().getFullYear();
let currentStudentData = null;
let currentSummaryPeriod = 'last30Days'; // 'last30Days' or 'fromBeginning'

function generateStudentDetailContent(student) {
    const detailContent = document.getElementById('studentDetailContent');
    
    // Store current student data for calendar navigation
    currentStudentData = student;
    
    // Calculate attendance statistics based on selected period
    let startDateStr, endDateStr, periodLabel;
    const today = new Date();
    const endDateStr_today = today.toISOString().split('T')[0];
    
    if (currentSummaryPeriod === 'last30Days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
        endDateStr = endDateStr_today;
        periodLabel = t('last30Days');
    } else {
        // From beginning - use academic year start date or student registration date
        const academicStart = academicYearStartDate;
        const registrationDate = student.registrationDate;
        
        if (academicStart) {
            startDateStr = academicStart;
        } else if (registrationDate) {
            startDateStr = registrationDate;
        } else {
            // Fallback to 6 months ago if no academic year or registration date
            const sixMonthsAgo = new Date(today);
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            startDateStr = sixMonthsAgo.toISOString().split('T')[0];
        }
        endDateStr = endDateStr_today;
        periodLabel = t('fromBeginning');
    }
    
    const attendanceStats = calculateStudentAttendanceStats(student, startDateStr, endDateStr);
    
    detailContent.innerHTML = `
        <div class="student-info-card">
            <div class="student-basic-info">
                <div class="info-group">
                    <h4>${t('personalInformation')}</h4>
                    <div class="info-item">
                        <span class="info-label">${t('fullName')}:</span>
                        <span class="info-value">${student.name} বিন ${student.fatherName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${t('rollNumber')}:</span>
                        <span class="info-value">${student.rollNumber || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${t('class')}:</span>
                        <span class="info-value">${student.class}</span>
                    </div>
                </div>
                
                <div class="info-group">
                    <h4>${t('contactInformation')}</h4>
                    <div class="info-item">
                        <span class="info-label">${t('mobileNumber')}:</span>
                        <span class="info-value">${student.mobileNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${t('district')}:</span>
                        <span class="info-value">${student.district}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${t('subDistrict')}:</span>
                        <span class="info-value">${student.upazila}</span>
                    </div>
                </div>
                
                <div class="info-group">
                    <h4>${t('academicInformation')}</h4>
                    <div class="info-item">
                        <span class="info-label">${t('registrationDate')}:</span>
                        <span class="info-value">${student.registrationDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${t('rollNumber')}:</span>
                        <span class="info-value">${student.rollNumber || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="attendance-history">
                <div class="attendance-summary-header">
                    <h4>${t('attendanceSummary')} (${periodLabel})</h4>
                    <div class="summary-period-toggle">
                        <label>${t('summaryPeriod')}:</label>
                        <button onclick="changeSummaryPeriod('last30Days')" class="period-btn ${currentSummaryPeriod === 'last30Days' ? 'active' : ''}">
                            ${t('last30Days')}
                        </button>
                        <button onclick="changeSummaryPeriod('fromBeginning')" class="period-btn ${currentSummaryPeriod === 'fromBeginning' ? 'active' : ''}">
                            ${t('fromBeginning')}
                        </button>
                    </div>
                </div>
                <div class="attendance-summary">
                    <div class="summary-item present">
                        <h5>${t('totalPresent')}</h5>
                        <div class="number">${attendanceStats.present}</div>
                    </div>
                    <div class="summary-item absent clickable" onclick="showAbsentDaysModal('${student.id}', '${startDateStr}', '${endDateStr}')">
                        <h5>${t('totalAbsent')}</h5>
                        <div class="number">${attendanceStats.absent}</div>
                        <small class="click-hint">${t('clickToViewDetails')}</small>
                    </div>
                    <div class="summary-item">
                        <h5>${t('leaveDays')}</h5>
                        <div class="number">${attendanceStats.leave}</div>
                    </div>
                    <div class="summary-item">
                        <h5>${t('attendanceRate')}</h5>
                        <div class="number">${attendanceStats.attendanceRate}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateStudentAttendanceStats(student, startDate, endDate) {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let totalSchoolDays = 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        // Use local date to avoid timezone issues with toISOString()
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (isHoliday(dateStr)) {
            continue;
        }
        
        // Exclude days where no attendance was recorded at all
        if (!attendance[dateStr] || Object.keys(attendance[dateStr]).length === 0) {
            continue;
        }

        totalSchoolDays++;

        const record = attendance[dateStr] ? attendance[dateStr][student.id] : null;

        if (record) {
            if (record.status === 'present') {
                present++;
            } else if (record.status === 'absent') {
                absent++;
            } else if (record.status === 'leave') {
                leave++;
            }
            } else {
            // If attendance was recorded for the day but the student has no record,
            // they are considered absent for that day's report.
            absent++;
        }
    }
    
    const attendanceRate = totalSchoolDays > 0 ? Math.round((present / (totalSchoolDays - leave)) * 100) : 0;
    
    return {
        present,
        absent,
        leave,
        attendanceRate: isNaN(attendanceRate) ? 0 : attendanceRate
    };
}

function getStudentAbsentDays(studentId, startDate, endDate) {
    const absentDays = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (isHoliday(dateStr)) {
            continue;
        }
        
        // Only include days where attendance was recorded
        if (!attendance[dateStr] || Object.keys(attendance[dateStr]).length === 0) {
            continue;
        }

        const record = attendance[dateStr] ? attendance[dateStr][studentId] : null;

        if (record && record.status === 'absent') {
            absentDays.push({
                date: dateStr,
                reason: record.reason || '',
                formattedDate: formatDate(dateStr)
            });
        } else if (!record) {
            // If attendance was recorded for the day but the student has no record,
            // they are considered absent for that day's report.
            absentDays.push({
                date: dateStr,
                reason: '',
                formattedDate: formatDate(dateStr)
            });
        }
    }
    
    return absentDays;
}

function showAbsentDaysModal(studentId, startDate, endDate) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const absentDays = getStudentAbsentDays(studentId, startDate, endDate);
    
    let periodLabel;
    const today = new Date();
    const endDateStr_today = today.toISOString().split('T')[0];
    
    if (currentSummaryPeriod === 'last30Days') {
        periodLabel = t('last30Days');
    } else {
        periodLabel = t('fromBeginning');
    }

    let absentDaysHTML = '';
    if (absentDays.length === 0) {
        absentDaysHTML = `<p class="no-absent-days">${t('noAbsentDays')}</p>`;
    } else {
        absentDaysHTML = `
            <div class="absent-days-list">
                ${absentDays.map(day => `
                    <div class="absent-day-item">
                        <div class="absent-date">${day.formattedDate}</div>
                        ${day.reason ? `<div class="absent-reason">${t('reason')}: ${day.reason}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    const modalContent = `
        <div class="modal-content absent-days-modal">
            <div class="modal-header">
                <h3>${t('absentDays')} - ${student.name}</h3>
                <span class="close" onclick="closeModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="period-info">
                    <p><strong>${t('period')}:</strong> ${periodLabel}</p>
                    <p><strong>${t('totalAbsentDays')}:</strong> ${absentDays.length}</p>
                </div>
                ${absentDaysHTML}
            </div>
        </div>
    `;

    showModal('', modalContent);
}







function changeSummaryPeriod(period) {
    currentSummaryPeriod = period;
    if (currentStudentData) {
        generateStudentDetailContent(currentStudentData);
    }
}

function showResetAttendanceModal() {
    document.getElementById('resetAttendanceModal').style.display = 'block';
    document.getElementById('resetConfirmationInput').value = '';
    document.getElementById('confirmResetBtn').disabled = true;
}

function closeResetAttendanceModal() {
    document.getElementById('resetAttendanceModal').style.display = 'none';
    document.getElementById('resetConfirmationInput').value = '';
    document.getElementById('confirmResetBtn').disabled = true;
}

async function confirmResetAttendance() {
    const confirmationInput = document.getElementById('resetConfirmationInput');
    const confirmationText = confirmationInput.value.trim().toUpperCase();
    
    if (confirmationText !== 'RESET') {
        showModal(t('error'), t('attendanceResetPleaseTypeReset'));
        return;
    }
    
    // Show loading state
    const confirmBtn = document.getElementById('confirmResetBtn');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
    confirmBtn.disabled = true;
    
    try {
        // Reset attendance in database by sending null instead of empty object
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(null) // Send null to reset attendance
        });
        
        if (response.ok) {
            // Clear local data
            attendance = {};
            savedAttendanceDates.clear();
            
            // Close modal
            closeResetAttendanceModal();
            
            // Update UI
            updateDashboard();
            refreshAttendanceCalendarIfVisible();
            
            // Reset attendance table if currently viewing
            await loadAttendanceForDate();
            
            showModal(t('success'), t('attendanceResetSuccess'));
            
            console.log('Attendance history reset successfully');
        } else {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error('Failed to reset attendance in database');
        }
    } catch (error) {
        console.error('Error resetting attendance:', error);
        showModal(t('error'), t('attendanceResetFailed'));
        
        // Reset button state
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
    }
}


export { studentDetailSource, currentStudentDetailMonth, currentStudentDetailYear, currentStudentData, currentSummaryPeriod, initializeTodayAttendance, updateDateInputMax, updateAbsenceReason, updateFilteredStudentCount, getFilteredStudents, showMarkAllAbsentModal, closeBulkAbsentModal, showStudentDetail, backToReports, generateStudentDetailContent, calculateStudentAttendanceStats, getStudentAbsentDays, showAbsentDaysModal, changeSummaryPeriod, showResetAttendanceModal, closeResetAttendanceModal, markAllPresent, markAllNeutral, copyPreviousDayAttendance, saveAttendance, loadAttendanceForDate, confirmMarkAllAbsent, confirmResetAttendance, toggleAttendance }
