// Application State
let students = [];
let classes = ['প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি'];
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

function convertBengaliToEnglishNumbers(str) {
    if (!str) return str;
    const bengaliToEnglish = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return str.toString().replace(/[০-৯]/g, match => bengaliToEnglish[match]);
}

function parseRollNumber(rollNumber) {
    if (!rollNumber) return 0;
    const englishNumber = convertBengaliToEnglishNumbers(rollNumber);
    return parseInt(englishNumber) || 0;
}

function getClassNumber(className) {
    if (!className) return 0;
    const bengaliClassMap = {
        'প্রথম শ্রেণি': 1,
        'দ্বিতীয় শ্রেণি': 2,
        'তৃতীয় শ্রেণি': 3,
        'চতুর্থ শ্রেণি': 4,
        'পঞ্চম শ্রেণি': 5
    };
    
    if (bengaliClassMap[className]) {
        return bengaliClassMap[className];
    }
    
    // Fallback to extracting number from class name
    const match = className.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
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
        
        // Load data from database only
            await loadDataFromDatabase();
        
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
        document.getElementById('classFilter').addEventListener('change', function() {
            loadAttendanceForDate();
        });
        
        // Initialize student list display
        displayStudentsList();
        
        console.log('App initialization completed successfully');
        
    } catch (error) {
        console.error('App initialization failed:', error);
        showModal('Database Error', 'Failed to connect to the database. Please ensure the server is running and try refreshing the page.');
    }
}

