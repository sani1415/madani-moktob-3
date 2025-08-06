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
        showModal(t('error'), t('enterClassName'));
        return;
    }
    
    if (classes.includes(newClassName)) {
        showModal(t('error'), t('classExists'));
        return;
    }
    
    classes.push(newClassName);
    saveData();
    updateClassDropdowns();
    displayClasses();
    
    document.getElementById('newClassName').value = '';
    showModal(t('success'), `${newClassName} ${t('classAdded')}`);
}

function deleteClass(className) {
    // First confirmation
    if (confirm(`${t('confirmDeleteClass')} "${className}"? ${t('cannotUndo')}`)) {
        // Second confirmation with stronger warning
        if (confirm(`${t('confirmDeleteClassFinal')} "${className}"?\n\n${t('finalDeleteClassWarning')}`)) {
        classes = classes.filter(cls => cls !== className);
        
        // Remove students from this class
        students = students.filter(student => student.class !== className);
        
        saveData();
        updateClassDropdowns();
        displayClasses();
        updateDashboard();
        
        showModal(t('success'), `${className} ${t('classDeleted')}`);
        }
    }
}

function displayClasses() {
    const classesList = document.getElementById('classesList');
    
    if (classes.length === 0) {
        classesList.innerHTML = `<p>${t('noClassesAdded')}</p>`;
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
    
    // Update class filter options in student registration table
    updateClassFilterOptions();
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
                showModal(t('error'), t('classExists'));
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
            updateDashboard();
            
            showModal(t('success'), `Class renamed from "${oldClassName}" to "${newName}"`);
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

async function addHoliday() {
    const startDateInput = document.getElementById('holidayStartDate');
    const endDateInput = document.getElementById('holidayEndDate');
    const nameInput = document.getElementById('holidayName');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const name = nameInput.value.trim();
    
    if (!startDate || !name) {
        showModal(t('error'), 'Please enter holiday start date and name');
        return;
    }
    
    // If no end date is provided, use start date (single day holiday)
    const finalEndDate = endDate || startDate;
    
    // Validate date range
    if (new Date(startDate) > new Date(finalEndDate)) {
        showModal(t('error'), 'Start date cannot be after end date');
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
        showModal(t('error'), 'Holiday dates conflict with existing holiday: ' + conflictingHoliday.name);
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
                // Keep legacy date field for compatibility
                date: startDate
            });
            holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            
            displayHolidays();
            
            // Clear inputs
            startDateInput.value = '';
            endDateInput.value = '';
            nameInput.value = '';
            
            const dayCount = Math.ceil((new Date(finalEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
            showModal(t('success'), `Holiday added successfully (${dayCount} day${dayCount > 1 ? 's' : ''})`);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add holiday');
        }
    } catch (error) {
        console.error('Error adding holiday:', error);
        showModal(t('error'), 'Failed to add holiday: ' + error.message);
    }
}

async function deleteHoliday(index) {
    const holiday = holidays[index];
    if (!holiday) {
        showModal(t('error'), 'Holiday not found');
        return;
    }
    
    try {
        // Get the date to delete (use startDate or date field)
        const dateToDelete = holiday.startDate || holiday.date;
        
        // Call the API to delete from database
        const response = await fetch(`/api/holidays/delete/${dateToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            // Remove from local array
            holidays.splice(index, 1);
            displayHolidays();
            showModal(t('success'), 'Holiday deleted successfully');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete holiday');
        }
    } catch (error) {
        console.error('Error deleting holiday:', error);
        showModal(t('error'), 'Failed to delete holiday: ' + error.message);
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
        
        // Handle both date strings and date objects
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        // Convert to date strings for comparison (YYYY-MM-DD format)
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
        
        // Handle both date strings and date objects
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        // Convert to date strings for comparison (YYYY-MM-DD format)
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
    return holiday ? holiday.name : '';
}

let educationProgress = [];

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
    const booksList = document.getElementById('booksList');
    if (!booksList) return;
    
    if (educationProgress.length === 0) {
        booksList.innerHTML = `<p class="no-data">${t('noBooksAddedYet')}</p>`;
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
                        <i class="fas fa-edit"></i> ${t('editDetails')}
                    </button>
                    <button onclick="updateBookProgress(${book.id})" class="btn btn-primary btn-small">
                        <i class="fas fa-chart-line"></i> ${t('updateProgress')}
                    </button>
                    <button onclick="deleteBookProgress(${book.id})" class="btn btn-danger btn-small">
                        <i class="fas fa-trash"></i> ${t('deleteBook')}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function showAddBookForm() {
    document.getElementById('addBookForm').style.display = 'block';
    document.getElementById('bookProgressList').style.display = 'none';
    document.getElementById('bookForm').reset();
}

function hideAddBookForm() {
    document.getElementById('addBookForm').style.display = 'none';
    document.getElementById('bookProgressList').style.display = 'block';
}

async function addBookProgress() {
    const bookId = document.getElementById('bookName').value;
    const selectedBook = books.find(book => book.id == bookId);
    
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
    
    // Show the modal
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
    // Update main book dropdown
    const bookDropdown = document.getElementById('bookName');
    if (bookDropdown) {
        bookDropdown.innerHTML = '<option value="">Select Book</option>' + 
            books.map(book => `<option value="${book.id}">${book.book_name}</option>`).join('');
    }
    
    // Update edit book dropdown
    const editBookDropdown = document.getElementById('editBookName');
    if (editBookDropdown) {
        editBookDropdown.innerHTML = '<option value="">Select Book</option>' + 
            books.map(book => `<option value="${book.id}">${book.book_name}</option>`).join('');
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

function saveAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const startDate = academicYearStartInput.value;
    
    if (!startDate) {
        showModal(t('error'), t('selectAcademicYearStart'));
        return;
    }
    
    // Update the global academic year start date
    window.academicYearStartDate = startDate;
    localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
    
    // Update calendar restrictions
    updateDateRestrictions();
    
    showModal(t('success'), t('academicYearStartUpdated'));
    
    // Clear the input
    academicYearStartInput.value = '';
    
    // Update display
    displayAcademicYearStart();
}

function clearAcademicYearStart() {
    if (confirm(t('confirmClearAcademicYearStart'))) {
        window.academicYearStartDate = null;
        localStorage.removeItem('madaniMaktabAcademicYearStart');
        
        // Clear date restrictions
        clearDateRestrictions();
        
        // Update display
        displayAcademicYearStart();
        
        showModal(t('success'), t('academicYearStartCleared'));
    }
}

function displayAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const displaySpan = document.getElementById('academicYearStartDisplay');
    
    if (window.academicYearStartDate) {
        // Set the input value
        if (academicYearStartInput) {
            academicYearStartInput.value = window.academicYearStartDate;
        }
        
        // Update display span
        if (displaySpan) {
            displaySpan.textContent = formatDate(window.academicYearStartDate);
        }
    } else {
        // Clear the input
        if (academicYearStartInput) {
            academicYearStartInput.value = '';
        }
        
        // Clear display span
        if (displaySpan) {
            displaySpan.textContent = 'Not set';
        }
    }
}

function updateDateRestrictions() {
    if (!window.academicYearStartDate) {
        return;
    }
    
    console.log('Updating date restrictions from academic year start:', window.academicYearStartDate);
    
    // Update attendance date input
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.min = window.academicYearStartDate;
        if (dateInput.value && dateInput.value < window.academicYearStartDate) {
            dateInput.value = window.academicYearStartDate;
        }
        console.log(`Set minimum date for attendanceDate to ${window.academicYearStartDate}`);
    }
    
    // Update holiday date inputs
    const holidayDateInput = document.getElementById('holidayDate');
    if (holidayDateInput) {
        holidayDateInput.min = window.academicYearStartDate;
        if (holidayDateInput.value && holidayDateInput.value < window.academicYearStartDate) {
            holidayDateInput.value = window.academicYearStartDate;
        }
    }
    
    // Update academic year start input
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    if (academicYearStartInput) {
        academicYearStartInput.min = window.academicYearStartDate;
        academicYearStartInput.value = window.academicYearStartDate;
    }
}

function clearDateRestrictions() {
    // Remove minimum date restrictions
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.min = '';
    }
    
    const holidayDateInput = document.getElementById('holidayDate');
    if (holidayDateInput) {
        holidayDateInput.min = '';
    }
    
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    if (academicYearStartInput) {
        academicYearStartInput.min = '';
    }
}

function saveAppName() {
    const appNameInput = document.getElementById('appNameInput');
    const newAppName = appNameInput.value.trim();
    
    if (!newAppName) {
        showModal(t('error'), t('enterAppName'));
        return;
    }
    
    localStorage.setItem('madaniMaktabAppName', newAppName);
    document.title = newAppName;
    
    // Update app name display
    const appNameDisplay = document.getElementById('appNameDisplay');
    if (appNameDisplay) {
        appNameDisplay.textContent = newAppName;
    }
    
    showModal(t('success'), t('appNameUpdated'));
    appNameInput.value = '';
}

document.addEventListener('DOMContentLoaded', function() {
    // Load books when page loads
    loadBooks();
    
    // Add event listener for book management form submission
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
    
    // Add event listener for class selection change in education form
    const bookClassSelect = document.getElementById('bookClass');
    if (bookClassSelect) {
        bookClassSelect.addEventListener('change', function() {
            const classId = getClassIdByName(this.value);
            updateBookDropdownForClass(classId);
        });
    }
});

export { educationProgress, books, updateClassDropdowns, addClass, deleteClass, displayClasses, editClass, addHoliday, deleteHoliday, displayHolidays, isHoliday, getHolidayName, displayBooksList, showAddBookForm, hideAddBookForm, filterBooksByClass, editBookDetails, closeEditBookModal, showDeleteAllEducationModal, closeBookManagementEditModal, displayBooks, getClassNameById, getClassIdByName, addBook, editBook, deleteBook, updateBookDropdowns, saveAcademicYearStart, clearAcademicYearStart, displayAcademicYearStart, updateDateRestrictions, clearDateRestrictions, saveAppName }
