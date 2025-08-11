// Global variables for education progress and books
let educationProgress = [];
let books = [];
let classes = [];
let students = [];
let holidays = [];

// Class management functions
function updateClassDropdowns() {
    const dropdowns = ['studentClass', 'classFilter', 'reportClass'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Save current value
            const currentValue = dropdown.value;
            
            // Clear existing options (except first option for some dropdowns)
            if (dropdownId === 'studentClass') {
                dropdown.innerHTML = '<option value="">Select Class</option>';
            } else {
                dropdown.innerHTML = '<option value="">All Classes</option>';
            }
            
            // Add class options
            classes.forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                dropdown.appendChild(option);
            });
            
            // Restore previous value if it still exists
            if (currentValue && classes.includes(currentValue)) {
                dropdown.value = currentValue;
            }
        }
    });
}

function addClass() {
    const newClassName = document.getElementById('newClassName').value.trim();
    
    if (!newClassName) {
        showModal('Error', 'Please enter a class name');
        return;
    }
    
    if (classes.includes(newClassName)) {
        showModal('Error', 'Class already exists');
        return;
    }
    
    classes.push(newClassName);
    saveData();
    updateClassDropdowns();
    displayClasses();
    
    document.getElementById('newClassName').value = '';
    showModal('Success', `${newClassName} class added successfully`);
}

function deleteClass(className) {
    if (confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
        classes = classes.filter(cls => cls !== className);
        
        // Remove students from this class
        students = students.filter(student => student.class !== className);
        
        saveData();
        updateClassDropdowns();
        displayClasses();
        
        showModal('Success', `${className} class deleted successfully`);
    }
}

function displayClasses() {
    const classesList = document.getElementById('classesList');
    
    if (classes.length === 0) {
        classesList.innerHTML = '<p>No classes added yet</p>';
        return;
    }
    
    classesList.innerHTML = classes.map(className => `
        <div class="class-item">
            <span class="class-name" id="className-${className.replace(/\s+/g, '')}">${className}</span>
            <div class="class-actions">
                <button onclick="editClass('${className}')" class="btn btn-secondary btn-small" title="Edit Class">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteClass('${className}')" class="btn btn-danger btn-small" title="Delete Class">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function editClass(oldClassName) {
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
            if (classes.includes(newName)) {
                showModal('Error', 'Class already exists');
                return;
            }
            
            // Update class name
            const classIndex = classes.indexOf(oldClassName);
            if (classIndex !== -1) {
                classes[classIndex] = newName;
            }
            
            // Update students' class names
            students.forEach(student => {
                if (student.class === oldClassName) {
                    student.class = newName;
                }
            });
            
            saveData();
            updateClassDropdowns();
            displayClasses();
            
            showModal('Success', `Class renamed from "${oldClassName}" to "${newName}"`);
        } else {
            // Cancel edit
            displayClasses();
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            displayClasses();
        }
    });
}

// Holiday management functions
async function addHoliday() {
    const startDateInput = document.getElementById('holidayStartDate');
    const endDateInput = document.getElementById('holidayEndDate');
    const nameInput = document.getElementById('holidayName');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const name = nameInput.value.trim();
    
    if (!startDate || !name) {
        showModal('Error', 'Please enter holiday start date and name');
        return;
    }
    
    // If no end date is provided, use start date (single day holiday)
    const finalEndDate = endDate || startDate;
    
    // Validate date range
    if (new Date(startDate) > new Date(finalEndDate)) {
        showModal('Error', 'Start date cannot be after end date');
        return;
    }
    
    // Check if any date in the range conflicts with existing holidays
    const conflictingHoliday = holidays.find(h => {
        const existingStart = new Date(h.startDate);
        const existingEnd = new Date(h.endDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(finalEndDate);
        
        return (newStart <= existingEnd && newEnd >= existingStart);
    });
    
    if (conflictingHoliday) {
        showModal('Error', 'Holiday dates conflict with existing holiday: ' + conflictingHoliday.name);
        return;
    }
    
    // Save to database via API
    try {
        const response = await fetch('/api/holidays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: startDate,
                name: name,
                startDate: startDate,
                endDate: finalEndDate
            })
        });
        
        if (response.ok) {
            // Add to local array
            holidays.push({ 
                startDate, 
                endDate: finalEndDate, 
                name,
                date: startDate
            });
            holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            
            displayHolidays();
            
            // Clear inputs
            startDateInput.value = '';
            endDateInput.value = '';
            nameInput.value = '';
            
            const dayCount = Math.ceil((new Date(finalEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
            showModal('Success', `Holiday added successfully (${dayCount} day${dayCount > 1 ? 's' : ''})`);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add holiday');
        }
    } catch (error) {
        console.error('Error adding holiday:', error);
        showModal('Error', 'Failed to add holiday: ' + error.message);
    }
}

async function deleteHoliday(index) {
    const holiday = holidays[index];
    if (!holiday) {
        showModal('Error', 'Holiday not found');
        return;
    }
    
    try {
        const dateToDelete = holiday.startDate || holiday.date;
        
        const response = await fetch(`/api/holidays/delete/${dateToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            holidays.splice(index, 1);
            displayHolidays();
            showModal('Success', 'Holiday deleted successfully');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete holiday');
        }
    } catch (error) {
        console.error('Error deleting holiday:', error);
        showModal('Error', 'Failed to delete holiday: ' + error.message);
    }
}

