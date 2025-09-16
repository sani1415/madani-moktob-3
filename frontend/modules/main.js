// Import all modules as namespaces to avoid naming conflicts
import * as State from './state.js';
import * as Utils from './utils.js';
import * as Dashboard from './dashboard.js';
import * as Registration from './registration.js';
import * as Attendance from './attendance.js';
import * as Reports from './reports.js';
import * as Misc from './misc.js';
import * as Calendar from './calendar.js';
import * as Settings from './settings.js';
import * as Hijri from './hijri.js';
import { t, changeLanguage, initializeLanguage, updateAllTexts } from '../translations.js';

// Debug: Check if Settings module is loaded
console.log('🔍 Settings module loaded:', Settings);
    console.log('🔍 Settings.loadBooks:', Settings.loadBooks);
    console.log('🔍 Settings.updateBookDropdowns:', Settings.updateBookDropdowns);
    console.log('🔍 typeof Settings.loadBooks:', typeof Settings.loadBooks);
    console.log('🔍 typeof Settings.updateBookDropdowns:', typeof Settings.updateBookDropdowns);

// Expose translation function globally
window.t = t;
window.changeLanguage = changeLanguage;
window.initializeLanguage = initializeLanguage;
window.updateAllTexts = updateAllTexts;

// Expose all functions to global scope for HTML onclick handlers
// This is necessary because the HTML uses onclick handlers that expect global functions
// while the code is organized in ES6 modules

// Navigation functions
window.showSection = Misc.showSection;
window.openSettingsTab = Misc.openSettingsTab;

// Registration functions
window.hideStudentRegistrationForm = Registration.hideStudentRegistrationForm;
window.displayStudentsList = Registration.displayStudentsList;
window.showStudentRegistrationForm = Registration.showStudentRegistrationForm;
window.editStudent = Registration.editStudent;
window.deleteStudent = Registration.deleteStudent;
window.updateStudentStatus = Registration.updateStudentStatus;
window.updateStudentStatusWithBackdating = Registration.updateStudentStatusWithBackdating;
window.confirmBackdating = Registration.confirmBackdating;
window.closeBackdatingModal = Registration.closeBackdatingModal;
window.showInactiveStudentsList = Registration.showInactiveStudentsList; // <-- ADD THIS LINE
window.updateStudentFilter = Registration.updateStudentFilter;
window.clearStudentFilters = Registration.clearStudentFilters;

// Attendance functions
window.markAllPresent = Attendance.markAllPresent;
window.showMarkAllAbsentModal = Attendance.showMarkAllAbsentModal;
window.markAllNeutral = Attendance.markAllNeutral;
window.copyPreviousDayAttendance = Attendance.copyPreviousDayAttendance;
window.saveAttendance = Attendance.saveAttendance;
window.toggleAttendance = Attendance.toggleAttendance;
window.updateAbsenceReason = Attendance.updateAbsenceReason;
window.showAttendanceCalendar = Misc.showAttendanceCalendar;
window.loadAttendanceForDate = Attendance.loadAttendanceForDate;
window.showStudentDetail = Attendance.showStudentDetail;
window.updateDateInputMax = Attendance.updateDateInputMax;

window.populateAttendanceClassFilter = Attendance.populateAttendanceClassFilter;
window.refreshAttendanceClassFilter = Attendance.refreshAttendanceClassFilter;
window.resetAttendanceClassFilter = Attendance.resetAttendanceClassFilter;
window.updateFilterStatus = Attendance.updateFilterStatus;

// Report functions
window.generateReport = Misc.generateReport;
window.generateFromBeginningReport = Misc.generateFromBeginningReport;

window.addHijriToReports = Misc.addHijriToReports;

// Settings functions
window.showAddBookForm = Settings.showAddBookForm;
window.showDeleteAllEducationModal = Settings.showDeleteAllEducationModal;
window.deleteAllEducationData = Settings.deleteAllEducationData;
window.hideAddBookForm = Settings.hideAddBookForm;
window.closeEditBookModal = Settings.closeEditBookModal;
window.initializeAcademicYearStart = Settings.initializeAcademicYearStart;
window.saveAcademicYearStart = Settings.saveAcademicYearStart;
window.clearAcademicYearStart = Settings.clearAcademicYearStart;
window.saveAppName = Settings.saveAppName;
window.displayAcademicYearStart = Settings.displayAcademicYearStart;
window.updateDateRestrictions = Settings.updateDateRestrictions;
window.clearDateRestrictions = Settings.clearDateRestrictions;
window.addClass = Settings.addClass;
window.addBook = Settings.addBook;
window.addHoliday = Settings.addHoliday;
window.deleteHoliday = Settings.deleteHoliday;
window.getHolidayName = Settings.getHolidayName;
window.showResetAttendanceModal = Attendance.showResetAttendanceModal;
window.displayClasses = Settings.displayClasses;
window.displayHolidays = Settings.displayHolidays;
window.loadBooks = Settings.loadBooks;
window.updateClassFilterOptions = Registration.updateClassFilterOptions;
window.updateClassDropdowns = Settings.updateClassDropdowns;

