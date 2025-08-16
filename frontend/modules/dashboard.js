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
    
    // Update today's overview
    updateTodayOverview();
    
    // Update class-wise information
    updateClassWiseStats();
    
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

function updateClassWiseStats() {
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
                inactive: 0, // <-- Add inactive counter
                rate: 0
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
                    rate: 0
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
    
    // Sort classes by name for consistent display
    const sortedClasses = Object.keys(classSummary).sort((a, b) => {
        const classA = getClassNumber(a);
        const classB = getClassNumber(b);
        if (classA !== classB) return classA - classB;
        return a.localeCompare(b);
    });
    
    // Render class-wise stats
    const classWiseGrid = document.getElementById('classWiseGrid');
    if (classWiseGrid) {
        // Only show classes that have at least one ACTIVE student
        classWiseGrid.innerHTML = sortedClasses
            .filter(className => classSummary[className].total > 0) 
            .map(className => {
                const data = classSummary[className];
                return `
                    <div class="class-stat-card">
                        <h4>${className}</h4>
                        <div class="class-stats">
                            <span>${t('totalStudentsLabel')} (Active):</span>
                            <span class="stat-number">${data.total}</span>
                        </div>
                        <div class="class-stats">
                            <span>${t('presentLabel')}:</span>
                            <span class="stat-number" style="color: #27ae60;">${data.present}</span>
                        </div>
                        <div class="class-stats">
                            <span>${t('absentLabel')}:</span>
                            <span class="stat-number" style="color: #e74c3c;">${data.absent}</span>
                        </div>
                        <div class="class-stats">
                            <span>${t('inactiveStudents')}:</span>
                            <span class="stat-number" style="color: #6c757d;">${data.inactive}</span>
                        </div>
                        <div class="class-attendance-rate">${data.rate}% ${t('attendanceLabel')}</div>
                    </div>
                `;
            }).join('');
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

export { currentReportData, sortDirection, columnFilters, generateAttendanceTrackingCalendar, updateClassWiseStats, updateDashboard, updateTodayOverview, refreshAttendanceData }
