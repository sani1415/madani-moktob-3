window.currentStudentDetailMonth =  new Date().getMonth();
window.currentStudentDetailYear =  new Date().getFullYear();
window.currentStudentData =  null;
window.currentSummaryPeriod =  'last30Days'; // 'last30Days' or 'fromBeginning'

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

export function calculateStudentAttendanceStats(student, startDate, endDate) {
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

// expose functions globally
Object.assign(window, { calculateStudentAttendanceStats, changeSummaryPeriod, generateStudentDetailContent, getStudentAbsentDays, showAbsentDaysModal });