// Dashboard functions
window.refreshAttendanceData = Dashboard.refreshAttendanceData;
window.refreshStudentsData = refreshStudentsData;
window.updateBookDropdowns = Settings.updateBookDropdowns;

// Debug: Check if functions are properly exposed
console.log('🔍 After exposing to window:');
console.log('🔍 window.loadBooks:', window.loadBooks);
console.log('🔍 window.updateBookDropdowns:', window.updateBookDropdowns);
console.log('🔍 typeof window.loadBooks:', typeof window.loadBooks);
console.log('🔍 typeof window.updateBookDropdowns:', typeof window.updateBookDropdowns);
window.isHoliday = Settings.isHoliday;
window.editClass = Settings.editClass;
window.deleteClass = Settings.deleteClass;
window.editBook = Settings.editBook;
window.deleteBook = Settings.deleteBook;
// Note: Education Progress functions removed - Progress tracking is now handled in Teachers Corner

// User Management functions
window.loadUsers = Settings.loadUsers;
window.showCreateUserModal = Settings.showCreateUserModal;
window.closeCreateUserModal = Settings.closeCreateUserModal;
window.editUser = Settings.editUser;
window.closeEditUserModal = Settings.closeEditUserModal;
window.deleteUser = Settings.deleteUser;
window.resetUserPassword = Settings.resetUserPassword;
window.refreshUsersList = Settings.refreshUsersList;

// Data Management functions
window.showResetStudentsModal = Settings.showResetStudentsModal;
window.showResetScoresModal = Settings.showResetScoresModal;
window.showResetProgressModal = Settings.showResetProgressModal;
window.showResetTodayAttendanceModal = Settings.showResetTodayAttendanceModal;
window.showResetBooksModal = Settings.showResetBooksModal;
window.showResetClassesModal = Settings.showResetClassesModal;
window.showResetLogsModal = Settings.showResetLogsModal;
window.showResetUsersModal = Settings.showResetUsersModal;
window.showResetSettingsModal = Settings.showResetSettingsModal;
window.showCompleteResetModal = Settings.showCompleteResetModal;
window.showBackupModal = Settings.showBackupModal;
window.showBulkImport = Settings.showBulkImport;
window.hideBulkImport = Settings.hideBulkImport;
window.downloadAllStudentsCSV = Settings.downloadAllStudentsCSV;
window.createBackup = Settings.createBackup;
window.processExcelFile = Settings.processExcelFile;
window.handleFileSelect = Settings.handleFileSelect;
window.updateUploadZone = Settings.updateUploadZone;
window.resetUploadZone = Settings.resetUploadZone;

// Data Management confirmation functions
window.confirmResetStudents = Settings.confirmResetStudents;
window.confirmResetScores = Settings.confirmResetScores;
window.confirmResetProgress = Settings.confirmResetProgress;
window.confirmResetTodayAttendance = Settings.confirmResetTodayAttendance;
window.confirmResetBooks = Settings.confirmResetBooks;
window.confirmResetClasses = Settings.confirmResetClasses;
window.confirmResetLogs = Settings.confirmResetLogs;
window.confirmResetUsers = Settings.confirmResetUsers;
window.confirmResetSettings = Settings.confirmResetSettings;
window.confirmCompleteReset = Settings.confirmCompleteReset;

// Note: testAddBookProgress function removed - Education Progress is now handled in Teachers Corner

// Modal functions
window.showModal = Misc.showModal;
window.closeModal = Misc.closeModal;
window.closeBulkAbsentModal = Attendance.closeBulkAbsentModal;
window.saveData = Misc.saveData;
window.confirmMarkAllAbsent = Attendance.confirmMarkAllAbsent;
window.closeResetAttendanceModal = Attendance.closeResetAttendanceModal;
window.confirmResetAttendance = Attendance.confirmResetAttendance;
window.cleanupStickyAttendanceData = Attendance.cleanupStickyAttendanceData;
window.closeBookManagementEditModal = Settings.closeBookManagementEditModal;

