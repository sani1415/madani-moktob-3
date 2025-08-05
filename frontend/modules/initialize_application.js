document.addEventListener('DOMContentLoaded', async function() {
    try {
        initializeLanguage();
        initializeAppName();
        await initializeAppWithDatabase();
        console.log('Madani Maktab app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showModal('Error', 'Failed to initialize the application. Please refresh the page.');
    }
});

async function initializeAppWithDatabase() {
    try {
        console.log('Starting app initialization...');
        
        // Load data from database only
            await loadDataFromDatabase();
        
        console.log('Data loaded successfully, initializing UI...');
        
        updateClassDropdowns();
        displayClasses();
        displayHolidays();
        await loadBooks();
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('attendanceDate').value = today;
        document.getElementById('reportStartDate').value = today;
        document.getElementById('reportEndDate').value = today;
        
        // Initialize attendance for today if not exists
        if (!attendance[today]) {
            initializeTodayAttendance();
        }
        
        // Load attendance for today and update dashboard
        loadAttendanceForDate();
        
        // Update date input max to prevent future date selection
        updateDateInputMax();
        setTimeout(() => {
            updateDashboard();
            console.log('Dashboard updated after attendance load');
        }, 100);
        
        initializeHijriSettings();
        initializeAcademicYearStart();
        
        // Listen for date changes
        document.getElementById('attendanceDate').addEventListener('change', function() {
            loadAttendanceForDate();
            updateAttendancePageHijri();
        });
        document.getElementById('classFilter').addEventListener('change', function() {
            loadAttendanceForDate();
        });
        
        // Initialize student list display
        displayStudentsList();
        
        console.log('App initialization completed successfully');
        
    } catch (error) {
        console.error('App initialization failed:', error);
        showModal('Database Error', 'Failed to connect to the database. Please ensure the server is running and try refreshing the page.');
    }
}

async function loadDataFromDatabase() {
    try {
        // Load students from database
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
            students = await studentsResponse.json();
        } else {
            throw new Error('Failed to load students from database');
        }
        
        // Load attendance from database
        const attendanceResponse = await fetch('/api/attendance');
        if (attendanceResponse.ok) {
            const attendanceData = await attendanceResponse.json();
            console.log('Loaded attendance data from database:', attendanceData);
            attendance = attendanceData || {};
            
            // Initialize saved dates set - all existing dates in database are considered saved
            savedAttendanceDates.clear();
            Object.keys(attendance).forEach(date => {
                if (attendance[date] && Object.keys(attendance[date]).length > 0) {
                    savedAttendanceDates.add(date);
                }
            });
            
            console.log('Final attendance object:', attendance);
            console.log('Saved attendance dates:', Array.from(savedAttendanceDates));
        } else {
            throw new Error('Failed to load attendance from database');
        }
        
        // Load holidays from database
        const holidaysResponse = await fetch('/api/holidays');
        if (holidaysResponse.ok) {
            holidays = await holidaysResponse.json();
        } else {
            throw new Error('Failed to load holidays from database');
        }
        
        // Set default classes
        classes = ['প্রথম শ্রেণি', 'দ্বিতীয় শ্রেণি', 'তৃতীয় শ্রেণি', 'চতুর্থ শ্রেণি', 'পঞ্চম শ্রেণি'];
        
        console.log(`Loaded ${students.length} students from database`);
        
        // Update dashboard after data load
        updateDashboard();
        
        // Refresh attendance calendar if it's visible to show correct attendance data
        refreshAttendanceCalendarIfVisible();
        
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error; // Re-throw to be handled by calling function
    }
}
