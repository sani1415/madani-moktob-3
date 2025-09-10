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
async function fetchAcademicYears() {
    try {
        const [yearsRes, currentRes] = await Promise.all([
            fetch('/api/academic-years'),
            fetch('/api/academic-years/current')
        ]);
        const years = yearsRes.ok ? await yearsRes.json() : [];
        const current = currentRes.ok ? await currentRes.json() : null;
        window.academicYears = Array.isArray(years) ? years : [];
        window.currentAcademicYear = current && current.id ? current : null;
        renderAcademicYears();
    } catch (e) {
        console.error('Failed to fetch academic years', e);
    }
}
// Year Close Wizard wiring
async function yearClosePreview() {
    try {
        const nextName = document.getElementById('ycName')?.value?.trim();
        const nextStart = document.getElementById('ycStart')?.value;
        const nextEnd = document.getElementById('ycEnd')?.value;
        
        // Validate required fields
        if (!nextName || !nextStart || !nextEnd) {
            showModal('Error', 'Please fill in all fields: Year Name, Start Date, and End Date');
            return;
        }
        
        // Validate date range
        if (new Date(nextStart) >= new Date(nextEnd)) {
            showModal('Error', 'Start date must be before end date');
            return;
        }
        
        const rules = collectPromotionRules();
        const leavers = collectLeavers();
        const res = await fetch('/api/year-close/preview', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ next_year: { name: nextName, start_date: nextStart, end_date: nextEnd }, promotion_rules: rules, leavers })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Preview failed');
        renderYearClosePreview(data);
    } catch (e) {
        showModal('Error', e.message || 'Preview failed');
    }
}

async function yearCloseConfirm() {
    try {
        const nextName = document.getElementById('ycName')?.value?.trim();
        const nextStart = document.getElementById('ycStart')?.value;
        const nextEnd = document.getElementById('ycEnd')?.value;
        
        // Validate required fields
        if (!nextName || !nextStart || !nextEnd) {
            showModal('Error', 'Please fill in all fields: Year Name, Start Date, and End Date');
            return;
        }
        
        // Validate date range
        if (new Date(nextStart) >= new Date(nextEnd)) {
            showModal('Error', 'Start date must be before end date');
            return;
        }
        
        const rules = collectPromotionRules();
        const leavers = collectLeavers();
        const res = await fetch('/api/year-close/confirm', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ next_year: { name: nextName, start_date: nextStart, end_date: nextEnd }, promotion_rules: rules, leavers })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Confirm failed');
        showModal('Success', `Next Year ID: ${data.next_year_id}. Promotions: ${data.promotions_created}. Leavers updated: ${data.leavers_updated}.`);
        await fetchAcademicYears();
    } catch (e) {
        showModal('Error', e.message || 'Confirm failed');
    }
}

function collectPromotionRules() {
    const rows = document.querySelectorAll('.yc-rule-row');
    const rules = [];
    rows.forEach(r => {
        const fromAttr = r.getAttribute('data-from');
        const fromId = fromAttr ? parseInt(fromAttr) : parseInt(r.querySelector('.yc-from')?.value || '');
        const toId = parseInt(r.querySelector('.yc-to')?.value || '');
        if (fromId && toId) rules.push({ from_class_id: fromId, to_class_id: toId });
    });
    return rules;
}

function collectLeavers() {
    if (Array.isArray(window.ycLeavers)) {
        return window.ycLeavers.map(x=>({ student_id: x.student_id, status: x.status, end_date: x.end_date }));
    }
    return [];
}

