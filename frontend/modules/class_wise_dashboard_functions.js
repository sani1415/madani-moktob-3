function updateClassWiseStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};
    
    // Group students by class
    const classSummary = {};
    
    // First, create entries for all classes that actually have students
    students.forEach(student => {
        if (student.class && !classSummary[student.class]) {
            classSummary[student.class] = {
                total: 0,
                present: 0,
                absent: 0,
                rate: 0
            };
        }
    });
    
    // Also add predefined classes (in case they have no students yet)
    classes.forEach(className => {
        if (!classSummary[className]) {
        classSummary[className] = {
            total: 0,
            present: 0,
            absent: 0,
            rate: 0
        };
        }
    });
    
    // Count students in each class
    students.forEach(student => {
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
    
    // Calculate rates
    Object.keys(classSummary).forEach(className => {
        const classData = classSummary[className];
        if (classData.total > 0) {
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
        classWiseGrid.innerHTML = sortedClasses
            .filter(className => classSummary[className].total > 0) // Only show classes with students
            .map(className => {
                const data = classSummary[className];
                return `
                    <div class="class-stat-card">
                        <h4>${className}</h4>
                        <div class="class-stats">
                            <span>${t('totalStudentsLabel')}:</span>
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
                        <div class="class-attendance-rate">${data.rate}% ${t('attendanceLabel')}</div>
                    </div>
                `;
            }).join('');
    }
}

// expose functions globally
Object.assign(window, { updateClassWiseStats });
