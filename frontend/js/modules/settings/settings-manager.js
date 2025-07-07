/**
 * Settings Manager Module
 * Handles all settings functionality including:
 * - Class management (add, edit, delete classes)
 * - Holiday management (add, edit, delete holidays)
 * - App settings (app name, academic year)
 * - Hijri date settings
 * - Data management (reset functions)
 */

import { appManager } from '../../core/app.js';
import { api } from '../../core/api.js';
import { formatDate } from '../../core/utils.js';

class SettingsManager {
    constructor() {
        this.classes = [];
        this.holidays = [];
        this.academicYearStartDate = null;
    }

    /**
     * Initialize the settings manager
     */
    async initialize() {
        console.log('🔧 Initializing Settings Manager...');
        
        // Load settings data
        await this.loadSettings();
        
        // Initialize UI components
        this.initializeUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Settings Manager initialized successfully');
    }

    /**
     * Load settings data from application state
     */
    async loadSettings() {
        // Get data from app state
        this.classes = appManager.getState('classes') || ['প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি'];
        this.holidays = appManager.getState('holidays') || [];
        
        // Load academic year start date from localStorage
        this.academicYearStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
        
        console.log('Settings loaded:', {
            classes: this.classes.length,
            holidays: this.holidays.length,
            academicYearStartDate: this.academicYearStartDate
        });
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        this.initializeAppName();
        this.initializeAcademicYearStart();
        this.initializeHijriSettings();
        this.displayClasses();
        this.displayHolidays();
        this.updateClassDropdowns();
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Event listeners for settings will be added via HTML onclick handlers
        console.log('Settings event listeners set up');
    }

    // ==================== CLASS MANAGEMENT ====================

    /**
     * Add a new class
     */
    addClass() {
        const newClassName = document.getElementById('newClassName').value.trim();
        
        if (!newClassName) {
            this.showModal('Error', 'Please enter a class name');
            return;
        }
        
        if (this.classes.includes(newClassName)) {
            this.showModal('Error', 'Class already exists');
            return;
        }
        
        this.classes.push(newClassName);
        this.saveData();
        this.updateClassDropdowns();
        this.displayClasses();
        
        document.getElementById('newClassName').value = '';
        this.showModal('Success', `${newClassName} class added successfully`);
    }

    /**
     * Delete a class
     */
    deleteClass(className) {
        // First confirmation
        if (confirm(`Are you sure you want to delete "${className}" class? This action cannot be undone.`)) {
            // Second confirmation with stronger warning
            if (confirm(`FINAL WARNING: Delete "${className}" class?\n\nThis will also remove all students from this class!`)) {
                this.classes = this.classes.filter(cls => cls !== className);
                
                // Remove students from this class
                const students = appManager.getState('students') || [];
                const updatedStudents = students.filter(student => student.class !== className);
                appManager.setState('students', updatedStudents);
                
                this.saveData();
                this.updateClassDropdowns();
                this.displayClasses();
                
                // Update dashboard if it exists
                if (window.dashboardManager) {
                    window.dashboardManager.updateDashboard();
                }
                
                this.showModal('Success', `${className} class deleted successfully`);
            }
        }
    }

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
                if (this.classes.includes(newName)) {
                    this.showModal('Error', 'Class name already exists');
                    return;
                }
                
                // Update class name
                const classIndex = this.classes.indexOf(oldClassName);
                if (classIndex !== -1) {
                    this.classes[classIndex] = newName;
                }
                
                // Update students' class names
                const students = appManager.getState('students') || [];
                students.forEach(student => {
                    if (student.class === oldClassName) {
                        student.class = newName;
                    }
                });
                appManager.setState('students', students);
                
                this.saveData();
                this.updateClassDropdowns();
                this.displayClasses();
                
                // Update dashboard if it exists
                if (window.dashboardManager) {
                    window.dashboardManager.updateDashboard();
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
    }

