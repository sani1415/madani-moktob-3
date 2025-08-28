// Global variables for books
let books = [];
// Note: classes, students, and holidays are now global variables from State module
// let classes = []; // Removed - using global classes from State
// let students = []; // Removed - using global students from State  
// let holidays = []; // Removed - using global holidays from State

// Helper function to save data to localStorage
function saveData() {
    // Note: classes are now managed through the database API
    if (window.students) {
        localStorage.setItem('madaniMaktabStudents', JSON.stringify(window.students));
    }
    if (window.holidays) {
        localStorage.setItem('madaniMaktabHolidays', JSON.stringify(window.holidays));
    }
    console.log('💾 Data saved to localStorage');
}

// Class management functions
function updateClassDropdowns() {
    const dropdownIds = [
        'studentClass', 'classFilter', 'reportClass', 'bookClass', 'editBookClass', 'newBookClass', 'educationClassFilter'
    ];

    // Check if classes are loaded
    if (!window.classes || window.classes.length === 0) {
        console.log('⚠️ Classes not loaded yet, skipping dropdown update');
        return;
    }

    dropdownIds.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            const currentValue = dropdown.value;
            // Preserve the first option (e.g., "All Classes" or "Select Class")
            const firstOption = dropdown.options[0] ? dropdown.options[0].outerHTML : '';
            dropdown.innerHTML = firstOption;

            window.classes.forEach(cls => {
                // Use cls.id for value and cls.name for display text
                dropdown.options.add(new Option(cls.name, cls.id));
            });

            // Try to restore the previously selected value
            dropdown.value = currentValue;
        }
    });
    
    console.log('✅ Class dropdowns updated successfully');
}

async function addClass() {
    const newClassName = document.getElementById('newClassName').value.trim();
    if (!newClassName) {
        showModal('Error', 'Please enter a class name');
        return;
    }

    try {
        const response = await fetch('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newClassName })
        });

        const result = await response.json();
        if (response.ok) {
            showModal('Success', `"${newClassName}" class added successfully`);
            document.getElementById('newClassName').value = '';
            await refreshClasses(); // Refresh global class list and UI
        } else {
            showModal('Error', result.error || 'Failed to add class');
        }
    } catch (error) {
        showModal('Error', 'A network error occurred.');
    }
}

async function deleteClass(classId, className) {
    if (confirm(`Are you sure you want to delete "${className}"? This will remove the class from all associated students.`)) {
        try {
            const response = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });

            if (response.ok) {
                showModal('Success', `"${className}" class deleted successfully.`);
                await refreshClasses(); // Refresh global class list and UI
            } else {
                const result = await response.json();
                showModal('Error', result.error || 'Failed to delete class.');
            }
        } catch (error) {
            showModal('Error', 'A network error occurred.');
        }
    }
}

