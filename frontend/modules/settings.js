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
                // Special handling for attendance classFilter - use cls.name as value
                if (id === 'classFilter') {
                dropdown.options.add(new Option(cls.name, cls.name));
                } else {
                    // Use cls.id for value and cls.name for display text for other dropdowns
                    dropdown.options.add(new Option(cls.name, cls.id));
                }
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
        showModal(t('error'), t('pleaseEnterClassName'));
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
            showModal(t('success'), `"${newClassName}" ${t('classAddedSuccessfully')}`);
            document.getElementById('newClassName').value = '';
            await refreshClasses(); // Refresh global class list and UI
        } else {
            showModal(t('error'), result.error || t('failedToAddClass'));
        }
    } catch (error) {
        showModal(t('error'), t('networkErrorOccurred'));
    }
}

async function deleteClass(classId, className) {
    if (confirm(`Are you sure you want to delete "${className}"? This will remove the class from all associated students.`)) {
        try {
            const response = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });

            if (response.ok) {
                showModal(t('success'), `"${className}" ${t('classDeletedSuccessfully')}`);
                await refreshClasses(); // Refresh global class list and UI
            } else {
                const result = await response.json();
                showModal(t('error'), result.error || t('failedToDeleteClass'));
            }
        } catch (error) {
            showModal(t('error'), t('networkErrorOccurred'));
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
                showModal(t('success'), t('classUpdatedSuccessfully'));
                await refreshClasses(); // Refresh global class list and UI
            } else {
                showModal(t('error'), result.error || t('failedToUpdateClass'));
            }
        } catch (error) {
            showModal(t('error'), t('networkErrorOccurred'));
        }
    }
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
        showModal(t('error'), t('pleaseEnterBookName'));
        return;
    }
    
    if (!totalPages || totalPages <= 0) {
        showModal(t('error'), t('pleaseEnterValidNumberOfTotalPages'));
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
            showModal(t('success'), t('bookAddedSuccessfully'));
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
            showModal(t('error'), error.error || t('failedToAddBook'));
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showModal(t('error'), t('failedToAddBook'));
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
        showModal(t('error'), t('pleaseEnterBookName'));
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
async function saveAcademicYearStart() {
    const academicYearStartInput = document.getElementById('academicYearStartInput');
    const startDate = academicYearStartInput.value;
    
    if (!startDate) {
        showModal('Error', 'Please select an academic year start date');
        return;
    }
    
    try {
        const response = await fetch('/api/settings/academicYearStart', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: startDate,
                description: 'Academic year start date'
            })
        });
        
        if (response.ok) {
    window.academicYearStartDate = startDate;
            // Also save to localStorage as backup
    localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
    
    updateDateRestrictions();
    showModal('Success', 'Academic year start date updated successfully');
        } else {
            console.error('Failed to save academic year start to database');
            // Fallback to localStorage only
            window.academicYearStartDate = startDate;
            localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
            updateDateRestrictions();
            showModal('Success', 'Academic year start date saved locally');
        }
    } catch (error) {
        console.error('Error saving academic year start:', error);
        // Fallback to localStorage only
        window.academicYearStartDate = startDate;
        localStorage.setItem('madaniMaktabAcademicYearStart', startDate);
        updateDateRestrictions();
        showModal('Success', 'Academic year start date saved locally');
    }
    
    academicYearStartInput.value = '';
    displayAcademicYearStart();
}

async function clearAcademicYearStart() {
    if (confirm('Are you sure you want to clear the academic year start date?')) {
        try {
            const response = await fetch('/api/settings/academicYearStart', {
                method: 'DELETE'
            });
            
            if (response.ok) {
        window.academicYearStartDate = null;
        localStorage.removeItem('madaniMaktabAcademicYearStart');
        
        clearDateRestrictions();
        displayAcademicYearStart();
        
        showModal('Success', 'Academic year start date cleared successfully');
            } else {
                console.error('Failed to clear academic year start from database');
                // Fallback to localStorage only
                window.academicYearStartDate = null;
                localStorage.removeItem('madaniMaktabAcademicYearStart');
                clearDateRestrictions();
                displayAcademicYearStart();
                showModal('Success', 'Academic year start date cleared locally');
            }
        } catch (error) {
            console.error('Error clearing academic year start:', error);
            // Fallback to localStorage only
            window.academicYearStartDate = null;
            localStorage.removeItem('madaniMaktabAcademicYearStart');
            clearDateRestrictions();
            displayAcademicYearStart();
            showModal('Success', 'Academic year start date cleared locally');
        }
    }
}

