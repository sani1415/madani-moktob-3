// ===== EVENT LISTENERS =====
// Consolidated event listeners for all application interactions

document.addEventListener('DOMContentLoaded', function() {
    // Book Management Event Listeners
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addBookProgress();
        });
    }
    
    // Add event listener for edit book form
    const editBookForm = document.getElementById('editBookForm');
    if (editBookForm) {
        editBookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateBookDetails();
        });
    }
    
    // Book Management Edit Form
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
    
    // Reset Confirmation Input
    const confirmationInput = document.getElementById('resetConfirmationInput');
    if (confirmationInput) {
        confirmationInput.addEventListener('input', function() {
            const confirmBtn = document.getElementById('confirmResetBtn');
            const inputValue = this.value.trim().toUpperCase();
            confirmBtn.disabled = inputValue !== 'RESET';
        });
    }
});

// Modal close when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
} 