function renderYearCloseUI() {
    const container = document.getElementById('yearCloseContent');
    if (!container) return;
    container.innerHTML = `
      <div class="wizard">
        <div id="yc-step-1" class="yc-step">
          <h4>Step 1: Select Leavers</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2" style="margin-bottom:8px;">
            <label>Class</label>
            <select id="yc-class-select"></select>
            <button class="btn btn-secondary" id="yc-load-roster">Load Students</button>
          </div>
          <div id="yc-roster"></div>
          <div class="wizard-nav">
            <button class="btn btn-primary" id="yc-next-1">Next</button>
          </div>
        </div>
        <div id="yc-step-2" class="yc-step" style="display:none;">
          <h4>Step 2: Choose Promotions</h4>
          <div id="yc-rules"></div>
          <div class="wizard-nav">
            <button class="btn" id="yc-back-2">Back</button>
            <button class="btn btn-primary" id="yc-next-2">Next</button>
          </div>
        </div>
        <div id="yc-step-3" class="yc-step" style="display:none;">
          <h4>Step 3: Preview Next Year</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2" style="margin-bottom:8px;">
            <input id="ycName" placeholder="e.g., 2026-2027">
            <input id="ycStart" type="date">
            <input id="ycEnd" type="date">
          </div>
          <button class="btn btn-secondary" id="yc-generate-preview">Generate Preview</button>
          <div id="yearClosePreview" class="p-2" style="margin-top:8px;"></div>
          <div class="wizard-nav">
            <button class="btn" id="yc-back-3">Back</button>
            <button class="btn btn-primary" id="yc-next-3">Next</button>
          </div>
        </div>
        <div id="yc-step-4" class="yc-step" style="display:none;">
          <h4>Step 4: Confirm Year Close</h4>
          <p>Please confirm to create new enrollments and update leavers.</p>
          <div class="wizard-nav">
            <button class="btn" id="yc-back-4">Back</button>
            <button class="btn btn-primary" id="yc-confirm">Confirm</button>
          </div>
        </div>
      </div>`;

    populateYcClassDropdown();
    const loadBtn = document.getElementById('yc-load-roster');
    if (loadBtn) loadBtn.onclick = loadYcRoster;
    const n1 = document.getElementById('yc-next-1');
    if (n1) n1.onclick = () => showYcStep(2);
    const b2 = document.getElementById('yc-back-2');
    if (b2) b2.onclick = () => showYcStep(1);
    const n2 = document.getElementById('yc-next-2');
    if (n2) n2.onclick = () => showYcStep(3);
    const b3 = document.getElementById('yc-back-3');
    if (b3) b3.onclick = () => showYcStep(2);
    const gen = document.getElementById('yc-generate-preview');
    if (gen) gen.onclick = yearClosePreview;
    const n3 = document.getElementById('yc-next-3');
    if (n3) n3.onclick = () => showYcStep(4);
    const b4 = document.getElementById('yc-back-4');
    if (b4) b4.onclick = () => showYcStep(3);
    const c4 = document.getElementById('yc-confirm');
    if (c4) c4.onclick = yearCloseConfirm;

    renderPromotionRulesUI();
}

function showYcStep(n){
    ['yc-step-1','yc-step-2','yc-step-3','yc-step-4'].forEach((id,idx)=>{
        const el = document.getElementById(id);
        if (el) el.style.display = (idx === (n-1)) ? 'block' : 'none';
    });
}

