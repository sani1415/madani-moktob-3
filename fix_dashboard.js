// Complete Dashboard Fix - Force refresh and recalculate everything
function forceUpdateDashboard() {
    console.log('=== FORCE DASHBOARD UPDATE ===');
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};
    
    // Count with explicit logging
    let presentCount = 0;
    let absentCount = 0;
    
    console.log('Students array length:', students.length);
    console.log('Today attendance object:', todayAttendance);
    
    for (let studentId in todayAttendance) {
        const record = todayAttendance[studentId];
        console.log(`Student ${studentId}:`, record);
        
        if (record && record.status === 'present') {
            presentCount++;
        } else if (record && record.status === 'absent') {
            absentCount++;
        }
    }
    
    // Force DOM update
    document.getElementById('totalStudents').innerHTML = students.length;
    document.getElementById('presentToday').innerHTML = presentCount;
    document.getElementById('absentToday').innerHTML = absentCount;
    
    const rate = presentCount + absentCount === 0 ? 0 : Math.round((presentCount / (presentCount + absentCount)) * 100);
    document.getElementById('attendanceRate').innerHTML = rate + '%';
    
    console.log('FINAL COUNTS:', { total: students.length, present: presentCount, absent: absentCount, rate: rate + '%' });
}

// Call this after any attendance change
window.forceUpdateDashboard = forceUpdateDashboard;