async function loadDataFromDatabase() {
    try {
        // Load students from JSON database
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            students = await studentsResponse.json();
        } else {
            throw new Error('Failed to load students from database');
        }
        
        // Load attendance from JSON database
        const attendanceResponse = await fetch('/api/attendance');
        if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            console.log('Loaded attendance data from database:', attendanceData);
            attendance = attendanceData || {};
            console.log('Final attendance object:', attendance);
        } else {
            throw new Error('Failed to load attendance from database');
        }
        
        // Load holidays from JSON database
        const holidaysResponse = await fetch('/api/holidays');
        if (holidaysResponse.ok) {
            holidays = await holidaysResponse.json();
        } else {
            throw new Error('Failed to load holidays from database');
        }
        
        // Set default classes
        classes = ['প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি'];
        
        console.log(`Loaded ${students.length} students from database`);
        
        // Update dashboard after data load
        updateDashboard();
        
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error; // Re-throw to be handled by calling function
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
async function showSection(sectionId) {
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
        await loadAttendanceForDate();
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

function generateStudentId() {
    // Generate clean sequential internal ID (ST026, ST027, etc.)
    let maxIdNumber = 0;
    
    students.forEach(student => {
        if (student.id && student.id.startsWith('ST')) {
            const idNumber = parseInt(student.id.substring(2));
            if (!isNaN(idNumber) && idNumber > maxIdNumber) {
                maxIdNumber = idNumber;
            }
        }
    });
    
    const nextId = maxIdNumber + 1;
    return `ST${nextId.toString().padStart(3, '0')}`; // ST026, ST027, ST028...
}

async function registerStudent() {
    const formData = {
        id: generateStudentId(), // Generate internal ID (invisible to users)
        name: document.getElementById('studentName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        mobileNumber: document.getElementById('mobile').value.trim(),
        district: document.getElementById('district').value.trim(),
        upazila: document.getElementById('upazila').value.trim(),
        class: document.getElementById('studentClass').value,
        registrationDate: new Date().toISOString().split('T')[0]
    };
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.rollNumber || !formData.mobileNumber || 
        !formData.district || !formData.upazila || !formData.class) {
        showModal(t('error'), t('fillAllFields'));
        return;
    }
    

    
    // Check for duplicate roll number
    if (students.some(student => student.rollNumber === formData.rollNumber)) {
        showModal(t('error'), `Roll number ${formData.rollNumber} already exists. Please choose a different roll number.`);
        return;
    }
    
    try {
        // Register student with backend (with manual roll number)
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
            <div class="students-list">
                <div class="students-list-header">
                    <h3><i class="fas fa-list"></i> ${t('allRegisteredStudents')} (0)</h3>
                    <div class="students-list-buttons">
                        <button onclick="showStudentRegistrationForm()" class="btn btn-primary">
                            <i class="fas fa-plus"></i> ${t('registerNewStudent')}
                        </button>
                        <button onclick="showBulkImport()" class="btn btn-secondary">
                            <i class="fas fa-upload"></i> ${t('bulkImport')}
                        </button>
                    </div>
                </div>
                <div class="no-students-message">
                    <i class="fas fa-user-graduate"></i>
                    <p>${t('noStudentsRegisteredYet')}</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort students by class and roll number
    const sortedStudents = [...students].sort((a, b) => {
        const classA = getClassNumber(a.class);
        const classB = getClassNumber(b.class);
        if (classA !== classB) return classA - classB;
        
        const rollA = parseRollNumber(a.rollNumber);
        const rollB = parseRollNumber(b.rollNumber);
        return rollA - rollB;
    });
    
    // Apply search filters
    let filteredStudents = applyStudentFilters(sortedStudents);

    studentsListContainer.innerHTML = `
        <div class="students-list">
            <div class="students-list-header">
                <h3><i class="fas fa-list"></i> ${t('allRegisteredStudents')} (${filteredStudents.length}/${students.length})</h3>
                <div class="students-list-buttons">
                    <button onclick="showStudentRegistrationForm()" class="btn btn-primary">
                        <i class="fas fa-plus"></i> ${t('registerNewStudent')}
                    </button>
                    <button onclick="showBulkImport()" class="btn btn-secondary">
                        <i class="fas fa-upload"></i> ${t('bulkImport')}
                    </button>
                </div>
            </div>
            <div class="students-table-container">
                <table class="students-table">
                    <thead>
                        <tr>
                            <th>${t('rollNo')}</th>
                            <th>${t('fullName')}</th>
                            <th>${t('class')}</th>
                            <th>${t('mobile')}</th>
                            <th>${t('actions')}</th>
                        </tr>
                        <tr class="filter-row">
                            <th>
                                <input type="text" id="rollFilter" placeholder="${t('searchRoll')}" 
                                       value="${studentFilters.roll}" 
                                       oninput="updateStudentFilter('roll', this.value)" class="column-filter">
                            </th>
                            <th>
                                <input type="text" id="nameFilter" placeholder="${t('searchName')}" 
                                       value="${studentFilters.name}" 
                                       oninput="updateStudentFilter('name', this.value)" class="column-filter">
                            </th>
                            <th>
                                <select id="classFilterReg" onchange="updateStudentFilter('class', this.value)" class="column-filter">
                                    <option value="">${t('allClasses')}</option>
                                    ${classes.map(className => 
                                        `<option value="${className}" ${studentFilters.class === className ? 'selected' : ''}>${className}</option>`
                                    ).join('')}
                                </select>
                            </th>
                            <th>
                                <input type="text" id="mobileFilter" placeholder="${t('searchMobile')}" 
                                       value="${studentFilters.mobile}" 
                                       oninput="updateStudentFilter('mobile', this.value)" class="column-filter">
                            </th>
                            <th>
                                <button onclick="clearStudentFilters()" class="btn btn-sm btn-secondary" title="${t('clearAllFilters')}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredStudents.map(student => `
                            <tr>
                                <td><strong>${student.rollNumber || 'N/A'}</strong></td>
                                <td>
                                    <span class="clickable-name" onclick="showStudentDetail('${student.id}', 'registration')" title="Click to view details">
                                        ${student.name} বিন ${student.fatherName}
                                    </span>
                                </td>
                                <td><span class="class-badge">${student.class}</span></td>
                                <td>${student.mobileNumber}</td>
                                <td class="actions">
                                    <button onclick="editStudent('${student.id}')" class="btn btn-sm btn-secondary" title="${t('editStudent')}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteStudent('${student.id}')" class="btn btn-sm btn-danger" title="${t('deleteStudent')}">
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
    document.getElementById('rollNumber').value = student.rollNumber || '';
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
    document.querySelector('#studentRegistrationForm h3').textContent = t('editStudent');
    document.querySelector('#studentRegistrationForm .btn-primary').textContent = t('updateStudent');
}

async function updateStudent(studentId) {
    const formData = {
        id: studentId,
        name: document.getElementById('studentName').value.trim(),
        fatherName: document.getElementById('fatherName').value.trim(),
        rollNumber: document.getElementById('rollNumber').value.trim(),
        mobileNumber: document.getElementById('mobile').value.trim(),
        district: document.getElementById('district').value.trim(),
        upazila: document.getElementById('upazila').value.trim(),
        class: document.getElementById('studentClass').value,
    };
    
    // Validation
    if (!formData.name || !formData.fatherName || !formData.rollNumber || !formData.mobileNumber || 
        !formData.district || !formData.upazila || !formData.class) {
        showModal(t('error'), t('fillAllFields'));
        return;
    }
    
    // Check for duplicate roll number (excluding current student)
    if (students.some(student => student.rollNumber === formData.rollNumber && student.id !== studentId)) {
        showModal(t('error'), `Roll number ${formData.rollNumber} already exists. Please choose a different roll number.`);
        return;
    }
    
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
    
    if (confirm(`${t('confirmDeleteStudent')} ${student.name} বিন ${student.fatherName}? ${t('actionCannotBeUndone')}`)) {
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
    
    document.querySelector('#studentRegistrationForm h3').textContent = t('registerNewStudent');
    document.querySelector('#studentRegistrationForm .btn-primary').textContent = t('registerStudentBtn');
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
    
    // Update class filter options in student registration table
    updateClassFilterOptions();
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
            html += `<li>Roll: ${displayRoll} - ${student.name} বিন ${student.fatherName} - ${reason}</li>`;
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

async function loadTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    await loadAttendanceForDate();
}

async function loadAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const attendanceList = document.getElementById('attendanceList');
    
    if (!selectedDate) {
        showModal(t('error'), t('pleaseSelectDate'));
        return;
    }
    
    // Initialize attendance record for the day if it doesn't exist
    if (!attendance[selectedDate]) {
        attendance[selectedDate] = {};
    }
    
    // Auto-copy from previous day if no attendance exists for this date
    if (Object.keys(attendance[selectedDate]).length === 0) {
        await autoCopyFromPreviousDay(selectedDate);
    }
    
    let filteredStudents = getFilteredStudents();
    
    // Sort students by class and then roll number
    filteredStudents.sort((a, b) => {
        const classA = getClassNumber(a.class);
        const classB = getClassNumber(b.class);
        if (classA !== classB) return classA - classB;
        return parseRollNumber(a.rollNumber) - parseRollNumber(b.rollNumber);
    });
    
    updateFilteredStudentCount(filteredStudents.length);
    
    if (filteredStudents.length === 0) {
        attendanceList.innerHTML = `<p>${t('noStudentsFound')}</p>`;
        return;
    }
    
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
                        <h4>Roll: ${student.rollNumber || 'N/A'} - <span class="clickable-name" onclick="showStudentDetail('${student.id}')">${student.name} বিন ${student.fatherName}</span></h4>
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
                               value="${studentAttendance.reason || ''}"
                               onchange="updateAbsenceReason('${student.id}', '${selectedDate}', this.value)">
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function toggleAttendance(studentId, date, status) {
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
    await loadAttendanceForDate();
    
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
        // Save to JSON database via API
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendance)
        });
        
        if (response.ok) {
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
            
            const totalStudents = getFilteredStudents().length;
            const presentCount = totalStudents - markedCount;
            showModal(t('success'), `Attendance saved successfully! ${presentCount} present, ${markedCount} absent (${totalStudents} total).`);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save attendance');
        }
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

async function markAllPresent() {
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
    await loadAttendanceForDate();
    
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

async function confirmMarkAllAbsent() {
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
    await loadAttendanceForDate();
    closeBulkAbsentModal();
    
    // Show visual indication that changes are pending
    const saveButton = document.querySelector('.btn-save-attendance');
    if (saveButton) {
        saveButton.style.background = '#e67e22';
        saveButton.textContent = 'Save Changes*';
    }
    
    showModal(t('success'), `${filteredStudents.length} ${t('studentsMarkedAbsent')}`);
}

async function autoCopyFromPreviousDay(targetDate) {
    // Don't auto-copy to holidays
    if (isHoliday(targetDate)) {
        return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (filteredStudents.length === 0) {
        return;
    }
    
    // Find the most recent attendance for each student (sticky behavior)
    const targetDateObj = new Date(targetDate);
    let mostRecentAttendance = {};
    let foundAnyAttendance = false;
    let copyFromDate = null;
    
    // Look back up to 30 days for attendance data
    for (let i = 1; i <= 30; i++) {
        const checkDate = new Date(targetDateObj);
        checkDate.setDate(targetDateObj.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (!isHoliday(checkDateStr) && attendance[checkDateStr] && 
            Object.keys(attendance[checkDateStr]).length > 0) {
            
            if (!foundAnyAttendance) {
                copyFromDate = checkDateStr;
                foundAnyAttendance = true;
            }
            
            // For each student, use their most recent attendance status
            filteredStudents.forEach(student => {
                if (attendance[checkDateStr][student.id] && !mostRecentAttendance[student.id]) {
                    mostRecentAttendance[student.id] = {
                        status: attendance[checkDateStr][student.id].status,
                        reason: attendance[checkDateStr][student.id].reason || ''
                    };
                }
            });
            
            // If we have attendance for all students, no need to look further back
            if (Object.keys(mostRecentAttendance).length >= filteredStudents.length) {
                break;
            }
        }
    }
    
    if (foundAnyAttendance) {
        // Initialize the target date
        if (!attendance[targetDate]) {
            attendance[targetDate] = {};
        }
        
        // Apply the most recent attendance status for each student (sticky behavior)
        let absentCount = 0;
        filteredStudents.forEach(student => {
            if (mostRecentAttendance[student.id]) {
                attendance[targetDate][student.id] = {
                    status: mostRecentAttendance[student.id].status,
                    reason: mostRecentAttendance[student.id].reason || ''
                };
                if (mostRecentAttendance[student.id].status === 'absent') {
                    absentCount++;
                }
            } else {
                // Default to present for students with no previous attendance
                attendance[targetDate][student.id] = {
                    status: 'present',
                    reason: ''
                };
            }
        });
        
        // Show visual indication that changes are pending
        const saveButton = document.querySelector('.btn-save-attendance');
        if (saveButton) {
            saveButton.style.background = '#e67e22';
            saveButton.textContent = 'Save Changes*';
        }
        
        // Show sticky attendance notification
        const presentCount = filteredStudents.length - absentCount;
        if (absentCount > 0) {
            showModal(t('success'), `📌 Sticky attendance applied! ${presentCount} present, ${absentCount} still absent from last time. Change any student's status as needed.`);
        } else {
            showModal(t('success'), `📌 Sticky attendance applied! All ${presentCount} students present. Change any student's status as needed.`);
        }
    } else {
        // No previous attendance found, default all to present
        filteredStudents.forEach(student => {
            attendance[targetDate][student.id] = {
                status: 'present',
                reason: ''
            };
        });
    }
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

// Student Filter State
let studentFilters = {
    roll: '',
    name: '',
    class: '',
    mobile: ''
};

// Student Filter Functions
function applyStudentFilters(students) {
    if (!studentFilters.roll && !studentFilters.name && !studentFilters.class && !studentFilters.mobile) {
        return students;
    }
    
    return students.filter(student => {
        const rollMatch = !studentFilters.roll || (student.rollNumber || '').toLowerCase().includes(studentFilters.roll);
        const nameMatch = !studentFilters.name || 
            (student.name + ' বিন ' + student.fatherName).toLowerCase().includes(studentFilters.name);
        const classMatch = !studentFilters.class || student.class === studentFilters.class;
        const mobileMatch = !studentFilters.mobile || student.mobileNumber.toLowerCase().includes(studentFilters.mobile);
        
        return rollMatch && nameMatch && classMatch && mobileMatch;
    });
}

function updateStudentFilter(filterType, value) {
    if (filterType === 'class') {
        studentFilters[filterType] = value; // Don't convert class to lowercase
    } else {
        studentFilters[filterType] = value.toLowerCase();
    }
    
    // Only update the table body, not the entire table
    updateStudentTableBody();
}

function clearStudentFilters() {
    studentFilters = {
        roll: '',
        name: '',
        class: '',
        mobile: ''
    };
    displayStudentsList();
}

function updateStudentTableBody() {
    const tbody = document.querySelector('#studentsListContainer .students-table tbody');
    const studentCount = document.querySelector('#studentsListContainer .students-list-header h3');
    
    if (!tbody || !studentCount) {
        // If table doesn't exist yet, create the full table
        displayStudentsList();
        return;
    }
    
    // Sort students by class and roll number
    const sortedStudents = [...students].sort((a, b) => {
        const classA = getClassNumber(a.class);
        const classB = getClassNumber(b.class);
        if (classA !== classB) return classA - classB;
        
        const rollA = parseRollNumber(a.rollNumber);
        const rollB = parseRollNumber(b.rollNumber);
        return rollA - rollB;
    });
    
    // Apply search filters
    const filteredStudents = applyStudentFilters(sortedStudents);
    
    // Update student count
    studentCount.innerHTML = `<i class="fas fa-list"></i> ${t('allRegisteredStudents')} (${filteredStudents.length}/${students.length})`;
    
    // Update table body
    tbody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td><strong>${student.rollNumber || 'N/A'}</strong></td>
            <td>
                <span class="clickable-name" onclick="showStudentDetail('${student.id}', 'registration')" title="Click to view details">
                    ${student.name} বিন ${student.fatherName}
                </span>
            </td>
            <td><span class="class-badge">${student.class}</span></td>
            <td>${student.mobileNumber}</td>
            <td class="actions">
                <button onclick="editStudent('${student.id}')" class="btn btn-sm btn-secondary" title="${t('editStudent')}">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="btn btn-sm btn-danger" title="${t('deleteStudent')}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateClassFilterOptions() {
    const classFilterSelect = document.querySelector('#classFilterReg');
    if (!classFilterSelect) return;
    
    const currentValue = classFilterSelect.value;
    
    classFilterSelect.innerHTML = `
        <option value="">${t('allClasses')}</option>
        ${classes.map(className => 
            `<option value="${className}" ${currentValue === className ? 'selected' : ''}>${className}</option>`
        ).join('')}
    `;
}

// Student Detail Functions
let studentDetailSource = 'attendance'; // Track where student detail was opened from

function showStudentDetail(studentId, source = 'attendance') {
    const student = students.find(s => s.id === studentId);
    if (!student) {
        showModal(t('error'), t('studentNotFound'));
        return;
    }
    
    // Store the source for navigation back
    studentDetailSource = source;
    
    // Hide all sections and show student detail as separate page
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('student-detail').classList.add('active');
    
    // Update page title
    document.getElementById('studentDetailTitle').textContent = `${student.name} - ${t('studentDetails')}`;
    
    // Update back button text based on source
    const backButton = document.querySelector('#student-detail .btn-secondary');
    if (backButton) {
        if (source === 'registration') {
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('backToRegistration')}`;
        } else {
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('backToReports')}`;
        }
    }
    
    // Generate student detail content
    generateStudentDetailContent(student);
    
    // Update URL hash for navigation
    window.location.hash = `student/${studentId}`;
}

function backToReports() {
    document.getElementById('student-detail').classList.remove('active');
    
    // Navigate back to the correct section based on where we came from
    if (studentDetailSource === 'registration') {
        document.getElementById('registration').classList.add('active');
        window.location.hash = 'registration';
    } else {
        document.getElementById('attendance').classList.add('active');
        window.location.hash = 'attendance';
    }
}

// Global variables for student detail calendar
let currentStudentDetailMonth = new Date().getMonth();
let currentStudentDetailYear = new Date().getFullYear();
let currentStudentData = null;

function generateStudentDetailContent(student) {
    const detailContent = document.getElementById('studentDetailContent');
    
    // Store current student data for calendar navigation
    currentStudentData = student;
    
    // Calculate attendance statistics for last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    
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
                <h4>${t('attendanceSummary')} (Last 30 Days)</h4>
                <div class="attendance-summary">
                    <div class="summary-item present">
                        <h5>${t('totalPresent')}</h5>
                        <div class="number">${attendanceStats.present}</div>
                    </div>
                    <div class="summary-item absent">
                        <h5>${t('totalAbsent')}</h5>
                        <div class="number">${attendanceStats.absent}</div>
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
                
                <div class="attendance-calendar">
                    <div class="calendar-header">
                        <h5>${t('attendanceCalendar')}</h5>
                    </div>
                    <div class="student-calendar-navigation">
                        <button onclick="navigateStudentCalendar(-1)" class="nav-btn" title="Previous Month">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="month-year-display">
                            <select id="studentMonthSelector" onchange="changeStudentCalendarMonth()" class="month-selector">
                                ${generateMonthOptions()}
                            </select>
                            <input type="number" id="studentYearSelector" value="${currentStudentDetailYear}" min="2020" max="2030" 
                                   onchange="changeStudentCalendarYear()" class="year-selector">
                </div>
                        <button onclick="navigateStudentCalendar(1)" class="nav-btn" title="Next Month">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button onclick="goToCurrentMonthStudent()" class="nav-btn today-btn" title="Go to Current Month">
                            <i class="fas fa-calendar-day"></i>
                        </button>
                    </div>
                    <div id="studentCalendarContainer">
                        ${generateStudentAttendanceCalendar(student, currentStudentDetailMonth, currentStudentDetailYear)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateStudentAttendanceStats(student, startDate, endDate) {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let totalSchoolDays = 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        if (isHoliday(dateStr)) {
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
            absent++; // Assume absent if no record found for a school day
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

function generateMonthOptions() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return monthNames.map((month, index) => 
        `<option value="${index}" ${index === currentStudentDetailMonth ? 'selected' : ''}>${month}</option>`
    ).join('');
}

function generateStudentAttendanceCalendar(student, month, year) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get first day of the month and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    let calendarHTML = '<div class="calendar-grid">';
    
    // Add day headers
    daysOfWeek.forEach(day => {
        calendarHTML += `<div class="calendar-day header">${day}</div>`;
    });
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Generate calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const today = new Date();
        
        let className = 'calendar-day no-data';
        let title = `${dateStr} - No data`;
        
        // Check if it's a future date
        if (date > today) {
            className = 'calendar-day future-day';
            title = `${dateStr} - Future date`;
        } else if (isHoliday(dateStr)) {
                className = 'calendar-day holiday';
            title = `${dateStr} - Holiday: ${getHolidayName(dateStr)}`;
        } else if (attendance[dateStr] && attendance[dateStr][student.id]) {
            const record = attendance[dateStr][student.id];
            className = `calendar-day ${record.status}`;
            title = `${dateStr} - ${record.status}`;
            if (record.reason) {
                title += ` (${record.reason})`;
            }
        }
        
        calendarHTML += `<div class="${className}" title="${title}">${day}</div>`;
    }
    
    calendarHTML += '</div>';
    return calendarHTML;
}

// Student calendar navigation functions
function navigateStudentCalendar(direction) {
    currentStudentDetailMonth += direction;
    
    if (currentStudentDetailMonth > 11) {
        currentStudentDetailMonth = 0;
        currentStudentDetailYear++;
    } else if (currentStudentDetailMonth < 0) {
        currentStudentDetailMonth = 11;
        currentStudentDetailYear--;
    }
    
    refreshStudentCalendar();
}

function changeStudentCalendarMonth() {
    const monthSelector = document.getElementById('studentMonthSelector');
    if (monthSelector) {
        currentStudentDetailMonth = parseInt(monthSelector.value);
        refreshStudentCalendar();
    }
}

function changeStudentCalendarYear() {
    const yearSelector = document.getElementById('studentYearSelector');
    if (yearSelector) {
        currentStudentDetailYear = parseInt(yearSelector.value);
        refreshStudentCalendar();
    }
}

function refreshStudentCalendar() {
    if (currentStudentData) {
        const calendarContainer = document.getElementById('studentCalendarContainer');
        const monthSelector = document.getElementById('studentMonthSelector');
        const yearSelector = document.getElementById('studentYearSelector');
        
        if (calendarContainer) {
            calendarContainer.innerHTML = generateStudentAttendanceCalendar(currentStudentData, currentStudentDetailMonth, currentStudentDetailYear);
        }
        
        if (monthSelector) {
            monthSelector.innerHTML = generateMonthOptions();
        }
        
        if (yearSelector) {
            yearSelector.value = currentStudentDetailYear;
        }
    }
}

function goToCurrentMonthStudent() {
    const today = new Date();
    currentStudentDetailMonth = today.getMonth();
    currentStudentDetailYear = today.getFullYear();
    refreshStudentCalendar();
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
    const summaryDiv = document.getElementById('attendance-summary');
    if (!summaryDiv) return;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    let totalTaken = 0;
    let totalMissed = 0;
    let holidaysCount = 0;
    const missedDates = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 5; // Assuming Friday is the weekend

        if (isHoliday(dateString)) {
            holidaysCount++;
        } else if (!isWeekend) {
            if (attendance[dateString] && Object.keys(attendance[dateString]).length > 0) {
                totalTaken++;
        } else {
                if (d < new Date()) { // Only count missed days in the past
                    totalMissed++;
                    missedDates.push(new Date(d));
                }
            }
        }
    }

    const totalDays = totalTaken + totalMissed;
    const takenPercentage = totalDays > 0 ? ((totalTaken / totalDays) * 100).toFixed(0) : 0;
    const missedPercentage = totalDays > 0 ? ((totalMissed / totalDays) * 100).toFixed(0) : 0;
    
    const monthName = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    summaryDiv.innerHTML = `
        <div class="summary-header">
            <h4>Attendance Summary for ${monthName}</h4>
        </div>
        <div class="summary-stats">
            <div class="stat-item">
                <span class="stat-value">${totalTaken}</span>
                <span class="stat-label">Days Taken</span>
                </div>
            <div class="stat-item">
                <span class="stat-value">${totalMissed}</span>
                <span class="stat-label">Days Missed</span>
                </div>
            <div class="stat-item">
                <span class="stat-value">${holidaysCount}</span>
                <span class="stat-label">Holidays</span>
                </div>
                </div>
        <div class="summary-chart">
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${takenPercentage}%; background-color: #28a745;" title="Taken: ${takenPercentage}%"></div>
                <div class="progress-bar" style="width: ${missedPercentage}%; background-color: #dc3545;" title="Missed: ${missedPercentage}%"></div>
            </div>
            </div>
        ${missedDates.length > 0 ? `
            <div class="missed-dates">
                <h5><i class="fas fa-exclamation-triangle"></i> Missed Attendance Dates:</h5>
                <ul>
                    ${missedDates.map(date => {
                        const dateString = date.toISOString().split('T')[0];
                        const hijriDate = getHijriDate(dateString, hijriAdjustment);
                        return `<li>${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })} 
                                    <span class="hijri-date-small">${hijriDate.day} ${hijriDate.monthName}, ${hijriDate.year}</span></li>`;
                    }).join('')}
                </ul>
        </div>
        ` : `
            <div class="no-missed-dates">
                <p><i class="fas fa-check-circle"></i> Great job! No missed attendance this month.</p>
            </div>
        `}
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
    console.log("Generating report...");
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const reportResults = document.getElementById('reportResults');
    const reportClassElement = document.getElementById('reportClass');
    const selectedClass = reportClassElement ? reportClassElement.value : '';
    
    console.log(`Date Range: ${startDate} to ${endDate}, Class: ${selectedClass || 'All'}`);
    
    if (!startDate || !endDate) {
        showModal(t('error'), 'Please select both a start and end date.');
        return;
    }
    
    reportResults.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating report...</p>';
    
    // Use a short timeout to allow the UI to update before processing
    setTimeout(() => {
        try {
            console.log("Filtering students...");
            let filteredStudents = students;
            if (selectedClass) {
                filteredStudents = students.filter(student => student.class === selectedClass);
            }
            console.log(`${filteredStudents.length} students to process.`);
            
            const reportData = filteredStudents.map(student => {
                const stats = calculateStudentAttendanceStats(student, startDate, endDate);
        return {
                    ...student,
                    presentDays: stats.present,
                    absentDays: stats.absent,
                    leaveDays: stats.leave,
                    attendanceRate: stats.attendanceRate
                };
            }).sort((a, b) => {
                const classA = getClassNumber(a.class);
                const classB = getClassNumber(b.class);
                if (classA !== classB) return classA - classB;
                return parseRollNumber(a.rollNumber) - parseRollNumber(b.rollNumber);
            });
            
            console.log("Report data calculated:", reportData);

            if (reportData.length === 0) {
                reportResults.innerHTML = '<p>No attendance data found for the selected criteria.</p>';
                return;
            }
            
    reportResults.innerHTML = `
                <div class="report-header">
                    <h4>${t('attendanceReport')} (${formatDate(startDate)} ${t('to')} ${formatDate(endDate)})</h4>
                </div>
        <div class="report-table-container">
                    <table class="report-table">
                <thead>
                    <tr>
                                <th>${t('roll')}</th>
                                <th>${t('name')}</th>
                                <th>${t('class')}</th>
                                <th>${t('present')}</th>
                                <th>${t('absent')}</th>
                                <th>${t('leaveDays')}</th>
                                <th>${t('rate')}</th>
                    </tr>
                </thead>
                <tbody>
                            ${reportData.map(data => `
                        <tr>
                                    <td>${data.rollNumber}</td>
                                    <td><span class="clickable-name" onclick="showStudentDetail('${data.id}')">${data.name} বিন ${data.fatherName}</span></td>
                                    <td>${data.class}</td>
                            <td class="status-present">${data.presentDays}</td>
                            <td class="status-absent">${data.absentDays}</td>
                                    <td>${data.leaveDays}</td>
                                    <td><strong>${data.attendanceRate}%</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
            
            // Add Hijri date to the report
            addHijriToReports(startDate, endDate);
            console.log("Report display updated.");
        } catch (error) {
            console.error("Error generating report:", error);
            reportResults.innerHTML = '<p class="text-danger">An error occurred while generating the report. Please check the console for details.</p>';
            }
        }, 50);
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

// Database-only approach - no localStorage functions needed

function saveData() {
    // Database-only approach - data is automatically saved to database via API calls
    // No localStorage saving needed
    console.log('Data saved to database via API calls');
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

function showEncodingErrorModal(message) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3 style="color: #e74c3c;">🔤 Bengali Text Encoding Error</h3>
        <div style="
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 15px 0;
            white-space: pre-line;
            line-height: 1.6;
            text-align: left;
            font-size: 14px;
            color: #856404;
        ">${message}</div>
        <button onclick="closeModal()" class="btn btn-primary">${t('ok')}</button>
    `;
    
    modal.style.display = 'block';
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

// Bulk Import Functions
function showBulkImport() {
    document.getElementById('studentsListContainer').style.display = 'none';
    document.getElementById('studentRegistrationForm').style.display = 'none';
    document.getElementById('bulkImportSection').style.display = 'block';
    
    // Setup file input listener
    const fileInput = document.getElementById('excelFile');
    fileInput.addEventListener('change', handleFileSelect);
}

function hideBulkImport() {
    document.getElementById('studentsListContainer').style.display = 'block';
    document.getElementById('bulkImportSection').style.display = 'none';
    
    // Reset file input
    document.getElementById('excelFile').value = '';
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('importResults').style.display = 'none';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (file) {
        // Check file type
        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType === 'csv') {
            uploadBtn.disabled = false;
            updateUploadZone(file.name, file.size);
        } else {
            showModal('Error', 'Please select a valid CSV file. Save your Excel file as CSV first.');
            uploadBtn.disabled = true;
        }
    } else {
        uploadBtn.disabled = true;
        resetUploadZone();
    }
}

function updateUploadZone(fileName, fileSize) {
    const dropZone = document.querySelector('.upload-drop-zone');
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    dropZone.innerHTML = `
        <i class="fas fa-file-excel" style="color: #27ae60;"></i>
        <p><strong>${fileName}</strong></p>
        <p class="file-types">File size: ${fileSizeMB} MB</p>
        <p style="color: #27ae60; font-size: 0.9em;">✅ Ready to upload</p>
    `;
}

function resetUploadZone() {
    const dropZone = document.querySelector('.upload-drop-zone');
    dropZone.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Click to select CSV file</p>
        <p class="file-types">Supports .csv files (Excel saved as CSV)</p>
    `;
}

async function processExcelFile() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    
            if (!file) {
        showModal('Error', 'Please select a CSV file first');
        return;
    }
    
    // Show progress
    showImportProgress();
    
    try {
        // Read Excel file
        const studentsData = await readExcelFile(file);
        
        if (studentsData.length === 0) {
            showModal('Error', 'No student data found in the CSV file. Please check the format.');
            hideImportProgress();
            return;
        }
        
        // Validate and import students
        await importStudentsBatch(studentsData);
        
    } catch (error) {
        console.error('Import error:', error);
        hideImportProgress();
        
        // Show better error message for encoding issues
        if (error.message.includes('এনকোডিং') || error.message.includes('encoding')) {
            showEncodingErrorModal(error.message);
        } else {
            showModal('Import Error', error.message);
        }
    }
}

function showImportProgress() {
    const resultsDiv = document.getElementById('importResults');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <div class="import-progress">
            <h4>📤 Processing CSV File...</h4>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill" style="width: 0%"></div>
            </div>
            <p id="progressText">Preparing to read file...</p>
        </div>
    `;
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = text;
}

function hideImportProgress() {
    const progressDiv = document.querySelector('.import-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
}

async function readExcelFile(file) {
    updateProgress(10, 'Reading CSV file...');
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                updateProgress(30, 'Parsing CSV data...');
                
                const text = e.target.result;
                
                // Check for potential encoding issues with Bengali/Unicode text
                if (text.includes('Ã') || text.includes('â‚¬') || text.includes('ï¿½') || 
                    text.includes('�') || text.includes('Â') || text.includes('à¦') || text.includes('à§')) {
                    reject(new Error('❌ ফাইলে এনকোডিং সমস্যা পাওয়া গেছে!\n\n' +
                        '🔧 সমাধান:\n' +
                        '1️⃣ Excel এ: File → Save As → "CSV UTF-8 (Comma delimited)" নির্বাচন করুন\n' +
                        '2️⃣ Google Sheets এ: File → Download → CSV ব্যবহার করুন\n' +
                        '3️⃣ সাধারণ CSV ফরম্যাট বাংলা টেক্সট সঠিকভাবে সংরক্ষণ করে না।\n\n' +
                        '💡 নিশ্চিত করুন যে আপনার ফাইলটি UTF-8 এনকোডিং এ সেভ করা হয়েছে।'));
                    return;
                }
                
                const lines = text.split('\n');
                const students = [];
                
                if (lines.length < 2) {
                    reject(new Error('File appears to be empty or invalid format'));
                    return;
                }
                
                // Parse header row
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
                const requiredHeaders = ['name', 'fathername', 'mobilenumber', 'district', 'upazila', 'class'];
                
                // Check if all required headers are present
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
                    return;
                }
                
                // Parse data rows
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line === '') continue;
                    
                    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                    
                    if (values.length >= headers.length) {
                        const student = {};
                        headers.forEach((header, index) => {
                            student[header] = values[index] || '';
                        });
                        
                        // Validate required fields
                        if (student.name && student.fathername && student.rollnumber && student.mobilenumber && 
                            student.district && student.upazila && student.class) {
                            students.push(student);
                        }
                    }
                }
                
                updateProgress(50, `Found ${students.length} students in file`);
                resolve(students);
                
            } catch (error) {
                // Check if it's an encoding-related error
                if (error.message.includes('encoding') || error.message.includes('এনকোডিং')) {
                    reject(error);
                } else {
                    reject(new Error('CSV ফাইল পড়তে ত্রুটি: ' + error.message + 
                        '\n\n💡 নিশ্চিত করুন যে:\n' +
                        '- ফাইলটি CSV UTF-8 ফরম্যাটে সেভ করা হয়েছে\n' +
                        '- সকল কলাম সঠিকভাবে আছে (name, fatherName, mobileNumber, district, upazila, class)'));
                }
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        // Read as text for CSV with UTF-8 encoding for Bengali/Unicode support
        reader.readAsText(file, 'UTF-8');
    });
}

async function importStudentsBatch(studentsData) {
    const total = studentsData.length;
    let successful = 0;
    let failed = 0;
    let updated = 0;
    let duplicateRolls = 0;
    const errors = [];
    
    updateProgress(60, `Importing ${total} students...`);
    
    for (let i = 0; i < studentsData.length; i++) {
        const studentData = studentsData[i];
        const progress = 60 + Math.round((i / total) * 30);
        
        updateProgress(progress, `Processing student ${i + 1} of ${total}: ${studentData.name}`);
        
        try {
            // Generate ID if not provided
            const studentId = studentData.id || `ST${Date.now().toString().slice(-6)}_${i}`;
            
            // Check if student with this ID already exists
            const existingStudent = students.find(s => s.id === studentId);
            const isUpdate = !!existingStudent;
            
            // Check for duplicate roll number (only for new students or different students)
            const rollNumberConflict = students.find(s => 
                s.rollNumber === studentData.rollnumber && s.id !== studentId
            );
            
            if (rollNumberConflict) {
                duplicateRolls++;
                errors.push(`Row ${i + 2}: Roll number ${studentData.rollnumber} already exists for another student (${rollNumberConflict.name})`);
                continue;
            }
            
            // Prepare student data
            const formData = {
                id: studentId,
                name: studentData.name,
                fatherName: studentData.fathername,
                rollNumber: studentData.rollnumber,
                mobileNumber: studentData.mobilenumber,
                district: studentData.district,
                upazila: studentData.upazila,
                class: studentData.class,
                registrationDate: studentData.registrationdate || new Date().toISOString().split('T')[0]
            };
            
            let response;
            if (isUpdate) {
                // Update existing student
                response = await fetch(`/api/students/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Add new student
                response = await fetch('/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            }
            
            if (response.ok) {
                const result = await response.json();
                
                if (isUpdate) {
                    // Update existing student in local array
                    const index = students.findIndex(s => s.id === studentId);
                    if (index !== -1) {
                        students[index] = result.student;
                    }
                    updated++;
                } else {
                    // Add new student to local array
                students.push(result.student);
                successful++;
                }
            } else {
                const error = await response.json();
                failed++;
                errors.push(`Row ${i + 2}: ${error.error || (isUpdate ? 'Update failed' : 'Registration failed')} (${studentData.name})`);
            }
            
        } catch (error) {
            failed++;
            errors.push(`Row ${i + 2}: Network error - ${error.message} (${studentData.name})`);
        }
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    updateProgress(100, 'Import completed!');
    
    // Show results
    showImportResults(total, successful, failed, updated, duplicateRolls, errors);
    
    // Refresh the student list
    displayStudentsList();
    updateDashboard();
}

function showImportResults(total, successful, failed, updated, duplicateRolls, errors) {
    const resultsDiv = document.getElementById('importResults');
    
    resultsDiv.innerHTML = `
        <div class="import-summary">
            <div class="summary-card success">
                <h4>${successful}</h4>
                <p>New Students Added</p>
            </div>
            <div class="summary-card info">
                <h4>${updated}</h4>
                <p>Students Updated</p>
            </div>
            <div class="summary-card error">
                <h4>${failed}</h4>
                <p>Failed to Process</p>
            </div>
            <div class="summary-card warning">
                <h4>${duplicateRolls}</h4>
                <p>Duplicate Roll Numbers</p>
            </div>
            <div class="summary-card info">
                <h4>${total}</h4>
                <p>Total Records Processed</p>
            </div>
        </div>
        
        ${(successful > 0 || updated > 0) ? `
            <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
                <h5 style="color: #155724; margin: 0 0 5px 0;">✅ Import Successful!</h5>
                <p style="color: #155724; margin: 0;">
                    ${successful > 0 ? `Added ${successful} new students. ` : ''}
                    ${updated > 0 ? `Updated ${updated} existing students. ` : ''}
                    All changes are now available in your student list.
                </p>
            </div>
        ` : ''}
        
        ${errors.length > 0 ? `
            <div class="error-list">
                <h5>❌ Import Errors (${errors.length}):</h5>
                <ul>
                    ${errors.slice(0, 20).map(error => `<li>${error}</li>`).join('')}
                    ${errors.length > 20 ? `<li><em>... and ${errors.length - 20} more errors</em></li>` : ''}
                </ul>
            </div>
        ` : ''}
        
        <div style="margin-top: 20px; text-align: center;">
            <button onclick="hideBulkImport()" class="btn btn-primary">
                <i class="fas fa-list"></i> View Student List
            </button>
            <button onclick="resetBulkImport()" class="btn btn-secondary">
                <i class="fas fa-upload"></i> Import Another File
            </button>
        </div>
    `;
}

function resetBulkImport() {
    document.getElementById('excelFile').value = '';
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('importResults').style.display = 'none';
    resetUploadZone();
}

function downloadAllStudentsCSV() {
    // Prepare CSV data with all existing students
    const csvData = [
        ['id', 'name', 'fatherName', 'rollNumber', 'mobileNumber', 'district', 'upazila', 'class', 'registrationDate']
    ];
    
    // Add all existing students to CSV data
    students.forEach(student => {
        csvData.push([
            student.id || '',
            student.name || '',
            student.fatherName || '',
            student.rollNumber || '',
            student.mobileNumber || '',
            student.district || '',
            student.upazila || '',
            student.class || '',
            student.registrationDate || ''
        ]);
    });
    
    // If no students exist, add a sample row to show format
    if (students.length === 0) {
        csvData.push([
            'ST001',
            'মোহাম্মদ আহমেদ',
            'মোহাম্মদ রহিম',
            '501',
            '01712345678',
            'ঢাকা',
            'ধামরাই',
            'পঞ্চম শ্রেণি',
            '2025-01-01'
        ]);
    }
    
    // Convert to CSV format with UTF-8 BOM for Excel compatibility
    const csvContent = '\uFEFF' + csvData.map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const fileName = students.length > 0 ? 
            `madani_maktab_all_students_${new Date().toISOString().split('T')[0]}.csv` : 
            'madani_maktab_sample_template.csv';
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        const message = students.length > 0 ? 
            `সফলভাবে ${students.length}টি ছাত্রের তথ্য CSV ফাইলে ডাউনলোড হয়েছে! আপনি এই ফাইলটি সম্পাদনা করে আবার আপলোড করতে পারেন।` :
            'নমুনা CSV টেমপ্লেট ডাউনলোড হয়েছে! এই ফাইলটি খুলে আপনার ছাত্রদের তথ্য দিয়ে পূরণ করুন।';
        
        showModal('CSV Downloaded', message);
    }
}

function updateRegistrationTexts() {
    document.querySelector('#registration h2').textContent = t('studentRegistration');
    
    const labels = document.querySelectorAll('#studentForm label');
    const labelMap = {
        'studentName': 'studentName',
        'fatherName': 'fatherName',
        'rollNumber': 'rollNumber',
        'studentClass': 'class',
        'district': 'district',
        'upazila': 'subDistrict',
        'mobile': 'mobileNumber'
    };
    
    labels.forEach(label => {
        const key = label.getAttribute('for');
        if (labelMap[key]) {
            label.textContent = t(labelMap[key]) + ' *';
        }
    });
    
    const submitBtn = document.querySelector('#studentForm button[type="submit"]');
    if (submitBtn) {
        // Clear existing content and append new content
        submitBtn.innerHTML = ''; 
        const icon = document.createElement('i');
        icon.className = 'fas fa-plus';
        submitBtn.appendChild(icon);
        submitBtn.appendChild(document.createTextNode(` ${t('registerStudentBtn')}`));
    }
    
    const selectOption = document.querySelector('#studentClass option[value=""]');
    if (selectOption) {
        selectOption.textContent = t('selectClass');
    }
}