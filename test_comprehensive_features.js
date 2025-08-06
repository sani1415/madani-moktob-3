/**
 * Comprehensive Feature Test Suite
 * 
 * This test file verifies that both the academic year start date functionality
 * and the report generation are working correctly after the hijri.js file combination.
 * 
 * Usage:
 * 1. Open the Madani Maktab application in your browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire file into the console
 * 4. Press Enter to run all tests
 */

console.log('🧪 Starting Comprehensive Feature Tests...');
console.log('==========================================');

// Test Results Tracking
let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

function runTest(testName, testFunction) {
    testResults.total++;
    try {
        const result = testFunction();
        if (result === true) {
            console.log(`✅ PASS: ${testName}`);
            testResults.passed++;
        } else {
            console.log(`❌ FAIL: ${testName} - ${result}`);
            testResults.failed++;
        }
    } catch (error) {
        console.log(`❌ FAIL: ${testName} - Error: ${error.message}`);
        testResults.failed++;
    }
}

function displayTestSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! All features are working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
}

// ===== ACADEMIC YEAR START DATE TESTS =====

console.log('\n📚 Testing Academic Year Start Date Functionality...');

runTest('Academic year functions exist', () => {
    const requiredFunctions = [
        'initializeAcademicYearStart',
        'saveAcademicYearStart',
        'clearAcademicYearStart',
        'displayAcademicYearStart',
        'updateDateRestrictions',
        'clearDateRestrictions'
    ];
    
    for (const funcName of requiredFunctions) {
        if (typeof window[funcName] !== 'function') {
            return `Function ${funcName} is not available`;
        }
    }
    return true;
});

runTest('Academic year DOM elements exist', () => {
    const requiredElements = [
        'academicYearStartInput',
        'academicYearStartDisplay',
        'currentAcademicYearDisplay'
    ];
    
    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            return `Element with ID '${elementId}' not found`;
        }
    }
    return true;
});

runTest('Academic year initialization works', () => {
    // Test with no saved date
    localStorage.removeItem('madaniMaktabAcademicYearStart');
    window.academicYearStartDate = null;
    
    if (typeof initializeAcademicYearStart === 'function') {
        initializeAcademicYearStart();
    }
    
    if (window.academicYearStartDate !== null) {
        return 'Initialization should not set date when none is saved';
    }
    
    // Test with saved date
    const testDate = '2024-06-01';
    localStorage.setItem('madaniMaktabAcademicYearStart', testDate);
    
    if (typeof initializeAcademicYearStart === 'function') {
        initializeAcademicYearStart();
    }
    
    if (window.academicYearStartDate !== testDate) {
        return `Expected ${testDate}, got ${window.academicYearStartDate}`;
    }
    
    return true;
});

runTest('Academic year save functionality', () => {
    const testDate = '2024-07-01';
    const input = document.getElementById('academicYearStartInput');
    
    if (input) {
        input.value = testDate;
        
        if (typeof saveAcademicYearStart === 'function') {
            saveAcademicYearStart();
        }
        
        const saved = localStorage.getItem('madaniMaktabAcademicYearStart');
        if (saved !== testDate) {
            return `Expected ${testDate} in localStorage, got ${saved}`;
        }
        
        if (window.academicYearStartDate !== testDate) {
            return `Expected ${testDate} in global variable, got ${window.academicYearStartDate}`;
        }
    }
    
    return true;
});

// ===== HIJRI CALENDAR TESTS =====

console.log('\n🌙 Testing Hijri Calendar Functionality...');

runTest('Hijri calendar functions exist', () => {
    const requiredFunctions = [
        'initializeHijriSettings',
        'updateHijriAdjustment',
        'updateHijriPreview',
        'updateDashboardWithHijri',
        'updateAttendancePageHijri'
    ];
    
    for (const funcName of requiredFunctions) {
        if (typeof window[funcName] !== 'function') {
            return `Function ${funcName} is not available`;
        }
    }
    return true;
});

