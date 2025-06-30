// Application State
let students = [];
let classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
let attendance = {};
let holidays = [];

// Calendar navigation state
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        initializeLanguage();
        initializeAppName();
        await initializeAppWithDatabase();
        console.log('Madani Maktab app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showModal('Error', 'Failed to initialize the application. Please refresh the page.');
    }
});

async function initializeAppWithDatabase() {
    try {
        console.log('Starting app initialization...');
        
        // Load data from database
        const databaseSuccess = await loadDataFromDatabase();
        
        // Only try to migrate if database is available and we have few students
        if (databaseSuccess && (!students || students.length < 25)) {
            console.log(`Found ${students.length} students, migrating all 25 to PostgreSQL...`);
            await migrateSampleData();
            // Reload data after migration
            await loadDataFromDatabase();
        }
        
        console.log('Data loaded successfully, initializing UI...');
        
        updateClassDropdowns();
        displayClasses();
        displayHolidays();
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = today;
        document.getElementById('reportStartDate').value = today;
        document.getElementById('reportEndDate').value = today;
        
        // Initialize attendance for today if not exists
        if (!attendance[today]) {
            initializeTodayAttendance();
        }
        
        // Load attendance for today and update dashboard
        loadTodayAttendance();
        setTimeout(() => {
            updateDashboard();
            console.log('Dashboard updated after attendance load');
        }, 100);
        
        initializeHijriSettings();
        
        // Listen for date changes
        document.getElementById('attendanceDate').addEventListener('change', function() {
            loadAttendanceForDate();
            updateAttendancePageHijri();
        });
        document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);
        
        // Initialize student list display
        displayStudentsList();
        
        console.log('App initialization completed successfully');
        
    } catch (error) {
        console.error('App initialization failed:', error);
        
        // Final UI initialization regardless of data source
        updateClassDropdowns();
        displayClasses();
        displayHolidays();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = today;
        document.getElementById('reportStartDate').value = today;
        document.getElementById('reportEndDate').value = today;
        
        if (!attendance[today]) {
            initializeTodayAttendance();
        }
        
        loadTodayAttendance();
        updateDashboard();
        
        document.getElementById('attendanceDate').addEventListener('change', loadAttendanceForDate);
        document.getElementById('classFilter').addEventListener('change', loadAttendanceForDate);
        
        console.log('App initialized with fallback data');
    }
}

async function loadDataFromDatabase() {
    try {
        // Load data from JSON file database
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            students = await studentsResponse.json();
        } else {
            console.error('Failed to load students from JSON database');
            students = [];
        }
        
        const attendanceResponse = await fetch('/api/attendance');
        if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            console.log('Loaded attendance data from JSON database:', attendanceData);
            
            // JSON database returns object format directly
            attendance = attendanceData || {};
            console.log('Final attendance object:', attendance);
        } else {
            console.error('Failed to load attendance from JSON database');
            attendance = {};
        }
        
        const holidaysResponse = await fetch('/api/holidays');
        if (holidaysResponse.ok) {
            holidays = await holidaysResponse.json();
        } else {
            console.error('Failed to load holidays from JSON database');
            holidays = [];
        }
        
        classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        
        console.log(`Loaded ${students.length} students from JSON database`);
        
        // Update dashboard immediately after data load
        updateDashboard();
        
    } catch (error) {
        console.error('JSON database connection failed, using fallback data:', error);
        // Fallback to localStorage if database unavailable
        students = JSON.parse(localStorage.getItem('madaniMaktabStudents')) || [];
        classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        attendance = JSON.parse(localStorage.getItem('madaniMaktabAttendance')) || {};
        holidays = JSON.parse(localStorage.getItem('madaniMaktabHolidays')) || [];
        
        // If no data in localStorage, add sample data
        if (students.length === 0) {
            console.log('No data found, adding sample students to localStorage');
            addSampleDataFallback();
        }
        
        // Update dashboard with fallback data
        updateDashboard();
        return false; // Indicate fallback was used
    }
    return true; // Indicate database was used successfully
}