// Mobile menu
window.toggleMobileMenu = Misc.toggleMobileMenu;

// Calendar functions
window.testCalendarRefresh = Misc.testCalendarRefresh;
window.forceRefreshAttendanceCalendar = Calendar.forceRefreshAttendanceCalendar;
window.refreshAttendanceCalendarIfVisible = Calendar.refreshAttendanceCalendarIfVisible;
window.debugSavedDates = Misc.debugSavedDates;
window.generateCalendarDays = Calendar.generateCalendarDays;
window.generateAttendanceSummary = Calendar.generateAttendanceSummary;
window.selectCalendarDate = Calendar.selectCalendarDate;

// Hijri functions
window.updateDashboardWithHijri = Hijri.updateDashboardWithHijri;
window.updateAttendancePageHijri = Hijri.updateAttendancePageHijri;
window.initializeHijriSettings = Hijri.initializeHijriSettings;
window.updateHijriAdjustment = Hijri.updateHijriAdjustment;
window.updateHijriPreview = Hijri.updateHijriPreview;
window.navigateCalendar = Calendar.navigateCalendar;
window.canNavigateToMonth = Calendar.canNavigateToMonth;
window.changeCalendarMonth = Calendar.changeCalendarMonth;
window.changeCalendarYear = Calendar.changeCalendarYear;
window.refreshCalendar = Calendar.refreshCalendar;
window.goToCurrentMonth = Calendar.goToCurrentMonth;

// Dashboard functions
window.updateDashboard = Dashboard.updateDashboard;
window.updateTodayOverview = Dashboard.updateTodayOverview;
window.updateClassWiseStats = Dashboard.updateClassWiseStats;
window.generateAttendanceTrackingCalendar = Dashboard.generateAttendanceTrackingCalendar;
window.updatePerformanceMetrics = Dashboard.updatePerformanceMetrics;
window.updateMainDashboardAlerts = Dashboard.updateMainDashboardAlerts;
window.showLowScoreStudents = Dashboard.showLowScoreStudents;
window.showAbsentStudents = Dashboard.showAbsentStudents;
window.toggleAlertDetails = Dashboard.toggleAlertDetails;
window.renderAlertDetails = Dashboard.renderAlertDetails;
window.showTeachersCornerForClass = Dashboard.showTeachersCornerForClass;
window.showStudentLogsModal = Dashboard.showStudentLogsModal;

// Make state variables globally accessible
window.students = State.students;
// window.classes will be loaded from database in initializeApp()
window.attendance = State.attendance;
window.holidays = State.holidays;
window.academicYearStartDate = State.academicYearStartDate;
window.savedAttendanceDates = State.savedAttendanceDates;

// Debug: Check state variables
// console.log('🔍 State.classes:', State.classes); // Removed - classes now loaded from database
console.log('🔍 window.classes:', window.classes);
console.log('🔍 classes length:', window.classes ? window.classes.length : 'undefined');

// Make calendar variables globally accessible
window.currentCalendarMonth = Misc.currentCalendarMonth;
window.currentCalendarYear = Misc.currentCalendarYear;

// Make utility functions globally accessible
window.formatDate = Utils.formatDate;
window.getClassNumber = Utils.getClassNumber;
window.parseRollNumber = Utils.parseRollNumber;
window.convertBengaliToEnglishNumbers = Utils.convertBengaliToEnglishNumbers;
window.bengaliToEnglish = Utils.bengaliToEnglish;
window.englishNumber = Utils.englishNumber;
window.date = Utils.date;
window.match = Utils.match;
window.bengaliClassMap = Utils.bengaliClassMap;

// Make translation function globally accessible
window.t = t;

// Make currentUser globally accessible (will be set by authentication check)
window.currentUser = null;

// Add a function to refresh students data from server
async function refreshStudentsData() {
    try {
        console.log('🔄 Refreshing students data from server...');
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            // Update the global window variables directly
            window.students = studentsData;
            console.log(`✅ Students data refreshed successfully - ${studentsData.length} students`);
            return true;
        } else {
            console.error('❌ Failed to refresh students data');
            return false;
        }
    } catch (error) {
        console.error('❌ Error refreshing students data:', error);
        return false;
    }
}

