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
                    <button onclick="deleteClassExam('${exam.id}', event)" class="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded" title="মুছে ফেলুন">
                        <i class="fas fa-trash"></i> মুছুন
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
async function proceedToBookSelection(className) {
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
    await showBookSelectionModal(newExamSession);
}

// Show book selection modal
async function showBookSelectionModal(examSession) {
    const modal = document.createElement('div');
    modal.id = 'book-selection-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    // Load books from API
    let allBooks = [];
    try {
        console.log('📚 Loading books from API for exam...');
        const response = await fetch('/api/books');
        if (response.ok) {
            allBooks = await response.json();
            console.log(`✅ Loaded ${allBooks.length} total books from API:`, allBooks);
        } else {
            console.error('❌ Failed to load books from API');
        }
    } catch (error) {
        console.error('❌ Error loading books:', error);
    }
    
    // Fallback to window.books if API fails
    if (allBooks.length === 0) {
        allBooks = window.books || [
            { id: 'B01', book_name: 'কায়দা', class_id: null },
            { id: 'B02', book_name: 'আমপারা', class_id: null },
            { id: 'B03', book_name: 'আখলাক', class_id: null },
            { id: 'B04', book_name: 'নাজেরা', class_id: null },
            { id: 'B05', book_name: 'মাসনুন দোয়া', class_id: null }
        ];
        console.log(`📚 Using fallback books: ${allBooks.length} books`);
    }
    
    // Get class ID for filtering (using existing function from settings.js)
    const currentClassId = window.getClassIdByName ? window.getClassIdByName(examSession.class) : null;
    console.log(`🔍 Current class: ${examSession.class}, Class ID: ${currentClassId}`);
    
    // Filter books for this specific class
    // Show books that are either:
    // 1. Assigned to this specific class (class_id matches)
    // 2. Available to all classes (class_id is null)
    const availableBooks = allBooks.filter(book => {
        const isForThisClass = book.class_id === currentClassId;
        const isForAllClasses = book.class_id === null || book.class_id === '';
        
        console.log(`📖 Book: ${book.book_name}, class_id: ${book.class_id}, isForThisClass: ${isForThisClass}, isForAllClasses: ${isForAllClasses}`);
        
        return isForThisClass || isForAllClasses;
    });
    
    console.log(`📚 Filtered books for class ${examSession.class} (ID: ${currentClassId}): ${availableBooks.length} books`);
    console.log(`📋 Available book names:`, availableBooks.map(b => b.book_name));
    
    // If no books found for this class, show a helpful message
    if (availableBooks.length === 0) {
        console.warn(`⚠️ No books found for class ${examSession.class}. Available books:`, allBooks.map(b => `${b.book_name} (class_id: ${b.class_id})`));
    }
    
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
                        <h4 class="font-semibold text-gray-700 mb-3">
                            ${examSession.class} শ্রেণীর উপলব্ধ বই (${availableBooks.length}টি)
                        </h4>
                        <div class="space-y-2 max-h-80 overflow-y-auto">
                            ${availableBooks.length > 0 ? availableBooks.map(book => `
                                <div class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onclick="selectBookForExam('${book.id}', '${book.book_name}')">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <span class="font-medium">${book.book_name}</span>
                                            <div class="text-xs text-gray-500">
                                                ${book.class_id ? `শ্রেণী নির্দিষ্ট বই` : 'সকল শ্রেণীর জন্য'}
                                            </div>
                                        </div>
                                        <button class="text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-plus-circle"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="text-center py-8 text-gray-500">
                                    <i class="fas fa-book text-4xl mb-3"></i>
                                    <p class="font-medium">${examSession.class} শ্রেণীর জন্য কোন বই পাওয়া যায়নি</p>
                                    <p class="text-sm">সেটিংস → বই ব্যবস্থাপনা থেকে এই শ্রেণীর জন্য বই যোগ করুন</p>
                                    <button onclick="closeBookSelectionModal(); alert('সেটিংস → বই ব্যবস্থাপনা থেকে নতুন বই যোগ করুন')" 
                                            class="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                                        <i class="fas fa-plus"></i> বই যোগ করতে যান
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Selected Books -->
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3">
                            পরীক্ষায় নির্বাচিত বই সমূহ
                            <span class="text-sm font-normal text-gray-500" id="selected-books-count">(০টি)</span>
                        </h4>
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
    
    // Update the selected books display immediately (for editing mode)
    updateSelectedBooksDisplay();
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

// Helper function for rank display
function getRankHTML(rank) {
    if (!rank) return '-';
    if (rank <= 3) {
        const colors = { 1: '#f1c40f', 2: '#bdc3c7', 3: '#d35400' };
        return `<span style="background: ${colors[rank]}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${rank}</span>`;
    }
    return rank;
}

// Book selection functionality
let selectedBooksForExam = [];

function selectBookForExam(bookId, bookName) {
    console.log(`📚 Selecting book: ${bookName} (${bookId})`);
    
    // Check if book is already selected
    if (selectedBooksForExam.find(b => b.id === bookId)) {
        alert('এই বই ইতিমধ্যে নির্বাচিত হয়েছে।');
        return;
    }
    
    // Add book with default marks
    const newBook = {
        id: bookId,
        name: bookName,
        totalMarks: 100 // Default, can be edited
    };
    
    selectedBooksForExam.push(newBook);
    updateSelectedBooksDisplay();
}

function updateSelectedBooksDisplay() {
    const selectedBooksElement = document.getElementById('selected-books-for-exam');
    const countElement = document.getElementById('selected-books-count');
    
    if (!selectedBooksElement) return;
    
    // Update count
    if (countElement) {
        countElement.textContent = `(${selectedBooksForExam.length}টি)`;
    }
    
    if (selectedBooksForExam.length === 0) {
        selectedBooksElement.innerHTML = '<p class="text-gray-500 text-center py-8">কোন বই নির্বাচিত হয়নি</p>';
        return;
    }
    
    selectedBooksElement.innerHTML = selectedBooksForExam.map(book => `
        <div class="border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div class="flex justify-between items-center">
                <div class="flex-1">
                    <h5 class="font-semibold text-gray-800">${book.name}</h5>
                    <div class="flex items-center gap-4 mt-2">
                        <div class="flex items-center gap-2">
                            <label class="text-sm text-gray-600">মোট নম্বর:</label>
                            <input type="number" value="${book.totalMarks}" 
                                   onchange="updateBookMarksInSelection('${book.id}', this.value)"
                                   class="w-20 border-gray-300 rounded-md text-center text-sm" 
                                   min="1" max="1000">
                        </div>
                    </div>
                </div>
                <button onclick="removeBookFromExamWithConfirmation('${book.id}', '${book.name}')" 
                        class="text-red-600 hover:text-red-800 ml-3" 
                        title="এই বই পরীক্ষা থেকে সরিয়ে দিন">
                    <i class="fas fa-times-circle text-xl"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateBookMarksInSelection(bookId, newMarks) {
    const book = selectedBooksForExam.find(b => b.id === bookId);
    if (book) {
        book.totalMarks = parseInt(newMarks) || 100;
        console.log(`📝 Updated marks for ${book.name}: ${book.totalMarks}`);
    }
}

function removeBookFromSelection(bookId) {
    selectedBooksForExam = selectedBooksForExam.filter(b => b.id !== bookId);
    updateSelectedBooksDisplay();
}

function removeBookFromExamWithConfirmation(bookId, bookName) {
    const currentExamSession = window.currentExamSession;
    
    // Check if this is an existing exam with results
    let hasResults = false;
    if (currentExamSession) {
        const sessionKey = getExamSessionKey(currentExamSession);
        const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
        const sessionResults = allExamResults[sessionKey] || {};
        
        // Check if any student has marks for this book
        hasResults = Object.values(sessionResults).some(studentResults => 
            studentResults[bookId] !== undefined && studentResults[bookId] !== null
        );
    }
    
    let confirmMessage = `আপনি কি নিশ্চিত যে "${bookName}" বই পরীক্ষা থেকে সরিয়ে দিতে চান?`;
    
    if (hasResults) {
        confirmMessage += `\n\n⚠️ সতর্কতা: এই বইয়ের জন্য ইতিমধ্যে কিছু ছাত্রের নম্বর দেওয়া হয়েছে।\nবই সরিয়ে দিলে সেই নম্বর সমূহ স্থায়ীভাবে মুছে যাবে।`;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Remove from selected books
    selectedBooksForExam = selectedBooksForExam.filter(b => b.id !== bookId);
    updateSelectedBooksDisplay();
    
    // If this is an existing exam, update the exam session and remove results
    if (currentExamSession) {
        // Update exam session
        currentExamSession.selectedBooks = [...selectedBooksForExam];
        
        // Remove results for this book from all students
        if (hasResults) {
            const sessionKey = getExamSessionKey(currentExamSession);
            let allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
            const sessionResults = allExamResults[sessionKey] || {};
            
            // Remove this book's marks from all students
            Object.keys(sessionResults).forEach(studentId => {
                if (sessionResults[studentId][bookId] !== undefined) {
                    delete sessionResults[studentId][bookId];
                }
            });
            
            // Save updated results
            allExamResults[sessionKey] = sessionResults;
            localStorage.setItem('examResults', JSON.stringify(allExamResults));
        }
        
        // Save updated exam session
        saveExamSession(currentExamSession);
        
        alert(`"${bookName}" বই পরীক্ষা থেকে সরিয়ে দেওয়া হয়েছে।${hasResults ? ' সংশ্লিষ্ট নম্বর সমূহও মুছে ফেলা হয়েছে।' : ''}`);
    }
}

function closeBookSelectionModal() {
    const modal = document.getElementById('book-selection-modal');
    if (modal) {
        modal.remove();
        selectedBooksForExam = []; // Reset selection
    }
}

function createExamWithBooks(examId) {
    if (selectedBooksForExam.length === 0) {
        alert('অনুগ্রহ করে কমপক্ষে একটি বই নির্বাচন করুন।');
        return;
    }
    
    // Get the exam session from window
    const examSession = window.currentExamSession;
    if (!examSession) {
        alert('পরীক্ষা সেশন পাওয়া যায়নি।');
        return;
    }
    
    // Add selected books to exam session
    examSession.selectedBooks = [...selectedBooksForExam];
    
    // Save exam session
    saveExamSession(examSession);
    
    // Close modal and open result entry interface
    closeBookSelectionModal();
    openResultEntryInterface(examSession);
}

// Save exam session to localStorage (will be replaced with API call)
function saveExamSession(examSession) {
    try {
        let examSessions = JSON.parse(localStorage.getItem('examSessions')) || [];
        
        // Check if exam already exists (for editing)
        const existingIndex = examSessions.findIndex(session => session.id === examSession.id);
        const isNewExam = existingIndex < 0;
        
        if (existingIndex >= 0) {
            examSessions[existingIndex] = examSession;
        } else {
            examSessions.push(examSession);
        }
        
        localStorage.setItem('examSessions', JSON.stringify(examSessions));
        console.log(`💾 Saved exam session: ${examSession.name}`);
        
        // Instant UI updates
        refreshExamSectionInstantly(examSession.class, isNewExam);
        
    } catch (error) {
        console.error('❌ Error saving exam session:', error);
        alert('পরীক্ষা সংরক্ষণে সমস্যা হয়েছে।');
    }
}

// Instant refresh function for exam section
async function refreshExamSectionInstantly(className, isNewExam = false) {
    console.log(`🔄 Instantly refreshing exam section for: ${className}`);
    
    try {
        // Reload class exams data
        await loadClassExams(className);
        
        // Update all UI components instantly
        updateClassExamStats(className);
        renderClassExamList(className);
        
        // Show success notification
        if (isNewExam) {
            showQuickNotification('✅ নতুন পরীক্ষা তৈরি হয়েছে', 'success');
        } else {
            showQuickNotification('✅ পরীক্ষা আপডেট হয়েছে', 'success');
        }
        
        console.log('✅ Exam section refreshed instantly');
    } catch (error) {
        console.error('❌ Error refreshing exam section:', error);
    }
}

// Quick notification system
function showQuickNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.getElementById('quick-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'quick-notification';
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300`;
    
    // Set color based on type
    if (type === 'success') {
        notification.classList.add('bg-green-500');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500');
    } else {
        notification.classList.add('bg-blue-500');
    }
    
    notification.textContent = message;
    notification.style.transform = 'translateX(100%)';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Result Entry Interface
function openResultEntryInterface(examSession) {
    console.log(`📝 Opening result entry for: ${examSession.name}`);
    
    const modal = document.createElement('div');
    modal.id = 'result-entry-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    // Get students for this class
    const studentsInClass = window.students ? window.students.filter(s => 
        s.class === examSession.class && s.status === 'active'
    ) : [];
    
    // Calculate dynamic width based on number of books
    const baseWidth = 75; // Base width percentage
    const widthPerBook = 3; // Additional width per book
    const maxWidth = 85; // Maximum width percentage
    const maxHeight = 85; // Maximum height percentage
    const dynamicWidth = Math.min(baseWidth + (examSession.selectedBooks.length * widthPerBook), maxWidth);
    
    console.log(`📐 Dynamic modal sizing: ${examSession.selectedBooks.length} books → ${dynamicWidth}% width, ${maxHeight}% height`);

    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl" style="width: ${dynamicWidth}vw; height: ${maxHeight}vh; max-width: none; max-height: none;">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${examSession.name} - ফলাফল এন্ট্রি</h3>
                        <p class="text-sm text-gray-600 mt-1">${examSession.year} - ${examSession.term} - ${examSession.class}</p>
                        <div class="flex items-center gap-4 mt-2">
                            <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                <i class="fas fa-book mr-1"></i>${examSession.selectedBooks.length} বই
                            </span>
                            <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <i class="fas fa-users mr-1"></i>${studentsInClass.length} ছাত্র
                            </span>
                        </div>
                    </div>
                    <button onclick="closeResultEntryModal()" class="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-full hover:bg-gray-200 transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto" style="height: calc(85vh - 160px);">
                <div class="p-6">
                    <!-- Quick Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div class="bg-blue-50 p-4 rounded-lg text-center border-l-4 border-blue-400">
                            <div class="text-2xl font-bold text-blue-600">${studentsInClass.length}</div>
                            <div class="text-sm text-blue-700">মোট ছাত্র</div>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg text-center border-l-4 border-green-400">
                            <div class="text-2xl font-bold text-green-600">${examSession.selectedBooks.length}</div>
                            <div class="text-sm text-green-700">পরীক্ষার বই</div>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg text-center border-l-4 border-yellow-400">
                            <div class="text-2xl font-bold text-yellow-600" id="completed-results-count">0</div>
                            <div class="text-sm text-yellow-700">সম্পূর্ণ ফলাফল</div>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg text-center border-l-4 border-purple-400">
                            <div class="text-2xl font-bold text-purple-600" id="class-average-display">0%</div>
                            <div class="text-sm text-purple-700">শ্রেণীর গড়</div>
                        </div>
                    </div>
                    
                    <!-- Results Entry Table -->
                    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <div class="overflow-x-auto">
                            <table class="w-full text-base">
                                <thead class="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th class="px-4 py-4 text-left font-semibold text-gray-700 border-r" style="min-width: 200px;">ছাত্রের নাম</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 80px;">রোল</th>
                                        ${examSession.selectedBooks.map(book => 
                                            `<th class="px-4 py-4 text-center font-semibold text-gray-700 border-r" style="min-width: 140px;">
                                                <div class="text-base">${book.name}</div>
                                                <div class="text-xs text-gray-500 font-normal">(মোট: ${book.totalMarks})</div>
                                            </th>`
                                        ).join('')}
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 90px;">মোট</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 80px;">%</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 80px;">গ্রেড</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700" style="width: 80px;">র‍্যাঙ্ক</th>
                                    </tr>
                                </thead>
                                <tbody id="result-entry-table-body">
                                    ${studentsInClass.map(student => {
                                        const sessionKey = getExamSessionKey(examSession);
                                        return renderStudentResultRow(student, examSession, sessionKey);
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons Footer - Sticky at bottom of modal -->
                <div class="sticky bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200 z-30 shadow-lg">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                        <!-- Utility Actions -->
                        <button onclick="clearAllResults('${examSession.id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-eraser"></i>
                            <span>সব মুছুন</span>
                        </button>
                        <button onclick="importResultsCSV('${examSession.id}')" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-upload"></i>
                            <span>CSV ইম্পোর্ট</span>
                        </button>
                        
                        <!-- Primary Actions -->
                        <button onclick="saveResultsDraft('${examSession.id}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-save"></i>
                            <span>খসড়া সংরক্ষণ</span>
                        </button>
                        <button onclick="publishResults('${examSession.id}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            <i class="fas fa-check-circle"></i>
                            <span>ফলাফল প্রকাশ</span>
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize result calculations
    calculateAllResults(examSession);
}

function renderStudentResultRow(student, examSession, sessionKey) {
    // Get existing results if any
    const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const studentResults = allExamResults[sessionKey]?.[student.id] || {};
    
    let rowHTML = `
        <tr class="border-b hover:bg-gray-50" style="height: 60px;">
            <td class="px-4 py-3 font-medium text-blue-600 cursor-pointer border-r" onclick="showStudentExamDetail('${student.id}', '${examSession.id}')">${student.name}</td>
            <td class="px-3 py-3 text-center border-r">${student.rollNumber}</td>
    `;
    
    // Add input fields for each book
    examSession.selectedBooks.forEach(book => {
        const mark = studentResults[book.id] || '';
        const colorClass = getResultCellColor(mark, book.totalMarks);
        rowHTML += `
            <td class="px-4 py-3 text-center border-r ${colorClass}">
                <input type="number" 
                       value="${mark}" 
                       onchange="updateStudentMark('${student.id}', '${book.id}', this.value, '${examSession.id}')"
                       class="w-20 h-10 text-center text-base border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 font-medium"
                       min="0" 
                       max="${book.totalMarks}"
                       placeholder="0">
            </td>
        `;
    });
    
    // Calculate totals for this student
    const { total, percentage, grade } = calculateStudentExamTotals(student.id, examSession, studentResults);
    
    rowHTML += `
        <td class="px-3 py-3 text-center font-bold text-base border-r" id="total-${student.id}">${total}</td>
        <td class="px-3 py-3 text-center font-bold text-base border-r" id="percentage-${student.id}">${percentage}%</td>
        <td class="px-3 py-3 text-center font-bold text-lg border-r ${getGradeColorClass(grade)}" id="grade-${student.id}">${grade}</td>
        <td class="px-3 py-3 text-center font-semibold text-base" id="rank-${student.id}">-</td>
    </tr>`;
    
    return rowHTML;
}

function updateStudentMark(studentId, bookId, value, examId) {
    const mark = value === '' ? null : parseInt(value);
    const examSession = getCurrentExamSession(examId);
    if (!examSession) return;
    
    const sessionKey = getExamSessionKey(examSession);
    
    // Get or create exam results structure
    let allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    if (!allExamResults[sessionKey]) allExamResults[sessionKey] = {};
    if (!allExamResults[sessionKey][studentId]) allExamResults[sessionKey][studentId] = {};
    
    // Update the mark
    allExamResults[sessionKey][studentId][bookId] = mark;
    
    // Save to localStorage
    localStorage.setItem('examResults', JSON.stringify(allExamResults));
    
    // Recalculate and update this student's totals
    const studentResults = allExamResults[sessionKey][studentId];
    const { total, percentage, grade } = calculateStudentExamTotals(studentId, examSession, studentResults);
    
    // Update DOM elements
    const totalElement = document.getElementById(`total-${studentId}`);
    const percentageElement = document.getElementById(`percentage-${studentId}`);
    const gradeElement = document.getElementById(`grade-${studentId}`);
    
    if (totalElement) totalElement.textContent = total;
    if (percentageElement) percentageElement.textContent = percentage + '%';
    if (gradeElement) {
        gradeElement.textContent = grade;
        gradeElement.className = `px-3 py-3 text-center font-bold text-lg border-r ${getGradeColorClass(grade)}`;
    }
    
    // Update cell color
    const book = examSession.selectedBooks.find(b => b.id === bookId);
    const inputElement = event.target;
    const cellElement = inputElement.parentElement;
    cellElement.className = `px-4 py-3 text-center border-r ${getResultCellColor(mark, book.totalMarks)}`;
    
    // Recalculate ranks for all students
    updateAllRanks(examSession);
    
    // Update class statistics
    updateClassStatistics(examSession);
}

function calculateStudentExamTotals(studentId, examSession, studentResults) {
    let totalObtained = 0;
    let totalPossibleMarks = 0;
    
    examSession.selectedBooks.forEach(book => {
        const obtainedMarks = studentResults[book.id] || 0;
        totalObtained += obtainedMarks;
        // Only count towards total if student has marks for this book
        if (obtainedMarks > 0 || studentResults[book.id] === 0) {
            totalPossibleMarks += book.totalMarks;
        }
    });
    
    const percentage = totalPossibleMarks > 0 ? Math.round((totalObtained / totalPossibleMarks) * 100) : 0;
    const grade = getExamGrade(percentage);
    return { total: totalObtained, percentage, grade, totalPossible: totalPossibleMarks };
}

function updateAllRanks(examSession) {
    const sessionKey = getExamSessionKey(examSession);
    const studentsInClass = window.students ? window.students.filter(s => 
        s.class === examSession.class && s.status === 'active'
    ) : [];
    
    // Calculate ranks
    const studentRanks = calculateExamClassRanks(examSession, sessionKey, studentsInClass);
    
    // Update rank display for all students
    Object.keys(studentRanks).forEach(studentId => {
        const rankElement = document.getElementById(`rank-${studentId}`);
        if (rankElement) {
            const rank = studentRanks[studentId];
            rankElement.innerHTML = getRankHTML(rank);
        }
    });
}

function calculateExamClassRanks(examSession, sessionKey, studentsInClass) {
    const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const sessionResults = allExamResults[sessionKey] || {};
    
    const studentTotals = studentsInClass.map(student => {
        const studentResults = sessionResults[student.id] || {};
        const { total } = calculateStudentExamTotals(student.id, examSession, studentResults);
        return { id: student.id, total };
    });
    
    // Sort by total marks (highest first)
    studentTotals.sort((a, b) => b.total - a.total);
    
    // Assign ranks
    const ranks = {};
    let currentRank = 1;
    for (let i = 0; i < studentTotals.length; i++) {
        if (i > 0 && studentTotals[i].total < studentTotals[i - 1].total) {
            currentRank = i + 1;
        }
        ranks[studentTotals[i].id] = currentRank;
    }
    
    return ranks;
}

function updateClassStatistics(examSession) {
    const sessionKey = getExamSessionKey(examSession);
    const studentsInClass = window.students ? window.students.filter(s => 
        s.class === examSession.class && s.status === 'active'
    ) : [];
    
    const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const sessionResults = allExamResults[sessionKey] || {};
    
    // Count completed results
    let completedCount = 0;
    let totalPercentage = 0;
    let validResults = 0;
    
    studentsInClass.forEach(student => {
        const studentResults = sessionResults[student.id] || {};
        const hasAllMarks = examSession.selectedBooks.every(book => 
            studentResults[book.id] !== undefined && studentResults[book.id] !== null && studentResults[book.id] !== '');
        
        if (hasAllMarks) {
            completedCount++;
        }
        
        // Calculate percentage for average
        const { percentage } = calculateStudentExamTotals(student.id, examSession, studentResults);
        if (percentage > 0) {
            totalPercentage += percentage;
            validResults++;
        }
    });
    
    const classAverage = validResults > 0 ? Math.round(totalPercentage / validResults) : 0;
    
    // Update display elements
    const completedElement = document.getElementById('completed-results-count');
    const averageElement = document.getElementById('class-average-display');
    
    if (completedElement) completedElement.textContent = completedCount;
    if (averageElement) averageElement.textContent = classAverage + '%';
}

function calculateAllResults(examSession) {
    // Recalculate all student results and update display
    updateAllRanks(examSession);
    updateClassStatistics(examSession);
}

function getResultCellColor(mark, totalMarks) {
    if (mark === null || mark === '' || mark === undefined) return '';
    const percentage = (mark / totalMarks) * 100;
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-blue-100';
    if (percentage >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
}

function getGradeColorClass(grade) {
    const gradeColors = {
        'A+': 'text-green-600',
        'A': 'text-blue-600',
        'A-': 'text-indigo-600',
        'B': 'text-yellow-600',
        'C': 'text-orange-600',
        'D': 'text-red-600',
        'F': 'text-red-800'
    };
    return gradeColors[grade] || 'text-gray-600';
}

function getExamSessionKey(examSession) {
    return `${examSession.year}-${examSession.term}-${examSession.class}-${examSession.id}`;
}

function getCurrentExamSession(examId) {
    const examSessions = JSON.parse(localStorage.getItem('examSessions')) || [];
    return examSessions.find(session => session.id === examId);
}

function closeResultEntryModal() {
    const modal = document.getElementById('result-entry-modal');
    if (modal) {
        modal.remove();
    }
    
    // Refresh the Teachers Corner exam list
    if (window.currentClass && typeof window.loadClassExams === 'function') {
        window.loadClassExams(window.currentClass);
        // Also refresh the exam list display
        if (typeof window.renderClassExamList === 'function') {
            window.renderClassExamList(window.currentClass);
        }
    }
}

// Result management functions
function saveResultsDraft(examId) {
    const examSession = getCurrentExamSession(examId);
    if (!examSession) return;
    
    examSession.status = 'draft';
    saveExamSession(examSession);
    
    showQuickNotification('✅ ফলাফল খসড়া হিসেবে সংরক্ষণ হয়েছে', 'success');
    closeResultEntryModal();
}

function publishResults(examId) {
    const examSession = getCurrentExamSession(examId);
    if (!examSession) return;
    
    if (!confirm('আপনি কি নিশ্চিত যে ফলাফল প্রকাশ করতে চান? প্রকাশের পর সম্পাদনা সীমিত হবে।')) {
        return;
    }
    
    examSession.status = 'published';
    examSession.publishedDate = new Date().toISOString();
    saveExamSession(examSession);
    
    showQuickNotification('✅ ফলাফল সফলভাবে প্রকাশ করা হয়েছে', 'success');
    closeResultEntryModal();
}

function clearAllResults(examId) {
    if (!confirm('আপনি কি নিশ্চিত যে সব ফলাফল মুছে দিতে চান?')) {
        return;
    }
    
    const examSession = getCurrentExamSession(examId);
    if (!examSession) return;
    
    const sessionKey = getExamSessionKey(examSession);
    let allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    
    // Clear results for this session
    delete allExamResults[sessionKey];
    localStorage.setItem('examResults', JSON.stringify(allExamResults));
    
    // Refresh the interface
    closeResultEntryModal();
    openResultEntryInterface(examSession);
    
    alert('সব ফলাফল মুছে ফেলা হয়েছে।');
}

function openClassExam(examId) {
    console.log(`📖 Opening exam: ${examId}`);
    const examSession = getCurrentExamSession(examId);
    if (examSession) {
        openResultEntryInterface(examSession);
    }
}

function editClassExam(examId, event) {
    event.stopPropagation();
    console.log(`✏️ Editing exam: ${examId}`);
    const examSession = getCurrentExamSession(examId);
    if (examSession) {
        // Open book selection modal for editing
        window.currentExamSession = examSession;
        // Pre-populate selected books from the exam
        selectedBooksForExam = examSession.selectedBooks.map(book => ({
            id: book.id,
            name: book.name,
            totalMarks: book.totalMarks
        }));
        showBookSelectionModal(examSession);
    }
}

function viewClassExamResults(examId, event) {
    event.stopPropagation();
    console.log(`📊 Viewing results for exam: ${examId}`);
    const examSession = getCurrentExamSession(examId);
    if (examSession) {
        openResultsViewInterface(examSession);
    }
}

function openResultsViewInterface(examSession) {
    console.log(`👁️ Opening results view for: ${examSession.name}`);
    
    const modal = document.createElement('div');
    modal.id = 'results-view-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    // Get students for this class
    const studentsInClass = window.students ? window.students.filter(s => 
        s.class === examSession.class && s.status === 'active'
    ) : [];
    
    const sessionKey = getExamSessionKey(examSession);
    const sessionResults = currentClassExamResults[sessionKey] || {};
    
    // Calculate ranks
    const studentRanks = calculateExamClassRanks(examSession, sessionKey, studentsInClass);
    
    // Sort students by rank
    const studentsWithResults = studentsInClass.map(student => {
        const studentResults = sessionResults[student.id] || {};
        const { total, percentage, grade } = calculateStudentExamTotals(student.id, examSession, studentResults);
        const rank = studentRanks[student.id] || '-';
        
        return {
            ...student,
            results: studentResults,
            total,
            percentage,
            grade,
            rank
        };
    }).sort((a, b) => {
        if (a.rank === '-') return 1;
        if (b.rank === '-') return -1;
        return a.rank - b.rank;
    });
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl" style="width: 85vw; height: 85vh;">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${examSession.name} - ফলাফল দেখুন</h3>
                        <p class="text-sm text-gray-600 mt-1">${examSession.year} - ${examSession.term} - ${examSession.class}</p>
                        <div class="flex items-center gap-4 mt-2">
                            <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <i class="fas fa-eye mr-1"></i>শুধুমাত্র দেখার জন্য
                            </span>
                            <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                <i class="fas fa-users mr-1"></i>${studentsInClass.length} ছাত্র
                            </span>
                        </div>
                    </div>
                    <button onclick="closeResultsViewModal()" class="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-full hover:bg-gray-200 transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto" style="height: calc(85vh - 160px);">
                <div class="p-6">
                    <!-- Results Table -->
                    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <div class="overflow-x-auto">
                            <table class="w-full text-base">
                                <thead class="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th class="px-4 py-4 text-center font-semibold text-gray-700 border-r" style="width: 80px;">র‍্যাঙ্ক</th>
                                        <th class="px-4 py-4 text-left font-semibold text-gray-700 border-r" style="min-width: 200px;">ছাত্রের নাম</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 80px;">রোল</th>
                                        ${examSession.selectedBooks.map(book => 
                                            `<th class="px-4 py-4 text-center font-semibold text-gray-700 border-r" style="min-width: 120px;">
                                                <div class="text-base">${book.name}</div>
                                                <div class="text-xs text-gray-500 font-normal">(${book.totalMarks})</div>
                                            </th>`
                                        ).join('')}
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 90px;">মোট</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700 border-r" style="width: 80px;">%</th>
                                        <th class="px-3 py-4 text-center font-semibold text-gray-700" style="width: 80px;">গ্রেড</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${studentsWithResults.map(student => `
                                        <tr class="border-b hover:bg-gray-50" style="height: 50px;">
                                            <td class="px-3 py-3 text-center font-bold text-lg border-r">${getRankHTML(student.rank)}</td>
                                            <td class="px-4 py-3 font-medium text-gray-800 border-r">${student.name}</td>
                                            <td class="px-3 py-3 text-center border-r">${student.rollNumber}</td>
                                            ${examSession.selectedBooks.map(book => {
                                                const mark = student.results[book.id] || 0;
                                                const colorClass = getResultCellColor(mark, book.totalMarks);
                                                return `<td class="px-4 py-3 text-center border-r ${colorClass}">
                                                    <span class="font-semibold">${mark}</span>
                                                </td>`;
                                            }).join('')}
                                            <td class="px-3 py-3 text-center font-bold text-base border-r">${student.total}</td>
                                            <td class="px-3 py-3 text-center font-bold text-base border-r">${student.percentage}%</td>
                                            <td class="px-3 py-3 text-center font-bold text-lg ${getGradeColorClass(student.grade)}">${student.grade}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons Footer -->
            <div class="sticky bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200 z-30 shadow-lg">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
                    <button onclick="exportSingleExamResults(getCurrentExamSession('${examSession.id}'), '${examSession.class}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-download"></i>
                        <span>এক্সপোর্ট করুন</span>
                    </button>
                    <button onclick="closeResultsViewModal(); openResultEntryInterface(getCurrentExamSession('${examSession.id}'))" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-edit"></i>
                        <span>ফলাফল সম্পাদনা</span>
                    </button>
                    <button onclick="closeResultsViewModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-times"></i>
                        <span>বন্ধ করুন</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeResultsViewModal() {
    const modal = document.getElementById('results-view-modal');
    if (modal) {
        modal.remove();
    }
}

function duplicateClassExam(examId, event) {
    event.stopPropagation();
    console.log(`📋 Duplicating exam: ${examId}`);
    
    const originalExam = getCurrentExamSession(examId);
    if (!originalExam) {
        alert('মূল পরীক্ষা পাওয়া যায়নি।');
        return;
    }
    
    // Create a new exam session with copied data
    const newExamSession = {
        ...originalExam,
        id: 'EX' + Date.now().toString(36).toUpperCase(),
        name: originalExam.name + ' (কপি)',
        status: 'draft',
        createdDate: new Date().toISOString(),
        publishedDate: null
    };
    
    // Save the duplicated exam
    saveExamSession(newExamSession);
    
        // Instant refresh after duplication
        refreshExamSectionInstantly(originalExam.class, true);
        
        showQuickNotification(`✅ পরীক্ষা কপি হয়েছে: ${newExamSession.name}`, 'success');
}

function deleteClassExam(examId, event) {
    event.stopPropagation();
    console.log(`🗑️ Deleting exam: ${examId}`);
    
    const examSession = getCurrentExamSession(examId);
    if (!examSession) {
        alert('পরীক্ষা পাওয়া যায়নি।');
        return;
    }
    
    // Confirm deletion
    if (!confirm(`আপনি কি নিশ্চিত যে "${examSession.name}" পরীক্ষা মুছে ফেলতে চান?\n\nএটি স্থায়ীভাবে মুছে যাবে এবং সকল ফলাফল হারিয়ে যাবে।`)) {
        return;
    }
    
    try {
        // Remove exam session
        let examSessions = JSON.parse(localStorage.getItem('examSessions')) || [];
        examSessions = examSessions.filter(session => session.id !== examId);
        localStorage.setItem('examSessions', JSON.stringify(examSessions));
        
        // Remove exam results
        const sessionKey = getExamSessionKey(examSession);
        let allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
        delete allExamResults[sessionKey];
        localStorage.setItem('examResults', JSON.stringify(allExamResults));
        
        // Instant refresh after deletion
        refreshExamSectionInstantly(examSession.class);
        
        showQuickNotification(`✅ পরীক্ষা "${examSession.name}" মুছে ফেলা হয়েছে`, 'success');
        
    } catch (error) {
        console.error('❌ Error deleting exam:', error);
        alert('পরীক্ষা মুছতে সমস্যা হয়েছে।');
    }
}

function viewAllClassExams(className) {
    console.log(`📊 Opening Results Comparison Matrix for class: ${className}`);
    
    const modal = document.createElement('div');
    modal.id = 'results-comparison-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    // Get all published exams for this class
    const publishedExams = currentClassExams.filter(exam => exam.status === 'published') || [];
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl" style="width: 95vw; height: 90vh;">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${className} - পরীক্ষার ফলাফল তুলনা</h3>
                        <p class="text-sm text-gray-600 mt-1">একাধিক পরীক্ষার ফলাফল তুলনা করুন এবং ছাত্রদের উন্নতি দেখুন</p>
                    </div>
                    <button onclick="closeResultsComparisonModal()" class="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-full hover:bg-gray-200 transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Exam Selection -->
            <div class="px-6 py-4 border-b bg-gray-50">
                <div class="flex flex-wrap items-center gap-4 mb-3">
                    <h4 class="font-semibold text-gray-700">তুলনা করার জন্য পরীক্ষা নির্বাচন করুন:</h4>
                    <span class="text-sm text-gray-500">(সর্বোচ্চ ৫টি পরীক্ষা নির্বাচন করতে পারেন)</span>
                </div>
                <div class="flex flex-wrap gap-3 mb-3" id="exam-selection-area">
                    ${publishedExams.map(exam => `
                        <label class="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 exam-checkbox-label">
                            <input type="checkbox" 
                                   class="exam-checkbox" 
                                   value="${exam.id}" 
                                   onchange="updateComparisonMatrix('${className}')"
                                   ${publishedExams.indexOf(exam) < 3 ? 'checked' : ''}>
                            <div class="text-sm">
                                <div class="font-medium">${exam.name}</div>
                                <div class="text-gray-500">${exam.year} - ${exam.term}</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        নির্বাচিত: <span id="selected-exam-count">0</span>টি পরীক্ষা
                    </div>
                    <button onclick="selectAllExams('${className}')" class="text-blue-600 hover:text-blue-800 text-sm">
                        সব নির্বাচন করুন
                    </button>
                </div>
            </div>
            
            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto" style="height: calc(90vh - 240px);">
                <div class="p-6">
                    <div id="comparison-matrix-container">
                        <!-- Comparison matrix will be rendered here -->
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons Footer -->
            <div class="sticky bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200 z-30 shadow-lg">
                <div class="flex justify-between items-center">
                    <div class="flex gap-3">
                        <button onclick="exportComparisonMatrix('${className}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                            <i class="fas fa-download"></i>
                            <span>তুলনা এক্সপোর্ট</span>
                        </button>
                        <button onclick="showComparisonChart('${className}')" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                            <i class="fas fa-chart-line"></i>
                            <span>চার্ট দেখুন</span>
                        </button>
                    </div>
                    <button onclick="closeResultsComparisonModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                        <i class="fas fa-times"></i>
                        <span>বন্ধ করুন</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize with first 3 exams selected
    updateComparisonMatrix(className);
}

function renderAllExamsList(exams, className) {
    if (exams.length === 0) {
        return `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-clipboard-list text-6xl mb-4"></i>
                <p class="text-lg font-medium">এই শ্রেণীর জন্য কোন পরীক্ষা তৈরি করা হয়নি</p>
                <p class="text-sm mt-2">নতুন পরীক্ষা তৈরি করতে নিচের বোতাম ব্যবহার করুন</p>
            </div>
        `;
    }
    
    // Sort exams by date (newest first)
    const sortedExams = [...exams].sort((a, b) => 
        new Date(b.createdDate) - new Date(a.createdDate)
    );
    
    return sortedExams.map(exam => {
        const sessionKey = getExamSessionKey(exam);
        const results = currentClassExamResults[sessionKey] || {};
        const studentsInClass = window.students ? window.students.filter(s => s.class === className && s.status === 'active') : [];
        const completedResults = Object.keys(results).length;
        const progressPercentage = studentsInClass.length > 0 ? Math.round((completedResults / studentsInClass.length) * 100) : 0;
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all exam-item" 
                 data-status="${exam.status}" data-year="${exam.year}" data-term="${exam.term}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h5 class="font-semibold text-gray-800 text-lg">${exam.name}</h5>
                            <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${getExamStatusClass(exam.status)}">
                                ${getExamStatusText(exam.status)}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div><i class="fas fa-calendar mr-1"></i>${exam.year} - ${exam.term}</div>
                            <div><i class="fas fa-clock mr-1"></i>${new Date(exam.createdDate).toLocaleDateString('bn-BD')}</div>
                            <div><i class="fas fa-book mr-1"></i>${exam.selectedBooks.length} বই</div>
                            <div><i class="fas fa-users mr-1"></i>${studentsInClass.length} ছাত্র</div>
                        </div>
                        
                        <div class="bg-blue-50 p-3 rounded-lg mb-3">
                            <div class="text-sm text-blue-600 mb-1">ফলাফল এন্ট্রি: ${completedResults}/${studentsInClass.length} (${progressPercentage}%)</div>
                            <div class="w-full bg-blue-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${progressPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    <button onclick="openClassExam('${exam.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                        <i class="fas fa-edit"></i> এন্ট্রি
                    </button>
                    <button onclick="viewClassExamResults('${exam.id}', event)" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                        <i class="fas fa-eye"></i> দেখুন
                    </button>
                    <button onclick="editClassExam('${exam.id}', event)" class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                        <i class="fas fa-cog"></i> সেটিং
                    </button>
                    <button onclick="duplicateClassExam('${exam.id}', event)" class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                        <i class="fas fa-copy"></i> কপি
                    </button>
                    <button onclick="deleteClassExam('${exam.id}', event)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1">
                        <i class="fas fa-trash"></i> মুছুন
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterExamsList(className) {
    const statusFilter = document.getElementById('status-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const termFilter = document.getElementById('term-filter').value;
    
    const examItems = document.querySelectorAll('.exam-item');
    let visibleCount = 0;
    
    examItems.forEach(item => {
        const status = item.dataset.status;
        const year = item.dataset.year;
        const term = item.dataset.term;
        
        const statusMatch = statusFilter === 'all' || status === statusFilter;
        const yearMatch = yearFilter === 'all' || year === yearFilter;
        const termMatch = termFilter === 'all' || term === termFilter;
        
        if (statusMatch && yearMatch && termMatch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    document.getElementById('exam-count').textContent = visibleCount;
}

function updateComparisonMatrix(className) {
    const selectedExams = Array.from(document.querySelectorAll('.exam-checkbox:checked')).map(cb => cb.value);
    document.getElementById('selected-exam-count').textContent = selectedExams.length;
    
    // Limit to 5 exams
    if (selectedExams.length > 5) {
        alert('সর্বোচ্চ ৫টি পরীক্ষা নির্বাচন করতে পারেন।');
        return;
    }
    
    if (selectedExams.length === 0) {
        document.getElementById('comparison-matrix-container').innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-chart-bar text-6xl mb-4"></i>
                <p class="text-lg font-medium">তুলনা করার জন্য কমপক্ষে একটি পরীক্ষা নির্বাচন করুন</p>
            </div>
        `;
        return;
    }
    
    renderComparisonMatrix(className, selectedExams);
}

function renderComparisonMatrix(className, selectedExamIds) {
    const selectedExams = selectedExamIds.map(id => getCurrentExamSession(id)).filter(exam => exam);
    const studentsInClass = window.students ? window.students.filter(s => s.class === className && s.status === 'active') : [];
    
    if (studentsInClass.length === 0) {
        document.getElementById('comparison-matrix-container').innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <p class="text-lg font-medium">এই শ্রেণীতে কোন সক্রিয় ছাত্র নেই</p>
            </div>
        `;
        return;
    }
    
    // Calculate results for all students across all selected exams
    const studentsWithResults = studentsInClass.map(student => {
        const examResults = selectedExams.map(exam => {
            const sessionKey = getExamSessionKey(exam);
            const studentResults = currentClassExamResults[sessionKey]?.[student.id] || {};
            const { total, percentage, grade } = calculateStudentExamTotals(student.id, exam, studentResults);
            
            return {
                examId: exam.id,
                examName: exam.name,
                total,
                percentage,
                grade,
                hasResults: Object.keys(studentResults).length > 0
            };
        });
        
        // Calculate average and trend
        const validPercentages = examResults.filter(r => r.hasResults).map(r => r.percentage);
        const average = validPercentages.length > 0 ? Math.round(validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length) : 0;
        
        // Simple trend calculation (comparing first and last valid results)
        let trend = '➖';
        if (validPercentages.length >= 2) {
            const firstResult = validPercentages[0];
            const lastResult = validPercentages[validPercentages.length - 1];
            if (lastResult > firstResult + 5) trend = '📈';
            else if (lastResult < firstResult - 5) trend = '📉';
            else trend = '➡️';
        }
        
        return {
            ...student,
            examResults,
            average,
            trend,
            validResultsCount: validPercentages.length
        };
    });
    
    // Sort by average percentage (descending)
    studentsWithResults.sort((a, b) => b.average - a.average);
    
    const container = document.getElementById('comparison-matrix-container');
    container.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th class="px-4 py-3 text-left font-semibold text-gray-700 border-r" style="min-width: 200px;">ছাত্রের নাম</th>
                            <th class="px-3 py-3 text-center font-semibold text-gray-700 border-r" style="width: 80px;">রোল</th>
                            ${selectedExams.map(exam => 
                                `<th class="px-4 py-3 text-center font-semibold text-gray-700 border-r" style="min-width: 120px;">
                                    <div class="text-sm">${exam.name}</div>
                                    <div class="text-xs text-gray-500 font-normal">${exam.year} - ${exam.term}</div>
                                </th>`
                            ).join('')}
                            <th class="px-3 py-3 text-center font-semibold text-gray-700 border-r" style="width: 80px;">গড়</th>
                            <th class="px-3 py-3 text-center font-semibold text-gray-700 border-r" style="width: 80px;">ট্রেন্ড</th>
                            <th class="px-3 py-3 text-center font-semibold text-gray-700" style="width: 80px;">র‍্যাঙ্ক</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentsWithResults.map((student, index) => `
                            <tr class="border-b hover:bg-gray-50" style="height: 50px;">
                                <td class="px-4 py-3 font-medium text-gray-800 border-r">${student.name}</td>
                                <td class="px-3 py-3 text-center border-r">${student.rollNumber}</td>
                                ${student.examResults.map(result => {
                                    const bgColor = result.hasResults ? getComparisonCellColor(result.percentage) : 'bg-gray-100';
                                    const textColor = result.hasResults ? 'text-gray-800' : 'text-gray-400';
                                    return `
                                        <td class="px-4 py-3 text-center border-r ${bgColor}">
                                            <div class="font-semibold ${textColor}">
                                                ${result.hasResults ? result.percentage + '%' : 'N/A'}
                                            </div>
                                            <div class="text-xs text-gray-500">
                                                ${result.hasResults ? result.grade : '-'}
                                            </div>
                                        </td>
                                    `;
                                }).join('')}
                                <td class="px-3 py-3 text-center font-bold text-base border-r">
                                    <div class="text-lg">${student.average}%</div>
                                    <div class="text-xs text-gray-500">${student.validResultsCount}/${selectedExams.length}</div>
                                </td>
                                <td class="px-3 py-3 text-center text-2xl border-r">${student.trend}</td>
                                <td class="px-3 py-3 text-center font-bold text-lg">
                                    ${getRankHTML(index + 1)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Summary Stats -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <div class="text-2xl font-bold text-blue-600">${studentsWithResults.length}</div>
                <div class="text-sm text-blue-700">মোট ছাত্র</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <div class="text-2xl font-bold text-green-600">${selectedExams.length}</div>
                <div class="text-sm text-green-700">তুলনাকৃত পরীক্ষা</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <div class="text-2xl font-bold text-yellow-600">
                    ${Math.round(studentsWithResults.reduce((sum, s) => sum + s.average, 0) / studentsWithResults.length) || 0}%
                </div>
                <div class="text-sm text-yellow-700">শ্রেণীর গড়</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <div class="text-2xl font-bold text-purple-600">
                    ${studentsWithResults.filter(s => s.trend === '📈').length}
                </div>
                <div class="text-sm text-purple-700">উন্নতি দেখাচ্ছে</div>
            </div>
        </div>
    `;
}

function getComparisonCellColor(percentage) {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 80) return 'bg-blue-100';
    if (percentage >= 70) return 'bg-yellow-100';
    if (percentage >= 60) return 'bg-orange-100';
    return 'bg-red-100';
}

function selectAllExams(className) {
    const checkboxes = document.querySelectorAll('.exam-checkbox');
    const maxSelections = Math.min(5, checkboxes.length);
    
    checkboxes.forEach((cb, index) => {
        cb.checked = index < maxSelections;
    });
    
    updateComparisonMatrix(className);
}

function exportComparisonMatrix(className) {
    const selectedExams = Array.from(document.querySelectorAll('.exam-checkbox:checked')).map(cb => cb.value);
    
    if (selectedExams.length === 0) {
        alert('তুলনা এক্সপোর্ট করার জন্য কমপক্ষে একটি পরীক্ষা নির্বাচন করুন।');
        return;
    }
    
    const exams = selectedExams.map(id => getCurrentExamSession(id)).filter(exam => exam);
    const studentsInClass = window.students ? window.students.filter(s => s.class === className && s.status === 'active') : [];
    
    // Create CSV content
    let csvContent = 'ছাত্রের নাম,রোল নম্বর';
    
    // Add exam headers
    exams.forEach(exam => {
        csvContent += `,${exam.name} (%),${exam.name} (গ্রেড)`;
    });
    csvContent += ',গড় (%),ট্রেন্ড,র‍্যাঙ্ক\n';
    
    // Add student data
    studentsInClass.forEach((student, index) => {
        let row = `${student.name},${student.rollNumber}`;
        
        let validPercentages = [];
        exams.forEach(exam => {
            const sessionKey = getExamSessionKey(exam);
            const studentResults = currentClassExamResults[sessionKey]?.[student.id] || {};
            const { percentage, grade } = calculateStudentExamTotals(student.id, exam, studentResults);
            
            if (Object.keys(studentResults).length > 0) {
                validPercentages.push(percentage);
                row += `,${percentage}%,${grade}`;
            } else {
                row += `,N/A,-`;
            }
        });
        
        const average = validPercentages.length > 0 ? Math.round(validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length) : 0;
        let trend = 'স্থিতিশীল';
        if (validPercentages.length >= 2) {
            const firstResult = validPercentages[0];
            const lastResult = validPercentages[validPercentages.length - 1];
            if (lastResult > firstResult + 5) trend = 'উন্নতি';
            else if (lastResult < firstResult - 5) trend = 'অবনতি';
        }
        
        row += `,${average}%,${trend},${index + 1}`;
        csvContent += row + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${className}_exam_comparison_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`${className} শ্রেণীর পরীক্ষার তুলনা সফলভাবে এক্সপোর্ট করা হয়েছে।`);
}

function showComparisonChart(className) {
    alert('চার্ট ফিচার শীঘ্রই যোগ করা হবে।');
}

function closeResultsComparisonModal() {
    const modal = document.getElementById('results-comparison-modal');
    if (modal) {
        modal.remove();
    }
}

function exportClassResults(className) {
    console.log(`📤 Exporting results for class: ${className}`);
    
    // Get all exams for this class
    const classExams = currentClassExams.filter(exam => exam.status === 'published');
    
    if (classExams.length === 0) {
        alert('এই শ্রেণীর জন্য কোন প্রকাশিত পরীক্ষার ফলাফল নেই।');
        return;
    }
    
    if (classExams.length === 1) {
        // If only one exam, export directly
        exportSingleExamResults(classExams[0], className);
    } else {
        // If multiple exams, show selection modal
        showExportSelectionModal(classExams, className);
    }
}

function showExportSelectionModal(classExams, className) {
    const modal = document.createElement('div');
    modal.id = 'export-selection-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2">
            <div class="p-6 border-b flex justify-between items-center">
                <h3 class="text-xl font-semibold text-gray-800">ফলাফল এক্সপোর্ট করুন - ${className}</h3>
                <button onclick="closeExportSelectionModal()" class="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <p class="text-gray-600 mb-4">কোন পরীক্ষার ফলাফল এক্সপোর্ট করতে চান?</p>
                <div class="space-y-3 max-h-80 overflow-y-auto">
                    <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="export-option" value="all" class="text-blue-600" checked>
                        <div>
                            <div class="font-semibold text-gray-800">সকল পরীক্ষার ফলাফল</div>
                            <div class="text-sm text-gray-500">সব প্রকাশিত পরীক্ষার ফলাফল একসাথে এক্সপোর্ট করুন</div>
                        </div>
                    </label>
                    ${classExams.map(exam => `
                        <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="export-option" value="${exam.id}" class="text-blue-600">
                            <div>
                                <div class="font-semibold text-gray-800">${exam.name}</div>
                                <div class="text-sm text-gray-500">${exam.year} - ${exam.term}</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onclick="closeExportSelectionModal()" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">বাতিল</button>
                <button onclick="proceedWithExport('${className}')" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    <i class="fas fa-download"></i> এক্সপোর্ট করুন
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeExportSelectionModal() {
    const modal = document.getElementById('export-selection-modal');
    if (modal) {
        modal.remove();
    }
}

function proceedWithExport(className) {
    const selectedOption = document.querySelector('input[name="export-option"]:checked').value;
    
    if (selectedOption === 'all') {
        // Export all exams
        exportAllExamResults(className);
    } else {
        // Export specific exam
        const examSession = getCurrentExamSession(selectedOption);
        if (examSession) {
            exportSingleExamResults(examSession, className);
        }
    }
    
    closeExportSelectionModal();
}

function exportSingleExamResults(examSession, className) {
    // Get students for this class
    const studentsInClass = window.students ? window.students.filter(s => 
        s.class === className && s.status === 'active'
    ) : [];
    
    if (studentsInClass.length === 0) {
        alert('এই শ্রেণীতে কোন সক্রিয় ছাত্র নেই।');
        return;
    }
    
    const sessionKey = getExamSessionKey(examSession);
    const sessionResults = currentClassExamResults[sessionKey] || {};
    
    // Create CSV content
    let csvContent = 'ছাত্রের নাম,রোল নম্বর';
    
    // Add book headers
    examSession.selectedBooks.forEach(book => {
        csvContent += `,${book.name} (${book.totalMarks})`;
    });
    csvContent += ',মোট নম্বর,শতকরা,গ্রেড,র‍্যাঙ্ক\n';
    
    // Calculate ranks first
    const studentRanks = calculateExamClassRanks(examSession, sessionKey, studentsInClass);
    
    // Add student data
    studentsInClass.forEach(student => {
        const studentResults = sessionResults[student.id] || {};
        let row = `${student.name},${student.rollNumber}`;
        
        // Add marks for each book
        examSession.selectedBooks.forEach(book => {
            const mark = studentResults[book.id] || 0;
            row += `,${mark}`;
        });
        
        // Add totals
        const { total, percentage, grade } = calculateStudentExamTotals(student.id, examSession, studentResults);
        const rank = studentRanks[student.id] || '-';
        
        row += `,${total},${percentage}%,${grade},${rank}`;
        csvContent += row + '\n';
    });
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${examSession.name}_${className}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`"${examSession.name}" পরীক্ষার ফলাফল সফলভাবে এক্সপোর্ট করা হয়েছে।`);
}

function exportAllExamResults(className) {
    const classExams = currentClassExams.filter(exam => exam.status === 'published');
    const studentsInClass = window.students ? window.students.filter(s => 
        s.class === className && s.status === 'active'
    ) : [];
    
    // Create CSV content
    let csvContent = 'ছাত্রের নাম,রোল নম্বর';
    
    // Add exam headers
    classExams.forEach(exam => {
        csvContent += `,${exam.name} (মোট),${exam.name} (%),${exam.name} (গ্রেড)`;
    });
    csvContent += '\n';
    
    // Add student data
    studentsInClass.forEach(student => {
        let row = `${student.name},${student.rollNumber}`;
        
        classExams.forEach(exam => {
            const sessionKey = getExamSessionKey(exam);
            const studentResults = currentClassExamResults[sessionKey]?.[student.id] || {};
            const { total, percentage, grade } = calculateStudentExamTotals(student.id, exam, studentResults);
            
            row += `,${total},${percentage}%,${grade}`;
        });
        
        csvContent += row + '\n';
    });
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${className}_all_exam_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`${className} শ্রেণীর সকল পরীক্ষার ফলাফল সফলভাবে এক্সপোর্ট করা হয়েছে।`);
}

function classExamAnalytics(className) {
    console.log(`📈 Showing analytics for class: ${className}`);
    
    const modal = document.createElement('div');
    modal.id = 'class-analytics-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    
    // Get all published exams for this class
    const publishedExams = currentClassExams.filter(exam => exam.status === 'published') || [];
    const studentsInClass = window.students ? window.students.filter(s => s.class === className && s.status === 'active') : [];
    
    if (publishedExams.length === 0) {
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2">
                <div class="p-6 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold text-gray-800">${className} - পরীক্ষার বিশ্লেষণ</h3>
                        <button onclick="closeClassAnalyticsModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6 text-center">
                    <i class="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
                    <p class="text-lg font-medium text-gray-600">কোন প্রকাশিত পরীক্ষার ফলাফল নেই</p>
                    <p class="text-sm text-gray-500 mt-2">বিশ্লেষণের জন্য কমপক্ষে একটি পরীক্ষার ফলাফল প্রকাশ করুন</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return;
    }
    
    // Calculate comprehensive analytics
    const analytics = calculateClassAnalytics(className, publishedExams, studentsInClass);
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl" style="width: 95vw; height: 90vh;">
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${className} - পরীক্ষার বিশ্লেষণ</h3>
                        <p class="text-sm text-gray-600 mt-1">${publishedExams.length}টি প্রকাশিত পরীক্ষার ডেটা বিশ্লেষণ</p>
                    </div>
                    <button onclick="closeClassAnalyticsModal()" class="text-gray-400 hover:text-gray-600 text-2xl p-2 rounded-full hover:bg-gray-200 transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto" style="height: calc(90vh - 140px);">
                <div class="p-6 space-y-6">
                    <!-- Overall Performance Summary -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <div class="text-2xl font-bold text-blue-600">${analytics.overallStats.totalStudents}</div>
                            <div class="text-sm text-blue-700">মোট ছাত্র</div>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                            <div class="text-2xl font-bold text-green-600">${analytics.overallStats.averagePerformance}%</div>
                            <div class="text-sm text-green-700">শ্রেণীর গড় পারফরম্যান্স</div>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <div class="text-2xl font-bold text-yellow-600">${analytics.overallStats.topPerformers}</div>
                            <div class="text-sm text-yellow-700">A+ গ্রেড প্রাপ্ত</div>
                        </div>
                        <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                            <div class="text-2xl font-bold text-red-600">${analytics.overallStats.needsAttention}</div>
                            <div class="text-sm text-red-700">উন্নতি প্রয়োজন</div>
                        </div>
                    </div>
                    
                    <!-- Performance Trends -->
                    <div class="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 class="font-semibold text-gray-700 mb-4">পারফরম্যান্স ট্রেন্ড</h4>
                        <div class="space-y-3">
                            ${analytics.examPerformance.map(exam => `
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <div class="font-medium text-gray-800">${exam.name}</div>
                                        <div class="text-sm text-gray-500">${exam.year} - ${exam.term}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-lg">${exam.averagePercentage}%</div>
                                        <div class="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${exam.averagePercentage}%"></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Top Performers & Need Attention -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Top Performers -->
                        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h4 class="font-semibold text-green-800 mb-4 flex items-center gap-2">
                                <i class="fas fa-trophy text-yellow-500"></i>
                                শীর্ষ পারফরমার (${analytics.topPerformers.length} জন)
                            </h4>
                            <div class="space-y-3">
                                ${analytics.topPerformers.map((student, index) => `
                                    <div class="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <div class="flex items-center gap-3">
                                            <div class="text-2xl">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}</div>
                                            <div>
                                                <div class="font-medium text-gray-800">${student.name}</div>
                                                <div class="text-sm text-gray-500">রোল: ${student.rollNumber}</div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-green-600">${student.averagePercentage}%</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Students Needing Attention -->
                        <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h4 class="font-semibold text-red-800 mb-4 flex items-center gap-2">
                                <i class="fas fa-exclamation-triangle text-red-500"></i>
                                উন্নতি প্রয়োজন (${analytics.needsAttention.length} জন)
                            </h4>
                            <div class="space-y-3">
                                ${analytics.needsAttention.length > 0 ? analytics.needsAttention.map(student => `
                                    <div class="flex items-center justify-between p-3 bg-white rounded-lg">
                                        <div>
                                            <div class="font-medium text-gray-800">${student.name}</div>
                                            <div class="text-sm text-gray-500">রোল: ${student.rollNumber}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-bold text-red-600">${student.averagePercentage}%</div>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-6 text-gray-500">
                                        <i class="fas fa-smile text-4xl mb-2"></i>
                                        <p class="font-medium">সবাই ভালো করছে!</p>
                                        <p class="text-sm">কোন ছাত্রের বিশেষ মনোযোগের প্রয়োজন নেই</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons Footer -->
            <div class="sticky bottom-0 left-0 right-0 px-6 py-4 bg-gray-50 border-t border-gray-200 z-30 shadow-lg">
                <div class="flex justify-between items-center">
                    <div class="flex gap-3">
                        <button onclick="exportAnalyticsReport('${className}')" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                            <i class="fas fa-download"></i>
                            <span>বিশ্লেষণ এক্সপোর্ট</span>
                        </button>
                        <button onclick="printAnalyticsReport('${className}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
                            <i class="fas fa-print"></i>
                            <span>প্রিন্ট করুন</span>
                        </button>
                    </div>
                    <button onclick="closeClassAnalyticsModal()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                        <i class="fas fa-times"></i>
                        <span>বন্ধ করুন</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function calculateClassAnalytics(className, publishedExams, studentsInClass) {
    const analytics = {
        overallStats: {
            totalStudents: studentsInClass.length,
            averagePerformance: 0,
            topPerformers: 0,
            needsAttention: 0
        },
        examPerformance: [],
        gradeDistribution: {},
        subjectAnalysis: [],
        topPerformers: [],
        needsAttention: []
    };
    
    // Calculate exam-wise performance
    let totalClassPerformance = 0;
    let totalExamCount = 0;
    
    publishedExams.forEach(exam => {
        const sessionKey = getExamSessionKey(exam);
        const sessionResults = currentClassExamResults[sessionKey] || {};
        
        let examTotalPercentage = 0;
        let examStudentCount = 0;
        
        studentsInClass.forEach(student => {
            const studentResults = sessionResults[student.id] || {};
            if (Object.keys(studentResults).length > 0) {
                const { percentage } = calculateStudentExamTotals(student.id, exam, studentResults);
                examTotalPercentage += percentage;
                examStudentCount++;
            }
        });
        
        const averagePercentage = examStudentCount > 0 ? Math.round(examTotalPercentage / examStudentCount) : 0;
        
        analytics.examPerformance.push({
            name: exam.name,
            year: exam.year,
            term: exam.term,
            averagePercentage,
            studentCount: examStudentCount
        });
        
        if (examStudentCount > 0) {
            totalClassPerformance += averagePercentage;
            totalExamCount++;
        }
    });
    
    // Overall class performance
    analytics.overallStats.averagePerformance = totalExamCount > 0 ? Math.round(totalClassPerformance / totalExamCount) : 0;
    
    // Calculate student-wise analytics for latest exam
    if (publishedExams.length > 0) {
        const latestExam = publishedExams.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0];
        const latestSessionKey = getExamSessionKey(latestExam);
        const latestResults = currentClassExamResults[latestSessionKey] || {};
        
        const studentPerformances = [];
        const gradeCount = { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
        
        studentsInClass.forEach(student => {
            const studentResults = latestResults[student.id] || {};
            if (Object.keys(studentResults).length > 0) {
                const { percentage, grade } = calculateStudentExamTotals(student.id, latestExam, studentResults);
                
                studentPerformances.push({
                    ...student,
                    averagePercentage: percentage,
                    examCount: 1
                });
                
                gradeCount[grade] = (gradeCount[grade] || 0) + 1;
                
                if (percentage >= 80) analytics.overallStats.topPerformers++;
                if (percentage < 60) analytics.overallStats.needsAttention++;
            }
        });
        
        analytics.gradeDistribution = gradeCount;
        
        // Top 5 performers
        analytics.topPerformers = studentPerformances
            .sort((a, b) => b.averagePercentage - a.averagePercentage)
            .slice(0, 5);
        
        // Students needing attention (below 60%)
        analytics.needsAttention = studentPerformances
            .filter(s => s.averagePercentage < 60)
            .sort((a, b) => a.averagePercentage - b.averagePercentage)
            .slice(0, 10);
    }
    
    return analytics;
}

function closeClassAnalyticsModal() {
    const modal = document.getElementById('class-analytics-modal');
    if (modal) {
        modal.remove();
    }
}

function exportAnalyticsReport(className) {
    alert('বিশ্লেষণ রিপোর্ট এক্সপোর্ট ফিচার শীঘ্রই যোগ করা হবে।');
}

function printAnalyticsReport(className) {
    window.print();
}

// Placeholder functions already declared above

function importResultsCSV(examId) {
    console.log(`📥 Importing CSV results for exam: ${examId}`);
    // Implementation will be added in next phase
}

function showStudentExamDetail(studentId, examId) {
    console.log(`👤 Opening student detail from exam: ${studentId}`);
    // Open the main student detail window with exam tab selected
    if (typeof window.showStudentProfile === 'function') {
        window.showStudentProfile(studentId, 'exams');
        
        // Ensure student detail modal appears above exam modals
        setTimeout(() => {
            const studentModal = document.getElementById('student-profile-modal');
            if (studentModal) {
                studentModal.style.zIndex = '1000';
            }
        }, 150);
    }
}

function loadStudentExamResults(studentId) {
    console.log(`📊 Loading exam results for student: ${studentId}`);
    
    const container = document.getElementById('student-exam-results-container');
    if (!container) return;
    
    // Get student info
    const student = window.students ? window.students.find(s => s.id === studentId) : null;
    if (!student) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">ছাত্রের তথ্য পাওয়া যায়নি।</p>';
        return;
    }
    
    // Get all exam sessions for this student's class
    const allExamSessions = JSON.parse(localStorage.getItem('examSessions')) || [];
    const studentClassExams = allExamSessions.filter(session => session.class === student.class);
    
    if (studentClassExams.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-graduation-cap text-6xl mb-4"></i>
                <p class="text-lg font-medium">এই ছাত্রের জন্য কোন পরীক্ষার তথ্য নেই</p>
                <p class="text-sm mt-2">${student.class} শ্রেণীতে এখনো কোন পরীক্ষা তৈরি করা হয়নি</p>
            </div>
        `;
        return;
    }
    
    // Get all exam results
    const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    
    // Filter and organize results by year and term
    const organizedResults = {};
    
    studentClassExams.forEach(exam => {
        const sessionKey = getExamSessionKey(exam);
        const studentResults = allExamResults[sessionKey]?.[studentId] || {};
        
        if (!organizedResults[exam.year]) {
            organizedResults[exam.year] = {};
        }
        if (!organizedResults[exam.year][exam.term]) {
            organizedResults[exam.year][exam.term] = [];
        }
        
        // Calculate totals for this exam
        const { total, percentage, grade } = calculateStudentExamTotals(studentId, exam, studentResults);
        const hasResults = Object.keys(studentResults).length > 0;
        
        organizedResults[exam.year][exam.term].push({
            ...exam,
            studentResults,
            total,
            percentage,
            grade,
            hasResults
        });
    });
    
    // Create a compact spreadsheet-like table
    let resultsHTML = `
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-3 py-2 text-left font-semibold text-gray-700 border-r">পরীক্ষা</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700 border-r">বছর</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700 border-r">টার্ম</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700 border-r">মোট</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700 border-r">%</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700 border-r">গ্রেড</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700 border-r">স্ট্যাটাস</th>
                            <th class="px-3 py-2 text-center font-semibold text-gray-700">বিস্তারিত</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Flatten all exams and sort by date (newest first)
    const allExams = [];
    Object.keys(organizedResults).forEach(year => {
        Object.keys(organizedResults[year]).forEach(term => {
            organizedResults[year][term].forEach(exam => {
                allExams.push(exam);
            });
        });
    });
    
    allExams.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    if (allExams.length === 0) {
        resultsHTML += `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-graduation-cap text-4xl mb-3"></i>
                    <p class="font-medium">কোন পরীক্ষার ফলাফল পাওয়া যায়নি</p>
                    <p class="text-sm">এই ছাত্রের জন্য এখনো কোন পরীক্ষা নেওয়া হয়নি</p>
                </td>
            </tr>
        `;
    } else {
        allExams.forEach(exam => {
            const rowBgColor = exam.hasResults ? '' : 'bg-gray-50';
            const statusBadge = `<span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${getExamStatusClass(exam.status)}">${getExamStatusText(exam.status)}</span>`;
            
            resultsHTML += `
                <tr class="border-b hover:bg-blue-50 ${rowBgColor}">
                    <td class="px-3 py-2 font-medium text-gray-800 border-r">${exam.name}</td>
                    <td class="px-3 py-2 text-center border-r">${exam.year}</td>
                    <td class="px-3 py-2 text-center border-r">${exam.term}</td>
                    ${exam.hasResults ? `
                        <td class="px-3 py-2 text-center font-semibold border-r">${exam.total}</td>
                        <td class="px-3 py-2 text-center font-semibold border-r">${exam.percentage}%</td>
                        <td class="px-3 py-2 text-center font-bold ${getGradeColorClass(exam.grade)} border-r">${exam.grade}</td>
                    ` : `
                        <td class="px-3 py-2 text-center text-gray-400 border-r">-</td>
                        <td class="px-3 py-2 text-center text-gray-400 border-r">-</td>
                        <td class="px-3 py-2 text-center text-gray-400 border-r">-</td>
                    `}
                    <td class="px-3 py-2 text-center border-r">${statusBadge}</td>
                    <td class="px-3 py-2 text-center">
                        ${exam.hasResults ? `
                            <button onclick="showExamDetailBreakdown('${studentId}', '${exam.id}')" 
                                    class="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                                <i class="fas fa-eye"></i> দেখুন
                            </button>
                        ` : `
                            <span class="text-gray-400 text-xs">অপেক্ষমাণ</span>
                        `}
                    </td>
                </tr>
            `;
        });
    }
    
    resultsHTML += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Summary Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div class="bg-blue-50 p-3 rounded-lg text-center">
                <div class="text-lg font-bold text-blue-600">${allExams.length}</div>
                <div class="text-xs text-blue-700">মোট পরীক্ষা</div>
            </div>
            <div class="bg-green-50 p-3 rounded-lg text-center">
                <div class="text-lg font-bold text-green-600">${allExams.filter(e => e.hasResults).length}</div>
                <div class="text-xs text-green-700">ফলাফল পাওয়া</div>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg text-center">
                <div class="text-lg font-bold text-yellow-600">
                    ${allExams.filter(e => e.hasResults).length > 0 ? 
                        Math.round(allExams.filter(e => e.hasResults).reduce((sum, e) => sum + e.percentage, 0) / allExams.filter(e => e.hasResults).length) : 0}%
                </div>
                <div class="text-xs text-yellow-700">গড় পারফরম্যান্স</div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg text-center">
                <div class="text-lg font-bold text-purple-600">
                    ${allExams.filter(e => e.hasResults && e.grade.includes('A')).length}
                </div>
                <div class="text-xs text-purple-700">A গ্রেড</div>
            </div>
        </div>
    `;
    
    if (resultsHTML === '') {
        resultsHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-graduation-cap text-6xl mb-4"></i>
                <p class="text-lg font-medium">কোন পরীক্ষার ফলাফল পাওয়া যায়নি</p>
                <p class="text-sm mt-2">এই ছাত্রের জন্য এখনো কোন পরীক্ষা নেওয়া হয়নি</p>
            </div>
        `;
    }
    
    container.innerHTML = resultsHTML;
}

function showExamDetailBreakdown(studentId, examId) {
    console.log(`📋 Showing detailed breakdown for student: ${studentId}, exam: ${examId}`);
    
    const examSession = getCurrentExamSession(examId);
    const student = window.students ? window.students.find(s => s.id === studentId) : null;
    
    if (!examSession || !student) {
        alert('পরীক্ষা বা ছাত্রের তথ্য পাওয়া যায়নি।');
        return;
    }
    
    const sessionKey = getExamSessionKey(examSession);
    const allExamResults = JSON.parse(localStorage.getItem('examResults')) || {};
    const studentResults = allExamResults[sessionKey]?.[studentId] || {};
    
    const modal = document.createElement('div');
    modal.id = 'exam-breakdown-modal';
    modal.className = 'modal-backdrop justify-center items-center';
    modal.style.display = 'flex';
    modal.style.zIndex = '1100'; // Higher than student profile modal
    
    modal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2">
            <div class="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">${student.name} - ${examSession.name}</h3>
                        <p class="text-sm text-gray-600">${examSession.year} - ${examSession.term}</p>
                    </div>
                    <button onclick="closeExamBreakdownModal()" class="text-gray-400 hover:text-gray-600 text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="space-y-4">
                    <!-- Subject-wise Results -->
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-3">বিষয়ভিত্তিক ফলাফল:</h4>
                        <div class="space-y-2">
                            ${examSession.selectedBooks.map(book => {
                                const mark = studentResults[book.id] || 0;
                                const percentage = Math.round((mark / book.totalMarks) * 100);
                                const colorClass = getResultCellColor(mark, book.totalMarks);
                                
                                return `
                                    <div class="flex justify-between items-center p-3 rounded-lg border ${colorClass}">
                                        <div class="font-medium">${book.name}</div>
                                        <div class="text-right">
                                            <div class="font-bold text-lg">${mark}/${book.totalMarks}</div>
                                            <div class="text-sm text-gray-600">${percentage}%</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Overall Results -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-3">সামগ্রিক ফলাফল:</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold text-blue-600">${studentResults && Object.keys(studentResults).length > 0 ? calculateStudentExamTotals(studentId, examSession, studentResults).total : 0}</div>
                                <div class="text-sm text-blue-700">মোট নম্বর</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-green-600">${studentResults && Object.keys(studentResults).length > 0 ? calculateStudentExamTotals(studentId, examSession, studentResults).percentage : 0}%</div>
                                <div class="text-sm text-green-700">শতকরা</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold ${getGradeColorClass(studentResults && Object.keys(studentResults).length > 0 ? calculateStudentExamTotals(studentId, examSession, studentResults).grade : 'F')}">${studentResults && Object.keys(studentResults).length > 0 ? calculateStudentExamTotals(studentId, examSession, studentResults).grade : 'F'}</div>
                                <div class="text-sm text-gray-700">গ্রেড</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="px-6 py-4 bg-gray-50 flex justify-end">
                <button onclick="closeExamBreakdownModal()" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    বন্ধ করুন
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeExamBreakdownModal() {
    const modal = document.getElementById('exam-breakdown-modal');
    if (modal) {
        modal.remove();
    }
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
    updateSelectedBooksDisplay,
    updateBookMarksInSelection,
    removeBookFromSelection,
    removeBookFromExamWithConfirmation,
    closeBookSelectionModal,
    createExamWithBooks,
    saveExamSession,
    refreshExamSectionInstantly,
    showQuickNotification,
    openResultEntryInterface,
    renderStudentResultRow,
    updateStudentMark,
    calculateStudentExamTotals,
    updateAllRanks,
    calculateExamClassRanks,
    updateClassStatistics,
    calculateAllResults,
    getResultCellColor,
    getGradeColorClass,
    getExamSessionKey,
    getCurrentExamSession,
    closeResultEntryModal,
    saveResultsDraft,
    publishResults,
    clearAllResults,
    openClassExam,
    editClassExam,
    viewClassExamResults,
    duplicateClassExam,
    deleteClassExam,
    viewAllClassExams,
    updateComparisonMatrix,
    renderComparisonMatrix,
    getComparisonCellColor,
    selectAllExams,
    exportComparisonMatrix,
    showComparisonChart,
    closeResultsComparisonModal,
    exportClassResults,
    showExportSelectionModal,
    closeExportSelectionModal,
    proceedWithExport,
    exportSingleExamResults,
    exportAllExamResults,
    openResultsViewInterface,
    closeResultsViewModal,
    classExamAnalytics,
    calculateClassAnalytics,
    closeClassAnalyticsModal,
    exportAnalyticsReport,
    printAnalyticsReport,
    importResultsCSV,
    showStudentExamDetail,
    loadStudentExamResults,
    showExamDetailBreakdown,
    closeExamBreakdownModal,
    calculateStudentTotals,
    getExamGrade,
    getRankHTML,
    getExamStatusClass,
    getExamStatusText
};