async function migrateSampleData() {
    console.log('Creating 25 sample students in JSON database...');
    
    try {
        const response = await fetch('/api/create_sample_data', {
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
            console.log('JSON database creation failed, using localStorage');
            addSampleDataFallback();
        }
    } catch (error) {
        console.error('JSON database creation failed, using fallback:', error);
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
    } else if (sectionId === 'registration') {
        displayStudentsList();
        // Show student list by default, hide form
        const studentsListContainer = document.getElementById('studentsListContainer');
        const studentRegistrationForm = document.getElementById('studentRegistrationForm');
        if (studentsListContainer && studentRegistrationForm) {
            studentsListContainer.style.display = 'block';
            studentRegistrationForm.style.display = 'none';
        }
    }
}

// Student Registration Functions
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    registerStudent();
});

async function registerStudent() {
    const formData = {
        id: `ST${Date.now().toString().slice(-6)}`, // Generate student ID
        name: document.getElementById('studentName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        mobileNumber: document.getElementById('mobile').value.trim(),
        district: document.getElementById('district').value.trim(),
        upazila: document.getElementById('upazila').value.trim(),
        class: document.getElementById('studentClass').value,
        registrationDate: new Date().toISOString().split('T')[0]
    };
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.mobileNumber || 
        !formData.district || !formData.upazila || !formData.class) {
        showModal(t('error'), t('fillAllFields'));
        return;
    }
    
    // Check for duplicate mobile number
    if (students.some(student => student.mobileNumber === formData.mobileNumber)) {
        showModal(t('error'), t('duplicateMobile'));
        return;
    }
    
    try {
        // Register student with backend (will auto-generate roll number)
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Student registered successfully:', result.student);
            
            // Add to local array
            students.push(result.student);
    
    // Reset form
    document.getElementById('studentForm').reset();
    
            // Refresh student list if on register page
            displayStudentsList();
            
            showModal(t('success'), `${formData.name} ${t('studentRegistered')} - Roll Number: ${result.student.rollNumber}`);
            updateDashboard();
        } else {
            const error = await response.json();
            showModal(t('error'), error.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showModal(t('error'), 'Network error. Please try again.');
    }
}

// Student Management Functions
function displayStudentsList() {
    const studentsListContainer = document.getElementById('studentsListContainer');
    if (!studentsListContainer) return;
    
    if (students.length === 0) {
        studentsListContainer.innerHTML = `
            <div class="no-students-message">
                <i class="fas fa-user-graduate"></i>
                <p>No students registered yet. Click "Register New Student" to add students.</p>
            </div>
        `;
        return;
    }
    
    // Sort students by class and roll number
    const sortedStudents = [...students].sort((a, b) => {
        const classA = parseInt(a.class?.split(' ')[1] || 0);
        const classB = parseInt(b.class?.split(' ')[1] || 0);
        if (classA !== classB) return classA - classB;
        return parseInt(a.rollNumber || 0) - parseInt(b.rollNumber || 0);
    });
    
    studentsListContainer.innerHTML = `
        <div class="students-list">
            <div class="students-list-header">
                <h3><i class="fas fa-list"></i> All Registered Students (${students.length})</h3>
                <button onclick="showStudentRegistrationForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Register New Student
                </button>
            </div>
            <div class="students-table-container">
                <table class="students-table">
                    <thead>
                        <tr>
                            <th>Roll No.</th>
                            <th>Full Name</th>
                            <th>Class</th>
                            <th>Mobile</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedStudents.map(student => `
                            <tr>
                                <td><strong>${student.rollNumber || 'N/A'}</strong></td>
                                <td>${student.name} bin ${student.fatherName}</td>
                                <td><span class="class-badge">${student.class}</span></td>
                                <td>${student.mobileNumber}</td>
                                <td class="actions">
                                    <button onclick="editStudent('${student.id}')" class="btn btn-sm btn-secondary" title="Edit Student">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteStudent('${student.id}')" class="btn btn-sm btn-danger" title="Delete Student">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function showStudentRegistrationForm() {
    document.getElementById('studentsListContainer').style.display = 'none';
    document.getElementById('studentRegistrationForm').style.display = 'block';
}

function hideStudentRegistrationForm() {
    document.getElementById('studentsListContainer').style.display = 'block';
    document.getElementById('studentRegistrationForm').style.display = 'none';
    document.getElementById('studentForm').reset();
}

async function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Populate form with student data
    document.getElementById('studentName').value = student.name || '';
    document.getElementById('fatherName').value = student.fatherName || '';
    document.getElementById('mobile').value = student.mobileNumber || '';
    document.getElementById('district').value = student.district || '';
    document.getElementById('upazila').value = student.upazila || '';
    document.getElementById('studentClass').value = student.class || '';
    
    // Show form in edit mode
    showStudentRegistrationForm();
    
    // Change form submit to update
    const form = document.getElementById('studentForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await updateStudent(studentId);
    };
    
    // Update form title and button
    document.querySelector('#studentRegistrationForm h3').textContent = 'Edit Student';
    document.querySelector('#studentRegistrationForm .btn-primary').textContent = 'Update Student';
}

