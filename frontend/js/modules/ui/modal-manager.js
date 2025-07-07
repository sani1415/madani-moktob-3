/**
 * Modal Manager Module
 * Handles all modal dialogs and notifications including:
 * - General modals
 * - Error/success notifications
 * - Confirmation dialogs
 * - Bulk operation modals
 * - Loading states
 */

class ModalManager {
    constructor() {
        this.activeModals = new Set();
    }

    /**
     * Initialize the modal manager
     */
    async initialize() {
        console.log('🔧 Initializing Modal Manager...');
        
        // Set up global modal event listeners
        this.setupGlobalListeners();
        
        console.log('✅ Modal Manager initialized successfully');
    }

    /**
     * Set up global event listeners for modals
     */
    setupGlobalListeners() {
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // Close modal on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    /**
     * Show a general modal with title and message
     */
    showModal(title, message, options = {}) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) {
            console.error('Modal elements not found, falling back to alert');
            alert(`${title}: ${message}`);
            return;
        }

        const {
            type = 'info', // info, success, error, warning
            buttons = [{ text: 'OK', action: () => this.closeModal('modal') }],
            allowBackgroundClose = true
        } = options;

        // Set modal type class
        modal.className = `modal modal-${type}`;

        modalBody.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="window.modalManager.closeModal('modal')">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-message">${message}</p>
            </div>
            <div class="modal-footer">
                ${buttons.map((button, index) => 
                    `<button class="btn btn-${button.type || 'primary'}" onclick="(${button.action.toString()})()">${button.text}</button>`
                ).join('')}
            </div>
        `;
        
        modal.style.display = 'block';
        this.activeModals.add('modal');

        // Focus the first button
        setTimeout(() => {
            const firstButton = modal.querySelector('.modal-footer .btn');
            if (firstButton) firstButton.focus();
        }, 100);
    }

    /**
     * Show success modal
     */
    showSuccess(title, message) {
        this.showModal(title, message, {
            type: 'success',
            buttons: [{ text: 'OK', action: () => this.closeModal('modal') }]
        });
    }

    /**
     * Show error modal
     */
    showError(title, message) {
        this.showModal(title, message, {
            type: 'error',
            buttons: [{ text: 'OK', action: () => this.closeModal('modal') }]
        });
    }

    /**
     * Show warning modal
     */
    showWarning(title, message) {
        this.showModal(title, message, {
            type: 'warning',
            buttons: [{ text: 'OK', action: () => this.closeModal('modal') }]
        });
    }

    /**
     * Show confirmation dialog
     */
    showConfirmation(title, message, onConfirm, onCancel = null) {
        this.showModal(title, message, {
            type: 'warning',
            buttons: [
                { 
                    text: 'Cancel', 
                    type: 'secondary',
                    action: () => {
                        this.closeModal('modal');
                        if (onCancel) onCancel();
                    }
                },
                { 
                    text: 'Confirm', 
                    type: 'danger',
                    action: () => {
                        this.closeModal('modal');
                        onConfirm();
                    }
                }
            ]
        });
    }

    /**
     * Show encoding error modal with detailed message
     */
    showEncodingErrorModal(message) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3 style="color: #e74c3c;">🔤 Bengali Text Encoding Error</h3>
                <button class="modal-close" onclick="window.modalManager.closeModal('modal')">&times;</button>
            </div>
            <div class="modal-body">
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
            </div>
            <div class="modal-footer">
                <button onclick="window.modalManager.closeModal('modal')" class="btn btn-primary">OK</button>
            </div>
        `;
        
