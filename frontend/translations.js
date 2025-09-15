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
        teachersCorner: "Teachers Corner",
        settings: "Settings",
        
        // Dashboard
        totalStudents: "Total Students",
        presentToday: "Present Today",
        absentToday: "Absent Today",
        attendanceRate: "Attendance Rate",
        inactiveStudents: "Inactive Students",
        markAsActive: "Mark as Active",
        markAsInactive: "Mark as Inactive",
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
        fromBeginningReport: "From Beginning Report",
        fromBeginningReportDesc: "Generate report from academic year start to today",
        attendanceReport: "Attendance Report",
        period: "Period:",
        studentNameCol: "Student Name",
        classCol: "Class",
        idNumberCol: "ID Number",
        presentDays: "Present Days",
        absentDays: "Absent Days",
        attendancePercent: "Attendance %",
        clickToViewDetails: "Click to view details",
        noAbsentDays: "No absent days in this period",
        totalAbsentDays: "Total Absent Days",
        reason: "Reason",
        cannotTakeAttendanceForFutureDate: "Cannot take attendance for future dates. Please select today's date or a past date.",
        selectDateRange: "Select date range and click \"Generate Report\" to view attendance data.",
        selectBothDates: "Please select both start and end dates.",
        startDateAfterEnd: "Start date cannot be after end date.",
        noAcademicYearSet: "No academic year start date set. Please set it in Settings first.",
        
        // Settings
        settingsTitle: "Settings",
        academicYearSettings: "Academic Year Settings",
        academicYearStartDate: "Academic Year Start Date",
        academicYearStartDateDesc: "Select the starting date for your academic year",
        setAcademicYearStartBtn: "Set Academic Year Start",
        clearAcademicYearStartBtn: "Clear",
        selectAcademicYearStart: "Please select the academic year start date.",
        academicYearStartUpdated: "Academic year start date updated successfully.",
        academicYearStartCleared: "Academic year start date cleared successfully. All date restrictions have been removed.",
        confirmClearAcademicYear: "Are you sure you want to clear the academic year start date? This will remove all date restrictions.",
        confirmAction: "Are you sure?",
        dateRestrictionNotice: "Date selection is restricted to academic year period",
        dateRestrictionNoticeFrom: "Date selection is restricted to academic year period (from {date})",
        beforeAcademicYear: "Before Academic Year",
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
        confirmDeleteClassFinal: "Are you absolutely sure you want to delete the class",
        finalDeleteClassWarning: "This will also delete all students in this class and their attendance records. This action is permanent and cannot be undone.",
        classExists: "This class already exists.",
        classAdded: "class has been added successfully.",
        classDeleted: "class has been deleted successfully.",

        // Education
        EducationProgressTracking: "Education Progress Tracking",
        bookProgressManagement: "Book Progress Management",
        addNewBook: "Add New Book",
        deleteAllData: "Delete All Data",
        addNewBookProgress: "Add New Book Progress",
        backToList: "Back to List",
        bookClass: "Class",
        bookSubject: "Subject",
        bookName: "Book Name",
        totalPages: "Total Pages",
        completedPages: "Completed Pages",
        bookNotes: "Notes",
        saveBookProgress: "Save Book Progress",
        editBookDetails: "Edit Book Details",
        noBooksAddedYet: "No books added yet. Click \"Add New Book\" to get started.",
        editDetails: "Edit Details",
        updateProgress: "Update Progress",
        deleteBook: "Delete",
        confirmDeleteBook: "Are you sure you want to delete",
        bookDeletedSuccessfully: "Book progress deleted successfully!",
        failedToDeleteBook: "Failed to delete book progress",
        deleteAllEducationData: "Delete All Education Data",
        deleteAllEducationWarning: "This action will permanently delete all education progress data including:",
        yesDeleteAllData: "Yes, Delete All Data",
        allEducationDataDeleted: "All education data has been deleted successfully!",
        failedToDeleteAllEducation: "Failed to delete all education data",
        
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
        studentsMarkedNeutral: "students cleared to neutral",
        markAllNeutral: "Clear All",
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
        failedToFetchStudent: "Failed to fetch student details. Please try again.",
        networkError: "Network error. Please check your internet connection and try again.",
        
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
        confirmDeleteStudentFinal: "Are you absolutely sure you want to delete this student?",
        finalDeleteWarning: "This action is permanent and cannot be undone. All attendance records for this student will also be deleted.",
        deleteAllStudents: "Delete All Students",
        confirmDeleteAllStudents: "Are you sure you want to delete ALL students?",
        confirmDeleteAllStudentsFinal: "Are you absolutely sure you want to delete ALL students?",
        finalDeleteAllWarning: "This will permanently delete ALL students and their attendance records. This action is irreversible and will completely reset your student database.",
        
        // Reset Attendance
        dataManagement: "Data Management",
        dangerZone: "Danger Zone",
        dangerZoneWarning: "These actions cannot be undone. Please be careful.",
        resetAttendanceHistory: "Reset Attendance History",
        resetAttendanceDescription: "This will permanently delete all attendance records for all students. This action cannot be undone!",
        resetAllAttendance: "Reset All Attendance",
        resetAttendanceConfirm: "This will permanently delete all attendance records for all students. This action cannot be undone!",
        resetAttendanceWarning: "Warning: This action cannot be undone!",
        resetAttendanceList: "This will permanently delete:",
        resetAttendanceListItem1: "All attendance records for all students",
        resetAttendanceListItem2: "All saved attendance dates",
        resetAttendanceListItem3: "All attendance history from the calendar",
        typeResetToConfirm: "Type RESET to confirm:",
        typeResetPlaceholder: "Type RESET to confirm",
        attendanceResetSuccess: "All attendance history has been reset successfully.",
        attendanceResetFailed: "Failed to reset attendance. Please try again.",
        attendanceResetPleaseTypeReset: "Please type \"RESET\" to confirm the action.",
        clearAllFilters: "Clear all filters",
        searchRoll: "Search roll...",
        searchName: "Search name...",
        searchMobile: "Search mobile...",
        
        // Mobile Table Headers (for responsive)
        mobile: "Mobile",
        
        // Missing Error/Success Messages
        cannotSaveAttendanceOnHolidays: "Cannot save attendance on holidays",
        cannotMarkAttendanceOnHolidays: "Cannot mark attendance on holidays", 
        failedToSaveAttendance: "Failed to save attendance. Please try again.",
        noAttendanceDataForPreviousDay: "No attendance data available for the previous day.",
        successfullyCopiedAttendance: "Successfully copied attendance from the previous day.",
        attendanceSavedSuccessfully: "Attendance saved successfully!",
        studentsConfirmedPresent: "students confirmed present",
        studentsMarkedPresent: "students marked as present",
        studentsMarkedAbsent: "students marked as absent",
        rememberToSaveAttendance: "Remember to save attendance after making changes!",
        selectDateRangeToGenerate: "Select date range and click \"Generate Report\" to view attendance data.",
        showAttendanceTrackingCalendar: "Show Attendance Tracking Calendar",
        viewAttendanceStatistics: "View which days attendance was taken vs missed this month with summary statistics",
        hideAttendanceTrackingCalendar: "Hide Attendance Tracking Calendar",
        stickyAttendanceApplied: "Sticky attendance applied!",
        stillAbsentFromLastTime: "still absent from last time. Change any student's status as needed.",
        allStudentsPresent: "All students present. Change any student's status as needed.",
        present: "present",
        absent: "absent",
        total: "total",
        
        // Student Detail Summary Options
        last30Days: "Last 30 Days",
        fromBeginning: "From Beginning",
        summaryPeriod: "Summary Period",
        
        // Attendance Status
        notSet: "Not Set",
        neutral: "Not Set",
        
        // Missing Modal Messages
        pleaseEnterClassName: "Please enter a class name",
        classAddedSuccessfully: "class added successfully",
        failedToAddClass: "Failed to add class",
        networkErrorOccurred: "A network error occurred",
        classDeletedSuccessfully: "class deleted successfully",
        failedToDeleteClass: "Failed to delete class",
        classUpdatedSuccessfully: "Class updated successfully",
        failedToUpdateClass: "Failed to update class",
        pleaseEnterHolidayStartDateAndName: "Please enter holiday start date and name",
        startDateCannotBeAfterEndDate: "Start date cannot be after end date",
        holidayDatesConflictWithExisting: "Holiday dates conflict with existing holiday:",
        holidayAddedSuccessfully: "Holiday added successfully",
        failedToAddHoliday: "Failed to add holiday:",
        holidayNotFound: "Holiday not found",
        holidayDeletedSuccessfully: "Holiday deleted successfully",
        failedToDeleteHoliday: "Failed to delete holiday:",
        pleaseEnterBookName: "Please enter a book name",
        pleaseEnterValidNumberOfTotalPages: "Please enter a valid number of total pages",
        bookAddedSuccessfully: "Book added successfully",
        failedToAddBook: "Failed to add book",
        bookUpdatedSuccessfully: "Book updated successfully",
        failedToUpdateBook: "Failed to update book",
        bookDeletedSuccessfully: "Book deleted successfully",
        failedToDeleteBook: "Failed to delete book",
        pleaseSelectAcademicYearStartDate: "Please select an academic year start date",
        academicYearStartDateUpdatedSuccessfully: "Academic year start date updated successfully",
        academicYearStartDateSavedLocally: "Academic year start date saved locally",
        academicYearStartDateClearedSuccessfully: "Academic year start date cleared successfully",
        academicYearStartDateClearedLocally: "Academic year start date cleared locally",
        pleaseEnterAppName: "Please enter an app name",
        appNameUpdatedSuccessfully: "App name updated successfully",
        appNameSavedLocally: "App name saved locally",
        failedToLoadUsers: "Failed to load users",
        userNotFound: "User not found",
        failedToCreateUser: "Failed to create user",
        failedToUpdateUser: "Failed to update user",
        failedToDeleteUser: "Failed to delete user",
        passwordMustBeAtLeast4Characters: "Password must be at least 4 characters long",
        failedToResetPassword: "Failed to reset password",
        alertThresholdsSavedSuccessfully: "Alert thresholds saved successfully!",
        alertThresholdsSavedLocally: "Alert thresholds saved locally!",
        
        // Missing Text Content
        notSet: "Not set",
        na: "N/A",
        hideDetails: "Hide Details",
        viewDetails: "View Details",
        saveChanges: "Save Changes*",
        never: "Never",
        unknown: "Unknown",
        noClassAssigned: "No class assigned",
        noClassesAvailable: "No classes available",
        noClassesAddedYet: "No classes added yet",
        noHolidaysConfigured: "No holidays configured.",
        noBooksAddedYetAddFirst: "No books added yet. Add your first book above.",
        selectBook: "Select Book",
        noUsersFound: "No users found.",
        noAlertsEverythingFine: "No alerts. Everything is fine! 🎉",
        noStudentsInThisClass: "No students in this class.",
        noBooksAddedForThisClass: "No books added for this class.",
        
        // Missing Placeholders
        enterRollNumberPlaceholder: "Enter roll number (e.g., 101, 201)",
        enterNewClassNamePlaceholder: "Enter new class name",
        holidayNamePlaceholder: "Holiday Name (e.g., Eid-ul-Fitr)",
        enterNewBookNamePlaceholder: "Enter new book name",
        totalPagesPlaceholder: "Total pages",
        enterCurrentPasswordPlaceholder: "Enter current password",
        enterNewPasswordPlaceholder: "Enter new password",
        confirmNewPasswordPlaceholder: "Confirm new password",
        writeNotesHerePlaceholder: "Write notes here...",
        writeProgressNotesPlaceholder: "Write progress notes...",
        writeScoreChangeReasonPlaceholder: "Write reason for score change...",
        schoolHolidayStrikePlaceholder: "e.g., School holiday, Strike, etc.",
        typeResetToConfirmPlaceholder: "Type RESET to confirm",
        enterTotalPagesPlaceholder: "Enter total pages",
        
        // Missing Alert Messages
        pleaseProvideReasonForAbsence: "Please provide a reason for {name}'s absence before saving.",
        pleaseProvideAbsenceReasonsFor: "Please provide absence reasons for:",
        pleaseSelectValidCsvFile: "Please select a valid CSV file. Save your Excel file as CSV first.",
        pleaseSelectCsvFileFirst: "Please select a CSV file first",
        noStudentDataFoundInCsv: "No student data found in the CSV file. Please check the format.",
        uploadFailed: "Upload Failed",
        importError: "Import Error",
        networkErrorDuringUpload: "Could not connect to the server.",
        csvDownloaded: "CSV Downloaded",
        hijriDateAdjustmentUpdatedSuccessfully: "Hijri date adjustment updated successfully",
        pleaseSelectBothStartAndEndDate: "Please select both a start and end date.",
        failedToLoadAttendanceCalendar: "Failed to load attendance calendar. Please try again.",
        rollNumberAlreadyExists: "Roll number {rollNumber} already exists. Please choose a different roll number.",
        registrationFailed: "Registration failed",
        networkErrorPleaseTryAgain: "Network error. Please try again.",
        studentUpdatedSuccessfully: "Student updated successfully",
        updateFailed: "Update failed",
        deletionFailed: "Deletion failed",
        noStudentsToDelete: "No students to delete.",
        allStudentsDeletedSuccessfully: "All {count} students have been deleted successfully.",
        failedToDeleteAllStudents: "Failed to delete all students",
        logoutFailedPleaseTryAgain: "Logout failed. Please try again.",
        networkErrorDuringLogout: "Network error during logout. Please try again.",
        
        // Teachers Corner Alert Messages
        pleaseEnterNumberBetween0And100: "Please enter a number between 0 and 100.",
        scoreUpdatedSuccessfully: "Score updated successfully.",
        problemUpdatingScore: "Problem updating score.",
        connectionProblemPleaseTryAgain: "Connection problem. Please try again.",
        pleaseWriteDetails: "Please write details.",
        noteSavedSuccessfully: "Note saved successfully.",
        problemSavingNote: "Problem saving note.",
        noteUpdatedSuccessfully: "Note updated successfully.",
        problemUpdatingNote: "Problem updating note.",
        noteDeletedSuccessfully: "Note deleted successfully.",
        problemDeletingNote: "Problem deleting note.",
        bookNotFoundPleaseRefresh: "Book not found. Please refresh the page.",
        pleaseProvideCorrectInformation: "Please provide correct information.",
        bookNotFound: "Book not found.",
        problemCreatingProgressRecord: "Problem creating progress record.",
        problemUpdatingProgress: "Problem updating progress.",
        bookProgressSaved: "Book progress saved.",
        pleaseGoToSettingsToAddNewBook: "Please go to Settings to add new book.",
        bookDeletedFromLocalDisplay: "Book deleted. (from local display)",
        tarbiyahGoalsSaved: "Tarbiyah goals saved.",
        
        // Modal Titles
        scoreManagement: "Score Management",
        viewAttendance: "View Attendance",
        classAnalysis: "Class Analysis",
        teacherLogbook: "Teacher's Logbook"
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
        teachersCorner: "শিক্ষক কোণার",
        settings: "সেটিংস",
        education: "শিক্ষা",
        
        // Dashboard
        totalStudents: "মোট ছাত্র",
        presentToday: "আজ উপস্থিত",
        absentToday: "আজ অনুপস্থিত",
        attendanceRate: "উপস্থিতির হার",
        inactiveStudents: "নিষ্ক্রিয় ছাত্র",
        markAsActive: "সক্রিয় হিসেবে চিহ্নিত করুন",
        markAsInactive: "নিষ্ক্রিয় হিসেবে চিহ্নিত করুন",
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
        fromBeginningReport: "শুরু থেকে রিপোর্ট",
        fromBeginningReportDesc: "শিক্ষাবর্ষের শুরু থেকে আজ পর্যন্ত রিপোর্ট তৈরি করুন",
        attendanceReport: "উপস্থিতির রিপোর্ট",
        period: "সময়কাল:",
        studentNameCol: "ছাত্রের নাম",
        classCol: "শ্রেণী",
        idNumberCol: "পরিচয় নম্বর",
        presentDays: "উপস্থিত দিন",
        absentDays: "অনুপস্থিত দিন",
        attendancePercent: "উপস্থিতির %",
        clickToViewDetails: "বিস্তারিত দেখতে ক্লিক করুন",
        noAbsentDays: "এই সময়কালে কোন অনুপস্থিত দিন নেই",
        totalAbsentDays: "মোট অনুপস্থিত দিন",
        reason: "কারণ",
        cannotTakeAttendanceForFutureDate: "ভবিষ্যতের তারিখের জন্য উপস্থিতি নেওয়া যাবে না। অনুগ্রহ করে আজকের তারিখ বা অতীতের তারিখ নির্বাচন করুন।",
        selectDateRange: "তারিখের পরিসর নির্বাচন করুন এবং উপস্থিতির তথ্য দেখার জন্য \"রিপোর্ট তৈরি করুন\" ক্লিক করুন।",
        selectBothDates: "অনুগ্রহ করে শুরু এবং শেষ উভয় তারিখ নির্বাচন করুন।",
        startDateAfterEnd: "শুরুর তারিখ শেষের তারিখের পরে হতে পারে না।",
        noAcademicYearSet: "শিক্ষাবর্ষের শুরুর তারিখ সেট করা হয়নি। অনুগ্রহ করে প্রথমে সেটিংসে এটি সেট করুন।",
        
        // Settings
        settingsTitle: "সেটিংস",
        academicYearSettings: "শিক্ষাবর্ষের সেটিংস",
        academicYearStartDate: "শিক্ষাবর্ষের শুরুর তারিখ",
        academicYearStartDateDesc: "আপনার শিক্ষাবর্ষের শুরুর তারিখ নির্বাচন করুন",
        setAcademicYearStartBtn: "শিক্ষাবর্ষের শুরু সেট করুন",
        clearAcademicYearStartBtn: "মুছে ফেলুন",
        selectAcademicYearStart: "অনুগ্রহ করে শিক্ষাবর্ষের শুরুর তারিখ নির্বাচন করুন।",
        academicYearStartUpdated: "শিক্ষাবর্ষের শুরুর তারিখ সফলভাবে আপডেট করা হয়েছে।",
        academicYearStartCleared: "শিক্ষাবর্ষের শুরুর তারিখ সফলভাবে মুছে ফেলা হয়েছে। সমস্ত তারিখের সীমাবদ্ধতা সরানো হয়েছে।",
        confirmClearAcademicYear: "আপনি কি নিশ্চিত যে শিক্ষাবর্ষের শুরুর তারিখ মুছে ফেলতে চান? এটি সমস্ত তারিখের সীমাবদ্ধতা সরিয়ে দেবে।",
        confirmAction: "আপনি কি নিশ্চিত?",
        dateRestrictionNotice: "তারিখ নির্বাচন শিক্ষাবর্ষের সময়কালে সীমাবদ্ধ",
        dateRestrictionNoticeFrom: "তারিখ নির্বাচন শিক্ষাবর্ষের সময়কালে সীমাবদ্ধ ({date} থেকে)",
        beforeAcademicYear: "শিক্ষাবর্ষের আগে",
        hijriSettings: "হিজরি তারিখ সেটিংস",
        hijriAdjustment: "হিজরি তারিখ সমন্বয়",
        hijriAdjustmentDesc: "স্থানীয় পর্যবেক্ষণের জন্য হিজরি তারিখ সমন্বয় করুন",
        hijriNoAdjustment: "কোন সমন্বয় নেই (ডিফল্ট)",
        hijriPlusOne: "+১ দিন (এগিয়ে)",
        hijriMinusOne: "-১ দিন (পিছিয়ে)",
        applicationSettings: "অ্যাপ সেটিংস",
        applicationName: "অ্যাপের নাম",
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
        confirmDeleteClassFinal: "আপনি কি সম্পূর্ণ নিশ্চিত যে আপনি শ্রেণী মুছে দিতে চান",
        finalDeleteClassWarning: "এটি এই শ্রেণীর সব ছাত্র এবং তাদের উপস্থিতি রেকর্ডও মুছে দেবে। এই কাজটি স্থায়ী এবং অপরিবর্তনীয়।",
        classExists: "এই শ্রেণী ইতিমধ্যে বিদ্যমান।",
        classAdded: "শ্রেণী সফলভাবে যোগ করা হয়েছে।",
        classDeleted: "শ্রেণী সফলভাবে মুছে দেওয়া হয়েছে।",

        // Education
        EducationProgressTracking: "শিক্ষা প্রগতি ট্র্যাকিং",
        bookProgressManagement: "বই প্রগতি ব্যবস্থাপনা",
        addNewBook: "নতুন বই যোগ করুন",
        deleteAllData: "সব ডেটা মুছুন",
        addNewBookProgress: "নতুন বই প্রগতি যোগ করুন",
        backToList: "তালিকায় ফিরে যান",
        bookClass: "শ্রেণী",
        bookSubject: "বিষয়",
        bookName: "বইয়ের নাম",
        totalPages: "মোট পাতা",
        completedPages: "সম্পন্ন পাতা",
        bookNotes: "নোট",
        saveBookProgress: "বই প্রগতি সংরক্ষণ করুন",
        editBookDetails: "বই বিবরণ সম্পাদনা করুন",
        noBooksAddedYet: "এখনো কোন বই যোগ করা হয়নি। শুরু করতে \"নতুন বই যোগ করুন\" ক্লিক করুন।",
        editDetails: "বিবরণ সম্পাদনা করুন",
        updateProgress: "প্রগতি আপডেট করুন",
        deleteBook: "মুছুন",
        confirmDeleteBook: "আপনি কি নিশ্চিত যে আপনি বই প্রগতি মুছে দিতে চান",
        bookDeletedSuccessfully: "বই প্রগতি সফলভাবে মুছে দেওয়া হয়েছে!",
        failedToDeleteBook: "বই প্রগতি মুছতে ব্যর্থ হয়েছে",
        deleteAllEducationData: "সব শিক্ষা ডেটা মুছুন",
        deleteAllEducationWarning: "এই কাজটি স্থায়ীভাবে সব শিক্ষা প্রগতি ডেটা মুছে দেবে যার মধ্যে রয়েছে:",
        yesDeleteAllData: "হ্যাঁ, সব ডেটা মুছুন",
        allEducationDataDeleted: "সব শিক্ষা ডেটা সফলভাবে মুছে দেওয়া হয়েছে!",
        failedToDeleteAllEducation: "সব শিক্ষা ডেটা মুছতে ব্যর্থ হয়েছে",
        
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
        failedToFetchStudent: "ছাত্রের বিবরণ আনতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        networkError: "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।",
        
        // Missing Modal Messages
        pleaseEnterClassName: "অনুগ্রহ করে একটি শ্রেণীর নাম দিন",
        classAddedSuccessfully: "শ্রেণী সফলভাবে যোগ করা হয়েছে",
        failedToAddClass: "শ্রেণী যোগ করতে ব্যর্থ",
        networkErrorOccurred: "নেটওয়ার্ক ত্রুটি ঘটেছে",
        classDeletedSuccessfully: "শ্রেণী সফলভাবে মুছে ফেলা হয়েছে",
        failedToDeleteClass: "শ্রেণী মুছতে ব্যর্থ",
        classUpdatedSuccessfully: "শ্রেণী সফলভাবে আপডেট হয়েছে",
        failedToUpdateClass: "শ্রেণী আপডেট করতে ব্যর্থ",
        pleaseEnterHolidayStartDateAndName: "অনুগ্রহ করে ছুটির শুরুর তারিখ এবং নাম দিন",
        startDateCannotBeAfterEndDate: "শুরুর তারিখ শেষের তারিখের পরে হতে পারে না",
        holidayDatesConflictWithExisting: "ছুটির তারিখ বিদ্যমান ছুটির সাথে সাংঘর্ষিক:",
        holidayAddedSuccessfully: "ছুটি সফলভাবে যোগ করা হয়েছে",
        failedToAddHoliday: "ছুটি যোগ করতে ব্যর্থ:",
        holidayNotFound: "ছুটি পাওয়া যায়নি",
        holidayDeletedSuccessfully: "ছুটি সফলভাবে মুছে ফেলা হয়েছে",
        failedToDeleteHoliday: "ছুটি মুছতে ব্যর্থ:",
        pleaseEnterBookName: "অনুগ্রহ করে একটি বইয়ের নাম দিন",
        pleaseEnterValidNumberOfTotalPages: "অনুগ্রহ করে মোট পৃষ্ঠার একটি বৈধ সংখ্যা দিন",
        bookAddedSuccessfully: "বই সফলভাবে যোগ করা হয়েছে",
        failedToAddBook: "বই যোগ করতে ব্যর্থ",
        bookUpdatedSuccessfully: "বই সফলভাবে আপডেট হয়েছে",
        failedToUpdateBook: "বই আপডেট করতে ব্যর্থ",
        bookDeletedSuccessfully: "বই সফলভাবে মুছে ফেলা হয়েছে",
        failedToDeleteBook: "বই মুছতে ব্যর্থ",
        pleaseSelectAcademicYearStartDate: "অনুগ্রহ করে শিক্ষাবর্ষের শুরুর তারিখ নির্বাচন করুন",
        academicYearStartDateUpdatedSuccessfully: "শিক্ষাবর্ষের শুরুর তারিখ সফলভাবে আপডেট হয়েছে",
        academicYearStartDateSavedLocally: "শিক্ষাবর্ষের শুরুর তারিখ স্থানীয়ভাবে সংরক্ষিত হয়েছে",
        academicYearStartDateClearedSuccessfully: "শিক্ষাবর্ষের শুরুর তারিখ সফলভাবে মুছে ফেলা হয়েছে",
        academicYearStartDateClearedLocally: "শিক্ষাবর্ষের শুরুর তারিখ স্থানীয়ভাবে মুছে ফেলা হয়েছে",
        pleaseEnterAppName: "অনুগ্রহ করে একটি অ্যাপের নাম দিন",
        appNameUpdatedSuccessfully: "অ্যাপের নাম সফলভাবে আপডেট হয়েছে",
        appNameSavedLocally: "অ্যাপের নাম স্থানীয়ভাবে সংরক্ষিত হয়েছে",
        failedToLoadUsers: "ব্যবহারকারীদের লোড করতে ব্যর্থ",
        userNotFound: "ব্যবহারকারী পাওয়া যায়নি",
        failedToCreateUser: "ব্যবহারকারী তৈরি করতে ব্যর্থ",
        failedToUpdateUser: "ব্যবহারকারী আপডেট করতে ব্যর্থ",
        failedToDeleteUser: "ব্যবহারকারী মুছতে ব্যর্থ",
        passwordMustBeAtLeast4Characters: "পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে",
        failedToResetPassword: "পাসওয়ার্ড রিসেট করতে ব্যর্থ",
        alertThresholdsSavedSuccessfully: "সতর্কতা থ্রেশহোল্ড সফলভাবে সংরক্ষিত হয়েছে!",
        alertThresholdsSavedLocally: "সতর্কতা থ্রেশহোল্ড স্থানীয়ভাবে সংরক্ষিত হয়েছে!",
        
        // Missing Text Content
        notSet: "সেট করা হয়নি",
        na: "N/A",
        hideDetails: "বিস্তারিত লুকান",
        viewDetails: "বিস্তারিত দেখুন",
        saveChanges: "পরিবর্তন সংরক্ষণ করুন*",
        never: "কখনো না",
        unknown: "অজানা",
        noClassAssigned: "কোন শ্রেণী বরাদ্দ করা হয়নি",
        noClassesAvailable: "কোন শ্রেণী উপলব্ধ নেই",
        noClassesAddedYet: "এখনো কোন শ্রেণী যোগ করা হয়নি",
        noHolidaysConfigured: "কোন ছুটি কনফিগার করা হয়নি।",
        noBooksAddedYetAddFirst: "এখনো কোন বই যোগ করা হয়নি। উপরে আপনার প্রথম বই যোগ করুন।",
        selectBook: "বই নির্বাচন করুন",
        noUsersFound: "কোন ব্যবহারকারী পাওয়া যায়নি।",
        noAlertsEverythingFine: "কোন সতর্কতা নেই। সবকিছু ঠিক আছে! 🎉",
        noStudentsInThisClass: "এই শ্রেণীতে কোন ছাত্র নেই।",
        noBooksAddedForThisClass: "এই শ্রেণীর জন্য কোন বই যোগ করা হয়নি।",
        
        // Missing Placeholders
        enterRollNumberPlaceholder: "রোল নম্বর দিন (যেমন: ১০১, ২০১)",
        enterNewClassNamePlaceholder: "নতুন শ্রেণীর নাম দিন",
        holidayNamePlaceholder: "ছুটির নাম (যেমন: ঈদ-উল-ফিতর)",
        enterNewBookNamePlaceholder: "নতুন বইয়ের নাম দিন",
        totalPagesPlaceholder: "মোট পৃষ্ঠা",
        enterCurrentPasswordPlaceholder: "বর্তমান পাসওয়ার্ড দিন",
        enterNewPasswordPlaceholder: "নতুন পাসওয়ার্ড দিন",
        confirmNewPasswordPlaceholder: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
        writeNotesHerePlaceholder: "এখানে নোট লিখুন...",
        writeProgressNotesPlaceholder: "অগ্রগতির বিষয়ে নোট লিখুন...",
        writeScoreChangeReasonPlaceholder: "স্কোর পরিবর্তনের কারণ লিখুন...",
        schoolHolidayStrikePlaceholder: "যেমন: স্কুল ছুটি, ধর্মঘট, ইত্যাদি",
        typeResetToConfirmPlaceholder: "নিশ্চিত করতে RESET টাইপ করুন",
        enterTotalPagesPlaceholder: "মোট পৃষ্ঠা দিন",
        
        // Missing Alert Messages
        pleaseProvideReasonForAbsence: "সংরক্ষণের আগে {name}-এর অনুপস্থিতির কারণ দিন।",
        pleaseProvideAbsenceReasonsFor: "অনুপস্থিতির কারণ দিন:",
        pleaseSelectValidCsvFile: "অনুগ্রহ করে একটি বৈধ CSV ফাইল নির্বাচন করুন। প্রথমে আপনার Excel ফাইলটি CSV হিসাবে সংরক্ষণ করুন।",
        pleaseSelectCsvFileFirst: "অনুগ্রহ করে প্রথমে একটি CSV ফাইল নির্বাচন করুন",
        noStudentDataFoundInCsv: "CSV ফাইলে কোন ছাত্রের তথ্য পাওয়া যায়নি। অনুগ্রহ করে ফরম্যাট পরীক্ষা করুন।",
        uploadFailed: "আপলোড ব্যর্থ",
        importError: "আমদানি ত্রুটি",
        networkErrorDuringUpload: "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।",
        csvDownloaded: "CSV ডাউনলোড হয়েছে",
        hijriDateAdjustmentUpdatedSuccessfully: "হিজরি তারিখ সমন্বয় সফলভাবে আপডেট হয়েছে",
        pleaseSelectBothStartAndEndDate: "অনুগ্রহ করে শুরু এবং শেষ উভয় তারিখ নির্বাচন করুন।",
        failedToLoadAttendanceCalendar: "উপস্থিতি ক্যালেন্ডার লোড করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
        rollNumberAlreadyExists: "রোল নম্বর {rollNumber} ইতিমধ্যে বিদ্যমান। অনুগ্রহ করে একটি ভিন্ন রোল নম্বর নির্বাচন করুন।",
        registrationFailed: "নিবন্ধন ব্যর্থ",
        networkErrorPleaseTryAgain: "নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        studentUpdatedSuccessfully: "ছাত্র সফলভাবে আপডেট হয়েছে",
        updateFailed: "আপডেট ব্যর্থ",
        deletionFailed: "মুছে ফেলায় ব্যর্থ",
        noStudentsToDelete: "মুছে ফেলার জন্য কোন ছাত্র নেই।",
        allStudentsDeletedSuccessfully: "সব {count} ছাত্র সফলভাবে মুছে ফেলা হয়েছে।",
        failedToDeleteAllStudents: "সব ছাত্র মুছতে ব্যর্থ",
        logoutFailedPleaseTryAgain: "লগআউট ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
        networkErrorDuringLogout: "লগআউটের সময় নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        
        // Teachers Corner Alert Messages
        pleaseEnterNumberBetween0And100: "অনুগ্রহ করে ০ থেকে ১০০ এর মধ্যে একটি নাম্বার দিন।",
        scoreUpdatedSuccessfully: "স্কোর সফলভাবে আপডেট হয়েছে।",
        problemUpdatingScore: "স্কোর আপডেট করতে সমস্যা হয়েছে।",
        connectionProblemPleaseTryAgain: "সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        pleaseWriteDetails: "অনুগ্রহ করে বিস্তারিত লিখুন।",
        noteSavedSuccessfully: "নোট সফলভাবে সংরক্ষিত হয়েছে।",
        problemSavingNote: "নোট সংরক্ষণ করতে সমস্যা হয়েছে।",
        noteUpdatedSuccessfully: "নোট সফলভাবে আপডেট হয়েছে।",
        problemUpdatingNote: "নোট আপডেট করতে সমস্যা হয়েছে।",
        noteDeletedSuccessfully: "নোট সফলভাবে মুছে ফেলা হয়েছে।",
        problemDeletingNote: "নোট মুছতে সমস্যা হয়েছে।",
        bookNotFoundPleaseRefresh: "বইটি পাওয়া যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।",
        pleaseProvideCorrectInformation: "অনুগ্রহ করে সঠিক তথ্য দিন।",
        bookNotFound: "বইটি পাওয়া যায়নি।",
        problemCreatingProgressRecord: "অগ্রগতি রেকর্ড তৈরি করতে সমস্যা হয়েছে।",
        problemUpdatingProgress: "অগ্রগতি আপডেট করতে সমস্যা হয়েছে।",
        bookProgressSaved: "বইয়ের অগ্রগতি সংরক্ষিত হয়েছে।",
        pleaseGoToSettingsToAddNewBook: "নতুন বই যোগ করার জন্য অনুগ্রহ করে Settings ট্যাবে যান।",
        bookDeletedFromLocalDisplay: "বইটি মুছে ফেলা হয়েছে। (স্থানীয় প্রদর্শন থেকে)",
        tarbiyahGoalsSaved: "তরবিয়াহ লক্ষ্যগুলি সংরক্ষিত হয়েছে।",
        
        // Modal Titles
        scoreManagement: "স্কোর ব্যবস্থাপনা",
        viewAttendance: "উপস্থিতি দেখুন",
        classAnalysis: "শ্রেণী বিশ্লেষণ",
        teacherLogbook: "শিক্ষকের লগবুক"
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
    updateTeachersCornerTexts();
}