runTest('Hijri calendar instance exists', () => {
    if (!window.hijriCalendar) {
        return 'Hijri calendar instance not found';
    }
    
    if (typeof window.hijriCalendar.getCurrentHijriDate !== 'function') {
        return 'Hijri calendar methods not available';
    }
    
    return true;
});

runTest('Hijri calendar date conversion', () => {
    if (!window.hijriCalendar) {
        return 'Hijri calendar not available';
    }
    
    const today = new Date();
    const hijriDate = window.hijriCalendar.getCurrentHijriDate();
    
    if (!hijriDate || !hijriDate.year || !hijriDate.month || !hijriDate.day) {
        return 'Hijri date conversion failed';
    }
    
    return true;
});

// ===== REPORT GENERATION TESTS =====

console.log('\n📊 Testing Report Generation Functionality...');

runTest('Report generation functions exist', () => {
    const requiredFunctions = [
        'generateReport',
        'generateFromBeginningReport',
        'calculateStudentAttendanceStats',
        'getStudentAbsentDays',
        'showAbsentDaysModal',
        'addHijriToReports'
    ];
    
    for (const funcName of requiredFunctions) {
        if (typeof window[funcName] !== 'function') {
            return `Function ${funcName} is not available`;
        }
    }
    return true;
});

runTest('Report DOM elements exist', () => {
    const requiredElements = [
        'reportStartDate',
        'reportEndDate',
        'reportResults'
    ];
    
    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            return `Element with ID '${elementId}' not found`;
        }
    }
    return true;
});

runTest('Student attendance stats calculation', () => {
    if (typeof calculateStudentAttendanceStats !== 'function') {
        return 'calculateStudentAttendanceStats function not available';
    }
    
    // Create a mock student and attendance data
    const mockStudent = {
        id: 'test-student',
        name: 'Test Student',
        class: 'প্রথম শ্রেণি'
    };
    
    const mockAttendance = {
        '2024-01-15': {
            'test-student': { status: 'present' }
        },
        '2024-01-16': {
            'test-student': { status: 'absent' }
        }
    };
    
    // Temporarily set attendance data
    const originalAttendance = window.attendance;
    window.attendance = mockAttendance;
    
    try {
        const stats = calculateStudentAttendanceStats(mockStudent, '2024-01-15', '2024-01-16');
        
        if (!stats || typeof stats.present !== 'number' || typeof stats.absent !== 'number') {
            return 'Stats calculation returned invalid data';
        }
        
        return true;
    } finally {
        // Restore original attendance data
        window.attendance = originalAttendance;
    }
});

runTest('Hijri integration in reports', () => {
    if (typeof addHijriToReports !== 'function') {
        return 'addHijriToReports function not available';
    }
    
    if (!window.hijriCalendar) {
        return 'Hijri calendar not available for report integration';
    }
    
    // Test the function doesn't crash
    try {
        addHijriToReports('2024-01-15', '2024-01-16');
        return true;
    } catch (error) {
        return `addHijriToReports crashed: ${error.message}`;
    }
});

// ===== INTEGRATION TESTS =====

console.log('\n🔗 Testing Integration Between Features...');

runTest('Academic year affects date restrictions', () => {
    const testDate = '2024-06-01';
    window.academicYearStartDate = testDate;
    
    if (typeof updateDateRestrictions === 'function') {
        updateDateRestrictions();
    }
    
    const attendanceInput = document.getElementById('attendanceDate');
    if (attendanceInput && attendanceInput.min !== testDate) {
        return `Date restrictions not applied: expected ${testDate}, got ${attendanceInput.min}`;
    }
    
    return true;
});

runTest('Hijri calendar works with academic year', () => {
    if (!window.hijriCalendar) {
        return 'Hijri calendar not available';
    }
    
    const testDate = '2024-06-01';
    const hijriDate = window.hijriCalendar.getHijriForDate(testDate);
    
    if (!hijriDate || !hijriDate.year) {
        return 'Hijri date conversion for academic year date failed';
    }
    
    return true;
});

