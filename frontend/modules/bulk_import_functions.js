function showBulkImport() {
    document.getElementById('studentsListContainer').style.display = 'none';
    document.getElementById('studentRegistrationForm').style.display = 'none';
    document.getElementById('bulkImportSection').style.display = 'block';
    
    // Setup file input listener
    const fileInput = document.getElementById('excelFile');
    fileInput.addEventListener('change', handleFileSelect);
}

export function hideBulkImport() {
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

// expose functions globally
Object.assign(window, { downloadAllStudentsCSV, handleFileSelect, hideBulkImport, hideImportProgress, resetBulkImport, resetUploadZone, showBulkImport, showImportProgress, showImportResults, updateProgress, updateRegistrationTexts, updateUploadZone });