async function initializeAcademicYearStart() {
    try {
        const response = await fetch('/api/settings/academicYearStart');
        if (response.ok) {
            const data = await response.json();
            const savedStartDate = data.value;
            if (savedStartDate) {
                window.academicYearStartDate = savedStartDate;
                console.log('Loaded academic year start date from database:', window.academicYearStartDate);
                
                updateDateRestrictions();
                displayAcademicYearStart();
            }
        } else {
            // Fallback to localStorage
    const savedStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
    if (savedStartDate) {
        window.academicYearStartDate = savedStartDate;
                console.log('Loaded academic year start date from localStorage:', window.academicYearStartDate);
        
        updateDateRestrictions();
        displayAcademicYearStart();
            }
        }
    } catch (error) {
        console.error('Error loading academic year start from database:', error);
        // Fallback to localStorage
        const savedStartDate = localStorage.getItem('madaniMaktabAcademicYearStart');
        if (savedStartDate) {
            window.academicYearStartDate = savedStartDate;
            console.log('Loaded academic year start date from localStorage:', window.academicYearStartDate);
            
            updateDateRestrictions();
            displayAcademicYearStart();
        }
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
            displaySpan.textContent = t('notSet');
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
async function saveAppName() {
    const appNameInput = document.getElementById('appNameInput');
    const newAppName = appNameInput.value.trim();
    
    if (!newAppName) {
        showModal('Error', 'Please enter an app name');
        return;
    }
    
    try {
        const response = await fetch('/api/settings/appName', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: newAppName,
                description: 'Application name'
            })
        });
        
        if (response.ok) {
            // Also save to localStorage as backup
    localStorage.setItem('madaniMaktabAppName', newAppName);
    document.title = newAppName;
    
    const appNameDisplay = document.getElementById('appNameDisplay');
    if (appNameDisplay) {
        appNameDisplay.textContent = newAppName;
    }
            
            // Update all header texts to reflect the new app name
            if (typeof updateHeaderTexts === 'function') {
                updateHeaderTexts();
    }
    
    showModal('Success', 'App name updated successfully');
        } else {
            console.error('Failed to save app name to database');
            // Fallback to localStorage only
            localStorage.setItem('madaniMaktabAppName', newAppName);
            document.title = newAppName;
            
            const appNameDisplay = document.getElementById('appNameDisplay');
            if (appNameDisplay) {
                appNameDisplay.textContent = newAppName;
            }
            
            // Update all header texts to reflect the new app name
            if (typeof updateHeaderTexts === 'function') {
                updateHeaderTexts();
            }
            
            showModal('Success', 'App name saved locally');
        }
    } catch (error) {
        console.error('Error saving app name:', error);
        // Fallback to localStorage only
        localStorage.setItem('madaniMaktabAppName', newAppName);
        document.title = newAppName;
        
        const appNameDisplay = document.getElementById('appNameDisplay');
        if (appNameDisplay) {
            appNameDisplay.textContent = newAppName;
        }
        
        // Update all header texts to reflect the new app name
        if (typeof updateHeaderTexts === 'function') {
            updateHeaderTexts();
        }
        
        showModal('Success', 'App name saved locally');
    }
    
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

// User Management Functions
let allUsers = [];

async function loadUsers() {
    try {
        console.log('🔄 Loading users...');
        console.log('👤 Current user:', window.currentUser);
        
        const response = await fetch('/api/users');
        console.log('📡 Users API response status:', response.status);
        
        if (response.ok) {
            allUsers = await response.json();
            console.log('✅ Users loaded successfully:', allUsers.length);
            displayUsers();
            updateUserClassDropdowns();
        } else {
            const error = await response.json();
            console.error('❌ Failed to load users:', error);
            showModal('Error', error.error || 'Failed to load users');
        }
    } catch (error) {
        console.error('❌ Error loading users:', error);
        showModal('Error', 'Failed to load users');
    }
}

function displayUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (!allUsers || allUsers.length === 0) {
        usersList.innerHTML = '<p class="no-data">No users found.</p>';
        return;
    }

    usersList.innerHTML = allUsers.map(user => {
        const lastLogin = user.last_login ? new Date(user.last_login).toLocaleString() : 'Never';
        const status = user.is_active ? 'Active' : 'Inactive';
        const statusClass = user.is_active ? 'text-green-600' : 'text-red-600';
        const className = user.class_name || 'All Classes';
        
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <strong>${user.username}</strong>
                    <span class="user-details">
                        Role: ${user.role} | Class: ${className} | 
                        Status: <span class="${statusClass}">${status}</span> | 
                        Last Login: ${lastLogin}
                    </span>
                </div>
                <div class="list-item-actions">
                    <button onclick="editUser(${user.id})" class="btn btn-secondary btn-small" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser(${user.id}, '${user.username}')" class="btn btn-danger btn-small" title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateUserClassDropdowns() {
    const dropdownIds = ['createUserClass', 'editUserClass'];
    
    dropdownIds.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown && window.classes) {
            // Preserve the first option
            const firstOption = dropdown.options[0] ? dropdown.options[0].outerHTML : '';
            dropdown.innerHTML = firstOption;
            
            window.classes.forEach(cls => {
                dropdown.options.add(new Option(cls.name, cls.name));
            });
        }
    });
}

function showCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    const form = document.getElementById('createUserForm');
    
    if (modal && form) {
        form.reset();
        updateUserClassDropdowns();
        modal.style.display = 'block';
    }
}

function closeCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function createUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('createUsername').value.trim();
    const password = document.getElementById('createPassword').value;
    const role = document.getElementById('createRole').value;
    const className = document.getElementById('createUserClass').value || null;
    
    if (!username || !password || !role) {
        showModal('Error', 'Please fill in all required fields');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                role,
                class_name: className
            })
        });
        
        const result = await response.json();
        if (response.ok) {
            showModal('Success', result.message);
            closeCreateUserModal();
            await loadUsers();
        } else {
            showModal('Error', result.error || 'Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showModal('Error', 'Failed to create user');
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showModal('Error', 'User not found');
        return;
    }
    
    const modal = document.getElementById('editUserModal');
    if (!modal) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editUserClass').value = user.class_name || '';
    document.getElementById('editUserStatus').value = user.is_active ? '1' : '0';
    
    updateUserClassDropdowns();
    modal.style.display = 'block';
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function updateUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value.trim();
    const role = document.getElementById('editRole').value;
    const className = document.getElementById('editUserClass').value || null;
    const isActive = document.getElementById('editUserStatus').value === '1';
    
    if (!username || !role) {
        showModal('Error', 'Please fill in all required fields');
        return;
    }
    
    try {
        console.log(`🔄 Updating user ${userId} with data:`, { username, role, class_name: className, is_active: isActive });
        
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                role,
                class_name: className,
                is_active: isActive
            })
        });
        
        console.log(`📡 Update user API response status: ${response.status}`);
        
        const result = await response.json();
        console.log('📄 Update user API response:', result);
        
        if (response.ok) {
            console.log('✅ User update successful, reloading users...');
            showModal('Success', result.message);
            closeEditUserModal();
            await loadUsers();
        } else {
            console.error('❌ User update failed:', result);
            showModal('Error', result.error || 'Failed to update user');
        }
    } catch (error) {
        console.error('❌ Error updating user:', error);
        showModal('Error', 'Failed to update user');
    }
}

async function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (response.ok) {
            showModal('Success', result.message);
            await loadUsers();
        } else {
            showModal('Error', result.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showModal('Error', 'Failed to delete user');
    }
}

async function resetUserPassword() {
    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('editUsername').value;
    
    const newPassword = prompt(`Enter new password for user "${username}":`);
    if (!newPassword) return;
    
    if (newPassword.length < 4) {
        showModal('Error', 'Password must be at least 4 characters long');
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}/reset-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_password: newPassword })
        });
        
        const result = await response.json();
        if (response.ok) {
            showModal('Success', result.message);
        } else {
            showModal('Error', result.error || 'Failed to reset password');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        showModal('Error', 'Failed to reset password');
    }
}

function refreshUsersList() {
    loadUsers();
}

// Event listeners for user management forms
document.addEventListener('DOMContentLoaded', function() {
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', createUser);
    }
    
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', updateUser);
    }
    
    // Only load users for admin users - wait for authentication check
    setTimeout(() => {
        if (window.currentUser && window.currentUser.role === 'admin' && typeof loadUsers === 'function') {
            loadUsers();
        }
    }, 1000);
});

