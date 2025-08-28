import { getTodayString } from './utils.js';

function initializeTodayAttendance() {
    const todayStr = getTodayString();
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
    const todayStr = getTodayString();
    const attendanceDateInput = document.getElementById('attendanceDate');
    attendanceDateInput.value = todayStr;
    attendanceDateInput.max = todayStr; // Set max date to today
    await loadAttendanceForDate();
}

function updateDateInputMax() {
    // Use local date methods to avoid timezone issues
    const todayStr = getTodayString();
    const attendanceDateInput = document.getElementById('attendanceDate');
    if (attendanceDateInput) {
        attendanceDateInput.max = todayStr;
    }
}

async function loadAttendanceForDate() {
    console.log('=== loadAttendanceForDate called ===');
    
    // Load dashboard data if not already loaded
    if (!window.students || window.students.length === 0) {
        console.log('🔄 Attendance data not loaded, loading now...');
        if (typeof window.initializeDashboardData === 'function') {
            await window.initializeDashboardData();
        }
    }
    
    let selectedDate = document.getElementById('attendanceDate').value;
    const attendanceList = document.getElementById('attendanceList');
    
    // Ensure class filter is populated with a delay to ensure classes are loaded
    if (typeof populateAttendanceClassFilter === 'function') {
        console.log('🔄 Ensuring class filter is populated...');
        setTimeout(() => {
            populateAttendanceClassFilter();
        }, 500);
    }
    
    console.log('Selected date:', selectedDate);
    console.log('Attendance list element:', attendanceList);
    
    // If no date is selected, automatically set today's date
    if (!selectedDate) {
        selectedDate = getTodayString();
        document.getElementById('attendanceDate').value = selectedDate;
    }
    
    // Check if selected date is in the future
    const todayStr = getTodayString();
    
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
    
    // Sort students by class ID (from database) and then roll number
    filteredStudents.sort((a, b) => {
        // Get class ID from window.classes instead of parsing class name
        const classA = window.classes ? window.classes.find(cls => cls.name === a.class)?.id || 0 : 0;
        const classB = window.classes ? window.classes.find(cls => cls.name === b.class)?.id || 0 : 0;
        
        if (classA !== classB) return classA - classB;
        return parseRollNumber(a.rollNumber) - parseRollNumber(b.rollNumber);
    });
    
    updateFilteredStudentCount(filteredStudents.length);
    
    // Update filter status indicator
    updateFilterStatus();
    
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
    
    // Update dashboard to reflect the changes
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
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
            // Force refresh attendance data from server before updating dashboard
            if (typeof refreshAttendanceData === 'function') {
                await refreshAttendanceData();
            }
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
    
    const todayStr = getTodayString();
    
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

// Function to update filter status indicator
function updateFilterStatus() {
    const classFilter = document.getElementById('classFilter');
    const resetButton = document.querySelector('.class-filter button[onclick*="resetAttendanceClassFilter"]');
    
    if (classFilter && resetButton) {
        const selectedClass = classFilter.value;
        
        if (selectedClass && selectedClass.trim() !== '') {
            // A class is selected - show active state
            resetButton.style.display = 'inline-block';
            resetButton.style.opacity = '1';
            resetButton.title = `Reset to All Classes (currently showing: ${selectedClass})`;
            
            // Add visual indicator to the class filter
            classFilter.style.borderColor = '#3498db';
            classFilter.style.backgroundColor = '#f8f9fa';
        } else {
            // No class selected - show inactive state
            resetButton.style.display = 'inline-block';
            resetButton.style.opacity = '0.6';
            resetButton.title = 'Reset to All Classes';
            
            // Remove visual indicator from the class filter
            classFilter.style.borderColor = '';
            classFilter.style.backgroundColor = '';
        }
    }
}

function getFilteredStudents() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const selectedClass = document.getElementById('classFilter').value;
    
    console.log('🔍 getFilteredStudents - selectedDate:', selectedDate);
    console.log('🔍 getFilteredStudents - selectedClass:', selectedClass);
    console.log('🔍 getFilteredStudents - selectedClass type:', typeof selectedClass);
    console.log('🔍 getFilteredStudents - selectedClass length:', selectedClass ? selectedClass.length : 'N/A');
    console.log('🔍 getFilteredStudents - students.length:', students.length);
    console.log('🔍 getFilteredStudents - sample student class:', students[0]?.class);

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

    // Use date-aware filtering to show students who were active on the selected date
    let dateFilteredStudents = students.filter(student => {
        // If student is currently active, always include them
        if (student.status === 'active') {
            return true;
        }
        
        // If student is inactive, check if they were active on the selected date
        if (student.status === 'inactive' && student.inactivationDate) {
            const parsedInactivationDate = parseInactivationDate(student.inactivationDate);
            if (parsedInactivationDate) {
                // Include if the selected date is before the inactivation date
                // This means the student was still active on that date
                // Note: On the day of inactivation, the student becomes inactive, so exclude them
                return selectedDate < parsedInactivationDate;
            }
        }
        
        // If student is inactive but has no inactivation date, exclude them
        return false;
    });

    let finalFilteredStudents = dateFilteredStudents;
    if (selectedClass && selectedClass.trim() !== '') {
        console.log('🔍 getFilteredStudents - Filtering by class:', selectedClass);
        console.log('🔍 getFilteredStudents - dateFilteredStudents before class filter:', dateFilteredStudents.length);
        
        // Debug: Show sample student class data
        console.log('🔍 getFilteredStudents - Sample student classes:', dateFilteredStudents.slice(0, 5).map(s => ({ name: s.name, class: s.class })));
        
        finalFilteredStudents = dateFilteredStudents.filter(student => {
            const matches = student.class === selectedClass;
            if (!matches) {
                console.log(`🔍 getFilteredStudents - Student ${student.name} class "${student.class}" doesn't match selected class "${selectedClass}"`);
            }
            return matches;
        });
        console.log('🔍 getFilteredStudents - finalFilteredStudents after class filter:', finalFilteredStudents.length);
        
        // If no matches found, show more debugging
        if (finalFilteredStudents.length === 0) {
            console.warn('⚠️ No students found for class:', selectedClass);
            console.warn('⚠️ Available classes in student data:', [...new Set(dateFilteredStudents.map(s => s.class))]);
            console.warn('⚠️ Selected class:', selectedClass);
        }
    } else {
        console.log('🔍 getFilteredStudents - No class selected or "All Classes" selected, showing all students');
        // When no class is selected or "All Classes" is selected, show all students
        finalFilteredStudents = dateFilteredStudents;
    }
    return finalFilteredStudents;
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
    
    // Update dashboard to reflect the changes
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    
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
    
    // Update dashboard to reflect the changes
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    
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
    
    // Update dashboard to reflect the cleared attendance
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
    
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

async function showStudentDetail(studentId, source = 'attendance') {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showModal(t('error'), t('studentNotFound'));
        return;
    }
    
    // Store the source for navigation back
    studentDetailSource = source;
    
    // Use the unified student profile modal instead of separate page
    if (typeof window.showStudentProfile === 'function') {
        // Call the Teachers Corner profile function
        await window.showStudentProfile(studentId);
        } else {
        // Fallback to basic modal if Teachers Corner function not available
        showModal(t('studentDetails'), `
            <div class="space-y-4">
                <div><strong>${t('name')}:</strong> ${student.name} বিন ${student.fatherName}</div>
                <div><strong>${t('rollNumber')}:</strong> ${student.rollNumber || 'N/A'}</div>
                <div><strong>${t('class')}:</strong> ${student.class}</div>
                <div><strong>${t('mobile')}:</strong> ${student.mobileNumber || student.mobile || 'N/A'}</div>
                <div><strong>${t('address')}:</strong> ${student.upazila}, ${student.district}</div>
                    </div>
        `);
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


// Function to populate the attendance class filter with available classes
function populateAttendanceClassFilter() {
    console.log('🔄 populateAttendanceClassFilter called');
    
    const classFilter = document.getElementById('classFilter');
    if (!classFilter) {
        console.warn('⚠️ classFilter element not found');
        return;
    }
    
    console.log('✅ Found classFilter element:', classFilter);
    
    // Clear existing options and add "All Classes" option
    classFilter.innerHTML = '<option value="">All Classes</option>';
    console.log('✅ Cleared existing options, current options:', Array.from(classFilter.options).map(opt => ({ value: opt.value, text: opt.textContent })));
    
    // Ensure the "All Classes" option is selected by default
    classFilter.value = '';
    
    // Get classes from window.classes (populated by main app)
    console.log('🔍 window.classes:', window.classes);
    console.log('🔍 typeof window.classes:', typeof window.classes);
    console.log('🔍 window.classes.length:', window.classes ? window.classes.length : 'undefined');
    
    if (window.classes && window.classes.length > 0) {
        console.log('✅ Populating attendance class filter with classes:', window.classes);
        console.log('✅ Class names to add:', window.classes.map(cls => cls.name));
        
        console.log('🔍 Classes in order for attendance filter:', window.classes.map(cls => ({ id: cls.id, name: cls.name })));
        window.classes.forEach((cls, index) => {
            console.log(`🔄 Processing class ${index + 1}:`, cls);
            const option = document.createElement('option');
            option.value = cls.name;
            option.textContent = cls.name;
            classFilter.appendChild(option);
            console.log(`✅ Added class option: ${cls.name}`);
        });
        console.log(`✅ Added ${window.classes.length} class options to attendance filter`);
        
        // Debug: Show what's actually in the dropdown
        console.log('🔍 Final class filter options:', Array.from(classFilter.options).map(opt => ({ value: opt.value, text: opt.textContent })));
        
        // Also check for potential class name mismatches
        if (window.students && window.students.length > 0) {
            const studentClasses = [...new Set(window.students.map(s => s.class))];
            console.log('🔍 Student classes found:', studentClasses);
            console.log('🔍 Database classes:', window.classes.map(cls => cls.name));
            
            // Check for mismatches
            const mismatches = studentClasses.filter(studentClass => 
                !window.classes.some(dbClass => dbClass.name === studentClass)
            );
            if (mismatches.length > 0) {
                console.warn('⚠️ Class name mismatches found:', mismatches);
                console.warn('⚠️ These student classes are not in the database classes');
            }
        }
    } else {
        console.warn('⚠️ No classes available for attendance filter');
        console.warn('🔍 window.classes:', window.classes);
        
        // Try to wait for classes to be loaded
        if (!window.classes) {
            console.log('⏳ Classes not loaded yet, waiting...');
            setTimeout(() => {
                console.log('🔄 Retrying populateAttendanceClassFilter after delay...');
                populateAttendanceClassFilter();
            }, 1000);
        }
    }
}

// Manual function to refresh class filter (can be called from console for debugging)
function refreshAttendanceClassFilter() {
    console.log('🔄 Manual refresh of attendance class filter called');
    populateAttendanceClassFilter();
}

// Function to reset class filter to "All Classes"
function resetAttendanceClassFilter() {
    console.log('🔄 Resetting attendance class filter to "All Classes"');
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
        classFilter.value = '';
        // Trigger the change event to refresh the student list
        loadAttendanceForDate();
    }
}

export { studentDetailSource, initializeTodayAttendance, updateDateInputMax, updateAbsenceReason, updateFilteredStudentCount, updateFilterStatus, getFilteredStudents, showMarkAllAbsentModal, closeBulkAbsentModal, showStudentDetail, showResetAttendanceModal, closeResetAttendanceModal, markAllPresent, markAllNeutral, copyPreviousDayAttendance, saveAttendance, loadAttendanceForDate, confirmMarkAllAbsent, confirmResetAttendance, toggleAttendance, populateAttendanceClassFilter, refreshAttendanceClassFilter, resetAttendanceClassFilter }
