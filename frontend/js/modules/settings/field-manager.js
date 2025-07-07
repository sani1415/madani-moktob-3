class FieldManager {
    constructor() {
        this.table = document.getElementById('field-table');
        this.form = document.getElementById('field-form');
        this.form.dataset.editingId = ''; // To store the ID of the field being edited

        this.fieldTypeSelect = this.form.elements['type'];
        this.optionsGroup = document.getElementById('field-options-group');
        this.optionsInput = this.form.elements['options'];
        this.fieldNameInput = this.form.elements['name'];
        this.fieldNameError = document.getElementById('field-name-error');

        this.bindEvents();
        this.loadFields();
        this.toggleOptionsVisibility(); // Set initial visibility
    }

    bindEvents() {
        this.form.addEventListener('submit', e => this.saveField(e));
        // Event delegation for edit and delete buttons
        this.table.addEventListener('click', e => {
            if (e.target.classList.contains('edit-btn')) {
                this.editField(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteField(e.target.dataset.id);
            }
        });

        // Toggle options input visibility based on field type
        this.fieldTypeSelect.addEventListener('change', () => this.toggleOptionsVisibility());

        // Client-side validation for field name
        this.fieldNameInput.addEventListener('input', () => this.validateFieldName());
    }

    validateFieldName() {
        const name = this.fieldNameInput.value;
        // Regex: starts with lowercase letter or underscore, followed by lowercase letters, numbers, or underscores
        const isValid = /^[a-z_][a-z0-9_]*$/.test(name);
        if (!isValid && name !== '') { // Only show error if input is not empty and invalid
            this.fieldNameInput.classList.add('is-invalid');
            this.fieldNameError.textContent = 'Invalid name: Use lowercase letters, numbers, underscores (start with letter/underscore). No spaces.';
        } else {
            this.fieldNameInput.classList.remove('is-invalid');
            this.fieldNameError.textContent = '';
        }
        return isValid;
    }

    toggleOptionsVisibility() {
        if (this.fieldTypeSelect.value === 'select') {
            this.optionsGroup.style.display = 'block';
        } else {
            this.optionsGroup.style.display = 'none';
            this.optionsInput.value = ''; // Clear options when not a select type
        }
    }

    async loadFields() {
        try {
            const response = await fetch('/api/fields');
            const fields = await response.json();
            this.renderFields(fields);
        } catch (error) {
            console.error('Failed to load fields:', error);
            alert('Failed to load custom fields. Please check the server.');
        }
    }

    renderFields(fields) {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) {
            console.error('Table body not found for field-table');
            return;
        }
        tbody.innerHTML = ''; // Clear existing
        fields.forEach(field => {
            const row = document.createElement('tr');
            const optionsDisplay = field.options && field.options.length > 0 ? field.options.join(', ') : '-';
            row.innerHTML = `
                <td>${field.label}</td>
                <td>${field.name}</td>
                <td>${field.type}</td>
                <td>${optionsDisplay}</td>
                <td>${field.visible ? 'Yes' : 'No'}</td>
                <td>${field.required ? 'Yes' : 'No'}</td>
                <td>
                    <button class="edit-btn" data-id="${field.id}">Edit</button>
                    <button class="delete-btn" data-id="${field.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async saveField(e) {
        e.preventDefault();

        if (!this.validateFieldName()) {
            alert('Please correct the field name before saving.');
            return;
        }

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            label: formData.get('label'),
            type: formData.get('type'),
            visible: formData.get('visible') === 'on',
            required: formData.get('required') === 'on'
        };

        // Process options only if type is 'select'
        if (data.type === 'select') {
            const optionsString = formData.get('options');
            if (optionsString) {
                data.options = optionsString.split(',').map(item => item.trim()).filter(item => item !== '');
            } else {
                data.options = [];
            }
        } else {
            data.options = null; // Ensure options are not sent for non-select types
        }

        const editingId = this.form.dataset.editingId;
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/fields/${editingId}` : '/api/fields';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                this.form.reset();
                this.form.dataset.editingId = ''; // Clear editing state
                this.toggleOptionsVisibility(); // Hide options field
                this.loadFields(); // Refresh list
                alert('Field saved successfully!');
            } else {
                const errorData = await response.json();
                console.error('Failed to save field:', errorData.error || response.statusText);
                alert(`Failed to save field: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Network error saving field:', error);
            alert('An error occurred while saving the field.');
        }
    }

    async editField(fieldId) {
        try {
            const response = await fetch(`/api/fields/${fieldId}`);
            if (!response.ok) {
                throw new Error('Field not found');
            }
            const field = await response.json();
            
            // Populate the form with field data
            this.fieldNameInput.value = field.name;
            this.form.elements['label'].value = field.label;
            this.fieldTypeSelect.value = field.type;
            this.form.elements['visible'].checked = field.visible;
            this.form.elements['required'].checked = field.required;
            
            // Populate options if it's a select type
            if (field.type === 'select' && field.options && field.options.length > 0) {
                this.optionsInput.value = field.options.join(', ');
            } else {
                this.optionsInput.value = '';
            }
            this.toggleOptionsVisibility(); // Show/hide options group based on loaded type
            this.form.dataset.editingId = field.id; // Set editing state
            
            this.validateFieldName(); // Re-validate the name after populating

            // Scroll to form
            this.form.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Failed to edit field:', error);
            alert('Failed to load field details for editing.');
        }
    }

    async deleteField(fieldId) {
        if (!confirm('Are you sure you want to delete this field? This will also remove all associated data for students!')) {
            return;
        }
        try {
            const response = await fetch(`/api/fields/${fieldId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Field deleted successfully!');
                this.loadFields(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Failed to delete field:', errorData.error || response.statusText);
                alert(`Failed to delete field: ${errorData.error || response.statusText}`);
            }
        } catch (error) {
            console.error('Network error deleting field:', error);
            alert('An error occurred while deleting the field.');
        }
    }
}

// Initialize when the settings page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make sure this only runs if the field management elements are present
    if (document.getElementById('field-table') && document.getElementById('field-form')) {
        new FieldManager();
    }
}); 