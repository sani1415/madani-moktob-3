/**
 * Modal & UI Helpers Manager Module
 * Handles modal management, notifications, and UI helpers
 */

import { appManager } from '../../core/app.js';
import { API_ENDPOINTS } from '../../core/config.js';

export const modalManager = {
    
    /**
     * Initialize the Modal & UI Helpers Module
     */
    async initialize() {
        console.log('🎨 Initializing Modal & UI Helpers Module...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI texts
        this.updateRegistrationTexts();
        
        console.log('✅ Modal & UI Helpers Module initialized successfully');
    },

    /**
     * Setup event listeners for modals and UI helpers
     */
    setupEventListeners() {
        // Set up reset attendance confirmation input
        document.addEventListener('DOMContentLoaded', () => {
            const confirmationInput = document.getElementById('resetConfirmationInput');
            if (confirmationInput) {
                confirmationInput.addEventListener('input', () => {
                    const confirmBtn = document.getElementById('confirmResetBtn');
                    const inputValue = confirmationInput.value.trim().toUpperCase();
                    confirmBtn.disabled = inputValue !== 'RESET';
                });
            }
        });
    },

    /**
     * MODAL MANAGEMENT FUNCTIONS
     */

    /**
     * Show a basic modal with title and message
     */
    showModal(title, message) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h3>${title}</h3>
                <p>${message}</p>
                <button onclick="modalManager.closeModal()" class="btn btn-primary">OK</button>
            `;
            
            modal.style.display = 'block';
        }
    },

    /**
     * Close the modal
     */
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Show encoding error modal with specific styling
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
                <button onclick="modalManager.closeModal()" class="btn btn-primary">OK</button>
            `;
            
            modal.style.display = 'block';
        }
    },

    /**
     * Show confirmation modal with custom actions
     */
    showConfirmationModal(title, message, onConfirm, onCancel) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button onclick="modalManager.handleConfirmation(true)" class="btn btn-danger">Confirm</button>
                    <button onclick="modalManager.handleConfirmation(false)" class="btn btn-secondary">Cancel</button>
                </div>
            `;
            
            // Store callbacks for later use
            this._confirmCallback = onConfirm;
            this._cancelCallback = onCancel;
            
            modal.style.display = 'block';
        }
    },

    /**
     * Handle confirmation modal response
     */
    handleConfirmation(confirmed) {
        this.closeModal();
        
        if (confirmed && this._confirmCallback) {
            this._confirmCallback();
        } else if (!confirmed && this._cancelCallback) {
            this._cancelCallback();
        }
        
        // Clear callbacks
        this._confirmCallback = null;
        this._cancelCallback = null;
    },

    /**
     * RESET ATTENDANCE MODAL FUNCTIONS
     */

    /**
     * Show reset attendance modal
     */
    showResetAttendanceModal() {
        const resetModal = document.getElementById('resetAttendanceModal');
        if (resetModal) {
            resetModal.style.display = 'block';
            document.getElementById('resetConfirmationInput').value = '';
            document.getElementById('confirmResetBtn').disabled = true;
        }
    },

    /**
     * Close reset attendance modal
     */
    closeResetAttendanceModal() {
        const resetModal = document.getElementById('resetAttendanceModal');
        if (resetModal) {
            resetModal.style.display = 'none';
            document.getElementById('resetConfirmationInput').value = '';
            document.getElementById('confirmResetBtn').disabled = true;
        }
    },

    /**
     * Confirm reset attendance
     */
    async confirmResetAttendance() {
        const confirmationInput = document.getElementById('resetConfirmationInput');
        const confirmationText = confirmationInput.value.trim().toUpperCase();
        
        if (confirmationText !== 'RESET') {
            this.showModal('Error', 'Please type "RESET" to confirm attendance reset');
            return;
        }
        
        // Show loading state
        const confirmBtn = document.getElementById('confirmResetBtn');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        confirmBtn.disabled = true;
        
        try {
            // Reset attendance in database by sending null instead of empty object
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(null) // Send null to reset attendance
            });
            
            if (response.ok) {
                // Clear local data
                const appState = appManager.getState();
                appState.attendance = {};
                appState.savedAttendanceDates.clear();
                appManager.setState(appState);
                
                // Close modal
                this.closeResetAttendanceModal();
                
                // Update UI through other managers
                const dashboardManager = appManager.getModule('dashboardManager');
                const attendanceManager = appManager.getModule('attendanceManager');
                const calendarManager = appManager.getModule('calendarManager');
                
                if (dashboardManager) {
                    dashboardManager.updateDashboard();
                }
                
                if (calendarManager) {
                    calendarManager.refreshAttendanceCalendarIfVisible();
                }
                
                if (attendanceManager) {
                    // Reset attendance table if currently viewing
                    await attendanceManager.loadAttendanceForDate();
                }
                
                this.showModal('Success', 'Attendance history has been reset successfully');
                
                console.log('Attendance history reset successfully');
            } else {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error('Failed to reset attendance in database');
            }
        } catch (error) {
            console.error('Error resetting attendance:', error);
            this.showModal('Error', 'Failed to reset attendance. Please try again.');
            
            // Reset button state
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        }
    },

    /**
     * NOTIFICATION FUNCTIONS
     */

    /**
     * Show success notification
     */
    showSuccessNotification(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },

    /**
     * Show error notification
     */
    showErrorNotification(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    },

    /**
     * Show info notification
     */
    showInfoNotification(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    },

    /**
     * Show warning notification
     */
    showWarningNotification(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    },

    /**
     * Show notification with custom type
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icons[type] || icons.info}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set colors based on type
        const colors = {
            success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
            error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
            warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
            info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
        };
        
        const color = colors[type] || colors.info;
        notification.style.backgroundColor = color.bg;
        notification.style.border = `1px solid ${color.border}`;
        notification.style.color = color.text;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    },

    /**
     * UI HELPER FUNCTIONS
     */

    /**
     * Update registration form texts (for internationalization)
     */
    updateRegistrationTexts() {
        const registrationTitle = document.querySelector('#registration h2');
        if (registrationTitle) {
            registrationTitle.textContent = 'Student Registration';
        }
        
        const labels = document.querySelectorAll('#studentForm label');
        const labelMap = {
            'studentName': 'Student Name',
            'fatherName': 'Father Name',
            'rollNumber': 'Roll Number',
            'studentClass': 'Class',
            'district': 'District',
            'upazila': 'Sub-District',
            'mobile': 'Mobile Number'
        };
        
        labels.forEach(label => {
            const key = label.getAttribute('for');
            if (labelMap[key]) {
                label.textContent = labelMap[key] + ' *';
            }
        });
        
        const submitBtn = document.querySelector('#studentForm button[type="submit"]');
        if (submitBtn) {
            // Clear existing content and append new content
            submitBtn.innerHTML = ''; 
            const icon = document.createElement('i');
            icon.className = 'fas fa-plus';
            submitBtn.appendChild(icon);
            submitBtn.appendChild(document.createTextNode(' Register Student'));
        }
        
        const selectOption = document.querySelector('#studentClass option[value=""]');
        if (selectOption) {
            selectOption.textContent = 'Select Class';
        }
    },

    /**
     * Show loading overlay
     */
    showLoadingOverlay(message = 'Loading...') {
        let overlay = document.getElementById('loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: #007bff; margin-bottom: 15px;"></i>
                <p style="margin: 0; font-size: 1.2em; color: #333;">${message}</p>
            </div>
        `;
        
        overlay.style.display = 'flex';
    },

    /**
     * Hide loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },

    /**
     * Show progress indicator
     */
    showProgress(percentage, message = 'Processing...') {
        let progressContainer = document.getElementById('progress-container');
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.id = 'progress-container';
            progressContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                min-width: 400px;
                text-align: center;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(progressContainer);
        }
        
        progressContainer.innerHTML = `
            <h4 style="margin: 0 0 15px 0; color: #333;">${message}</h4>
            <div style="
                width: 100%;
                height: 20px;
                background: #f0f0f0;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 10px;
            ">
                <div style="
                    width: ${percentage}%;
                    height: 100%;
                    background: linear-gradient(90deg, #007bff, #28a745);
                    transition: width 0.3s ease;
                "></div>
            </div>
            <p style="margin: 0; color: #666; font-size: 0.9em;">${percentage}% complete</p>
        `;
        
        progressContainer.style.display = 'block';
    },

    /**
     * Hide progress indicator
     */
    hideProgress() {
        const progressContainer = document.getElementById('progress-container');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    },

    /**
     * FORM VALIDATION HELPERS
     */

    /**
     * Validate required fields in a form
     */
    validateRequiredFields(formElement) {
        const requiredFields = formElement.querySelectorAll('[required]');
        let isValid = true;
        const errors = [];
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            if (!value) {
                isValid = false;
                field.classList.add('error');
                const fieldName = field.getAttribute('name') || field.getAttribute('id') || 'Field';
                errors.push(`${fieldName} is required`);
            } else {
                field.classList.remove('error');
            }
        });
        
        return { isValid, errors };
    },

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate phone number format
     */
    validatePhoneNumber(phone) {
        const phoneRegex = /^[0-9]{10,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    /**
     * DEBUG AND UTILITY FUNCTIONS
     */

    /**
     * Debug class names (for troubleshooting)
     */
    debugClassNames() {
        const appState = appManager.getState();
        const { classes, students } = appState;
        
        console.log("=== CLASS NAME DEBUG ===");
        console.log("Predefined classes:");
        classes.forEach((className, index) => {
            console.log(`${index + 1}. "${className}" (Length: ${className.length})`);
        });
        
        console.log("\nClasses found in student data:");
        const studentClasses = [...new Set(students.map(s => s.class))];
        studentClasses.forEach((className, index) => {
            const isMatching = classes.includes(className);
            console.log(`${index + 1}. "${className}" (Length: ${className.length}) - ${isMatching ? '✅ MATCHES' : '❌ NO MATCH'}`);
            
            if (!isMatching) {
                console.log(`   Character codes: ${Array.from(className).map(c => c.charCodeAt(0)).join(', ')}`);
            }
        });
        
        console.log("\nPredefined class character codes:");
        classes.forEach((className, index) => {
            console.log(`${index + 1}. "${className}" - ${Array.from(className).map(c => c.charCodeAt(0)).join(', ')}`);
        });
    },

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccessNotification('Copied to clipboard');
            return true;
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            this.showErrorNotification('Failed to copy to clipboard');
            return false;
        }
    },

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
};

// Export for window global access (backward compatibility)
window.modalManager = modalManager; 