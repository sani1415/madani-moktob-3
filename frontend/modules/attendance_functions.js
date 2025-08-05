function initializeTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    if (!attendance[today]) {
        attendance[today] = {};
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
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateInput = document.getElementById('attendanceDate');
    attendanceDateInput.value = today;
    attendanceDateInput.max = today; // Set max date to today
    await loadAttendanceForDate();
}

function updateDateInputMax() {
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateInput = document.getElementById('attendanceDate');
    if (attendanceDateInput) {
        attendanceDateInput.max = today;
    }
}

export async function loadAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const attendanceList = document.getElementById('attendanceList');
    
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    // Check if selected date is in the future
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const selectedDateObj = new Date(selectedDate);
    
    if (selectedDateObj > today) {
        showModal(t('error'), t('cannotTakeAttendanceForFutureDate'));
        return;
    }
    
    // Initialize attendance record for the day if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    let filteredStudents = getFilteredStudents();
    
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
        return;
    }
    
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

export async function saveAttendance() {
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
    
    Object.values(attendance[selectedDate]).forEach(record => {
        if (record.status === 'present') {
            presentCount++;
        } else if (record.status === 'absent') {
            absentCount++;
        }
    });
    
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
        
        // Apply sticky attendance to future dates
        await applyStickyAttendanceToFuture(selectedDate);
        
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

// expose functions globally
Object.assign(window, { initializeTodayAttendance, updateAbsenceReason, updateDateInputMax });
