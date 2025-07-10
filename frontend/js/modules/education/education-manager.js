/**
 * Education Management Module
 * Handles all education-related operations including book and progress tracking.
 */

// This is a simplified module to be integrated into your existing structure.
// You will need to adapt it to your modular script loader.

class EducationManager {
    constructor() {
        this.books = [];
        this.progress = {};
        // Improvement: Get the class list dynamically from the main application state.
        // This assumes 'classes' is a global array defined in your main script.js
        this.classes = window.classes || [];
    }

    async initialize() {
        // This method should be called when the education section is shown.
        // Refresh the class list every time it's initialized
        this.classes = window.classes || [];
        await this.loadEducationData();
        this.renderEducationContent();
    }

    async loadEducationData() {
        try {
            const response = await fetch('/api/education/summary');
            if (!response.ok) {
                throw new Error('Failed to load education summary');
            }
            this.books = await response.json();
        } catch (error) {
            console.error('Error loading education data:', error);
            // You can add a UI error message here
        }
    }

    renderEducationContent() {
        const educationContent = document.querySelector('#education .education-content');
        if (!educationContent) return;

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
                        ${classBooks.length > 0 ? classBooks.map(book => this.renderBookCard(book)).join('') : '<p>No books added for this class yet.</p>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderBookCard(book) {
        const percentage = book.percentage_completed || 0;
        return `
            <div class="book-card">
                <h4>${book.book_title}</h4>
                <p>${book.description || 'No description'}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                </div>
                <div class="book-actions">
                    <button class="btn btn-secondary btn-small" onclick="educationManager.showUpdateProgressModal(${book.id})">
                        <i class="fas fa-edit"></i> Update Progress
                    </button>
                    <button class="btn btn-danger btn-small" onclick="educationManager.deleteBook(${book.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

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

    async addBook(className) {
        const bookTitle = document.getElementById('bookTitle').value;
        const totalPages = document.getElementById('totalPages').value;
        const description = document.getElementById('bookDescription').value;

        if (!bookTitle || !totalPages) {
            alert('Please fill in all fields.');
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

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book and all its progress?')) {
            return;
        }

        try {
            const response = await fetch(`/api/education/books/${bookId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.initialize(); // Re-initialize to remove the book
            } else {
                throw new Error('Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Error deleting book. Please try again.');
        }
    }
}

// Make it globally accessible for the onclick handlers
window.educationManager = new EducationManager();

// You'll need to call educationManager.initialize() when the education section is shown.
// This can be done in your showSection function in script.js.
// Example:
// if (sectionId === 'education') {
//     educationManager.initialize();
// }