// Update header texts
async function updateHeaderTexts() {
    let savedName = t('appTitle'); // Default fallback
    
    try {
        const response = await fetch('/api/settings/appName');
        if (response.ok) {
            const data = await response.json();
            savedName = data.value || t('appTitle');
        } else {
            // Fallback to localStorage
            savedName = localStorage.getItem('madaniMaktabAppName') || t('appTitle');
        }
    } catch (error) {
        console.error('Error loading app name from database:', error);
        // Fallback to localStorage
        savedName = localStorage.getItem('madaniMaktabAppName') || t('appTitle');
    }
    
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
    const navTexts = ['dashboard', 'registerStudent', 'dailyAttendance', 'reports', 'teachersCorner', 'settings'];
    
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
    
    const saveBtn = document.querySelector('#attendance .btn-save-attendance');
    if (saveBtn) {
        saveBtn.innerHTML = `<i class="fas fa-save"></i> ${t('saveAttendance')}`;
    }
    
    const allClassesOption = document.querySelector('#educationClassFilter option[value=""]');
    if (allClassesOption) {
        allClassesOption.textContent = t('allClasses');
    }
    
    // Update bulk action buttons
    const bulkButtons = document.querySelectorAll('.bulk-actions .btn');
    if (bulkButtons.length >= 4) {
        bulkButtons[0].innerHTML = `<i class="fas fa-check-double"></i> ${t('markAllPresent')}`;
        bulkButtons[1].innerHTML = `<i class="fas fa-user-slash"></i> ${t('markAllAbsent')}`;
        bulkButtons[2].innerHTML = `<i class="fas fa-eraser"></i> ${t('markAllNeutral')}`;
        bulkButtons[3].innerHTML = `<i class="fas fa-copy"></i> ${t('copyPreviousDay')}`;
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
    
    // Update elements with data-translate attributes
    const translateElements = document.querySelectorAll('[data-translate]');
    translateElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (key && t(key) !== key) {
            element.textContent = t(key);
        }
    });
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
    if (settingsTitles.length >= 5) {
        settingsTitles[4].textContent = t('dataManagement');
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
    
    // Update data management section texts
    const dataTranslateElements = document.querySelectorAll('[data-translate]');
    dataTranslateElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            element.textContent = t(key);
        }
    });
}

