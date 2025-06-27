// Application State
let students = JSON.parse(localStorage.getItem('madaniMaktabStudents')) || [];
let classes = JSON.parse(localStorage.getItem('madaniMaktabClasses')) || ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
let attendance = JSON.parse(localStorage.getItem('madaniMaktabAttendance')) || {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
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
    
    // Listen for date changes
    document.getElementById('attendanceDate').addEventListener('change', loadAttendanceForDate);
    document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);
}

// Sample Data Generation - Empty by default
function addSampleData() {
    // No sample data added unless explicitly requested
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
    
    // Update content based on section
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'attendance') {
        loadAttendanceForDate();
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
    showModal(t('success'), `${newClassName} ${t('classAdded')}`);
}

function deleteClass(className) {
    if (confirm(`${t('confirmDeleteClass')} "${className}"? ${t('cannotUndo')}`)) {
        classes = classes.filter(cls => cls !== className);
        
        // Remove students from this class
        students = students.filter(student => student.class !== className);
        
        saveData();
        updateClassDropdowns();
        displayClasses();
        updateDashboard();
        
        showModal(t('success'), `${className} ${t('classDeleted')}`);
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
            <span class="class-name">${className}</span>
            <button onclick="deleteClass('${className}')" class="btn btn-danger btn-small">
                <i class="fas fa-trash"></i> ${t('delete')}
            </button>
        </div>
    `).join('');
}

// Dashboard Functions
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};
    
    // Update stats
    document.getElementById('totalStudents').textContent = students.length;
    
    const presentCount = Object.values(todayAttendance).filter(att => att.status === 'present').length;
    const absentCount = Object.values(todayAttendance).filter(att => att.status === 'absent').length;
    
    document.getElementById('presentToday').textContent = presentCount;
    document.getElementById('absentToday').textContent = absentCount;
    
    const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;
    document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    
    // Update today's overview
    updateTodayOverview();
}

function updateTodayOverview() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};
    const overviewDiv = document.getElementById('todayOverview');
    
    if (students.length === 0) {
        overviewDiv.innerHTML = `<p>${t('noStudentsRegistered')}</p>`;
        return;
    }
    
    if (Object.keys(todayAttendance).length === 0) {
        overviewDiv.innerHTML = `<p>${t('noAttendanceData')}</p>`;
        return;
    }
    
    const presentStudents = students.filter(student => 
        todayAttendance[student.id] && todayAttendance[student.id].status === 'present'
    );
    
    const absentStudents = students.filter(student => 
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
            html += `<li>${student.idNumber} - ${student.name} - ${reason}</li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    overviewDiv.innerHTML = html;
}

// Attendance Functions
function initializeTodayAttendance() {
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

function loadTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    loadAttendanceForDate();
}

function loadAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const selectedClass = document.getElementById('classFilter').value;
    
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
    
    // Filter students
    let filteredStudents = students;
    if (selectedClass) {
        filteredStudents = students.filter(student => student.class === selectedClass);
    }
    
    if (filteredStudents.length === 0) {
        document.getElementById('attendanceList').innerHTML = `<p>${t('noStudentsFound')}</p>`;
        return;
    }
    
    // Generate attendance list
    const attendanceList = document.getElementById('attendanceList');
    attendanceList.innerHTML = filteredStudents.map(student => {
        const studentAttendance = attendance[selectedDate][student.id] || { status: 'present', reason: '' };
        const isAbsent = studentAttendance.status === 'absent';
        
        return `
            <div class="student-row">
                <div class="student-info">
                    <h4>${student.idNumber} - ${student.name}</h4>
                </div>
                <div class="attendance-toggle">
                    <span>${t('present')}</span>
                    <div class="toggle-switch ${isAbsent ? 'absent' : ''}" 
                         onclick="toggleAttendance('${student.id}', '${selectedDate}')">
                    </div>
                    <span>${t('absent')}</span>
                </div>
                ${isAbsent ? `
                    <div class="absence-reason">
                        <input type="text" 
                               placeholder="${t('reasonForAbsence')}"
                               value="${studentAttendance.reason}"
                               onchange="updateAbsenceReason('${student.id}', '${selectedDate}', this.value)">
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function toggleAttendance(studentId, date) {
    if (!attendance[date]) {
        attendance[date] = {};
    }
    
    if (!attendance[date][studentId]) {
        attendance[date][studentId] = { status: 'present', reason: '' };
    }
    
    const currentStatus = attendance[date][studentId].status;
    attendance[date][studentId].status = currentStatus === 'present' ? 'absent' : 'present';
    
    if (attendance[date][studentId].status === 'present') {
        attendance[date][studentId].reason = '';
    }
    
    saveData();
    loadAttendanceForDate();
    
    // Update dashboard if viewing today's attendance
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
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
    
    attendance[date][studentId].reason = reason;
    saveData();
}

function saveAttendance() {
    saveData();
    showModal(t('success'), t('attendanceSaved'));
}

// Report Functions
function updateReportClassDropdown() {
    // This function is no longer needed as class dropdown is removed
}

// Global variables for table sorting and filtering
let currentReportData = [];
let sortDirection = {};
let columnFilters = {};

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    if (!startDate || !endDate) {
        showModal(t('error'), t('selectBothDates'));
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        showModal(t('error'), t('startDateAfterEnd'));
        return;
    }
    
    if (students.length === 0) {
        document.getElementById('reportResults').innerHTML = `<p>${t('noStudentsFound')}</p>`;
        return;
    }
    
    // Generate date range
    const dateRange = getDateRange(startDate, endDate);
    
    // Calculate attendance for each student
    currentReportData = students.map(student => {
        let presentDays = 0;
        let absentDays = 0;
        
        dateRange.forEach(date => {
            if (attendance[date] && attendance[date][student.id]) {
                if (attendance[date][student.id].status === 'present') {
                    presentDays++;
                } else {
                    absentDays++;
                }
            } else {
                // If no attendance record exists, consider as present
                presentDays++;
            }
        });
        
        const totalDays = presentDays + absentDays;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
        
        return {
            id: student.idNumber,
            name: student.name,
            fullName: `${student.idNumber} - ${student.name}`,
            presentDays,
            absentDays,
            attendancePercentage
        };
    });
    
    // Reset filters and sort direction
    columnFilters = {};
    sortDirection = {};
    
    renderReportTable(startDate, endDate);
}

function renderReportTable(startDate, endDate) {
    // Apply filters
    let filteredData = currentReportData.filter(row => {
        return Object.keys(columnFilters).every(column => {
            const filterValue = columnFilters[column].toLowerCase();
            if (!filterValue) return true;
            
            const cellValue = row[column].toString().toLowerCase();
            return cellValue.includes(filterValue);
        });
    });
    
    // Generate report HTML with filterable/sortable table
    const reportResults = document.getElementById('reportResults');
    reportResults.innerHTML = `
        <h3>${t('attendanceReport')}</h3>
        <p><strong>${t('period')}:</strong> ${startDate} ${t('to')} ${endDate}</p>
        <div class="report-table-container">
            <table class="report-table sortable-table">
                <thead>
                    <tr>
                        <th class="sortable-header" data-column="fullName">
                            <div class="header-content">
                                <span>${t('studentNameCol')}</span>
                                <div class="header-controls">
                                    <button class="sort-btn" onclick="sortTable('fullName')">
                                        <i class="fas fa-sort"></i>
                                    </button>
                                    <input type="text" class="column-filter" placeholder="Filter..." 
                                           onkeyup="filterColumn('fullName', this.value)" 
                                           onclick="event.stopPropagation()">
                                </div>
                            </div>
                        </th>
                        <th class="sortable-header" data-column="presentDays">
                            <div class="header-content">
                                <span>${t('presentDays')}</span>
                                <div class="header-controls">
                                    <button class="sort-btn" onclick="sortTable('presentDays')">
                                        <i class="fas fa-sort"></i>
                                    </button>
                                    <input type="text" class="column-filter" placeholder="Filter..." 
                                           onkeyup="filterColumn('presentDays', this.value)" 
                                           onclick="event.stopPropagation()">
                                </div>
                            </div>
                        </th>
                        <th class="sortable-header" data-column="absentDays">
                            <div class="header-content">
                                <span>${t('absentDays')}</span>
                                <div class="header-controls">
                                    <button class="sort-btn" onclick="sortTable('absentDays')">
                                        <i class="fas fa-sort"></i>
                                    </button>
                                    <input type="text" class="column-filter" placeholder="Filter..." 
                                           onkeyup="filterColumn('absentDays', this.value)" 
                                           onclick="event.stopPropagation()">
                                </div>
                            </div>
                        </th>
                        <th class="sortable-header" data-column="attendancePercentage">
                            <div class="header-content">
                                <span>${t('attendancePercent')}</span>
                                <div class="header-controls">
                                    <button class="sort-btn" onclick="sortTable('attendancePercentage')">
                                        <i class="fas fa-sort"></i>
                                    </button>
                                    <input type="text" class="column-filter" placeholder="Filter..." 
                                           onkeyup="filterColumn('attendancePercentage', this.value)" 
                                           onclick="event.stopPropagation()">
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map(data => `
                        <tr>
                            <td>${data.fullName}</td>
                            <td class="status-present">${data.presentDays}</td>
                            <td class="status-absent">${data.absentDays}</td>
                            <td>${data.attendancePercentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function sortTable(column) {
    // Toggle sort direction
    if (sortDirection[column] === 'asc') {
        sortDirection[column] = 'desc';
    } else {
        sortDirection[column] = 'asc';
    }
    
    // Clear other sort directions
    Object.keys(sortDirection).forEach(key => {
        if (key !== column) {
            delete sortDirection[key];
        }
    });
    
    // Sort the data
    currentReportData.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection[column] === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string values
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
        
        if (sortDirection[column] === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    // Update sort icon
    updateSortIcons(column);
    
    // Re-render table
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    renderReportTable(startDate, endDate);
}

function filterColumn(column, value) {
    columnFilters[column] = value;
    
    // Re-render table with filters
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    renderReportTable(startDate, endDate);
}

function updateSortIcons(activeColumn) {
    // Update all sort icons
    document.querySelectorAll('.sort-btn i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    // Update active column icon
    const activeHeader = document.querySelector(`[data-column="${activeColumn}"] .sort-btn i`);
    if (activeHeader) {
        if (sortDirection[activeColumn] === 'asc') {
            activeHeader.className = 'fas fa-sort-up';
        } else {
            activeHeader.className = 'fas fa-sort-down';
        }
    }
}

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

// Utility Functions
function saveData() {
    localStorage.setItem('madaniMaktabStudents', JSON.stringify(students));
    localStorage.setItem('madaniMaktabClasses', JSON.stringify(classes));
    localStorage.setItem('madaniMaktabAttendance', JSON.stringify(attendance));
}

function showModal(title, message) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="closeModal()" class="btn btn-primary">${t('ok')}</button>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