async function updateStudent(studentId) {
    const formData = {
        id: studentId,
        name: document.getElementById('studentName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        mobileNumber: document.getElementById('mobile').value.trim(),
        district: document.getElementById('district').value.trim(),
        upazila: document.getElementById('upazila').value.trim(),
        class: document.getElementById('studentClass').value,
    };
    
    try {
        const response = await fetch(`/api/students/${studentId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            // Update local array
            const index = students.findIndex(s => s.id === studentId);
            if (index !== -1) {
                students[index] = result.student;
            }
            
            hideStudentRegistrationForm();
            displayStudentsList();
            showModal(t('success'), 'Student updated successfully');
            
            // Reset form
            resetStudentForm();
        } else {
            const error = await response.json();
            showModal(t('error'), error.error || 'Update failed');
        }
    } catch (error) {
        console.error('Update error:', error);
        showModal(t('error'), 'Network error. Please try again.');
    }
}

async function deleteStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    if (confirm(`Are you sure you want to delete ${student.name} bin ${student.fatherName}? This action cannot be undone.`)) {
        try {
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local array
                students = students.filter(s => s.id !== studentId);
                
                displayStudentsList();
    updateDashboard();
                showModal(t('success'), 'Student deleted successfully');
            } else {
                const error = await response.json();
                showModal(t('error'), error.error || 'Deletion failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showModal(t('error'), 'Network error. Please try again.');
        }
    }
}

function resetStudentForm() {
    const form = document.getElementById('studentForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        registerStudent();
    };
    
    document.querySelector('#studentRegistrationForm h3').textContent = 'Register New Student';
    document.querySelector('#studentRegistrationForm .btn-primary').textContent = 'Register Student';
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
            <span class="class-name" id="className-${className.replace(/\s+/g, '')}">${className}</span>
            <div class="class-actions">
                <button onclick="editClass('${className}')" class="btn btn-secondary btn-small" title="Edit Class">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteClass('${className}')" class="btn btn-danger btn-small" title="Delete Class">
                    <i class="fas fa-trash"></i>
            </button>
            </div>
        </div>
    `).join('');
}

function editClass(oldClassName) {
    const classNameSpan = document.getElementById(`className-${oldClassName.replace(/\s+/g, '')}`);
    const currentName = classNameSpan.textContent;
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'class-edit-input';
    input.style.width = '150px';
    
    // Replace span with input
    classNameSpan.parentNode.replaceChild(input, classNameSpan);
    input.focus();
    input.select();
    
    // Handle save/cancel
    const saveEdit = () => {
        const newName = input.value.trim();
        if (newName && newName !== oldClassName) {
            if (classes.includes(newName)) {
                showModal(t('error'), t('classExists'));
                return;
            }
            
            // Update class name
            const classIndex = classes.indexOf(oldClassName);
            if (classIndex !== -1) {
                classes[classIndex] = newName;
            }
            
            // Update students' class names
            students.forEach(student => {
                if (student.class === oldClassName) {
                    student.class = newName;
                }
            });
            
            saveData();
            updateClassDropdowns();
            displayClasses();
            updateDashboard();
            
            showModal(t('success'), `Class renamed from "${oldClassName}" to "${newName}"`);
        } else {
            // Cancel edit
            displayClasses();
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            displayClasses();
        }
    });
}

// Dashboard Functions
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Updating dashboard for date:', today);
    console.log('Total students:', students.length);
    console.log('Today attendance data:', attendance[today]);
    
    // Update total students
    document.getElementById('totalStudents').textContent = students.length;
    
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
        
        // On holidays, show all students as present
        document.getElementById('presentToday').textContent = students.length;
        document.getElementById('absentToday').textContent = 0;
        document.getElementById('attendanceRate').textContent = '100%';
    } else {
        if (holidayNotice) {
            holidayNotice.style.display = 'none';
        }
        
        const todayAttendance = attendance[today] || {};
        console.log('Processing attendance for non-holiday:', todayAttendance);
        
        let presentCount = 0;
        let absentCount = 0;
        
        // Count attendance properly
        for (const studentId in todayAttendance) {
            const att = todayAttendance[studentId];
            if (att && att.status === 'present') {
                presentCount++;
            } else if (att && att.status === 'absent') {
                absentCount++;
            }
        }
        
        const unmarkedCount = students.length - presentCount - absentCount;
        
        console.log('Attendance counts - Present:', presentCount, 'Absent:', absentCount, 'Unmarked:', unmarkedCount);
        
        // Force update DOM elements with immediate value changes
        const presentElement = document.getElementById('presentToday');
        const absentElement = document.getElementById('absentToday');
        const rateElement = document.getElementById('attendanceRate');
        const totalElement = document.getElementById('totalStudents');
        
        if (totalElement) {
            totalElement.textContent = students.length;
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
        
        console.log('Final dashboard values - Total:', students.length, 'Present:', presentCount, 'Absent:', absentCount, 'Rate:', attendanceRate + '%');
        
        if (rateElement) {
            rateElement.textContent = `${attendanceRate}%`;
            rateElement.style.color = attendanceRate >= 80 ? '#27ae60' : attendanceRate >= 60 ? '#f39c12' : '#e74c3c';
        }
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
            const displayRoll = student.rollNumber || 'N/A';
            html += `<li>Roll: ${displayRoll} - ${student.name} bin ${student.fatherName} - ${reason}</li>`;
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
                status: 'present', // Default to present instead of unmarked
                reason: ''
            };
        });
        // Don't auto-save here - wait for user to click Save button
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
        const status = studentAttendance.status;
        const isAbsent = status === 'absent';
        const isPresent = status === 'present';
        
        // Set toggle appearance based on actual status
        let toggleClass = isAbsent ? 'absent' : 'present';
        let nextStatus = isAbsent ? 'present' : 'absent';
        
        return `
            <div class="student-row">
                <div class="student-info-with-toggle">
                    <div class="student-info">
                        <h4>Roll: ${student.rollNumber || 'N/A'} - <span class="clickable-name" onclick="showStudentDetail('${student.id}')">${student.name} bin ${student.fatherName}</span></h4>
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
    
    // Only update in memory, don't save to database yet
    attendance[date][studentId] = {
        status: status || 'present',
        reason: status === 'present' ? '' : (attendance[date][studentId]?.reason || '')
    };
    
    // Refresh the display without saving to database
    loadAttendanceForDate();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.textContent = 'Save Changes*';
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
        saveButton.textContent = 'Save Changes*';
    }
}

async function saveAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    
    console.log('Saving attendance for date:', selectedDate);
    
    // Prevent saving attendance on holidays
    if (isHoliday(selectedDate)) {
        showModal(t('error'), 'Cannot save attendance on holidays');
        return;
    }
    
    // Attendance data is already updated in memory by toggleAttendance function
    // Count students who have been manually changed (absent students, since present is default)
    let markedCount = 0;
    if (attendance[selectedDate]) {
        Object.values(attendance[selectedDate]).forEach(record => {
            if (record.status === 'absent') {
                markedCount++; // Count only students marked as absent (changed from default)
            }
        });
    }
    
    console.log(`Found ${markedCount} marked students for ${selectedDate}`);
    
    console.log('Current attendance object before save:', attendance);
    
    try {
        // Save to JSON database
        await saveDataToDatabase();
        console.log('Attendance saved successfully to database');
        
        // Reset save button appearance
        const saveButton = document.querySelector('.btn-save-attendance');
        if (saveButton) {
            saveButton.style.background = '#27ae60';
            saveButton.textContent = 'Saved!';
            setTimeout(() => {
                saveButton.textContent = 'Save Attendance';
            }, 2000);
        }
        
        // Force dashboard update after saving attendance
        if (typeof forceUpdateDashboard === 'function') {
            forceUpdateDashboard();
        } else {
            updateDashboard();
        }
        
        showModal(t('success'), `Attendance saved successfully! ${markedCount} students marked absent.`);
    } catch (error) {
        console.error('Error saving attendance:', error);
        showModal(t('error'), 'Failed to save attendance. Please try again.');
    }
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
    
    // Refresh display without saving to database
    loadAttendanceForDate();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.textContent = 'Save Changes*';
    }
    
    showModal(t('success'), `${filteredStudents.length} students confirmed present`);
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
    
    // Refresh display without saving to database
    loadAttendanceForDate();
    closeBulkAbsentModal();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.textContent = 'Save Changes*';
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
    
    // Refresh display without saving to database
    loadAttendanceForDate();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.textContent = 'Save Changes*';
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
                        <span class="info-label">Full Name:</span>
                        <span class="info-value">${student.name} bin ${student.fatherName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Roll Number:</span>
                        <span class="info-value">${student.rollNumber || 'N/A'}</span>
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
                        <span class="info-label">Roll Number:</span>
                        <span class="info-value">${student.rollNumber || 'N/A'}</span>
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
                    <span>Attendance Taken</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color attendance-missed"></span>
                    <span>Attendance NOT Taken</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color holiday-day"></span>
                    <span>Holiday</span>
                </div>
                <!-- Weekend legend removed - weekends now treated as school days -->
                <!--
                <div class="legend-item">
                    <span class="legend-color weekend-day"></span>
                    <span>Weekend</span>
                </div>
                -->
                <div class="legend-item">
                    <span class="legend-color future-day"></span>
                    <span>Future Date</span>
                </div>
            </div>
            <div class="attendance-summary" id="attendanceSummary">
                ${generateAttendanceSummary(displayYear, displayMonth)}
            </div>
        </div>
    `;
    
    return calendarHTML;
}

