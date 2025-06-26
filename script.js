
// Application State
let students = JSON.parse(localStorage.getItem('madaniMaktabStudents')) || [];
let classes = JSON.parse(localStorage.getItem('madaniMaktabClasses')) || ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
let attendance = JSON.parse(localStorage.getItem('madaniMaktabAttendance')) || {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateClassDropdowns();
    updateDashboard();
    loadTodayAttendance();
    displayClasses();
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    document.getElementById('reportStartDate').value = today;
    document.getElementById('reportEndDate').value = today;
    
    // Initialize attendance for today if not exists
    if (!attendance[today]) {
        initializeTodayAttendance();
    }
    
    // Add sample data if no students exist (except the one user registered)
    if (students.length <= 1) {
        addSampleData();
    }
}

// Sample Data Generation
function addSampleData() {
    const sampleStudents = [
        // Class 1 (ID 101, 102, 103)
        {
            id: '101',
            name: 'মোহাম্মদ আহমেদ',
            fatherName: 'আব্দুল হামিদ',
            address: 'বাড্ডা',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01612345677',
            class: 'Class 1',
            idNumber: '101',
            registrationDate: '2024-01-14'
        },
        {
            id: '102',
            name: 'আব্দুল রহমান',
            fatherName: 'মোহাম্মদ আলী',
            address: 'মিরপুর ১০',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01712345678',
            class: 'Class 1',
            idNumber: '102',
            registrationDate: '2024-01-15'
        },
        {
            id: '103',
            name: 'ইউসুফ হাসান',
            fatherName: 'আব্দুল করিম',
            address: 'উত্তরা সেক্টর ৭',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01812345679',
            class: 'Class 1',
            idNumber: '103',
            registrationDate: '2024-01-16'
        },
        // Class 2
        {
            id: '201',
            name: 'মোহাম্মদ হাসান',
            fatherName: 'আবু বকর',
            address: 'ধানমন্ডি ১৫',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01912345680',
            class: 'Class 2',
            idNumber: '201',
            registrationDate: '2024-01-17'
        },
        {
            id: '202',
            name: 'আব্দুল্লাহ সাইফ',
            fatherName: 'মোহাম্মদ ইউসুফ',
            address: 'গুলশান ২',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01612345681',
            class: 'Class 2',
            idNumber: '202',
            registrationDate: '2024-01-18'
        },
        {
            id: '203',
            name: 'উমর ফারুক',
            fatherName: 'আব্দুর রহমান',
            address: 'বনানী',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01512345682',
            class: 'Class 2',
            idNumber: '203',
            registrationDate: '2024-01-19'
        },
        // Class 3
        {
            id: '301',
            name: 'মোহাম্মদ সালাহউদ্দিন',
            fatherName: 'মোহাম্মদ সালাম',
            address: 'মোহাম্মদপুর',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01412345683',
            class: 'Class 3',
            idNumber: '301',
            registrationDate: '2024-01-20'
        },
        {
            id: '302',
            name: 'আব্দুল্লাহ আল মামুন',
            fatherName: 'মোহাম্মদ নূর',
            address: 'যাত্রাবাড়ী',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01312345684',
            class: 'Class 3',
            idNumber: '302',
            registrationDate: '2024-01-21'
        },
        {
            id: '303',
            name: 'ইসমাইল হোসেন',
            fatherName: 'আব্দুল মজিদ',
            address: 'রমনা',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01212345685',
            class: 'Class 3',
            idNumber: '303',
            registrationDate: '2024-01-22'
        },
        // Class 4
        {
            id: '401',
            name: 'মোহাম্মদ ইব্রাহিম',
            fatherName: 'আবু তালিব',
            address: 'কল্যাণপুর',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01112345686',
            class: 'Class 4',
            idNumber: '401',
            registrationDate: '2024-01-23'
        },
        {
            id: '402',
            name: 'আহমাদুল হক',
            fatherName: 'মোহাম্মদ জামাল',
            address: 'পল্টন',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01712345687',
            class: 'Class 4',
            idNumber: '402',
            registrationDate: '2024-01-24'
        },
        {
            id: '403',
            name: 'আব্দুস সামাদ',
            fatherName: 'মোহাম্মদ কবির',
            address: 'নিউমার্কেট',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01812345688',
            class: 'Class 4',
            idNumber: '403',
            registrationDate: '2024-01-25'
        },
        // Class 5
        {
            id: '501',
            name: 'হাফেজ আবু বকর',
            fatherName: 'মোলানা আব্দুল কাদের',
            address: 'ওয়ারী',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01912345689',
            class: 'Class 5',
            idNumber: '501',
            registrationDate: '2024-01-26'
        },
        {
            id: '502',
            name: 'মোহাম্মদ তাহের',
            fatherName: 'হাজী আব্দুর রশিদ',
            address: 'সূত্রাপুর',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01612345690',
            class: 'Class 5',
            idNumber: '502',
            registrationDate: '2024-01-27'
        },
        {
            id: '503',
            name: 'রাশিদুল ইসলাম',
            fatherName: 'প্রফেসর আব্দুল লতিফ',
            address: 'আজিমপুর',
            district: 'ঢাকা',
            upazila: 'ঢাকা সদর',
            mobile: '01512345691',
            class: 'Class 5',
            idNumber: '503',
            registrationDate: '2024-01-28'
        }
    ];
    
    // Only add students that don't already exist
    sampleStudents.forEach(sampleStudent => {
        if (!students.some(student => student.idNumber === sampleStudent.idNumber)) {
            students.push(sampleStudent);
        }
    });
    
    // Initialize attendance for all new students
    const today = new Date().toISOString().split('T')[0];
    if (!attendance[today]) {
        attendance[today] = {};
    }
    
    students.forEach(student => {
        if (!attendance[today][student.id]) {
            attendance[today][student.id] = {
                status: 'present',
                reason: ''
            };
        }
    });
    
    saveData();
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const navList = document.getElementById('navList');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    
    navList.classList.toggle('active');
    
    // Change icon
    if (navList.classList.contains('active')) {
        toggleButton.className = 'fas fa-times';
    } else {
        toggleButton.className = 'fas fa-bars';
    }
}

