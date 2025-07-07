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
        this.fields = []; // Will hold field configurations
        this.studentForm = document.getElementById('student-form'); // Reference to the form
        this.studentTableBody = document.querySelector('#student-table tbody'); // Reference to the table body
        this.currentEditingStudentId = null; // To keep track of the student being edited

        this.bindEvents();
        this.init();
    }

    async init() {
        await this.loadFieldConfig();
        this.renderStudentForm();
        this.renderStudentList();
    }

    bindEvents() {
        // Event listener for the student form submission
        this.studentForm.addEventListener('submit', e => this.saveStudent(e));

        // Event delegation for edit and delete buttons in the student list
        this.studentTableBody.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const studentId = e.target.dataset.id;
                await this.loadStudentForEdit(studentId);
            } else if (e.target.classList.contains('delete-btn')) {
                const studentId = e.target.dataset.id;
                await this.deleteStudent(studentId);
            }
        });

        // Add a "Clear Form" button listener if you have one
        const clearFormBtn = document.getElementById('clear-student-form-btn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => this.clearStudentForm());
        }
    }

    async loadFieldConfig() {
        try {
            const response = await fetch('/api/fields');
            this.fields = await response.json();
            // Sort fields for consistent rendering (optional)
            this.fields.sort((a, b) => a.label.localeCompare(b.label));
        } catch (error) {
            console.error('Failed to load field config:', error);
        }
    }

    renderStudentForm(studentData = {}) {
        this.studentForm.innerHTML = ''; // Clear existing inputs
        this.currentEditingStudentId = studentData.id || null;

        // Only include visible fields for the form
        const visibleFields = this.fields.filter(field => field.visible);

        visibleFields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'form-group';

            let inputHtml;
            const fieldValue = studentData[field.name] || '';

            switch (field.type) {
                case 'date':
                    inputHtml = `<input type="date" name="${field.name}" value="${fieldValue}" ${field.required ? 'required' : ''}>`;
                    break;
                case 'select':
                    // Render a select dropdown with options
                    let optionsHtml = '<option value="">Select...</option>';
                    if (field.options && field.options.length > 0) {
                        optionsHtml += field.options.map(option => 
                            `<option value="${option}" ${fieldValue === option ? 'selected' : ''}>${option}</option>`
                        ).join('');
                    }
                    inputHtml = `<select name="${field.name}" ${field.required ? 'required' : ''}>${optionsHtml}</select>`;
                    break;
                case 'textarea':
                    inputHtml = `<textarea name="${field.name}" ${field.required ? 'required' : ''}>${fieldValue}</textarea>`;
                    break;
                case 'number': // Explicitly handle number type
                    inputHtml = `<input type="number" name="${field.name}" value="${fieldValue}" ${field.required ? 'required' : ''}>`;
                    break;
                default: // text
                    inputHtml = `<input type="text" name="${field.name}" value="${fieldValue}" ${field.required ? 'required' : ''}>`;
                    break;
            }

            div.innerHTML = `
                <label for="${field.name}">${field.label}${field.required ? ' <span class="required">*</span>' : ''}</label>
                ${inputHtml}
            `;
            this.studentForm.appendChild(div);
        });

        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = this.currentEditingStudentId ? 'Update Student' : 'Add Student';
        this.studentForm.appendChild(submitButton);

        // Add a clear form button
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.id = 'clear-student-form-btn'; // Assign ID for event binding
        clearButton.textContent = 'Clear Form';
        this.studentForm.appendChild(clearButton);
    }

    async loadStudentForEdit(studentId) {
        try {
            const response = await fetch(`/api/students/${studentId}`);
            if (!response.ok) {
                throw new Error('Student not found');
            }
            const student = await response.json();
            this.renderStudentForm(student); // Populate the form for editing
            // Scroll to form or highlight
            this.studentForm.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Failed to load student for edit:', error);
            alert('Failed to load student details.');
        }
    }

    clearStudentForm() {
        this.renderStudentForm(); // Render an empty form
    }

    async saveStudent(e) {
        e.preventDefault();
        const formData = new FormData(this.studentForm);
        const studentData = {};

        // Collect all form data based on current visible fields
        this.fields.filter(field => field.visible).forEach(field => {
            studentData[field.name] = formData.get(field.name);
        });

        const method = this.currentEditingStudentId ? 'PUT' : 'POST';
        const url = this.currentEditingStudentId 
                    ? `/api/students/${this.currentEditingStudentId}` 
                    : '/api/students/add';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });

            if (response.ok) {
                this.renderStudentForm(); // Clear and reset form
                await this.renderStudentList(); // Refresh list
                alert('Student saved successfully!');
            } else {
                const errorData = await response.json();
                console.error('Failed to save student:', errorData.error || response.statusText);
                alert(`Failed to save student: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Network error saving student:', error);
            alert('An error occurred while saving student data.');
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student?')) {
            return;
        }
        try {
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Student deleted successfully!');
                await this.renderStudentList(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Failed to delete student:', errorData.error || response.statusText);
                alert(`Failed to delete student: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Network error deleting student:', error);
            alert('An error occurred while deleting student data.');
        }
    }

    async renderStudentList() {
        const visibleFields = this.fields.filter(field => field.visible);
        const tableHeaderRow = document.querySelector('#student-table thead tr');
        if (!tableHeaderRow) {
            console.error('Student table header row not found.');
            return;
        }

        // Clear existing headers and body
        tableHeaderRow.innerHTML = '';
        this.studentTableBody.innerHTML = '';

        // Create header row based on visible fields
        visibleFields.forEach(field => {
            const th = document.createElement('th');
            th.textContent = field.label;
            tableHeaderRow.appendChild(th);
        });
        tableHeaderRow.innerHTML += '<th>Actions</th>'; // Add action column header

        // Fetch and render students
        try {
            const response = await fetch('/api/students');
            const students = await response.json();

            students.forEach(student => {
                const row = document.createElement('tr');
                visibleFields.forEach(field => {
                    const td = document.createElement('td');
                    td.textContent = student[field.name] || ''; // Display value or empty string
                    row.appendChild(td);
                });
                // Action buttons
                const actionTd = document.createElement('td');
                actionTd.innerHTML = `
                    <button class="edit-btn" data-id="${student.id}">Edit</button>
                    <button class="delete-btn" data-id="${student.id}">Delete</button>
                `;
                row.appendChild(actionTd);
                this.studentTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to render student list:', error);
            alert('Failed to load student list.');
        }
    }

    // CSV import/export methods (already provided, ensure they use this.fields)
    async exportToCSV() {
        const fieldsToExport = this.fields; // All fields are exported, not just visible ones
        const response = await fetch('/api/students');
        const students = await response.json();

        // Create CSV header using field labels
        const headers = fieldsToExport.map(field => field.label);
        const csvRows = [headers.join(',')];

        // Create rows for each student
        students.forEach(student => {
            const row = fieldsToExport.map(field => {
                const value = student[field.name] || '';
                // Escape double quotes by doubling them, then wrap in double quotes
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });

        // Download CSV
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'students_data.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async importFromCSV(file) {
        const fields = this.fields; // Use all fields for import mapping
        const reader = new FileReader();

        reader.onload = async (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim() !== '');
            if (lines.length === 0) return;

            const headerLine = lines[0];
            // Split headers by comma, handling quoted commas if necessary
            const headers = headerLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g).map(h => h.replace(/(^"|"$)/g, '').trim());

            const studentDataArray = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                // Split values by comma, handling quoted commas if necessary
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                if (!values || values.length === 0) continue;

                const studentData = {};
                headers.forEach((header, index) => {
                    // Find the corresponding field name from our configurations
                    const fieldConfig = fields.find(f => f.label === header);
                    if (fieldConfig && values[index] !== undefined) {
                        studentData[fieldConfig.name] = values[index].replace(/(^"|"$)/g, '').trim();
                    }
                });
                studentDataArray.push(studentData);
            }

            // Send each student data to the backend
            for (const studentDataItem of studentDataArray) {
                try {
                    const response = await fetch('/api/students/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(studentDataItem)
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error(`Failed to import student: ${JSON.stringify(studentDataItem)}`, errorData);
                        // Optionally, collect errors and show a summary
                    }
                } catch (error) {
                    console.error(`Network error importing student: ${JSON.stringify(studentDataItem)}`, error);
                }
            }
            alert('CSV import process completed. Check console for any errors.');
            await this.renderStudentList(); // Refresh list after import
        };
        reader.readAsText(file);
    }
}

// Initialize when the relevant page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make sure this only runs if the student management elements are present
    if (document.getElementById('student-form') && document.getElementById('student-table')) {
        new StudentManager();
    }
});