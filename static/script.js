// Application State - Updated for API integration
let students = [];
let classes = [];
let attendance = {};

// API Base URL
const API_BASE = '';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeApp();
});

async function initializeApp() {
    await loadStudents();
    await loadClasses();
    updateClassDropdowns();
    await updateDashboard();
    await loadTodayAttendance();
    displayClasses();
    
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    document.getElementById('reportStartDate').value = today;
    document.getElementById('reportEndDate').value = today;
    
    // Listen for date changes
    document.getElementById('attendanceDate').addEventListener('change', loadAttendanceForDate);
    document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(API_BASE + endpoint, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Network error');
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadStudents() {
    try {
        students = await apiCall('/api/students');
    } catch (error) {
        console.error('Error loading students:', error);
        showModal(t('error'), 'Failed to load students: ' + error.message);
    }
}

async function loadClasses() {
    try {
        classes = await apiCall('/api/classes');
    } catch (error) {
        console.error('Error loading classes:', error);
        showModal(t('error'), 'Failed to load classes: ' + error.message);
    }
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
    } else if (sectionId === 'reports') {
        updateReportClassDropdown();
    }
}

// Student Registration Functions
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    registerStudent();
});

async function registerStudent() {
    const formData = {
        name: document.getElementById('studentName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        address: document.getElementById('address').value.trim(),
        district: document.getElementById('district').value.trim(),
        upazila: document.getElementById('upazila').value.trim(),
        mobile: document.getElementById('mobile').value.trim(),
        class: document.getElementById('studentClass').value,
        idNumber: document.getElementById('idNumber').value.trim()
    };
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.address || 
        !formData.district || !formData.upazila || !formData.mobile || 
        !formData.class || !formData.idNumber) {
        showModal(t('error'), t('fillAllFields'));
        return;
    }
    
    try {
        await apiCall('/api/students', 'POST', formData);
        
        // Reset form
        document.getElementById('studentForm').reset();
        
        // Reload students and update dashboard
        await loadStudents();
        await updateDashboard();
        
        showModal(t('success'), `${formData.name} ${t('studentRegistered')}`);
    } catch (error) {
        showModal(t('error'), error.message);
    }
}