// Navigation Functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
    
    // Close mobile menu on mobile devices
    const navList = document.getElementById('navList');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    if (window.innerWidth <= 768) {
        navList.classList.remove('active');
        toggleButton.className = 'fas fa-bars';
    }
    
    // Update section content with translations
    updateSectionContent(sectionId);
    
    // Update content based on section
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'attendance') {
        loadAttendanceForDate();
    } else if (sectionId === 'reports') {
        updateReportClassDropdown();
    }
}

// Student Registration Functions
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    registerStudent();
});

function registerStudent() {
    const formData = {
        id: Date.now().toString(),
        name: document.getElementById('studentName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        address: document.getElementById('address').value.trim(),
        district: document.getElementById('district').value.trim(),
        upazila: document.getElementById('upazila').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        class: document.getElementById('studentClass').value,
        idNumber: document.getElementById('idNumber').value.trim(),
        registrationDate: new Date().toISOString().split('T')[0]
    };
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.address || 
        !formData.district || !formData.upazila || !formData.mobile || 
        !formData.class || !formData.idNumber) {
        showModal(t('error'), t('fillAllFields'));
        return;
    }
    
    // Check for duplicate ID number
    if (students.some(student => student.idNumber === formData.idNumber)) {
        showModal(t('error'), t('duplicateId'));
        return;
    }
    
    // Check for duplicate mobile number
    if (students.some(student => student.mobile === formData.mobile)) {
        showModal(t('error'), t('duplicateMobile'));
        return;
    }
    
    // Add student
    students.push(formData);
    saveData();
    
    // Reset form
    document.getElementById('studentForm').reset();
    
    // Initialize attendance for this student for today
    const today = new Date().toISOString().split('T')[0];
    if (!attendance[today]) {
        attendance[today] = {};
    }
    attendance[today][formData.id] = {
        status: 'present',
        reason: ''
    };
    
    showModal(t('success'), `${formData.name} ${t('studentRegistered')}`);
    updateDashboard();
}