// Initialize application data from database
async function initializeApp() {
    try {
        console.log('🔄 Initializing application data...');
        
        // Wait for authentication check first
        if (!window.currentUser) {
            console.log('⏳ Waiting for authentication check...');
            let attempts = 0;
            while (!window.currentUser && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        // Load data based on user role
        if (window.currentUser && window.currentUser.role === 'admin') {
            // Admin users: load all data
            console.log('👤 Admin user detected, loading all data');
            
            // Load students from database
            const studentsResponse = await fetch('/api/students');
            if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                // Update the global window variables directly
                window.students = studentsData;
                console.log(`✅ Loaded ${studentsData.length} students from database`);
            }
            
            // Load attendance from database
            const attendanceResponse = await fetch('/api/attendance');
            if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                // Update the global window variables directly
                window.attendance = attendanceData;
                
                // Populate savedAttendanceDates with dates that have attendance data
                if (attendanceData && typeof attendanceData === 'object') {
                    const savedDates = Object.keys(attendanceData).filter(date => {
                        const dateAttendance = attendanceData[date];
                        return dateAttendance && typeof dateAttendance === 'object' && Object.keys(dateAttendance).length > 0;
                    });
                    
                    // Clear and populate the savedAttendanceDates Set
                    window.savedAttendanceDates.clear();
                    savedDates.forEach(date => window.savedAttendanceDates.add(date));
                    
                    console.log(`✅ Loaded attendance data from database`);
                    console.log(`✅ Populated savedAttendanceDates with ${savedDates.length} dates:`, savedDates);
                }
            }
            
            // Load holidays from database
            const holidaysResponse = await fetch('/api/holidays');
            if (holidaysResponse.ok) {
                const holidaysData = await holidaysResponse.json();
                // Update the global window variables directly
                window.holidays = holidaysData;
                console.log(`✅ Loaded ${holidaysData.length} holidays from database`);
            }
        } else if (window.currentUser && window.currentUser.role === 'user' && window.currentUser.class_name) {
            // Regular users: load only their class data
            console.log(`👤 Regular user detected, loading data for class: ${window.currentUser.class_name}`);
            
            // Load students for their assigned class only
            const studentsResponse = await fetch('/api/students');
            if (studentsResponse.ok) {
                const allStudentsData = await studentsResponse.json();
                // Filter students to only their assigned class
                const classStudents = allStudentsData.filter(student => 
                    student.class === window.currentUser.class_name && student.status === 'active'
                );
                window.students = classStudents;
                console.log(`✅ Loaded ${classStudents.length} students for class ${window.currentUser.class_name}`);
            }
            
            // Load attendance data (will be filtered later by Teachers Corner)
            const attendanceResponse = await fetch('/api/attendance');
            if (attendanceResponse.ok) {
                const attendanceData = await attendanceResponse.json();
                window.attendance = attendanceData;
                
                // Populate savedAttendanceDates with dates that have attendance data
                if (attendanceData && typeof attendanceData === 'object') {
                    const savedDates = Object.keys(attendanceData).filter(date => {
                        const dateAttendance = attendanceData[date];
                        return dateAttendance && typeof dateAttendance === 'object' && Object.keys(dateAttendance).length > 0;
                    });
                    
                    // Clear and populate the savedAttendanceDates Set
                    window.savedAttendanceDates.clear();
                    savedDates.forEach(date => window.savedAttendanceDates.add(date));
                    
                    console.log(`✅ Loaded attendance data from database`);
                }
            }
            
            // Initialize holidays as empty for regular users
            window.holidays = [];
            window.savedAttendanceDates = window.savedAttendanceDates || new Set();
        } else {
            console.log('👤 User detected but no class assigned, initializing empty data');
            // Initialize empty data
            window.students = [];
            window.attendance = {};
            window.holidays = [];
            window.savedAttendanceDates = new Set();
        }
        
        // Load classes from database
        const classesResponse = await fetch('/api/classes');
        if (classesResponse.ok) {
            const classesData = await classesResponse.json();
            // Update the global window variables directly
            window.classes = classesData; // This will be an array of objects like [{id: 1, name: '...'}, ...]
            console.log(`✅ Loaded ${classesData.length} classes from database`);
        }
        
        // Load education progress and books from database
        // Note: loadEducationProgress removed - Education Progress is now handled in Teachers Corner
        
        if (typeof loadBooks === 'function') {
            await loadBooks();
            console.log('✅ Loaded books from database');
        }
        
        // Only initialize admin-specific features for admin users
        if (window.currentUser && window.currentUser.role === 'admin') {
            // Update class dropdowns after loading data
            if (typeof updateClassDropdowns === 'function') {
                updateClassDropdowns();
            }
            
            // Populate attendance class filter after classes are loaded
            if (typeof Attendance.populateAttendanceClassFilter === 'function') {
                Attendance.populateAttendanceClassFilter();
            }
            
            // Update book dropdowns after loading books
            if (typeof updateBookDropdowns === 'function') {
                updateBookDropdowns();
            }
            
            // Update dashboard - ONLY for admin users
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            
            // Initialize academic year start date
            if (typeof initializeAcademicYearStart === 'function') {
                initializeAcademicYearStart();
            }
            
            // Initialize Hijri settings
            if (typeof initializeHijriSettings === 'function') {
                initializeHijriSettings();
            }
        } else {
            console.log('👤 Regular user detected, skipping admin-specific initialization');
        }
        
        // Clean up any auto-applied future attendance data
        if (typeof cleanupStickyAttendanceData === 'function') {
            await cleanupStickyAttendanceData();
        }
        
        // Add event listeners for attendance page
        const attendanceDateInput = document.getElementById('attendanceDate');
        const classFilterInput = document.getElementById('classFilter');
        
        if (attendanceDateInput) {
            attendanceDateInput.addEventListener('change', function() {
                loadAttendanceForDate();
                // Update Hijri date when attendance date changes
                if (typeof updateAttendancePageHijri === 'function') {
                    updateAttendancePageHijri();
                }
            });
        }
        
        if (classFilterInput) {
            classFilterInput.addEventListener('change', function() {
                loadAttendanceForDate();
                // Update filter status immediately after change
                if (typeof updateFilterStatus === 'function') {
                    updateFilterStatus();
                }
            });
        }
        
        // Initialize language system to load app name and other settings
        if (typeof initializeLanguage === 'function') {
            initializeLanguage();
        }
        
        console.log('✅ Application initialization completed');
        
        // Handle URL parameters for student details
        const urlParams = new URLSearchParams(window.location.search);
        const studentId = urlParams.get('student');
        const source = urlParams.get('source');
        
        if (studentId) {
            // Show student detail if student ID is provided in URL
            if (typeof showStudentDetail === 'function') {
                showStudentDetail(studentId, source || 'attendance');
            }
        }
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Teachers Corner Dropdown Functions
function toggleTeachersCornerDropdown() {
    const dropdown = document.getElementById('teachersCornerDropdown');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        populateTeachersCornerDropdown();
    } else {
        dropdown.style.display = 'none';
    }
}

function populateTeachersCornerDropdown() {
    const dropdown = document.getElementById('teachersCornerDropdown');
    
    // Get classes from your existing class data
    let classes = window.classes || [];
    
    // If user is not admin, filter to only their assigned class
    if (window.currentUser && window.currentUser.role === 'user' && window.currentUser.class_name) {
        classes = classes.filter(cls => cls.name === window.currentUser.class_name);
    }
    
    if (classes.length === 0) {
        if (window.currentUser && window.currentUser.role === 'user') {
            dropdown.innerHTML = '<a href="#" style="color: #6c757d; font-style: italic;">No class assigned</a>';
        } else {
            dropdown.innerHTML = '<a href="#" style="color: #6c757d; font-style: italic;">No classes available</a>';
        }
        return;
    }
    
    // Create class options
    const classOptions = classes.map(cls => `
        <a href="#" onclick="openTeachersCornerForClass('${cls.name}')">
            <i class="fas fa-graduation-cap"></i> ${cls.name}
        </a>
    `).join('');
    
    dropdown.innerHTML = classOptions;
}

async function openTeachersCornerForClass(className) {
    console.log(`🚀 Opening Teachers Corner for class: ${className}`);
    
    // Check if showSection is available
    if (typeof showSection !== 'function') {
        console.error('❌ showSection function is not available!');
        console.log('🔍 Available global functions:', Object.keys(window).filter(key => 
            typeof window[key] === 'function' && key.includes('show')
        ));
        console.log('🔍 typeof showSection:', typeof showSection);
        console.log('🔍 window.showSection:', window.showSection);
        
        // Try to wait for it to be available
        let attempts = 0;
        const maxAttempts = 10;
        while (typeof showSection !== 'function' && attempts < maxAttempts) {
            console.log(`⏳ Waiting for showSection to be available... (attempt ${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof showSection !== 'function') {
            console.error('❌ showSection still not available after waiting');
            return;
        }
    }
    
    console.log('🔍 showSection function details:', {
        name: showSection.name,
        toString: showSection.toString().substring(0, 100) + '...',
        isAsync: showSection.constructor.name === 'AsyncFunction'
    });
    
    // Show integrated Teachers Corner section
    try {
        console.log('✅ Calling showSection...');
        console.log('🔍 Before showSection - teachers-corner-section element:', document.getElementById('teachers-corner-section'));
        console.log('🔍 Before showSection - all sections:', Array.from(document.querySelectorAll('.section')).map(s => ({ id: s.id, hasActive: s.classList.contains('active'), display: window.getComputedStyle(s).display })));
        
        await showSection('teachers-corner-section');
        console.log('✅ Teachers Corner section should now be visible');
        
        // Verify the section is actually visible
        const teachersCornerSection = document.getElementById('teachers-corner-section');
        if (teachersCornerSection) {
            console.log('🔍 Section visibility check:', {
                hasActiveClass: teachersCornerSection.classList.contains('active'),
                computedDisplay: window.getComputedStyle(teachersCornerSection).display,
                classes: teachersCornerSection.className,
                styleDisplay: teachersCornerSection.style.display
            });
            
            // Force the section to be visible if it's not
            if (!teachersCornerSection.classList.contains('active')) {
                console.warn('⚠️ Section not active after showSection, forcing activation...');
                teachersCornerSection.classList.add('active');
            }
            
            // Also force display if CSS is not working
            const computedDisplay = window.getComputedStyle(teachersCornerSection).display;
            if (computedDisplay === 'none') {
                console.warn('⚠️ CSS display is still none after showSection, forcing display...');
                teachersCornerSection.style.display = 'block';
            }
        }
        
        // Check all sections after showSection
        console.log('🔍 After showSection - all sections:', Array.from(document.querySelectorAll('.section')).map(s => ({ id: s.id, hasActive: s.classList.contains('active'), display: window.getComputedStyle(s).display })));
        
    } catch (error) {
        console.error('❌ Error showing teachers corner section:', error);
    }
    
    // Function to check if we can proceed
    const canProceed = () => {
        const requiredElements = [
            'class-dashboard-title',
            'class-student-list',
            'class-education-progress',
            'performance-chart',
            'logbook-display'
        ];
        
        // Add comprehensive DOM debugging
        console.log('🔍 DOM Debugging Information:');
        console.log('🔍 document.readyState:', document.readyState);
        console.log('🔍 document.body.children.length:', document.body.children.length);
        console.log('🔍 All sections found:', Array.from(document.querySelectorAll('.section')).map(s => ({ id: s.id, classes: s.className })));
        console.log('🔍 teachers-corner-section element:', document.getElementById('teachers-corner-section'));
        
        // Check if the teachers corner section exists and what's inside it
        const teachersCornerSection = document.getElementById('teachers-corner-section');
        if (teachersCornerSection) {
            console.log('🔍 Teachers corner section content:', {
                innerHTML: teachersCornerSection.innerHTML.substring(0, 200) + '...',
                children: Array.from(teachersCornerSection.children).map(child => ({ 
                    id: child.id, 
                    tagName: child.tagName, 
                    className: child.className 
                }))
            });
            
            // Also check for elements by searching within the section
            console.log('🔍 Searching for elements within teachers corner section:');
            requiredElements.forEach(id => {
                const elementInSection = teachersCornerSection.querySelector(`#${id}`);
                console.log(`  🔍 ${id} in section: ${elementInSection ? 'FOUND' : 'MISSING'}`);
                if (elementInSection) {
                    console.log(`    ✅ Found ${id} within section:`, {
                        tagName: elementInSection.tagName,
                        className: elementInSection.className,
                        textContent: elementInSection.textContent.substring(0, 50) + '...'
                    });
                }
            });
            
            // Check if the section has any content at all
            console.log('🔍 Section content analysis:', {
                hasChildren: teachersCornerSection.children.length > 0,
                childrenCount: teachersCornerSection.children.length,
                textContent: teachersCornerSection.textContent.substring(0, 100) + '...',
                innerHTMLLength: teachersCornerSection.innerHTML.length
            });
        }
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('⚠️ Some required elements not found:', missingElements);
            
            // Add detailed debugging for each required element
            console.log('🔍 Detailed element status:');
            requiredElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    console.log(`  ✅ ${id}: FOUND`, {
                        classes: element.className,
                        computedDisplay: window.getComputedStyle(element).display,
                        styleDisplay: element.style.display,
                        offsetParent: element.offsetParent,
                        clientHeight: element.clientHeight,
                        clientWidth: element.clientWidth
                    });
                } else {
                    console.log(`  ❌ ${id}: MISSING`);
                    
                    // Try to find it by other means
                    const byQuerySelector = document.querySelector(`#${id}`);
                    const byClassName = document.querySelector(`.${id}`);
                    const byTagName = document.querySelector(id);
                    
                    console.log(`    🔍 Search attempts for ${id}:`, {
                        byQuerySelector: !!byQuerySelector,
                        byClassName: !!byClassName,
                        byTagName: !!byTagName
                    });
                }
            });
            
            // Check if the teachers corner section itself is visible
            if (teachersCornerSection) {
                console.log('🔍 Teachers corner section status:', {
                    classes: teachersCornerSection.className,
                    computedDisplay: window.getComputedStyle(teachersCornerSection).display,
                    styleDisplay: teachersCornerSection.style.display,
                    offsetParent: teachersCornerSection.offsetParent,
                    clientHeight: teachersCornerSection.clientHeight,
                    clientWidth: teachersCornerSection.clientWidth
                });
            }
            
            return false;
        }
        
        if (typeof window.showClassDashboard !== 'function') {
            console.warn('⚠️ showClassDashboard function not available yet');
            return false;
        }
        
        console.log('✅ All required elements and functions found');
        return true;
    };
    
    // Function to attempt loading dashboard
    const attemptLoadDashboard = (attempt = 1, maxAttempts = 5) => {
        console.log(`🔄 Attempt ${attempt} to load dashboard for class: ${className}`);
        
        if (canProceed()) {
            try {
                console.log('✅ Proceeding with dashboard loading...');
                window.showClassDashboard(className);
                return;
            } catch (error) {
                console.error('❌ Error calling showClassDashboard:', error);
            }
        }
        
        if (attempt < maxAttempts) {
            const delay = Math.min(200 * attempt, 1000); // Progressive delay: 200ms, 400ms, 600ms, 800ms, 1000ms
            console.log(`⏳ Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
            setTimeout(() => attemptLoadDashboard(attempt + 1, maxAttempts), delay);
        } else {
            console.error('❌ Failed to load dashboard after maximum attempts');
            // Show user-friendly error message
            const dashboardTitle = document.getElementById('class-dashboard-title');
            if (dashboardTitle) {
                dashboardTitle.innerHTML = `
                    <div class="text-center p-8">
                        <h2 class="text-2xl font-bold mb-4 text-red-600">লোডিং সমস্যা</h2>
                        <p class="text-gray-600 mb-4">ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।</p>
                        <button onclick="openTeachersCornerForClass('${className}')" class="btn-primary text-white px-4 py-2 rounded-md">
                            আবার চেষ্টা করুন
                        </button>
                    </div>
                `;
            }
        }
    };
    
    // Start the loading process with initial delay
    setTimeout(() => attemptLoadDashboard(1), 100);
    
    // Close the dropdown
    const dropdown = document.getElementById('teachersCornerDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('teachersCornerDropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    
    if (dropdown && !dropdown.contains(event.target) && !dropdownToggle.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Expose Teachers Corner functions globally
window.toggleTeachersCornerDropdown = toggleTeachersCornerDropdown;
window.populateTeachersCornerDropdown = populateTeachersCornerDropdown;
window.openTeachersCornerForClass = openTeachersCornerForClass;

// Alert Settings Functions
async function loadAlertSettings() {
    try {
        const response = await fetch('/api/settings/alertConfig');
        if (response.ok) {
            const data = await response.json();
            const config = JSON.parse(data.value || '{}');
            
            // Update input fields with saved values
            const lowScoreInput = document.getElementById('lowScoreThreshold');
            const criticalScoreInput = document.getElementById('criticalScoreThreshold');
            const lowClassAverageInput = document.getElementById('lowClassAverageThreshold');
            
            if (lowScoreInput) lowScoreInput.value = config.LOW_SCORE_THRESHOLD || 60;
            if (criticalScoreInput) criticalScoreInput.value = config.CRITICAL_SCORE_THRESHOLD || 50;
            if (lowClassAverageInput) lowClassAverageInput.value = config.LOW_CLASS_AVERAGE_THRESHOLD || 70;
        } else {
            // Fallback to localStorage if database fails
            const saved = localStorage.getItem('alertConfig');
            if (saved) {
                const config = JSON.parse(saved);
                const lowScoreInput = document.getElementById('lowScoreThreshold');
                const criticalScoreInput = document.getElementById('criticalScoreThreshold');
                const lowClassAverageInput = document.getElementById('lowClassAverageThreshold');
                
                if (lowScoreInput) lowScoreInput.value = config.LOW_SCORE_THRESHOLD || 60;
                if (criticalScoreInput) criticalScoreInput.value = config.CRITICAL_SCORE_THRESHOLD || 50;
                if (lowClassAverageInput) lowClassAverageInput.value = config.LOW_CLASS_AVERAGE_THRESHOLD || 70;
            }
        }
    } catch (error) {
        console.error('Error loading alert config:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('alertConfig');
        if (saved) {
            const config = JSON.parse(saved);
            const lowScoreInput = document.getElementById('lowScoreThreshold');
            const criticalScoreInput = document.getElementById('criticalScoreThreshold');
            const lowClassAverageInput = document.getElementById('lowClassAverageThreshold');
            
            if (lowScoreInput) lowScoreInput.value = config.LOW_SCORE_THRESHOLD || 60;
            if (criticalScoreInput) criticalScoreInput.value = config.CRITICAL_SCORE_THRESHOLD || 50;
            if (lowClassAverageInput) lowClassAverageInput.value = config.LOW_CLASS_AVERAGE_THRESHOLD || 70;
        }
    }
}

async function saveAlertThreshold() {
    const lowScoreThreshold = parseInt(document.getElementById('lowScoreThreshold').value) || 60;
    const criticalScoreThreshold = parseInt(document.getElementById('criticalScoreThreshold').value) || 50;
    const lowClassAverageThreshold = parseInt(document.getElementById('lowClassAverageThreshold').value) || 70;
    
    const config = {
        LOW_SCORE_THRESHOLD: lowScoreThreshold,
        CRITICAL_SCORE_THRESHOLD: criticalScoreThreshold,
        LOW_CLASS_AVERAGE_THRESHOLD: lowClassAverageThreshold
    };
    
    try {
        const response = await fetch('/api/settings/alertConfig', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: JSON.stringify(config),
                description: 'Alert configuration thresholds'
            })
        });
        
        if (response.ok) {
            // Also save to localStorage as backup
            localStorage.setItem('alertConfig', JSON.stringify(config));
            
            // Update global ALERT_CONFIG if it exists
            if (window.ALERT_CONFIG) {
                window.ALERT_CONFIG.LOW_SCORE_THRESHOLD = lowScoreThreshold;
                window.ALERT_CONFIG.CRITICAL_SCORE_THRESHOLD = criticalScoreThreshold;
                window.ALERT_CONFIG.LOW_CLASS_AVERAGE_THRESHOLD = lowClassAverageThreshold;
            }
            
            // Show success message
            showModal('Success', 'Alert thresholds saved successfully!');
            
            // Refresh alerts if dashboard is open
            if (typeof window.renderDashboardAlerts === 'function' && window.currentClass) {
                const activeStudents = window.getActiveStudentsForClass ? window.getActiveStudentsForClass(window.currentClass) : [];
                window.renderDashboardAlerts(activeStudents);
            }
        } else {
            console.error('Failed to save alert config to database');
            // Fallback to localStorage only
            localStorage.setItem('alertConfig', JSON.stringify(config));
            showModal('Warning', 'Alert thresholds saved locally!');
        }
    } catch (error) {
        console.error('Error saving alert config:', error);
        // Fallback to localStorage only
        localStorage.setItem('alertConfig', JSON.stringify(config));
        showModal('Warning', 'Alert thresholds saved locally!');
    }
}

// Load current app name into the input field
async function loadAppName() {
    try {
        const response = await fetch('/api/settings/appName');
        if (response.ok) {
            const data = await response.json();
            const appNameInput = document.getElementById('appNameInput');
            if (appNameInput && data.value) {
                appNameInput.value = data.value;
            }
        } else {
            // Fallback to localStorage
            const savedName = localStorage.getItem('madaniMaktabAppName');
            const appNameInput = document.getElementById('appNameInput');
            if (appNameInput && savedName) {
                appNameInput.value = savedName;
            }
        }
    } catch (error) {
        console.error('Error loading app name:', error);
        // Fallback to localStorage
        const savedName = localStorage.getItem('madaniMaktabAppName');
        const appNameInput = document.getElementById('appNameInput');
        if (appNameInput && savedName) {
            appNameInput.value = savedName;
        }
    }
}

// Load alert settings when settings tab is opened
function loadSettingsData() {
    loadAlertSettings();
    loadAppName();
}

// Make functions globally accessible
window.loadAlertSettings = loadAlertSettings;
window.saveAlertThreshold = saveAlertThreshold;
window.loadSettingsData = loadSettingsData;
window.updateMainDashboardAlerts = updateMainDashboardAlerts;
window.showLowScoreStudents = showLowScoreStudents;