/**
 * Settings Manager Module
 * Handles class management, holiday management, app configuration, Hijri settings, and import/export
 */

import { appManager, getState, updateAppState } from '../../core/app.js';
import { API_ENDPOINTS } from '../../core/config.js';
import { formatDate } from '../../core/utils.js';

export const settingsManager = {
    
    /**
     * Initialize the Settings Module
     */
    async initialize() {
        console.log('⚙️ Initializing Settings Module...');
        
        // Initialize settings components
        await this.initializeAppName();
        await this.initializeAcademicYearStart();
        await this.initializeHijriSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Display initial settings
        this.displayClasses();
        this.displayHolidays();
        
        console.log('✅ Settings Module initialized successfully');
    },

    /**
     * Setup event listeners for settings
     */
    setupEventListeners() {
        // File input for bulk import
        const fileInput = document.getElementById('csvFile');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Hijri adjustment dropdown
        const hijriAdjustment = document.getElementById('hijriAdjustment');
        if (hijriAdjustment) {
            hijriAdjustment.addEventListener('change', this.updateHijriAdjustment.bind(this));
        }
    },

    /**
     * CLASS MANAGEMENT FUNCTIONS
     */

    /**
     * Add a new class
     */
    addClass() {
        const appState = getState();
        const { classes } = appState;
        const newClassName = document.getElementById('newClassName').value.trim();
        
        if (!newClassName) {
            this.showModal('Error', 'Please enter a class name');
            return;
        }
        
        if (classes.includes(newClassName)) {
            this.showModal('Error', 'Class already exists');
            return;
        }
        
        classes.push(newClassName);
        updateAppState({ classes });
        
        this.saveData();
        this.updateClassDropdowns();
        this.displayClasses();
        
        document.getElementById('newClassName').value = '';
        this.showModal('Success', `${newClassName} class added successfully`);
    },

    /**
     * Delete a class
     */
    deleteClass(className) {
        const appState = getState();
        const { classes, students } = appState;
        
        // First confirmation
        if (confirm(`Are you sure you want to delete "${className}" class? This action cannot be undone.`)) {
            // Second confirmation with stronger warning
            if (confirm(`FINAL CONFIRMATION: Delete "${className}" class?\n\nThis will also remove all students from this class!`)) {
                // Filter out the class
                const updatedClasses = classes.filter(cls => cls !== className);
                
                // Filter out students from this class
                const updatedStudents = students.filter(student => student.class !== className);
                
                updateAppState({ 
                    classes: updatedClasses,
                    students: updatedStudents 
                });
                
                this.saveData();
                this.updateClassDropdowns();
                this.displayClasses();
                
                // Update dashboard to reflect changes
                const dashboardManager = appManager.getModule('dashboardManager');
                if (dashboardManager) {
                    dashboardManager.updateDashboard();
                }
                
                this.showModal('Success', `${className} class deleted successfully`);
            }
        }
    },

    /**
     * Display classes list
     */
    displayClasses() {
        const appState = getState();
        const { classes } = appState;
        const classesList = document.getElementById('classesList');
        
        if (!classesList) return;
        
        if (classes.length === 0) {
            classesList.innerHTML = '<p>No classes added yet</p>';
            return;
        }
        
        classesList.innerHTML = classes.map(className => `
            <div class="class-item">
                <span class="class-name" id="className-${className.replace(/\s+/g, '')}">${className}</span>
                <div class="class-actions">
                    <button onclick="settingsManager.editClass('${className}')" class="btn btn-secondary btn-small" title="Edit Class">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="settingsManager.deleteClass('${className}')" class="btn btn-danger btn-small" title="Delete Class">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update class filter options in student registration table
        this.updateClassFilterOptions();
    },

    /**
     * Edit a class name
     */
    editClass(oldClassName) {
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
                const appState = getState();
                const { classes, students } = appState;
                
                if (classes.includes(newName)) {
                    this.showModal('Error', 'Class already exists');
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
                
                updateAppState({ classes, students });
                
                this.saveData();
                this.updateClassDropdowns();
                this.displayClasses();
                
                // Update dashboard
                const dashboardManager = appManager.getModule('dashboardManager');
                if (dashboardManager) {
                    dashboardManager.updateDashboard();
                }
                
                this.showModal('Success', `Class renamed from "${oldClassName}" to "${newName}"`);
            } else {
                // Cancel edit
                this.displayClasses();
            }
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                this.displayClasses();
            }
        });
    },

    /**
     * Update class dropdowns throughout the app
     */
    updateClassDropdowns() {
        const appState = getState();
        const { classes } = appState;
        
        const classDropdowns = document.querySelectorAll('#studentClass, #classFilter, #reportClass');
        classDropdowns.forEach(dropdown => {
            if (dropdown) {
                const currentValue = dropdown.value;
                dropdown.innerHTML = `
                    <option value="">Select Class</option>
                    ${classes.map(className => 
                        `<option value="${className}" ${currentValue === className ? 'selected' : ''}>${className}</option>`
                    ).join('')}
                `;
            }
        });
    },

    /**
     * Update class filter options
     */
    updateClassFilterOptions() {
        const appState = getState();
        const { classes } = appState;
        const classFilterSelect = document.getElementById('classFilter');
        
        if (classFilterSelect) {
            const currentValue = classFilterSelect.value;
            classFilterSelect.innerHTML = `
                <option value="">All Classes</option>
                ${classes.map(className => 
                    `<option value="${className}" ${currentValue === className ? 'selected' : ''}>${className}</option>`
                ).join('')}
            `;
        }
    },

    /**
     * HOLIDAY MANAGEMENT FUNCTIONS
     */

    /**
     * Add a new holiday
     */
    addHoliday() {
        const appState = getState();
        const { holidays } = appState;
        
        const startDateInput = document.getElementById('holidayStartDate');
        const endDateInput = document.getElementById('holidayEndDate');
        const nameInput = document.getElementById('holidayName');
        
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const name = nameInput.value.trim();
        
        if (!startDate || !name) {
            this.showModal('Error', 'Please enter holiday start date and name');
            return;
        }
        
        // If no end date is provided, use start date (single day holiday)
        const finalEndDate = endDate || startDate;
        
        // Validate date range
        if (new Date(startDate) > new Date(finalEndDate)) {
            this.showModal('Error', 'Start date cannot be after end date');
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
            this.showModal('Error', 'Holiday dates conflict with existing holiday: ' + conflictingHoliday.name);
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
        
        updateAppState({ holidays });
        
        this.saveData();
        this.displayHolidays();
        
        // Clear inputs
        startDateInput.value = '';
        endDateInput.value = '';
        nameInput.value = '';
        
        const dayCount = Math.ceil((new Date(finalEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        this.showModal('Success', `Holiday added successfully (${dayCount} day${dayCount > 1 ? 's' : ''})`);
    },

    /**
     * Delete a holiday
     */
    deleteHoliday(index) {
        const appState = getState();
        const { holidays } = appState;
        
        holidays.splice(index, 1);
        updateAppState({ holidays });
        
        this.saveData();
        this.displayHolidays();
        this.showModal('Success', 'Holiday deleted successfully');
    },

    /**
     * Display holidays list
     */
    displayHolidays() {
        const appState = getState();
        const { holidays } = appState;
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
                    <button onclick="settingsManager.deleteHoliday(${index})" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    },

    /**
     * Check if a date is a holiday
     */
    isHoliday(date) {
        const appState = getState();
        const { holidays } = appState;
        
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
    },

    /**
     * Get holiday name for a date
     */
    getHolidayName(date) {
        const appState = getState();
        const { holidays } = appState;
        
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
    },

    /**
     * APP CONFIGURATION FUNCTIONS
     */

    /**
     * Initialize app name
     */
    async initializeAppName() {
        const appName = localStorage.getItem('appName');
        if (appName) {
            document.getElementById('appName').value = appName;
        }
    },

    /**
     * Save app name
     */
    saveAppName() {
        const appName = document.getElementById('appName').value.trim();
        if (appName) {
            localStorage.setItem('appName', appName);
            
            // Update app name in header
            const headerTitle = document.querySelector('h1');
            if (headerTitle) {
                headerTitle.innerHTML = `<i class="fas fa-graduation-cap"></i> ${appName}`;
            }
            
            this.showModal('Success', 'App name saved successfully');
        } else {
            this.showModal('Error', 'Please enter an app name');
        }
    },

    /**
     * Initialize academic year start date
     */
    async initializeAcademicYearStart() {
        const academicYearStart = localStorage.getItem('academicYearStart');
        if (academicYearStart) {
            document.getElementById('academicYearStart').value = academicYearStart;
            updateAppState({ academicYearStartDate: academicYearStart });
        }
        this.displayAcademicYearStart();
    },

    /**
     * Save academic year start date
     */
    saveAcademicYearStart() {
        const academicYearStart = document.getElementById('academicYearStart').value;
        if (academicYearStart) {
            localStorage.setItem('academicYearStart', academicYearStart);
            updateAppState({ academicYearStartDate: academicYearStart });
            
            this.displayAcademicYearStart();
            this.showModal('Success', 'Academic year start date saved successfully');
        } else {
            this.showModal('Error', 'Please select an academic year start date');
        }
    },

    /**
     * Display academic year start date
     */
    displayAcademicYearStart() {
        const appState = getState();
        const { academicYearStartDate } = appState;
        const displayElement = document.getElementById('academicYearDisplay');
        
        if (displayElement) {
            if (academicYearStartDate) {
                displayElement.innerHTML = `
                    <div class="academic-year-info">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Academic Year: ${formatDate(academicYearStartDate)} - Present</span>
                    </div>
                `;
            } else {
                displayElement.innerHTML = '<p>No academic year start date configured</p>';
            }
        }
    },

    /**
     * Clear academic year start date
     */
    clearAcademicYearStart() {
        localStorage.removeItem('academicYearStart');
        updateAppState({ academicYearStartDate: null });
        document.getElementById('academicYearStart').value = '';
        this.displayAcademicYearStart();
        this.showModal('Success', 'Academic year start date cleared');
    },

    /**
     * HIJRI DATE SETTINGS
     */

    /**
     * Initialize Hijri settings
     */
    async initializeHijriSettings() {
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
            this.updateHijriPreview();
            
            // Add Hijri dates to dashboard and other sections
            this.updateDashboardWithHijri();
            this.updateAttendancePageHijri();
            
            console.log('Hijri settings initialized successfully');
        } catch (error) {
            console.error('Error initializing Hijri settings:', error);
        }
    },

    /**
     * Update Hijri adjustment
     */
    updateHijriAdjustment() {
        const hijriSelect = document.getElementById('hijriAdjustment');
        if (hijriSelect && window.hijriCalendar) {
            const adjustment = parseInt(hijriSelect.value);
            hijriCalendar.setAdjustment(adjustment);
            this.updateHijriPreview();
            
            // Update all displays with new Hijri dates
            this.updateDashboardWithHijri();
            this.updateAttendancePageHijri();
            
            this.showModal('Success', 'Hijri date adjustment updated successfully');
        }
    },

    /**
     * Update Hijri preview
     */
    updateHijriPreview() {
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
    },

    /**
     * Update dashboard with Hijri dates
     */
    updateDashboardWithHijri() {
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
            
            hijriDateElement.innerHTML = `
                <div class="date-display">
                    <i class="fas fa-moon"></i>
                    <div class="date-text">
                        <div class="hijri-main">${hijriString}</div>
                        <div class="gregorian-sub">${gregorianString}</div>
                    </div>
                </div>
            `;
            
            console.log('Dashboard Hijri date updated successfully');
        } catch (error) {
            console.error('Error updating dashboard with Hijri date:', error);
        }
    },

    /**
     * Update attendance page with Hijri dates
     */
    updateAttendancePageHijri() {
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
    },

    /**
     * IMPORT/EXPORT FUNCTIONS
     */

    /**
     * Show bulk import interface
     */
    showBulkImport() {
        document.getElementById('bulkImportSection').style.display = 'block';
        document.getElementById('studentRegistrationSection').style.display = 'none';
    },

    /**
     * Hide bulk import interface
     */
    hideBulkImport() {
        document.getElementById('bulkImportSection').style.display = 'none';
        document.getElementById('studentRegistrationSection').style.display = 'block';
        this.resetBulkImport();
    },

    /**
     * Handle file selection for bulk import
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const fileName = file.name;
            const fileSize = (file.size / 1024).toFixed(2) + ' KB';
            this.updateUploadZone(fileName, fileSize);
        }
    },

    /**
     * Update upload zone display
     */
    updateUploadZone(fileName, fileSize) {
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.innerHTML = `
                <div class="file-selected">
                    <i class="fas fa-file-csv"></i>
                    <div class="file-info">
                        <div class="file-name">${fileName}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Reset upload zone
     */
    resetUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to select CSV file or drag and drop</p>
            `;
        }
    },

    /**
     * Reset bulk import interface
     */
    resetBulkImport() {
        const fileInput = document.getElementById('csvFile');
        if (fileInput) {
            fileInput.value = '';
        }
        this.resetUploadZone();
        this.hideImportProgress();
    },

    /**
     * Download all students CSV
     */
    downloadAllStudentsCSV() {
        const appState = getState();
        const { students } = appState;
        
        if (students.length === 0) {
            this.showModal('No Data', 'No students to download');
            return;
        }
        
        // Create CSV content
        const headers = ['id', 'name', 'fatherName', 'rollNumber', 'mobileNumber', 'district', 'upazila', 'class', 'registrationDate'];
        const csvContent = [
            headers.join(','),
            ...students.map(student => 
                headers.map(field => `"${student[field] || ''}"`).join(',')
            )
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showModal('Success', 'Students data downloaded successfully');
    },

    /**
     * Show import progress
     */
    showImportProgress() {
        const progressContainer = document.getElementById('importProgress');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    },

    /**
     * Hide import progress
     */
    hideImportProgress() {
        const progressContainer = document.getElementById('importProgress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    },

    /**
     * Update import progress
     */
    updateProgress(percentage, text) {
        const progressBar = document.getElementById('importProgressBar');
        const progressText = document.getElementById('importProgressText');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
    },

    /**
     * UTILITY FUNCTIONS
     */

    /**
     * Save data to database
     */
    saveData() {
        // Database-only approach - data is automatically saved to database via API calls
        console.log('Data saved to database via API calls');
    },

    /**
     * Show modal dialog
     */
    showModal(title, message) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h3>${title}</h3>
                <p>${message}</p>
                <button onclick="settingsManager.closeModal()" class="btn btn-primary">OK</button>
            `;
            
            modal.style.display = 'block';
        }
    },

    /**
     * Close modal dialog
     */
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Show encoding error modal
     */
    showEncodingErrorModal(message) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
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
                <button onclick="settingsManager.closeModal()" class="btn btn-primary">OK</button>
            `;
            
            modal.style.display = 'block';
        }
    }
};

// Export for window global access (backward compatibility)
window.settingsManager = settingsManager; 