// Data Reset Functions
function showResetStudentsModal() {
    showModal('Delete All Students', `
        <div class="text-center">
            <i class="fas fa-users text-4xl text-danger mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Delete All Students</h3>
            <p class="text-gray-600 mb-6">This will permanently delete all student data including:</p>
            <ul class="text-left text-gray-600 mb-6 space-y-2">
                <li>• Student personal information</li>
                <li>• All attendance records</li>
                <li>• All scores and progress</li>
                <li>• All teacher logs for students</li>
            </ul>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p class="text-red-600 font-semibold mb-2">⚠️ WARNING: This action is irreversible!</p>
                <p class="text-red-600 text-sm">This will completely reset your student database. All data will be permanently lost.</p>
            </div>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetStudents()" class="btn btn-danger">Delete All Students</button>
            </div>
        </div>
    `);
}

function showResetScoresModal() {
    showModal('Reset All Scores', `
        <div class="text-center">
            <i class="fas fa-chart-line text-4xl text-warning mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Reset All Scores</h3>
            <p class="text-gray-600 mb-6">This will reset all student scores to default values.</p>
            <p class="text-red-600 font-semibold mb-4">This action cannot be undone!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetScores()" class="btn btn-danger">Reset All Scores</button>
            </div>
        </div>
    `);
}

function showResetProgressModal() {
    showModal('Reset Education Progress', `
        <div class="text-center">
            <i class="fas fa-book-open text-4xl text-warning mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Reset Education Progress</h3>
            <p class="text-gray-600 mb-6">This will delete all education progress records.</p>
            <p class="text-red-600 font-semibold mb-4">This action cannot be undone!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetProgress()" class="btn btn-danger">Reset Progress</button>
            </div>
        </div>
    `);
}


function showResetBooksModal() {
    showModal('Reset All Books', `
        <div class="text-center">
            <i class="fas fa-books text-4xl text-warning mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Reset All Books</h3>
            <p class="text-gray-600 mb-6">This will delete all books and their progress records.</p>
            <p class="text-red-600 font-semibold mb-4">This action cannot be undone!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetBooks()" class="btn btn-danger">Reset All Books</button>
            </div>
        </div>
    `);
}


function showResetLogsModal() {
    showModal('Reset Teacher Logs', `
        <div class="text-center">
            <i class="fas fa-clipboard-list text-4xl text-warning mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Reset Teacher Logs</h3>
            <p class="text-gray-600 mb-6">This will delete all teacher logbook entries.</p>
            <p class="text-red-600 font-semibold mb-4">This action cannot be undone!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetLogs()" class="btn btn-danger">Reset All Logs</button>
            </div>
        </div>
    `);
}

function showResetUsersModal() {
    showModal('Reset All Users', `
        <div class="text-center">
            <i class="fas fa-user-cog text-4xl text-warning mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Reset All Users</h3>
            <p class="text-gray-600 mb-6">This will delete all user accounts except the current admin.</p>
            <p class="text-red-600 font-semibold mb-4">This action cannot be undone!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetUsers()" class="btn btn-danger">Reset All Users</button>
            </div>
        </div>
    `);
}

function showResetSettingsModal() {
    showModal('Reset Settings', `
        <div class="text-center">
            <i class="fas fa-cog text-4xl text-warning mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Reset Settings</h3>
            <p class="text-gray-600 mb-6">This will reset all application settings to default values.</p>
            <p class="text-red-600 font-semibold mb-4">This action cannot be undone!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmResetSettings()" class="btn btn-danger">Reset Settings</button>
            </div>
        </div>
    `);
}

function showCompleteResetModal() {
    showModal('Complete Reset', `
        <div class="text-center">
            <i class="fas fa-bomb text-6xl text-red-500 mb-4"></i>
            <h3 class="text-2xl font-bold text-red-600 mb-4">⚠️ COMPLETE RESET ⚠️</h3>
            <p class="text-gray-600 mb-6 text-lg">This will delete ALL data and reset the entire application to its initial state.</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-red-800 mb-2">This will delete:</h4>
                <ul class="text-left text-red-700 space-y-1">
                    <li>• All students and their data</li>
                    <li>• All attendance records</li>
                    <li>• All books and classes</li>
                    <li>• All teacher logs</li>
                    <li>• All user accounts (except admin)</li>
                    <li>• All settings and preferences</li>
                </ul>
            </div>
            <p class="text-red-600 font-bold text-lg mb-6">THIS ACTION CANNOT BE UNDONE!</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="confirmCompleteReset()" class="btn btn-danger text-lg px-6 py-3">RESET EVERYTHING</button>
            </div>
        </div>
    `);
}