function displayHolidays() {
    const holidaysList = document.getElementById('holidaysList');
    if (!holidaysList) return;
    
    if (holidays.length === 0) {
        holidaysList.innerHTML = '<p>No holidays configured.</p>';
        return;
    }
    
    holidaysList.innerHTML = holidays.map((holiday, index) => {
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
                <button onclick="deleteHoliday(${index})" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function isHoliday(date) {
    if (!holidays || holidays.length === 0) return false;
    
    return holidays.some(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
}

function getHolidayName(date) {
    if (!holidays || holidays.length === 0) return '';
    
    const holiday = holidays.find(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
    return holiday ? holiday.name : '';
}

// Education progress functions
async function loadEducationProgress() {
    try {
        console.log('🔄 Loading education progress...');
        const response = await fetch('/api/education');
        console.log('📡 Education API response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Education data received:', data);
            console.log('📊 Education data length:', data.length);
            
            educationProgress = data;
            console.log('💾 educationProgress array updated:', educationProgress);
            console.log('💾 educationProgress length:', educationProgress.length);
            
            console.log('🔄 Calling displayBooksList...');
            displayBooksList();
            console.log('✅ displayBooksList completed');
        } else {
            console.error('❌ Failed to load education progress, status:', response.status);
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
        }
    } catch (error) {
        console.error('❌ Error loading education progress:', error);
    }
}

function displayBooksList() {
    const booksList = document.getElementById('booksList');
    if (!booksList) return;
    
    if (educationProgress.length === 0) {
        booksList.innerHTML = '<p class="no-data">No books added yet</p>';
        return;
    }
    
    booksList.innerHTML = educationProgress.map(book => {
        const progressPercentage = Math.round((book.completed_pages / book.total_pages) * 100);
        const remainingPages = book.total_pages - book.completed_pages;
        
        return `
            <div class="book-card" data-id="${book.id}">
                <div class="book-header">
                    <h4>${book.book_name}</h4>
                    <span class="book-class">${book.class_name}</span>
                </div>
                <div class="book-subject">${book.subject_name}</div>
                <div class="book-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-text">
                        ${book.completed_pages} / ${book.total_pages} pages (${progressPercentage}%)
                    </div>
                </div>
                <div class="book-stats">
                    <div class="stat">
                        <span class="label">Completed:</span>
                        <span class="value">${book.completed_pages} pages</span>
                    </div>
                    <div class="stat">
                        <span class="label">Remaining:</span>
                        <span class="value">${remainingPages} pages</span>
                    </div>
                </div>
                ${book.notes ? `<div class="book-notes">${book.notes}</div>` : ''}
                <div class="book-actions">
                    <button onclick="editBookDetails(${book.id})" class="btn btn-secondary btn-small">
                        <i class="fas fa-edit"></i> Edit Details
                    </button>
                    <button onclick="updateBookProgress(${book.id})" class="btn btn-primary btn-small">
                        <i class="fas fa-chart-line"></i> Update Progress
                    </button>
                    <button onclick="deleteBookProgress(${book.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i> Delete Book
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function showAddBookForm() {
    await loadBooks();
    
    document.getElementById('addBookForm').style.display = 'block';
    document.getElementById('bookProgressList').style.display = 'none';
    document.getElementById('bookForm').reset();
    
    updateBookDropdowns();
}

function hideAddBookForm() {
    document.getElementById('addBookForm').style.display = 'none';
    document.getElementById('bookProgressList').style.display = 'block';
}

async function addBookProgress() {
    console.log('addBookProgress called');
    console.log('books array:', books);
    console.log('books length:', books.length);
    
    const bookId = document.getElementById('bookName').value;
    console.log('selected bookId:', bookId);
    
    const selectedBook = books.find(book => book.id == bookId);
    console.log('selectedBook:', selectedBook);
    
    if (!selectedBook) {
        showModal('Error', 'Please select a book from the dropdown.');
        return;
    }
    
    const formData = {
        class_name: document.getElementById('bookClass').value,
        subject_name: document.getElementById('bookSubject').value,
        book_id: parseInt(bookId),
        book_name: selectedBook.book_name,
        total_pages: parseInt(document.getElementById('totalPages').value),
        completed_pages: parseInt(document.getElementById('completedPages').value) || 0,
        notes: document.getElementById('bookNotes').value
    };
    
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
    
    if (newCompletedPages === null) return;
    
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
    
    if (!confirm(`Are you sure you want to delete "${book.book_name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/education/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showModal('Success', 'Book deleted successfully');
            await loadEducationProgress();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to delete book');
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

function editBookDetails(bookId) {
    const book = educationProgress.find(b => b.id === bookId);
    if (!book) {
        showModal('Error', 'Book not found');
        return;
    }
    
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookClass').value = book.class_name;
    document.getElementById('editBookSubject').value = book.subject_name;
    document.getElementById('editBookName').value = book.book_id || '';
    document.getElementById('editTotalPages').value = book.total_pages;
    document.getElementById('editCompletedPages').value = book.completed_pages;
    document.getElementById('editBookNotes').value = book.notes || '';
    
    document.getElementById('editBookModal').style.display = 'block';
}

function closeEditBookModal() {
    document.getElementById('editBookModal').style.display = 'none';
    document.getElementById('bookForm').reset();
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

function showDeleteAllEducationModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>⚠️ Delete All Education Data</h3>
            </div>
            <div class="modal-body">
                <p><strong>Warning:</strong> This will permanently delete:</p>
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
                    <i class="fas fa-trash-alt"></i> Yes, Delete All Data
                </button>
                <button onclick="closeModal()" class="btn btn-secondary">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal('Delete All Education Data', modalContent, true);
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

// Book management functions
async function loadBooks() {
    try {
        console.log('Loading books...');
        console.log('Current books array before loading:', books);
        const response = await fetch('/api/books');
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const booksData = await response.json();
            console.log('Books data received:', booksData);
            books = booksData;
            console.log('Books array after assignment:', books);
            console.log('Books array length:', books.length);
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
            updateBookDropdowns();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to add book');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showModal('Error', 'Failed to add book');
    }
}

async function editBook(bookId) {
    console.log('Edit book called with ID:', bookId);
    const book = books.find(b => b.id === bookId);
    if (!book) {
        console.error('Book not found with ID:', bookId);
        return;
    }
    
    console.log('Found book:', book);
    
    const editBookId = document.getElementById('bookManagementEditId');
    const editBookName = document.getElementById('bookManagementEditName');
    const editBookClass = document.getElementById('bookManagementEditClass');
    const editBookModal = document.getElementById('bookManagementEditModal');
    
    if (!editBookId || !editBookName || !editBookClass || !editBookModal) {
        console.error('Edit modal elements not found');
        return;
    }
    
    editBookId.value = book.id;
    editBookName.value = book.book_name;
    editBookClass.value = book.class_id || '';
    
    console.log('Populated form with:', {
        id: editBookId.value,
        name: editBookName.value,
        class: editBookClass.value
    });
    
    editBookModal.style.display = 'block';
    console.log('Modal should be visible now');
}

function closeBookManagementEditModal() {
    document.getElementById('bookManagementEditModal').style.display = 'none';
    document.getElementById('bookManagementEditForm').reset();
}

async function updateBook() {
    console.log('Update book function called');
    
    const bookId = document.getElementById('bookManagementEditId').value;
    const bookName = document.getElementById('bookManagementEditName').value.trim();
    const classId = document.getElementById('bookManagementEditClass').value || null;
    
    console.log('Form values:', { bookId, bookName, classId });
    
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
            updateBookDropdowns();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to update book');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        showModal('Error', 'Failed to update book');
    }
}

async function deleteBook(bookId) {
    const confirmed = confirm('Are you sure you want to delete this book? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showModal('Success', 'Book deleted successfully');
            await loadBooks();
            updateBookDropdowns();
        } else {
            const error = await response.json();
            showModal('Error', error.error || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        showModal('Error', 'Failed to delete book');
    }
}

function updateBookDropdowns() {
    console.log('updateBookDropdowns called');
    console.log('books array in updateBookDropdowns:', books);
    console.log('books length in updateBookDropdowns:', books.length);
    
    const bookDropdown = document.getElementById('bookName');
    if (bookDropdown) {
        console.log('bookName dropdown found');
        const options = '<option value="">Select Book</option>' + 
            books.map(book => `<option value="${book.id}">${book.book_name}</option>`).join('');
        console.log('Generated options:', options);
        bookDropdown.innerHTML = options;
        console.log('Dropdown updated with options');
    } else {
        console.error('bookName dropdown not found');
    }
    
    const editBookDropdown = document.getElementById('editBookName');
    if (editBookDropdown) {
        console.log('editBookName dropdown found');
        editBookDropdown.innerHTML = '<option value="">Select Book</option>' + 
            books.map(book => `<option value="${book.id}">${book.book_name}</option>`).join('');
    } else {
        console.error('editBookName dropdown not found');
    }
}

async function loadBooksForClass(classId) {
    try {
        const url = classId ? `/api/books/class/${classId}` : '/api/books';
        const response = await fetch(url);
        if (response.ok) {
            const classBooks = await response.json();
            return classBooks;
        }
        return [];
    } catch (error) {
        console.error('Error loading books for class:', error);
        return [];
    }
}

async function updateBookDropdownForClass(classId) {
    const bookDropdown = document.getElementById('bookName');
    if (!bookDropdown) return;
    
    const classBooks = await loadBooksForClass(classId);
    bookDropdown.innerHTML = '<option value="">Select Book</option>' + 
        classBooks.map(book => `<option value="${book.id}">${book.book_name}</option>`).join('');
}

// Academic year functions
function saveAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const startDate = academicYearStartInput.value;
    
    if (!startDate) {
        showModal('Error', 'Please select an academic year start date');
        return;
    }
    
    window.academicYearStartDate = startDate;
    localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
    
    updateDateRestrictions();
    
    showModal('Success', 'Academic year start date updated successfully');
    
    academicYearStartInput.value = '';
    displayAcademicYearStart();
}

function clearAcademicYearStart() {
    if (confirm('Are you sure you want to clear the academic year start date?')) {
        window.academicYearStartDate = null;
        localStorage.removeItem('madaniMaktabAcademicYearStart');
        
        clearDateRestrictions();
        displayAcademicYearStart();
        
        showModal('Success', 'Academic year start date cleared successfully');
    }
}

function initializeAcademicYearStart() {
    const savedStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
    if (savedStartDate) {
        window.academicYearStartDate = savedStartDate;
        console.log('Loaded academic year start date:', window.academicYearStartDate);
        
        updateDateRestrictions();
        displayAcademicYearStart();
    }
}

function displayAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const displaySpan = document.getElementById('academicYearStartDisplay');
    const displayContainer = document.getElementById('currentAcademicYearDisplay');
    
    if (window.academicYearStartDate) {
        if (academicYearStartInput) {
            academicYearStartInput.value = window.academicYearStartDate;
        }
        
        if (displaySpan) {
            displaySpan.textContent = window.academicYearStartDate;
        }
        
        if (displayContainer) {
            displayContainer.style.display = 'block';
        }
    } else {
        if (academicYearStartInput) {
            academicYearStartInput.value = '';
        }
        
        if (displaySpan) {
            displaySpan.textContent = 'Not set';
        }
        
        if (displayContainer) {
            displayContainer.style.display = 'none';
        }
    }
}

function updateDateRestrictions() {
    if (!window.academicYearStartDate) {
        clearDateRestrictions();
        return;
    }
    
    console.log('Updating date restrictions from academic year start:', window.academicYearStartDate);
    
    const dateInputIds = [
        'reportStartDate',
        'reportEndDate',
        'attendanceDate',
        'holidayStartDate',
        'holidayEndDate'
    ];
    
    dateInputIds.forEach(inputId => {
        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            dateInput.min = window.academicYearStartDate;
            
            if (dateInput.value && dateInput.value < window.academicYearStartDate) {
                dateInput.value = '';
                console.log(`Cleared ${inputId} as it was before academic year start`);
            }
            
            console.log(`Set minimum date for ${inputId} to ${window.academicYearStartDate}`);
        }
    });
    
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    if (academicYearStartInput) {
        academicYearStartInput.value = window.academicYearStartDate;
    }
}

function clearDateRestrictions() {
    const dateInputIds = [
        'reportStartDate',
        'reportEndDate',
        'attendanceDate',
        'holidayStartDate',
        'holidayEndDate'
    ];
    
    dateInputIds.forEach(inputId => {
        const dateInput = document.getElementById(inputId);
        if (dateInput) {
            dateInput.min = '';
            console.log(`Cleared minimum date restriction for ${inputId}`);
        }
    });
    
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    if (academicYearStartInput) {
        academicYearStartInput.value = '';
    }
}

// App name functions
function saveAppName() {
    const appNameInput = document.getElementById('appNameInput');
    const newAppName = appNameInput.value.trim();
    
    if (!newAppName) {
        showModal('Error', 'Please enter an app name');
        return;
    }
    
    localStorage.setItem('madaniMaktabAppName', newAppName);
    document.title = newAppName;
    
    const appNameDisplay = document.getElementById('appNameDisplay');
    if (appNameDisplay) {
        appNameDisplay.textContent = newAppName;
    }
    
    showModal('Success', 'App name updated successfully');
    appNameInput.value = '';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    if (typeof loadBooks === 'function') {
        loadBooks();
    }
    
    const bookManagementEditForm = document.getElementById('bookManagementEditForm');
    if (bookManagementEditForm) {
        console.log('Book management edit form found, adding event listener');
        bookManagementEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Book management edit form submitted');
            updateBook();
        });
    } else {
        console.error('Book management edit form not found');
    }
    
    const bookClassSelect = document.getElementById('bookClass');
    if (bookClassSelect) {
        bookClassSelect.addEventListener('change', function() {
            const classId = getClassIdByName(this.value);
            updateBookDropdownForClass(classId);
        });
    }
    
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        console.log('Book form found, adding event listener');
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Book form submitted');
            console.log('Form data:', {
                bookClass: document.getElementById('bookClass').value,
                bookSubject: document.getElementById('bookSubject').value,
                bookName: document.getElementById('bookName').value,
                totalPages: document.getElementById('totalPages').value,
                completedPages: document.getElementById('completedPages').value,
                bookNotes: document.getElementById('bookNotes').value
            });
            addBookProgress();
        });
    } else {
        console.error('Book form not found');
    }
    
    const showAddBookFormBtn = document.getElementById('showAddBookFormBtn');
    if (showAddBookFormBtn) {
        console.log('Show add book form button found, adding event listener');
        showAddBookFormBtn.addEventListener('click', async function() {
            await showAddBookForm();
        });
    } else {
        console.error('Show add book form button not found');
    }
});

// Export all functions
export { 
    educationProgress, 
    books, 
    updateClassDropdowns, 
    addClass, 
    deleteClass, 
    displayClasses, 
    editClass, 
    addHoliday, 
    deleteHoliday, 
    displayHolidays, 
    isHoliday, 
    getHolidayName, 
    displayBooksList, 
    showAddBookForm, 
    hideAddBookForm, 
    filterBooksByClass, 
    editBookDetails, 
    closeEditBookModal, 
    showDeleteAllEducationModal, 
    deleteAllEducationData, 
    closeBookManagementEditModal, 
    displayBooks, 
    getClassNameById, 
    getClassIdByName, 
    addBook, 
    editBook, 
    deleteBook, 
    updateBookDropdowns, 
    addBookProgress, 
    updateBookProgress, 
    deleteBookProgress, 
    initializeAcademicYearStart, 
    saveAcademicYearStart, 
    clearAcademicYearStart, 
    displayAcademicYearStart, 
    updateDateRestrictions, 
    clearDateRestrictions, 
    saveAppName,
    loadBooks,
    loadEducationProgress
}
