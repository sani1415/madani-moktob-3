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

function displayStudentsList() {
    const studentsListContainer = document.getElementById('studentsListContainer');
    if (!studentsListContainer) return;
    
    // Update class dropdowns to ensure they're populated
    if (typeof updateClassDropdowns === 'function') {
        updateClassDropdowns();
    }
    
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
                                    ${window.classes && window.classes.map(cls => 
                                        `<option value="${cls.name}" ${studentFilters.class === cls.name ? 'selected' : ''}>${cls.name}</option>`
                                    ).join('') || ''}
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

let studentFilters = {
    roll: '',
    name: '',
    class: '',
    mobile: ''
};

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
        ${window.classes && window.classes.map(cls => 
            `<option value="${cls.name}" ${currentValue === cls.name ? 'selected' : ''}>${cls.name}</option>`
        ).join('') || ''}
    `;
}

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
                const fileStudents = [];
                
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
                            fileStudents.push(student);
                        }
                    }
                }
                
                updateProgress(50, `Found ${fileStudents.length} students in file`);
                resolve(fileStudents);
                
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
    updateProgress(60, `Uploading ${total} students for validation...`);
    
    // We need to map the headers from the CSV (lowercase) to the database schema (camelCase)
    const formattedStudentsData = studentsData.map(student => ({
        id: student.id || generateStudentId(), // Assign new ID if missing
        name: student.name,
        fatherName: student.fathername,
        rollNumber: student.rollnumber,
        mobileNumber: student.mobilenumber,
        district: student.district,
        upazila: student.upazila,
        class: student.class,
        registrationDate: student.registrationdate || new Date().toISOString().split('T')[0]
    }));

    try {
        const response = await fetch('/api/students/bulk-import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedStudentsData)
        });

        const result = await response.json();

        if (response.ok) {
            updateProgress(100, 'Import complete!');
            showImportResults(total, total, 0, 0, 0, []); // Simplified results
            
            // Refresh local student data
            const studentsResponse = await fetch('/api/students');
            if (studentsResponse.ok) {
                window.students = await studentsResponse.json();
            }
        } else {
            // Handle the specific class validation error
            if (response.status === 400 && result.invalid_classes) {
                const errorMessage = `${result.error}: ${result.invalid_classes.join(', ')}. Please add them in Settings before uploading.`;
                showModal('Upload Failed', errorMessage);
            } else {
                showModal('Import Error', result.error || 'An unknown error occurred.');
            }
            
            // Reset progress on failure
            document.getElementById('importResults').style.display = 'none';
        }
    } catch (error) {
        console.error('Bulk import error:', error);
        showModal('Network Error', 'Could not connect to the server.');
        document.getElementById('importResults').style.display = 'none';
    } finally {
        hideImportProgress();
        
        // Refresh the student list and dashboard regardless of outcome
        displayStudentsList();
        updateDashboard();
    }
}

function showImportResults(total, successful, failed, updated, duplicateRolls, errors) {
    const resultsDiv = document.getElementById('importResults');
    
    let summaryHTML;
    if (errors && errors.length > 0) {
        // This is now for client-side parsing errors only
        summaryHTML = `<div class="error-list">
            <h5>❌ CSV Parsing Errors (${errors.length}):</h5>
            <ul>${errors.slice(0, 20).map(e => `<li>${e}</li>`).join('')}</ul>
        </div>`;
    } else {
        summaryHTML = `<div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 8px; color: #155724;">
            <h5 style="margin:0;">✅ Success!</h5>
            <p style="margin: 5px 0 0 0;">${successful} student records were processed successfully.</p>
        </div>`;
    }
    
    resultsDiv.innerHTML = `
        ${summaryHTML}
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


export { studentFilters, generateStudentId, registerStudent, displayStudentsList, showStudentRegistrationForm, hideStudentRegistrationForm, editStudent, updateStudent, deleteStudent, deleteAllStudents, resetStudentForm, applyStudentFilters, updateStudentFilter, clearStudentFilters, updateStudentTableBody, updateClassFilterOptions, showBulkImport, hideBulkImport, handleFileSelect, updateUploadZone, resetUploadZone, showImportProgress, updateProgress, hideImportProgress, showImportResults, resetBulkImport, downloadAllStudentsCSV, processExcelFile, updateRegistrationTexts }
