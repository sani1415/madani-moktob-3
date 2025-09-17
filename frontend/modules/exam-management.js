// Exam Management Module for Teachers Corner Integration
// This module handles all exam-related functionality for individual classes

// Global variables for exam management
let currentClassExams = [];
let currentClassExamResults = {};
let examGradeChart = null;

// Initialize exam management for a specific class
async function initClassExamManagement(className) {
    console.log(`🎓 Initializing exam management for class: ${className}`);
    
    try {
        // Load existing exams for this class from database/localStorage
        await loadClassExams(className);
        
        // Render the exam management section
        renderClassExamSection(className);
        
        console.log(`✅ Exam management initialized for class: ${className}`);
    } catch (error) {
        console.error(`❌ Error initializing exam management for class ${className}:`, error);
    }
}

// Load all exams for a specific class
async function loadClassExams(className) {
    try {
        // For now, load from localStorage (will be replaced with API call)
        const allExamSessions = JSON.parse(localStorage.getItem('examSessions')) || [];
        const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
        
        // Filter exams for this specific class
        currentClassExams = allExamSessions.filter(session => session.class === className);
        
        // Filter results for this class
        currentClassExamResults = {};
        Object.keys(allExamResults).forEach(sessionKey => {
            if (sessionKey.includes(className)) {
                currentClassExamResults[sessionKey] = allExamResults[sessionKey];
            }
        });
        
        console.log(`📚 Loaded ${currentClassExams.length} exams for class: ${className}`);
        console.log(`📊 Loaded results for ${Object.keys(currentClassExamResults).length} exam sessions`);
        
    } catch (error) {
        console.error(`❌ Error loading exams for class ${className}:`, error);
        currentClassExams = [];
        currentClassExamResults = {};
    }
}

// Render the exam management section in Teachers Corner
function renderClassExamSection(className) {
    const examSectionHTML = `
        <!-- Class Exam Management Section -->
        <div class="bg-white p-6 rounded-lg shadow-md mt-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold text-gray-700">
                    <i class="fas fa-graduation-cap text-blue-500"></i> ${className} - পরীক্ষা ব্যবস্থাপনা
                </h3>
                <button onclick="createNewClassExam('${className}')" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <i class="fas fa-plus"></i> নতুন পরীক্ষা তৈরি করুন
                </button>
            </div>
            
            <!-- Exam Statistics Overview -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-blue-600" id="total-exams-count">0</div>
                            <div class="text-sm text-blue-700">মোট পরীক্ষা</div>
                        </div>
                        <i class="fas fa-clipboard-list text-blue-400 text-2xl"></i>
                    </div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-green-600" id="published-exams-count">0</div>
                            <div class="text-sm text-green-700">প্রকাশিত ফলাফল</div>
                        </div>
                        <i class="fas fa-check-circle text-green-400 text-2xl"></i>
                    </div>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-yellow-600" id="draft-exams-count">0</div>
                            <div class="text-sm text-yellow-700">খসড়া পরীক্ষা</div>
                        </div>
                        <i class="fas fa-edit text-yellow-400 text-2xl"></i>
                    </div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-purple-600" id="class-average-score">0%</div>
                            <div class="text-sm text-purple-700">গড় পারফরম্যান্স</div>
                        </div>
                        <i class="fas fa-chart-line text-purple-400 text-2xl"></i>
                    </div>
                </div>
            </div>
            
            <!-- Exam List -->
            <div class="mb-6">
                <h4 class="font-semibold text-gray-600 mb-3">সাম্প্রতিক পরীক্ষা সমূহ</h4>
                <div id="class-exam-list" class="space-y-3 max-h-80 overflow-y-auto">
                    <!-- Exam list will be rendered here -->
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="flex flex-wrap gap-3">
                <button onclick="viewAllClassExams('${className}')" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm">
                    <i class="fas fa-list"></i> সকল পরীক্ষা দেখুন
                </button>
                <button onclick="exportClassResults('${className}')" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 text-sm">
                    <i class="fas fa-download"></i> ফলাফল এক্সপোর্ট
                </button>
                <button onclick="classExamAnalytics('${className}')" class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm">
                    <i class="fas fa-chart-bar"></i> বিশ্লেষণ দেখুন
                </button>
            </div>
        </div>
    `;
    
    return examSectionHTML;
}