// Calendar navigation functions
function navigateCalendar(direction) {
    currentCalendarMonth += direction;
    
    if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    } else if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    }
    
    refreshCalendar();
}

function changeCalendarMonth() {
    const monthSelector = document.getElementById('monthSelector');
    if (monthSelector) {
        currentCalendarMonth = parseInt(monthSelector.value);
        refreshCalendar();
    }
}

function changeCalendarYear() {
    const yearSelector = document.getElementById('yearSelector');
    if (yearSelector) {
        currentCalendarYear = parseInt(yearSelector.value);
        refreshCalendar();
    }
}

function refreshCalendar() {
    const calendarSection = document.querySelector('.attendance-tracking-section');
    if (calendarSection) {
        const newCalendarHTML = generateAttendanceTrackingCalendar(currentCalendarMonth, currentCalendarYear);
        calendarSection.outerHTML = newCalendarHTML;
    }
}

function goToCurrentMonth() {
    const today = new Date();
    currentCalendarMonth = today.getMonth();
    currentCalendarYear = today.getFullYear();
    refreshCalendar();
}

function generateCalendarDays(year, month, startDayOfWeek, daysInMonth) {
    let calendarHTML = '';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Ensure global variables are initialized
    if (!window.attendance) {
        window.attendance = {};
    }
    if (!window.holidays) {
        window.holidays = [];
    }
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        
        let dayClass = 'calendar-day';
        let dayTitle = dateStr;
        
        // Check if it's a future date
        if (date > today) {
            dayClass += ' future-day';
            dayTitle = 'Future date';
        }
        // Check if it's a holiday
        else if (isHoliday(dateStr)) {
            dayClass += ' holiday-day';
            const holidayName = getHolidayName(dateStr);
            dayTitle = `Holiday: ${holidayName}`;
        }
        // Check if it's weekend (Friday/Saturday in Islamic context, or Saturday/Sunday)
        // Commented out - weekends are now treated as regular school days
        /*
        else if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday/Saturday
            dayClass += ' weekend-day';
            dayTitle = 'Weekend';
        }
        */
        // Check if attendance was taken
        else if (attendance[dateStr] && Object.keys(attendance[dateStr]).length > 0) {
            dayClass += ' attendance-taken';
            dayTitle = `Attendance taken on ${dateStr}`;
        }
        // School day but no attendance taken
        else {
            dayClass += ' attendance-missed';
            dayTitle = `Attendance NOT taken on ${dateStr}`;
        }
        
        calendarHTML += `
            <div class="${dayClass}" title="${dayTitle}">
                <span class="day-number">${day}</span>
            </div>
        `;
    }
    
    return calendarHTML;
}

