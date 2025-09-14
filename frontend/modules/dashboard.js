import { getTodayString, parseInactivationDate } from './utils.js';

async function updateDashboard() {
    // Use local date methods to avoid timezone issues (same as attendance module)
    const today = getTodayString();
    
    // NEW: Fetch counts from the health endpoint for accuracy
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            const healthData = await response.json();
            document.getElementById('inactiveStudents').textContent = healthData.inactive_students_count || 0;
        } else {
            // Fallback for safety
            document.getElementById('inactiveStudents').textContent = 'N/A';
        }
    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        document.getElementById('inactiveStudents').textContent = 'N/A';
    }
    
    console.log('Updating dashboard for date:', today);
    console.log('Total students in database:', students.length);
    console.log('Today attendance data:', attendance[today]);
    
    // Check if today is a holiday and display holiday notice
    const holidayNotice = document.getElementById('holidayNotice');
    if (isHoliday(today)) {
        const holidayName = getHolidayName(today);
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
        
        // On holidays, show all active students as present (using date-aware filtering)
        const activeStudentsForToday = students.filter(student => {
            if (student.status === 'active') {
                return true;
            }
            if (student.status === 'inactive' && student.inactivationDate) {
                const parsedInactivationDate = parseInactivationDate(student.inactivationDate);
                return parsedInactivationDate ? today < parsedInactivationDate : false;
            }
            return false;
        });
        
        document.getElementById('presentToday').textContent = activeStudentsForToday.length;
        document.getElementById('absentToday').textContent = 0;
        document.getElementById('attendanceRate').textContent = '100%';
    } else {
        if (holidayNotice) {
            holidayNotice.style.display = 'none';
        }
        
        const todayAttendance = attendance[today] || {};
        console.log('Processing attendance for non-holiday:', todayAttendance);
        
        // Use date-aware filtering to get students who were active on today's date
        const activeStudentsForToday = students.filter(student => {
            // If student is currently active, always include them
            if (student.status === 'active') {
                return true;
            }
            
            // If student is inactive, check if they were active on today's date
            if (student.status === 'inactive' && student.inactivationDate) {
                const parsedInactivationDate = parseInactivationDate(student.inactivationDate);
                // Include if today is before the inactivation date
                // This means the student was still active today
                return parsedInactivationDate ? today < parsedInactivationDate : false;
            }
            
            // If student is inactive but has no inactivation date, exclude them
            return false;
        });
        
        let presentCount = 0;
        let absentCount = 0;
        
        // Count attendance properly for active students only
        for (const studentId in todayAttendance) {
            // Only count if this student was active for today
            const student = students.find(s => s.id === studentId);
            if (student) {
                const isActiveForToday = student.status === 'active' || 
                    (student.status === 'inactive' && student.inactivationDate && 
                     (() => {
                         const parsedDate = parseInactivationDate(student.inactivationDate);
                         return parsedDate ? today < parsedDate : false;
                     })());
                
                if (isActiveForToday) {
                    const att = todayAttendance[studentId];
                    if (att && att.status === 'present') {
                        presentCount++;
                    } else if (att && att.status === 'absent') {
                        absentCount++;
                    }
                }
            }
        }
        
        const unmarkedCount = activeStudentsForToday.length - presentCount - absentCount;
        
        console.log('Active students for today:', activeStudentsForToday.length);
        console.log('Attendance counts - Present:', presentCount, 'Absent:', absentCount, 'Unmarked:', unmarkedCount);
        
        // Force update DOM elements with immediate value changes
        const presentElement = document.getElementById('presentToday');
        const absentElement = document.getElementById('absentToday');
        const rateElement = document.getElementById('attendanceRate');
        const totalElement = document.getElementById('totalStudents');
        
        if (totalElement) {
            totalElement.textContent = activeStudentsForToday.length;
            totalElement.style.color = '#2c3e50';
        }
        
        if (presentElement) {
            presentElement.textContent = presentCount;
            presentElement.style.color = '#27ae60';
        }
        
        if (absentElement) {
            absentElement.textContent = absentCount;
            absentElement.style.color = '#e74c3c';
        }
        
        // Calculate attendance rate
        let attendanceRate;
        if (presentCount + absentCount === 0) {
            attendanceRate = 0;
        } else {
            attendanceRate = Math.round((presentCount / (presentCount + absentCount)) * 100);
        }
        
        console.log('Final dashboard values - Total:', activeStudentsForToday.length, 'Present:', presentCount, 'Absent:', absentCount, 'Rate:', attendanceRate + '%');
        
        if (rateElement) {
            rateElement.textContent = `${attendanceRate}%`;
            rateElement.style.color = attendanceRate >= 80 ? '#27ae60' : attendanceRate >= 60 ? '#f39c12' : '#e74c3c';
        }
    }
    
    // Update class-wise information
    updateClassWiseStats();
    
    // Update performance metrics
    updatePerformanceMetrics();
    
    // Update main dashboard alerts
    updateMainDashboardAlerts();
    
    // Update Hijri date display
    if (typeof updateDashboardWithHijri === 'function') {
        updateDashboardWithHijri();
    }
}

