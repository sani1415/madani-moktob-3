// Application State
let students = [];
let classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
let attendance = {};
let holidays = [];

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        initializeLanguage();
        await initializeAppWithDatabase();
        console.log('Madani Maktab app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showModal('Error', 'Failed to initialize the application. Please refresh the page.');
    }
});

async function initializeAppWithDatabase() {
    try {
        // Load data from database
        await loadDataFromDatabase();
        
        // Check if we need to migrate sample data or have incomplete data
        if (!students || students.length < 25) {
            console.log(`Found ${students.length} students, migrating all 25 to PostgreSQL...`);
            await migrateSampleData();
        }
        
        updateClassDropdowns();
        updateDashboard();
        loadTodayAttendance();
        displayClasses();
        displayHolidays();
        initializeHijriSettings();
        
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
        document.getElementById('attendanceDate').addEventListener('change', function() {
            loadAttendanceForDate();
            updateAttendancePageHijri();
        });
        document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);
    } catch (error) {
        console.error('Database initialization failed, using localStorage fallback:', error);
        // Complete fallback to localStorage
        students = JSON.parse(localStorage.getItem('madaniMaktabStudents')) || [];
        classes = JSON.parse(localStorage.getItem('madaniMaktabClasses')) || ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        attendance = JSON.parse(localStorage.getItem('madaniMaktabAttendance')) || {};
        holidays = JSON.parse(localStorage.getItem('madaniMaktabHolidays')) || [];
        
        // If no data exists or incomplete data, add all 25 sample students
        if (students.length < 25) {
            addSampleDataFallback();
        }
        
        updateClassDropdowns();
        updateDashboard();
        loadTodayAttendance();
        displayClasses();
        displayHolidays();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = today;
        document.getElementById('reportStartDate').value = today;
        document.getElementById('reportEndDate').value = today;
        
        if (!attendance[today]) {
            initializeTodayAttendance();
        }
        
        document.getElementById('attendanceDate').addEventListener('change', loadAttendanceForDate);
        document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);
    }
}

async function loadDataFromDatabase() {
    try {
        // Load data from PostgreSQL database
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            students = await studentsResponse.json();
        } else {
            students = [];
        }
        
        const attendanceResponse = await fetch('/api/attendance');
        if (attendanceResponse.ok) {
            attendance = await attendanceResponse.json();
        } else {
            attendance = {};
        }
        
        const holidaysResponse = await fetch('/api/holidays');
        if (holidaysResponse.ok) {
            holidays = await holidaysResponse.json();
        } else {
            holidays = [];
        }
        
        classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        
        console.log(`Loaded ${students.length} students from PostgreSQL database`);
    } catch (error) {
        console.error('Database connection failed, using fallback data:', error);
        // Fallback to localStorage if database unavailable
        students = JSON.parse(localStorage.getItem('madaniMaktabStudents')) || [];
        classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        attendance = JSON.parse(localStorage.getItem('madaniMaktabAttendance')) || {};
        holidays = JSON.parse(localStorage.getItem('madaniMaktabHolidays')) || [];
    }
}

async function migrateSampleData() {
    console.log('Migrating 25 sample students to PostgreSQL database...');
    
    try {
        const response = await fetch('/api/migrate_sample_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            // Reload data from database
            await loadDataFromDatabase();
        } else {
            throw new Error('Migration failed');
        }
    } catch (error) {
        console.error('PostgreSQL migration failed, using fallback:', error);
        addSampleDataFallback();
    }
}

