// Translation data for the Madani Maktab application
const translations = {
    en: {
        // Header
        appTitle: "Madani Maktab",
        appSubtitle: "Student Attendance Management System",
        
        // Navigation
        dashboard: "Dashboard",
        registerStudent: "Register Student",
        dailyAttendance: "Daily Attendance",
        reports: "Reports",
        settings: "Settings",
        
        // Dashboard
        totalStudents: "Total Students",
        presentToday: "Present Today",
        absentToday: "Absent Today",
        attendanceRate: "Attendance Rate",
        todayAttendanceOverview: "Today's Attendance Overview",
        noAttendanceData: "No attendance data for today yet.",
        noStudentsRegistered: "No students registered yet.",
        noAttendanceDataAvailable: "No attendance data available.",
        present: "Present",
        absent: "Absent",
        absentStudents: "Absent Students:",
        noReasonProvided: "No reason provided",
        
        // Student Registration
        studentRegistration: "Student Registration",
        studentName: "Student Name",
        fatherName: "Father's Name",
        rollNumber: "Roll Number",
        address: "Address",
        district: "District",
        subDistrict: "Sub-district (Upazila)",
        mobileNumber: "Mobile Number",
        class: "Class",
        uniqueId: "Unique ID Number",
        selectClass: "Select Class",
        registerStudentBtn: "Register Student",
        required: "*",
        
        // Daily Attendance
        dailyAttendanceTitle: "Daily Attendance",
        date: "Date:",
        filterByClass: "Filter by Class:",
        allClasses: "All Classes",
        saveAttendance: "Save Attendance",
        pleaseSelectDate: "Please select a date.",
        noStudentsFound: "No students found for the selected criteria.",
        noStudentsFoundRegister: "No students found. Please register students first.",
        reasonForAbsence: "Reason for absence",
        
        // Reports
        attendanceReports: "Attendance Reports",
        fromDate: "From Date:",
        toDate: "To Date:",
        to: "to",
        generateReport: "Generate Report",
        attendanceReport: "Attendance Report",
        period: "Period:",
        studentNameCol: "Student Name",
        classCol: "Class",
        idNumberCol: "ID Number",
        presentDays: "Present Days",
        absentDays: "Absent Days",
        attendancePercent: "Attendance %",
        selectDateRange: "Select date range and click \"Generate Report\" to view attendance data.",
        selectBothDates: "Please select both start and end dates.",
        startDateAfterEnd: "Start date cannot be after end date.",
        
        // Settings
        settingsTitle: "Settings",
        hijriSettings: "Hijri Date Settings",
        hijriAdjustment: "Hijri Date Adjustment",
        hijriAdjustmentDesc: "Adjust Hijri date for local observation",
        hijriNoAdjustment: "No Adjustment (Default)",
        hijriPlusOne: "+1 Day (Ahead)",
        hijriMinusOne: "-1 Day (Behind)",
        applicationSettings: "Application Settings",
        applicationName: "Application Name",
        appNamePlaceholder: "Enter application name",
        updateAppNameBtn: "Update Name",
        enterAppName: "Please enter an application name.",
        appNameUpdated: "Application name updated successfully.",
        manageClasses: "Manage Classes",
        enterNewClassName: "Enter new class name",
        enterClassName: "Please enter a class name.",
        addClass: "Add Class",
        delete: "Delete",
        noClassesAdded: "No classes added yet.",
        confirmDeleteClass: "Are you sure you want to delete the class",
        cannotUndo: "This action cannot be undone.",
        classExists: "This class already exists.",
        classAdded: "class has been added successfully.",
        classDeleted: "class has been deleted successfully.",
        
        // Common buttons and actions
        ok: "OK",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        add: "Add",
        
        // Messages
        success: "Success",
        error: "Error",
        fillAllFields: "Please fill in all required fields.",
        duplicateId: "A student with this ID number already exists.",
        duplicateRollNumber: "A student with this roll number already exists.",
        studentRegistered: "has been registered successfully.",
        attendanceSaved: "Attendance has been saved successfully.",
        
        // Bulk Actions
        markAllPresent: "Mark All Present",
        markAllAbsent: "Mark All Absent",
        copyPreviousDay: "Copy Previous Day",
        studentsShown: "students shown",
        bulkAbsentTitle: "Mark All Students Absent",
        bulkAbsentReason: "Reason for absence (applies to all students):",
        bulkAbsentPlaceholder: "e.g., School holiday, Strike, etc.",
        bulkAbsentConfirm: "Mark All Absent",
        cancel: "Cancel",
        pleaseProvideReason: "Please provide a reason for the absence",
        studentsMarkedPresent: "students marked as present",
        studentsMarkedAbsent: "students marked as absent",
        noAttendanceDataFound: "No attendance data found for",
        attendanceCopiedFrom: "Attendance copied from",
        
        // Student Detail
        studentDetails: "Student Details",
        backToReports: "Back to Attendance",
        
        // Holiday Management
        holidayManagement: "Holiday Management",
        addHoliday: "Add Holiday",
        holidayDate: "Holiday Date",
        holidayStartDate: "From Date",
        holidayEndDate: "To Date",
        holidayName: "Holiday Name",
        studentManagement: "Student Management",
        
        // Dashboard Labels
        totalStudentsLabel: "Total Students",
        presentLabel: "Present",
        absentLabel: "Absent",
        classWiseInformation: "Class-wise Information",
        personalInformation: "Personal Information",
        contactInformation: "Contact Information",
        academicInformation: "Academic Information",
        attendanceSummary: "Attendance Summary",
        totalPresent: "Total Present",
        totalAbsent: "Total Absent",
        attendanceRate: "Attendance Rate",
        totalDays: "Total Days",
        recentAttendance: "Recent Attendance (Last 30 Days)",
        attendanceCalendar: "Attendance Calendar",
        registrationDate: "Registration Date",
        studentNotFound: "Student not found",
        attendanceLabel: "Attendance",
        backToRegistration: "Back to Registration",
        
        // Student List and Management
        rollNo: "Roll No.",
        fullName: "Full Name",
        actions: "Actions",
        allRegisteredStudents: "All Registered Students",
        registerNewStudent: "Register New Student",
        bulkImport: "Bulk Import",
        editStudent: "Edit Student",
        updateStudent: "Update Student",
        deleteStudent: "Delete Student",
        noStudentsRegisteredYet: "No students registered yet. Click \"Register New Student\" to add students.",
        backToList: "Back to List",
        leaveDays: "Leave Days",
        
        // Report Table Headers
        roll: "Roll",
        name: "Name",
        rate: "Rate",
        
        // Confirmation Messages
        confirmDeleteStudent: "Are you sure you want to delete",
        actionCannotBeUndone: "This action cannot be undone.",
        clearAllFilters: "Clear all filters",
        searchRoll: "Search roll...",
        searchName: "Search name...",
        searchMobile: "Search mobile...",
        
        // Mobile Table Headers (for responsive)
        mobile: "Mobile"
    },
    
    bn: {
        // Header
        appTitle: "মাদানী মক্তব",
        appSubtitle: "ছাত্র উপস্থিতি ব্যবস্থাপনা সিস্টেম",
        
        // Navigation
        dashboard: "ড্যাশবোর্ড",
        registerStudent: "ছাত্র নিবন্ধন",
        dailyAttendance: "দৈনিক উপস্থিতি",
        reports: "রিপোর্ট",
        settings: "সেটিংস",
        
        // Dashboard
        totalStudents: "মোট ছাত্র",
        presentToday: "আজ উপস্থিত",
        absentToday: "আজ অনুপস্থিত",
        attendanceRate: "উপস্থিতির হার",
        todayAttendanceOverview: "আজকের উপস্থিতির সংক্ষিপ্ত বিবরণ",
        noAttendanceData: "আজকের জন্য এখনো কোন উপস্থিতির তথ্য নেই।",
        noStudentsRegistered: "এখনো কোন ছাত্র নিবন্ধিত হয়নি।",
        noAttendanceDataAvailable: "কোন উপস্থিতির তথ্য উপলব্ধ নেই।",
        present: "উপস্থিত",
        absent: "অনুপস্থিত",
        absentStudents: "অনুপস্থিত ছাত্রগণ:",
        noReasonProvided: "কোন কারণ দেওয়া হয়নি",
        
        // Student Registration
        studentRegistration: "ছাত্র নিবন্ধন",
        studentName: "ছাত্রের নাম",
        fatherName: "পিতার নাম",
        rollNumber: "রোল নম্বর",
        address: "ঠিকানা",
        district: "জেলা",
        subDistrict: "উপজেলা",
        mobileNumber: "মোবাইল নম্বর",
        class: "শ্রেণী",
        uniqueId: "অনন্য পরিচয় নম্বর",
        selectClass: "শ্রেণী নির্বাচন করুন",
        registerStudentBtn: "ছাত্র নিবন্ধন করুন",
        required: "*",
        
        // Daily Attendance
        dailyAttendanceTitle: "দৈনিক উপস্থিতি",
        date: "তারিখ:",
        filterByClass: "শ্রেণী অনুযায়ী ফিল্টার:",
        allClasses: "সকল শ্রেণী",
        saveAttendance: "উপস্থিতি সংরক্ষণ করুন",
        pleaseSelectDate: "অনুগ্রহ করে একটি তারিখ নির্বাচন করুন।",
        noStudentsFound: "নির্বাচিত মানদণ্ডের জন্য কোন ছাত্র পাওয়া যায়নি।",
        noStudentsFoundRegister: "কোন ছাত্র পাওয়া যায়নি। অনুগ্রহ করে প্রথমে ছাত্র নিবন্ধন করুন।",
        reasonForAbsence: "অনুপস্থিতির কারণ",
        
        // Reports
        attendanceReports: "উপস্থিতির রিপোর্ট",
        fromDate: "শুরুর তারিখ:",
        toDate: "শেষের তারিখ:",
        to: "থেকে",
        generateReport: "রিপোর্ট তৈরি করুন",
        attendanceReport: "উপস্থিতির রিপোর্ট",
        period: "সময়কাল:",
        studentNameCol: "ছাত্রের নাম",
        classCol: "শ্রেণী",
        idNumberCol: "পরিচয় নম্বর",
        presentDays: "উপস্থিত দিন",
        absentDays: "অনুপস্থিত দিন",
        attendancePercent: "উপস্থিতির %",
        selectDateRange: "তারিখের পরিসর নির্বাচন করুন এবং উপস্থিতির তথ্য দেখার জন্য \"রিপোর্ট তৈরি করুন\" ক্লিক করুন।",
        selectBothDates: "অনুগ্রহ করে শুরু এবং শেষ উভয় তারিখ নির্বাচন করুন।",
        startDateAfterEnd: "শুরুর তারিখ শেষের তারিখের পরে হতে পারে না।",
        
        // Settings
        settingsTitle: "সেটিংস",
        hijriSettings: "হিজরি তারিখ সেটিংস",
        hijriAdjustment: "হিজরি তারিখ সমন্বয়",
        hijriAdjustmentDesc: "স্থানীয় পর্যবেক্ষণের জন্য হিজরি তারিখ সমন্বয় করুন",
        hijriNoAdjustment: "কোন সমন্বয় নেই (ডিফল্ট)",
        hijriPlusOne: "+১ দিন (এগিয়ে)",
        hijriMinusOne: "-১ দিন (পিছিয়ে)",
        applicationSettings: "অ্যাপ সেটিংস",
        applicationName: "অ্যাপ নাম",
        appNamePlaceholder: "অ্যাপের নাম লিখুন",
        updateAppNameBtn: "নাম আপডেট করুন",
        enterAppName: "অনুগ্রহ করে অ্যাপের নাম লিখুন।",
        appNameUpdated: "অ্যাপের নাম সফলভাবে আপডেট করা হয়েছে।",
        manageClasses: "শ্রেণী ব্যবস্থাপনা",
        enterNewClassName: "নতুন শ্রেণীর নাম লিখুন",
        enterClassName: "অনুগ্রহ করে একটি শ্রেণীর নাম লিখুন।",
        addClass: "শ্রেণী যোগ করুন",
        delete: "মুছুন",
        noClassesAdded: "এখনো কোন শ্রেণী যোগ করা হয়নি।",
        confirmDeleteClass: "আপনি কি নিশ্চিত যে আপনি শ্রেণী মুছে দিতে চান",
        cannotUndo: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
        classExists: "এই শ্রেণী ইতিমধ্যে বিদ্যমান।",
        classAdded: "শ্রেণী সফলভাবে যোগ করা হয়েছে।",
        classDeleted: "শ্রেণী সফলভাবে মুছে দেওয়া হয়েছে।",
        
        // Holiday Management
        holidayManagement: "ছুটির দিন ব্যবস্থাপনা",
        addHoliday: "ছুটির দিন যোগ করুন",
        holidayDate: "ছুটির তারিখ",
        holidayStartDate: "শুরুর তারিখ",
        holidayEndDate: "শেষের তারিখ",
        holidayName: "ছুটির নাম",
        studentManagement: "ছাত্র ব্যবস্থাপনা",
        
        // Dashboard Labels
        totalStudentsLabel: "মোট ছাত্র",
        presentLabel: "উপস্থিত",
        absentLabel: "অনুপস্থিত",
        classWiseInformation: "শ্রেণীভিত্তিক তথ্য",
        personalInformation: "ব্যক্তিগত তথ্য",
        contactInformation: "যোগাযোগের তথ্য",
        academicInformation: "একাডেমিক তথ্য",
        attendanceSummary: "উপস্থিতির সারসংক্ষেপ",
        totalPresent: "মোট উপস্থিত",
        totalAbsent: "মোট অনুপস্থিত",
        attendanceRate: "উপস্থিতির হার",
        totalDays: "মোট দিন",
        recentAttendance: "সাম্প্রতিক উপস্থিতি (গত ৩০ দিন)",
        attendanceCalendar: "উপস্থিতি ক্যালেন্ডার",
        studentDetails: "ছাত্রের বিবরণ",
        backToReports: "উপস্থিতিতে ফিরে যান",
        registrationDate: "নিবন্ধনের তারিখ",
        studentNotFound: "ছাত্র পাওয়া যায়নি",
        attendanceLabel: "উপস্থিতি",
        backToRegistration: "নিবন্ধনে ফিরে যান",
        
        // Student List and Management
        rollNo: "রোল নং",
        fullName: "পূর্ণ নাম",
        actions: "কার্যক্রম",
        allRegisteredStudents: "সকল নিবন্ধিত ছাত্র",
        registerNewStudent: "নতুন ছাত্র নিবন্ধন",
        bulkImport: "বাল্ক ইমপোর্ট",
        editStudent: "ছাত্র সম্পাদনা",
        updateStudent: "ছাত্র আপডেট",
        deleteStudent: "ছাত্র মুছুন",
        noStudentsRegisteredYet: "এখনো কোন ছাত্র নিবন্ধিত হয়নি। ছাত্র যোগ করতে \"নতুন ছাত্র নিবন্ধন\" ক্লিক করুন।",
        backToList: "তালিকায় ফিরে যান",
        leaveDays: "ছুটির দিন",
        
        // Report Table Headers
        roll: "রোল",
        name: "নাম",
        rate: "হার",
        
        // Confirmation Messages
        confirmDeleteStudent: "আপনি কি নিশ্চিত যে আপনি মুছে দিতে চান",
        actionCannotBeUndone: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
        clearAllFilters: "সব ফিল্টার মুছুন",
        searchRoll: "রোল অনুসন্ধান...",
        searchName: "নাম অনুসন্ধান...",
        searchMobile: "মোবাইল অনুসন্ধান...",
        
        // Mobile Table Headers (for responsive)
        mobile: "মোবাইল"
    }
};