function displayClasses() {
    const classesList = document.getElementById('classesList');
    if (!classesList) return;

    if (!window.classes || window.classes.length === 0) {
        classesList.innerHTML = '<p>No classes added yet</p>';
        return;
    }

    classesList.innerHTML = window.classes.map(cls => `
        <div class="list-item">
            <div class="list-item-info">
                <strong>${cls.name}</strong>
            </div>
            <div>
                <button onclick="editClass(${cls.id}, '${cls.name}')" class="btn btn-secondary btn-small" title="Edit Class">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteClass(${cls.id}, '${cls.name}')" class="btn btn-danger btn-small" title="Delete Class">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function editClass(classId, oldClassName) {
    const newClassName = prompt(`Enter the new name for "${oldClassName}":`, oldClassName);

    if (newClassName && newClassName.trim() !== oldClassName) {
        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClassName.trim() })
            });

            const result = await response.json();
            if (response.ok) {
                showModal('Success', 'Class updated successfully.');
                await refreshClasses(); // Refresh global class list and UI
            } else {
                showModal('Error', result.error || 'Failed to update class.');
            }
        } catch (error) {
            showModal('Error', 'A network error occurred.');
        }
    }
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
    const conflictingHoliday = window.holidays ? window.holidays.find(h => {
        const existingStart = new Date(h.startDate);
        const existingEnd = new Date(h.endDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(finalEndDate);
        
        return (newStart <= existingEnd && newEnd >= existingStart);
    }) : null;
    
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
            // Add to global array
            if (window.holidays) {
                window.holidays.push({ 
                    startDate, 
                    endDate: finalEndDate, 
                    name,
                    date: startDate
                });
                window.holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            }
            
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
    const holiday = window.holidays ? window.holidays[index] : null;
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
            if (window.holidays) window.holidays.splice(index, 1);
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
    
    if (!window.holidays || window.holidays.length === 0) {
        holidaysList.innerHTML = '<p>No holidays configured.</p>';
        return;
    }
    
    holidaysList.innerHTML = window.holidays.map((holiday, index) => {
        const startDate = holiday.startDate || holiday.date;
        const endDate = holiday.endDate || holiday.date;
        const isRange = startDate !== endDate;
        const dayCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <strong>${holiday.name}</strong>
                    <span>${isRange ? `${startDate} to ${endDate} (${dayCount} days)` : startDate}</span>
                </div>
                <button onclick="deleteHoliday(${index})" class="btn btn-danger btn-small">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function isHoliday(date) {
    if (!window.holidays || window.holidays.length === 0) return false;
    
    return window.holidays.some(h => {
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
    if (!window.holidays || window.holidays.length === 0) return '';
    
    const holiday = window.holidays.find(h => {
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

// Note: loadEducationProgress function removed - Education Progress is now handled in Teachers Corner

// Note: displayBooksList function removed - Education Progress is now handled in Teachers Corner

// Note: showAddBookForm and hideAddBookForm removed - Education Progress is now handled in Teachers Corner

// Note: addBookProgress function removed - Progress tracking is now handled in Teachers Corner

// Note: updateBookProgress and deleteBookProgress functions removed - Progress tracking is now handled in Teachers Corner

// Note: filterBooksByClass function removed - Education Progress is now handled in Teachers Corner

// Note: editBookDetails, closeEditBookModal, and updateBookDetails functions removed - Education Progress is now handled in Teachers Corner

// Note: showDeleteAllEducationModal and deleteAllEducationData functions removed - Education Progress is now handled in Teachers Corner

// Book management functions
async function loadBooks() {
    try {
        console.log('Loading books...');
        console.log('Current books array before loading:', window.books);
        const response = await fetch('/api/books');
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const booksData = await response.json();
            console.log('📚 Books data received from API:', booksData);
            console.log('📊 Number of books received:', booksData.length);
            
            books = booksData;
            // Also update the global window.books array
            window.books = booksData;
            
            console.log('💾 Books array after assignment:', window.books);
            console.log('📈 Books array length:', window.books ? window.books.length : 'undefined');
            
            // Log each book with its details
            if (window.books && window.books.length > 0) {
                console.log('📖 Individual book details:');
                window.books.forEach((book, index) => {
                    console.log(`  Book ${index + 1}:`, {
                        id: book.id,
                        name: book.book_name,
                        class_id: book.class_id,
                        class_name: getClassNameById(book.class_id)
                    });
                });
            }
            
            displayBooks();
            updateBookDropdowns();
            console.log('✅ Books display and dropdowns updated');
        } else {
            console.error('❌ Failed to load books, status:', response.status);
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function displayBooks() {
    const settingsBooksList = document.getElementById('settingsBooksList');
    if (settingsBooksList) {
        console.log('Displaying books in settings:', window.books);
        console.log('Books count:', window.books ? window.books.length : 'undefined');
        
        if (!window.books || window.books.length === 0) {
            settingsBooksList.innerHTML = '<p class="no-data">No books added yet. Add your first book above.</p>';
        } else {
            settingsBooksList.innerHTML = window.books.map(book => `
                <div class="list-item" data-book-id="${book.id}">
                    <div class="list-item-info">
                        <strong>${book.book_name}</strong>
                        <span>${book.class_id ? getClassNameById(book.class_id) : 'All Classes'}</span>
                    </div>
                    <div>
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
    console.log('getClassNameById called with classId:', classId);
    console.log('window.classes:', window.classes);
    
    if (!window.classes || !classId) {
        console.log('No classes or classId, returning "All Classes"');
        return 'All Classes';
    }
    
    const classObj = window.classes.find(cls => cls.id == classId);
    console.log('Found class object:', classObj);
    
    if (classObj) {
        console.log('Returning class name:', classObj.name);
        return classObj.name;
    } else {
        console.log('Class not found, returning "Unknown Class"');
        return 'Unknown Class';
    }
}

function getClassIdByName(className) {
    if (!window.classes || !className) return null;
    
    const classObj = window.classes.find(cls => cls.name === className);
    return classObj ? classObj.id : null;
}

async function addBook() {
    const bookName = document.getElementById('newBookName').value.trim();
    const classId = document.getElementById('newBookClass').value || null;
    const totalPages = parseInt(document.getElementById('newBookPages').value) || null;
    
    if (!bookName) {
        showModal('Error', 'Please enter a book name');
        return;
    }
    
    if (!totalPages || totalPages <= 0) {
        showModal('Error', 'Please enter a valid number of total pages');
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
                class_id: classId,
                total_pages: totalPages
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Book added successfully! API Response:', result);
            showModal('Success', 'Book added successfully');
            document.getElementById('newBookName').value = '';
            document.getElementById('newBookClass').value = '';
            document.getElementById('newBookPages').value = '';
            
            console.log('🔄 Reloading books to refresh display...');
            await loadBooks();
            updateBookDropdowns();
            console.log('✅ Book list refreshed after adding new book');
        } else {
            const error = await response.json();
            console.error('❌ Failed to add book. API Error:', error);
            showModal('Error', error.error || 'Failed to add book');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showModal('Error', 'Failed to add book');
    }
}

async function editBook(bookId) {
    console.log('Edit book called with ID:', bookId);
    const book = window.books ? window.books.find(b => b.id === bookId) : null;
    if (!book) {
        console.error('Book not found with ID:', bookId);
        return;
    }
    
    console.log('Found book:', book);
    
    const editBookId = document.getElementById('bookManagementEditId');
    const editBookName = document.getElementById('bookManagementEditName');
    const editBookClass = document.getElementById('editBookClass');
    const editBookModal = document.getElementById('bookManagementEditModal');
    
    if (!editBookId || !editBookName || !editBookClass || !editBookModal) {
        console.error('Edit modal elements not found');
        return;
    }
    
    editBookId.value = book.id;
    editBookName.value = book.book_name;
    editBookClass.value = book.class_id || '';
    
    // Set total pages if available
    const editBookTotalPages = document.getElementById('editBookTotalPages');
    if (editBookTotalPages) {
        editBookTotalPages.value = book.total_pages || '';
    }
    
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
    const classId = document.getElementById('editBookClass').value || null;
    const totalPages = parseInt(document.getElementById('editBookTotalPages').value) || null;
    
    console.log('Form values:', { bookId, bookName, classId, totalPages });
    
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
                class_id: classId,
                total_pages: totalPages
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
    console.log('books array in updateBookDropdowns:', window.books);
    console.log('books length in updateBookDropdowns:', window.books ? window.books.length : 'undefined');
    
    // Only update dropdowns that actually exist in the current UI
    // These dropdowns were for the old Education Progress system that was removed
    
    // Update class dropdowns in the Book Management forms
    updateClassDropdowns();
    
    console.log('✅ Book dropdowns updated (only existing ones)');
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
    
    // Note: Old Education Progress form elements were removed
    // Book management is now handled through the Settings Book Management tab
});

// Helper to refresh classes from the server and update the UI
async function refreshClasses() {
    try {
        const response = await fetch('/api/classes');
        if (response.ok) {
            window.classes = await response.json();
            displayClasses();
            updateClassDropdowns();
            // If dashboard is active, refresh it
            if (document.getElementById('dashboard').classList.contains('active')) {
                window.updateDashboard();
            }
        }
    } catch (error) {
        console.error("Failed to refresh classes:", error);
    }
}

// Export all functions
export { 
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
    closeBookManagementEditModal, 
    displayBooks, 
    getClassNameById, 
    getClassIdByName, 
    addBook, 
    editBook, 
    deleteBook, 
    updateBookDropdowns, 
    initializeAcademicYearStart, 
    saveAcademicYearStart, 
    clearAcademicYearStart, 
    displayAcademicYearStart, 
    updateDateRestrictions, 
    clearDateRestrictions, 
    saveAppName,
    loadBooks,
    refreshClasses
}