function addSampleDataFallback() {
    // Complete 25 student dataset for localStorage fallback
    const sampleStudents = [
        // Class 1 students (IDs: 101-105)
        { id: '101', name: 'Ali Hassan', fatherName: 'Md. Mostofa Hassan', mobileNumber: '01712345101', district: 'Dhaka', upazila: 'Savar', class: 'Class 1', registrationDate: '2025-01-01' },
        { id: '102', name: 'Hafsa Khatun', fatherName: 'Md. Shahidul Islam', mobileNumber: '01812345102', district: 'Chittagong', upazila: 'Hathazari', class: 'Class 1', registrationDate: '2025-01-02' },
        { id: '103', name: 'Hamza Ahmed', fatherName: 'Md. Rafiqul Alam', mobileNumber: '01912345103', district: 'Sylhet', upazila: 'Osmaninagar', class: 'Class 1', registrationDate: '2025-01-03' },
        { id: '104', name: 'Sumaya Begum', fatherName: 'Md. Kamal Uddin', mobileNumber: '01612345104', district: 'Rajshahi', upazila: 'Paba', class: 'Class 1', registrationDate: '2025-01-04' },
        { id: '105', name: 'Usman Khan', fatherName: 'Md. Liaquat Ali', mobileNumber: '01512345105', district: 'Rangpur', upazila: 'Mithapukur', class: 'Class 1', registrationDate: '2025-01-05' },
        
        // Class 2 students (IDs: 201-205)
        { id: '201', name: 'Ruqayyah Rahman', fatherName: 'Md. Abdur Rahman', mobileNumber: '01712345201', district: 'Dhaka', upazila: 'Dhamrai', class: 'Class 2', registrationDate: '2025-02-01' },
        { id: '202', name: 'Bilal Ahmed', fatherName: 'Md. Shahjahan', mobileNumber: '01812345202', district: 'Chittagong', upazila: 'Rangunia', class: 'Class 2', registrationDate: '2025-02-02' },
        { id: '203', name: 'Sakinah Khatun', fatherName: 'Md. Nurul Haque', mobileNumber: '01912345203', district: 'Sylhet', upazila: 'Beanibazar', class: 'Class 2', registrationDate: '2025-02-03' },
        { id: '204', name: 'Ismail Hossain', fatherName: 'Md. Shamsul Huda', mobileNumber: '01612345204', district: 'Rajshahi', upazila: 'Charghat', class: 'Class 2', registrationDate: '2025-02-04' },
        { id: '205', name: 'Ayesha Siddique', fatherName: 'Md. Abdul Quddus', mobileNumber: '01512345205', district: 'Rangpur', upazila: 'Badarganj', class: 'Class 2', registrationDate: '2025-02-05' },
        
        // Class 3 students (IDs: 301-305)
        { id: '301', name: 'Salman Farisi', fatherName: 'Md. Abdul Halim', mobileNumber: '01712345301', district: 'Dhaka', upazila: 'Keraniganj', class: 'Class 3', registrationDate: '2025-03-01' },
        { id: '302', name: 'Zaynab Sultana', fatherName: 'Md. Mizanur Rahman', mobileNumber: '01812345302', district: 'Chittagong', upazila: 'Sitakunda', class: 'Class 3', registrationDate: '2025-03-02' },
        { id: '303', name: 'Khalid Ibn Walid', fatherName: 'Md. Mahfuzul Haque', mobileNumber: '01912345303', district: 'Sylhet', upazila: 'Golapganj', class: 'Class 3', registrationDate: '2025-03-03' },
        { id: '304', name: 'Umm Salamah', fatherName: 'Md. Anisul Haque', mobileNumber: '01612345304', district: 'Rajshahi', upazila: 'Godagari', class: 'Class 3', registrationDate: '2025-03-04' },
        { id: '305', name: 'Abu Bakr Siddique', fatherName: 'Md. Nazrul Islam', mobileNumber: '01512345305', district: 'Rangpur', upazila: 'Kurigram', class: 'Class 3', registrationDate: '2025-03-05' },
        
        // Class 4 students (IDs: 401-405)
        { id: '401', name: 'Abdul Karim', fatherName: 'Md. Aminul Islam', mobileNumber: '01712345401', district: 'Dhaka', upazila: 'Savar', class: 'Class 4', registrationDate: '2025-04-01' },
        { id: '402', name: 'Fatima Khatun', fatherName: 'Md. Rafiqul Islam', mobileNumber: '01812345402', district: 'Chittagong', upazila: 'Hathazari', class: 'Class 4', registrationDate: '2025-04-02' },
        { id: '403', name: 'Mohammad Hasan', fatherName: 'Md. Khalilur Rahman', mobileNumber: '01912345403', district: 'Sylhet', upazila: 'Osmaninagar', class: 'Class 4', registrationDate: '2025-04-03' },
        { id: '404', name: 'Aisha Begum', fatherName: 'Md. Shamsul Haque', mobileNumber: '01612345404', district: 'Rajshahi', upazila: 'Paba', class: 'Class 4', registrationDate: '2025-04-04' },
        { id: '405', name: 'Ibrahim Khan', fatherName: 'Md. Delwar Hossain', mobileNumber: '01512345405', district: 'Rangpur', upazila: 'Mithapukur', class: 'Class 4', registrationDate: '2025-04-05' },
        
        // Class 5 students (IDs: 501-505)
        { id: '501', name: 'Zainab Rahman', fatherName: 'Md. Abdul Rahman', mobileNumber: '01712345501', district: 'Dhaka', upazila: 'Dhamrai', class: 'Class 5', registrationDate: '2025-05-01' },
        { id: '502', name: 'Yusuf Ahmed', fatherName: 'Md. Kamal Ahmed', mobileNumber: '01812345502', district: 'Chittagong', upazila: 'Rangunia', class: 'Class 5', registrationDate: '2025-05-02' },
        { id: '503', name: 'Maryam Khatun', fatherName: 'Md. Mizanur Rahman', mobileNumber: '01912345503', district: 'Sylhet', upazila: 'Beanibazar', class: 'Class 5', registrationDate: '2025-05-03' },
        { id: '504', name: 'Omar Faruk', fatherName: 'Md. Abdus Salam', mobileNumber: '01612345504', district: 'Rajshahi', upazila: 'Charghat', class: 'Class 5', registrationDate: '2025-05-04' },
        { id: '505', name: 'Khadija Begum', fatherName: 'Md. Nurul Islam', mobileNumber: '01512345505', district: 'Rangpur', upazila: 'Badarganj', class: 'Class 5', registrationDate: '2025-05-05' }
    ];

    students = sampleStudents;
    localStorage.setItem('madaniMaktabStudents', JSON.stringify(students));
    console.log('25 sample students added to localStorage');
}

