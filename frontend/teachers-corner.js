        // --- REAL DATA FROM MAIN APP ---
        // Students will be loaded from main application database
        let allStudents = [];
        
        // Function to load students from main app
        async function loadStudentsFromMainApp() {
            try {
                const response = await fetch('/api/students');
                if (response.ok) {
                    allStudents = await response.json();
                    console.log('✅ Loaded students from main app:', allStudents.length);
                    
                    // If we have a current class, refresh the dashboard
                    if (currentClass) {
                        showClassDashboard(currentClass);
                    }
                } else {
                    console.error('❌ Failed to load students from main app');
                }
            } catch (error) {
                console.error('❌ Error loading students:', error);
            }
        }
        
        // Function to load attendance data from main app
        async function loadAttendanceFromMainApp() {
            try {
                const response = await fetch('/api/attendance');
                if (response.ok) {
                    const attendanceData = await response.json();
                    console.log('✅ Loaded attendance data from main app');
                    
                    // Store attendance data globally
                    window.attendance = attendanceData;
                    
                    // If we have a current class, refresh the dashboard
                    if (currentClass) {
                        showClassDashboard(currentClass);
                    }
                } else {
                    console.error('❌ Failed to load attendance data from main app');
                }
            } catch (error) {
                    console.error('❌ Error loading attendance data:', error);
            }
        }
        
        // Function to load books for a specific class
        async function loadBooksForClass(className) {
            try {
                // Convert Bengali class name to numeric ID
                const classId = getClassIdByName(className);
                if (!classId) {
                    console.error('❌ Invalid class name:', className);
                    console.log('Available class names:', Object.keys(classMapping));
                    console.log('Class mapping:', classMapping);
                    return [];
                }
                
                const response = await fetch(`/api/books/class/${classId}`);
                if (response.ok) {
                    const books = await response.json();
                    console.log(`✅ Loaded ${books.length} books for class ${className} (ID: ${classId})`);
                    return books;
                } else {
                    console.error('❌ Failed to load books for class:', className);
                    return [];
                }
            } catch (error) {
                console.error('❌ Error loading books for class:', error);
                return [];
            }
        }
        
        // Function to load education progress for a specific class
        async function loadEducationProgressForClass(className) {
            try {
                const response = await fetch('/api/education');
                if (response.ok) {
                    const allProgress = await response.json();
                    
                    // Filter progress by class name
                    const classProgress = allProgress.filter(progress => 
                        progress.class_name === className
                    );
                    
                    console.log(`✅ Loaded ${classProgress.length} education progress items for class ${className}`);
                    return classProgress;
                } else {
                    console.error('❌ Failed to load education progress');
                    return [];
                }
            } catch (error) {
                console.error('❌ Error loading education progress:', error);
                return [];
            }
        }
        
        // Function to load progress history for a specific book
        async function loadProgressHistoryForBook(bookId, className) {
            try {
                console.log(`🔍 Frontend: Loading history for book_id=${bookId}, class_name='${className}'`);
                
                // Convert Bengali class name to English class name for database query
                const englishClassName = convertBengaliClassNameToEnglish(className);
                console.log(`🔍 Frontend: Converted '${className}' to '${englishClassName}' for database query`);
                
                const response = await fetch(`/api/education/history/book/${bookId}/class/${encodeURIComponent(englishClassName)}`);
                console.log(`🔍 Frontend: API response status: ${response.status}`);
                
                if (response.ok) {
                    const history = await response.json();
                    console.log(`🔍 Frontend: Raw history data:`, history);
                    console.log(`✅ Loaded ${history.length} history entries for book ${bookId} in class ${className}`);
                    return history.map(entry => ({
                        date: entry.change_date,
                        completed: entry.completed_pages,
                        note: entry.notes
                    }));
                } else {
                    const errorText = await response.text();
                    console.error('❌ Failed to load progress history for book', bookId, 'Status:', response.status, 'Error:', errorText);
                    return [];
                }
            } catch (error) {
                console.error('❌ Error loading progress history for book', bookId, ':', error);
                return [];
            }
        }
        
        // Dynamic class mapping - gets real class names from database
        let classMapping = {};
        
        // Function to load and build class mapping from database
        async function loadClassMapping() {
            try {
                const response = await fetch('/api/classes');
                if (response.ok) {
                    const classes = await response.json();
                    // Build mapping: class name -> class id
                    classMapping = {};
                    classes.forEach(cls => {
                        classMapping[cls.name] = cls.id;
                    });
                    console.log('✅ Class mapping loaded:', classMapping);
                } else {
                    console.error('❌ Failed to load classes for mapping');
                }
            } catch (error) {
                console.error('❌ Error loading class mapping:', error);
            }
        }
        
        // Helper function to convert Bengali class name to numeric ID
        function getClassIdByName(className) {
            // Use dynamic mapping if available, fallback to hardcoded
            if (Object.keys(classMapping).length > 0) {
                const classId = classMapping[className];
                if (classId) {
                    console.log(`✅ Found class ID for "${className}": ${classId}`);
                    return classId;
                } else {
                    console.warn(`⚠️ Class name "${className}" not found in database mapping`);
                    // Fallback to hardcoded mapping for common class names
                    const fallbackMap = {
                        'প্রথম শ্রেণী': 1,
                        'দ্বিতীয় শ্রেণী': 2,
                        'তৃতীয় শ্রেণী': 3,
                        'চতুর্থ শ্রেণী': 4,
                        'পঞ্চম শ্রেণী': 5
                    };
                    return fallbackMap[className] || null;
                }
            } else {
                // Fallback to hardcoded mapping if dynamic mapping not loaded yet
                const fallbackMap = {
                    'প্রথম শ্রেণী': 1,
                    'দ্বিতীয় শ্রেণী': 2,
                    'তৃতীয় শ্রেণী': 3,
                    'চতুর্থ শ্রেণী': 4,
                    'পঞ্চম শ্রেণী': 5
                };
                return fallbackMap[className] || null;
            }
        }
        
        // Helper function to convert Bengali class name to English class name for database queries
        function convertBengaliClassNameToEnglish(className) {
            const bengaliToEnglishMap = {
                'প্রথম বর্ষ': 'Class One',
                'দ্বিতীয় বর্ষ': 'Class Two', 
                'তৃতীয় বর্ষ': 'Class Three',
                'চতুর্থ বর্ষ': 'Class Four',
                'পঞ্চম বর্ষ': 'Class Five',
                'প্রথম শ্রেণী': 'Class One',
                'দ্বিতীয় শ্রেণী': 'Class Two',
                'তৃতীয় শ্রেণী': 'Class Three',
                'চতুর্থ শ্রেণী': 'Class Four',
                'পঞ্চম শ্রেণী': 'Class Five'
            };
            
            const englishName = bengaliToEnglishMap[className];
            if (englishName) {
                console.log(`✅ Converted Bengali class name "${className}" to English "${englishName}"`);
                return englishName;
            } else {
                console.warn(`⚠️ No English mapping found for Bengali class name: "${className}"`);
                return className; // Return original if no mapping found
            }
        }
        
        // Function to get active students for a class
        function getActiveStudentsForClass(className) {
            return allStudents.filter(student => 
                student.class === className && 
                student.status !== 'inactive'
            );
        }
        
        // Function to get inactive students for a class
        function getInactiveStudentsForClass(className) {
            return allStudents.filter(student => 
                student.class === className && 
                student.status === 'inactive'
            );
        }
        // New clean education system - will be populated from main app database
        let allEducationProgress = [];
        // Remove localStorage dependencies and use database instead
        let teachersLogbook = {}; // Will be loaded from database
        let studentScores = {}; // Will be loaded from database
        let scoreChangeHistory = {}; // Will be loaded from database
        let tarbiyahGoals = JSON.parse(localStorage.getItem('tarbiyahGoals_v1')) || {}; // Keep this for now

        // --- GLOBAL STATE ---
        let currentClass = null; let currentLogTab = 'class'; let currentStudentIdForProfile = null;
        
        // --- DOM CACHE ---
        let domCache = {};
        
        function getCachedElement(id) {
            if (!domCache[id]) {
                domCache[id] = document.getElementById(id);
            }
            return domCache[id];
        }
        
        function updateElementText(id, text) {
            const element = getCachedElement(id);
            if (element && element.textContent !== text) {
                element.textContent = text;
            }
        }
        
        function updateElementHTML(id, html) {
            const element = getCachedElement(id);
            if (element && element.innerHTML !== html) {
                element.innerHTML = html;
            }
        }
        
        // --- PERFORMANCE OPTIMIZATION ---
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // --- DATABASE INTEGRATION FUNCTIONS ---
        
        // Load teacher logs from database
        async function loadTeacherLogsFromDatabase(className) {
            try {
                const response = await fetch(`/api/teacher-logs?class=${encodeURIComponent(className)}`);
                if (response.ok) {
                    const logs = await response.json();
                    console.log(`✅ Loaded ${logs.length} teacher logs for class: ${className}`);
                    
                    // Convert database format to local format for compatibility
                    teachersLogbook[className] = { class_logs: [], student_logs: {} };
                    
                    logs.forEach(log => {
                        if (log.student_id) {
                            // Student-specific log
                            if (!teachersLogbook[className].student_logs[log.student_id]) {
                                teachersLogbook[className].student_logs[log.student_id] = [];
                            }
                            teachersLogbook[className].student_logs[log.student_id].push({
                                id: log.id,
                                type: log.log_type,
                                details: log.details,
                                date: log.created_at,
                                isImportant: log.is_important,
                                needsFollowup: log.needs_followup,
                                studentId: log.student_id,
                                student_id: log.student_id  // Add both for compatibility
                            });
                        } else {
                            // Class log
                            teachersLogbook[className].class_logs.push({
                                id: log.id,
                                type: log.log_type,
                                details: log.details,
                                date: log.created_at,
                                isImportant: log.is_important,
                                needsFollowup: log.needs_followup
                            });
                        }
                    });
                    
                    return true;
                } else {
                    console.error('❌ Failed to load teacher logs from database');
                    return false;
                }
            } catch (error) {
                console.error('❌ Error loading teacher logs:', error);
                return false;
            }
        }
        
        // Load student scores from database
        async function loadStudentScoresFromDatabase(className) {
            try {
                const response = await fetch(`/api/students-with-scores?class=${encodeURIComponent(className)}`);
                if (response.ok) {
                    const studentsWithScores = await response.json();
                    console.log(`✅ Loaded ${studentsWithScores.length} student scores for class: ${className}`);
                    
                    // Update local studentScores object
                    studentsWithScores.forEach(student => {
                        studentScores[student.id] = student.current_score || 70;
                    });
                    
                    return true;
                } else {
                    console.error('❌ Failed to load student scores from database');
                    return false;
                }
            } catch (error) {
                console.error('❌ Error loading student scores:', error);
                return false;
            }
        }
        
        // Load score change history from database
        async function loadScoreHistoryFromDatabase(studentId) {
            try {
                const response = await fetch(`/api/student-scores/${studentId}/history`);
                if (response.ok) {
                    const history = await response.json();
                    console.log(`✅ Loaded ${history.length} score changes for student: ${studentId}`);
                    
                    // Convert database format to local format
                    scoreChangeHistory[studentId] = history.map(change => ({
                        date: change.changed_at,
                        oldScore: change.old_score,
                        newScore: change.new_score,
                        reason: change.change_reason || 'কোন কারণ উল্লেখ করা হয়নি',
                        changedBy: 'শিক্ষক'
                    }));
                    
                    return true;
                } else {
                    console.error('❌ Failed to load score history from database');
                    return false;
                }
            } catch (error) {
                console.error('❌ Error loading score history:', error);
                return false;
            }
        }

        // --- INITIALIZATION ---
        document.addEventListener('DOMContentLoaded', async () => {
            initTeachersCorner();
            
            // Load real data from main app
            await loadClassMapping(); // Load class mapping first
            await loadStudentsFromMainApp();
            await loadAttendanceFromMainApp();
            
              const teachersCornerSection = document.getElementById('teachers-corner-section');
              if (teachersCornerSection) {
                  teachersCornerSection.innerHTML = `
                        <div class="text-center p-8">
                            <h2 class="text-2xl font-bold mb-4 text-gray-700">শ্রেণী নির্বাচন করুন</h2>
                            <p class="text-gray-600">Teachers Corner থেকে একটি শ্রেণী নির্বাচন করুন।</p>
                        </div>
                    `;
              }
        });

        function initTeachersCorner() {
            console.log('🚀 Initializing Teachers Corner section...');
            
            // Get the teachers corner section
            const teachersCornerSection = document.getElementById('teachers-corner-section');
            if (!teachersCornerSection) {
                console.error('❌ teachers-corner-section element not found');
                return;
            }
            
            // Check if the section already has the required content
            const hasRequiredContent = document.getElementById('class-dashboard-title') && 
                                    document.getElementById('class-student-list') && 
                                    document.getElementById('class-education-progress') && 
                                    document.getElementById('performance-chart') && 
                                    document.getElementById('logbook-display');
            
            if (hasRequiredContent) {
                console.log('✅ Teachers Corner section already has required content');
                return;
            }
            
            console.log('🔄 Populating Teachers Corner section with dashboard content...');
            
            // Populate the section with the required HTML structure
            teachersCornerSection.innerHTML = `
                <h2 id="class-dashboard-title" class="text-2xl font-bold mb-6 pb-2">শ্রেণী নির্বাচন করুন</h2>
    
                <!-- Today's Summary -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div class="stat-card"><i class="fas fa-users text-4xl text-blue-500 mb-4"></i><h3 id="class-total-students" class="text-4xl font-bold text-gray-800">0</h3><p class="text-gray-500">মোট ছাত্র</p></div>
                    <div class="stat-card"><i class="fas fa-user-check text-4xl text-green-500 mb-4"></i><h3 id="class-present-today" class="text-4xl font-bold text-gray-800">0</h3><p class="text-gray-500">আজ উপস্থিত</p></div>
                    <div class="stat-card"><i class="fas fa-user-times text-4xl text-red-500 mb-4"></i><h3 id="class-absent-today" class="text-4xl font-bold text-gray-800">0</h3><p class="text-gray-500">আজ অনুপস্থিত</p></div>
                    <div class="stat-card"><i class="fas fa-percentage text-4xl text-purple-500 mb-4"></i><h3 id="class-attendance-rate" class="text-4xl font-bold text-gray-800">0%</h3><p class="text-gray-500">উপস্থিতির হার</p></div>
                    <div class="stat-card" onclick="showInactiveStudentsModal()" style="cursor: pointer;"><i class="fas fa-user-slash text-4xl text-orange-500 mb-4"></i><h3 id="class-inactive-students" class="text-4xl font-bold text-gray-800">0</h3><p class="text-gray-500">নিষ্ক্রিয় ছাত্র</p></div>
                </div>
    
                <!-- Dashboard Alerts -->
                <div id="dashboard-alerts" class="mb-8 bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                        এক নজরে সতর্কতা
                    </h3>
                    <div id="alerts-content" class="space-y-3">
                        <!-- Alerts will be rendered here -->
                    </div>
                </div>
    
                <!-- Class Overview & Teacher's Logbook -->
                <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                    <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                         <h3 class="text-xl font-semibold mb-4 text-gray-700">শ্রেণীর সার্বিক অবস্থা</h3>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                  <h4 class="font-semibold text-gray-600 text-sm mb-2">ছাত্রদের স্তর</h4>
                                  <div id="performance-chart" class="space-y-2">
                                      <!-- Performance categories will be rendered here -->
                                  </div>
                              </div>
                             <div>
                                 <h4 class="font-semibold text-gray-600 text-sm mb-2">সাম্প্রতিক শ্রেণী লগ</h4>
                                 <div id="recent-class-logs" class="space-y-2 max-h-32 overflow-y-auto">
                                     <!-- Recent logs will be rendered here -->
                                 </div>
                             </div>
                         </div>
                    </div>
                    <div class="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold text-gray-700">📔 শিক্ষকের লগবুক</h3>
                            <button onclick="showAddLogModal()" class="btn-success text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2"><i class="fas fa-plus"></i> নতুন নোট</button>
                        </div>
                        <div class="logbook-tabs border-b border-gray-200 mb-4">
                            <button onclick="switchLogTab('class')" class="tab-button py-2 px-4 text-gray-500 font-semibold active">শ্রেণী লগ</button>
                            <button onclick="switchLogTab('student')" class="tab-button py-2 px-4 text-gray-500 font-semibold">ছাত্র লগ</button>
                        </div>
                        <div id="logbook-display" class="space-y-4 max-h-[400px] overflow-y-auto pr-2"></div>
                    </div>
                </div>
    
                <!-- Student List & Education Progress -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold text-gray-700">ছাত্রদের তালিকা</h3>
                            <button onclick="clearStudentFilter()" class="text-sm text-blue-600 hover:text-blue-800 underline">
                                সব ছাত্র দেখুন
                            </button>
                        </div>
                        <div class="max-h-80 overflow-y-auto student-list-container">
                            <table class="w-full text-sm text-left text-gray-600">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th class="px-3 py-2 text-center">স্কোর</th>
                                        <th class="px-3 py-2">রোল</th>
                                        <th class="px-3 py-2">নাম</th>
                                    </tr>
                                </thead>
                                <tbody id="class-student-list"></tbody>
                            </table>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold text-gray-700">শিক্ষার অগ্রগতি</h3>
                            <div class="flex gap-2">
                                <button onclick="showBookModal()" class="text-gray-500 hover:text-blue-500" title="নতুন বই যোগ করুন"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                        <div id="class-education-progress" class="space-y-3 max-h-80 overflow-y-auto"></div>
                    </div>
                    
                    <!-- Progress History Summary -->
                    <div class="bg-white p-6 rounded-lg shadow-md mt-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-semibold text-gray-700">অগ্রগতির সারসংক্ষেপ</h3>
                            <div class="text-sm text-gray-500">
                                <i class="fas fa-chart-line mr-1"></i>শ্রেণীর সামগ্রিক অগ্রগতি
                            </div>
                        </div>
                        <div id="progress-summary" class="space-y-4"></div>
                    </div>
                </div>
            `;
            
            console.log('✅ Teachers Corner section populated with dashboard content');
            console.log('🔍 Required elements after population:', {
                'class-dashboard-title': !!document.getElementById('class-dashboard-title'),
                'class-student-list': !!document.getElementById('class-student-list'),
                'class-education-progress': !!document.getElementById('class-education-progress'),
                'performance-chart': !!document.getElementById('performance-chart'),
                'logbook-display': !!document.getElementById('logbook-display')
            });
        }

        // --- NAVIGATION ---

        async function showClassDashboard(className) {
            console.log(`🚀 showClassDashboard called for class: ${className}`);
            
            // First check if the teachers corner section is visible
            const teachersCornerSection = document.getElementById('teachers-corner-section');
            if (!teachersCornerSection) {
                console.error('❌ teachers-corner-section element not found');
                return;
            }
            
            if (!teachersCornerSection.classList.contains('active')) {
                console.error('❌ teachers-corner-section is not active/visible');
                console.log('🔍 Current classes on teachers-corner-section:', teachersCornerSection.className);
                console.log('🔍 Computed display style:', window.getComputedStyle(teachersCornerSection).display);
                return;
            }
            
            console.log(`🔍 Current DOM state:`, {
                'class-dashboard-title': !!document.getElementById('class-dashboard-title'),
                'class-student-list': !!document.getElementById('class-student-list'),
                'class-education-progress': !!document.getElementById('class-education-progress'),
                'performance-chart': !!document.getElementById('performance-chart'),
                'logbook-display': !!document.getElementById('logbook-display')
            });
            
            currentClass = className;
            
            // Check if all required elements exist before proceeding
            const requiredElements = [
                'class-dashboard-title',
                'class-student-list',
                'class-education-progress',
                'performance-chart',
                'logbook-display'
            ];
            
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.error('❌ Required elements not found:', missingElements);
                console.error('❌ Cannot proceed with dashboard loading');
                console.error('🔍 DOM state at failure:', {
                    'document.readyState': document.readyState,
                    'teachers-corner-section visible': !!document.getElementById('teachers-corner-section'),
                    'all sections': Array.from(document.querySelectorAll('.section')).map(s => ({ id: s.id, visible: !s.classList.contains('hidden') }))
                });
                
                // Show detailed element status
                console.error('🔍 Detailed element status:');
                requiredElements.forEach(id => {
                    const element = document.getElementById(id);
                    console.error(`  ${id}: ${element ? 'FOUND' : 'MISSING'} ${element ? `(classes: ${element.className})` : ''}`);
                });
                
                // Show user-friendly error message
                const dashboardTitle = document.getElementById('class-dashboard-title');
                if (dashboardTitle) {
                    dashboardTitle.innerHTML = `
                        <div class="text-center p-8">
                            <h2 class="text-2xl font-bold mb-4 text-red-600">ড্যাশবোর্ড লোডিং সমস্যা</h2>
                            <p class="text-gray-600 mb-4">কিছু প্রয়োজনীয় উপাদান পাওয়া যায়নি।</p>
                            <p class="text-sm text-gray-500 mb-4">অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।</p>
                            <button onclick="showClassDashboard('${className}')" class="btn-primary text-white px-4 py-2 rounded-md">
                                আবার চেষ্টা করুন
                            </button>
                        </div>
                    `;
                }
                return;
            }
            
            console.log('✅ All required elements found, proceeding with dashboard...');
            
            try {
            // Ensure the element exists before setting innerText
            const dashboardTitle = document.getElementById('class-dashboard-title');
            if (dashboardTitle) {
                dashboardTitle.innerText = `${className} - Teachers Corner`;
            } else {
                console.error('❌ class-dashboard-title element not found despite check');
                return;
            }
            
            // Get active and inactive students separately
            const activeStudentsInClass = getActiveStudentsForClass(className);
            const inactiveStudentsInClass = getInactiveStudentsForClass(className);
                
                console.log(`👥 Found ${activeStudentsInClass.length} active students and ${inactiveStudentsInClass.length} inactive students for class: ${className}`);
            
            // Load real book data for this class
            const books = await loadBooksForClass(className);
            console.log(`📚 Loaded ${books.length} books for class ${className}:`, books);
            
            // Load existing education progress for this class
            let existingProgress = [];
            try {
                const progressResponse = await fetch(`/api/education?class_name=${encodeURIComponent(className)}`);
                if (progressResponse.ok) {
                    existingProgress = await progressResponse.json();
                    console.log(`📊 Loaded ${existingProgress.length} existing progress records for class:`, className);
                }
            } catch (error) {
                console.error('Error loading existing progress:', error);
            }
                
                // Clear any existing education progress data before loading new data
                console.log('🧹 Clearing existing allEducationProgress data before loading new data for class:', className);
                allEducationProgress = [];
            
            // Convert books to education progress format for display
            console.log('🔄 Starting conversion of books to education progress format');
            console.log('📚 Books to convert:', books);
            
            // Load progress history for all books in parallel
            const booksWithHistory = await Promise.all(books.map(async (book) => {
                // Find existing progress for this book
                const existingBookProgress = existingProgress.find(p => p.book_id === book.id);
                
                // Load progress history from database
                const progressHistory = await loadProgressHistoryForBook(book.id, className);
                
                const converted = {
                    id: book.id,
                    book_name: book.book_name,
                    class_id: book.class_id,
                    class_name: className, // Use the class name passed to the function
                    total_pages: book.total_pages || 100, // Default if not set
                    completed_pages: existingBookProgress ? existingBookProgress.completed_pages : 0,
                    notes: existingBookProgress ? existingBookProgress.notes : '',
                    progressHistory: progressHistory, // Load from database
                    progress_record_id: existingBookProgress ? existingBookProgress.id : null
                };
                console.log(`🔄 Converting book:`, book);
                console.log(`✅ Converted to:`, converted);
                return converted;
            }));
            
            allEducationProgress = booksWithHistory;
            
            console.log(`🎯 Final allEducationProgress array:`, allEducationProgress);
            
            console.log(`🔄 Converted ${allEducationProgress.length} books to education progress format:`, allEducationProgress);
            
            // Load teacher logs and student scores from database
            console.log('📝 Loading teacher logs and student scores from database...');
            await loadTeacherLogsFromDatabase(className);
            await loadStudentScoresFromDatabase(className);
            
            // Render dashboard with real data
                console.log('🎨 Starting to render dashboard components...');
            renderTodaySummary(activeStudentsInClass);
            renderClassStudentList(activeStudentsInClass);
            renderClassEducationProgress(className); // This now also calls renderProgressSummary
            renderClassOverview(activeStudentsInClass);
            renderTeachersLogbook();
            renderDashboardAlerts(activeStudentsInClass);
                
                // Additional debugging for progress summary
                console.log(`🔍 After rendering, currentClass: ${currentClass}`);
                console.log(`🔍 After rendering, allEducationProgress length: ${allEducationProgress.length}`);
                console.log(`🔍 After rendering, allEducationProgress class names:`, allEducationProgress.map(p => p.class_name));
            
            // Update inactive students count
            const inactiveStudentsEl = document.getElementById('class-inactive-students');
            if (inactiveStudentsEl) {
                updateElementText('class-inactive-students', inactiveStudentsInClass.length);
                }
                
                console.log('✅ Dashboard rendering completed successfully');
                
            } catch (error) {
                console.error('❌ Error in showClassDashboard:', error);
                // Show user-friendly error message
                const dashboardTitle = document.getElementById('class-dashboard-title');
                if (dashboardTitle) {
                    dashboardTitle.innerHTML = `
                        <div class="text-center p-8">
                            <h2 class="text-2xl font-bold mb-4 text-red-600">ড্যাশবোর্ড লোডিং সমস্যা</h2>
                            <p class="text-gray-600 mb-4">${error.message || 'একটি ত্রুটি ঘটেছে।'}</p>
                            <button onclick="showClassDashboard('${className}')" class="btn-primary text-white px-4 py-2 rounded-md">
                                আবার চেষ্টা করুন
                            </button>
                        </div>
                    `;
                }
            }
        }

        // --- DATA CALCULATION ---
        function getHusnulKhulukScore(studentId) {
            // Get score from local studentScores object (loaded from database)
            if (studentScores[studentId] !== undefined) {
            return studentScores[studentId];
        }
            // Return default score if not loaded yet
            return 70;
        }
        


        function editHusnulKhuluk(studentId, currentScore) {
            const scoreStudentId = document.getElementById('score-student-id');
            const newScore = document.getElementById('new-score');
            const scoreChangeReason = document.getElementById('score-change-reason');
            const scoreModal = document.getElementById('score-modal');
            
            if (scoreStudentId) scoreStudentId.value = studentId;
            if (newScore) newScore.value = currentScore;
            if (scoreChangeReason) scoreChangeReason.value = '';
            if (scoreModal) scoreModal.style.display = 'flex';
        }

        function closeScoreModal() {
            const scoreModal = document.getElementById('score-modal');
            if (scoreModal) scoreModal.style.display = 'none';
        }
        
        // Inactive Students Modal Functions
        function showInactiveStudentsModal() {
            if (!currentClass) return;
            
            const inactiveStudents = getInactiveStudentsForClass(currentClass);
            const modal = document.getElementById('inactive-students-modal');
            const listContainer = document.getElementById('inactive-students-list');
            
            if (inactiveStudents.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center p-8 text-gray-500">
                        <i class="fas fa-info-circle text-4xl mb-4"></i>
                        <p>এই শ্রেণীতে কোনো নিষ্ক্রিয় ছাত্র নেই।</p>
                    </div>
                `;
            } else {
                const studentsList = inactiveStudents.map(student => `
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800">
                                    <span class="clickable-name" onclick="showStudentDetail('${student.id}', 'teachers-corner')" style="cursor: pointer; color: #3498db;">
                                        ${student.name} বিন ${student.fatherName}
                                    </span>
                                </h4>
                                <div class="text-sm text-gray-600 mt-1">
                                    <span class="mr-4">রোল: ${student.rollNumber}</span>
                                    <span class="mr-4">মোবাইল: ${student.mobileNumber}</span>
                                    <span>জেলা: ${student.district}, ${student.upazila}</span>
                                </div>
                                <div class="text-xs text-orange-600 mt-2 font-medium">
                                    <i class="fas fa-exclamation-triangle"></i> নিষ্ক্রিয় অবস্থায়
                                    ${student.inactivationDate ? ` (${student.inactivationDate} থেকে)` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                listContainer.innerHTML = studentsList;
            }
            
            modal.style.display = 'flex';
        }
        
        function closeInactiveStudentsModal() {
            const inactiveStudentsModal = document.getElementById('inactive-students-modal');
            if (inactiveStudentsModal) inactiveStudentsModal.style.display = 'none';
        }

        function saveNewScore() {
            const scoreStudentId = document.getElementById('score-student-id');
            const newScoreElement = document.getElementById('new-score');
            const changeReasonElement = document.getElementById('score-change-reason');
            
            if (!scoreStudentId || !newScoreElement || !changeReasonElement) {
                console.error('❌ Required score change elements not found');
                return;
            }
            
            const studentId = scoreStudentId.value;
            const newScore = newScoreElement.value;
            const changeReason = changeReasonElement.value;
            
            if (newScore !== null && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                // Save score to database
                updateScoreInDatabase(studentId, parseInt(newScore), changeReason);
            } else {
                alert("অনুগ্রহ করে ০ থেকে ১০০ এর মধ্যে একটি নাম্বার দিন।");
            }
        }
        
        // Update score in database
        async function updateScoreInDatabase(studentId, newScore, reason) {
            try {
                const response = await fetch(`/api/student-scores/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        new_score: newScore,
                        reason: reason || 'কোন কারণ উল্লেখ করা হয়নি'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Score updated successfully:', result);
                    
                    // Update local score
                    studentScores[studentId] = newScore;
                    
                    // Reload score history from database
                    await loadScoreHistoryFromDatabase(studentId);
                    
                    // Refresh display
                const activeStudentsInClass = getActiveStudentsForClass(currentClass);
                renderClassStudentList(activeStudentsInClass);
                renderClassOverview(activeStudentsInClass);
                    
                closeScoreModal();
                    alert('স্কোর সফলভাবে আপডেট হয়েছে।');
            } else {
                    const error = await response.json();
                    console.error('❌ Failed to update score:', error);
                    alert('স্কোর আপডেট করতে সমস্যা হয়েছে।');
                }
            } catch (error) {
                console.error('❌ Error updating score:', error);
                alert('সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        }

        // --- RENDERING FUNCTIONS ---
        function renderTodaySummary(students) {
            const total = students.length;
            
            // Get today's attendance data from main app
            const today = new Date().toISOString().split('T')[0];
            let present = 0;
            let absent = 0;
            
            // Load attendance data from main app (same endpoint as main app)
            fetch('/api/attendance')
                .then(response => response.json())
                .then(attendanceData => {
                    if (attendanceData && attendanceData[today]) {
                        students.forEach(student => {
                            const studentAttendance = attendanceData[today][student.id];
                            if (studentAttendance) {
                                if (studentAttendance.status === 'present') {
                                    present++;
                                } else if (studentAttendance.status === 'absent') {
                                    absent++;
                                }
                            }
                        });
                    }
                    
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            
                    // Batch DOM updates with color coding
            requestAnimationFrame(() => {
                // Check if elements exist before updating
                const totalStudentsEl = document.getElementById('class-total-students');
                const presentTodayEl = document.getElementById('class-present-today');
                const absentTodayEl = document.getElementById('class-absent-today');
                const attendanceRateEl = document.getElementById('class-attendance-rate');
                
                        if (totalStudentsEl) {
                            updateElementText('class-total-students', total);
                        }
                        if (presentTodayEl) {
                            updateElementText('class-present-today', present);
                        }
                        if (absentTodayEl) {
                            updateElementText('class-absent-today', absent);
                        }
                        if (attendanceRateEl) {
                            updateElementText('class-attendance-rate', `${rate}%`);
                            // Color coding for attendance rate based on percentage using CSS classes
                            attendanceRateEl.classList.remove('attendance-high', 'attendance-medium', 'attendance-low');
                            if (rate >= 80) {
                                attendanceRateEl.classList.add('attendance-high'); // Green for ≥80%
                            } else if (rate >= 60) {
                                attendanceRateEl.classList.add('attendance-medium'); // Orange for ≥60%
                            } else {
                                attendanceRateEl.classList.add('attendance-low'); // Red for <60%
                            }
                        }
                    });
                })
                .catch(error => {
                    console.error('Error loading attendance data:', error);
                    // Fallback to showing just total students with default colors
                    requestAnimationFrame(() => {
                        // Check if elements exist before updating
                        const totalStudentsEl = document.getElementById('class-total-students');
                        const presentTodayEl = document.getElementById('class-present-today');
                        const absentTodayEl = document.getElementById('class-absent-today');
                        const attendanceRateEl = document.getElementById('class-attendance-rate');
                        
                        if (totalStudentsEl) {
                            updateElementText('class-total-students', total);
                        }
                        if (presentTodayEl) {
                            updateElementText('class-present-today', '0');
                        }
                        if (absentTodayEl) {
                            updateElementText('class-absent-today', '0');
                        }
                        if (attendanceRateEl) {
                            updateElementText('class-attendance-rate', '0%');
                            attendanceRateEl.classList.remove('attendance-high', 'attendance-medium', 'attendance-low');
                            attendanceRateEl.classList.add('attendance-low'); // Red for 0%
                        }
                    });
            });
        }
        
        function renderClassOverview(students) {
            const performance = { mustaid: 0, mutawassit: 0, mujtahid: 0 };
            students.forEach(s => {
                const score = getHusnulKhulukScore(s.id);
                if (score >= 80) performance.mustaid++;
                else if (score >= 60) performance.mutawassit++;
                else performance.mujtahid++;
            });
            
            const performanceData = [
                { label: 'মুস্তাইদ (ممتاز)', value: performance.mustaid, color: 'text-green-600' },
                { label: 'মুতাওয়াসসিত (متوسط)', value: performance.mutawassit, color: 'text-yellow-600' },
                { label: 'মুজতাহিদ (مجتهد)', value: performance.mujtahid, color: 'text-red-600' },
            ];
            const performanceChart = document.getElementById('performance-chart');
            if (!performanceChart) {
                console.error('❌ performance-chart element not found');
                return;
            }
            
            performanceChart.innerHTML = performanceData.map(p => {
                const tierKey = p.label.includes('মুস্তাইদ') ? 'mustaid' : p.label.includes('মুতাওয়াসসিত') ? 'mutawassit' : 'mujtahid';
                return `<div class="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" onclick="filterStudentsByTier('${tierKey}')"><span class="text-sm font-semibold ${p.color}">${p.label}</span><span class="text-sm font-bold text-gray-700">${p.value} জন</span></div>`;
            }).join('');
            
            const classLogs = (teachersLogbook[currentClass]?.class_logs || []).sort((a,b) => new Date(b.date) - new Date(b.date)).slice(0, 3);
            const logsHTML = classLogs.length > 0 ? classLogs.map(log => `<div class="text-xs bg-gray-50 p-2 rounded"><p class="font-semibold text-gray-700">${log.details}</p><p class="text-gray-500">${new Date(log.date).toLocaleDateString('bn-BD')} - ${log.type}</p></div>`).join('') : '<p class="text-xs text-gray-500 italic">কোনো শ্রেণী লগ নেই।</p>';
            
            const recentClassLogsEl = document.getElementById('recent-class-logs');
            if (recentClassLogsEl) {
                updateElementHTML('recent-class-logs', logsHTML);
            }
        }


        
        function filterStudentsByTier(tier) {
            const studentsInClass = allStudents.filter(s => s.class === currentClass);
            let filteredStudents = [];
            
            switch(tier) {
                case 'mustaid':
                    filteredStudents = studentsInClass.filter(s => getHusnulKhulukScore(s.id) >= 80);
                    break;
                case 'mutawassit':
                    filteredStudents = studentsInClass.filter(s => {
                        const score = getHusnulKhulukScore(s.id);
                        return score >= 60 && score < 80;
                    });
                    break;
                case 'mujtahid':
                    filteredStudents = studentsInClass.filter(s => getHusnulKhulukScore(s.id) < 60);
                    break;
                default:
                    filteredStudents = studentsInClass;
            }
            
            // Batch DOM updates using requestAnimationFrame
            requestAnimationFrame(() => {
                renderClassStudentList(filteredStudents);
                
                // Update dashboard title to show filter
                const tierLabels = {
                    'mustaid': 'মুস্তাইদ (ممتاز)',
                    'mutawassit': 'মুতাওয়াসসিত (متوسط)',
                    'mujtahid': 'মুজতাহিদ (مجتهد)'
                };
                
                if (tier !== 'all') {
                    const titleHTML = `
                        ${currentClass} - Teachers Corner 
                        <span class="text-lg font-normal text-gray-600">(${tierLabels[tier]} - ${filteredStudents.length} জন)</span>
                        <button onclick="clearStudentFilter()" class="ml-2 text-sm text-blue-600 hover:text-blue-800 underline">
                            সব ছাত্র দেখুন
                        </button>
                    `;
                    const dashboardTitleEl = document.getElementById('class-dashboard-title');
                    if (dashboardTitleEl) {
                        updateElementHTML('class-dashboard-title', titleHTML);
                    }
                }
            });
        }
        
        function clearStudentFilter() {
            const studentsInClass = allStudents.filter(s => s.class === currentClass);
            
            requestAnimationFrame(() => {
                renderClassStudentList(studentsInClass);
                const dashboardTitleEl = document.getElementById('class-dashboard-title');
                if (dashboardTitleEl) {
                    updateElementText('class-dashboard-title', `${currentClass} - Teachers Corner`);
                }
            });
        }

        function renderDashboardAlerts(students) {
            if (!ALERT_CONFIG) {
                console.error('❌ Alert configuration not found');
                return;
            }
            
            const alerts = [];
            
            // Check for students with low scores
            const lowScoreStudents = students.filter(s => {
                const score = getHusnulKhulukScore(s.id);
                return score < ALERT_CONFIG.LOW_SCORE_THRESHOLD;
            });
            if (lowScoreStudents.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-user-times',
                    title: 'নিম্ন হুসনুল খুলুক স্কোর',
                    message: `${lowScoreStudents.length} জন ছাত্রের স্কোর ${ALERT_CONFIG.LOW_SCORE_THRESHOLD} এর নিচে।`,
                    action: 'স্কোর দেখুন',
                    onClick: () => showScoreManagement()
                });
            }
            
            // Check for students with no progress based on actual progress data
            const classProgress = allEducationProgress.filter(p => p.class_name === currentClass);
            const studentsWithNoProgress = students.filter(s => {
                // Check if student has any progress records in the database
                const hasProgress = classProgress.some(p => {
                    return p.completed_pages > 0 || (p.notes && p.notes.trim() !== '');
                });
                return !hasProgress;
            });
            
            if (studentsWithNoProgress.length > 0) {
                alerts.push({
                    type: 'info',
                    icon: 'fas fa-book',
                    title: 'শিক্ষার অগ্রগতি প্রয়োজন',
                    message: `${studentsWithNoProgress.length} জন ছাত্রের শিক্ষার অগ্রগতি রেকর্ড করা হয়নি।`,
                    action: 'অগ্রগতি দেখুন',
                    onClick: () => showBookModal()
                });
            }
            
            // Check for students with low attendance
            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = window.attendance && window.attendance[today] ? window.attendance[today] : {};
            const lowAttendanceStudents = students.filter(s => {
                if (!todayAttendance[s.id]) return false;
                return todayAttendance[s.id].status === 'absent';
            });
            
            if (lowAttendanceStudents.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-calendar-times',
                    title: 'আজ অনুপস্থিত ছাত্র',
                    message: `${lowAttendanceStudents.length} জন ছাত্র আজ অনুপস্থিত।`,
                    action: 'উপস্থিতি দেখুন',
                    onClick: () => showAttendanceModal()
                });
            }
            
            // Check for students with critical scores
            const criticalScoreStudents = students.filter(s => {
                const currentScore = getHusnulKhulukScore(s.id);
                return currentScore < ALERT_CONFIG.CRITICAL_SCORE_THRESHOLD;
            });
            
            if (criticalScoreStudents.length > 0) {
                alerts.push({
                    type: 'danger',
                    icon: 'fas fa-arrow-down',
                    title: 'স্কোর হ্রাসের ঝুঁকি',
                    message: `${criticalScoreStudents.length} জন ছাত্রের স্কোর খুবই কম।`,
                    action: 'স্কোর দেখুন',
                    onClick: () => showScoreManagement()
                });
            }
            
            // Check for important logs that need follow-up
            const importantLogs = [];
            students.forEach(s => {
                const studentLogs = teachersLogbook[currentClass]?.student_logs[s.id] || [];
                const important = studentLogs.filter(log => log.needsFollowup);
                importantLogs.push(...important);
            });
            if (importantLogs.length > 0) {
                alerts.push({
                    type: 'danger',
                    icon: 'fas fa-exclamation-circle',
                    title: 'অনুসরণ প্রয়োজন',
                    message: `${importantLogs.length} টি গুরুত্বপূর্ণ নোট অনুসরণের অপেক্ষায়।`,
                    action: 'নোট দেখুন',
                    onClick: () => showTeachersLogbook()
                });
            }
            
            // Check for class performance trends
            const averageScore = students.reduce((sum, s) => sum + getHusnulKhulukScore(s.id), 0) / students.length;
            if (averageScore < ALERT_CONFIG.LOW_CLASS_AVERAGE_THRESHOLD) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-chart-line',
                    title: 'শ্রেণীর গড় স্কোর কম',
                    message: `শ্রেণীর গড় স্কোর ${Math.round(averageScore)}। উন্নতির প্রয়োজন।`,
                    action: 'বিশ্লেষণ দেখুন',
                    onClick: () => showClassAnalysis()
                });
            }
            
            const alertsContent = document.getElementById('alerts-content');
            if (!alertsContent) {
                console.error('❌ alerts-content element not found');
                return;
            }
            
            if (alerts.length === 0) {
                alertsContent.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">কোনো সতর্কতা নেই। সবকিছু ঠিক আছে! 🎉</p>';
            } else {
                alertsContent.innerHTML = alerts.map(alert => {
                    const config = ALERT_CONFIG.ALERT_TYPES[alert.type];
                    return `
                        <div class="flex items-center justify-between p-3 rounded-lg ${config.bg} ${config.border}">
                            <div class="flex items-center gap-3">
                                <i class="${alert.icon} ${config.icon}"></i>
                                <div>
                                    <div class="font-semibold text-sm ${config.text}">${alert.title}</div>
                                    <div class="text-xs ${config.text.replace('800', '600')}">${alert.message}</div>
                                </div>
                            </div>
                            <button onclick="${alert.onClick ? alert.onClick.toString().replace('function () {', '').replace('}', '') : 'void(0)'}" class="text-xs px-3 py-1 rounded ${config.bg.replace('50', '100')} ${config.text.replace('800', '700')} hover:${config.bg.replace('50', '200')}">${alert.action}</button>
                        </div>
                    `;
                }).join('');
            }
        }

        function renderClassStudentList(students) {
            const listEl = document.getElementById('class-student-list');
            if (!listEl) {
                console.error('❌ class-student-list element not found');
                return;
            }
            
            if (students.length === 0) {
                listEl.innerHTML = `<tr><td colspan="3" class="text-center p-4">এই শ্রেণীতে কোন ছাত্র নেই।</td></tr>`;
                return;
            }
            listEl.innerHTML = students.map(s => {
                const score = getHusnulKhulukScore(s.id);
                let scoreClass = 'score-attention';
                if (score >= 80) scoreClass = 'score-good';
                else if (score >= 60) scoreClass = 'score-average';
                return `<tr class="border-b hover:bg-gray-50"><td class="px-4 py-2 text-center"><span onclick="editHusnulKhuluk('${s.id}', ${score})" class="score-badge ${scoreClass}" title="স্কোর পরিবর্তন করুন">${score}</span></td><td class="px-4 py-2 font-medium">${s.rollNumber}</td><td onclick="showStudentDetail('${s.id}', 'teachers-corner')" class="px-4 py-2 text-blue-600 hover:underline cursor-pointer">${s.name}</td></tr>`;
            }).join('');
        }
        
        function renderClassEducationProgress(className) {
            const progressEl = document.getElementById('class-education-progress');
            if (!progressEl) {
                console.error('❌ class-education-progress element not found');
                return;
            }
            
            console.log(`🎨 Rendering education progress for class: ${className}`);
            console.log(`📊 Current allEducationProgress:`, allEducationProgress);
            
            if (!allEducationProgress || allEducationProgress.length === 0) {
                console.log(`⚠️ No education progress data available for class: ${className}`);
                progressEl.innerHTML = `<p class="text-sm text-gray-500">এই শ্রেণীর জন্য কোন বই যুক্ত করা হয়নি।</p>`;
                // Still render the progress summary even when there are no books
                console.log(`🔍 renderClassEducationProgress - No books, but still calling renderProgressSummary for class: ${className}`);
                const targetClassName = currentClass || className;
                console.log(`🔍 renderClassEducationProgress - Final targetClassName for no books case: ${targetClassName}`);
                renderProgressSummary(targetClassName);
                return;
            }
            
            // Filter progress data by the specific class to ensure we only show data for this class
            const classProgress = allEducationProgress.filter(p => p.class_name === className);
            
            console.log(`🔍 renderClassEducationProgress - Filtering for class: ${className}`);
            console.log(`🔍 renderClassEducationProgress - allEducationProgress length: ${allEducationProgress.length}`);
            console.log(`🔍 renderClassEducationProgress - allEducationProgress class names:`, allEducationProgress.map(p => p.class_name));
            console.log(`🔍 renderClassEducationProgress - Filtered classProgress length: ${classProgress.length}`);
            
            console.log(`📚 Found ${classProgress.length} books/progress items for class: ${className}`);
            
            if (classProgress.length === 0) {
                progressEl.innerHTML = `<p class="text-sm text-gray-500">এই শ্রেণীর জন্য কোন বই যুক্ত করা হয়নি।</p>`;
                // Still render the progress summary even when there are no books for this class
                console.log(`🔍 renderClassEducationProgress - No books for class ${className}, but still calling renderProgressSummary`);
                const targetClassName = currentClass || className;
                console.log(`🔍 renderClassEducationProgress - Final targetClassName for filtered no books case: ${targetClassName}`);
                renderProgressSummary(targetClassName);
                return;
            }
            
            progressEl.innerHTML = classProgress.map(p => {
                // Use real data structure from your database
                const completedPages = p.completed_pages || 0;
                const totalPages = p.total_pages || 0;
                const percentage = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;
                const remaining = totalPages - completedPages;
                
                // Get last update info
                const lastUpdate = p.progressHistory && p.progressHistory.length > 0 ? 
                    p.progressHistory[p.progressHistory.length - 1] : null;
                
                return `
                    <div class="mb-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div class="flex justify-between items-start mb-2">
                            <span onclick="showBookModal('${p.id}')" class="text-sm font-medium text-gray-700 hover:text-blue-500 cursor-pointer" title="বই সম্পাদনা করুন">
                                ${p.book_name}
                            </span>
                            <span class="text-xs text-gray-500">${completedPages}/${totalPages} পৃষ্ঠা</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div class="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                        </div>
                        <div class="flex justify-between items-center text-xs text-gray-600">
                            <span>অগ্রগতি: ${percentage}% (${remaining} পৃষ্ঠা বাকি)</span>
                            ${lastUpdate ? `
                                <span class="text-gray-500">
                                    <i class="fas fa-clock mr-1"></i>
                                    ${new Date(lastUpdate.date).toLocaleDateString('bn-BD')}
                                </span>
                            ` : ''}
                        </div>
                        ${p.notes ? `
                            <div class="mt-2 p-2 bg-white rounded border-l-2 border-blue-300">
                                <div class="text-xs text-gray-600 italic">
                                    <i class="fas fa-sticky-note mr-1"></i>${p.notes}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
            
            // Also render the progress summary
            console.log(`🔍 renderClassEducationProgress - Calling renderProgressSummary with className: ${className}`);
            console.log(`🔍 renderClassEducationProgress - Current currentClass: ${currentClass}`);
            console.log(`🔍 renderClassEducationProgress - Ensuring className matches currentClass`);
            
            // Ensure we're using the current class name
            const targetClassName = currentClass || className;
            console.log(`🔍 renderClassEducationProgress - Final targetClassName: ${targetClassName}`);
            renderProgressSummary(targetClassName);
                }
        
        function renderProgressSummary(className) {
            console.log(`🚀 renderProgressSummary called with className: ${className}`);
            console.log(`🔍 Current currentClass: ${currentClass}`);
            
            const summaryEl = document.getElementById('progress-summary');
            if (!summaryEl) {
                console.error('❌ progress-summary element not found');
                return;
            }
            
            // Clear any previous content first to ensure fresh rendering
            console.log(`🧹 Clearing previous progress summary content for class: ${className}`);
            summaryEl.innerHTML = '';
            
            // Validate that we're working with the correct class
            if (currentClass && currentClass !== className) {
                console.warn(`⚠️ Class mismatch: currentClass (${currentClass}) !== className (${className})`);
            }
            
            // Filter progress data by the specific class
            const classProgress = allEducationProgress.filter(p => p.class_name === className);
            
            // Debug: Log the filtering process
            console.log(`🔍 Filtering allEducationProgress (${allEducationProgress.length} items) for class: ${className}`);
            console.log(`🔍 allEducationProgress class names:`, allEducationProgress.map(p => p.class_name));
            console.log(`🔍 Filtered classProgress (${classProgress.length} items):`, classProgress);
            
            console.log(`📊 Rendering progress summary for class: ${className}`);
            console.log(`📚 Class progress data for ${className}:`, classProgress);
            
            if (classProgress.length === 0) {
                console.log(`⚠️ No progress data found for class: ${className} - showing empty state`);
                // Clear the progress summary completely and show empty state
                summaryEl.innerHTML = `
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 col-span-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-gray-600">0%</div>
                                <div class="text-sm text-gray-700">সামগ্রিক অগ্রগতি</div>
                            </div>
                            <div class="text-gray-500 text-3xl">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="text-xs text-gray-600 mt-2">
                            এই শ্রেণীর জন্য কোনো অগ্রগতি তথ্য নেই
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 col-span-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-gray-600">0</div>
                                <div class="text-sm text-gray-700">মোট বই</div>
                            </div>
                            <div class="text-gray-500 text-3xl">
                                <i class="fas fa-book"></i>
                            </div>
                        </div>
                        <div class="text-xs text-gray-600 mt-2">
                            কোনো বই যুক্ত করা হয়নি
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400 col-span-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-2xl font-bold text-gray-600">0</div>
                                <div class="text-sm text-gray-700">সাম্প্রতিক আপডেট</div>
                            </div>
                            <div class="text-gray-500 text-3xl">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                        <div class="text-xs text-gray-600 mt-2">
                            কোনো আপডেট নেই
                        </div>
                    </div>
                `;
                return;
            }
            
            // Calculate summary statistics
            const totalBooks = classProgress.length;
            const totalPages = classProgress.reduce((sum, p) => sum + (p.total_pages || 0), 0);
            const completedPages = classProgress.reduce((sum, p) => sum + (p.completed_pages || 0), 0);
            const overallPercentage = totalPages > 0 ? Math.round((completedPages / totalPages) * 100) : 0;
            
            // Count books with recent updates (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentUpdates = classProgress.filter(p => {
                if (!p.progressHistory || p.progressHistory.length === 0) return false;
                const lastUpdate = new Date(p.progressHistory[p.progressHistory.length - 1].date);
                return lastUpdate >= sevenDaysAgo;
            }).length;
            
            // Count books with notes
            const booksWithNotes = classProgress.filter(p => p.notes && p.notes.trim()).length;
            
            summaryEl.innerHTML = `
                <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-blue-600">${overallPercentage}%</div>
                            <div class="text-sm text-blue-700">সামগ্রিক অগ্রগতি</div>
                        </div>
                        <div class="text-blue-500 text-3xl">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="text-xs text-blue-600 mt-2">
                        ${completedPages}/${totalPages} পৃষ্ঠা সম্পন্ন
                    </div>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-green-600">${totalBooks}</div>
                            <div class="text-sm text-green-700">মোট বই</div>
                        </div>
                        <div class="text-green-500 text-3xl">
                            <i class="fas fa-book"></i>
                        </div>
                    </div>
                    <div class="text-xs text-green-600 mt-2">
                        ${booksWithNotes} টি বইতে নোট আছে
                    </div>
                </div>
                
                <div class="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-2xl font-bold text-purple-600">${recentUpdates}</div>
                            <div class="text-sm text-purple-700">সাম্প্রতিক আপডেট</div>
                        </div>
                        <div class="text-purple-500 text-3xl">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                    <div class="text-xs text-purple-600 mt-2">
                        গত ৭ দিনে আপডেট
                    </div>
                </div>
            `;
        }

        function renderTeachersLogbook() {
            const displayEl = document.getElementById('logbook-display');
            if (!displayEl) {
                console.error('❌ logbook-display element not found');
                return;
            }
            
            console.log('🔍 Rendering teacher logbook for class:', currentClass);
            console.log('🔍 Current log tab:', currentLogTab);
            console.log('🔍 Teachers logbook data:', teachersLogbook[currentClass]);
            
            if (!teachersLogbook[currentClass]) teachersLogbook[currentClass] = { class_logs: [], student_logs: {} };
            
            // Get logs based on current tab
            let logsToShow = [];
            let logTitle = '';
            
            if (currentLogTab === 'class') {
                logsToShow = teachersLogbook[currentClass].class_logs || [];
                logTitle = 'শ্রেণী লগ';
                console.log('📝 Showing class logs:', logsToShow.length);
            } else {
                // For student logs, get all student logs and flatten them
                logsToShow = [];
                Object.values(teachersLogbook[currentClass].student_logs || {}).forEach(studentLogs => {
                    logsToShow.push(...studentLogs);
                });
                logTitle = 'ছাত্র লগ';
                console.log('📝 Showing student logs:', logsToShow.length);
            }
            
            logsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (logsToShow.length === 0) {
                displayEl.innerHTML = `
                    <div class="text-center text-sm text-gray-500 p-4">
                        <i class="fas fa-info-circle text-2xl mb-2"></i>
                        <p>কোনো ${logTitle} পাওয়া যায়নি।</p>
                        <p class="text-xs mt-1">নতুন নোট যোগ করতে উপরের "নতুন নোট" বোতামে ক্লিক করুন।</p>
                    </div>
                `;
                return;
            }
            
            // Group student logs by student name for better organization
            if (currentLogTab === 'student') {
                const studentLogsGrouped = {};
                logsToShow.forEach(log => {
                    const student = allStudents.find(s => s.id === log.studentId);
                    const studentName = student ? student.name : 'Unknown Student';
                    if (!studentLogsGrouped[studentName]) {
                        studentLogsGrouped[studentName] = [];
                    }
                    studentLogsGrouped[studentName].push(log);
                });
                
                // Render grouped student logs
                displayEl.innerHTML = Object.entries(studentLogsGrouped).map(([studentName, studentLogs]) => `
                    <div class="mb-4 border-l-4 border-blue-500 pl-4">
                        <h4 class="font-semibold text-blue-700 mb-2">${studentName}</h4>
                        <div class="space-y-2">
                            ${studentLogs.map(log => renderLogEntry(log, true)).join('')}
                        </div>
                    </div>
                `).join('');
            } else {
                // Render class logs normally
                displayEl.innerHTML = logsToShow.map(log => renderLogEntry(log, false)).join('');
            }
        }
        
        function renderLogEntry(log, isStudentLog) {
            console.log('🔍 Rendering log entry:', log);
            console.log('🔍 Is student log:', isStudentLog);
            
            const student = log.studentId ? allStudents.find(s => s.id === log.studentId) : null;
            console.log('🔍 Found student:', student);
            
            const priorityFlags = [];
            if (log.isImportant) priorityFlags.push('<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">গুরুত্বপূর্ণ</span>');
            if (log.needsFollowup) priorityFlags.push('<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">অনুসরণ প্রয়োজন</span>');
            
            const logTypeLabel = isStudentLog ? `ছাত্র লগ` : `শ্রেণী লগ`;
            const studentInfo = student ? ` (${student.name})` : '';
            
            return `
                <div class="log-entry bg-gray-50 p-3 rounded-md relative ${log.isImportant ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="text-xs text-gray-500 mb-1">
                                <span><strong>${logTypeLabel}${studentInfo}</strong></span> - <span>${new Date(log.date).toLocaleDateString('bn-BD')}</span>
                                ${priorityFlags.length > 0 ? `<div class="mt-1 flex gap-1">${priorityFlags.join('')}</div>` : ''}
                            </div>
                            <p class="text-sm text-gray-800">${log.details}</p>
                        </div>
                        <div class="log-actions flex gap-2 text-gray-500">
                            <button onclick="editLog('${log.id}')" class="hover:text-blue-500" title="সম্পাদনা করুন"><i class="fas fa-edit text-xs"></i></button>
                            <button onclick="deleteLog('${log.id}')" class="hover:text-red-500" title="মুছুন"><i class="fas fa-trash text-xs"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }

        // --- LOGBOOK LOGIC (Same as before) ---
        function switchLogTab(tab) {
            currentLogTab = tab;
            document.querySelectorAll('.logbook-tabs button').forEach(b => b.classList.remove('active'));
            document.querySelector(`.logbook-tabs button[onclick="switchLogTab('${tab}')"]`).classList.add('active');
            renderTeachersLogbook();
        }
        function showAddLogModal() {
            const logId = document.getElementById('log-id');
            const logModalTitle = document.getElementById('log-modal-title');
            const logDetails = document.getElementById('log-details');
            const logType = document.getElementById('log-type');
            const logStudentSelect = document.getElementById('log-student-select');
            const logStudentId = document.getElementById('log-student-id');
            const logImportant = document.getElementById('log-important');
            const logFollowup = document.getElementById('log-followup');
            const logModal = document.getElementById('log-modal');
            
            // Reset form
            if (logId) logId.value = '';
            if (logModalTitle) logModalTitle.innerText = `"${currentClass}" এর জন্য নতুন নোট`;
            if (logDetails) logDetails.value = '';
            if (logType) logType.value = 'শিক্ষামূলক';
            if (logStudentId) logStudentId.value = '';
            if (logImportant) logImportant.checked = false;
            if (logFollowup) logFollowup.checked = false;
            
            // Restore student dropdown for class context
            if (logStudentSelect) {
                const studentSelectContainer = logStudentSelect.parentElement;
                if (studentSelectContainer) {
                    // Restore the original dropdown structure
                    studentSelectContainer.innerHTML = `
                        <label for="log-student-select" class="block text-sm font-medium text-gray-700 mb-1">ছাত্র নির্বাচন (ঐচ্ছিক)</label>
                        <select id="log-student-select" class="w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">সবাই (শ্রেণী লগ)</option>
                        </select>
                        <input type="hidden" id="log-student-id" value="">
                    `;
                    
                    // Re-populate student dropdown
                    const newStudentSelect = document.getElementById('log-student-select');
                    if (newStudentSelect) {
                        // Get students for current class
                        const classStudents = allStudents.filter(student => student.class === currentClass && student.status === 'active');
                        
                        classStudents.forEach(student => {
                            const option = document.createElement('option');
                            option.value = student.id;
                            option.textContent = `${student.name} (${student.rollNumber})`;
                            newStudentSelect.appendChild(option);
                        });
                    }
                }
            }
            
            if (logModal) logModal.style.display = 'flex';
        }
        function closeLogModal() { 
            const logModal = document.getElementById('log-modal');
            if (logModal) logModal.style.display = 'none';
            
            // Restore original form structure for next use
            const logStudentSelect = document.getElementById('log-student-select');
            if (logStudentSelect) {
                const studentSelectContainer = logStudentSelect.parentElement;
                if (studentSelectContainer) {
                    // Restore the original dropdown structure
                    studentSelectContainer.innerHTML = `
                        <label for="log-student-select" class="block text-sm font-medium text-gray-700 mb-1">ছাত্র নির্বাচন (ঐচ্ছিক)</label>
                        <select id="log-student-select" class="w-full border-gray-300 rounded-md shadow-sm">
                            <option value="">সবাই (শ্রেণী লগ)</option>
                        </select>
                        <input type="hidden" id="log-student-id" value="">
                    `;
                }
            }
            
            // If we were adding a note from student profile, reopen it
            if (currentStudentIdForProfile) {
                // Small delay to ensure modal is fully closed
                setTimeout(() => {
                    showStudentProfile(currentStudentIdForProfile);
                }, 100);
            }
        }
        function saveLogEntry() {
            const logIdElement = document.getElementById('log-id');
            const logStudentSelectElement = document.getElementById('log-student-select');
            const logTypeElement = document.getElementById('log-type');
            const logDetailsElement = document.getElementById('log-details');
            const logImportantElement = document.getElementById('log-important');
            const logFollowupElement = document.getElementById('log-followup');
            const logStudentIdElement = document.getElementById('log-student-id');
            
            if (!logDetailsElement) {
                console.error('❌ Required log elements not found');
                return;
            }
            
            const logId = logIdElement ? logIdElement.value : '';
            const className = currentClass;
            const type = logTypeElement ? logTypeElement.value : '';
            const details = logDetailsElement.value;
            const isImportant = logImportantElement ? logImportantElement.checked : false;
            const needsFollowup = logFollowupElement ? logFollowupElement.checked : false;
            
            // Determine student ID based on context
            let studentId = '';
            if (logStudentIdElement && logStudentIdElement.value) {
                // Student-specific context (from student profile)
                studentId = logStudentIdElement.value;
                console.log('🔍 Student-specific context detected, student ID:', studentId);
            } else if (logStudentSelectElement && logStudentSelectElement.value) {
                // Class context with student selected
                studentId = logStudentSelectElement.value;
                console.log('🔍 Class context with student selected, student ID:', studentId);
            } else {
                console.log('🔍 Class-wide context detected, no student selected');
            }
            
            if (!details.trim()) { alert('অনুগ্রহ করে বিস্তারিত লিখুন।'); return; }
            
            const logData = { 
                class_name: className,
                student_id: studentId || null,
                log_type: type, 
                details, 
                is_important: isImportant, 
                needs_followup: needsFollowup
            };
            
            console.log('📝 Saving log with data:', logData);
            console.log('🔍 Log type will be:', studentId ? 'STUDENT LOG' : 'CLASS LOG');
            
            if (logId) {
                // Update existing log
                updateLogInDatabase(logId, logData);
            } else {
                // Create new log
                createLogInDatabase(logData);
            }
        }
        
        // Create new log in database
        async function createLogInDatabase(logData) {
            try {
                const response = await fetch('/api/teacher-logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(logData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Log created successfully:', result);
                    
                    // Reload logs from database
                    await loadTeacherLogsFromDatabase(currentClass);
                    
                    // Refresh display
                    renderTeachersLogbook();
                    if (currentStudentIdForProfile) {
                        showStudentProfile(currentStudentIdForProfile);
                    }
                    
                    closeLogModal();
                    alert('নোট সফলভাবে সংরক্ষিত হয়েছে।');
            } else {
                    const error = await response.json();
                    console.error('❌ Failed to create log:', error);
                    alert('নোট সংরক্ষণ করতে সমস্যা হয়েছে।');
                }
            } catch (error) {
                console.error('❌ Error creating log:', error);
                alert('সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        }
        
        // Update existing log in database
        async function updateLogInDatabase(logId, logData) {
            try {
                const response = await fetch(`/api/teacher-logs/${logId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(logData)
                });
                
                if (response.ok) {
                    console.log('✅ Log updated successfully');
                    
                    // Reload logs from database
                    await loadTeacherLogsFromDatabase(currentClass);
                    
                    // Refresh display
            renderTeachersLogbook();
                    if (currentStudentIdForProfile) {
                        showStudentProfile(currentStudentIdForProfile);
                    }
                    
                    closeLogModal();
                    alert('নোট সফলভাবে আপডেট হয়েছে।');
            } else {
                    const error = await response.json();
                    console.error('❌ Failed to update log:', error);
                    alert('নোট আপডেট করতে সমস্যা হয়েছে।');
                }
            } catch (error) {
                console.error('❌ Error updating log:', error);
                alert('সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        }
        
        // Delete log from database
        async function deleteLogFromDatabase(logId) {
            try {
                const response = await fetch(`/api/teacher-logs/${logId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log('✅ Log deleted successfully');
                    
                    // Reload logs from database
                    await loadTeacherLogsFromDatabase(currentClass);
                    
                    // Refresh display
                    renderTeachersLogbook();
                    if (currentStudentIdForProfile) {
                        showStudentProfile(currentStudentIdForProfile);
                    }
                    
                    alert('নোট সফলভাবে মুছে ফেলা হয়েছে।');
            } else {
                    const error = await response.json();
                    console.error('❌ Failed to delete log:', error);
                    alert('নোট মুছতে সমস্যা হয়েছে।');
                }
            } catch (error) {
                console.error('❌ Error deleting log:', error);
                alert('সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        }

        function editHusnulKhuluk(studentId, currentScore) {
            const scoreStudentId = document.getElementById('score-student-id');
            const newScore = document.getElementById('new-score');
            const scoreChangeReason = document.getElementById('score-change-reason');
            const scoreModal = document.getElementById('score-modal');
            
            if (scoreStudentId) scoreStudentId.value = studentId;
            if (newScore) newScore.value = currentScore;
            if (scoreChangeReason) scoreChangeReason.value = '';
            if (scoreModal) scoreModal.style.display = 'flex';
        }

        function closeScoreModal() { 
            const scoreModal = document.getElementById('score-modal');
            if (scoreModal) scoreModal.style.display = 'none';
        }
        
        // Inactive Students Modal Functions
        function showInactiveStudentsModal() {
            if (!currentClass) return;
            
            const inactiveStudents = getInactiveStudentsForClass(currentClass);
            const modal = document.getElementById('inactive-students-modal');
            const listContainer = document.getElementById('inactive-students-list');
            
            if (inactiveStudents.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center p-8 text-gray-500">
                        <i class="fas fa-info-circle text-4xl mb-4"></i>
                        <p>এই শ্রেণীতে কোনো নিষ্ক্রিয় ছাত্র নেই।</p>
                    </div>
                `;
            } else {
                const studentsList = inactiveStudents.map(student => `
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800">
                                    <span class="clickable-name" onclick="showStudentDetail('${student.id}', 'teachers-corner')" style="cursor: pointer; color: #3498db;">
                                        ${student.name} বিন ${student.fatherName}
                                    </span>
                                </h4>
                                <div class="text-sm text-gray-600 mt-1">
                                    <span class="mr-4">রোল: ${student.rollNumber}</span>
                                    <span class="mr-4">মোবাইল: ${student.mobileNumber}</span>
                                    <span>জেলা: ${student.district}, ${student.upazila}</span>
                                </div>
                                <div class="text-xs text-orange-600 mt-2 font-medium">
                                    <i class="fas fa-exclamation-triangle"></i> নিষ্ক্রিয় অবস্থায়
                                    ${student.inactivationDate ? ` (${student.inactivationDate} থেকে)` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                listContainer.innerHTML = studentsList;
            }
            
            modal.style.display = 'flex';
        }
        
        function closeInactiveStudentsModal() {
            const inactiveStudentsModal = document.getElementById('inactive-students-modal');
            if (inactiveStudentsModal) inactiveStudentsModal.style.display = 'none';
        }

        function saveNewScore() {
            const scoreStudentId = document.getElementById('score-student-id');
            const newScoreElement = document.getElementById('new-score');
            const changeReasonElement = document.getElementById('score-change-reason');
            
            if (!scoreStudentId || !newScoreElement || !changeReasonElement) {
                console.error('❌ Required score change elements not found');
                return;
            }
            
            const studentId = scoreStudentId.value;
            const newScore = newScoreElement.value;
            const changeReason = changeReasonElement.value;
            
            if (newScore !== null && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                // Save score to database
                updateScoreInDatabase(studentId, parseInt(newScore), changeReason);
            } else {
                alert("অনুগ্রহ করে ০ থেকে ১০০ এর মধ্যে একটি নাম্বার দিন।");
            }
        }
        
        // Update score in database
        async function updateScoreInDatabase(studentId, newScore, reason) {
            try {
                const response = await fetch(`/api/student-scores/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        new_score: newScore,
                        reason: reason || 'কোন কারণ উল্লেখ করা হয়নি'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Score updated successfully:', result);
                    
                    // Update local score
                    studentScores[studentId] = newScore;
                    
                    // Reload score history from database
                    await loadScoreHistoryFromDatabase(studentId);
                    
                    // Refresh display
                const activeStudentsInClass = getActiveStudentsForClass(currentClass);
                renderClassStudentList(activeStudentsInClass);
                renderClassOverview(activeStudentsInClass);
                    
                closeScoreModal();
                    alert('স্কোর সফলভাবে আপডেট হয়েছে।');
            } else {
                    const error = await response.json();
                    console.error('❌ Failed to update score:', error);
                    alert('স্কোর আপডেট করতে সমস্যা হয়েছে।');
                }
            } catch (error) {
                console.error('❌ Error updating score:', error);
                alert('সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
            }
        }

        // --- STUDENT PROFILE LOGIC (UNIFIED VIEW) ---
        
        // Function to generate compact print-friendly student detail
        function generateStudentDetailPrint(student, attendanceStats, studentLogs, scoreHistory) {
            const currentDate = new Date().toLocaleDateString('bn-BD');
            const currentTime = new Date().toLocaleTimeString('bn-BD');
            
            const printContent = `
                <!DOCTYPE html>
                <html lang="bn">
                <head>
                    <meta charset="UTF-8">
                    <title>Student Detail - ${student.name}</title>
                    <style>
                        @media print {
                            body { 
                                margin: 0; 
                                padding: 8px; 
                                width: 100%;
                                max-width: none;
                            }
                            .no-print { display: none !important; }
                            .page-break { page-break-before: always; }
                            
                            /* Force grid layout in print */
                            .main-content {
                                display: grid !important;
                                grid-template-columns: repeat(4, 1fr) !important;
                                gap: 6px !important;
                                width: 100% !important;
                            }
                            
                            .info-card {
                                width: auto !important;
                                max-width: none !important;
                                float: none !important;
                                display: block !important;
                            }
                        }
                        
                        .print-button {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            padding: 12px 24px;
                            background: #2c5aa0;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                            z-index: 1000;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif;
                        }
                        
                        .print-button:hover {
                            background: #1e3a5f;
                            transform: translateY(-1px);
                        }
                        
                        body {
                            font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif;
                            line-height: 1.2;
                            color: #2c3e50;
                            background: white;
                            margin: 0;
                            padding: 10px;
                            font-size: 9px;
                        }
                        
                        /* Header Section */
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #2c5aa0;
                            padding-bottom: 5px;
                            margin-bottom: 8px;
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                            padding: 8px;
                            border-radius: 6px;
                        }
                        
                        .school-name {
                            font-size: 18px;
                            font-weight: bold;
                            color: #2c5aa0;
                            margin: 0;
                            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                        }
                        
                        .school-subtitle {
                            font-size: 10px;
                            color: #495057;
                            margin: 2px 0 0 0;
                            font-weight: 500;
                        }
                        
                        .student-title {
                            font-size: 14px;
                            font-weight: bold;
                            text-align: center;
                            color: #2c3e50;
                            margin: 5px 0;
                            padding: 5px;
                            background: #e3f2fd;
                            border-radius: 6px;
                            border: 1px solid #2196f3;
                        }
                        
                        /* Main Content Grid */
                        .main-content {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 6px;
                            margin-bottom: 8px;
                            width: 100%;
                        }
                        
                        /* Fallback for older browsers */
                        @supports not (display: grid) {
                            .main-content {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 6px;
                            }
                            
                            .info-card {
                                flex: 1 1 calc(25% - 6px);
                                min-width: 200px;
                            }
                        }
                        
                        /* Info Cards */
                        .info-card {
                            background: #ffffff;
                            padding: 4px;
                            border-radius: 4px;
                            border: 1px solid #e9ecef;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                            width: 100%;
                            box-sizing: border-box;
                        }
                        
                        .card-header {
                            font-size: 10px;
                            font-weight: bold;
                            color: #2c5aa0;
                            margin: 0 0 2px 0;
                            padding-bottom: 1px;
                            border-bottom: 1px solid #2c5aa0;
                            display: flex;
                            align-items: center;
                            gap: 3px;
                        }
                        
                        .card-header i {
                            font-size: 10px;
                        }
                        
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 1px;
                            padding: 1px 0;
                            border-bottom: 1px solid #f1f3f4;
                        }
                        
                        .info-label {
                            font-weight: 600;
                            color: #495057;
                            min-width: 60px;
                            font-size: 9px;
                        }
                        
                        .info-value {
                            color: #2c3e50;
                            text-align: right;
                            font-weight: 500;
                            font-size: 9px;
                        }
                        
                        /* Statistics Grid */
                        .stats-container {
                            margin-bottom: 8px;
                        }
                        
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 4px;
                            margin-bottom: 8px;
                        }
                        
                        .stat-card {
                            text-align: center;
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                            padding: 6px 4px;
                            border-radius: 6px;
                            border: 1px solid #dee2e6;
                        }
                        
                        .stat-number {
                            font-size: 14px;
                            font-weight: bold;
                            color: #2c5aa0;
                            margin-bottom: 2px;
                        }
                        
                        .stat-label {
                            font-size: 7px;
                            color: #6c757d;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.3px;
                        }
                        
                        /* Detailed Sections */
                        .detail-section {
                            margin-bottom: 15px;
                            page-break-inside: avoid;
                        }
                        
                        .section-header {
                            font-size: 11px;
                            font-weight: bold;
                            color: #2c5aa0;
                            margin: 0 0 6px 0;
                            padding: 6px 10px;
                            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                            border-radius: 6px;
                            border-left: 3px solid #2196f3;
                        }
                        
                        /* Tables */
                        .data-table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 8px;
                            background: white;
                            border-radius: 6px;
                            overflow: hidden;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                        }
                        
                        .data-table th {
                            background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
                            color: white;
                            padding: 6px 4px;
                            text-align: left;
                            font-weight: 600;
                            font-size: 8px;
                        }
                        
                        .data-table td {
                            padding: 4px 4px;
                            border-bottom: 1px solid #e9ecef;
                            vertical-align: top;
                        }
                        
                        .data-table tr:nth-child(even) {
                            background: #f8f9fa;
                        }
                        
                        .data-table tr:hover {
                            background: #e3f2fd;
                        }
                        
                        /* Score Changes */
                        .score-change {
                            font-weight: 600;
                            padding: 2px 4px;
                            border-radius: 3px;
                            font-size: 7px;
                        }
                        
                        .score-increase {
                            background: #d4edda;
                            color: #155724;
                            border: 1px solid #c3e6cb;
                        }
                        
                        .score-decrease {
                            background: #f8d7da;
                            color: #721c24;
                            border: 1px solid #f5c6cb;
                        }
                        
                        /* Log Entries */
                        .log-container {
                            max-height: 120px;
                            overflow-y: auto;
                        }
                        
                        .log-entry {
                            background: #f8f9fa;
                            padding: 6px;
                            margin-bottom: 4px;
                            border-radius: 4px;
                            border-left: 3px solid #17a2b8;
                            font-size: 8px;
                        }
                        
                        .log-header {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 3px;
                            font-size: 7px;
                        }
                        
                        .log-type {
                            font-weight: bold;
                            color: #17a2b8;
                            background: #e3f2fd;
                            padding: 1px 3px;
                            border-radius: 3px;
                        }
                        
                        .log-date {
                            color: #6c757d;
                            font-weight: 500;
                        }
                        
                        .log-details {
                            color: #2c3e50;
                            line-height: 1.2;
                        }
                        
                        /* Book Progress */
                        .book-progress {
                            background: #f8f9fa;
                            padding: 6px;
                            margin-bottom: 4px;
                            border-radius: 4px;
                            border-left: 3px solid #28a745;
                            font-size: 8px;
                        }
                        
                        .book-name {
                            font-weight: bold;
                            color: #28a745;
                            margin-bottom: 3px;
                            font-size: 9px;
                        }
                        
                        .progress-bar {
                            width: 100%;
                            height: 6px;
                            background: #e9ecef;
                            border-radius: 3px;
                            overflow: hidden;
                            margin: 3px 0;
                        }
                        
                        .progress-fill {
                            height: 100%;
                            background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
                            border-radius: 3px;
                            transition: width 0.3s ease;
                        }
                        
                        .progress-info {
                            display: flex;
                            justify-content: space-between;
                            font-size: 7px;
                            color: #6c757d;
                            margin-top: 2px;
                        }
                        
                        .progress-notes {
                            font-size: 7px;
                            color: #495057;
                            margin-top: 3px;
                            font-style: italic;
                            background: #e9ecef;
                            padding: 2px 4px;
                            border-radius: 3px;
                        }
                        
                        /* Footer */
                        .footer {
                            text-align: center;
                            font-size: 8px;
                            color: #6c757d;
                            margin-top: 15px;
                            padding: 10px;
                            border-top: 1px solid #e9ecef;
                            background: #f8f9fa;
                            border-radius: 6px;
                        }
                        
                        .footer p {
                            margin: 2px 0;
                        }
                        
                        /* Responsive Design */
                        @media (max-width: 768px) {
                            .main-content {
                                grid-template-columns: 1fr;
                            }
                            
                            .stats-grid {
                                grid-template-columns: repeat(2, 1fr);
                            }
                        }
                        
                        /* Print Optimizations */
                        @media print {
                            body {
                                margin: 0;
                                padding: 8px;
                                font-size: 9px;
                                line-height: 1.2;
                            }
                            
                            .main-content {
                                display: grid !important;
                                grid-template-columns: repeat(4, 1fr) !important;
                                gap: 6px !important;
                                margin-bottom: 8px !important;
                            }
                            
                            .info-card {
                                display: block !important;
                                break-inside: avoid;
                                box-shadow: none;
                                border: 1px solid #dee2e6 !important;
                                padding: 4px !important;
                                margin: 0 !important;
                                page-break-inside: avoid;
                            }
                            
                            .card-header {
                                font-size: 10px !important;
                                margin: 0 0 2px 0 !important;
                                padding-bottom: 1px !important;
                                border-bottom: 1px solid #2c5aa0 !important;
                            }
                            
                            .info-row {
                                display: flex !important;
                                justify-content: space-between !important;
                                margin-bottom: 1px !important;
                                padding: 1px 0 !important;
                                border-bottom: 1px solid #f1f3f4 !important;
                            }
                            
                            .info-label {
                                font-size: 9px !important;
                                min-width: 60px !important;
                            }
                            
                            .info-value {
                                font-size: 9px !important;
                            }
                            
                            .stat-card {
                                break-inside: avoid;
                                page-break-inside: avoid;
                            }
                            
                            .detail-section {
                                break-inside: avoid;
                                page-break-inside: avoid;
                            }
                            
                            .stats-grid {
                                display: grid !important;
                                grid-template-columns: repeat(4, 1fr) !important;
                                gap: 4px !important;
                            }
                            
                            .header, .student-title, .stats-container, .detail-section, .footer {
                                page-break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <!-- Print Button -->
                    <div class="no-print">
                        <button onclick="window.print()" class="print-button">
                            🖨️ প্রিন্ট করুন
                        </button>
                    </div>
                    
                    <!-- Header -->
                    <div class="header">
                        <h1 class="school-name">মাদানি মক্তব</h1>
                        <p class="school-subtitle">ইসলামিক স্কুল অ্যাটেনডেন্স ম্যানেজমেন্ট সিস্টেম</p>
                        <p class="school-subtitle">Student Detail Report - ছাত্রের বিস্তারিত প্রতিবেদন</p>
                    </div>
                    
                    <!-- Student Title -->
                    <div class="student-title">
                        📚 ${student.name} বিন ${student.fatherName} - ${student.class} শ্রেণী (রোল: ${student.rollNumber || 'N/A'})
                    </div>
                    
                    <!-- Statistics Overview -->
                    <div class="stats-container">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">${attendanceStats.attendanceRate}%</div>
                                <div class="stat-label">উপস্থিতি হার</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${getHusnulKhulukScore(student.id)}</div>
                                <div class="stat-label">হুসনুল খুলুক</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${studentLogs.length}</div>
                                <div class="stat-label">শিক্ষকের নোট</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${attendanceStats.totalBooks || 0}</div>
                                <div class="stat-label">পঠিত বই</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Main Content Grid -->
                    <div class="main-content">
                        <!-- Personal Information -->
                        <div class="info-card">
                            <h3 class="card-header">
                                👤 ব্যক্তিগত তথ্য
                            </h3>
                            <div class="info-row">
                                <span class="info-label">নাম:</span>
                                <span class="info-value">${student.name} বিন ${student.fatherName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">রোল:</span>
                                <span class="info-value">${student.rollNumber || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">শ্রেণী:</span>
                                <span class="info-value">${student.class}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">মোবাইল:</span>
                                <span class="info-value">${student.mobileNumber || student.mobile || 'N/A'}</span>
                            </div>
                        </div>
                        
                        <!-- Contact & Address -->
                        <div class="info-card">
                            <h3 class="card-header">
                                📍 যোগাযোগ ও ঠিকানা
                            </h3>
                            <div class="info-row">
                                <span class="info-label">জেলা:</span>
                                <span class="info-value">${student.district || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">উপজেলা:</span>
                                <span class="info-value">${student.upazila || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">নিবন্ধন:</span>
                                <span class="info-value">${student.registrationDate || 'N/A'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">অবস্থা:</span>
                                <span class="info-value" style="color: ${student.status === 'inactive' ? '#dc3545' : '#28a745'}; font-weight: bold;">
                                    ${student.status === 'inactive' ? '❌ নিষ্ক্রিয়' : '✅ সক্রিয়'}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Attendance Summary -->
                        <div class="info-card">
                            <h3 class="card-header">
                                📊 উপস্থিতি সারসংক্ষেপ
                            </h3>
                            <div class="info-row">
                                <span class="info-label">উপস্থিত:</span>
                                <span class="info-value" style="color: #28a745; font-weight: bold;">${attendanceStats.present} দিন</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">অনুপস্থিত:</span>
                                <span class="info-value" style="color: #dc3545; font-weight: bold;">${attendanceStats.absent} দিন</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">ছুটি:</span>
                                <span class="info-value" style="color: #ffc107; font-weight: bold;">${attendanceStats.leave} দিন</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">হার:</span>
                                <span class="info-value" style="color: #2c5aa0; font-weight: bold;">${attendanceStats.attendanceRate}%</span>
                            </div>
                        </div>
                        
                        <!-- Quick Stats -->
                        <div class="info-card">
                            <h3 class="card-header">
                                ⚡ দ্রুত পরিসংখ্যান
                            </h3>
                            <div class="info-row">
                                <span class="info-label">সর্বোচ্চ:</span>
                                <span class="info-value">${Math.max(...scoreHistory.map(s => s.newScore), getHusnulKhulukScore(student.id))}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">সর্বনিম্ন:</span>
                                <span class="info-value">${Math.min(...scoreHistory.map(s => s.oldScore), getHusnulKhulukScore(student.id))}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">পরিবর্তন:</span>
                                <span class="info-value">${scoreHistory.length} বার</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">নোট:</span>
                                <span class="info-value">${studentLogs.length} টি</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Detailed Sections -->
                    <!-- Score History Section -->
                    <div class="detail-section">
                        <h3 class="section-header">
                            📊 হুসনুল খুলুক স্কোর ইতিহাস
                        </h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>তারিখ</th>
                                    <th>স্কোর পরিবর্তন</th>
                                    <th>কারণ</th>
                                    <th>পরিবর্তনের ধরন</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${scoreHistory.length > 0 ? scoreHistory.map(score => {
                                    const isIncrease = score.newScore > score.oldScore;
                                    const changeType = isIncrease ? 'উন্নতি' : 'অবনতি';
                                    const changeClass = isIncrease ? 'score-increase' : 'score-decrease';
                                    return `
                                        <tr>
                                            <td>${new Date(score.date).toLocaleDateString('bn-BD')}</td>
                                            <td class="${changeClass}">${score.oldScore} → ${score.newScore}</td>
                                            <td>${score.reason || 'কোনো কারণ উল্লেখ নেই'}</td>
                                            <td>${changeType}</td>
                                        </tr>
                                    `;
                                }).join('') : '<tr><td colspan="4" style="text-align: center; color: #6c757d; padding: 20px;">কোনো স্কোর পরিবর্তনের ইতিহাস নেই</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Teacher Logs Section -->
                    <div class="detail-section">
                        <h3 class="section-header">
                            📝 শিক্ষকের নোট ও পর্যবেক্ষণ
                        </h3>
                        <div class="log-container">
                            ${studentLogs.length > 0 ? studentLogs.map(log => `
                                <div class="log-entry">
                                    <div class="log-header">
                                        <span class="log-type">${log.log_type || log.type || 'সাধারণ নোট'}</span>
                                        <span class="log-date">${new Date(log.date).toLocaleDateString('bn-BD')}</span>
                                    </div>
                                    <div class="log-details">${log.details}</div>
                                </div>
                            `).join('') : '<p style="text-align: center; color: #6c757d; padding: 20px; background: #f8f9fa; border-radius: 6px;">এই ছাত্রের জন্য কোনো নোট নেই।</p>'}
                        </div>
                    </div>
                    
                    <!-- Education Progress Section -->
                    <div class="detail-section">
                        <h3 class="section-header">
                            📚 শিক্ষার অগ্রগতি ও বই পড়ার অবস্থা
                        </h3>
                        ${attendanceStats.booksProgress && attendanceStats.booksProgress.length > 0 ? 
                            attendanceStats.booksProgress.map(book => {
                                const progressPercentage = book.total_pages > 0 ? Math.round((book.completed_pages || 0) / book.total_pages * 100) : 0;
                                return `
                                    <div class="book-progress">
                                        <div class="book-name">📖 ${book.book_name}</div>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                                        </div>
                                        <div class="progress-info">
                                            <span>অগ্রগতি: ${book.completed_pages || 0}/${book.total_pages || 0} পৃষ্ঠা</span>
                                            <span>${progressPercentage}% সম্পন্ন</span>
                                        </div>
                                        ${book.notes ? `<div class="progress-notes">💭 ${book.notes}</div>` : ''}
                                    </div>
                                `;
                            }).join('') : 
                            '<p style="text-align: center; color: #6c757d; padding: 20px; background: #f8f9fa; border-radius: 6px;">কোনো বই অগ্রগতি নেই।</p>'
                        }
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>এই রিপোর্টটি মাদানি মক্তব সিস্টেম থেকে তৈরি করা হয়েছে</strong></p>
                        <p>📅 তারিখ: ${currentDate} | 🕐 সময়: ${currentTime}</p>
                        <p>👨‍💼 প্রতিবেদন তৈরি করেছেন: সিস্টেম অ্যাডমিন</p>
                        <p>📱 সিস্টেম: ইসলামিক স্কুল অ্যাটেনডেন্স ম্যানেজমেন্ট সিস্টেম</p>
                    </div>
                </body>
                </html>
            `;
            
            return printContent;
        }
        
        // Function to print student detail
        async function printStudentDetail(studentId) {
            const student = allStudents.find(s => s.id === studentId);
            if (!student) return;
            
            // Load score history from database first
            await loadScoreHistoryFromDatabase(studentId);
            
            // Get student data
            const score = getHusnulKhulukScore(studentId);
            const studentLogs = (teachersLogbook[student.class]?.student_logs[studentId] || []).sort((a, b) => new Date(b.date) - new Date(a.date));
            const scoreHistory = scoreChangeHistory[studentId] || [];
            
            // Calculate attendance statistics
            calculateAttendanceStats(student).then(attendanceStats => {
                const printContent = generateStudentDetailPrint(student, attendanceStats, studentLogs, scoreHistory);
                
                // Create new window for printing
                const printWindow = window.open('', '_blank');
                printWindow.document.write(printContent);
                printWindow.document.close();
                
                // Don't auto-print, let user decide when to print
                // User can use the print button in the generated content
            });
        }
        
        async function showStudentProfile(studentId) {
            currentStudentIdForProfile = studentId;
            const student = allStudents.find(s => s.id === studentId);
            if (!student) return;
            
            // Ensure we have the latest data loaded for this student's class
            await loadStudentScoresFromDatabase(student.class);
            await loadTeacherLogsFromDatabase(student.class);
            await loadScoreHistoryFromDatabase(studentId);
            
            const profileTitle = document.getElementById('student-profile-title');
            if (profileTitle) profileTitle.innerText = `${student.name} - বিস্তারিত প্রোফাইল`;
            const score = getHusnulKhulukScore(studentId);
            const studentLogs = (teachersLogbook[student.class]?.student_logs[studentId] || []).sort((a, b) => new Date(b.date) - new Date(a.date));
            const scoreHistory = scoreChangeHistory[studentId] || [];
            
            // Calculate attendance statistics (real data)
            const attendanceStats = await calculateAttendanceStats(student);
            
            const profileContent = `<div class="space-y-6">
                <!-- Profile Tabs -->
                <div class="border-b border-gray-200">
                    <div class="flex justify-between items-center">
                    <nav class="flex space-x-8">
                        <button onclick="switchProfileTab('overview')" class="profile-tab active py-2 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">এক নজরে</button>
                        <button onclick="switchProfileTab('personal')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">ব্যক্তিগত তথ্য</button>
                        <button onclick="switchProfileTab('attendance')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">উপস্থিতি</button>
                        <button onclick="switchProfileTab('logs')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">শিক্ষকের নোট</button>
                        <button onclick="switchProfileTab('score-history')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">স্কোর ইতিহাস</button>
                        <button onclick="switchProfileTab('tarbiyah-goals')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">তরবিয়াহ লক্ষ্য</button>
                    </nav>
                    </div>
                </div>
                
                <!-- Overview Tab -->
                <div id="profile-overview" class="profile-tab-content">
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <div class="mb-3">
                            <h4 class="font-semibold text-gray-700">এক নজরে</h4>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div><div class="text-lg font-bold text-green-600">${attendanceStats.attendanceRate}%</div><div class="text-xs text-gray-500">উপস্থিতি</div></div>
                            <div><div class="text-lg font-bold text-blue-600">${score}</div><div class="text-xs text-gray-500">হুসনুল খুলুক</div></div>
                            <div><div class="text-lg font-bold text-purple-600">${studentLogs.length}</div><div class="text-xs text-gray-500">নোট সংখ্যা</div></div>
                            <div><div class="text-sm font-bold text-gray-700">${student.class}</div><div class="text-xs text-gray-500">শ্রেণী</div></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">মৌলিক তথ্য</h4>
                            <div class="space-y-2 text-sm text-gray-600">
                                <p><strong>নাম:</strong> ${student.name} বিন ${student.fatherName}</p>
                                <p><strong>রোল:</strong> ${student.rollNumber || 'N/A'}</p>
                                <p><strong>শ্রেণী:</strong> ${student.class}</p>
                                <p><strong>মোবাইল:</strong> ${student.mobileNumber || student.mobile || 'N/A'}</p>
                            <p><strong>ঠিকানা:</strong> ${student.upazila}, ${student.district}</p>
                                <p><strong>নিবন্ধনের তারিখ:</strong> ${student.registrationDate || 'N/A'}</p>
                                <p><strong>অবস্থা:</strong> 
                                    <span class="${student.status === 'inactive' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}">
                                        ${student.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
                                        ${student.status === 'inactive' && student.inactivationDate ? ` (${student.inactivationDate} থেকে)` : ''}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-2">উপস্থিতি সারসংক্ষেপ</h4>
                            <div class="space-y-2 text-sm text-gray-600">
                                <p><strong>মোট উপস্থিত:</strong> ${attendanceStats.present} দিন</p>
                                <p><strong>মোট অনুপস্থিত:</strong> ${attendanceStats.absent} দিন</p>
                                <p><strong>ছুটির দিন:</strong> ${attendanceStats.leave} দিন</p>
                                <p><strong>উপস্থিতির হার:</strong> ${attendanceStats.attendanceRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Personal Information Tab -->
                <div id="profile-personal" class="profile-tab-content hidden">
                    <div class="space-y-6">
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-3">ব্যক্তিগত তথ্য</h4>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p><strong>পূর্ণ নাম:</strong> ${student.name} বিন ${student.fatherName}</p>
                                        <p><strong>রোল নম্বর:</strong> ${student.rollNumber || 'N/A'}</p>
                                        <p><strong>শ্রেণী:</strong> ${student.class}</p>
                                        <p><strong>নিবন্ধনের তারিখ:</strong> ${student.registrationDate || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p><strong>মোবাইল নম্বর:</strong> ${student.mobileNumber || student.mobile || 'N/A'}</p>
                                        <p><strong>জেলা:</strong> ${student.district}</p>
                                        <p><strong>উপজেলা:</strong> ${student.upazila}</p>
                                        <p><strong>অবস্থা:</strong> 
                                            <span class="${student.status === 'inactive' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}">
                                                ${student.status === 'inactive' ? 'নিষ্ক্রিয়' : 'সক্রিয়'}
                                                ${student.status === 'inactive' && student.inactivationDate ? ` (${student.inactivationDate} থেকে)` : ''}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Attendance Tab -->
                <div id="profile-attendance" class="profile-tab-content hidden">
                    <div class="space-y-6">
                        <div>
                            <h4 class="font-semibold text-gray-700 mb-3">উপস্থিতি তথ্য</h4>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                                    <div class="bg-green-100 p-3 rounded-lg">
                                        <div class="text-2xl font-bold text-green-600">${attendanceStats.present}</div>
                                        <div class="text-sm text-gray-600">উপস্থিত</div>
                                    </div>
                                    <div class="bg-red-100 p-3 rounded-lg">
                                        <div class="text-2xl font-bold text-red-600">${attendanceStats.absent}</div>
                                        <div class="text-sm text-gray-600">অনুপস্থিত</div>
                                    </div>
                                    <div class="bg-yellow-100 p-3 rounded-lg">
                                        <div class="text-2xl font-bold text-yellow-600">${attendanceStats.leave}</div>
                                        <div class="text-sm text-gray-600">ছুটি</div>
                                    </div>
                                    <div class="bg-blue-100 p-3 rounded-lg">
                                        <div class="text-2xl font-bold text-blue-600">${attendanceStats.attendanceRate}%</div>
                                        <div class="text-sm text-gray-600">উপস্থিতির হার</div>
                                    </div>
                                </div>
                                <div class="text-sm text-gray-600">
                                    <p><strong>মোট স্কুল দিন:</strong> ${attendanceStats.totalSchoolDays}</p>
                                    <p><strong>শেষ আপডেট:</strong> আজকের তারিখ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Logs Tab -->
                <div id="profile-logs" class="profile-tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-700">শিক্ষকের নোট (${studentLogs.length})</h4>
                        <button onclick="showAddStudentLogModal('${student.id}')" class="btn-success text-white px-3 py-1 text-sm rounded-md flex items-center gap-1">
                            <i class="fas fa-plus"></i> নতুন নোট
                        </button>
                    </div>
                    <div class="space-y-3">
                        ${studentLogs.length > 0 ? studentLogs.map(log => {
                            const priorityFlags = [];
                            if (log.isImportant) priorityFlags.push('<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">গুরুত্বপূর্ণ</span>');
                            if (log.needsFollowup) priorityFlags.push('<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">অনুসরণ প্রয়োজন</span>');
                            
                            return `<div class="log-entry bg-gray-50 p-3 rounded-md relative ${log.isImportant ? 'border-l-4 border-red-500' : ''}">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <div class="text-xs text-gray-500 mb-1">
                                            <span><strong>${log.type}</strong></span> - <span>${new Date(log.date).toLocaleDateString('bn-BD')}</span>
                                            ${priorityFlags.length > 0 ? `<div class="mt-1 flex gap-1">${priorityFlags.join('')}</div>` : ''}
                                        </div>
                                        <p class="text-sm text-gray-800">${log.details}</p>
                                    </div>
                                    <div class="log-actions flex gap-2 text-gray-500">
                                        <button onclick="editLog('${log.id}')" class="hover:text-blue-500"><i class="fas fa-edit text-xs"></i></button>
                                        <button onclick="deleteLog('${log.id}')" class="hover:text-red-500"><i class="fas fa-trash text-xs"></i></button>
                                    </div>
                                </div>
                            </div>`;
                        }).join('') : '<p class="text-sm text-gray-500 text-center p-4">এই ছাত্রের জন্য কোনো নোট নেই।</p>'}
                    </div>
                </div>
                
                <!-- Score History Tab -->
                <div id="profile-score-history" class="profile-tab-content hidden">
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-700">হুসনুল খুলুক স্কোর ইতিহাস</h4>
                    </div>
                    <div class="space-y-3">
                        ${scoreHistory.length > 0 ? scoreHistory.map(change => `
                            <div class="bg-gray-50 p-3 rounded-md">
                                <div class="flex justify-between items-center mb-2">
                                    <div class="text-sm font-medium text-gray-700">
                                        ${change.oldScore} → ${change.newScore}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        ${new Date(change.date).toLocaleDateString('bn-BD')}
                                    </div>
                                </div>
                                <div class="text-xs text-gray-600">
                                    <strong>কারণ:</strong> ${change.reason}
                                </div>
                            </div>
                        `).reverse().join('') : '<p class="text-sm text-gray-500 text-center p-4">কোনো স্কোর পরিবর্তনের ইতিহাস নেই।</p>'}
                    </div>
                </div>
                
                <!-- Tarbiyah Goals Tab -->
                <div id="profile-tarbiyah-goals" class="profile-tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-700">তরবিয়াহ লক্ষ্য</h4>
                        <button onclick="saveTarbiyahGoals('${student.id}')" class="btn-success text-white px-3 py-1 text-sm rounded-md">
                            <i class="fas fa-save"></i> সংরক্ষণ
                        </button>
                    </div>
                    <div class="space-y-3">
                        ${renderTarbiyahGoalsChecklist(studentId)}
                    </div>
                </div>
            </div>`;
            const studentProfileContent = document.getElementById('student-profile-content');
            if (studentProfileContent) {
                studentProfileContent.innerHTML = profileContent;
            }
            const studentProfileModal = document.getElementById('student-profile-modal');
            if (studentProfileModal) studentProfileModal.style.display = 'flex';
        }
        function closeStudentProfileModal() { 
            const studentProfileModal = document.getElementById('student-profile-modal');
            if (studentProfileModal) studentProfileModal.style.display = 'none';
        }
        
        function switchProfileTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.profile-tab').forEach(tab => {
                tab.classList.remove('active', 'border-blue-500', 'text-blue-600');
                tab.classList.add('border-transparent', 'text-gray-500');
            });
            
            // Show selected tab content
            const targetContent = document.getElementById(`profile-${tabName}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
            
            // Add active class to selected tab
            const activeTab = document.querySelector(`[onclick="switchProfileTab('${tabName}')"]`);
            if (activeTab) {
            activeTab.classList.add('active', 'border-blue-500', 'text-blue-600');
            activeTab.classList.remove('border-transparent', 'text-gray-500');
            }
        }
        function showAddStudentLogModal(studentId) {
            const student = allStudents.find(s => s.id === studentId);
            if (!student) return;
            
            // Close student profile modal first to avoid conflicts
            closeStudentProfileModal();
            
            const logId = document.getElementById('log-id');
            const logModalTitle = document.getElementById('log-modal-title');
            const logDetails = document.getElementById('log-details');
            const logType = document.getElementById('log-type');
            const logStudentSelect = document.getElementById('log-student-select');
            const logStudentId = document.getElementById('log-student-id');
            const logImportant = document.getElementById('log-important');
            const logFollowup = document.getElementById('log-followup');
            const logModal = document.getElementById('log-modal');
            
            // Reset form
            if (logId) logId.value = '';
            if (logDetails) logDetails.value = '';
            if (logType) logType.value = 'শিক্ষামূলক';
            if (logImportant) logImportant.checked = false;
            if (logFollowup) logFollowup.checked = false;
            
            // Set student-specific context
            if (logModalTitle) logModalTitle.innerText = `"${student.name}" এর জন্য নতুন নোট`;
            if (logStudentId) logStudentId.value = studentId;
            
            // Hide student dropdown and show student info instead
            if (logStudentSelect) {
                const studentSelectContainer = logStudentSelect.parentElement;
                if (studentSelectContainer) {
                    // Replace dropdown with student info display
                    studentSelectContainer.innerHTML = `
                        <label class="block text-sm font-medium text-gray-700 mb-1">ছাত্র নির্বাচন</label>
                        <div class="w-full p-3 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-user text-blue-500"></i>
                                <span class="text-sm font-medium text-blue-700">${student.name} (${student.rollNumber})</span>
                                <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">শ্রেণী: ${student.class}</span>
                            </div>
                        </div>
                        <input type="hidden" id="log-student-id" value="${studentId}">
                    `;
                }
            }
            
            if (logModal) logModal.style.display = 'flex';
        }

        // --- EDUCATION PROGRESS LOGIC ---
        function showBookModal(bookId = null) {
            const modal = document.getElementById('book-modal');
            const title = document.getElementById('book-modal-title');
            const deleteBtn = document.getElementById('delete-book-btn');
            const progressSection = document.getElementById('book-progress-section');
            const historySection = document.getElementById('book-progress-history-section');
            
            console.log(`🚀 showBookModal called with bookId:`, bookId);
            console.log(`📚 Current allEducationProgress:`, allEducationProgress);
            
            if (bookId) {
                // Find book in our loaded books data
                const book = allEducationProgress.find(b => b.id == bookId);
                console.log(`🔍 Looking for book ID: ${bookId}`);
                console.log(`📚 Available books:`, allEducationProgress);
                console.log(`🔍 Found book:`, book);
                
                if (!book) {
                    console.error(`❌ Book not found! bookId: ${bookId}, available IDs:`, allEducationProgress.map(b => b.id));
                    console.error(`❌ Available books:`, allEducationProgress);
                    alert('বইটি পাওয়া যায়নি। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।');
                    return;
                }
                
                console.log('✅ Book found for modal:', book);
                
                if (title) title.innerText = "বই সম্পাদনা ও অগ্রগতি";
                
                const bookIdElement = document.getElementById('book-id');
                const bookNameElement = document.getElementById('book-name');
                const bookTotalPagesElement = document.getElementById('book-total-pages');
                const bookCompletedPagesElement = document.getElementById('book-completed-pages');
                
                if (bookIdElement) bookIdElement.value = book.id;
                if (bookNameElement) bookNameElement.value = book.book_name || book.book || '';
                if (bookTotalPagesElement) bookTotalPagesElement.value = book.total_pages || book.total || '';
                
                // Use real completed pages from database
                const completedPages = book.completed_pages || 0;
                if (bookCompletedPagesElement) bookCompletedPagesElement.value = completedPages;
                
                // Show enhanced progress history
                const historyList = document.getElementById('progress-history-list');
                if (book.progressHistory && book.progressHistory.length > 0) {
                    // Sort by date (newest first)
                    const sortedHistory = book.progressHistory.sort((a, b) => 
                        new Date(b.date) - new Date(a.date)
                    );
                    
                    historyList.innerHTML = sortedHistory.map(h => {
                        const date = new Date(h.date);
                        const formattedDate = date.toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        return `
                            <li class="mb-3 p-2 bg-gray-50 rounded-md border-l-4 border-blue-500">
                                <div class="flex justify-between items-start mb-1">
                                    <div class="text-sm font-medium text-gray-700">
                                        ${h.completed} পৃষ্ঠা সম্পন্ন
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        ${formattedDate}
                                    </div>
                                </div>
                                ${h.note ? `
                                    <div class="text-xs text-gray-600 italic bg-white p-2 rounded border">
                                        <i class="fas fa-sticky-note mr-1"></i>${h.note}
                                    </div>
                                ` : ''}
                            </li>
                        `;
                    }).join('');
                } else {
                    // Show current progress with enhanced display
                    const currentDate = new Date().toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    historyList.innerHTML = `
                        <li class="mb-3 p-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
                            <div class="flex justify-between items-start mb-1">
                                <div class="text-sm font-medium text-blue-700">
                                    বর্তমান অগ্রগতি: ${completedPages} পৃষ্ঠা
                                </div>
                                <div class="text-xs text-blue-500">
                                    ${currentDate}
                                </div>
                            </div>
                            ${book.notes ? `
                                <div class="text-xs text-blue-600 italic bg-white p-2 rounded border">
                                    <i class="fas fa-sticky-note mr-1"></i>${book.notes}
                                </div>
                            ` : ''}
                        </li>
                        <li class="text-center p-3">
                            <div class="text-xs text-gray-500 bg-gray-100 p-2 rounded-md">
                                <i class="fas fa-info-circle mr-1"></i>
                                অগ্রগতির ইতিহাস ডেটাবেসে সংরক্ষিত হবে
                            </div>
                        </li>
                    `;
                }

                deleteBtn.style.display = 'block';
                progressSection.style.display = 'block';
                historySection.style.display = 'block';
            } else {
                title.innerText = "নতুন বই যোগ করুন";
                const bookIdElement = document.getElementById('book-id');
                const bookNameElement = document.getElementById('book-name');
                const bookTotalPagesElement = document.getElementById('book-total-pages');
                const bookProgressNoteElement = document.getElementById('book-progress-note');
                
                if (bookIdElement) bookIdElement.value = '';
                if (bookNameElement) bookNameElement.value = '';
                if (bookTotalPagesElement) bookTotalPagesElement.value = '';
                if (deleteBtn) deleteBtn.style.display = 'none';
                if (progressSection) progressSection.style.display = 'none';
                if (historySection) historySection.style.display = 'none';
                if (bookProgressNoteElement) bookProgressNoteElement.value = '';
            }
            modal.style.display = 'flex';
        }
        function closeBookModal() { 
            const bookModal = document.getElementById('book-modal');
            if (bookModal) bookModal.style.display = 'none';
        }
        async function saveBook() {
            const bookIdElement = document.getElementById('book-id');
            const bookNameElement = document.getElementById('book-name');
            const totalPagesElement = document.getElementById('book-total-pages');
            const completedPagesElement = document.getElementById('book-completed-pages');
            const progressNoteElement = document.getElementById('book-progress-note');
            
            if (!bookIdElement || !bookNameElement || !totalPagesElement || !completedPagesElement || !progressNoteElement) {
                console.error('❌ Required book elements not found');
                return;
            }
            
            const bookId = bookIdElement.value;
            const bookName = bookNameElement.value;
            const totalPages = parseInt(totalPagesElement.value);
            const completedPages = parseInt(completedPagesElement.value);
            const progressNote = progressNoteElement.value;

            console.log('🚀 saveBook called with:', { bookId, bookName, totalPages, completedPages, progressNote });
            console.log('📚 Current allEducationProgress length:', allEducationProgress.length);
            console.log('📚 allEducationProgress:', allEducationProgress);

            if (!bookName || isNaN(totalPages) || totalPages <= 0) { 
                alert("অনুগ্রহ করে সঠিক তথ্য দিন।"); 
                return; 
            }
            
            if (bookId) { // Update existing book progress
                try {
                    // Find the book in our data - convert bookId to number for comparison
                    const bookIdNum = parseInt(bookId);
                    const book = allEducationProgress.find(b => b.id === bookIdNum);
                    console.log('🔍 Looking for book with ID:', bookIdNum);
                    console.log('🔍 Available books:', allEducationProgress.map(b => ({ id: b.id, name: b.book_name })));
                    console.log('🔍 Found book:', book);
                    
                    if (!book) {
                        console.error('❌ Book not found in saveBook function!');
                        alert('বইটি পাওয়া যায়নি।');
                        return;
                    }
                    
                    // Validate completed pages
                         if (isNaN(completedPages) || completedPages < 0 || completedPages > totalPages) {
                        alert(`অনুগ্রহ করে ০ থেকে ${totalPages} এর মধ্যে একটি নাম্বার দিন।`); 
                        return;
                    }
                    
                    // Check if this book already has an education progress record
                    let progressRecordId = book.progress_record_id;
                    
                    console.log('🔍 Book data for progress update:', book);
                    console.log('🔍 Progress record ID:', progressRecordId);
                    
                    if (!progressRecordId) {
                        // Create new education progress record
                        console.log('🔄 Creating new education progress record for book:', book.book_name);
                        const createResponse = await fetch('/api/education', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                class_name: currentClass,
                                subject_name: 'General', // Default subject
                                book_id: bookId,
                                book_name: bookName,
                                total_pages: totalPages,
                                completed_pages: completedPages,
                                notes: progressNote || ''
                            })
                        });
                        
                        if (createResponse.ok) {
                            const result = await createResponse.json();
                            progressRecordId = result.id;
                            book.progress_record_id = progressRecordId;
                            console.log('✅ Created education progress record with ID:', progressRecordId);
                        } else {
                            const error = await createResponse.json();
                            console.error('❌ Failed to create education progress record:', error);
                            alert('অগ্রগতি রেকর্ড তৈরি করতে সমস্যা হয়েছে।');
                            return;
                        }
                    } else {
                        // Update existing education progress record
                        console.log('🔄 Updating existing education progress record:', progressRecordId);
                        const updateResponse = await fetch(`/api/education/${progressRecordId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                completed_pages: completedPages,
                                notes: progressNote || ''
                            })
                        });
                        
                        if (!updateResponse.ok) {
                            const error = await updateResponse.json();
                            console.error('❌ Failed to update education progress record:', error);
                            alert('অগ্রগতি আপডেট করতে সমস্যা হয়েছে।');
                            return;
                        }
                    }
                    
                    // Update local data
                    book.completed_pages = completedPages;
                    book.notes = progressNote || '';
                    book.total_pages = totalPages;
                    book.book_name = bookName;
                    
                    // Reload progress history from database to get the latest history
                    book.progressHistory = await loadProgressHistoryForBook(book.id, currentClass);
                    
                    // Refresh display
                    renderClassEducationProgress(currentClass);
                    alert('বইয়ের অগ্রগতি সংরক্ষিত হয়েছে।');
                    closeBookModal();
                    
                } catch (error) {
                    console.error('Error saving progress:', error);
                    alert('সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
                }
            } else { // Add new book (this should be handled in main app settings)
                alert('নতুন বই যোগ করার জন্য অনুগ্রহ করে Settings ট্যাবে যান।');
                return;
            }
        }
        function deleteBook() {
            const bookIdElement = document.getElementById('book-id');
            if (!bookIdElement) {
                console.error('❌ Book ID element not found');
                return;
            }
            
            const bookId = bookIdElement.value;
            if (confirm("আপনি কি এই বইটি মুছে ফেলতে নিশ্চিত?")) {
                // Note: Book deletion should be handled in main app settings
                // For now, we'll just remove from local display
                allEducationProgress = allEducationProgress.filter(b => b.id !== bookId);
                renderClassEducationProgress(currentClass);
                closeBookModal();
                alert('বইটি মুছে ফেলা হয়েছে। (স্থানীয় প্রদর্শন থেকে)');
            }
        }
        
        // --- PRINT FUNCTIONALITY ---
        // Old printStudentProfile function removed - replaced with printStudentDetail
        
        // Function to get current student ID from modal
        function getCurrentStudentId() {
            return currentStudentIdForProfile;
        }

        // --- TARBIYAH GOALS FUNCTIONS ---
        function renderTarbiyahGoalsChecklist(studentId) {
            const student = allStudents.find(s => s.id === studentId);
            if (!student) return '';
            
            // Initialize goals for this student if they don't exist
            if (!tarbiyahGoals[studentId]) {
                tarbiyahGoals[studentId] = {
                    helpingClassmates: false,
                    punctuality: false,
                    respectForTeachers: false,
                    cleanliness: false,
                    prayerPunctuality: false,
                    memorizationEffort: false,
                    helpingAtHome: false,
                    goodBehavior: false
                };
                localStorage.setItem('tarbiyahGoals_v1', JSON.stringify(tarbiyahGoals));
            }
            
            const goals = tarbiyahGoals[studentId];
            const goalDefinitions = {
                helpingClassmates: 'সহপাঠীদের সাহায্য করা',
                punctuality: 'সময়ানুবর্তিতা',
                respectForTeachers: 'শিক্ষকদের প্রতি শ্রদ্ধা',
                cleanliness: 'পরিচ্ছন্নতা',
                prayerPunctuality: 'নামাজের সময়ানুবর্তিতা',
                memorizationEffort: 'হিফজের চেষ্টা',
                helpingAtHome: 'বাড়িতে সাহায্য করা',
                goodBehavior: 'ভালো আচরণ'
            };
            
            return Object.entries(goals).map(([key, checked]) => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" 
                               id="goal-${key}-${studentId}" 
                               ${checked ? 'checked' : ''} 
                               onchange="updateTarbiyahGoal('${studentId}', '${key}', this.checked)"
                               class="rounded text-blue-600 focus:ring-blue-500">
                        <span class="text-sm font-medium text-gray-700">${goalDefinitions[key]}</span>
                    </label>
                    <div class="text-xs text-gray-500">
                        ${checked ? '<span class="text-green-600">✓ অর্জিত</span>' : '<span class="text-gray-400">অপেক্ষমান</span>'}
                    </div>
                </div>
            `).join('');
        }
        
        function updateTarbiyahGoal(studentId, goalKey, isChecked) {
            if (!tarbiyahGoals[studentId]) {
                tarbiyahGoals[studentId] = {};
            }
            tarbiyahGoals[studentId][goalKey] = isChecked;
            localStorage.setItem('tarbiyahGoals_v1', JSON.stringify(tarbiyahGoals));
        }
        
        function saveTarbiyahGoals(studentId) {
            // Goals are already saved automatically when checkboxes change
            // This function can be used for additional validation or feedback
            alert('তরবিয়াহ লক্ষ্যগুলি সংরক্ষিত হয়েছে।');
        }
        
        // Calculate attendance statistics for student profile
        async function calculateAttendanceStats(student) {
            try {
                // Fetch real attendance data for this student
                const response = await fetch('/api/attendance');
                if (response.ok) {
                    const allAttendance = await response.json();
                    
                    // The API returns data grouped by date: { "2025-08-18": { "ST001": { "status": "present" } } }
                    let present = 0;
                    let absent = 0;
                    let leave = 0;
                    
                    // Iterate through all dates and find this student's attendance
                    Object.values(allAttendance).forEach(dateAttendance => {
                        if (dateAttendance[student.id]) {
                            const status = dateAttendance[student.id].status;
                            if (status === 'present') present++;
                            else if (status === 'absent') absent++;
                            else if (status === 'leave') leave++;
                        }
                    });
                    
                    const totalSchoolDays = present + absent + leave;
                    const attendanceRate = totalSchoolDays > 0 ? Math.round((present / totalSchoolDays) * 100) : 0;
                    
                    console.log(`📊 Attendance stats for ${student.name}:`, { present, absent, leave, totalSchoolDays, attendanceRate });
                    
                    return {
                        present,
                        absent,
                        leave,
                        totalSchoolDays,
                        attendanceRate
                    };
                }
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
            
            // Fallback to basic calculation if API fails
            return {
                present: 0,
                absent: 0,
                leave: 0,
                totalSchoolDays: 0,
                attendanceRate: 0
            };
        }
        
        // --- GLOBAL FUNCTION EXPORTS ---
        // Make required functions available to the main application
        // Wait for DOM to be fully ready before exporting
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', exportFunctions);
        } else {
            exportFunctions();
        }
        
        function exportFunctions() {
            console.log('🚀 Exporting Teachers Corner functions to global scope...');
            
            window.showClassDashboard = showClassDashboard;
            window.renderTodaySummary = renderTodaySummary;
            window.renderClassStudentList = renderClassStudentList;
            window.renderClassEducationProgress = renderClassEducationProgress;
            window.renderClassOverview = renderClassOverview;
            window.renderTeachersLogbook = renderTeachersLogbook;
            window.renderDashboardAlerts = renderDashboardAlerts;
            window.renderProgressSummary = renderProgressSummary;
            window.showAddLogModal = showAddLogModal;
            window.closeLogModal = closeLogModal;
            window.saveLogEntry = saveLogEntry;
            window.editLog = editLog;
            window.deleteLog = deleteLog;
            window.switchLogTab = switchLogTab;
            window.showBookModal = showBookModal;
            window.closeBookModal = closeBookModal;
            window.saveBook = saveBook;
            window.deleteBook = deleteBook;
            window.showStudentProfile = showStudentProfile;
            window.closeStudentProfileModal = closeStudentProfileModal;
            window.switchProfileTab = switchProfileTab;
            window.showAddStudentLogModal = showAddStudentLogModal;
            window.editHusnulKhuluk = editHusnulKhuluk;
            window.closeScoreModal = closeScoreModal;
            window.saveNewScore = saveNewScore;
            window.showInactiveStudentsModal = showInactiveStudentsModal;
            window.closeInactiveStudentsModal = closeInactiveStudentsModal;
            window.filterStudentsByTier = filterStudentsByTier;
            window.clearStudentFilter = clearStudentFilter;
            // window.printStudentProfile = printStudentProfile; // Removed old function
            window.printStudentDetail = printStudentDetail;
            window.updateTarbiyahGoal = updateTarbiyahGoal;
            window.saveTarbiyahGoals = saveTarbiyahGoals;
            window.initTeachersCorner = initTeachersCorner;
            window.loadClassMapping = loadClassMapping;
            window.loadStudentsFromMainApp = loadStudentsFromMainApp;
            window.loadAttendanceFromMainApp = loadAttendanceFromMainApp;
            window.getCurrentStudentId = getCurrentStudentId;
            
            console.log('✅ Teachers Corner functions exported to global scope');
            console.log('🔍 Available functions:', Object.keys(window).filter(key => 
                typeof window[key] === 'function' && 
                ['showClassDashboard', 'renderTodaySummary', 'renderClassStudentList'].includes(key)
            ));
        }

        // Edit log function
        function editLog(logId) {
            let log, studentId;
            
            // Find the log in our loaded data
            if (teachersLogbook[currentClass]) {
                if (teachersLogbook[currentClass].class_logs) {
                    log = teachersLogbook[currentClass].class_logs.find(l => l.id == logId);
                }
                
                if (!log && teachersLogbook[currentClass].student_logs) {
                    for (const sId in teachersLogbook[currentClass].student_logs) {
                        const foundLog = teachersLogbook[currentClass].student_logs[sId].find(l => l.id == logId);
                        if (foundLog) { 
                            log = foundLog; 
                            studentId = sId; 
                            break; 
                        }
                    }
                }
            }
            
            if (!log) {
                console.error('❌ Log not found:', logId);
                return;
            }
            
            const logIdElement = document.getElementById('log-id');
            const logModalTitle = document.getElementById('log-modal-title');
            const logType = document.getElementById('log-type');
            const logDetails = document.getElementById('log-details');
            const logStudentSelect = document.getElementById('log-student-select');
            const logStudentId = document.getElementById('log-student-id');
            const logImportant = document.getElementById('log-important');
            const logFollowup = document.getElementById('log-followup');
            const logModal = document.getElementById('log-modal');
            
            // Populate student dropdown first
            if (logStudentSelect) {
                logStudentSelect.innerHTML = '<option value="">সবাই (শ্রেণী লগ)</option>';
                
                // Get students for current class
                const classStudents = allStudents.filter(student => student.class === currentClass && student.status === 'active');
                
                classStudents.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} (${student.rollNumber})`;
                    logStudentSelect.appendChild(option);
                });
            }
            
            if (logIdElement) logIdElement.value = log.id;
            if (logModalTitle) logModalTitle.innerText = 'নোট সম্পাদনা করুন';
            if (logType) logType.value = log.type;
            if (logDetails) logDetails.value = log.details;
            if (logStudentSelect) logStudentSelect.value = studentId || '';
            if (logStudentId) logStudentId.value = studentId || '';
            if (logImportant) logImportant.checked = log.isImportant || false;
            if (logFollowup) logFollowup.checked = log.needsFollowup || false;
            if (logModal) logModal.style.display = 'flex';
        }
        
        // Delete log function (wrapper for database call)
        function deleteLog(logId) {
            if (!confirm('আপনি কি এই নোটটি মুছে ফেলতে নিশ্চিত?')) return;
            deleteLogFromDatabase(logId);
        }

        // Helper functions for the improved alert system
        function showScoreManagement() {
            // Show score management modal or navigate to score section
            console.log('📊 Opening score management...');
            // You can implement this based on your UI needs
            showModal('স্কোর ব্যবস্থাপনা', 'স্কোর ব্যবস্থাপনা সেকশন খোলা হচ্ছে...');
        }
        
        function showAttendanceModal() {
            // Show attendance modal
            console.log('📅 Opening attendance modal...');
            // You can implement this based on your UI needs
            showModal('উপস্থিতি দেখুন', 'উপস্থিতি মডাল খোলা হচ্ছে...');
        }
        
        function showClassAnalysis() {
            // Show class performance analysis
            console.log('📈 Opening class analysis...');
            // You can implement this based on your UI needs
            showModal('শ্রেণী বিশ্লেষণ', 'শ্রেণী বিশ্লেষণ সেকশন খোলা হচ্ছে...');
        }
        
        function showTeachersLogbook() {
            // Show teachers logbook
            console.log('📔 Opening teachers logbook...');
            // You can implement this based on your UI needs
            showModal('শিক্ষকের লগবুক', 'শিক্ষকের লগবুক সেকশন খোলা হচ্ছে...');
        }
        
        // Utility function to show modals
        function showModal(title, message) {
            // Create a simple modal if none exists
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-lg max-w-md mx-4">
                    <h3 class="text-lg font-semibold mb-4">${title}</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <button onclick="this.closest('.fixed').remove()" class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        বন্ধ করুন
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Make functions globally accessible
        window.showScoreManagement = showScoreManagement;
        window.showAttendanceModal = showAttendanceModal;
        window.showClassAnalysis = showClassAnalysis;
        window.showTeachersLogbook = showTeachersLogbook;
        window.showModal = showModal;

        // Alert System Configuration
        const ALERT_CONFIG = {
            // Score thresholds (can be customized in settings)
            LOW_SCORE_THRESHOLD: 60,
            CRITICAL_SCORE_THRESHOLD: 50,
            LOW_CLASS_AVERAGE_THRESHOLD: 70,
            
            // Alert types and colors
            ALERT_TYPES: {
                danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-500' },
                warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-500' },
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-500' }
            }
        };

        // Function to load alert settings from database with localStorage fallback
        async function loadAlertSettings() {
            try {
                const response = await fetch('/api/settings/alertConfig');
                if (response.ok) {
                    const data = await response.json();
                    const savedConfig = JSON.parse(data.value || '{}');
                    Object.assign(ALERT_CONFIG, savedConfig);
                } else {
                    // Fallback to localStorage
                    const saved = localStorage.getItem('alertConfig');
                    if (saved) {
                        const savedConfig = JSON.parse(saved);
                        Object.assign(ALERT_CONFIG, savedConfig);
                    }
                }
            } catch (error) {
                console.error('Error loading alert config from database:', error);
                // Fallback to localStorage
                const saved = localStorage.getItem('alertConfig');
                if (saved) {
                    try {
                        const savedConfig = JSON.parse(saved);
                        Object.assign(ALERT_CONFIG, savedConfig);
                    } catch (e) {
                        console.error('Error loading alert config from localStorage:', e);
                    }
                }
            }
        }
        
        // Load settings when page loads
        loadAlertSettings();