// Current language
let currentLanguage = 'en';

// Translation function
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Change language function
function changeLanguage(lang) {
    currentLanguage = lang;
    updateAllTexts();
    
    // Save language preference
    localStorage.setItem('madaniMaktabLanguage', lang);
}

// Initialize language on page load
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('madaniMaktabLanguage') || 'en';
    currentLanguage = savedLanguage;
    document.getElementById('languageSelector').value = savedLanguage;
    updateAllTexts();
}

// Update all texts in the application
function updateAllTexts() {
    updateHeaderTexts();
    updateNavigationTexts();
    updateDashboardTexts();
    updateRegistrationTexts();
    updateAttendanceTexts();
    updateReportsTexts();
    updateSettingsTexts();
    updateStudentListTexts();
}

// Update header texts
function updateHeaderTexts() {
    const savedName = localStorage.getItem('madaniMaktabAppName') || t('appTitle');
    document.querySelector('.header h1').innerHTML = `<i class="fas fa-graduation-cap"></i> ${savedName}`;
    document.querySelector('.header p').textContent = t('appSubtitle');
    document.title = `${savedName} - ${t('appSubtitle')}`;
    const footer = document.querySelector('.footer p');
    if (footer) {
        footer.innerHTML = `&copy; 2024 ${savedName}. All rights reserved.`;
    }
}