    /**
     * Display classes list
     */
    displayClasses() {
        const classesList = document.getElementById('classesList');
        
        if (this.classes.length === 0) {
            classesList.innerHTML = '<p>No classes added yet.</p>';
            return;
        }
        
        classesList.innerHTML = this.classes.map(className => `
            <div class="class-item">
                <span class="class-name" id="className-${className.replace(/\s+/g, '')}">${className}</span>
                <div class="class-actions">
                    <button onclick="window.settingsManager.editClass('${className}')" class="btn btn-secondary btn-small" title="Edit Class">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.settingsManager.deleteClass('${className}')" class="btn btn-danger btn-small" title="Delete Class">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update class dropdowns throughout the application
     */
    updateClassDropdowns() {
        const dropdowns = ['studentClass', 'classFilter', 'reportClass'];
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                const currentValue = dropdown.value;
                
                // Clear and repopulate options
                dropdown.innerHTML = '';
                
                // Add default option
                if (dropdownId === 'classFilter' || dropdownId === 'reportClass') {
                    dropdown.innerHTML += '<option value="">All Classes</option>';
                } else {
                    dropdown.innerHTML += '<option value="">Select Class</option>';
                }
                
                // Add class options
                this.classes.forEach(className => {
                    dropdown.innerHTML += `<option value="${className}">${className}</option>`;
                });
                
                // Restore previous value if it still exists
                if (currentValue && this.classes.includes(currentValue)) {
                    dropdown.value = currentValue;
                }
            }
        });
    }

    // ==================== HOLIDAY MANAGEMENT ====================

    /**
     * Add a holiday
     */
    addHoliday() {
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
        const conflictingHoliday = this.holidays.find(h => {
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
        
        this.holidays.push({ 
            startDate, 
            endDate: finalEndDate, 
            name,
            // Keep legacy date field for compatibility
            date: startDate
        });
        this.holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        this.saveData();
        this.displayHolidays();
        
        // Clear inputs
        startDateInput.value = '';
        endDateInput.value = '';
        nameInput.value = '';
        
        const dayCount = Math.ceil((new Date(finalEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        this.showModal('Success', `Holiday added successfully (${dayCount} day${dayCount > 1 ? 's' : ''})`);
    }

    /**
     * Delete a holiday
     */
    deleteHoliday(index) {
        this.holidays.splice(index, 1);
        this.saveData();
        this.displayHolidays();
        this.showModal('Success', 'Holiday deleted successfully');
    }

    /**
     * Display holidays list
     */
    displayHolidays() {
        const holidaysList = document.getElementById('holidaysList');
        if (!holidaysList) return;
        
        if (this.holidays.length === 0) {
            holidaysList.innerHTML = '<p>No holidays configured.</p>';
            return;
        }
        
        holidaysList.innerHTML = this.holidays.map((holiday, index) => {
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
                    <button onclick="window.settingsManager.deleteHoliday(${index})" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    // ==================== APP SETTINGS ====================

    /**
     * Initialize app name
     */
    initializeAppName() {
        const savedName = localStorage.getItem('madaniMaktabAppName');
        const input = document.getElementById('appNameInput');
        if (input && savedName) {
            input.value = savedName;
        }
        this.updateHeaderTexts();
    }

    /**
     * Save app name
     */
    saveAppName() {
        const input = document.getElementById('appNameInput');
        if (!input) return;
        const newName = input.value.trim();
        if (!newName) {
            this.showModal('Error', 'Please enter an application name');
            return;
        }
        localStorage.setItem('madaniMaktabAppName', newName);
        this.updateHeaderTexts();
        this.showModal('Success', 'Application name updated successfully');
    }

    /**
     * Update header texts with app name
     */
    updateHeaderTexts() {
        const savedName = localStorage.getItem('madaniMaktabAppName');
        if (savedName) {
            // Update header title if it exists
            const headerTitle = document.querySelector('header h1');
            if (headerTitle) {
                headerTitle.textContent = savedName;
            }
            
            // Update page title
            document.title = savedName;
        }
    }

    // ==================== ACADEMIC YEAR SETTINGS ====================

    /**
     * Save academic year start date
     */
    saveAcademicYearStart() {
        const academicYearStartInput = document.getElementById('academicYearStartInput');
        const startDate = academicYearStartInput.value;
        
        if (!startDate) {
            this.showModal('Error', 'Please select academic year start date');
            return;
        }
        
        // Save academic year start date
        this.academicYearStartDate = startDate;
        localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
        
        // Update date restrictions for all date inputs
        this.updateDateRestrictions();
        
        this.showModal('Success', 'Academic year start date updated successfully');
        
        // Clear the input
        academicYearStartInput.value = '';
        
        // Update the display
        this.displayAcademicYearStart();
    }

    /**
     * Initialize academic year start date display
     */
    initializeAcademicYearStart() {
        // Load academic year start date from localStorage
        const savedStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
        if (savedStartDate) {
            this.academicYearStartDate = savedStartDate;
            console.log('Loaded academic year start date:', this.academicYearStartDate);
        }
        this.displayAcademicYearStart();
        
        // Apply date restrictions if academic year start is set
        this.updateDateRestrictions();
    }

    /**
     * Display academic year start date
     */
    displayAcademicYearStart() {
        const academicYearStartInput = document.getElementById('academicYearStartInput');
        const currentDisplay = document.getElementById('currentAcademicYearDisplay');
        const displaySpan = document.getElementById('academicYearStartDisplay');
        
        if (this.academicYearStartDate) {
            // Show the current academic year start date in the input (for editing)
            if (academicYearStartInput) {
                academicYearStartInput.value = this.academicYearStartDate;
            }
            
            // Show the current academic year display
            if (currentDisplay && displaySpan) {
                displaySpan.textContent = formatDate(this.academicYearStartDate);
                currentDisplay.style.display = 'block';
            }
        } else {
            // Clear the input and hide the display
            if (academicYearStartInput) {
                academicYearStartInput.value = '';
            }
            if (currentDisplay) {
                currentDisplay.style.display = 'none';
            }
        }
    }

    /**
     * Clear academic year start date
     */
    clearAcademicYearStart() {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to clear the academic year start date?')) {
            return;
        }
        
        // Clear the academic year start date
        this.academicYearStartDate = null;
        localStorage.removeItem('madaniMaktabAcademicYearStart');
        
        // Clear all date restrictions
        this.clearDateRestrictions();
        
        // Update the display
        this.displayAcademicYearStart();
        
        this.showModal('Success', 'Academic year start date cleared successfully');
    }

    /**
     * Update date restrictions for all date inputs
     */
    updateDateRestrictions() {
        if (!this.academicYearStartDate) {
            this.clearDateRestrictions();
            return;
        }
        
        console.log('Updating date restrictions from academic year start:', this.academicYearStartDate);
        
        // List of date input IDs that should be restricted
        const dateInputIds = [
            'reportStartDate',
            'reportEndDate',
            'attendanceDate'
        ];
        
        dateInputIds.forEach(inputId => {
            const dateInput = document.getElementById(inputId);
            if (dateInput) {
                // Set minimum date to academic year start
                dateInput.min = this.academicYearStartDate;
                
                // If current value is before academic year start, clear it
                if (dateInput.value && dateInput.value < this.academicYearStartDate) {
                    dateInput.value = '';
                    console.log(`Cleared ${inputId} as it was before academic year start`);
                }
                
                console.log(`Set minimum date for ${inputId} to ${this.academicYearStartDate}`);
            }
        });
    }

    /**
     * Clear date restrictions
     */
    clearDateRestrictions() {
        console.log('Clearing all date restrictions');
        
        const dateInputIds = [
            'reportStartDate',
            'reportEndDate',
            'attendanceDate'
        ];
        
        dateInputIds.forEach(inputId => {
            const dateInput = document.getElementById(inputId);
            if (dateInput) {
                dateInput.removeAttribute('min');
                console.log(`Removed minimum date restriction for ${inputId}`);
            }
        });
    }

    // ==================== HIJRI DATE SETTINGS ====================

    /**
     * Initialize Hijri settings
     */
    initializeHijriSettings() {
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
            
            console.log('Hijri settings initialized successfully');
        } catch (error) {
            console.error('Error initializing Hijri settings:', error);
        }
    }

    /**
     * Update Hijri adjustment
     */
    updateHijriAdjustment() {
        const hijriSelect = document.getElementById('hijriAdjustment');
        if (hijriSelect && window.hijriCalendar) {
            const adjustment = parseInt(hijriSelect.value);
            hijriCalendar.setAdjustment(adjustment);
            this.updateHijriPreview();
            
            this.showModal('Success', 'Hijri date adjustment updated successfully');
        }
    }

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
    }

    // ==================== DATA MANAGEMENT ====================

    /**
     * Show reset attendance modal
     */
    showResetAttendanceModal() {
        const modal = document.getElementById('resetAttendanceModal');
        if (modal) {
            modal.style.display = 'block';
        }
        
        // Set up confirmation input listener
        const confirmationInput = document.getElementById('resetConfirmationInput');
        const confirmButton = document.getElementById('confirmResetBtn');
        
        if (confirmationInput && confirmButton) {
            confirmationInput.addEventListener('input', () => {
                confirmButton.disabled = confirmationInput.value.toUpperCase() !== 'RESET';
            });
        }
    }

    /**
     * Close reset attendance modal
     */
    closeResetAttendanceModal() {
        const modal = document.getElementById('resetAttendanceModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Clear input
        const confirmationInput = document.getElementById('resetConfirmationInput');
        if (confirmationInput) {
            confirmationInput.value = '';
        }
    }

    /**
     * Confirm reset attendance
     */
    async confirmResetAttendance() {
        const confirmationInput = document.getElementById('resetConfirmationInput');
        
        if (!confirmationInput || confirmationInput.value.toUpperCase() !== 'RESET') {
            this.showModal('Error', 'Please type "RESET" to confirm');
            return;
        }
        
        try {
            // Call API to reset attendance
            const response = await api.resetAttendance();
            
            if (response.success) {
                // Clear local attendance data
                appManager.setState('attendance', {});
                appManager.setState('savedAttendanceDates', new Set());
                
                // Close modal
                this.closeResetAttendanceModal();
                
                // Update dashboard
                if (window.dashboardManager) {
                    window.dashboardManager.updateDashboard();
                }
                
                this.showModal('Success', 'All attendance history has been reset successfully');
            } else {
                this.showModal('Error', response.error || 'Failed to reset attendance');
            }
        } catch (error) {
            console.error('Error resetting attendance:', error);
            this.showModal('Error', 'Network error. Please try again.');
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Save data to backend
     */
    async saveData() {
        try {
            // Update app state
            appManager.setState('classes', this.classes);
            appManager.setState('holidays', this.holidays);
            
            // Save holidays to backend
            await api.saveHolidays(this.holidays);
            
            console.log('Settings data saved successfully');
        } catch (error) {
            console.error('Error saving settings data:', error);
        }
    }

    /**
     * Show modal (temporary implementation)
     */
    showModal(title, message) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h3>${title}</h3>
                <p>${message}</p>
                <button onclick="closeModal()" class="btn btn-primary">OK</button>
            `;
            modal.style.display = 'block';
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Create and export the settings manager instance
export const settingsManager = new SettingsManager();

// Make it available globally for HTML onclick handlers
window.settingsManager = settingsManager;