/**
 * Student Management Module
 * Handles all student-related operations including CRUD and validation
 */

import { studentAPI } from '../../core/api.js';
import { 
    generateStudentId, 
    validateFormData, 
    sortStudents, 
    getTodayDateString 
} from '../../core/utils.js';
import { VALIDATION_RULES } from '../../core/config.js';
import { appState, updateAppState } from '../../core/app.js';

/**
 * Student Manager Class
 */
export class StudentManager {
    constructor() {
        this.currentEditingId = null;
        this.initialized = false;
    }

    /**
     * Initialize the student manager
     */
    async initialize() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        console.log('Student Manager initialized');
    }

    /**
     * Setup event listeners for student form
     */
    setupEventListeners() {
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.currentEditingId) {
            await this.updateStudent(this.currentEditingId);
        } else {
            await this.registerStudent();
        }
    }

    /**
     * Register a new student
     */
    async registerStudent() {
        try {
            const formData = this.getFormData();
            
            // Validate form data
            if (!this.validateStudentForm(formData)) {
                return;
            }

            // Check for duplicate roll number
            if (this.isDuplicateRollNumber(formData.rollNumber)) {
                this.showModal('error', `Roll number ${formData.rollNumber} already exists. Please choose a different roll number.`);
                return;
            }

            // Generate student ID
            formData.id = generateStudentId(appState.students);
            formData.registrationDate = getTodayDateString();

            // Register student with backend
            const result = await studentAPI.create(formData);
            
            if (result.student) {
                // Update application state
                const updatedStudents = [...appState.students, result.student];
                updateAppState({ students: updatedStudents });

                // Reset form and update UI
                this.resetForm();
                this.showModal('success', `${formData.name} has been registered successfully - Roll Number: ${result.student.rollNumber}`);
                
                // Trigger UI updates
                this.notifyStudentUpdate();
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.showModal('error', error.message || 'Network error. Please try again.');
        }
    }

    /**
     * Update an existing student
     * @param {string} studentId - ID of student to update
     */
    async updateStudent(studentId) {
        try {
            const formData = this.getFormData();
            formData.id = studentId;

            // Validate form data
            if (!this.validateStudentForm(formData)) {
                return;
            }

            // Check for duplicate roll number (excluding current student)
            if (this.isDuplicateRollNumber(formData.rollNumber, studentId)) {
                this.showModal('error', `Roll number ${formData.rollNumber} already exists. Please choose a different roll number.`);
                return;
            }

            // Update student with backend
            const result = await studentAPI.update(studentId, formData);
            
            if (result.student) {
                // Update application state
                const updatedStudents = appState.students.map(s => 
                    s.id === studentId ? result.student : s
                );
                updateAppState({ students: updatedStudents });

                // Reset form and update UI
                this.resetForm();
                this.hideRegistrationForm();
                this.showModal('success', 'Student updated successfully');
                
                // Trigger UI updates
                this.notifyStudentUpdate();
            }

        } catch (error) {
            console.error('Update error:', error);
            this.showModal('error', error.message || 'Network error. Please try again.');
        }
    }

    /**
     * Delete a student
     * @param {string} studentId - ID of student to delete
     */
    async deleteStudent(studentId) {
        try {
            const student = appState.students.find(s => s.id === studentId);
            if (!student) return;

            // First confirmation
            const confirmed1 = confirm(`Are you sure you want to delete ${student.name} বিন ${student.fatherName}? This action cannot be undone.`);
            if (!confirmed1) return;

            // Second confirmation with stronger warning
            const confirmed2 = confirm(`Are you absolutely sure you want to delete this student?\n\nThis action is permanent and cannot be undone. All attendance records for this student will also be deleted.`);
            if (!confirmed2) return;

            // Delete student from backend
            await studentAPI.delete(studentId);

            // Update application state
            const updatedStudents = appState.students.filter(s => s.id !== studentId);
            updateAppState({ students: updatedStudents });

            this.showModal('success', 'Student deleted successfully');
            
            // Trigger UI updates
            this.notifyStudentUpdate();

        } catch (error) {
            console.error('Delete error:', error);
            this.showModal('error', error.message || 'Network error. Please try again.');
        }
    }

    /**
     * Delete all students
     */
    async deleteAllStudents() {
        try {
            if (appState.students.length === 0) {
                this.showModal('error', 'No students to delete.');
                return;
            }

            // First confirmation
            const confirmed1 = confirm(`Are you sure you want to delete ALL students?\n\nThis action cannot be undone.`);
            if (!confirmed1) return;

            // Second confirmation with stronger warning
            const confirmed2 = confirm(`Are you absolutely sure you want to delete ALL students?\n\nThis will permanently delete ALL students and their attendance records. This action is irreversible and will completely reset your student database.`);
            if (!confirmed2) return;

            // Get count before deletion
            const deletedCount = appState.students.length;

            // Delete all students from backend
            await studentAPI.deleteAll();

            // Update application state
            updateAppState({ students: [] });

            this.showModal('success', `All ${deletedCount} students have been deleted successfully.`);
            
            // Trigger UI updates
            this.notifyStudentUpdate();

        } catch (error) {
            console.error('Delete all error:', error);
            this.showModal('error', error.message || 'Network error. Please try again.');
        }
    }

    /**
     * Edit a student
     * @param {string} studentId - ID of student to edit
     */
    editStudent(studentId) {
        const student = appState.students.find(s => s.id === studentId);
        if (!student) return;

        // Populate form with student data
        this.populateForm(student);
        
        // Show form in edit mode
        this.showRegistrationForm();
        
        // Set edit mode
        this.currentEditingId = studentId;
        
        // Update form title and button
        this.updateFormForEdit();
    }

    /**
     * Get form data
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            name: document.getElementById('studentName')?.value.trim() || '',
            fatherName: document.getElementById('fatherName')?.value.trim() || '',
            rollNumber: document.getElementById('rollNumber')?.value.trim() || '',
            mobileNumber: document.getElementById('mobile')?.value.trim() || '',
            district: document.getElementById('district')?.value.trim() || '',
            upazila: document.getElementById('upazila')?.value.trim() || '',
            class: document.getElementById('studentClass')?.value || ''
        };
    }

    /**
     * Populate form with student data
     * @param {Object} student - Student object
     */
    populateForm(student) {
        const fields = [
            { id: 'studentName', value: student.name },
            { id: 'fatherName', value: student.fatherName },
            { id: 'rollNumber', value: student.rollNumber },
            { id: 'mobile', value: student.mobileNumber },
            { id: 'district', value: student.district },
            { id: 'upazila', value: student.upazila },
            { id: 'studentClass', value: student.class }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.value = field.value || '';
            }
        });
    }

    /**
     * Validate student form
     * @param {Object} formData - Form data to validate
     * @returns {boolean} Whether form is valid
     */
    validateStudentForm(formData) {
        const rules = VALIDATION_RULES.student;
        
        // Check required fields
        const missingFields = rules.required.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            this.showModal('error', 'Please fill in all required fields.');
            return false;
        }

        // Check minimum lengths
        for (const [field, minLength] of Object.entries(rules.minLength)) {
            if (formData[field] && formData[field].length < minLength) {
                this.showModal('error', `${field} must be at least ${minLength} characters long.`);
                return false;
            }
        }

        // Check maximum lengths
        for (const [field, maxLength] of Object.entries(rules.maxLength)) {
            if (formData[field] && formData[field].length > maxLength) {
                this.showModal('error', `${field} cannot exceed ${maxLength} characters.`);
                return false;
            }
        }

        return true;
    }

    /**
     * Check if roll number is duplicate
     * @param {string} rollNumber - Roll number to check
     * @param {string} excludeId - Student ID to exclude from check
     * @returns {boolean} Whether roll number is duplicate
     */
    isDuplicateRollNumber(rollNumber, excludeId = null) {
        return appState.students.some(student => 
            student.rollNumber === rollNumber && student.id !== excludeId
        );
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        const form = document.getElementById('studentForm');
        if (form) {
            form.reset();
        }

        // Reset form to registration mode
        this.currentEditingId = null;
        this.updateFormForRegistration();
    }

    /**
     * Update form for registration mode
     */
    updateFormForRegistration() {
        const titleElement = document.querySelector('#studentRegistrationForm h3');
        const buttonElement = document.querySelector('#studentRegistrationForm .btn-primary');
        
        if (titleElement) {
            titleElement.textContent = 'Register New Student';
        }
        
        if (buttonElement) {
            buttonElement.textContent = 'Register Student';
        }
    }

    /**
     * Update form for edit mode
     */
    updateFormForEdit() {
        const titleElement = document.querySelector('#studentRegistrationForm h3');
        const buttonElement = document.querySelector('#studentRegistrationForm .btn-primary');
        
        if (titleElement) {
            titleElement.textContent = 'Edit Student';
        }
        
        if (buttonElement) {
            buttonElement.textContent = 'Update Student';
        }
    }

    /**
     * Show registration form
     */
    showRegistrationForm() {
        const listContainer = document.getElementById('studentsListContainer');
        const formContainer = document.getElementById('studentRegistrationForm');
        
        if (listContainer) listContainer.style.display = 'none';
        if (formContainer) formContainer.style.display = 'block';
    }

    /**
     * Hide registration form
     */
    hideRegistrationForm() {
        const listContainer = document.getElementById('studentsListContainer');
        const formContainer = document.getElementById('studentRegistrationForm');
        
        if (listContainer) listContainer.style.display = 'block';
        if (formContainer) formContainer.style.display = 'none';
        
        this.resetForm();
    }

    /**
     * Show modal message
     * @param {string} type - Modal type (success, error, info)
     * @param {string} message - Message to display
     */
    showModal(type, message) {
        // This will be implemented when we extract the modal module
        const title = type === 'success' ? 'Success' : 'Error';
        alert(`${title}: ${message}`);
    }

    /**
     * Notify other components about student updates
     */
    notifyStudentUpdate() {
        // Dispatch custom event for student updates
        const event = new CustomEvent('studentUpdate', {
            detail: { students: appState.students }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get sorted students
     * @returns {Array} Sorted array of students
     */
    getSortedStudents() {
        return sortStudents(appState.students);
    }

    /**
     * Get students by class
     * @param {string} className - Class name
     * @returns {Array} Students in the specified class
     */
    getStudentsByClass(className) {
        return appState.students.filter(student => student.class === className);
    }

    /**
     * Get student by ID
     * @param {string} studentId - Student ID
     * @returns {Object|null} Student object or null
     */
    getStudentById(studentId) {
        return appState.students.find(student => student.id === studentId) || null;
    }

    /**
     * Get students count
     * @returns {number} Number of students
     */
    getStudentsCount() {
        return appState.students.length;
    }

    /**
     * Get students count by class
     * @param {string} className - Class name
     * @returns {number} Number of students in class
     */
    getStudentsCountByClass(className) {
        return appState.students.filter(student => student.class === className).length;
    }

    /**
     * Search students
     * @param {string} query - Search query
     * @param {string} field - Field to search in (name, rollNumber, mobile)
     * @returns {Array} Filtered students
     */
    searchStudents(query, field = 'name') {
        if (!query) return appState.students;
        
        const lowerQuery = query.toLowerCase();
        return appState.students.filter(student => {
            const fieldValue = student[field] || '';
            return fieldValue.toLowerCase().includes(lowerQuery);
        });
    }

    /**
     * Shutdown the student manager
     */
    shutdown() {
        this.initialized = false;
        this.currentEditingId = null;
        console.log('Student Manager shutdown');
    }
}

// Create and export singleton instance
export const studentManager = new StudentManager();

// Export individual functions for backward compatibility
export const registerStudent = () => studentManager.registerStudent();
export const updateStudent = (id) => studentManager.updateStudent(id);
export const deleteStudent = (id) => studentManager.deleteStudent(id);
export const deleteAllStudents = () => studentManager.deleteAllStudents();
export const editStudent = (id) => studentManager.editStudent(id);
export const showStudentRegistrationForm = () => studentManager.showRegistrationForm();
export const hideStudentRegistrationForm = () => studentManager.hideRegistrationForm();
export const resetStudentForm = () => studentManager.resetForm();