runTest('Report generation with Hijri dates', () => {
    if (!window.hijriCalendar) {
        return 'Hijri calendar not available for report generation';
    }
    
    if (typeof addHijriToReports !== 'function') {
        return 'addHijriToReports function not available';
    }
    
    // Test that both features work together
    const testStartDate = '2024-06-01';
    const testEndDate = '2024-06-30';
    
    try {
        addHijriToReports(testStartDate, testEndDate);
        return true;
    } catch (error) {
        return `Report generation with Hijri dates failed: ${error.message}`;
    }
});

// ===== PERSISTENCE TESTS =====

console.log('\n💾 Testing Data Persistence...');

runTest('Academic year persistence', () => {
    const testDate = '2024-08-01';
    localStorage.setItem('madaniMaktabAcademicYearStart', testDate);
    
    // Simulate page reload
    window.academicYearStartDate = null;
    
    if (typeof initializeAcademicYearStart === 'function') {
        initializeAcademicYearStart();
    }
    
    if (window.academicYearStartDate !== testDate) {
        return `Persistence failed: expected ${testDate}, got ${window.academicYearStartDate}`;
    }
    
    return true;
});

runTest('Hijri adjustment persistence', () => {
    const testAdjustment = 1;
    localStorage.setItem('hijriAdjustment', testAdjustment.toString());
    
    if (!window.hijriCalendar) {
        return 'Hijri calendar not available for adjustment test';
    }
    
    const adjustment = window.hijriCalendar.getAdjustment();
    if (adjustment !== testAdjustment) {
        return `Hijri adjustment persistence failed: expected ${testAdjustment}, got ${adjustment}`;
    }
    
    return true;
});

// ===== ERROR HANDLING TESTS =====

console.log('\n⚠️ Testing Error Handling...');

runTest('Empty academic year date handling', () => {
    const input = document.getElementById('academicYearStartInput');
    
    if (input) {
        input.value = '';
        
        // Should not crash
        if (typeof saveAcademicYearStart === 'function') {
            try {
                saveAcademicYearStart();
                return true;
            } catch (error) {
                return `saveAcademicYearStart crashed with empty date: ${error.message}`;
            }
        }
    }
    
    return true;
});

runTest('Invalid date handling in reports', () => {
    if (typeof calculateStudentAttendanceStats !== 'function') {
        return 'calculateStudentAttendanceStats not available';
    }
    
    const mockStudent = { id: 'test', name: 'Test', class: 'প্রথম শ্রেণি' };
    
    try {
        // Test with invalid dates
        const stats = calculateStudentAttendanceStats(mockStudent, 'invalid-date', 'invalid-date');
        
        if (!stats) {
            return 'calculateStudentAttendanceStats should handle invalid dates gracefully';
        }
        
        return true;
    } catch (error) {
        return `calculateStudentAttendanceStats crashed with invalid dates: ${error.message}`;
    }
});

// Run all tests and display summary
console.log('\n🏁 Running all comprehensive tests...\n');
displayTestSummary();

// Additional manual testing instructions
console.log('\n📋 Manual Testing Checklist:');
console.log('============================');
console.log('1. Academic Year Start Date:');
console.log('   - Go to Settings → Academic Year Settings');
console.log('   - Set a date and verify it appears below');
console.log('   - Refresh page and verify persistence');
console.log('   - Test date restrictions in Attendance/Reports');
console.log('');
console.log('2. Hijri Calendar:');
console.log('   - Go to Settings → Hijri Date Settings');
console.log('   - Test adjustment options (+1, -1, 0)');
console.log('   - Verify Hijri dates appear on dashboard');
console.log('   - Check Hijri dates in attendance page');
console.log('');
console.log('3. Report Generation:');
console.log('   - Go to Reports page');
console.log('   - Generate a report with date range');
console.log('   - Verify Hijri dates appear in report header');
console.log('   - Test "From Beginning" report option');
console.log('   - Check student detail views');
console.log('');
console.log('4. Integration:');
console.log('   - Set academic year start date');
console.log('   - Verify date restrictions work with Hijri dates');
console.log('   - Generate reports and check both Gregorian and Hijri dates');
console.log('   - Test all features work together seamlessly');

console.log('\n🎯 Comprehensive test completed! Check the results above.'); 