// Update exam statistics for the current class
function updateClassExamStats(className) {
    const totalExams = currentClassExams.length;
    const publishedExams = currentClassExams.filter(exam => exam.status === 'published').length;
    const draftExams = currentClassExams.filter(exam => exam.status === 'draft').length;
    
    // Calculate average performance across all published exams
    let totalPercentage = 0;
    let examCount = 0;
    
    currentClassExams.forEach(exam => {
        if (exam.status === 'published') {
            const sessionKey = `${exam.year}-${exam.term}-${exam.class}-${exam.id}`;
            const results = currentClassExamResults[sessionKey];
            if (results) {
                Object.keys(results).forEach(studentId => {
                    const { percentage } = calculateStudentTotals(studentId, sessionKey, exam.selectedBooks.map(b => b.id), exam.selectedBooks);
                    totalPercentage += percentage;
                    examCount++;
                });
            }
        }
    });
    
    const averageScore = examCount > 0 ? Math.round(totalPercentage / examCount) : 0;
    
    // Update DOM elements
    const totalElement = document.getElementById('total-exams-count');
    const publishedElement = document.getElementById('published-exams-count');
    const draftElement = document.getElementById('draft-exams-count');
    const averageElement = document.getElementById('class-average-score');
    
    if (totalElement) totalElement.textContent = totalExams;
    if (publishedElement) publishedElement.textContent = publishedExams;
    if (draftElement) draftElement.textContent = draftExams;
    if (averageElement) averageElement.textContent = averageScore + '%';
}