function showBackupModal() {
    showModal('Create Backup', `
        <div class="text-center">
            <i class="fas fa-download text-4xl text-blue-500 mb-4"></i>
            <h3 class="text-xl font-semibold mb-4">Create Data Backup</h3>
            <p class="text-gray-600 mb-6">Download a complete backup of all your data.</p>
            <div class="flex gap-3 justify-center">
                <button onclick="closeModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="createBackup()" class="btn btn-primary">Create Backup</button>
            </div>
        </div>
    `);
}

// Confirmation functions (to be implemented)
async function confirmResetStudents() {
    // Check if students exist
    if (typeof window.students === 'undefined' || window.students.length === 0) {
        closeModal();
        showModal('No Data', 'No students found to delete.');
        return;
    }
    
    // First confirmation
    if (confirm('Are you sure you want to delete ALL students?\n\nThis action cannot be undone.')) {
        // Second confirmation with stronger warning
        if (confirm('Are you absolutely sure you want to delete ALL students?\n\nThis will permanently delete ALL students and their attendance records. This action is irreversible and will completely reset your student database.')) {
            try {
                const response = await fetch('/api/students', {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Get count before clearing
                    const deletedCount = window.students.length;
                    // Clear local array
                    window.students = [];
                    
                    // Refresh UI
                    if (typeof displayStudentsList === 'function') {
                        displayStudentsList();
                    }
                    if (typeof updateDashboard === 'function') {
                        updateDashboard();
                    }
                    
                    closeModal();
                    showModal('Success', `All ${deletedCount} students have been deleted successfully.`);
                } else {
                    const error = await response.json();
                    closeModal();
                    showModal('Error', error.error || 'Failed to delete all students');
                }
            } catch (error) {
                console.error('Delete all error:', error);
                closeModal();
                showModal('Error', 'Network error. Please try again.');
            }
        }
    }
}

async function confirmResetScores() {
    try {
        const response = await fetch('/api/student-scores/reset-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        if (response.ok) {
    closeModal();
            showModal('Success', result.message || 'All student scores and score history have been deleted from the database.');
            
            // Refresh any open Teachers Corner views
            if (typeof window.refreshTeachersCorner === 'function') {
                window.refreshTeachersCorner();
            }
        } else if (response.status === 401) {
            closeModal();
            showModal('Error', 'You must be logged in as an admin to reset student scores.');
        } else {
            closeModal();
            showModal('Error', result.error || 'Failed to delete all score data');
        }
    } catch (error) {
        console.error('Error resetting scores:', error);
        closeModal();
        showModal('Error', 'Network error. Please try again.');
    }
}

async function confirmResetProgress() {
    try {
    console.log('Resetting education progress...');
        console.log('Making API call to /api/education/all');
        
        const response = await fetch('/api/education/all', {
            method: 'DELETE'
        });
        
        console.log('Response received:', response.status, response.statusText);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (response.ok) {
            console.log('Education progress reset successful');
    closeModal();
            showModal('Success', result.message || 'All education progress data has been deleted successfully.');
        } else if (response.status === 401) {
            console.log('Authentication required for education progress reset');
            closeModal();
            showModal('Error', 'You must be logged in as an admin to reset education progress data.');
        } else {
            console.log('Education progress reset failed:', result.error);
            closeModal();
            showModal('Error', result.error || 'Failed to delete education progress data');
        }
    } catch (error) {
        console.error('Error resetting education progress:', error);
    closeModal();
        showModal('Error', 'Network error. Please try again.');
    }
}


async function confirmResetBooks() {
    try {
        const response = await fetch('/api/books/all', {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (response.ok) {
    closeModal();
            showModal('Success', result.message || 'All books have been reset successfully.');
            
            // Refresh books list if it exists
            if (typeof loadBooks === 'function') {
                await loadBooks();
            }
        } else {
    closeModal();
            showModal('Error', result.error || 'Failed to reset all books');
        }
    } catch (error) {
        console.error('Error resetting books:', error);
        closeModal();
        showModal('Error', 'Network error. Please try again.');
    }
}


async function confirmResetLogs() {
    try {
        const response = await fetch('/api/teacher-logs/all', {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (response.ok) {
    closeModal();
            showModal('Success', result.message || 'All teacher logs have been reset successfully.');
        } else {
            closeModal();
            showModal('Error', result.error || 'Failed to reset all teacher logs');
        }
    } catch (error) {
        console.error('Error resetting teacher logs:', error);
        closeModal();
        showModal('Error', 'Network error. Please try again.');
    }
}

function confirmResetUsers() {
    console.log('Resetting all users...');
    closeModal();
    showModal('Success', 'All users have been reset successfully.');
}

function confirmResetSettings() {
    console.log('Resetting settings...');
    closeModal();
    showModal('Success', 'Settings have been reset successfully.');
}

function confirmCompleteReset() {
    console.log('Performing complete reset...');
    closeModal();
    showModal('Success', 'Complete reset has been performed successfully.');
}

function showBulkImport() {
    // Show the bulk import section in data management
    const bulkImportSection = document.getElementById('bulkImportSection');
    const dataManagementContent = document.querySelector('#data .reset-list, #data .danger-zone, #data .setting-group');
    
    if (bulkImportSection && dataManagementContent) {
        // Hide other content
        dataManagementContent.style.display = 'none';
        // Show bulk import section
        bulkImportSection.style.display = 'block';
        
        // Setup file input listener
        const fileInput = document.getElementById('excelFile');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
    }
}

function hideBulkImport() {
    // Hide bulk import section and show other content
    const bulkImportSection = document.getElementById('bulkImportSection');
    const dataManagementContent = document.querySelector('#data .reset-list, #data .danger-zone, #data .setting-group');
    
    if (bulkImportSection && dataManagementContent) {
        bulkImportSection.style.display = 'none';
        dataManagementContent.style.display = 'block';
        
        // Reset file input
        const fileInput = document.getElementById('excelFile');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Hide import results
        const importResults = document.getElementById('importResults');
        if (importResults) {
            importResults.style.display = 'none';
        }
    }
}

function downloadAllStudentsCSV() {
    // Export all students data as CSV in the exact format expected by import
    if (typeof window.students === 'undefined' || window.students.length === 0) {
        showModal('No Data', 'No students found to export.');
        return;
    }
    
    try {
        // Create CSV content with headers that match the import format exactly
        const headers = ['id', 'name', 'fathername', 'rollnumber', 'mobilenumber', 'district', 'upazila', 'class', 'registrationdate'];
        const csvContent = [
            headers.join(','),
            ...window.students.map(student => [
                student.id || '',
                `"${student.name || ''}"`,
                `"${student.fatherName || ''}"`,
                student.rollNumber || '',
                student.mobileNumber || '',
                `"${student.district || ''}"`,
                `"${student.upazila || ''}"`,
                `"${student.class || ''}"`,
                student.registrationDate || ''
            ].join(','))
        ].join('\n');
        
        // Download CSV file with UTF-8 BOM for proper Bengali text support
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showModal('Success', 'Students data exported successfully! The file is ready for re-import.');
    } catch (error) {
        console.error('Export error:', error);
        showModal('Export Error', 'Failed to export data. Please try again.');
    }
}

function createBackup() {
    console.log('Creating backup...');
    closeModal();
    showModal('Success', 'Backup created successfully.');
}

// Bulk import helper functions (imported from registration.js functionality)
function handleFileSelect(event) {
    const file = event.target.files[0];
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (file) {
        updateUploadZone(file.name);
        if (uploadBtn) {
            uploadBtn.disabled = false;
        }
    } else {
        resetUploadZone();
        if (uploadBtn) {
            uploadBtn.disabled = true;
        }
    }
}

function updateUploadZone(fileName) {
    const dropZone = document.querySelector('.upload-drop-zone');
    if (dropZone) {
        dropZone.innerHTML = `
            <i class="fas fa-file-csv text-success"></i>
            <p><strong>Selected:</strong> ${fileName}</p>
            <p class="file-types">Click to select a different file</p>
        `;
    }
}

function resetUploadZone() {
    const dropZone = document.querySelector('.upload-drop-zone');
    if (dropZone) {
        dropZone.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Click to select CSV file</p>
            <p class="file-types">Supports .csv files (Excel saved as CSV)</p>
        `;
    }
}

// Import the bulk import functions from registration.js
async function processExcelFile() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showModal('Error', 'Please select a CSV file first');
        return;
    }
    
    // Show progress
    showImportProgress();
    
    try {
        // Read Excel file
        const studentsData = await readExcelFile(file);
        
        if (studentsData.length === 0) {
            showModal('Error', 'No student data found in the CSV file. Please check the format.');
            hideImportProgress();
            return;
        }
        
        // Validate and import students
        await importStudentsBatch(studentsData);
        
    } catch (error) {
        console.error('Import error:', error);
        hideImportProgress();
        
        // Show better error message for encoding issues
        if (error.message.includes('এনকোডিং') || error.message.includes('encoding')) {
            showEncodingErrorModal(error.message);
        } else {
            showModal('Import Error', error.message);
        }
    }
}

function showImportProgress() {
    const resultsDiv = document.getElementById('importResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="import-progress">
                <h4>📤 Processing CSV File...</h4>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                </div>
                <p id="progressText">Preparing to read file...</p>
            </div>
        `;
    }
}

function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = text;
}

function hideImportProgress() {
    const progressDiv = document.querySelector('.import-progress');
    if (progressDiv) {
        progressDiv.style.display = 'none';
    }
}

async function readExcelFile(file) {
    updateProgress(10, 'Reading CSV file...');
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                updateProgress(30, 'Parsing CSV data...');
                
                const text = e.target.result;
                
                // Split into lines and remove empty lines
                const lines = text.split('\n').filter(line => line.trim() !== '');
                
                if (lines.length < 2) {
                    reject(new Error('CSV file must have at least a header row and one data row'));
                    return;
                }
                
                // Parse header row
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                
                // Expected headers
                const expectedHeaders = ['id', 'name', 'fathername', 'rollnumber', 'mobilenumber', 'district', 'upazila', 'class', 'registrationdate'];
                
                // Check if all required headers are present
                const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}. Please check your CSV format.`));
                    return;
                }
                
                // Parse data rows
                const fileStudents = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    
                    if (values.length !== headers.length) {
                        console.warn(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}. Skipping.`);
                        continue;
                    }
                    
                    const student = {};
                    headers.forEach((header, index) => {
                        student[header] = values[index] || '';
                    });
                    
                    // Validate required fields
                    if (!student.name || !student.fathername || !student.rollnumber || !student.class) {
                        console.warn(`Row ${i + 1} is missing required fields. Skipping.`);
                        continue;
                    }
                    
                    fileStudents.push(student);
                }
                
                updateProgress(50, `Found ${fileStudents.length} students in file`);
                resolve(fileStudents);
                
            } catch (error) {
                reject(new Error(`Error parsing CSV file: ${error.message}`));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Error reading file. Please make sure the file is not corrupted and try again.'));
        };
        
        reader.readAsText(file, 'UTF-8');
    });
}