// Update navigation texts
function updateNavigationTexts() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navTexts = ['dashboard', 'registerStudent', 'dailyAttendance', 'reports', 'settings'];
    
    navLinks.forEach((link, index) => {
        const icon = link.querySelector('i').outerHTML;
        link.innerHTML = `${icon} ${t(navTexts[index])}`;
    });
}

// Update dashboard texts
function updateDashboardTexts() {
    document.querySelector('#dashboard h2').textContent = t('dashboard');
    
    const statCards = document.querySelectorAll('.stat-card p');
    const statTexts = ['totalStudents', 'presentToday', 'absentToday', 'attendanceRate'];
    
    statCards.forEach((card, index) => {
        card.textContent = t(statTexts[index]);
    });
    
    const overviewTitle = document.querySelector('.recent-activity h3');
    if (overviewTitle) {
        overviewTitle.textContent = t('todayAttendanceOverview');
    }
    
    // Update class-wise stats title
    const classWiseTitle = document.querySelector('.class-wise-stats h3');
    if (classWiseTitle) {
        classWiseTitle.textContent = t('classWiseInformation');
    }
}

// Update registration texts
function updateRegistrationTexts() {
    document.querySelector('#registration h2').textContent = t('studentManagement');
    
    const labels = document.querySelectorAll('#registration label');
    const labelTexts = ['studentName', 'fatherName', 'rollNumber', 'address', 'district', 'subDistrict', 'mobileNumber', 'class', 'uniqueId'];
    
    labels.forEach((label, index) => {
        if (labelTexts[index]) {
            label.textContent = t(labelTexts[index]) + ' *';
        }
    });
    
    const submitBtn = document.querySelector('#studentForm button');
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('registerStudentBtn')}`;
    }
    
    const selectOption = document.querySelector('#studentClass option[value=""]');
    if (selectOption) {
        selectOption.textContent = t('selectClass');
    }
}

// Update attendance texts
function updateAttendanceTexts() {
    document.querySelector('#attendance h2').textContent = t('dailyAttendanceTitle');
    
    const dateLabel = document.querySelector('.date-selector label');
    if (dateLabel) {
        dateLabel.textContent = t('date');
    }
    
    const classLabel = document.querySelector('.class-filter label');
    if (classLabel) {
        classLabel.textContent = t('filterByClass');
    }
    
    const saveBtn = document.querySelector('#attendance .btn-success');
    if (saveBtn) {
        saveBtn.innerHTML = `<i class="fas fa-save"></i> ${t('saveAttendance')}`;
    }
    
    const allClassesOption = document.querySelector('#classFilter option[value=""]');
    if (allClassesOption) {
        allClassesOption.textContent = t('allClasses');
    }
    
    // Update bulk action buttons
    const bulkButtons = document.querySelectorAll('.bulk-buttons .btn');
    if (bulkButtons.length >= 3) {
        bulkButtons[0].innerHTML = `<i class="fas fa-check-circle"></i> ${t('markAllPresent')}`;
        bulkButtons[1].innerHTML = `<i class="fas fa-times-circle"></i> ${t('markAllAbsent')}`;
        bulkButtons[2].innerHTML = `<i class="fas fa-copy"></i> ${t('copyPreviousDay')}`;
    }
    
    // Update bulk absent modal
    const modalTitle = document.querySelector('#bulkAbsentModal h3');
    if (modalTitle) {
        modalTitle.textContent = t('bulkAbsentTitle');
    }
    
    const modalLabel = document.querySelector('#bulkAbsentModal label');
    if (modalLabel) {
        modalLabel.textContent = t('bulkAbsentReason');
    }
    
    const modalInput = document.getElementById('bulkAbsentReason');
    if (modalInput) {
        modalInput.placeholder = t('bulkAbsentPlaceholder');
    }
    
    const modalButtons = document.querySelectorAll('#bulkAbsentModal .modal-buttons .btn');
    if (modalButtons.length >= 2) {
        modalButtons[0].innerHTML = `<i class="fas fa-times-circle"></i> ${t('bulkAbsentConfirm')}`;
        modalButtons[1].innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;
    }
}

// Update reports texts 
function updateReportsTexts() {
    document.querySelector('#reports h2').textContent = t('attendanceReports');
    
    const reportLabels = document.querySelectorAll('#reports .form-group label');
    const reportLabelTexts = ['fromDate', 'toDate'];
    
    reportLabels.forEach((label, index) => {
        if (reportLabelTexts[index]) {
            label.textContent = t(reportLabelTexts[index]);
        }
    });
    
    const generateBtn = document.querySelector('#reports .btn-primary');
    if (generateBtn) {
        generateBtn.innerHTML = `<i class="fas fa-chart-bar"></i> ${t('generateReport')}`;
    }
}

// Update settings texts
function updateSettingsTexts() {
    document.querySelector('#settings h2').textContent = t('settingsTitle');
    
    const settingsTitles = document.querySelectorAll('#settings h3');
    if (settingsTitles.length >= 1) {
        settingsTitles[0].textContent = t('applicationSettings');
    }
    if (settingsTitles.length >= 2) {
        settingsTitles[1].textContent = t('manageClasses');
    }
    if (settingsTitles.length >= 3) {
        settingsTitles[2].textContent = t('hijriSettings');
    }
    if (settingsTitles.length >= 4) {
        settingsTitles[3].textContent = t('holidayManagement');
    }

    
    const classNameInput = document.getElementById('newClassName');
    if (classNameInput) {
        classNameInput.placeholder = t('enterNewClassName');
    }

    const appNameInput = document.getElementById('appNameInput');
    if (appNameInput) {
        appNameInput.placeholder = t('appNamePlaceholder');
    }
    const appNameLabel = document.querySelector('label[for="appNameInput"]');
    if (appNameLabel) {
        appNameLabel.textContent = t('applicationName') + ':';
    }
    const updateAppNameBtn = document.getElementById('saveAppNameBtn');
    if (updateAppNameBtn) {
        updateAppNameBtn.innerHTML = `<i class="fas fa-save"></i> ${t('updateAppNameBtn')}`;
    }
    
    const holidayStartDateLabel = document.querySelector('label[for="holidayStartDate"]');
    if (holidayStartDateLabel) {
        holidayStartDateLabel.textContent = t('holidayStartDate') + ':';
    }
    
    const holidayEndDateLabel = document.querySelector('label[for="holidayEndDate"]');
    if (holidayEndDateLabel) {
        holidayEndDateLabel.textContent = t('holidayEndDate') + ':';
    }
    
    const holidayNameLabel = document.querySelector('label[for="holidayName"]');
    if (holidayNameLabel) {
        holidayNameLabel.textContent = t('holidayName') + ':';
    }
    
    const addClassBtn = document.querySelector('.add-class .btn');
    if (addClassBtn) {
        addClassBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('addClass')}`;
    }
    
    const addHolidayBtn = document.querySelector('.add-holiday .btn');
    if (addHolidayBtn) {
        addHolidayBtn.innerHTML = `<i class="fas fa-calendar-plus"></i> ${t('addHoliday')}`;
    }
}

// Update student list texts
function updateStudentListTexts() {
    // This will be called when the student list is displayed
    // The actual translation happens in displayStudentsList function
}

// Update student detail texts
function updateStudentDetailTexts() {
    const studentDetailTitle = document.querySelector('#student-detail h2');
    if (studentDetailTitle && studentDetailTitle.textContent.includes(' - ')) {
        const parts = studentDetailTitle.textContent.split(' - ');
        studentDetailTitle.textContent = `${parts[0]} - ${t('studentDetails')}`;
    }
    
    const backBtn = document.querySelector('#student-detail .btn-secondary');
    if (backBtn) {
        backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('backToReports')}`;
    }
}

// Update section content when switching sections
function updateSectionContent(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            updateDashboardTexts();
            break;
        case 'registration':
            updateRegistrationTexts();
            break;
        case 'attendance':
            updateAttendanceTexts();
            break;
        case 'reports':
            updateReportsTexts();
            break;
        case 'settings':
            updateSettingsTexts();
            break;
        case 'student-detail':
            updateStudentDetailTexts();
            break;
    }
}