function generateAttendanceSummary(year, month) {
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ensure global variables are initialized
    if (!window.attendance) {
        window.attendance = {};
    }
    if (!window.holidays) {
        window.holidays = [];
    }
    
    let totalSchoolDays = 0;
    let attendanceTakenDays = 0;
    let missedDays = 0;
    let holidayDays = 0;
    // let weekendDays = 0; // Removed - weekends now treated as school days
    
    // Count each type of day in the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        // Skip future dates
        if (date > today) continue;
        
        // Check day type
        if (isHoliday(dateStr)) {
            holidayDays++;
        } else {
            // This is a school day (now includes former weekend days)
            totalSchoolDays++;
            
            if (attendance[dateStr] && Object.keys(attendance[dateStr]).length > 0) {
                attendanceTakenDays++;
            } else {
                missedDays++;
            }
        }
    }
    
    const completionPercentage = totalSchoolDays > 0 ? Math.round((attendanceTakenDays / totalSchoolDays) * 100) : 0;
    
    return `
        <div class="summary-stats">
            <h4>📊 Monthly Attendance Summary</h4>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${totalSchoolDays}</div>
                    <div class="stat-label">Total School Days</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${attendanceTakenDays}</div>
                    <div class="stat-label">Attendance Taken</div>
                </div>
                <div class="stat-card danger">
                    <div class="stat-number">${missedDays}</div>
                    <div class="stat-label">Missed Days</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${completionPercentage}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>
            <div class="additional-stats">
                <p><strong>Holidays this month:</strong> ${holidayDays} days</p>
            </div>
        </div>
    `;
}

