/**
 * Academic Year Start Date Feature Test Suite
 * 
 * This test file can be run in the browser console to verify that the academic year
 * start date functionality is working correctly after the hijri.js file combination.
 * 
 * Usage:
 * 1. Open the Madani Maktab application in your browser
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire file into the console
 * 4. Press Enter to run all tests
 * 
 * The tests will automatically run and display results in the console.
 */

console.log('🧪 Starting Academic Year Start Date Feature Tests...');
console.log('==================================================');

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
        console.log('\n🎉 All tests passed! Academic Year Start Date feature is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
}

// Test 1: Check if required functions exist
runTest('Required functions exist', () => {
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

// Test 2: Check if required DOM elements exist
runTest('Required DOM elements exist', () => {
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

// Test 3: Test localStorage functionality
runTest('localStorage functionality', () => {
    const testKey = 'madaniMaktabAcademicYearStart';
    const testDate = '2024-01-15';
    
    // Test setting
    localStorage.setItem(testKey, testDate);
    const retrieved = localStorage.getItem(testKey);
    
    // Test removing
    localStorage.removeItem(testKey);
    const afterRemove = localStorage.getItem(testKey);
    
    if (retrieved !== testDate) {
        return 'localStorage set/get not working';
    }
    
    if (afterRemove !== null) {
        return 'localStorage remove not working';
    }
    
    return true;
});

// Test 4: Test initialization with no saved date
runTest('Initialization with no saved date', () => {
    // Clear any existing date
    localStorage.removeItem('madaniMaktabAcademicYearStart');
    window.academicYearStartDate = null;
    
    // Run initialization
    if (typeof initializeAcademicYearStart === 'function') {
        initializeAcademicYearStart();
    }
    
    // Check that no date is set
    if (window.academicYearStartDate !== null) {
        return 'Initialization should not set date when none is saved';
    }
    
    return true;
});

// Test 5: Test initialization with saved date
runTest('Initialization with saved date', () => {
    const testDate = '2024-01-15';
    
    // Set a test date
    localStorage.setItem('madaniMaktabAcademicYearStart', testDate);
    
    // Run initialization
    if (typeof initializeAcademicYearStart === 'function') {
        initializeAcademicYearStart();
    }
    
    // Check that date is loaded
    if (window.academicYearStartDate !== testDate) {
        return `Expected ${testDate}, got ${window.academicYearStartDate}`;
    }
    
    return true;
});

// Test 6: Test save academic year start date
runTest('Save academic year start date', () => {
    const testDate = '2024-06-01';
    
    // Set input value
    const input = document.getElementById('academicYearStartInput');
    if (input) {
        input.value = testDate;
    }
    
    // Run save function
    if (typeof saveAcademicYearStart === 'function') {
        saveAcademicYearStart();
    }
    
    // Check localStorage
    const saved = localStorage.getItem('madaniMaktabAcademicYearStart');
    if (saved !== testDate) {
        return `Expected ${testDate} in localStorage, got ${saved}`;
    }
    
    // Check global variable
    if (window.academicYearStartDate !== testDate) {
        return `Expected ${testDate} in global variable, got ${window.academicYearStartDate}`;
    }
    
    return true;
});

// Test 7: Test display academic year start date
runTest('Display academic year start date', () => {
    const testDate = '2024-06-01';
    window.academicYearStartDate = testDate;
    
    // Run display function
    if (typeof displayAcademicYearStart === 'function') {
        displayAcademicYearStart();
    }
    
    // Check input value
    const input = document.getElementById('academicYearStartInput');
    if (input && input.value !== testDate) {
        return `Input should show ${testDate}, got ${input.value}`;
    }
    
    // Check display span
    const displaySpan = document.getElementById('academicYearStartDisplay');
    if (displaySpan && !displaySpan.textContent.includes('2024')) {
        return 'Display span should show formatted date';
    }
    
    // Check display container visibility
    const displayContainer = document.getElementById('currentAcademicYearDisplay');
    if (displayContainer && displayContainer.style.display === 'none') {
        return 'Display container should be visible when date is set';
    }
    
    return true;
});

// Test 8: Test clear academic year start date
runTest('Clear academic year start date', () => {
    // Set a test date first
    const testDate = '2024-06-01';
    window.academicYearStartDate = testDate;
    localStorage.setItem('madaniMaktabAcademicYearStart', testDate);
    
    // Mock confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    
    // Run clear function
    if (typeof clearAcademicYearStart === 'function') {
        clearAcademicYearStart();
    }
    
    // Restore original confirm
    window.confirm = originalConfirm;
    
    // Check localStorage
    const saved = localStorage.getItem('madaniMaktabAcademicYearStart');
    if (saved !== null) {
        return 'localStorage should be cleared';
    }
    
    // Check global variable
    if (window.academicYearStartDate !== null) {
        return 'Global variable should be cleared';
    }
    
    return true;
});

// Test 9: Test date restrictions
runTest('Date restrictions functionality', () => {
    const testDate = '2024-06-01';
    window.academicYearStartDate = testDate;
    
    // Run update restrictions
    if (typeof updateDateRestrictions === 'function') {
        updateDateRestrictions();
    }
    
    // Check attendance date input
    const attendanceInput = document.getElementById('attendanceDate');
    if (attendanceInput && attendanceInput.min !== testDate) {
        return `Attendance date min should be ${testDate}, got ${attendanceInput.min}`;
    }
    
    // Check report date inputs
    const reportStartInput = document.getElementById('reportStartDate');
    if (reportStartInput && reportStartInput.min !== testDate) {
        return `Report start date min should be ${testDate}, got ${reportStartInput.min}`;
    }
    
    const reportEndInput = document.getElementById('reportEndDate');
    if (reportEndInput && reportEndInput.min !== testDate) {
        return `Report end date min should be ${testDate}, got ${reportEndInput.min}`;
    }
    
    return true;
});

// Test 10: Test clear date restrictions
runTest('Clear date restrictions', () => {
    // Run clear restrictions
    if (typeof clearDateRestrictions === 'function') {
        clearDateRestrictions();
    }
    
    // Check that restrictions are cleared
    const attendanceInput = document.getElementById('attendanceDate');
    if (attendanceInput && attendanceInput.min !== '') {
        return 'Attendance date min should be cleared';
    }
    
    const reportStartInput = document.getElementById('reportStartDate');
    if (reportStartInput && reportStartInput.min !== '') {
        return 'Report start date min should be cleared';
    }
    
    return true;
});

// Test 11: Test date validation (future dates)
runTest('Date validation - future dates', () => {
    const futureDate = '2025-12-31';
    const input = document.getElementById('academicYearStartInput');
    
    if (input) {
        input.value = futureDate;
        
        // Run save function
        if (typeof saveAcademicYearStart === 'function') {
            saveAcademicYearStart();
        }
        
        // Check that future date is accepted
        if (window.academicYearStartDate !== futureDate) {
            return 'Future dates should be accepted';
        }
    }
    
    return true;
});

// Test 12: Test date validation (past dates)
runTest('Date validation - past dates', () => {
    const pastDate = '2020-01-01';
    const input = document.getElementById('academicYearStartInput');
    
    if (input) {
        input.value = pastDate;
        
        // Run save function
        if (typeof saveAcademicYearStart === 'function') {
            saveAcademicYearStart();
        }
        
        // Check that past date is accepted (no validation restrictions)
        if (window.academicYearStartDate !== pastDate) {
            return 'Past dates should be accepted';
        }
    }
    
    return true;
});

// Test 13: Test empty date handling
runTest('Empty date handling', () => {
    const input = document.getElementById('academicYearStartInput');
    
    if (input) {
        input.value = '';
        
        // Run save function
        if (typeof saveAcademicYearStart === 'function') {
            saveAcademicYearStart();
        }
        
        // Should show error modal (we can't test this directly, but we can check the function doesn't crash)
        return true;
    }
    
    return true;
});

// Test 14: Test integration with other modules
runTest('Integration with other modules', () => {
    // Check that the date is accessible from other modules
    if (typeof window.academicYearStartDate === 'undefined') {
        return 'Academic year start date should be accessible globally';
    }
    
    // Check that formatDate function is available
    if (typeof window.formatDate !== 'function') {
        return 'formatDate function should be available globally';
    }
    
    return true;
});

// Test 15: Test persistence across page reload
runTest('Persistence across page reload simulation', () => {
    const testDate = '2024-07-01';
    
    // Set a date
    localStorage.setItem('madaniMaktabAcademicYearStart', testDate);
    
    // Simulate page reload by re-initializing
    window.academicYearStartDate = null;
    
    // Run initialization
    if (typeof initializeAcademicYearStart === 'function') {
        initializeAcademicYearStart();
    }
    
    // Check that date is restored
    if (window.academicYearStartDate !== testDate) {
        return `Date should persist: expected ${testDate}, got ${window.academicYearStartDate}`;
    }
    
    return true;
});

// Run all tests and display summary
console.log('\n🏁 Running all tests...\n');
displayTestSummary();

// Additional manual testing instructions
console.log('\n📋 Manual Testing Checklist:');
console.log('============================');
console.log('1. Go to Settings page');
console.log('2. Set an academic year start date (e.g., 2024-06-01)');
console.log('3. Verify the date appears below the input field');
console.log('4. Refresh the page and verify the date persists');
console.log('5. Go to Attendance page and verify date restrictions');
console.log('6. Go to Reports page and verify date restrictions');
console.log('7. Try to set a date before the academic year start - should be restricted');
console.log('8. Clear the academic year start date and verify restrictions are removed');
console.log('9. Test with different date formats and edge cases');

console.log('\n🎯 Test completed! Check the results above.'); 