// Render the list of exams for the current class
function renderClassExamList(className) {
    const examListElement = document.getElementById('class-exam-list');
    if (!examListElement) return;
    
    if (currentClassExams.length === 0) {
        examListElement.innerHTML = `
            <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <i class="fas fa-clipboard-list text-4xl mb-3"></i>
                <p class="font-medium">এই শ্রেণীর জন্য কোন পরীক্ষা তৈরি করা হয়নি</p>
                <p class="text-sm">নতুন পরীক্ষা তৈরি করতে উপরের বোতাম ব্যবহার করুন</p>
            </div>
        `;
        return;
    }
    
    // Sort exams by date (newest first)
    const sortedExams = [...currentClassExams].sort((a, b) => 
        new Date(b.createdDate) - new Date(a.createdDate)
    );
    
    examListElement.innerHTML = sortedExams.map(exam => {
        const sessionKey = `${exam.year}-${exam.term}-${exam.class}-${exam.id}`;
        const results = currentClassExamResults[sessionKey] || {};
        const studentsInClass = window.students ? window.students.filter(s => s.class === className && s.status === 'active') : [];
        const completedResults = Object.keys(results).length;
        const progressPercentage = studentsInClass.length > 0 ? Math.round((completedResults / studentsInClass.length) * 100) : 0;
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer" onclick="openClassExam('${exam.id}')">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h5 class="font-semibold text-gray-800">${exam.name}</h5>
                        <p class="text-sm text-gray-600">${exam.year} - ${exam.term}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-calendar mr-1"></i>
                            ${new Date(exam.createdDate).toLocaleDateString('bn-BD')}
                        </p>
                        <div class="flex items-center gap-4 mt-2">
                            <span class="text-xs text-gray-600">
                                <i class="fas fa-book mr-1"></i>
                                ${exam.selectedBooks.length} বই
                            </span>
                            <span class="text-xs text-gray-600">
                                <i class="fas fa-users mr-1"></i>
                                ${studentsInClass.length} ছাত্র
                            </span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${getExamStatusClass(exam.status)}">
                            ${getExamStatusText(exam.status)}
                        </span>
                        <div class="mt-2 text-sm">
                            <div class="text-gray-600">ফলাফল এন্ট্রি:</div>
                            <div class="font-semibold ${progressPercentage === 100 ? 'text-green-600' : 'text-yellow-600'}">
                                ${completedResults}/${studentsInClass.length} (${progressPercentage}%)
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="flex gap-2 mt-3">
                    <button onclick="editClassExam('${exam.id}', event)" class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded" title="সম্পাদনা করুন">
                        <i class="fas fa-edit"></i> সম্পাদনা
                    </button>
                    <button onclick="viewClassExamResults('${exam.id}', event)" class="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded" title="ফলাফল দেখুন">
                        <i class="fas fa-chart-bar"></i> ফলাফল
                    </button>
                    <button onclick="duplicateClassExam('${exam.id}', event)" class="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded" title="কপি করুন">
                        <i class="fas fa-copy"></i> কপি
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Create new exam for the current class
function createNewClassExam(className) {
    console.log(`🆕 Creating new exam for class: ${className}`);
    
    // Open exam creation modal or redirect to exam creation page
    // For now, we'll use a simple modal approach
    showExamCreationModal(className);
}

// Show exam creation modal
function showExamCreationModal(className) {
    const modal = document.createElement('div');
    modal.id = 'exam-creation-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear - 1, currentYear, currentYear + 1];
    const availableTerms = ['Term 1', 'Term 2', 'Mid-term', 'Final', 'Monthly'];
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2">
            <div class="p-6 border-b flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">নতুন পরীক্ষা তৈরি করুন - ${className}</h3>
                <button onclick="closeExamCreationModal()" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div class="p-6 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="new-exam-year" class="block text-sm font-medium text-gray-700 mb-1">শিক্ষাবর্ষ</label>
                        <select id="new-exam-year" class="w-full border-gray-300 rounded-md shadow-sm p-2">
                            ${availableYears.map(year => `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="new-exam-term" class="block text-sm font-medium text-gray-700 mb-1">টার্ম/সেমিস্টার</label>
                        <select id="new-exam-term" class="w-full border-gray-300 rounded-md shadow-sm p-2">
                            ${availableTerms.map(term => `<option value="${term}">${term}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div>
                    <label for="new-exam-name" class="block text-sm font-medium text-gray-700 mb-1">পরীক্ষার নাম</label>
                    <input type="text" id="new-exam-name" class="w-full border-gray-300 rounded-md shadow-sm p-2" placeholder="যেমন: মাসিক পরীক্ষা, ত্রৈমাসিক পরীক্ষা">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">পরীক্ষার ধরন</label>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="exam-type" value="monthly" class="text-blue-600">
                            <span class="text-sm">মাসিক</span>
                        </label>
                        <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="exam-type" value="quarterly" class="text-blue-600" checked>
                            <span class="text-sm">ত্রৈমাসিক</span>
                        </label>
                        <label class="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="exam-type" value="annual" class="text-blue-600">
                            <span class="text-sm">বার্ষিক</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onclick="closeExamCreationModal()" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">বাতিল</button>
                <button onclick="proceedToBookSelection('${className}')" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">পরবর্তী: বই নির্বাচন</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close exam creation modal
function closeExamCreationModal() {
    const modal = document.getElementById('exam-creation-modal');
    if (modal) {
        modal.remove();
    }
}

// Proceed to book selection step
function proceedToBookSelection(className) {
    const year = document.getElementById('new-exam-year').value;
    const term = document.getElementById('new-exam-term').value;
    const examName = document.getElementById('new-exam-name').value.trim();
    const examType = document.querySelector('input[name="exam-type"]:checked').value;
    
    if (!examName) {
        alert('অনুগ্রহ করে পরীক্ষার নাম দিন।');
        return;
    }
    
    // Create new exam session object
    const newExamSession = {
        id: 'EX' + Date.now().toString(36).toUpperCase(),
        year,
        term,
        class: className,
        name: examName,
        type: examType,
        selectedBooks: [],
        status: 'draft',
        createdDate: new Date().toISOString(),
        createdBy: window.currentUser ? window.currentUser.username : 'system'
    };
    
    // Close current modal and open book selection
    closeExamCreationModal();
    showBookSelectionModal(newExamSession);
}

// Show book selection modal
function showBookSelectionModal(examSession) {
    const modal = document.createElement('div');
    modal.id = 'book-selection-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    // Get available books (from your existing book system)
    const availableBooks = window.books || [
        { id: 'B01', book_name: 'কায়দা', class_id: null },
        { id: 'B02', book_name: 'আমপারা', class_id: null },
        { id: 'B03', book_name: 'আখলাক', class_id: null },
        { id: 'B04', book_name: 'নাজেরা', class_id: null },
        { id: 'B05', book_name: 'মাসনুন দোয়া', class_id: null }
    ];
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3">
            <div class="p-6 border-b flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">বই নির্বাচন - ${examSession.name}</h3>
                <button onclick="closeBookSelectionModal()" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Available Books -->
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3">উপলব্ধ বই সমূহ</h4>
                        <div class="space-y-2 max-h-80 overflow-y-auto">
                            ${availableBooks.map(book => `
                                <div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onclick="selectBookForExam('${book.id}', '${book.book_name}')">
                                    <div class="flex justify-between items-center">
                                        <span class="font-medium">${book.book_name}</span>
                                        <button class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-plus-circle"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Selected Books -->
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3">নির্বাচিত বই সমূহ</h4>
                        <div id="selected-books-for-exam" class="space-y-2 max-h-80 overflow-y-auto">
                            <p class="text-gray-500 text-center py-8">কোন বই নির্বাচিত হয়নি</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onclick="closeBookSelectionModal()" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">বাতিল</button>
                <button onclick="createExamWithBooks('${examSession.id}')" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">পরীক্ষা তৈরি করুন</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store the current exam session for book selection
    window.currentExamSession = examSession;
}

// Helper functions for exam status
function getExamStatusClass(status) {
    const statusClasses = {
        'draft': 'bg-yellow-100 text-yellow-800',
        'published': 'bg-green-100 text-green-800',
        'completed': 'bg-blue-100 text-blue-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

function getExamStatusText(status) {
    const statusTexts = {
        'draft': 'খসড়া',
        'published': 'প্রকাশিত',
        'completed': 'সম্পন্ন'
    };
    return statusTexts[status] || status;
}

// Calculate student totals (adapted for the module)
function calculateStudentTotals(studentId, sessionKey, bookIds, booksData) {
    const studentResults = currentClassExamResults[sessionKey]?.[studentId] || {};
    let totalObtained = 0;
    let totalPossibleMarks = 0;
    
    bookIds.forEach(bookId => {
        const book = booksData.find(b => b.id === bookId);
        if (book) {
            const obtainedMarks = studentResults[bookId] || 0;
            totalObtained += obtainedMarks;
            // Only count towards total if student has marks for this book
            if (obtainedMarks > 0 || studentResults[bookId] === 0) {
                totalPossibleMarks += book.totalMarks;
            }
        }
    });
    
    const percentage = totalPossibleMarks > 0 ? Math.round((totalObtained / totalPossibleMarks) * 100) : 0;
    const grade = getExamGrade(percentage);
    return { total: totalObtained, percentage, grade, totalPossible: totalPossibleMarks };
}

// Grade calculation
function getExamGrade(percentage) {
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'A-';
    if (percentage >= 50) return 'B';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
}

// Placeholder functions for future implementation
function selectBookForExam(bookId, bookName) {
    console.log(`📚 Selected book: ${bookName} (${bookId})`);
    // Implementation will be added in next phase
}

function closeBookSelectionModal() {
    const modal = document.getElementById('book-selection-modal');
    if (modal) modal.remove();
}

function createExamWithBooks(examId) {
    console.log(`✅ Creating exam with ID: ${examId}`);
    // Implementation will be added in next phase
}

function openClassExam(examId) {
    console.log(`📖 Opening exam: ${examId}`);
    // Implementation will be added in next phase
}

function editClassExam(examId, event) {
    event.stopPropagation();
    console.log(`✏️ Editing exam: ${examId}`);
    // Implementation will be added in next phase
}

function viewClassExamResults(examId, event) {
    event.stopPropagation();
    console.log(`📊 Viewing results for exam: ${examId}`);
    // Implementation will be added in next phase
}

function duplicateClassExam(examId, event) {
    event.stopPropagation();
    console.log(`📋 Duplicating exam: ${examId}`);
    // Implementation will be added in next phase
}

function viewAllClassExams(className) {
    console.log(`📚 Viewing all exams for class: ${className}`);
    // Implementation will be added in next phase
}

function exportClassResults(className) {
    console.log(`📤 Exporting results for class: ${className}`);
    // Implementation will be added in next phase
}

function classExamAnalytics(className) {
    console.log(`📈 Showing analytics for class: ${className}`);
    // Implementation will be added in next phase
}

// Export functions for use in Teachers Corner
export {
    initClassExamManagement,
    loadClassExams,
    renderClassExamSection,
    updateClassExamStats,
    renderClassExamList,
    createNewClassExam,
    showExamCreationModal,
    closeExamCreationModal,
    proceedToBookSelection,
    showBookSelectionModal,
    selectBookForExam,
    closeBookSelectionModal,
    createExamWithBooks,
    openClassExam,
    editClassExam,
    viewClassExamResults,
    duplicateClassExam,
    viewAllClassExams,
    exportClassResults,
    classExamAnalytics,
    calculateStudentTotals,
    getExamGrade,
    getExamStatusClass,
    getExamStatusText
};
