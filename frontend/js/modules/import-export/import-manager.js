/**
 * Import/Export Manager Module
 * Handles bulk student import and export functionality including:
 * - CSV file processing
 * - Student bulk import
 * - Data validation
 * - Import progress tracking
 * - Export functionality
 */

import { appManager } from '../../core/app.js';
import { api } from '../../core/api.js';
import { modalManager } from '../ui/modal-manager.js';

class ImportManager {
    constructor() {
        this.selectedFile = null;
        this.importResults = null;
    }

    /**
     * Initialize the import manager
     */
    async initialize() {
        console.log('🔧 Initializing Import Manager...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Import Manager initialized successfully');
    }

    /**
     * Set up event listeners for import functionality
     */
    setupEventListeners() {
        // File input change listener
        const fileInput = document.getElementById('excelFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }

    /**
     * Show bulk import section
     */
    showBulkImport() {
        const bulkImportSection = document.getElementById('bulkImportSection');
        const studentsListContainer = document.getElementById('studentsListContainer');
        
        if (bulkImportSection && studentsListContainer) {
            bulkImportSection.style.display = 'block';
            studentsListContainer.style.display = 'none';
        }
    }

    /**
     * Hide bulk import section
     */
    hideBulkImport() {
        const bulkImportSection = document.getElementById('bulkImportSection');
        const studentsListContainer = document.getElementById('studentsListContainer');
        
        if (bulkImportSection && studentsListContainer) {
            bulkImportSection.style.display = 'none';
            studentsListContainer.style.display = 'block';
        }
        
        // Reset import state
        this.resetBulkImport();
    }

    /**
     * Handle file selection
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (file) {
            this.selectedFile = file;
            
            // Validate file type
            if (!file.name.toLowerCase().endsWith('.csv')) {
                modalManager.showError('Invalid File', 'Please select a CSV file');
                this.resetUploadZone();
                return;
            }
            
            // Update upload zone
            this.updateUploadZone(file.name, file.size);
            
            // Enable upload button
            if (uploadBtn) {
                uploadBtn.disabled = false;
            }
        } else {
            this.selectedFile = null;
            this.resetUploadZone();
            if (uploadBtn) {
                uploadBtn.disabled = true;
            }
        }
    }

    /**
     * Update upload zone with file info
     */
    updateUploadZone(fileName, fileSize) {
        const uploadZone = document.querySelector('.upload-drop-zone');
        if (uploadZone) {
            const fileSizeKB = (fileSize / 1024).toFixed(1);
            uploadZone.innerHTML = `
                <i class="fas fa-file-csv" style="color: #28a745; font-size: 2em;"></i>
                <p><strong>${fileName}</strong></p>
                <p class="file-size">${fileSizeKB} KB</p>
                <p style="color: #28a745; font-size: 0.9em;">Ready to upload</p>
            `;
        }
    }

    /**
     * Reset upload zone
     */
    resetUploadZone() {
        const uploadZone = document.querySelector('.upload-drop-zone');
        if (uploadZone) {
            uploadZone.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to select CSV file</p>
                <p class="file-types">Supports .csv files (Excel saved as CSV)</p>
            `;
        }
    }

    /**
     * Process Excel/CSV file for import
     */
    async processExcelFile() {
        if (!this.selectedFile) {
            modalManager.showError('No File Selected', 'Please select a CSV file first');
            return;
        }

        try {
            // Show progress modal
            const progress = modalManager.showProgressModal('Importing Students', 'Reading file...');
            
            // Read and parse CSV file
            const studentsData = await this.readExcelFile(this.selectedFile);
            
            if (!studentsData || studentsData.length === 0) {
                progress.complete();
                modalManager.showError('Import Failed', 'No valid student data found in the file');
                return;
            }

            progress.updateProgress(30, 'Validating data...');
            
            // Import students in batches
            const result = await this.importStudentsBatch(studentsData, progress);
            
            progress.updateProgress(100, 'Import complete!');
            progress.complete();
            
            // Show results
            this.showImportResults(result.total, result.successful, result.failed, result.updated, result.duplicateRolls, result.errors);
            
            // Reset import form
            this.resetBulkImport();
            
            // Refresh student list if needed
            if (window.studentManager) {
                window.studentManager.displayStudentsList();
            }
            
        } catch (error) {
            console.error('Error processing file:', error);
            modalManager.showError('Import Error', 'Failed to process the file. Please check the file format and try again.');
        }
    }

    /**
     * Read and parse CSV file
     */
    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                    
                    if (lines.length < 2) {
                        reject(new Error('File must contain header row and at least one data row'));
                        return;
                    }
                    
                    // Parse CSV (simple implementation - handles basic CSV format)
                    const headers = this.parseCSVLine(lines[0]);
                    const students = [];
                    
                    // Validate headers
                    const requiredHeaders = ['id', 'name', 'fatherName', 'rollNumber', 'mobileNumber', 'district', 'upazila', 'class', 'registrationDate'];
                    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
                    
                    if (missingHeaders.length > 0) {
                        reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
                        return;
                    }
                    
                    // Parse data rows
                    for (let i = 1; i < lines.length; i++) {
                        const values = this.parseCSVLine(lines[i]);
                        if (values.length === headers.length) {
                            const student = {};
                            headers.forEach((header, index) => {
                                student[header] = values[index].trim();
                            });
                            
                            // Validate required fields
                            if (student.name && student.fatherName && student.rollNumber && student.class) {
                                students.push(student);
                            }
                        }
                    }
                    
                    console.log(`Parsed ${students.length} students from CSV`);
                    resolve(students);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Parse a CSV line (handles basic CSV format)
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    /**
     * Import students in batches
     */
    async importStudentsBatch(studentsData, progress) {
        const batchSize = 10;
        const total = studentsData.length;
        let successful = 0;
        let failed = 0;
        let updated = 0;
        const duplicateRolls = [];
        const errors = [];
        
        const existingStudents = appManager.getState('students') || [];
        const existingRolls = new Set(existingStudents.map(s => s.rollNumber));
        
        for (let i = 0; i < studentsData.length; i += batchSize) {
            const batch = studentsData.slice(i, i + batchSize);
            const progressPercent = Math.round(((i + batch.length) / total) * 70) + 30; // 30-100%
            
            progress.updateProgress(
                progressPercent, 
                `Processing students ${i + 1}-${Math.min(i + batch.length, total)} of ${total}...`
            );
            
            for (const studentData of batch) {
                try {
                    // Check for duplicate roll numbers
                    if (existingRolls.has(studentData.rollNumber)) {
                        // Update existing student
                        const response = await api.updateStudent(studentData);
                        if (response.success) {
                            updated++;
                        } else {
                            failed++;
                            errors.push(`Failed to update ${studentData.name}: ${response.error}`);
                        }
                    } else {
                        // Create new student
                        const response = await api.createStudent(studentData);
                        if (response.success) {
                            successful++;
                            existingRolls.add(studentData.rollNumber);
                        } else {
                            failed++;
                            if (response.error && response.error.includes('roll number')) {
                                duplicateRolls.push(studentData.rollNumber);
                            }
                            errors.push(`Failed to create ${studentData.name}: ${response.error}`);
                        }
                    }
                } catch (error) {
                    failed++;
                    errors.push(`Error processing ${studentData.name}: ${error.message}`);
                }
            }
            
            // Small delay to allow UI updates
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Reload students data
        await appManager.loadStudents();
        
        return { total, successful, failed, updated, duplicateRolls, errors };
    }

    /**
     * Show import results
     */
    showImportResults(total, successful, failed, updated, duplicateRolls, errors) {
        const resultsDiv = document.getElementById('importResults');
        if (!resultsDiv) return;
        
        let html = `
            <div class="import-results-content">
                <h4>📊 Import Results</h4>
                <div class="results-summary">
                    <div class="result-item success">
                        <i class="fas fa-check-circle"></i>
                        <span>${successful} students imported successfully</span>
                    </div>
        `;
        
        if (updated > 0) {
            html += `
                <div class="result-item info">
                    <i class="fas fa-sync-alt"></i>
                    <span>${updated} students updated</span>
                </div>
            `;
        }
        
        if (failed > 0) {
            html += `
                <div class="result-item error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${failed} students failed to import</span>
                </div>
            `;
        }
        
        html += `
                    <div class="result-item total">
                        <i class="fas fa-list"></i>
                        <span>Total processed: ${total}</span>
                    </div>
                </div>
        `;
        
        if (duplicateRolls.length > 0) {
            html += `
                <div class="duplicate-rolls">
                    <h5>⚠️ Duplicate Roll Numbers:</h5>
                    <p>These roll numbers already exist: ${duplicateRolls.join(', ')}</p>
                </div>
            `;
        }
        
        if (errors.length > 0) {
            html += `
                <div class="import-errors">
                    <h5>❌ Errors:</h5>
                    <ul>
                        ${errors.slice(0, 10).map(error => `<li>${error}</li>`).join('')}
                        ${errors.length > 10 ? `<li>... and ${errors.length - 10} more errors</li>` : ''}
                    </ul>
                </div>
            `;
        }
        
        html += `
                <div class="results-actions">
                    <button onclick="window.importManager.hideImportResults()" class="btn btn-primary">
                        <i class="fas fa-check"></i> Continue
                    </button>
                </div>
            </div>
        `;
        
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    }

    /**
     * Hide import results
     */
    hideImportResults() {
        const resultsDiv = document.getElementById('importResults');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }
    }

    /**
     * Reset bulk import form
     */
    resetBulkImport() {
        // Reset file input
        const fileInput = document.getElementById('excelFile');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Reset upload zone
        this.resetUploadZone();
        
        // Disable upload button
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
        }
        
        // Hide results
        this.hideImportResults();
        
        // Reset state
        this.selectedFile = null;
        this.importResults = null;
    }

    /**
     * Download all students as CSV
     */
    downloadAllStudentsCSV() {
        const students = appManager.getState('students') || [];
        
        if (students.length === 0) {
            modalManager.showWarning('No Data', 'No students found to export');
            return;
        }
        
        try {
            // CSV headers
            const headers = ['id', 'name', 'fatherName', 'rollNumber', 'mobileNumber', 'district', 'upazila', 'class', 'registrationDate'];
            
            // Convert students to CSV
            let csvContent = headers.join(',') + '\n';
            
            students.forEach(student => {
                const row = headers.map(header => {
                    let value = student[header] || '';
                    // Escape commas and quotes in CSV
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
                csvContent += row.join(',') + '\n';
            });
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `madani_maktab_students_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            modalManager.showSuccess('Export Complete', `Successfully exported ${students.length} students to CSV file`);
            
        } catch (error) {
            console.error('Error exporting CSV:', error);
            modalManager.showError('Export Failed', 'Failed to export students data');
        }
    }
}

// Create and export the import manager instance
export const importManager = new ImportManager();

// Make it available globally for HTML onclick handlers
window.importManager = importManager;

// Global functions for backward compatibility
window.showBulkImport = () => importManager.showBulkImport();
window.hideBulkImport = () => importManager.hideBulkImport();
window.processExcelFile = () => importManager.processExcelFile();
window.downloadAllStudentsCSV = () => importManager.downloadAllStudentsCSV();