// Class Management Functions
function updateClassDropdowns() {
    const dropdowns = ['studentClass', 'classFilter', 'reportClass'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Save current value
            const currentValue = dropdown.value;
            
            // Clear existing options (except first option for some dropdowns)
            if (dropdownId === 'studentClass') {
                dropdown.innerHTML = '<option value="">Select Class</option>';
            } else {
                dropdown.innerHTML = '<option value="">All Classes</option>';
            }
            
            // Add class options
            classes.forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                dropdown.appendChild(option);
            });
            
            // Restore previous value if it still exists
            if (currentValue && classes.includes(currentValue)) {
                dropdown.value = currentValue;
            }
        }
    });
}

function addClass() {
    const newClassName = document.getElementById('newClassName').value.trim();
    
    if (!newClassName) {
        showModal(t('error'), t('enterClassName'));
        return;
    }
    
    if (classes.includes(newClassName)) {
        showModal(t('error'), t('classExists'));
        return;
    }
    
    classes.push(newClassName);
    saveData();
    updateClassDropdowns();
    displayClasses();
    document.getElementById('newClassName').value = '';
    showModal(t('success'), `"${newClassName}" ${t('classAdded')}`);
}

function removeClass(className) {
    if (confirm(`${t('confirmDeleteClass')} "${className}"? ${t('cannotUndo')}`)) {
        classes = classes.filter(c => c !== className);
        
        // Update students who were in this class
        students.forEach(student => {
            if (student.class === className) {
                student.class = '';
            }
        });
        
        saveData();
        updateClassDropdowns();
        displayClasses();
        showModal(t('success'), `"${className}" ${t('classDeleted')}`);
    }
}

function displayClasses() {
    const classesList = document.getElementById('classesList');
    
    if (classes.length === 0) {
        classesList.innerHTML = `<p>${t('noClassesAdded')}</p>`;
        return;
    }
    
    classesList.innerHTML = classes.map(className => `
        <div class="class-item">
            <span>${className}</span>
            <button onclick="removeClass('${className}')" class="btn btn-danger btn-small">
                <i class="fas fa-trash"></i> ${t('delete')}
            </button>
        </div>
    `).join('');
}

// Attendance Functions
function initializeTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (!attendance[today]) {
        attendance[today] = {};
    }
    
    students.forEach(student => {
        if (!attendance[today][student.id]) {
            // Check if student was absent yesterday
            let defaultStatus = 'present';
            if (attendance[yesterday] && attendance[yesterday][student.id]) {
                defaultStatus = attendance[yesterday][student.id].status;
            }
            
            attendance[today][student.id] = {
                status: defaultStatus,
                reason: defaultStatus === 'absent' ? (attendance[yesterday][student.id]?.reason || '') : ''
            };
        }
    });
    
    saveData();
}

function loadTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    loadAttendanceForDate();
}

function loadAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const classFilter = document.getElementById('classFilter').value;
    
    if (!selectedDate) {
        document.getElementById('attendanceList').innerHTML = `<p>${t('pleaseSelectDate')}</p>`;
        return;
    }
    
    // Initialize attendance for the selected date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
        students.forEach(student => {
            attendance[selectedDate][student.id] = {
                status: 'present',
                reason: ''
            };
        });
        saveData();
    }
    
    // Filter students by class if selected
    let filteredStudents = students;
    if (classFilter) {
        filteredStudents = students.filter(student => student.class === classFilter);
    }
    
    if (filteredStudents.length === 0) {
        document.getElementById('attendanceList').innerHTML = `<p>${t('noStudentsFound')}</p>`;
        return;
    }
    
    const attendanceHTML = filteredStudents.map(student => {
        const studentAttendance = attendance[selectedDate][student.id] || { status: 'present', reason: '' };
        const isAbsent = studentAttendance.status === 'absent';
        
        return `
            <div class="student-row" data-student-id="${student.id}">
                <div class="student-info">
                    <h4>${student.name}</h4>
                    <p>ID: ${student.idNumber} | Class: ${student.class} | Father: ${student.fatherName}</p>
                </div>
                <div class="attendance-toggle">
                    <span class="text-success">${t('present')}</span>
                    <div class="toggle-switch ${isAbsent ? 'absent' : ''}" 
                         onclick="toggleAttendance('${student.id}', '${selectedDate}')"></div>
                    <span class="text-danger">${t('absent')}</span>
                </div>
                ${isAbsent ? `
                    <div class="absence-reason">
                        <input type="text" placeholder="${t('reasonForAbsence')}" 
                               value="${studentAttendance.reason}"
                               onchange="updateAbsenceReason('${student.id}', '${selectedDate}', this.value)">
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    document.getElementById('attendanceList').innerHTML = attendanceHTML;
}

function toggleAttendance(studentId, date) {
    if (!attendance[date]) {
        attendance[date] = {};
    }
    
    if (!attendance[date][studentId]) {
        attendance[date][studentId] = { status: 'present', reason: '' };
    }
    
    const currentStatus = attendance[date][studentId].status;
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    
    attendance[date][studentId].status = newStatus;
    
    if (newStatus === 'present') {
        attendance[date][studentId].reason = '';
    }
    
    saveData();
    loadAttendanceForDate();
    updateDashboard();
}

function updateAbsenceReason(studentId, date, reason) {
    if (!attendance[date]) {
        attendance[date] = {};
    }
    
    if (!attendance[date][studentId]) {
        attendance[date][studentId] = { status: 'absent', reason: '' };
    }
    
    attendance[date][studentId].reason = reason;
    saveData();
}

function saveAttendance() {
    saveData();
    showModal(t('success'), t('attendanceSaved'));
    updateDashboard();
}

// Event listener for date change
document.getElementById('attendanceDate').addEventListener('change', loadAttendanceForDate);
document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);

// Dashboard Functions
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const totalStudents = students.length;
    
    document.getElementById('totalStudents').textContent = totalStudents;
    
    if (totalStudents === 0) {
        document.getElementById('presentToday').textContent = '0';
        document.getElementById('absentToday').textContent = '0';
        document.getElementById('attendanceRate').textContent = '100%';
        document.getElementById('todayOverview').innerHTML = '<p>No students registered yet.</p>';
        return;
    }
    
    let presentCount = 0;
    let absentCount = 0;
    
    if (attendance[today]) {
        students.forEach(student => {
            const studentAttendance = attendance[today][student.id];
            if (studentAttendance && studentAttendance.status === 'absent') {
                absentCount++;
            } else {
                presentCount++;
            }
        });
    } else {
        presentCount = totalStudents;
    }
    
    const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100;
    
    document.getElementById('presentToday').textContent = presentCount;
    document.getElementById('absentToday').textContent = absentCount;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    
    // Update today's overview
    updateTodayOverview(today, presentCount, absentCount);
}