// Sample Data Generation - Empty by default
function addSampleData() {
    // Add students for Class 4 (IDs: 401-405)
    const class4Students = [
        { id: '401', name: 'Abdul Karim', fatherName: 'Md. Aminul Islam', mobileNumber: '01712345401', district: 'Dhaka', upazila: 'Savar', class: 'Class 4', registrationDate: '2025-06-01' },
        { id: '402', name: 'Fatima Khatun', fatherName: 'Md. Rafiqul Islam', mobileNumber: '01812345402', district: 'Chittagong', upazila: 'Hathazari', class: 'Class 4', registrationDate: '2025-06-02' },
        { id: '403', name: 'Mohammad Hasan', fatherName: 'Md. Khalilur Rahman', mobileNumber: '01912345403', district: 'Sylhet', upazila: 'Osmaninagar', class: 'Class 4', registrationDate: '2025-06-03' },
        { id: '404', name: 'Aisha Begum', fatherName: 'Md. Shamsul Haque', mobileNumber: '01612345404', district: 'Rajshahi', upazila: 'Paba', class: 'Class 4', registrationDate: '2025-06-04' },
        { id: '405', name: 'Ibrahim Khan', fatherName: 'Md. Delwar Hossain', mobileNumber: '01512345405', district: 'Rangpur', upazila: 'Mithapukur', class: 'Class 4', registrationDate: '2025-06-05' }
    ];

    // Add students for Class 5 (IDs: 501-505)
    const class5Students = [
        { id: '501', name: 'Hafez Abdullah', fatherName: 'Md. Nurul Islam', mobileNumber: '01712345501', district: 'Dhaka', upazila: 'Dhamrai', class: 'Class 5', registrationDate: '2025-06-06' },
        { id: '502', name: 'Mariam Sultana', fatherName: 'Md. Golam Mostafa', mobileNumber: '01812345502', district: 'Chittagong', upazila: 'Rangunia', class: 'Class 5', registrationDate: '2025-06-07' },
        { id: '503', name: 'Yusuf Ahmed', fatherName: 'Md. Rezaul Karim', mobileNumber: '01912345503', district: 'Sylhet', upazila: 'Zakiganj', class: 'Class 5', registrationDate: '2025-06-08' },
        { id: '504', name: 'Zainab Rahman', fatherName: 'Md. Mokhlesur Rahman', mobileNumber: '01612345504', district: 'Rajshahi', upazila: 'Charghat', class: 'Class 5', registrationDate: '2025-06-09' },
        { id: '505', name: 'Ismail Hossain', fatherName: 'Md. Abdur Rashid', mobileNumber: '01512345505', district: 'Rangpur', upazila: 'Gangachara', class: 'Class 5', registrationDate: '2025-06-10' }
    ];

    // Add all new students to the students array
    const newStudents = [...class4Students, ...class5Students];
    
    newStudents.forEach(student => {
        const existingStudent = students.find(s => s.id === student.id);
        if (!existingStudent) {
            students.push(student);
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
    
    // Update total students
    document.getElementById('totalStudents').textContent = students.length;
    
    // Check if today is a holiday and display holiday notice
    const holidayNotice = document.getElementById('holidayNotice');
    if (isHoliday(today)) {
        const holidayName = getHolidayName(today);
        if (holidayNotice) {
            holidayNotice.innerHTML = `
                <div class="dashboard-holiday-notice">
                    <i class="fas fa-calendar-times"></i>
                    <span>Today is a holiday: <strong>${holidayName}</strong></span>
                </div>
            `;
            holidayNotice.style.display = 'block';
        }
        
        // On holidays, show all students as present
        document.getElementById('presentToday').textContent = students.length;
        document.getElementById('absentToday').textContent = 0;
        document.getElementById('attendanceRate').textContent = '100%';
    } else {
        if (holidayNotice) {
            holidayNotice.style.display = 'none';
        }
        
        const todayAttendance = attendance[today] || {};
        
        const presentCount = Object.values(todayAttendance).filter(att => att.status === 'present').length;
        const absentCount = Object.values(todayAttendance).filter(att => att.status === 'absent').length;
        
        document.getElementById('presentToday').textContent = presentCount;
        document.getElementById('absentToday').textContent = absentCount;
        
        const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;
        document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
    }
    
    // Update today's overview
    updateTodayOverview();
    
    // Update class-wise information
    updateClassWiseStats();
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
            const displayId = student.idNumber || student.id;
            html += `<li>${displayId} - ${student.name} - ${reason}</li>`;
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
        updateFilteredStudentCount(0);
        return;
    }
    
    // Check if selected date is a holiday
    if (isHoliday(selectedDate)) {
        const holidayName = getHolidayName(selectedDate);
        document.getElementById('attendanceList').innerHTML = `
            <div class="holiday-notice">
                <i class="fas fa-calendar-times"></i>
                <h3>Holiday: ${holidayName}</h3>
                <p>Attendance is not recorded on holidays. Students are automatically marked as present for holidays.</p>
            </div>
        `;
        updateFilteredStudentCount(0);
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
    
    updateFilteredStudentCount(filteredStudents.length);
    
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
                <div class="student-info-with-toggle">
                    <div class="student-info">
                        <h4>${student.id} - <span class="clickable-name" onclick="showStudentDetail('${student.id}')">${student.name}</span></h4>
                    </div>
                    <div class="attendance-toggle">
                        <div class="toggle-switch ${!isAbsent ? 'present' : 'absent'}" 
                             onclick="toggleAttendance('${student.id}', '${selectedDate}', '${!isAbsent ? 'absent' : 'present'}')">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
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

function toggleAttendance(studentId, date, status) {
    // Prevent attendance marking on holidays
    if (isHoliday(date)) {
        showModal(t('error'), 'Cannot mark attendance on holidays');
        return;
    }
    
    if (!attendance[date]) {
        attendance[date] = {};
    }
    
    attendance[date][studentId] = {
        status: status || 'present',
        reason: status === 'present' ? '' : (attendance[date][studentId]?.reason || '')
    };
    
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
    const selectedDate = document.getElementById('attendanceDate').value;
    
    // Prevent saving attendance on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), 'Cannot save attendance on holidays');
        return;
    }
    
    saveData();
    showModal(t('success'), t('attendanceSaved'));
}

// Bulk Attendance Functions
function updateFilteredStudentCount(count) {
    const countElement = document.getElementById('filteredStudentCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

function getFilteredStudents() {
    const selectedClass = document.getElementById('classFilter').value;
    let filteredStudents = students;
    if (selectedClass) {
        filteredStudents = students.filter(student => student.class === selectedClass);
    }
    return filteredStudents;
}

function markAllPresent() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    // Prevent bulk actions on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), 'Cannot mark attendance on holidays');
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
    
    saveData();
    loadAttendanceForDate();
    
    // Update dashboard if viewing today's attendance
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
        updateDashboard();
    }
    
    showModal(t('success'), `${filteredStudents.length} ${t('studentsMarkedPresent')}`);
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

function confirmMarkAllAbsent() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const reason = document.getElementById('bulkAbsentReason').value.trim();
    
    if (!reason) {
        showModal(t('error'), t('pleaseProvideReason'));
        return;
    }
    
    // Prevent bulk actions on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), 'Cannot mark attendance on holidays');
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
    
    saveData();
    loadAttendanceForDate();
    closeBulkAbsentModal();
    
    // Update dashboard if viewing today's attendance
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
        updateDashboard();
    }
    
    showModal(t('success'), `${filteredStudents.length} ${t('studentsMarkedAbsent')}`);
}

function copyFromPreviousDay() {
    const selectedDate = document.getElementById('attendanceDate').value;
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    // Prevent copying to holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), 'Cannot mark attendance on holidays');
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
        showModal(t('error'), t('noStudentsFound'));
        return;
    }
    
    // Find previous non-holiday day with attendance data
    let currentDate = new Date(selectedDate);
    let previousDate;
    let foundNonHoliday = false;
    
    for (let i = 1; i <= 7; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        const checkDate = currentDate.toISOString().split('T')[0];
        
        if (!isHoliday(checkDate) && attendance[checkDate]) {
            previousDate = checkDate;
            foundNonHoliday = true;
            break;
        }
    }
    
    if (!foundNonHoliday) {
        showModal(t('error'), 'No non-holiday attendance data found in the last 7 days');
        return;
    }
    
    // Initialize attendance for current date if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    let copiedCount = 0;
    
    // Copy attendance from previous day for filtered students
    filteredStudents.forEach(student => {
        if (attendance[previousDate][student.id]) {
            attendance[selectedDate][student.id] = {
                status: attendance[previousDate][student.id].status,
                reason: attendance[previousDate][student.id].reason
            };
            copiedCount++;
        } else {
            // If no previous attendance record, mark as present
            attendance[selectedDate][student.id] = {
                status: 'present',
                reason: ''
            };
        }
    });
    
    saveData();
    loadAttendanceForDate();
    
    // Update dashboard if viewing today's attendance
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
        updateDashboard();
    }
    
    showModal(t('success'), `${t('attendanceCopiedFrom')} ${previousDate} for ${copiedCount} students`);
}