// Helper functions for calendar - removed duplicates, keeping the more flexible version below

function showAttendanceCalendar() {
    try {
        console.log('Starting showAttendanceCalendar function...');
        
        const reportsSection = document.getElementById('reports');
        if (!reportsSection) {
            console.error('Reports section not found');
            return;
        }
        
        const existingCalendar = reportsSection.querySelector('.attendance-tracking-section');
        const toggleButton = reportsSection.querySelector('.calendar-toggle button');
        
        if (!toggleButton) {
            console.error('Toggle button not found');
            return;
        }
        
        if (existingCalendar) {
            // If calendar exists, toggle its visibility
            console.log('Calendar exists, toggling visibility...');
            if (existingCalendar.style.display === 'none') {
                existingCalendar.style.display = 'block';
                toggleButton.innerHTML = '📅 Hide Attendance Calendar';
                console.log('Calendar shown');
            } else {
                existingCalendar.style.display = 'none';
                toggleButton.innerHTML = '📅 Show Attendance Tracking Calendar';
                console.log('Calendar hidden');
            }
        } else {
            // Create new calendar
            console.log('Creating new calendar...');
            console.log('Attendance data:', Object.keys(attendance).length, 'dates');
            console.log('Holidays data:', holidays.length, 'holidays');
            
            const calendarHTML = generateAttendanceTrackingCalendar();
            const calendarToggle = reportsSection.querySelector('.calendar-toggle');
            
            if (calendarToggle) {
                calendarToggle.insertAdjacentHTML('afterend', calendarHTML);
                toggleButton.innerHTML = '📅 Hide Attendance Calendar';
                console.log('Calendar created and inserted successfully');
            } else {
                console.error('Calendar toggle section not found');
            }
        }
    } catch (error) {
        console.error('Error in showAttendanceCalendar:', error);
        showModal('Error', 'Failed to load attendance calendar. Please try again.');
    }
}

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
    
    // Check if attendance has been taken for any date in the range
    const nonHolidayDates = dateRange.filter(date => !isHoliday(date));
    const hasAttendanceData = nonHolidayDates.some(date => attendance[date] && Object.keys(attendance[date]).length > 0);
    
    if (!hasAttendanceData) {
        // Show message if no attendance data exists for the selected period
        document.getElementById('reportResults').innerHTML = `
            <div class="holiday-notice">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Attendance not taken for this date</h3>
                <p>No attendance records found for the selected date range. Please take attendance first before generating reports.</p>
                <p><strong>Selected period:</strong> ${startDate} to ${endDate}</p>
            </div>
        `;
        return;
    }
    
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
            id: student.rollNumber || 'N/A',
            name: student.name,
            fullName: `Roll: ${student.rollNumber || 'N/A'} - ${student.name} bin ${student.fatherName}`,
            presentDays,
            absentDays,
            attendancePercentage
        };
    });
    
    // Reset filters and sort direction only when generating new report
    columnFilters = { fullName: '' }; // Only reset fullName filter
    sortDirection = {};
    
    renderReportTable(startDate, endDate);
    addHijriToReports();
}