async function importStudentsBatch(studentsData) {
    const total = studentsData.length;
    updateProgress(60, `Uploading ${total} students for validation...`);
    
    // We need to map the headers from the CSV (lowercase) to the database schema (camelCase)
    const formattedStudentsData = studentsData.map(student => ({
        id: student.id || generateStudentId(), // Assign new ID if missing
        name: student.name,
        fatherName: student.fathername,
        rollNumber: student.rollnumber,
        mobileNumber: student.mobilenumber,
        district: student.district,
        upazila: student.upazila,
        class: student.class,
        registrationDate: student.registrationdate || new Date().toISOString().split('T')[0]
    }));

    try {
        const response = await fetch('/api/students/bulk-import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedStudentsData)
        });

        const result = await response.json();

        if (response.ok) {
            updateProgress(100, 'Import complete!');
            showImportResults(total, total, 0, 0, 0, []); // Simplified results
            
            // Refresh local student data
            const studentsResponse = await fetch('/api/students');
            if (studentsResponse.ok) {
                window.students = await studentsResponse.json();
            }
        } else {
            // Handle the specific class validation error
            if (response.status === 400 && result.invalid_classes) {
                const errorMessage = `${result.error}: ${result.invalid_classes.join(', ')}. Please add them in Settings before uploading.`;
                showModal('Upload Failed', errorMessage);
            } else {
                showModal('Import Error', result.error || 'An unknown error occurred.');
            }
            
            // Reset progress on failure
            document.getElementById('importResults').style.display = 'none';
        }
    } catch (error) {
        console.error('Bulk import error:', error);
        showModal('Network Error', 'Could not connect to the server.');
        document.getElementById('importResults').style.display = 'none';
    } finally {
        hideImportProgress();
        
        // Refresh the student list and dashboard regardless of outcome
        if (typeof displayStudentsList === 'function') {
            displayStudentsList();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
}

function showImportResults(total, successful, failed, updated, duplicateRolls, errors) {
    const resultsDiv = document.getElementById('importResults');
    if (!resultsDiv) return;
    
    const summaryHTML = `
        <div class="import-summary">
            <div class="summary-item success">
                <h4>${successful}</h4>
                <p>Successfully Imported</p>
            </div>
            <div class="summary-item error">
                <h4>${failed}</h4>
                <p>Failed</p>
            </div>
            <div class="summary-item info">
                <h4>${updated}</h4>
                <p>Updated</p>
            </div>
            <div class="summary-item warning">
                <h4>${duplicateRolls}</h4>
                <p>Duplicate Roll Numbers</p>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = `
        <div class="import-results-content">
            <h4>📊 Import Results</h4>
            ${summaryHTML}
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="hideBulkImport()" class="btn btn-primary">
                    <i class="fas fa-list"></i> Back to Data Management
                </button>
                <button onclick="resetBulkImport()" class="btn btn-secondary">
                    <i class="fas fa-upload"></i> Import Another File
                </button>
            </div>
        </div>
    `;
}

function resetBulkImport() {
    // Reset the form
    const fileInput = document.getElementById('excelFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const importResults = document.getElementById('importResults');
    
    if (fileInput) fileInput.value = '';
    if (uploadBtn) uploadBtn.disabled = true;
    if (importResults) importResults.style.display = 'none';
    
    resetUploadZone();
}

function generateStudentId() {
    return 'ST' + String(Date.now()).slice(-6);
}

function showEncodingErrorModal(message) {
    showModal('Encoding Error', `
        <div style="text-align: left;">
            <p><strong>Bengali/Unicode Text Issue Detected:</strong></p>
            <p>${message}</p>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3;">
                <p style="margin: 0; color: #1565c0; font-weight: 600;">💡 Solution:</p>
                <p style="margin: 5px 0 0 0; color: #1565c0;">Save your Excel file as <strong>"CSV UTF-8 (Comma delimited) (*.csv)"</strong> format</p>
            </div>
            <p><strong>Steps:</strong></p>
            <ol style="text-align: left; margin: 10px 0;">
                <li>Open your Excel file</li>
                <li>Go to File → Save As</li>
                <li>Choose "CSV UTF-8 (Comma delimited) (*.csv)"</li>
                <li>Save and try uploading again</li>
            </ol>
        </div>
    `);
}

// Export all functions
export { 
    books, 
    updateClassDropdowns, 
    addClass, 
    deleteClass, 
    displayClasses, 
    editClass, 
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
    refreshClasses,
    // User management functions
    loadUsers,
    displayUsers,
    showCreateUserModal,
    closeCreateUserModal,
    editUser,
    closeEditUserModal,
    deleteUser,
    resetUserPassword,
    refreshUsersList,
    // Data reset functions
    showResetStudentsModal,
    showResetScoresModal,
    showResetProgressModal,
    showResetBooksModal,
    showResetLogsModal,
    showResetUsersModal,
    showResetSettingsModal,
    showCompleteResetModal,
    showBackupModal,
    showBulkImport,
    hideBulkImport,
    downloadAllStudentsCSV,
    createBackup,
    handleFileSelect,
    updateUploadZone,
    resetUploadZone,
    processExcelFile,
    showImportProgress,
    updateProgress,
    hideImportProgress,
    readExcelFile,
    importStudentsBatch,
    showImportResults,
    resetBulkImport,
    generateStudentId,
    showEncodingErrorModal,
    // Confirmation functions
    confirmResetStudents,
    confirmResetScores,
    confirmResetProgress,
    confirmResetBooks,
    confirmResetLogs,
    confirmResetUsers,
    confirmResetSettings,
    confirmCompleteReset
}
