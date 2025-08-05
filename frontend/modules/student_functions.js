// ===== STUDENT FUNCTIONS =====
// Consolidated student management, registration, filtering, and detail functions

// Student registration functions
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

// Student management functions
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
                        <button onclick="deleteAllStudents()" class="btn btn-danger delete-all" title="${t('deleteAllStudents')}">
                            <i class="fas fa-exclamation-triangle warning-icon"></i>
                            <i class="fas fa-trash-alt"></i> ${t('deleteAllStudents')}
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
                    <button onclick="deleteAllStudents()" class="btn btn-danger delete-all" title="${t('deleteAllStudents')}">
                        <i class="fas fa-exclamation-triangle warning-icon"></i>
                        <i class="fas fa-trash-alt"></i> ${t('deleteAllStudents')}
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
    
    // First confirmation
    if (confirm(`${t('confirmDeleteStudent')} ${student.name} বিন ${student.fatherName}? ${t('actionCannotBeUndone')}`)) {
        // Second confirmation with stronger warning
        if (confirm(`${t('confirmDeleteStudentFinal')}\n\n${t('finalDeleteWarning')}`)) {
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
}

async function deleteAllStudents() {
    if (students.length === 0) {
        showModal(t('error'), 'No students to delete.');
        return;
    }
    
    // First confirmation
    if (confirm(`${t('confirmDeleteAllStudents')}\n\n${t('actionCannotBeUndone')}`)) {
        // Second confirmation with stronger warning
        if (confirm(`${t('confirmDeleteAllStudentsFinal')}\n\n${t('finalDeleteAllWarning')}`)) {
            try {
                const response = await fetch('/api/students', {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Get count before clearing
                    const deletedCount = students.length;
                    // Clear local array
                    students = [];
                    
                    displayStudentsList();
                    updateDashboard();
                    showModal(t('success'), `All ${deletedCount} students have been deleted successfully.`);
                } else {
                    const error = await response.json();
                    showModal(t('error'), error.error || 'Failed to delete all students');
                }
            } catch (error) {
                console.error('Delete all error:', error);
                showModal(t('error'), 'Network error. Please try again.');
            }
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

// Student filter functions
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

// Student detail functions
window.studentDetailSource = 'attendance'; // Track where student detail was opened from

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

// Export all student-related functions
export {
    // Student registration functions
    generateStudentId,
    registerStudent,
    
    // Student management functions
    displayStudentsList,
    showStudentRegistrationForm,
    hideStudentRegistrationForm,
    editStudent,
    updateStudent,
    deleteStudent,
    deleteAllStudents,
    resetStudentForm,
    
    // Student filter functions
    applyStudentFilters,
    updateStudentFilter,
    clearStudentFilters,
    updateStudentTableBody,
    updateClassFilterOptions,
    
    // Student detail functions
    showStudentDetail,
    backToReports
}; 