        modal.style.display = 'block';
        this.activeModals.add('modal');
    }

    /**
     * Show bulk absent modal
     */
    showMarkAllAbsentModal() {
        const modal = document.getElementById('bulkAbsentModal');
        if (modal) {
            modal.style.display = 'block';
            this.activeModals.add('bulkAbsentModal');
            
            // Focus the reason input
            const reasonInput = document.getElementById('bulkAbsentReason');
            if (reasonInput) {
                reasonInput.focus();
            }
        }
    }

    /**
     * Close bulk absent modal
     */
    closeBulkAbsentModal() {
        const modal = document.getElementById('bulkAbsentModal');
        if (modal) {
            modal.style.display = 'none';
            this.activeModals.delete('bulkAbsentModal');
            
            // Clear the input
            const reasonInput = document.getElementById('bulkAbsentReason');
            if (reasonInput) {
                reasonInput.value = '';
            }
        }
    }

    /**
     * Show reset attendance modal
     */
    showResetAttendanceModal() {
        const modal = document.getElementById('resetAttendanceModal');
        if (modal) {
            modal.style.display = 'block';
            this.activeModals.add('resetAttendanceModal');
            
            // Set up confirmation input listener
            const confirmationInput = document.getElementById('resetConfirmationInput');
            const confirmButton = document.getElementById('confirmResetBtn');
            
            if (confirmationInput && confirmButton) {
                const updateButton = () => {
                    confirmButton.disabled = confirmationInput.value.toUpperCase() !== 'RESET';
                };
                
                confirmationInput.addEventListener('input', updateButton);
                confirmationInput.focus();
                updateButton(); // Initial state
            }
        }
    }

    /**
     * Close reset attendance modal
     */
    closeResetAttendanceModal() {
        const modal = document.getElementById('resetAttendanceModal');
        if (modal) {
            modal.style.display = 'none';
            this.activeModals.delete('resetAttendanceModal');
            
            // Clear input
            const confirmationInput = document.getElementById('resetConfirmationInput');
            if (confirmationInput) {
                confirmationInput.value = '';
            }
        }
    }

    /**
     * Show loading spinner
     */
    showLoading(message = 'Loading...') {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="spinner"></div>
                    <p class="loading-message">${message}</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            loadingOverlay.querySelector('.loading-message').textContent = message;
        }
        
        loadingOverlay.style.display = 'flex';
        this.activeModals.add('loadingOverlay');
    }

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            this.activeModals.delete('loadingOverlay');
        }
    }

    /**
     * Update loading message
     */
    updateLoadingMessage(message) {
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }

    /**
     * Show notification toast
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add to notifications container or create one
        let container = document.getElementById('notificationsContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationsContainer';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
        
        return notification;
    }

    /**
     * Close a specific modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.activeModals.delete(modalId);
        }
    }

    /**
     * Close the topmost modal
     */
    closeTopModal() {
        if (this.activeModals.size > 0) {
            const lastModal = Array.from(this.activeModals).pop();
            this.closeModal(lastModal);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
        this.activeModals.clear();
    }

    /**
     * Check if any modal is open
     */
    hasOpenModals() {
        return this.activeModals.size > 0;
    }

    /**
     * Show progress modal for bulk operations
     */
    showProgressModal(title, initialMessage = 'Processing...') {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <div class="progress-container">
                    <div class="progress-bar-container">
                        <div class="progress-bar" id="progressBar" style="width: 0%"></div>
                    </div>
                    <p class="progress-message" id="progressMessage">${initialMessage}</p>
                    <div class="progress-details" id="progressDetails"></div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        this.activeModals.add('modal');
        
        return {
            updateProgress: (percentage, message, details = '') => {
                const progressBar = document.getElementById('progressBar');
                const progressMessage = document.getElementById('progressMessage');
                const progressDetails = document.getElementById('progressDetails');
                
                if (progressBar) progressBar.style.width = `${percentage}%`;
                if (progressMessage) progressMessage.textContent = message;
                if (progressDetails) progressDetails.innerHTML = details;
            },
            complete: (finalMessage) => {
                setTimeout(() => {
                    this.closeModal('modal');
                    if (finalMessage) {
                        this.showSuccess('Complete', finalMessage);
                    }
                }, 1000);
            }
        };
    }
}

// Create and export the modal manager instance
export const modalManager = new ModalManager();

// Make it available globally for HTML onclick handlers
window.modalManager = modalManager;

// Global functions for backward compatibility
window.showModal = (title, message) => modalManager.showModal(title, message);
window.closeModal = () => modalManager.closeModal('modal');
window.showMarkAllAbsentModal = () => modalManager.showMarkAllAbsentModal();
window.closeBulkAbsentModal = () => modalManager.closeBulkAbsentModal();
window.showResetAttendanceModal = () => modalManager.showResetAttendanceModal();
window.closeResetAttendanceModal = () => modalManager.closeResetAttendanceModal();