function populateYcClassDropdown(){
    const sel = document.getElementById('yc-class-select');
    if (!sel) return;
    const classes = (window.classes && window.classes.length ? window.classes : []);
    sel.innerHTML = '<option value="">Select Class</option>' + classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadYcRoster(){
    const sel = document.getElementById('yc-class-select');
    const classId = sel ? sel.value : '';
    const rosterEl = document.getElementById('yc-roster');
    if (!classId || !rosterEl) return;
    rosterEl.innerHTML = '<div class="help-text">Loading...</div>';
    try {
        const res = await fetch(`/api/academic-years/current/classes/${classId}/students`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load students');
        renderYcRosterTable(data);
    } catch (e) {
        rosterEl.innerHTML = `<div class="error-text">${e.message}</div>`;
    }
}

function renderYcRosterTable(rows){
    const rosterEl = document.getElementById('yc-roster');
    if (!rosterEl) return;
    if (!rows || rows.length === 0){
        rosterEl.innerHTML = '<p class="help-text">No students found for this class.</p>';
        return;
    }
    const thead = `<tr><th>Leave?</th><th>Student</th><th>Class</th><th>Roll</th><th>Status</th></tr>`;
    const tbody = rows.map(r=>{
        return `<tr>
            <td><input type="checkbox" data-enroll-id="${r.enrollment_id}" data-student-id="${r.student_id}" class="yc-leaver-chk"></td>
            <td>${r.student_name}</td>
            <td>${r.class_name}</td>
            <td>${r.roll_number || ''}</td>
            <td>${r.status}</td>
        </tr>`;
    }).join('');
    rosterEl.innerHTML = `<table class="table">${thead}${tbody}</table>
      <div style="margin-top:8px;">
        <label>Leaver Status:</label>
        <select id="yc-leaver-status"><option value="transferred">Transferred</option><option value="graduated">Graduated</option></select>
        <input id="yc-leaver-end" type="date" placeholder="End Date">
        <button class="btn" onclick="applyLeaversSelection()">Apply to Selected</button>
      </div>`;
}

function applyLeaversSelection(){
    const statusSel = document.getElementById('yc-leaver-status');
    const endInput = document.getElementById('yc-leaver-end');
    const status = statusSel ? statusSel.value : '';
    const endDate = endInput ? endInput.value : '';
    const checks = Array.from(document.querySelectorAll('.yc-leaver-chk'));
    const marked = checks.filter(c=>c.checked).map(c=>({ enrollment_id: parseInt(c.getAttribute('data-enroll-id')), student_id: c.getAttribute('data-student-id') }));
    window.ycLeavers = (window.ycLeavers || []).filter(x=>!marked.some(m=>m.enrollment_id===x.enrollment_id));
    marked.forEach(m=>window.ycLeavers.push({ enrollment_id: m.enrollment_id, student_id: m.student_id, status, end_date: endDate }));
    showModal('Success', `Marked ${marked.length} students as ${status}.`);
}

function renderPromotionRulesUI(){
    const rulesEl = document.getElementById('yc-rules');
    if (!rulesEl) return;
    const classes = window.classes || [];
    const options = classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
    rulesEl.innerHTML = classes.map(c=>`<div class="yc-rule-row" data-from="${c.id}" style="margin-bottom:6px;">
        <span>${c.name}</span>
        <span style=\"margin:0 6px;\">→</span>
        <select class="yc-to"><option value="${c.id}">${c.name} (Stay)</option>${options}</select>
    </div>`).join('');
}

function renderYearClosePreview(data){
    const el = document.getElementById('yearClosePreview');
    if (!el) return;
    const rows = Array.isArray(data.promotions) ? data.promotions : [];
    const table = rows.length ? `<table class="table"><tr><th>Student</th><th>Old Class</th><th>New Class</th><th>Roll No</th></tr>${rows.map(r=>`<tr><td>${r.student_name || r.student_id}</td><td>${r.old_class_name || r.old_class_id}</td><td>${r.new_class_name || r.new_class_id}</td><td>${r.roll_number || ''}</td></tr>`).join('')}</table>` : '<div class="help-text">No promotions based on current rules.</div>';
    el.innerHTML = `<div class="bg-white border rounded p-3 text-sm">
      <div><strong>Current Year:</strong> ${data.current_year ? data.current_year.name : '-'}</div>
      <div><strong>Overlaps:</strong> ${data.overlaps && data.overlaps.length ? data.overlaps.map(o=>o.name).join(', ') : 'None'}</div>
      <div><strong>Counts:</strong> Enrolled: ${data.counts.enrolled_now}, Leavers: ${data.counts.leavers}, Promotions: ${data.counts.promotions}</div>
      <div style="margin-top:8px;">${table}</div>
    </div>`;
}

function renderAcademicYears() {
    const list = document.getElementById('academicYearsList');
    const badge = document.getElementById('currentYearBadge');
    const badgeText = document.getElementById('currentYearName');

    if (badge) {
        if (window.currentAcademicYear && window.currentAcademicYear.name) {
            badge.style.display = 'block';
            badgeText.textContent = window.currentAcademicYear.name;
        } else {
            badge.style.display = 'none';
        }
    }

    if (!list) return;

    const years = window.academicYears || [];
    if (years.length === 0) {
        list.innerHTML = '<p>No academic years added yet.</p>';
        return;
    }

    list.innerHTML = years.map(y => {
        const isCurrent = !!y.is_current;
        return `
            <div class="list-item">
                <div class="list-item-info">
                    <strong>${y.name}</strong>
                    <span>${y.start_date} → ${y.end_date}</span>
                    ${isCurrent ? '<span class="badge" style="margin-left:8px;background:#e8f5e8;color:#27ae60;padding:2px 6px;border-radius:4px;">Current</span>' : ''}
                </div>
                <div>
                    ${isCurrent ? '' : `<button class="btn btn-secondary btn-small" onclick="setCurrentAcademicYear(${y.id})"><i class="fas fa-flag"></i> Set as Current</button>`}
                </div>
            </div>
        `;
    }).join('');
}

async function createAcademicYear() {
    const nameInput = document.getElementById('ayName');
    const startInput = document.getElementById('ayStart');
    const endInput = document.getElementById('ayEnd');
    const isCurrentInput = document.getElementById('ayIsCurrent');

    const name = (nameInput?.value || '').trim();
    const start_date = startInput?.value || '';
    const end_date = endInput?.value || '';
    const is_current = !!(isCurrentInput && isCurrentInput.checked);

    if (!name || !start_date || !end_date) {
        showModal('Error', 'Please provide name, start and end dates');
        return;
    }
    if (new Date(start_date) > new Date(end_date)) {
        showModal('Error', 'Start date cannot be after end date');
        return;
    }

    try {
        const res = await fetch('/api/academic-years', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, start_date, end_date, is_current })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create academic year');
        // Clear inputs
        if (nameInput) nameInput.value = '';
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';
        if (isCurrentInput) isCurrentInput.checked = false;
        await fetchAcademicYears();
        showModal('Success', 'Academic year created');
    } catch (e) {
        console.error(e);
        showModal('Error', e.message || 'Failed to create academic year');
    }
}

async function setCurrentAcademicYear(id) {
    try {
        const res = await fetch(`/api/academic-years/${id}/set-current`, { method: 'PUT' });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to set current year');
        }
        await fetchAcademicYears();
        showModal('Success', 'Set as current academic year');
    } catch (e) {
        console.error(e);
        showModal('Error', e.message || 'Failed to set current year');
    }
}

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
    // Load academic years
    fetchAcademicYears();
    // Render Year Close Wizard UI immediately (will update class options later)
    try { renderYearCloseUI(); } catch (e) { /* ignore */ }
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
    , fetchAcademicYears
    , renderAcademicYears
    , createAcademicYear
    , setCurrentAcademicYear
    , applyLeaversSelection
    , showYcStep
    , populateYcClassDropdown
    , loadYcRoster
    , renderYcRosterTable
    , renderPromotionRulesUI
    , renderYearCloseUI
    , yearClosePreview
    , yearCloseConfirm
}