// Update teachers corner texts
function updateTeachersCornerTexts() {
    const educationTitle = document.querySelector('#education h2');
    if (educationTitle) {
        educationTitle.textContent = t('EducationProgressTracking');
    }
    
    const bookProgressTitle = document.querySelector('#education .education-header h3');
    if (bookProgressTitle) {
        bookProgressTitle.textContent = t('bookProgressManagement');
    }
    
    const addBookBtn = document.querySelector('#education .education-actions .btn-primary');
    if (addBookBtn) {
        addBookBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('addNewBook')}`;
    }
    
    const deleteAllBtn = document.querySelector('#education .education-actions .btn-danger');
    if (deleteAllBtn) {
        deleteAllBtn.innerHTML = `<i class="fas fa-trash-alt"></i> ${t('deleteAllData')}`;
    }
    
    // Update form elements
    const formTitle = document.querySelector('#addBookForm .form-header h3');
    if (formTitle) {
        formTitle.textContent = t('addNewBookProgress');
    }
    
    const backBtn = document.querySelector('#addBookForm .form-header .btn');
    if (backBtn) {
        backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> ${t('backToList')}`;
    }
    
    // Update form labels
    const formLabels = document.querySelectorAll('#addBookForm label');
    const labelTexts = ['bookClass', 'bookSubject', 'bookName', 'totalPages', 'completedPages', 'bookNotes'];
    
    formLabels.forEach((label, index) => {
        if (labelTexts[index]) {
            const required = label.textContent.includes('*') ? ' *' : '';
            label.textContent = t(labelTexts[index]) + required;
        }
    });
    
    const saveBookBtn = document.querySelector('#bookForm button[type="submit"]');
    if (saveBookBtn) {
        saveBookBtn.innerHTML = `<i class="fas fa-save"></i> ${t('saveBookProgress')}`;
    }
    
    // Update edit modal
    const editModalTitle = document.querySelector('#editBookModal .modal-header h3');
    if (editModalTitle) {
        editModalTitle.textContent = t('editBookDetails');
    }
    
    const closeEditBtn = document.querySelector('#editBookModal .modal-header .btn');
    if (closeEditBtn) {
        closeEditBtn.innerHTML = `<i class="fas fa-times"></i>`;
    }
    
    // Update edit form labels
    const editFormLabels = document.querySelectorAll('#editBookForm label');
    editFormLabels.forEach((label, index) => {
        if (labelTexts[index]) {
            const required = label.textContent.includes('*') ? ' *' : '';
            label.textContent = t(labelTexts[index]) + required;
        }
    });
    
    // Refresh the books list to update dynamically generated content
    if (typeof displayBooksList === 'function') {
        displayBooksList();
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
        case 'teachersCorner':
            updateTeachersCornerTexts();
            break;
        case 'settings':
            updateSettingsTexts();
            break;
        case 'student-detail':
            updateStudentDetailTexts();
            break;
    }
}

// Export the translation function
export { t, changeLanguage, initializeLanguage, updateAllTexts };