function renderReportTable(startDate, endDate) {
    // Apply filters - only filter by student name (fullName column)
    let filteredData = currentReportData.filter(row => {
        // Only filter by fullName column
        if (columnFilters.fullName && columnFilters.fullName.trim() !== '') {
            const filterValue = columnFilters.fullName.toLowerCase();
            const cellValue = row.fullName.toString().toLowerCase();
            return cellValue.includes(filterValue);
        }
        return true;
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
                                    <input type="text" 
                                           id="nameFilter" 
                                           class="column-filter" 
                                           placeholder="Filter by name..." 
                                           onkeyup="filterColumn('fullName', this.value)" 
                                           onclick="event.stopPropagation();"
                                           style="width: 150px; padding: 4px; font-size: 12px; border: 1px solid #ccc; background: white; color: black; z-index: 1001; position: relative;"
                                           >
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
    // Only handle fullName column filtering
    if (column === 'fullName') {
        // Don't re-render if value hasn't changed
        if (columnFilters[column] === value) {
            return;
        }
        
    columnFilters[column] = value;
        
        // Store cursor position before re-render
        const filterInput = document.getElementById('nameFilter');
        const cursorPosition = filterInput ? filterInput.selectionStart : 0;
    
    // Re-render table with filters
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    renderReportTable(startDate, endDate);
        
        // Restore focus and cursor position after re-render
        setTimeout(() => {
            const newFilterInput = document.getElementById('nameFilter');
            if (newFilterInput) {
                newFilterInput.value = value;
                newFilterInput.focus();
                // Restore cursor position
                if (cursorPosition >= 0) {
                    newFilterInput.setSelectionRange(cursorPosition, cursorPosition);
                }
            }
        }, 50);
    }
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
    if (!holidays || holidays.length === 0) return false;
    
    return holidays.some(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        
        // Handle both date strings and date objects
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        // Convert to date strings for comparison (YYYY-MM-DD format)
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
}

function getHolidayName(date) {
    if (!holidays || holidays.length === 0) return '';
    
    const holiday = holidays.find(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        
        // Handle both date strings and date objects
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        // Convert to date strings for comparison (YYYY-MM-DD format)
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
    return holiday ? holiday.name : '';
}

async function saveDataToDatabase() {
    try {
        // Save attendance to JSON server (send entire attendance object)
        const attendanceResponse = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
            body: JSON.stringify(attendance)
        });
        
        if (!attendanceResponse.ok) {
            throw new Error(`Attendance save failed: ${attendanceResponse.status}`);
        }
        
        // Save holidays to JSON server (send each holiday individually)  
        const holidayPromises = holidays.map(holiday => {
            return fetch('/api/holidays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: holiday.date || holiday.startDate,
                    name: holiday.name
                })
            });
        });
        
        const holidayResponses = await Promise.all(holidayPromises);
        for (const response of holidayResponses) {
            if (!response.ok) {
                console.warn(`Holiday save failed: ${response.status}`);
                // Don't throw error for holidays, just warn
            }
        }
        
        console.log('Data saved to JSON server successfully');
        
    } catch (error) {
        console.error('Error saving data to database:', error);
        // Fallback to localStorage
        try {
            localStorage.setItem('madaniMaktabStudents', JSON.stringify(students));
            localStorage.setItem('madaniMaktabClasses', JSON.stringify(classes));
            localStorage.setItem('madaniMaktabAttendance', JSON.stringify(attendance));
            localStorage.setItem('madaniMaktabHolidays', JSON.stringify(holidays));
            console.log('Data saved to localStorage as fallback');
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
    const dashboardSection = document.querySelector('#dashboard');
    if (!dashboardSection) {
        console.error('Dashboard section not found');
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
            // Insert after h2 title
            const titleElement = dashboardSection.querySelector('h2');
            if (titleElement) {
                titleElement.parentNode.insertBefore(hijriDateElement, titleElement.nextSibling);
            } else {
                dashboardSection.insertBefore(hijriDateElement, dashboardSection.firstChild);
            }
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

// Application name functions
function initializeAppName() {
    const savedName = localStorage.getItem('madaniMaktabAppName');
    const input = document.getElementById('appNameInput');
    if (input && savedName) {
        input.value = savedName;
    }
    updateHeaderTexts();
}

function saveAppName() {
    const input = document.getElementById('appNameInput');
    if (!input) return;
    const newName = input.value.trim();
    if (!newName) {
        showModal(t('error'), t('enterAppName'));
        return;
    }
    localStorage.setItem('madaniMaktabAppName', newName);
    updateHeaderTexts();
    showModal(t('success'), t('appNameUpdated'));
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