// Class-wise Dashboard Functions
function updateClassWiseStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};
    
    // Group students by class
    const classSummary = {};
    
    classes.forEach(className => {
        classSummary[className] = {
            total: 0,
            present: 0,
            absent: 0,
            rate: 0
        };
    });
    
    students.forEach(student => {
        if (classSummary[student.class]) {
            classSummary[student.class].total++;
            
            if (todayAttendance[student.id]) {
                if (todayAttendance[student.id].status === 'present') {
                    classSummary[student.class].present++;
                } else {
                    classSummary[student.class].absent++;
                }
            } else {
                // Default to present if no data
                classSummary[student.class].present++;
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
    
    // Render class-wise stats
    const classWiseGrid = document.getElementById('classWiseGrid');
    if (classWiseGrid) {
        classWiseGrid.innerHTML = Object.keys(classSummary)
            .filter(className => classSummary[className].total > 0)
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

// Student Detail Functions
function showStudentDetail(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showModal(t('error'), t('studentNotFound'));
        return;
    }
    
    // Hide all sections and show student detail as separate page
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('student-detail').classList.add('active');
    
    // Update page title
    document.getElementById('studentDetailTitle').textContent = `${student.name} - ${t('studentDetails')}`;
    
    // Generate student detail content
    generateStudentDetailContent(student);
    
    // Update URL hash for navigation
    window.location.hash = `student/${studentId}`;
}

function backToReports() {
    document.getElementById('student-detail').classList.remove('active');
    document.getElementById('attendance').classList.add('active');
    window.location.hash = 'attendance';
}

function generateStudentDetailContent(student) {
    const detailContent = document.getElementById('studentDetailContent');
    
    // Calculate attendance statistics
    const attendanceStats = calculateStudentAttendanceStats(student);
    
    detailContent.innerHTML = `
        <div class="student-info-card">
            <div class="student-basic-info">
                <div class="info-group">
                    <h4>${t('personalInformation')}</h4>
                    <div class="info-item">
                        <span class="info-label">Student Name:</span>
                        <span class="info-value">${student.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Father's Name:</span>
                        <span class="info-value">${student.fatherName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">ID Number:</span>
                        <span class="info-value">${student.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Class:</span>
                        <span class="info-value">${student.class}</span>
                    </div>
                </div>
                
                <div class="info-group">
                    <h4>${t('contactInformation')}</h4>
                    <div class="info-item">
                        <span class="info-label">Mobile Number:</span>
                        <span class="info-value">${student.mobileNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">District:</span>
                        <span class="info-value">${student.district}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Sub-district:</span>
                        <span class="info-value">${student.upazila}</span>
                    </div>
                </div>
                
                <div class="info-group">
                    <h4>${t('academicInformation')}</h4>
                    <div class="info-item">
                        <span class="info-label">Registration Date:</span>
                        <span class="info-value">${student.registrationDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Student ID:</span>
                        <span class="info-value">${student.id}</span>
                    </div>
                </div>
            </div>
            
            <div class="attendance-history">
                <h4>${t('attendanceSummary')}</h4>
                <div class="attendance-summary">
                    <div class="summary-item present">
                        <h5>${t('totalPresent')}</h5>
                        <div class="number">${attendanceStats.totalPresent}</div>
                    </div>
                    <div class="summary-item absent">
                        <h5>${t('totalAbsent')}</h5>
                        <div class="number">${attendanceStats.totalAbsent}</div>
                    </div>
                    <div class="summary-item">
                        <h5>${t('attendanceRate')}</h5>
                        <div class="number">${attendanceStats.attendanceRate}%</div>
                    </div>
                    <div class="summary-item">
                        <h5>${t('totalDays')}</h5>
                        <div class="number">${attendanceStats.totalDays}</div>
                    </div>
                </div>
                
                <div class="attendance-calendar">
                    <div class="calendar-header">
                        <h5>${t('recentAttendance')}</h5>
                    </div>
                    ${generateAttendanceCalendar(student, attendanceStats.recentAttendance)}
                </div>
            </div>
        </div>
    `;
}

function calculateStudentAttendanceStats(student) {
    let totalPresent = 0;
    let totalAbsent = 0;
    const recentAttendance = {};
    
    // Get last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Skip holidays - they don't count toward attendance calculations
        if (isHoliday(dateStr)) {
            recentAttendance[dateStr] = {
                status: 'holiday',
                reason: getHolidayName(dateStr)
            };
            continue;
        }
        
        if (attendance[dateStr] && attendance[dateStr][student.id]) {
            const status = attendance[dateStr][student.id].status;
            recentAttendance[dateStr] = {
                status: status,
                reason: attendance[dateStr][student.id].reason || ''
            };
            
            if (status === 'present') {
                totalPresent++;
            } else {
                totalAbsent++;
            }
        }
    }
    
    const totalDays = totalPresent + totalAbsent;
    const attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 100;
    
    return {
        totalPresent,
        totalAbsent,
        totalDays,
        attendanceRate,
        recentAttendance
    };
}

function generateAttendanceCalendar(student, recentAttendance) {
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let calendarHTML = '<div class="calendar-grid">';
    
    // Add day headers
    daysOfWeek.forEach(day => {
        calendarHTML += `<div class="calendar-day header">${day}</div>`;
    });
    
    // Add last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfMonth = date.getDate();
        
        let className = 'calendar-day no-data';
        let title = `${dateStr} - No data`;
        
        if (recentAttendance[dateStr]) {
            if (recentAttendance[dateStr].status === 'holiday') {
                className = 'calendar-day holiday';
                title = `${dateStr} - Holiday: ${recentAttendance[dateStr].reason}`;
            } else {
                className = `calendar-day ${recentAttendance[dateStr].status}`;
                title = `${dateStr} - ${recentAttendance[dateStr].status}`;
                if (recentAttendance[dateStr].reason) {
                    title += ` (${recentAttendance[dateStr].reason})`;
                }
            }
        }
        
        calendarHTML += `<div class="${className}" title="${title}">${dayOfMonth}</div>`;
    }
    
    calendarHTML += '</div>';
    return calendarHTML;
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
    
    // Check if the entire date range consists only of holidays
    const holidaysInRange = dateRange.filter(date => isHoliday(date));
    const nonHolidaysInRange = dateRange.filter(date => !isHoliday(date));
    
    if (nonHolidaysInRange.length === 0) {
        // Show holiday message if all dates in range are holidays
        document.getElementById('reportResults').innerHTML = `
            <div class="holiday-notice">
                <i class="fas fa-calendar-times"></i>
                <h3>Holiday Period Selected</h3>
                <p>The selected date range contains only holidays. No attendance data is available for holidays.</p>
                <p><strong>Holidays in range:</strong> ${holidaysInRange.map(date => {
                    const holidayName = getHolidayName(date);
                    return `${formatDate(date)} (${holidayName})`;
                }).join(', ')}</p>
            </div>
        `;
        return;
    }
    
    // Calculate attendance for each student
    currentReportData = students.map(student => {
        let presentDays = 0;
        let absentDays = 0;
        
        dateRange.forEach(date => {
            // Skip holidays in report calculations
            if (isHoliday(date)) {
                return;
            }
            
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
            id: student.idNumber || student.id,
            name: student.name,
            fullName: `${student.idNumber || student.id} - ${student.name}`,
            presentDays,
            absentDays,
            attendancePercentage
        };
    });
    
    // Reset filters and sort direction
    columnFilters = {};
    sortDirection = {};
    
    renderReportTable(startDate, endDate);
    addHijriToReports();
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
// Holiday Management Functions
function addHoliday() {
    const startDateInput = document.getElementById('holidayStartDate');
    const endDateInput = document.getElementById('holidayEndDate');
    const nameInput = document.getElementById('holidayName');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const name = nameInput.value.trim();
    
    if (!startDate || !name) {
        showModal(t('error'), 'Please enter holiday start date and name');
        return;
    }
    
    // If no end date is provided, use start date (single day holiday)
    const finalEndDate = endDate || startDate;
    
    // Validate date range
    if (new Date(startDate) > new Date(finalEndDate)) {
        showModal(t('error'), 'Start date cannot be after end date');
        return;
    }
    
    // Check if any date in the range conflicts with existing holidays
    const conflictingHoliday = holidays.find(h => {
        const existingStart = new Date(h.startDate);
        const existingEnd = new Date(h.endDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(finalEndDate);
        
        return (newStart <= existingEnd && newEnd >= existingStart);
    });
    
    if (conflictingHoliday) {
        showModal(t('error'), 'Holiday dates conflict with existing holiday: ' + conflictingHoliday.name);
        return;
    }
    
    holidays.push({ 
        startDate, 
        endDate: finalEndDate, 
        name,
        // Keep legacy date field for compatibility
        date: startDate
    });
    holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    saveData();
    displayHolidays();
    
    // Clear inputs
    startDateInput.value = '';
    endDateInput.value = '';
    nameInput.value = '';
    
    const dayCount = Math.ceil((new Date(finalEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    showModal(t('success'), `Holiday added successfully (${dayCount} day${dayCount > 1 ? 's' : ''})`);
}

function deleteHoliday(index) {
    holidays.splice(index, 1);
    saveData();
    displayHolidays();
    showModal(t('success'), 'Holiday deleted successfully');
}

function displayHolidays() {
    const holidaysList = document.getElementById('holidaysList');
    if (!holidaysList) return;
    
    if (holidays.length === 0) {
        holidaysList.innerHTML = '<p>No holidays configured.</p>';
        return;
    }
    
    holidaysList.innerHTML = holidays.map((holiday, index) => {
        const startDate = holiday.startDate || holiday.date;
        const endDate = holiday.endDate || holiday.date;
        const isRange = startDate !== endDate;
        const dayCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        
        return `
            <div class="holiday-item">
                <div class="holiday-info">
                    <strong>${holiday.name}</strong>
                    <span class="holiday-date">
                        ${isRange ? `${startDate} to ${endDate} (${dayCount} days)` : startDate}
                    </span>
                </div>
                <button onclick="deleteHoliday(${index})" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function isHoliday(date) {
    return holidays.some(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        const checkDate = new Date(date);
        
        return checkDate >= new Date(startDate) && checkDate <= new Date(endDate);
    });
}

function getHolidayName(date) {
    const holiday = holidays.find(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        const checkDate = new Date(date);
        
        return checkDate >= new Date(startDate) && checkDate <= new Date(endDate);
    });
    return holiday ? holiday.name : null;
}

async function saveDataToDatabase() {
    try {
        await dbAdapter.saveStudents(students);
        await dbAdapter.saveClasses(classes);
        await dbAdapter.saveAttendance(attendance);
        await dbAdapter.saveHolidays(holidays);
    } catch (error) {
        console.error('Error saving data to database:', error);
        // Fallback to localStorage
        try {
            localStorage.setItem('madaniMaktabStudents', JSON.stringify(students));
            localStorage.setItem('madaniMaktabClasses', JSON.stringify(classes));
            localStorage.setItem('madaniMaktabAttendance', JSON.stringify(attendance));
            localStorage.setItem('madaniMaktabHolidays', JSON.stringify(holidays));
        } catch (localError) {
            showModal('Error', 'Failed to save data. Your browser storage might be full.');
        }
    }
}

function saveData() {
    saveDataToDatabase();
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

// Hijri Date Functions
function initializeHijriSettings() {
    console.log('Initializing Hijri settings...');
    const hijriSelect = document.getElementById('hijriAdjustment');
    
    if (!window.hijriCalendar) {
        console.error('Hijri calendar not loaded');
        return;
    }
    
    if (!hijriSelect) {
        console.error('Hijri select element not found');
        return;
    }
    
    try {
        // Load saved adjustment value
        const savedAdjustment = hijriCalendar.getAdjustment();
        hijriSelect.value = savedAdjustment;
        console.log('Hijri adjustment loaded:', savedAdjustment);
        
        // Update preview
        updateHijriPreview();
        
        // Add Hijri dates to dashboard and other sections
        updateDashboardWithHijri();
        updateAttendancePageHijri();
        
        console.log('Hijri settings initialized successfully');
    } catch (error) {
        console.error('Error initializing Hijri settings:', error);
    }
}

function updateHijriAdjustment() {
    const hijriSelect = document.getElementById('hijriAdjustment');
    if (hijriSelect && window.hijriCalendar) {
        const adjustment = parseInt(hijriSelect.value);
        hijriCalendar.setAdjustment(adjustment);
        updateHijriPreview();
        
        // Update all displays with new Hijri dates
        updateDashboardWithHijri();
        updateAttendancePageHijri();
        
        showModal(t('success'), 'Hijri date adjustment updated successfully');
    }
}

function updateHijriPreview() {
    console.log('Updating Hijri preview...');
    const previewElement = document.getElementById('hijriPreview');
    
    if (!previewElement) {
        console.error('Hijri preview element not found');
        return;
    }
    
    if (!window.hijriCalendar) {
        console.error('Hijri calendar not available');
        return;
    }
    
    try {
        const currentLang = localStorage.getItem('language') || 'en';
        const hijriDate = hijriCalendar.getCurrentHijriDate();
        console.log('Current Hijri date:', hijriDate);
        
        const hijriString = hijriCalendar.formatHijriDate(hijriDate, currentLang);
        console.log('Formatted Hijri string:', hijriString);
        
        const today = new Date();
        const gregorianString = today.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-GB');
        
        if (currentLang === 'bn') {
            previewElement.innerHTML = `
                <div><strong>গ্রেগরিয়ান:</strong> ${gregorianString}</div>
                <div><strong>হিজরি:</strong> ${hijriString}</div>
            `;
        } else {
            previewElement.innerHTML = `
                <div><strong>Gregorian:</strong> ${gregorianString}</div>
                <div><strong>Hijri:</strong> ${hijriString}</div>
            `;
        }
        
        console.log('Hijri preview updated successfully');
    } catch (error) {
        console.error('Error updating Hijri preview:', error);
        previewElement.innerHTML = '<div style="color: red;">Error loading Hijri date</div>';
    }
}

function updateDashboardWithHijri() {
    console.log('Updating dashboard with Hijri date...');
    
    // Add Hijri date to dashboard header
    const dashboardSection = document.querySelector('#dashboard .overview');
    if (!dashboardSection) {
        console.error('Dashboard overview section not found');
        return;
    }
    
    if (!window.hijriCalendar) {
        console.error('Hijri calendar not available for dashboard');
        return;
    }
    
    try {
        const currentLang = localStorage.getItem('language') || 'en';
        let hijriDateElement = document.getElementById('hijriDateDisplay');
        
        if (!hijriDateElement) {
            hijriDateElement = document.createElement('div');
            hijriDateElement.id = 'hijriDateDisplay';
            hijriDateElement.className = 'hijri-date-dashboard';
            dashboardSection.insertBefore(hijriDateElement, dashboardSection.firstChild);
            console.log('Created new Hijri date element on dashboard');
        }
        
        const hijriDate = hijriCalendar.getCurrentHijriDate();
        const hijriString = hijriCalendar.formatHijriDate(hijriDate, currentLang);
        
        const today = new Date();
        const gregorianString = today.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : 'en-GB');
        
        if (currentLang === 'bn') {
            hijriDateElement.innerHTML = `
                <div class="date-display">
                    <i class="fas fa-moon"></i>
                    <div class="date-text">
                        <div class="hijri-main">${hijriString}</div>
                        <div class="gregorian-sub">${gregorianString}</div>
                    </div>
                </div>
            `;
        } else {
            hijriDateElement.innerHTML = `
                <div class="date-display">
                    <i class="fas fa-moon"></i>
                    <div class="date-text">
                        <div class="hijri-main">${hijriString}</div>
                        <div class="gregorian-sub">${gregorianString}</div>
                    </div>
                </div>
            `;
        }
        
        console.log('Dashboard Hijri date updated successfully');
    } catch (error) {
        console.error('Error updating dashboard with Hijri date:', error);
    }
}

function updateAttendancePageHijri() {
    // Add Hijri date display to attendance controls
    const attendanceControls = document.querySelector('.attendance-controls');
    if (attendanceControls && window.hijriCalendar) {
        const currentLang = localStorage.getItem('language') || 'en';
        let hijriElement = document.getElementById('attendanceHijriDate');
        
        if (!hijriElement) {
            hijriElement = document.createElement('div');
            hijriElement.id = 'attendanceHijriDate';
            hijriElement.className = 'hijri-date-attendance';
            
            // Insert after controls-row
            const controlsRow = attendanceControls.querySelector('.controls-row');
            if (controlsRow) {
                controlsRow.parentNode.insertBefore(hijriElement, controlsRow.nextSibling);
            }
        }
        
        // Get selected date or today
        const selectedDate = document.getElementById('attendanceDate')?.value || new Date().toISOString().split('T')[0];
        const hijriDate = hijriCalendar.getHijriForDate(selectedDate);
        const hijriString = hijriCalendar.formatHijriDate(hijriDate, currentLang);
        
        hijriElement.innerHTML = `
            <div class="hijri-date-info">
                <i class="fas fa-moon"></i>
                <span>${hijriString}</span>
            </div>
        `;
    }
}

function addHijriToReports() {
    // This function can be called when generating reports to include Hijri dates
    const reportTable = document.querySelector('#reportTable');
    if (reportTable && window.hijriCalendar) {
        // Add Hijri date information to report headers if needed
        const currentLang = localStorage.getItem('language') || 'en';
        const startDate = document.getElementById('reportStartDate')?.value;
        const endDate = document.getElementById('reportEndDate')?.value;
        
        if (startDate && endDate) {
            const startHijri = hijriCalendar.getHijriForDate(startDate);
            const endHijri = hijriCalendar.getHijriForDate(endDate);
            
            let reportHeader = document.getElementById('reportHijriHeader');
            if (!reportHeader) {
                reportHeader = document.createElement('div');
                reportHeader.id = 'reportHijriHeader';
                reportHeader.className = 'report-hijri-header';
                reportTable.parentNode.insertBefore(reportHeader, reportTable);
            }
            
            const startHijriStr = hijriCalendar.formatHijriDate(startHijri, currentLang);
            const endHijriStr = hijriCalendar.formatHijriDate(endHijri, currentLang);
            
            reportHeader.innerHTML = `
                <div class="hijri-date-range">
                    <i class="fas fa-moon"></i>
                    <span>${startHijriStr} - ${endHijriStr}</span>
                </div>
            `;
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