// Class Management Functions
function updateClassDropdowns() {
    const dropdowns = ['studentClass', 'classFilter', 'reportClass'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Save current value
            const currentValue = dropdown.value;
            
            // Clear existing options
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

async function addClass() {
    const newClassName = document.getElementById('newClassName').value.trim();
    
    if (!newClassName) {
        showModal(t('error'), t('enterClassName'));
        return;
    }
    
    try {
        await apiCall('/api/classes', 'POST', { name: newClassName });
        
        // Reload classes and update UI
        await loadClasses();
        updateClassDropdowns();
        displayClasses();
        
        document.getElementById('newClassName').value = '';
        showModal(t('success'), `${newClassName} ${t('classAdded')}`);
    } catch (error) {
        showModal(t('error'), error.message);
    }
}

async function deleteClass(className) {
    if (confirm(`${t('confirmDeleteClass')} "${className}"? ${t('cannotUndo')}`)) {
        try {
            await apiCall(`/api/classes/${encodeURIComponent(className)}`, 'DELETE');
            
            // Reload data and update UI
            await loadClasses();
            await loadStudents();
            updateClassDropdowns();
            displayClasses();
            await updateDashboard();
            
            showModal(t('success'), `${className} ${t('classDeleted')}`);
        } catch (error) {
            showModal(t('error'), error.message);
        }
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
async function updateDashboard() {
    try {
        const stats = await apiCall('/api/dashboard');
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('presentToday').textContent = stats.presentToday;
        document.getElementById('absentToday').textContent = stats.absentToday;
        document.getElementById('attendanceRate').textContent = stats.attendanceRate;
        
        updateTodayOverview(stats.absentStudents);
    } catch (error) {
        console.error('Error updating dashboard:', error);
        showModal(t('error'), 'Failed to load dashboard: ' + error.message);
    }
}

function updateTodayOverview(absentStudents) {
    const overviewDiv = document.getElementById('todayOverview');
    
    if (students.length === 0) {
        overviewDiv.innerHTML = `<p>${t('noStudentsRegistered')}</p>`;
        return;
    }
    
    let html = `
        <div class="attendance-summary">
            <p><strong>${t('present')}:</strong> ${document.getElementById('presentToday').textContent}</p>
            <p><strong>${t('absent')}:</strong> ${document.getElementById('absentToday').textContent}</p>
        </div>
    `;
    
    if (absentStudents && absentStudents.length > 0) {
        html += `
            <div class="absent-details">
                <h4>${t('absentStudents')}</h4>
                <ul>
        `;
        
        absentStudents.forEach(student => {
            html += `<li>${student.name} (${student.class}) - ${student.reason}</li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }
    
    overviewDiv.innerHTML = html;
}

// Attendance Functions
async function loadTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    await loadAttendanceForDate();
}

async function loadAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const selectedClass = document.getElementById('classFilter').value;
    
    if (!selectedDate) {
        document.getElementById('attendanceList').innerHTML = `<p>${t('pleaseSelectDate')}</p>`;
        return;
    }
    
    try {
        // Load attendance data for the selected date
        const params = new URLSearchParams();
        if (selectedClass) {
            params.append('class', selectedClass);
        }
        
        attendance[selectedDate] = await apiCall(`/api/attendance/${selectedDate}?${params}`);
        
        // Filter students based on class
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
                        <h4>${student.name}</h4>
                        <p>${t('class')}: ${student.class} | ID: ${student.idNumber}</p>
                        <p>${student.fatherName} | ${student.mobile}</p>
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
        
    } catch (error) {
        console.error('Error loading attendance:', error);
        document.getElementById('attendanceList').innerHTML = `<p>Error loading attendance data: ${error.message}</p>`;
    }
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
}

async function saveAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    
    if (!selectedDate || !attendance[selectedDate]) {
        showModal(t('error'), 'No attendance data to save.');
        return;
    }
    
    try {
        await apiCall('/api/attendance', 'POST', {
            date: selectedDate,
            attendance: attendance[selectedDate]
        });
        
        showModal(t('success'), t('attendanceSaved'));
        
        // Update dashboard if saving today's attendance
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
            await updateDashboard();
        }
    } catch (error) {
        showModal(t('error'), 'Failed to save attendance: ' + error.message);
    }
}

// Report Functions
function updateReportClassDropdown() {
    const dropdown = document.getElementById('reportClass');
    dropdown.innerHTML = '<option value="">All Classes</option>';
    
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        dropdown.appendChild(option);
    });
}

async function generateReport() {
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
    
    try {
        const params = new URLSearchParams({
            startDate,
            endDate
        });
        
        if (selectedClass) {
            params.append('class', selectedClass);
        }
        
        const reportData = await apiCall(`/api/reports?${params}`);
        
        if (reportData.length === 0) {
            document.getElementById('reportResults').innerHTML = `<p>${t('noStudentsFound')}</p>`;
            return;
        }
        
        // Generate report table
        let html = `
            <h3>${t('attendanceReport')}</h3>
            <p><strong>${t('period')}:</strong> ${formatDate(startDate)} ${t('to')} ${formatDate(endDate)}</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${t('studentNameCol')}</th>
                        <th>${t('classCol')}</th>
                        <th>${t('idNumberCol')}</th>
                        <th>${t('presentDays')}</th>
                        <th>${t('absentDays')}</th>
                        <th>${t('attendancePercent')}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        reportData.forEach(student => {
            html += `
                <tr>
                    <td>${student.studentName}</td>
                    <td>${student.class}</td>
                    <td>${student.idNumber}</td>
                    <td class="status-present">${student.presentDays}</td>
                    <td class="status-absent">${student.absentDays}</td>
                    <td>${student.attendancePercent}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        document.getElementById('reportResults').innerHTML = html;
        
    } catch (error) {
        showModal(t('error'), 'Failed to generate report: ' + error.message);
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
}

// Modal Functions
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
        closeModal();
    }
}