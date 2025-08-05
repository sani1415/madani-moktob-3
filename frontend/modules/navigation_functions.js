export async function showSection(sectionId, event) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav link
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Close mobile menu on mobile devices
    const navList = document.getElementById('navList');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    if (window.innerWidth <= 768) {
        navList.classList.remove('active');
        toggleButton.className = 'fas fa-bars';
    }
    
    // Update content based on section
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'attendance') {
        await loadAttendanceForDate();
    } else if (sectionId === 'registration') {
        displayStudentsList();
        // Show student list by default, hide form
        const studentsListContainer = document.getElementById('studentsListContainer');
        const studentRegistrationForm = document.getElementById('studentRegistrationForm');
        if (studentsListContainer && studentRegistrationForm) {
            studentsListContainer.style.display = 'block';
            studentRegistrationForm.style.display = 'none';
        }
    } else if (sectionId === 'education') {
        await loadEducationProgress();
    } else if (sectionId === 'settings') {
        displayClasses();
        displayHolidays();
        await loadBooks(); // Load books when settings section is shown
    }
}