function updateTodayOverview(date, presentCount, absentCount) {
    const overview = document.getElementById('todayOverview');
    
    if (!attendance[date] || students.length === 0) {
        overview.innerHTML = `<p>${t('noAttendanceDataAvailable')}</p>`;
        return;
    }
    
    const absentStudents = students.filter(student => {
        const studentAttendance = attendance[date][student.id];
        return studentAttendance && studentAttendance.status === 'absent';
    });
    
    let overviewHTML = `
        <div class="overview-stats">
            <p><strong>${t('present')}:</strong> <span class="text-success">${presentCount} ${t('totalStudents').toLowerCase()}</span></p>
            <p><strong>${t('absent')}:</strong> <span class="text-danger">${absentCount} ${t('totalStudents').toLowerCase()}</span></p>
        </div>
    `;
    
    if (absentStudents.length > 0) {
        overviewHTML += `
            <div class="absent-list">
                <h4>${t('absentStudents')}</h4>
                <ul>
                    ${absentStudents.map(student => {
                        const reason = attendance[date][student.id].reason || t('noReasonProvided');
                        return `<li><strong>${student.name}</strong> (${student.class}) - ${reason}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    overview.innerHTML = overviewHTML;
}

// Reports Functions
function updateReportClassDropdown() {
    updateClassDropdowns();
}

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const selectedClass = document.getElementById('reportClass').value;
    
    if (!startDate || !endDate) {
        showModal(t('error'), t('selectBothDates'));
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showModal(t('error'), t('startDateAfterEnd'));
        return;
    }
    
    // Filter students by class if selected
    let filteredStudents = students;
    if (selectedClass) {
        filteredStudents = students.filter(student => student.class === selectedClass);
    }
    
    if (filteredStudents.length === 0) {
        document.getElementById('reportResults').innerHTML = `<p>${t('noStudentsFound')}</p>`;
        return;
    }
    
    // Generate date range
    const dates = getDateRange(startDate, endDate);
    
    // Build report table
    let reportHTML = `
        <h3>${t('attendanceReport')}</h3>
        <p><strong>${t('period')}</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</p>
        <p><strong>${t('class')}:</strong> ${selectedClass || t('allClasses')}</p>
        <div style="overflow-x: auto;">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${t('studentNameCol')}</th>
                        <th>${t('classCol')}</th>
                        <th>${t('idNumberCol')}</th>
                        ${dates.map(date => `<th>${formatDateShort(date)}</th>`).join('')}
                        <th>${t('presentDays')}</th>
                        <th>${t('absentDays')}</th>
                        <th>${t('attendancePercent')}</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredStudents.forEach(student => {
        let presentDays = 0;
        let absentDays = 0;
        let attendanceRow = '';
        
        dates.forEach(date => {
            let status = 'present';
            if (attendance[date] && attendance[date][student.id]) {
                status = attendance[date][student.id].status;
            }
            
            if (status === 'present') {
                presentDays++;
                attendanceRow += '<td><span class="status-present">P</span></td>';
            } else {
                absentDays++;
                const reason = attendance[date][student.id]?.reason || '';
                attendanceRow += `<td><span class="status-absent" title="${reason}">A</span></td>`;
            }
        });
        
        const totalDays = dates.length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
        
        reportHTML += `
            <tr>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.idNumber}</td>
                ${attendanceRow}
                <td class="text-success">${presentDays}</td>
                <td class="text-danger">${absentDays}</td>
                <td>${attendancePercentage}%</td>
            </tr>
        `;
    });
    
    reportHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('reportResults').innerHTML = reportHTML;
}

// Utility Functions
function getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateShort(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Data Management Functions
function saveData() {
    localStorage.setItem('madaniMaktabStudents', JSON.stringify(students));
    localStorage.setItem('madaniMaktabClasses', JSON.stringify(classes));
    localStorage.setItem('madaniMaktabAttendance', JSON.stringify(attendance));
}

// Modal Functions
function showModal(title, message) {
    document.getElementById('modalBody').innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="closeModal()" class="btn btn-primary">${t('ok')}</button>
    `;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
}

// Export/Import Functions (for future enhancement)
function exportData() {
    const data = {
        students: students,
        classes: classes,
        attendance: attendance,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `madani_maktab_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Initialize on page load
window.addEventListener('load', function() {
    // Auto-save every 5 minutes
    setInterval(saveData, 5 * 60 * 1000);
});
