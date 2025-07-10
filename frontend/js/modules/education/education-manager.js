/**
 * Education Management Module
 * Handles all education-related operations including book and progress tracking.
 */

class EducationManager {
    constructor() {
        this.books = [];
        this.progress = {};
        // The class list will be fetched during initialization
        this.classes = [];
    }

    /**
     * Initializes the education module by loading data and rendering the content.
     * This should be called every time the education section is displayed.
     */
    async initialize() {
        // Get the class list from the global scope, which is set in script.js
        this.classes = window.classes || [];
        
        await this.loadEducationData();
        this.renderEducationContent();
    }

    /**
     * Fetches the summary of educational books and progress from the backend.
     */
    async loadEducationData() {
        try {
            const response = await fetch('/api/education/summary');
            if (!response.ok) {
                throw new Error('Failed to load education summary from the server.');
            }
            this.books = await response.json();
        } catch (error) {
            console.error('Error loading education data:', error);
            // Display an error message in the UI if data fails to load
            const educationContent = document.querySelector('#education .education-content');
            if (educationContent) {
                educationContent.innerHTML = `<p class="text-danger">Error loading education data. Please try again later.</p>`;
            }
        }
    }

    /**
     * Renders the entire content for the education section, including all classes and their books.
     */
    renderEducationContent() {
        const educationContent = document.querySelector('#education .education-content');
        if (!educationContent) {
            console.error('Education content container not found.');
            return;
        }

        // Check if there are any classes defined in the application
        if (!this.classes || this.classes.length === 0) {
            educationContent.innerHTML = `
                <div class="no-students-message">
                    <i class="fas fa-school"></i>
                    <p>No classes found. Please add classes in the "Settings" page first.</p>
                </div>
            `;
            return;
        }

        // Generate the HTML for each class section
        educationContent.innerHTML = this.classes.map(className => {
            const classBooks = this.books.filter(book => book.class_name === className);
            return `
                <div class="class-education-section">
                    <div class="class-education-header">
                        <h3>${className}</h3>
                        <button class="btn btn-primary btn-small" onclick="educationManager.showAddBookModal('${className}')">
                            <i class="fas fa-plus"></i> Add Book
                        </button>
                    </div>
                    <div class="book-list">
                        ${classBooks.length > 0 ? classBooks.map(book => this.renderBookCard(book)).join('') : '<p>No books have been added for this class yet.</p>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renders a single book card with its details and progress.
     * @param {object} book - The book data object.
     * @returns {string} The HTML string for the book card.
     */
    renderBookCard(book) {
        const percentage = book.percentage_completed || 0;
        return `
            <div class="book-card">
                <h4>${book.book_title}</h4>
                <p>${book.description || 'No description provided.'}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%" title="${percentage}% Completed">${percentage}%</div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-secondary btn-small" onclick="educationManager.showUpdateProgressModal(${book.id})">
                        <i class="fas fa-edit"></i> Update Progress
                    </button>
                    <button class="btn btn-danger btn-small" onclick="educationManager.deleteBook(${book.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Displays a modal for adding a new book to a specific class.
     * @param {string} className - The name of the class to add the book to.
     */
    showAddBookModal(className) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>Add Book to ${className}</h3>
            <form id="addBookForm" class="form">
                <div class="form-group">
                    <label for="bookTitle">Book Title</label>
                    <input type="text" id="bookTitle" required>
                </div>
                <div class="form-group">
                    <label for="totalPages">Total Pages</label>
                    <input type="number" id="totalPages" required>
                </div>
                <div class="form-group">
                    <label for="bookDescription">Description</label>
                    <textarea id="bookDescription" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Book</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `;

        document.getElementById('addBookForm').onsubmit = (e) => {
            e.preventDefault();
            this.addBook(className);
        };

        document.getElementById('modal').style.display = 'block';
    }

    /**
     * Handles the logic for adding a new book via an API call.
     * @param {string} className - The name of the class the book belongs to.
     */
    async addBook(className) {
        const bookTitle = document.getElementById('bookTitle').value;
        const totalPages = document.getElementById('totalPages').value;
        const description = document.getElementById('bookDescription').value;

        if (!bookTitle || !totalPages) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const response = await fetch('/api/education/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    class_name: className,
                    book_title: bookTitle,
                    total_pages: totalPages,
                    description: description
                })
            });

            if (response.ok) {
                closeModal();
                this.initialize(); // Re-initialize to show the new book
            } else {
                throw new Error('Failed to add book');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Error adding book. Please try again.');
        }
    }

    /**
     * Displays a modal for updating the progress of a book.
     * @param {number} bookId - The ID of the book to update.
     */
    showUpdateProgressModal(bookId) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>Update Book Progress</h3>
            <form id="updateProgressForm" class="form">
                <div class="form-group">
                    <label for="pagesCompleted">Pages Completed</label>
                    <input type="number" id="pagesCompleted" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Update</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `;

        document.getElementById('updateProgressForm').onsubmit = (e) => {
            e.preventDefault();
            this.updateProgress(bookId);
        };

        document.getElementById('modal').style.display = 'block';
    }

    /**
     * Handles the logic for updating book progress via an API call.
     * @param {number} bookId - The ID of the book being updated.
     */
    async updateProgress(bookId) {
        const pagesCompleted = document.getElementById('pagesCompleted').value;

        if (!pagesCompleted) {
            alert('Please enter the number of pages completed.');
            return;
        }

        try {
            const response = await fetch('/api/education/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_id: bookId,
                    pages_completed: pagesCompleted,
                    update_date: new Date().toISOString().split('T')[0]
                })
            });

            if (response.ok) {
                closeModal();
                this.initialize(); // Re-initialize to show updated progress
            } else {
                throw new Error('Failed to update progress');
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Error updating progress. Please try again.');
        }
    }

    /**
     * Handles the logic for deleting a book and its progress via an API call.
     * @param {number} bookId - The ID of the book to delete.
     */
    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book and all its progress? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/education/books/${bookId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.initialize(); // Re-initialize to remove the book from the view
            } else {
                throw new Error('Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Error deleting book. Please try again.');
        }
    }
}

// Make the educationManager instance globally accessible for the onclick handlers in the HTML
window.educationManager = new EducationManager();
