// ===== BOOK FUNCTIONS =====
// Consolidated book management and education progress functions

// Book management functions
let books = []; // Global books array

async function loadBooks() {
    try {
        console.log('Loading books...');
        const response = await fetch('/api/books');
        console.log('Response status:', response.status);
        
        if (response.ok) {
            books = await response.json();
            console.log('Books loaded:', books);
            displayBooks();
            updateBookDropdowns();
        } else {
            console.error('Failed to load books, status:', response.status);
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function displayBooks() {
    // Display books in settings section
    const settingsBooksList = document.getElementById('settingsBooksList');
    if (settingsBooksList) {
        console.log('Displaying books in settings:', books);
        console.log('Books count:', books.length);
        
        if (books.length === 0) {
            settingsBooksList.innerHTML = '<p class="no-data">No books added yet. Add your first book above.</p>';
        } else {
            settingsBooksList.innerHTML = books.map(book => `
                <div class="book-item" data-book-id="${book.id}">
                    <div class="book-info">
                        <h4>${book.book_name}</h4>
                        <p class="book-class">${book.class_id ? getClassNameById(book.class_id) : 'All Classes'}</p>
                    </div>
                    <div class="book-actions">
                        <button onclick="editBook(${book.id})" class="btn btn-secondary btn-small">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteBook(${book.id})" class="btn btn-danger btn-small">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } else {
        console.error('settingsBooksList element not found');
    }
}

function getClassNameById(classId) {
    const classMap = {
        1: 'প্রথম শ্রেণি',
        2: 'দ্বিতীয় শ্রেণি',
        3: 'তৃতীয় শ্রেণি',
        4: 'চতুর্থ শ্রেণি',
        5: 'পঞ্চম শ্রেণি'
    };
    return classMap[classId] || 'Unknown Class';
}

function getClassIdByName(className) {
    const classMap = {
        'প্রথম শ্রেণি': 1,
        'দ্বিতীয় শ্রেণি': 2,
        'তৃতীয় শ্রেণি': 3,
        'চতুর্থ শ্রেণি': 4,
        'পঞ্চম শ্রেণি': 5
    };
    return classMap[className] || null;
}

async function addBook() {
    const bookName = document.getElementById('newBookName').value.trim();
    const classId = document.getElementById('newBookClass').value || null;
    
    if (!bookName) {
        showModal('Error', 'Please enter a book name');
        return;
    }
    
    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                book_name: bookName,
                class_id: classId
            })
        });
        
        if (response.ok) {
            showModal('Success', 'Book added successfully');
            document.getElementById('newBookName').value = '';
            document.getElementById('newBookClass').value = '';
            await loadBooks();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to add book');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

async function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) {
        showModal('Error', 'Book not found');
        return;
    }
    
    // Populate the edit form
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookName').value = book.book_name;
    document.getElementById('editBookClass').value = book.class_id || '';
    
    // Show the edit modal
    document.getElementById('bookManagementEditModal').style.display = 'block';
}

function closeBookManagementEditModal() {
    document.getElementById('bookManagementEditModal').style.display = 'none';
    document.getElementById('bookManagementEditForm').reset();
}

async function updateBook() {
    const bookId = document.getElementById('editBookId').value;
    const bookName = document.getElementById('editBookName').value.trim();
    const classId = document.getElementById('editBookClass').value || null;
    
    if (!bookName) {
        showModal('Error', 'Please enter a book name');
        return;
    }
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                book_name: bookName,
                class_id: classId
            })
        });
        
        if (response.ok) {
            showModal('Success', 'Book updated successfully');
            closeBookManagementEditModal();
            await loadBooks();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to update book');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

async function deleteBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) {
        showModal('Error', 'Book not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete "${book.book_name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showModal('Success', 'Book deleted successfully');
            await loadBooks();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

function updateBookDropdowns() {
    // Update book dropdowns in various forms
    const bookDropdowns = document.querySelectorAll('select[id*="book"]');
    bookDropdowns.forEach(dropdown => {
        const currentValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Select a book</option>';
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.book_name;
            dropdown.appendChild(option);
        });
        dropdown.value = currentValue;
    });
}

async function updateBookDropdownForClass(classId) {
    // Update book dropdown based on selected class
    const bookDropdown = document.getElementById('bookName');
    if (!bookDropdown) return;
    
    const currentValue = bookDropdown.value;
    bookDropdown.innerHTML = '<option value="">Select a book</option>';
    
    // Filter books by class
    const classBooks = books.filter(book => !book.class_id || book.class_id == classId);
    classBooks.forEach(book => {
        const option = document.createElement('option');
        option.value = book.id;
        option.textContent = book.book_name;
        bookDropdown.appendChild(option);
    });
    
    bookDropdown.value = currentValue;
}

// Education progress functions
window.educationProgress = [];

async function loadEducationProgress() {
    try {
        const response = await fetch('/api/education');
        if (response.ok) {
            educationProgress = await response.json();
            displayBooksList();
        } else {
            console.error('Failed to load education progress');
        }
    } catch (error) {
        console.error('Error loading education progress:', error);
    }
}

function displayBooksList() {
    const booksListContainer = document.getElementById('booksListContainer');
    if (!booksListContainer) return;
    
    if (educationProgress.length === 0) {
        booksListContainer.innerHTML = '<p class="no-data">No book progress records found. Add your first book progress above.</p>';
        return;
    }
    
    booksListContainer.innerHTML = educationProgress.map(book => `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-header">
                <h4>${book.book_name}</h4>
                <span class="book-class">${book.class_name}</span>
            </div>
            <div class="book-subject">${book.subject_name}</div>
            <div class="book-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(book.completed_pages / book.total_pages) * 100}%"></div>
                </div>
                <span class="progress-text">${book.completed_pages} / ${book.total_pages} pages</span>
            </div>
            <div class="book-actions">
                <button onclick="updateBookProgress(${book.id})" class="btn btn-primary btn-small">
                    <i class="fas fa-edit"></i> Update Progress
                </button>
                <button onclick="editBookDetails(${book.id})" class="btn btn-secondary btn-small">
                    <i class="fas fa-cog"></i> Edit Details
                </button>
                <button onclick="deleteBookProgress(${book.id})" class="btn btn-danger btn-small">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function showAddBookForm() {
    document.getElementById('addBookForm').style.display = 'block';
    document.getElementById('booksListContainer').style.display = 'none';
}

function hideAddBookForm() {
    document.getElementById('addBookForm').style.display = 'none';
    document.getElementById('booksListContainer').style.display = 'block';
}

async function addBookProgress() {
    const formData = {
        class_name: document.getElementById('bookClass').value,
        subject_name: document.getElementById('bookSubject').value,
        book_id: parseInt(document.getElementById('bookName').value),
        book_name: books.find(b => b.id == document.getElementById('bookName').value)?.book_name || '',
        total_pages: parseInt(document.getElementById('totalPages').value),
        completed_pages: parseInt(document.getElementById('completedPages').value) || 0,
        notes: document.getElementById('bookNotes').value
    };
    
    // Validation
    if (!formData.class_name || !formData.subject_name || !formData.book_id || !formData.total_pages) {
        showModal('Error', 'Please fill in all required fields.');
        return;
    }
    
    if (formData.completed_pages > formData.total_pages) {
        showModal('Error', 'Completed pages cannot be more than total pages.');
        return;
    }
    
    try {
        const response = await fetch('/api/education', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showModal('Success', 'Book progress added successfully!');
            hideAddBookForm();
            await loadEducationProgress();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to add book progress');
        }
    } catch (error) {
        console.error('Error adding book progress:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

async function updateBookProgress(bookId) {
    const book = educationProgress.find(b => b.id === bookId);
    if (!book) return;
    
    const newCompletedPages = prompt(`Enter completed pages for "${book.book_name}" (0-${book.total_pages}):`, book.completed_pages);
    
    if (newCompletedPages === null) return; // User cancelled
    
    const completedPages = parseInt(newCompletedPages);
    if (isNaN(completedPages) || completedPages < 0 || completedPages > book.total_pages) {
        showModal('Error', 'Please enter a valid number between 0 and ' + book.total_pages);
        return;
    }
    
    const notes = prompt('Add any notes about this progress update (optional):', book.notes || '');
    
    try {
        const response = await fetch(`/api/education/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed_pages: completedPages,
                notes: notes
            })
        });
        
        if (response.ok) {
            showModal('Success', 'Book progress updated successfully!');
            await loadEducationProgress();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to update book progress');
        }
    } catch (error) {
        console.error('Error updating book progress:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

async function deleteBookProgress(bookId) {
    const book = educationProgress.find(b => b.id === bookId);
    if (!book) return;
    
    if (!confirm(`${t('confirmDeleteBook')} "${book.book_name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/education/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showModal(t('success'), t('bookDeletedSuccessfully'));
            await loadEducationProgress();
        } else {
            const error = await response.json();
            showModal(t('error'), error.error || t('failedToDeleteBook'));
        }
    } catch (error) {
        console.error('Error deleting book progress:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

function filterBooksByClass() {
    const selectedClass = document.getElementById('classFilter').value;
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        const bookClass = card.querySelector('.book-class').textContent;
        if (!selectedClass || bookClass === selectedClass) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Book details editing functions
function editBookDetails(bookId) {
    const book = educationProgress.find(b => b.id === bookId);
    if (!book) {
        showModal('Error', 'Book not found');
        return;
    }
    
    // Populate the edit form
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookClass').value = book.class_name;
    document.getElementById('editBookSubject').value = book.subject_name;
    document.getElementById('editBookName').value = book.book_id || '';
    document.getElementById('editTotalPages').value = book.total_pages;
    document.getElementById('editCompletedPages').value = book.completed_pages;
    document.getElementById('editBookNotes').value = book.notes || '';
    
    // Show the edit modal
    document.getElementById('editBookModal').style.display = 'block';
}

function closeEditBookModal() {
    document.getElementById('editBookModal').style.display = 'none';
    document.getElementById('editBookForm').reset();
}

async function updateBookDetails() {
    const progressId = document.getElementById('editBookId').value;
    const bookId = document.getElementById('editBookName').value;
    const selectedBook = books.find(book => book.id == bookId);
    
    if (!selectedBook) {
        showModal('Error', 'Please select a book from the dropdown.');
        return;
    }
    
    const formData = {
        class_name: document.getElementById('editBookClass').value,
        subject_name: document.getElementById('editBookSubject').value,
        book_id: parseInt(bookId),
        book_name: selectedBook.book_name,
        total_pages: parseInt(document.getElementById('editTotalPages').value),
        completed_pages: parseInt(document.getElementById('editCompletedPages').value) || 0,
        notes: document.getElementById('editBookNotes').value
    };
    
    // Validation
    if (!formData.class_name || !formData.subject_name || !formData.book_id || !formData.total_pages) {
        showModal('Error', 'Please fill in all required fields.');
        return;
    }
    
    if (formData.completed_pages > formData.total_pages) {
        showModal('Error', 'Completed pages cannot be more than total pages.');
        return;
    }
    
    try {
        const response = await fetch(`/api/education/${progressId}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showModal('Success', 'Book details updated successfully!');
            closeEditBookModal();
            await loadEducationProgress();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to update book details');
        }
    } catch (error) {
        console.error('Error updating book details:', error);
        showModal('Error', 'Network error. Please try again.');
    }
}

// Delete all education data functions
function showDeleteAllEducationModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚠️ ${t('deleteAllEducationData')}</h3>
            </div>
            <div class="modal-body">
                <p><strong>Warning:</strong> ${t('deleteAllEducationWarning')}</p>
                <ul>
                    <li>All book progress records</li>
                    <li>All class and subject information</li>
                    <li>All completion statistics</li>
                    <li>All notes and comments</li>
                </ul>
                <p><strong>This action cannot be undone!</strong></p>
                <p>Are you sure you want to proceed?</p>
            </div>
            <div class="modal-footer">
                <button onclick="deleteAllEducationData()" class="btn btn-danger">
                    <i class="fas fa-trash-alt"></i> ${t('yesDeleteAllData')}
                </button>
                <button onclick="closeModal()" class="btn btn-secondary">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal(t('deleteAllEducationData'), modalContent, true);
}

async function deleteAllEducationData() {
    try {
        const confirmed = confirm('Are you sure you want to delete all education progress data? This action cannot be undone.');
        if (!confirmed) return;
        
        const response = await fetch('/api/education/all', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showModal('Success', 'All education progress data deleted successfully');
            await loadEducationProgress();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to delete education data');
        }
    } catch (error) {
        console.error('Error deleting education data:', error);
        showModal('Error', 'Failed to delete education data');
    }
}

// Export all book-related functions
export {
    // Book management functions
    loadBooks,
    addBook,
    editBook,
    deleteBook,
    updateBook,
    closeBookManagementEditModal,
    updateBookDropdownForClass,
    
    // Education progress functions
    loadEducationProgress,
    updateBookProgress,
    deleteBookProgress,
    addBookProgress,
    showAddBookForm,
    hideAddBookForm,
    filterBooksByClass,
    
    // Book details functions
    editBookDetails,
    closeEditBookModal,
    updateBookDetails,
    
    // Delete all education data functions
    showDeleteAllEducationModal,
    deleteAllEducationData
}; 