function updateTodayOverview() {
    // Use local date methods to avoid timezone issues (same as attendance module)
    const today = getTodayString();
    const todayAttendance = attendance[today] || {};
    const overviewDiv = document.getElementById('todayOverview');
    
    // Use date-aware filtering to get students who were active on today's date
    const activeStudentsForToday = students.filter(student => {
        // If student is currently active, always include them
        if (student.status === 'active') {
            return true;
        }
        
        // If student is inactive, check if they were active on today's date
        if (student.status === 'inactive' && student.inactivationDate) {
            const parsedInactivationDate = parseInactivationDate(student.inactivationDate);
            // Include if today is before the inactivation date
            // This means the student was still active today
            return parsedInactivationDate ? today < parsedInactivationDate : false;
        }
        
        // If student is inactive but has no inactivation date, exclude them
        return false;
    });
    
    if (activeStudentsForToday.length === 0) {
        overviewDiv.innerHTML = `<p>${t('noStudentsRegistered')}</p>`;
        return;
    }
    
    if (Object.keys(todayAttendance).length === 0) {
        overviewDiv.innerHTML = `<p>${t('noAttendanceData')}</p>`;
        return;
    }
    
    const presentStudents = activeStudentsForToday.filter(student => 
        todayAttendance[student.id] && todayAttendance[student.id].status === 'present'
    );
    
    const absentStudents = activeStudentsForToday.filter(student => 
        todayAttendance[student.id] && todayAttendance[student.id].status === 'absent'
    );
    
    let html = `
        <div class="attendance-summary">
            <p><strong>${t('present')}:</strong> ${presentStudents.length}</p>
            <p><strong>${t('absent')}:</strong> ${absentStudents.length}</p>
        </div>
    `;
    
    if (absentStudents.length > 0) {
        html += `
            <div class="absent-details">
                <h4>${t('absentStudents')}</h4>
                <ul>
        `;
        
        absentStudents.forEach(student => {
            const reason = todayAttendance[student.id].reason || t('noReasonProvided');
            const displayRoll = student.rollNumber || 'N/A';
            html += `<li>Roll: ${displayRoll} - ${student.name} বিন ${student.fatherName} - ${reason}</li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    overviewDiv.innerHTML = html;
}

async function updateClassWiseStats() {
    try {
        console.log('🔄 Updating class-wise stats...');
        
        // Use local date methods to avoid timezone issues (same as attendance module)
        const today = getTodayString();
        const todayAttendance = attendance[today] || {};
    
    // Use date-aware filtering to get students who were active on today's date
    const activeStudentsForToday = students.filter(student => {
        // If student is currently active, always include them
        if (student.status === 'active') {
            return true;
        }
        
        // If student is inactive, check if they were active on today's date
        if (student.status === 'inactive' && student.inactivationDate) {
            const parsedInactivationDate = parseInactivationDate(student.inactivationDate);
            // Include if today is before the inactivation date
            // This means the student was still active today
            return parsedInactivationDate ? today < parsedInactivationDate : false;
        }
        
        // If student is inactive but has no inactivation date, exclude them
        return false;
    });

    const classSummary = {};

    // Use ALL students to initialize the summary object, including inactive counts
    students.forEach(student => {
        if (student.class && !classSummary[student.class]) {
            classSummary[student.class] = {
                total: 0,
                present: 0,
                absent: 0,
                inactive: 0,
                rate: 0,
                averageScore: 0,
                mustaidCount: 0,
                mutawassitCount: 0,
                mujtahidCount: 0
            };
        }
    });
    
    // Also add predefined classes (in case they have no students yet)
    if (window.classes && Array.isArray(window.classes)) {
        window.classes.forEach(cls => {
            if (!classSummary[cls.name]) {
                classSummary[cls.name] = {
                    total: 0,
                    present: 0,
                    absent: 0,
                    inactive: 0,
                    rate: 0,
                    averageScore: 0,
                    mustaidCount: 0,
                    mutawassitCount: 0,
                    mujtahidCount: 0
                };
            }
        });
    }
    
    // Count ACTIVE students for total, present, and absent (using date-aware filtering)
    activeStudentsForToday.forEach(student => {
        if (student.class && classSummary[student.class]) {
            classSummary[student.class].total++;
            
            if (todayAttendance[student.id]) {
                if (todayAttendance[student.id].status === 'present') {
                    classSummary[student.class].present++;
                } else if (todayAttendance[student.id].status === 'absent') {
                    classSummary[student.class].absent++;
                }
                // If status is 'unmarked', don't count as present or absent
            }
        }
    });

    // NEW: Count INACTIVE students
    const inactiveStudents = students.filter(student => student.status === 'inactive');
    inactiveStudents.forEach(student => {
        if (student.class && classSummary[student.class]) {
            classSummary[student.class].inactive++;
        }
    });
    
    // Calculate rates based on ACTIVE students
    Object.keys(classSummary).forEach(className => {
        const classData = classSummary[className];
        if (classData.total > 0) { // total here refers to active students
            classData.rate = Math.round((classData.present / classData.total) * 100);
        }
    });

    // Fetch all student scores in one batch API call
    console.log('🔄 Fetching all student scores in batch...');
    try {
        const response = await fetch('/api/all-student-scores');
        if (response.ok) {
            const scoresData = await response.json();
            const allScores = scoresData.scores || {};
            
            console.log(`✅ Fetched scores for ${scoresData.scores_fetched} students in batch`);
            
            // Calculate performance metrics for each class using batch data
            Object.keys(classSummary).forEach(className => {
                const classStudents = students.filter(student => 
                    student.class === className && student.status === 'active'
                );
                
                if (classStudents.length > 0) {
                    const classScores = [];
                    
                    // Get scores for students in this class from batch data
                    classStudents.forEach(student => {
                        const studentScoreData = allScores[student.id];
                        if (studentScoreData && studentScoreData.score > 0) {
                            classScores.push(studentScoreData.score);
                        }
                    });
                    
                    if (classScores.length > 0) {
                        // Calculate average score
                        const totalScore = classScores.reduce((sum, score) => sum + score, 0);
                        classSummary[className].averageScore = Math.round(totalScore / classScores.length);
                        
                        // Categorize students into performance tiers
                        classScores.forEach(score => {
                            if (score >= 80) {
                                classSummary[className].mustaidCount++;
                            } else if (score >= 60) {
                                classSummary[className].mutawassitCount++;
                            } else {
                                classSummary[className].mujtahidCount++;
                            }
                        });
                    }
                }
            });
        } else {
            console.error('❌ Failed to fetch batch scores:', response.status);
        }
    } catch (error) {
        console.error('❌ Error fetching batch scores:', error);
    }
    
    // Sort classes by name for consistent display
    const sortedClasses = Object.keys(classSummary).sort((a, b) => {
        const classA = getClassNumber(a);
        const classB = getClassNumber(b);
        if (classA !== classB) return classA - classB;
        return a.localeCompare(b);
    });
    
        // Show table and hide loading indicator
        const loadingIndicator = document.getElementById('classStatsLoading');
        const statsTable = document.getElementById('classStatsTable');
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (statsTable) statsTable.style.display = 'table';
        
        // Render class-wise stats table
        const tableBody = document.getElementById('classWiseTableBody');
        if (tableBody) {
            tableBody.innerHTML = sortedClasses
                .filter(className => classSummary[className].total > 0)
                .map(className => {
                    const data = classSummary[className];
                    
                    // Determine attendance rate color class
                    let rateColorClass = 'attendance-low';
                    if (data.rate >= 80) rateColorClass = 'attendance-high';
                    else if (data.rate >= 60) rateColorClass = 'attendance-medium';
                    
                    // Determine score color class
                    let scoreColorClass = 'score-poor';
                    if (data.averageScore >= 80) scoreColorClass = 'score-excellent';
                    else if (data.averageScore >= 60) scoreColorClass = 'score-average';
                    
                    // Debug logging for average score
                    console.log(`Class: ${className}, Average Score: ${data.averageScore}, Valid: ${data.averageScore > 0}, Type: ${typeof data.averageScore}`);
                    
                    // Also log the entire data object for debugging
                    console.log(`Class ${className} data:`, data);
                    
                    return `
                        <tr>
                            <td>${className}</td>
                            <td>${data.total}</td>
                            <td style="color: #27ae60;">${data.present}</td>
                            <td style="color: #e74c3c;">${data.absent}</td>
                            <td class="${rateColorClass}">${data.rate}%</td>
                            <td style="color: #f39c12;">${data.inactive}</td>
                            <td class="${scoreColorClass}">${data.averageScore > 0 ? data.averageScore : 'N/A'}</td>
                            <td style="color: #27ae60;">${data.mustaidCount}</td>
                            <td style="color: #f39c12;">${data.mutawassitCount}</td>
                            <td style="color: #e74c3c;">${data.mujtahidCount}</td>
                        </tr>
                    `;
                }).join('');
        }
        
        console.log('✅ Class-wise stats updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating class-wise stats:', error);
    }
}

let currentReportData = [];
let sortDirection = {};
let columnFilters = {};

function generateAttendanceTrackingCalendar(month = null, year = null) {
    console.log('Generating attendance tracking calendar...');
    
    // Use provided month/year or current values
    const displayMonth = month !== null ? month : currentCalendarMonth;
    const displayYear = year !== null ? year : currentCalendarYear;
    
    console.log('Display date:', displayMonth + 1, displayYear);
    
    // Generate calendar for specified month
    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    console.log('Days in month:', daysInMonth, 'Start day of week:', startDayOfWeek);
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const calendarHTML = `
        <div class="attendance-tracking-section">
            <h3>📅 Attendance Tracking Calendar</h3>
            
            <!-- Month Navigation -->
            <div class="calendar-navigation">
                <button onclick="navigateCalendar(-1)" class="nav-btn" title="Previous Month">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="month-year-display">
                    <select id="monthSelector" onchange="changeCalendarMonth()" class="month-selector">
                        ${monthNames.map((month, index) => 
                            `<option value="${index}" ${index === displayMonth ? 'selected' : ''}>${month}</option>`
                        ).join('')}
                    </select>
                    <input type="number" id="yearSelector" value="${displayYear}" min="2020" max="2030" 
                           onchange="changeCalendarYear()" class="year-selector">
                </div>
                <button onclick="navigateCalendar(1)" class="nav-btn" title="Next Month">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button onclick="goToCurrentMonth()" class="nav-btn today-btn" title="Go to Current Month">
                    <i class="fas fa-calendar-day"></i>
                </button>
            </div>
            
            <div class="calendar-container">
                <div class="calendar-grid">
                    <div class="calendar-header">Sun</div>
                    <div class="calendar-header">Mon</div>
                    <div class="calendar-header">Tue</div>
                    <div class="calendar-header">Wed</div>
                    <div class="calendar-header">Thu</div>
                    <div class="calendar-header">Fri</div>
                    <div class="calendar-header">Sat</div>
                    ${generateCalendarDays(displayYear, displayMonth, startDayOfWeek, daysInMonth)}
                </div>
            </div>
            <div class="calendar-legend">
                <div class="legend-item">
                    <span class="legend-color attendance-taken"></span>
                    <span>Attendance Saved</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color attendance-missed"></span>
                    <span>Attendance NOT Taken</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color holiday-day"></span>
                    <span>Holiday</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color future-day"></span>
                    <span>Future Date</span>
                </div>
                ${academicYearStartDate ? `
                <div class="legend-item">
                    <span class="legend-color before-academic-year"></span>
                    <span>${t('beforeAcademicYear')}</span>
                </div>` : ''}
            </div>
            <div class="attendance-summary" id="attendanceSummary">
                ${generateAttendanceSummary(displayYear, displayMonth)}
            </div>
        </div>
    `;
    
    return calendarHTML;
}


// Function to refresh attendance data from server
async function refreshAttendanceData() {
    try {
        console.log('🔄 Refreshing attendance data from server...');
        const response = await fetch('/api/attendance');
        if (response.ok) {
            const newAttendanceData = await response.json();
            // Update the global attendance object
            Object.assign(attendance, newAttendanceData);
            console.log('✅ Attendance data refreshed successfully');
        } else {
            console.error('❌ Failed to refresh attendance data');
        }
    } catch (error) {
        console.error('❌ Error refreshing attendance data:', error);
    }
}

// Function to update performance metrics (overall average score and tier distribution)
async function updatePerformanceMetrics() {
    try {
        console.log('🔄 Updating performance metrics...');
        
        // Get all active students
        const activeStudents = students.filter(student => student.status === 'active');
        
        if (activeStudents.length === 0) {
            console.log('⚠️ No active students found for performance metrics');
            return;
        }
        
        // Fetch scores for all active students
        const scorePromises = activeStudents.map(async (student) => {
            try {
                const response = await fetch(`/api/student-scores/${student.id}`);
                if (response.ok) {
                    const data = await response.json();
                    return data.score || 0;
                }
                return 0;
            } catch (error) {
                console.error(`❌ Error fetching score for student ${student.id}:`, error);
                return 0;
            }
        });
        
        const scores = await Promise.all(scorePromises);
        const validScores = scores.filter(score => score > 0);
        
        if (validScores.length === 0) {
            console.log('⚠️ No valid scores found for performance metrics');
            return;
        }
        
        // Categorize students into performance tiers
        let mustaidCount = 0;    // ≥80: Excellent (Green)
        let mutawassitCount = 0; // 60-79: Average (Orange)
        let mujtahidCount = 0;   // <60: Needs Improvement (Red)
        
        validScores.forEach(score => {
            if (score >= 80) {
                mustaidCount++;
            } else if (score >= 60) {
                mutawassitCount++;
            } else {
                mujtahidCount++;
            }
        });
        
        // Update DOM elements
        const mustaidElement = document.getElementById('mustaidCount');
        const mutawassitElement = document.getElementById('mutawassitCount');
        const mujtahidElement = document.getElementById('mujtahidCount');
        
        if (mustaidElement) mustaidElement.textContent = mustaidCount;
        if (mutawassitElement) mutawassitElement.textContent = mutawassitCount;
        if (mujtahidElement) mujtahidElement.textContent = mujtahidCount;
        
        console.log('✅ Performance metrics updated successfully:', {
            mustaidCount,
            mutawassitCount,
            mujtahidCount,
            totalStudents: validScores.length
        });
        
    } catch (error) {
        console.error('❌ Error updating performance metrics:', error);
    }
}

// Function to update main dashboard alerts
async function updateMainDashboardAlerts() {
    try {
        console.log('🔄 Updating main dashboard alerts...');
        
        const alertsContainer = document.getElementById('main-dashboard-alerts');
        const alertsContent = document.getElementById('main-alerts-content');
        
        if (!alertsContainer || !alertsContent) {
            console.error('❌ Alert containers not found');
            return;
        }
        
        // Get alert configuration from database with localStorage fallback
        let alertConfig = {
            LOW_SCORE_THRESHOLD: 60,
            CRITICAL_SCORE_THRESHOLD: 50,
            LOW_CLASS_AVERAGE_THRESHOLD: 70
        };
        
        try {
            const response = await fetch('/api/settings/alertConfig');
            if (response.ok) {
                const data = await response.json();
                const savedConfig = JSON.parse(data.value || '{}');
                alertConfig = { ...alertConfig, ...savedConfig };
            } else {
                // Fallback to localStorage
                const saved = localStorage.getItem('alertConfig');
                if (saved) {
                    const savedConfig = JSON.parse(saved);
                    alertConfig = { ...alertConfig, ...savedConfig };
                }
            }
        } catch (error) {
            console.error('Error loading alert config from database:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem('alertConfig');
            if (saved) {
                try {
                    const savedConfig = JSON.parse(saved);
                    alertConfig = { ...alertConfig, ...savedConfig };
                } catch (e) {
                    console.error('Error loading alert config from localStorage:', e);
                }
            }
        }
        
        // Get all active students
        const activeStudents = students.filter(student => student.status === 'active');
        
        if (activeStudents.length === 0) {
            alertsContainer.style.display = 'none';
            return;
        }
        
        const alerts = [];
        
        // Check for students with low scores across all classes
        const lowScoreStudents = [];
        const criticalScoreStudents = [];
        
        // Fetch scores for all active students
        for (const student of activeStudents) {
            try {
                const response = await fetch(`/api/student-scores/${student.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const score = data.score || 0;
                    
                    if (score > 0) {
                        if (score < alertConfig.CRITICAL_SCORE_THRESHOLD) {
                            criticalScoreStudents.push({ ...student, score });
                        } else if (score < alertConfig.LOW_SCORE_THRESHOLD) {
                            lowScoreStudents.push({ ...student, score });
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Error fetching score for student ${student.id}:`, error);
            }
        }
        
        // Add critical score alert
        if (criticalScoreStudents.length > 0) {
            alerts.push({
                type: 'danger',
                icon: 'fas fa-exclamation-triangle',
                title: 'Critical Students',
                message: `${criticalScoreStudents.length} students have scores below ${alertConfig.CRITICAL_SCORE_THRESHOLD}`,
                action: 'View Details',
                students: criticalScoreStudents,
                alertType: 'critical'
            });
        }
        
        // Add low score alert
        if (lowScoreStudents.length > 0) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-user-times',
                title: 'Low Score Students',
                message: `${lowScoreStudents.length} students have scores below ${alertConfig.LOW_SCORE_THRESHOLD}`,
                action: 'View Details',
                students: lowScoreStudents,
                alertType: 'low'
            });
        }
        
        // Check for today's absent students
        const today = getTodayString();
        const todayAttendance = attendance[today] || {};
        
        // Get active students for today
        const activeStudentsForToday = students.filter(student => {
            if (student.status === 'active') {
                return true;
            }
            if (student.status === 'inactive' && student.inactivationDate) {
                const parsedInactivationDate = parseInactivationDate(student.inactivationDate);
                return parsedInactivationDate ? today < parsedInactivationDate : false;
            }
            return false;
        });
        
        const absentStudents = activeStudentsForToday.filter(student => 
            todayAttendance[student.id] && todayAttendance[student.id].status === 'absent'
        );
        
        // Add absent students alert
        if (absentStudents.length > 0) {
            alerts.push({
                type: 'info',
                icon: 'fas fa-user-clock',
                title: 'Today\'s Absent Students',
                message: `${absentStudents.length} students are absent today`,
                action: 'View Details',
                students: absentStudents,
                alertType: 'absent',
                todayAttendance: todayAttendance
            });
        }
        
        // Check for important teacher logs across all classes
        try {
            // Get all unique classes from students
            const allClasses = [...new Set(students.map(student => student.class))];
            const allLogs = [];
            
            // Fetch logs from each class
            for (const className of allClasses) {
                try {
                    const logsResponse = await fetch(`/api/teacher-logs?class=${encodeURIComponent(className)}`);
                    if (logsResponse.ok) {
                        const classLogs = await logsResponse.json();
                        allLogs.push(...classLogs);
                    }
                } catch (classError) {
                    console.error(`❌ Error fetching logs for class ${className}:`, classError);
                }
            }
            
            // Filter for important logs
            const importantLogs = allLogs.filter(log => log.is_important && !log.needs_followup);
            const followupLogs = allLogs.filter(log => log.needs_followup);
            
            // Add important logs alert
            if (importantLogs.length > 0) {
                alerts.push({
                    type: 'danger',
                    icon: 'fas fa-exclamation-circle',
                    title: 'Important Teacher Logs',
                    message: `${importantLogs.length} important logs require attention`,
                    action: 'View Logs',
                    logs: importantLogs,
                    alertType: 'important_logs'
                });
            }
            
            // Add follow-up required logs alert
            if (followupLogs.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-tasks',
                    title: 'Logs Needing Follow-up',
                    message: `${followupLogs.length} logs require follow-up action`,
                    action: 'View Logs',
                    logs: followupLogs,
                    alertType: 'followup_logs'
                });
            }
        } catch (error) {
            console.error('❌ Error fetching teacher logs for alerts:', error);
        }
        
        // Render alerts
        if (alerts.length === 0) {
            alertsContainer.style.display = 'none';
        } else {
            alertsContainer.style.display = 'block';
            alertsContent.innerHTML = alerts.map((alert, index) => `
                <div class="alert-item ${alert.type}">
                    <div class="alert-content">
                        <i class="alert-icon ${alert.icon}"></i>
                        <div class="alert-text">
                            <div class="alert-title">${alert.title}</div>
                            <div class="alert-message">${alert.message}</div>
                        </div>
                    </div>
                    <div class="alert-actions">
                        <button class="alert-btn primary" onclick="toggleAlertDetails(${index})">
                            ${alert.action}
                        </button>
                    </div>
                    <div class="alert-details" id="alert-details-${index}" style="display: none;">
                        <div class="alert-details-content">
                            ${renderAlertDetails(alert)}
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Store alerts data globally for access
            window.currentAlerts = alerts;
        }
        
        console.log('✅ Main dashboard alerts updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating main dashboard alerts:', error);
    }
}

// Function to render alert details
function renderAlertDetails(alert) {
    if (alert.alertType === 'critical' || alert.alertType === 'low') {
        const color = alert.alertType === 'critical' ? '#ef4444' : '#f59e0b';
        return `
            <div class="alert-students-table">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Roll</th>
                            <th class="px-4 py-2 text-left">Name</th>
                            <th class="px-4 py-2 text-left">Class</th>
                            <th class="px-4 py-2 text-center">Score</th>
                            <th class="px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alert.students.map(student => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="px-4 py-2">${student.rollNumber || 'N/A'}</td>
                                <td class="px-4 py-2">${student.name} বিন ${student.fatherName}</td>
                                <td class="px-4 py-2">${student.class || 'N/A'}</td>
                                <td class="px-4 py-2 text-center">
                                    <span class="font-bold" style="color: ${color};">${student.score}</span>
                                </td>
                                <td class="px-4 py-2 text-center">
                                    <button onclick="window.showStudentProfile('${student.id}')" class="text-blue-600 hover:text-blue-800 underline text-sm">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (alert.alertType === 'absent') {
        return `
            <div class="alert-students-table">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Roll</th>
                            <th class="px-4 py-2 text-left">Name</th>
                            <th class="px-4 py-2 text-left">Class</th>
                            <th class="px-4 py-2 text-left">Reason</th>
                            <th class="px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alert.students.map(student => {
                            const attendance = alert.todayAttendance[student.id];
                            const reason = attendance && attendance.reason ? attendance.reason : 'No reason provided';
                            return `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="px-4 py-2">${student.rollNumber || 'N/A'}</td>
                                    <td class="px-4 py-2">${student.name} বিন ${student.fatherName}</td>
                                    <td class="px-4 py-2">${student.class || 'N/A'}</td>
                                    <td class="px-4 py-2 text-gray-600">${reason}</td>
                                    <td class="px-4 py-2 text-center">
                                        <button onclick="window.showStudentProfile('${student.id}')" class="text-blue-600 hover:text-blue-800 underline text-sm">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (alert.alertType === 'important_logs' || alert.alertType === 'followup_logs') {
        const color = alert.alertType === 'important_logs' ? '#ef4444' : '#f59e0b';
        const bgColor = alert.alertType === 'important_logs' ? '#fef2f2' : '#fffbeb';
        const borderColor = alert.alertType === 'important_logs' ? '#fecaca' : '#fed7aa';
        
        return `
            <div class="alert-logs-table">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Date</th>
                            <th class="px-4 py-2 text-left">Student</th>
                            <th class="px-4 py-2 text-left">Details</th>
                            <th class="px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alert.logs.map(log => {
                            const logDate = new Date(log.created_at).toLocaleDateString('bn-BD');
                            const logClass = log.class_name || 'N/A';
                            const logDetails = log.details ? (log.details.length > 60 ? log.details.substring(0, 60) + '...' : log.details) : 'No details';
                            
                            // Get student name and roll number
                            let studentInfo = 'Class Log';
                            if (log.student_id) {
                                // Find student in the students array
                                const student = students.find(s => s.id === log.student_id);
                                if (student) {
                                    const rollNumber = student.rollNumber || student.roll || 'N/A';
                                    studentInfo = `${student.name} (রোল: ${rollNumber})`;
                                } else {
                                    studentInfo = `Student ID: ${log.student_id}`;
                                }
                            }
                            
                            return `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="px-4 py-2 text-gray-600">${logDate}</td>
                                    <td class="px-4 py-2">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            ${studentInfo}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2 text-gray-700">${logDetails}</td>
                                    <td class="px-4 py-2 text-center">
                                        ${log.student_id ? 
                                            `<button onclick="showStudentLogsModal('${log.student_id}', '${studentInfo.replace(/'/g, "\\'")}', '${logClass}')" class="text-blue-600 hover:text-blue-800 underline text-sm">
                                                View Student Logs
                                            </button>` :
                                            `<button onclick="showTeachersCornerForClass('${logClass}')" class="text-blue-600 hover:text-blue-800 underline text-sm">
                                                View in Teachers Corner
                                            </button>`
                                        }
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    return '';
}

// Function to toggle alert details
function toggleAlertDetails(index) {
    const detailsElement = document.getElementById(`alert-details-${index}`);
    const button = detailsElement.previousElementSibling.querySelector('.alert-btn');
    
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
        button.textContent = 'Hide Details';
        button.classList.remove('primary');
        button.classList.add('secondary');
    } else {
        detailsElement.style.display = 'none';
        button.textContent = 'View Details';
        button.classList.remove('secondary');
        button.classList.add('primary');
    }
}

// Function to show Teachers Corner for a specific class
function showTeachersCornerForClass(className) {
    // Navigate to Teachers Corner section
    if (typeof showSection === 'function') {
        showSection('teachers-corner-section');
    }
    
    // If Teachers Corner is available, show the specific class dashboard
    if (typeof window.showClassDashboard === 'function') {
        // Small delay to ensure the section is visible
        setTimeout(() => {
            window.showClassDashboard(className);
        }, 100);
    }
}

// Function to show student logs in a modal
async function showStudentLogsModal(studentId, studentInfo, className) {
    try {
        // Fetch student's logs from API
        const response = await fetch(`/api/teacher-logs?class=${encodeURIComponent(className)}&student_id=${studentId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch student logs');
        }
        
        const studentLogs = await response.json();
        
        // Find student details
        const student = students.find(s => s.id === studentId);
        const studentName = student ? student.name : 'Unknown Student';
        const rollNumber = student ? (student.rollNumber || student.roll || 'N/A') : 'N/A';
        
        // Create modal HTML
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
                    <!-- Modal Header -->
                    <div class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-semibold">${studentName} - Student Logs</h3>
                            <p class="text-blue-100 text-sm">রোল: ${rollNumber} | শ্রেণী: ${className}</p>
                        </div>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-blue-200 text-2xl font-bold">
                            ×
                        </button>
                    </div>
                    
                    <!-- Modal Content -->
                    <div class="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                        ${studentLogs.length === 0 ? `
                            <div class="text-center py-8">
                                <i class="fas fa-clipboard-list text-4xl text-gray-400 mb-4"></i>
                                <p class="text-gray-600 text-lg">No logs found for this student</p>
                                <p class="text-gray-500 text-sm mt-2">Logs will appear here when teachers add notes for this student.</p>
                            </div>
                        ` : `
                            <div class="space-y-4">
                                ${studentLogs.map(log => {
                                    const logDate = new Date(log.created_at).toLocaleDateString('bn-BD');
                                    const logTime = new Date(log.created_at).toLocaleTimeString('bn-BD', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    });
                                    const logType = log.log_type || 'General';
                                    const isImportant = log.is_important;
                                    const needsFollowup = log.needs_followup;
                                    
                                    return `
                                        <div class="border border-gray-200 rounded-lg p-4 ${isImportant ? 'border-l-4 border-l-red-500 bg-red-50' : 'bg-gray-50'}">
                                            <div class="flex justify-between items-start mb-3">
                                                <div class="flex items-center gap-2">
                                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        ${logType}
                                                    </span>
                                                    ${isImportant ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">গুরুত্বপূর্ণ</span>' : ''}
                                                    ${needsFollowup ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">অনুসরণ প্রয়োজন</span>' : ''}
                                                </div>
                                                <div class="text-right">
                                                    <div class="text-sm font-medium text-gray-900">${logDate}</div>
                                                    <div class="text-xs text-gray-500">${logTime}</div>
                                                </div>
                                            </div>
                                            <div class="text-gray-700 leading-relaxed">
                                                ${log.details || 'No details provided'}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </div>
                    
                    <!-- Modal Footer -->
                    <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                        <button onclick="showTeachersCornerForClass('${className}')" class="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50">
                            <i class="fas fa-external-link-alt mr-2"></i>Open in Teachers Corner
                        </button>
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('❌ Error showing student logs modal:', error);
        
        // Show error modal
        const errorModal = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="this.remove()">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onclick="event.stopPropagation()">
                    <div class="p-6 text-center">
                        <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Logs</h3>
                        <p class="text-gray-600 mb-4">Failed to load student logs. Please try again.</p>
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorModal);
    }
}

// Function to show low score students modal
function showLowScoreStudents(students, type) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const title = type === 'critical' ? 'Critical Score Students' : 'Low Score Students';
    const color = type === 'critical' ? '#ef4444' : '#f59e0b';
    
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold" style="color: ${color};">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Roll</th>
                            <th class="px-4 py-2 text-left">Name</th>
                            <th class="px-4 py-2 text-left">Class</th>
                            <th class="px-4 py-2 text-center">Score</th>
                            <th class="px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => `
                            <tr class="border-b hover:bg-gray-50">
                                <td class="px-4 py-2">${student.rollNumber || 'N/A'}</td>
                                <td class="px-4 py-2">${student.name} বিন ${student.fatherName}</td>
                                <td class="px-4 py-2">${student.class || 'N/A'}</td>
                                <td class="px-4 py-2 text-center">
                                    <span class="font-bold" style="color: ${color};">${student.score}</span>
                                </td>
                                <td class="px-4 py-2 text-center">
                                    <button onclick="window.showStudentProfile('${student.id}')" class="text-blue-600 hover:text-blue-800 underline">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Function to show absent students modal
function showAbsentStudents(students, todayAttendance) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold text-blue-600">Today's Absent Students</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">Roll</th>
                            <th class="px-4 py-2 text-left">Name</th>
                            <th class="px-4 py-2 text-left">Class</th>
                            <th class="px-4 py-2 text-left">Reason</th>
                            <th class="px-4 py-2 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(student => {
                            const attendance = todayAttendance[student.id];
                            const reason = attendance && attendance.reason ? attendance.reason : 'No reason provided';
                            return `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="px-4 py-2">${student.rollNumber || 'N/A'}</td>
                                    <td class="px-4 py-2">${student.name} বিন ${student.fatherName}</td>
                                    <td class="px-4 py-2">${student.class || 'N/A'}</td>
                                    <td class="px-4 py-2 text-gray-600">${reason}</td>
                                    <td class="px-4 py-2 text-center">
                                        <button onclick="window.showStudentProfile('${student.id}')" class="text-blue-600 hover:text-blue-800 underline">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

export { currentReportData, sortDirection, columnFilters, generateAttendanceTrackingCalendar, updateClassWiseStats, updateDashboard, updateTodayOverview, refreshAttendanceData, updatePerformanceMetrics, updateMainDashboardAlerts, showLowScoreStudents, showAbsentStudents, toggleAlertDetails, renderAlertDetails, showTeachersCornerForClass, showStudentLogsModal }
