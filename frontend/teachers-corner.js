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
        let teachersLogbook = JSON.parse(localStorage.getItem('teachersLogbook_v3')) || {};
        let studentScores = JSON.parse(localStorage.getItem('studentScores_v3')) || {};
        let scoreChangeHistory = JSON.parse(localStorage.getItem('scoreChangeHistory_v1')) || {};
        let tarbiyahGoals = JSON.parse(localStorage.getItem('tarbiyahGoals_v1')) || {};

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
        


        // --- INITIALIZATION ---
        document.addEventListener('DOMContentLoaded', async () => {
            initTeachersCorner();
            
            // Load real data from main app
            await loadClassMapping(); // Load class mapping first
            await loadStudentsFromMainApp();
            await loadAttendanceFromMainApp();
            
              document.getElementById('teachers-corner-section').innerHTML = `
                    <div class="text-center p-8">
                        <h2 class="text-2xl font-bold mb-4 text-gray-700">শ্রেণী নির্বাচন করুন</h2>
                        <p class="text-gray-600">Teachers Corner থেকে একটি শ্রেণী নির্বাচন করুন।</p>
                    </div>
                `;
        });

        function initTeachersCorner() {
            // No need to initialize dropdown - prototype gets class from main app
            // This function is kept for future use if needed
        }

        // --- NAVIGATION ---

        async function showClassDashboard(className) {
            currentClass = className;
            document.getElementById('class-dashboard-title').innerText = `${className} - ড্যাশবোর্ড`;
            
            // Get active and inactive students separately
            const activeStudentsInClass = getActiveStudentsForClass(className);
            const inactiveStudentsInClass = getInactiveStudentsForClass(className);
            
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
            
            // Convert books to education progress format for display
            console.log('🔄 Starting conversion of books to education progress format');
            console.log('📚 Books to convert:', books);
            allEducationProgress = books.map(book => {
                // Find existing progress for this book
                const existingBookProgress = existingProgress.find(p => p.book_id === book.id);
                
                const converted = {
                    id: book.id,
                    book_name: book.book_name,
                    class_id: book.class_id,
                    class_name: className, // Use the class name passed to the function
                    total_pages: book.total_pages || 100, // Default if not set
                    completed_pages: existingBookProgress ? existingBookProgress.completed_pages : 0,
                    notes: existingBookProgress ? existingBookProgress.notes : '',
                    progressHistory: book.progressHistory || [],
                    progress_record_id: existingBookProgress ? existingBookProgress.id : null
                };
                console.log(`🔄 Converting book:`, book);
                console.log(`✅ Converted to:`, converted);
                return converted;
            });
            
            console.log(`🎯 Final allEducationProgress array:`, allEducationProgress);
            
            console.log(`🔄 Converted ${allEducationProgress.length} books to education progress format:`, allEducationProgress);
            
            // Render dashboard with real data
            renderTodaySummary(activeStudentsInClass);
            renderClassStudentList(activeStudentsInClass);
            renderClassEducationProgress(className); // This now also calls renderProgressSummary
            renderClassOverview(activeStudentsInClass);
            renderTeachersLogbook();
            renderDashboardAlerts(activeStudentsInClass);
            
            // Update inactive students count
            updateElementText('class-inactive-students', inactiveStudentsInClass.length);
        }

        // --- DATA CALCULATION ---
        function getHusnulKhulukScore(studentId) {
            // Try to get score from localStorage first (for persistence)
            if (!studentScores[studentId]) {
                // Load from main app database if available
                loadStudentScoreFromMainApp(studentId);
                // Return a default score for now
                return 70; // Default score
            }
            return studentScores[studentId];
        }
        
        // Function to load student score from main app
        async function loadStudentScoreFromMainApp(studentId) {
            try {
                // For now, we'll use localStorage, but this can be connected to your database later
                if (!studentScores[studentId]) {
                    studentScores[studentId] = 70; // Default score
                    localStorage.setItem('studentScores_v3', JSON.stringify(studentScores));
                }
            } catch (error) {
                console.error('Error loading student score:', error);
                // Fallback to default score
                studentScores[studentId] = 70;
            }
        }

        function editHusnulKhuluk(studentId, currentScore) {
            document.getElementById('score-student-id').value = studentId;
            document.getElementById('new-score').value = currentScore;
            document.getElementById('score-change-reason').value = '';
            document.getElementById('score-modal').style.display = 'flex';
        }

        function closeScoreModal() {
            document.getElementById('score-modal').style.display = 'none';
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
                                    <span class="clickable-name" onclick="showStudentProfile('${student.id}').catch(console.error)" style="cursor: pointer; color: #3498db;">
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
            document.getElementById('inactive-students-modal').style.display = 'none';
        }

        function saveNewScore() {
            const studentId = document.getElementById('score-student-id').value;
            const newScore = document.getElementById('new-score').value;
            const changeReason = document.getElementById('score-change-reason').value;
            const oldScore = studentScores[studentId] || 0;
            
            if (newScore !== null && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                // Log the score change
                if (!scoreChangeHistory[studentId]) {
                    scoreChangeHistory[studentId] = [];
                }
                scoreChangeHistory[studentId].push({
                    date: new Date().toISOString(),
                    oldScore: oldScore,
                    newScore: parseInt(newScore),
                    reason: changeReason || 'কোন কারণ উল্লেখ করা হয়নি',
                    changedBy: 'শিক্ষক'
                });
                
                studentScores[studentId] = parseInt(newScore);
                localStorage.setItem('studentScores_v3', JSON.stringify(studentScores));
                localStorage.setItem('scoreChangeHistory_v1', JSON.stringify(scoreChangeHistory));
                
                const activeStudentsInClass = getActiveStudentsForClass(currentClass);
                renderClassStudentList(activeStudentsInClass);
                renderClassOverview(activeStudentsInClass);
                closeScoreModal();
            } else {
                alert("অনুগ্রহ করে ০ থেকে ১০০ এর মধ্যে একটি নাম্বার দিন।");
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
            
            // Batch DOM updates
            requestAnimationFrame(() => {
                updateElementText('class-total-students', total);
                updateElementText('class-present-today', present);
                updateElementText('class-absent-today', absent);
                updateElementText('class-attendance-rate', `${rate}%`);
                    });
                })
                .catch(error => {
                    console.error('Error loading attendance data:', error);
                    // Fallback to showing just total students
                    requestAnimationFrame(() => {
                        updateElementText('class-total-students', total);
                        updateElementText('class-present-today', '0');
                        updateElementText('class-absent-today', '0');
                        updateElementText('class-attendance-rate', '0%');
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
            document.getElementById('performance-chart').innerHTML = performanceData.map(p => {
                const tierKey = p.label.includes('মুস্তাইদ') ? 'mustaid' : p.label.includes('মুতাওয়াসসিত') ? 'mutawassit' : 'mujtahid';
                return `<div class="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" onclick="filterStudentsByTier('${tierKey}')"><span class="text-sm font-semibold ${p.color}">${p.label}</span><span class="text-sm font-bold text-gray-700">${p.value} জন</span></div>`;
            }).join('');
            
            const classLogs = (teachersLogbook[currentClass]?.class_logs || []).sort((a,b) => new Date(b.date) - new Date(b.date)).slice(0, 3);
            const logsHTML = classLogs.length > 0 ? classLogs.map(log => `<div class="text-xs bg-gray-50 p-2 rounded"><p class="font-semibold text-gray-700">${log.details}</p><p class="text-gray-500">${new Date(log.date).toLocaleDateString('bn-BD')} - ${log.type}</p></div>`).join('') : '<p class="text-xs text-gray-500 italic">কোনো শ্রেণী লগ নেই।</p>';
            
            updateElementHTML('recent-class-logs', logsHTML);
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
                        ${currentClass} - ড্যাশবোর্ড 
                        <span class="text-lg font-normal text-gray-600">(${tierLabels[tier]} - ${filteredStudents.length} জন)</span>
                        <button onclick="clearStudentFilter()" class="ml-2 text-sm text-blue-600 hover:text-blue-800 underline">
                            সব ছাত্র দেখুন
                        </button>
                    `;
                    updateElementHTML('class-dashboard-title', titleHTML);
                }
            });
        }
        
        function clearStudentFilter() {
            const studentsInClass = allStudents.filter(s => s.class === currentClass);
            
            requestAnimationFrame(() => {
                renderClassStudentList(studentsInClass);
                updateElementText('class-dashboard-title', `${currentClass} - ড্যাশবোর্ড`);
            });
        }

        function renderDashboardAlerts(students) {
            const alerts = [];
            
            // Check for students with low scores
            const lowScoreStudents = students.filter(s => {
                const score = getHusnulKhulukScore(s.id);
                return score < 60;
            });
            if (lowScoreStudents.length > 0) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-user-times',
                    title: 'নিম্ন হুসনুল খুলুক স্কোর',
                    message: `${lowScoreStudents.length} জন ছাত্রের স্কোর ৬০ এর নিচে।`,
                    action: 'স্কোর দেখুন'
                });
            }
            
            // Check for students with no progress
            const classProgress = allEducationProgress.filter(p => p.class === currentClass);
            const studentsWithNoProgress = students.filter(s => {
                return !classProgress.some(p => p.progressHistory.length > 0);
            });
            if (studentsWithNoProgress.length > 0) {
                alerts.push({
                    type: 'info',
                    icon: 'fas fa-book',
                    title: 'অগ্রগতি নেই',
                    message: `${studentsWithNoProgress.length} জন ছাত্রের শিক্ষার অগ্রগতি রেকর্ড নেই।`,
                    action: 'অগ্রগতি দেখুন'
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
                    action: 'নোট দেখুন'
                });
            }
            
            const alertsContent = document.getElementById('alerts-content');
            if (alerts.length === 0) {
                alertsContent.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">কোনো সতর্কতা নেই। সবকিছু ঠিক আছে!</p>';
            } else {
                alertsContent.innerHTML = alerts.map(alert => `
                    <div class="flex items-center justify-between p-3 rounded-lg ${alert.type === 'danger' ? 'bg-red-50 border border-red-200' : alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}">
                        <div class="flex items-center gap-3">
                            <i class="${alert.icon} ${alert.type === 'danger' ? 'text-red-500' : alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}"></i>
                            <div>
                                <div class="font-semibold text-sm ${alert.type === 'danger' ? 'text-red-800' : alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}">${alert.title}</div>
                                <div class="text-xs ${alert.type === 'danger' ? 'text-red-600' : alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}">${alert.message}</div>
                            </div>
                        </div>
                        <button class="text-xs px-3 py-1 rounded ${alert.type === 'danger' ? 'bg-red-100 text-red-700 hover:bg-red-200' : alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}">${alert.action}</button>
                    </div>
                `).join('');
            }
        }

        function renderClassStudentList(students) {
            const listEl = document.getElementById('class-student-list');
            if (students.length === 0) {
                listEl.innerHTML = `<tr><td colspan="3" class="text-center p-4">এই শ্রেণীতে কোন ছাত্র নেই।</td></tr>`;
                return;
            }
            listEl.innerHTML = students.map(s => {
                const score = getHusnulKhulukScore(s.id);
                let scoreClass = 'score-attention';
                if (score >= 80) scoreClass = 'score-good';
                else if (score >= 60) scoreClass = 'score-average';
                return `<tr class="border-b hover:bg-gray-50"><td class="px-4 py-2 text-center"><span onclick="editHusnulKhuluk('${s.id}', ${score})" class="score-badge ${scoreClass}" title="স্কোর পরিবর্তন করুন">${score}</span></td><td class="px-4 py-2 font-medium">${s.rollNumber}</td><td onclick="showStudentProfile('${s.id}').catch(console.error)" class="px-4 py-2 text-blue-600 hover:underline cursor-pointer">${s.name}</td></tr>`;
            }).join('');
        }
        
        function renderClassEducationProgress(className) {
            const progressEl = document.getElementById('class-education-progress');
            
            console.log(`🎨 Rendering education progress for class: ${className}`);
            console.log(`📊 Current allEducationProgress:`, allEducationProgress);
            
            if (!allEducationProgress || allEducationProgress.length === 0) {
                console.log(`⚠️ No education progress data available for class: ${className}`);
                progressEl.innerHTML = `<p class="text-sm text-gray-500">এই শ্রেণীর জন্য কোন বই যুক্ত করা হয়নি।</p>`;
                return;
            }
            
            // Since we're now loading books directly for the class, allEducationProgress should already be filtered
            const classProgress = allEducationProgress;
            
            console.log(`📚 Found ${classProgress.length} books/progress items for class: ${className}`);
            
            if (classProgress.length === 0) {
                progressEl.innerHTML = `<p class="text-sm text-gray-500">এই শ্রেণীর জন্য কোন বই যুক্ত করা হয়নি।</p>`;
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
                }
        
        function renderProgressSummary(className) {
            const summaryEl = document.getElementById('progress-summary');
            if (!summaryEl) return;
            
            // Since we're now loading books directly for the class, allEducationProgress should already be filtered
            const classProgress = allEducationProgress;
            
            console.log(`📊 Rendering progress summary for class: ${className}`);
            console.log(`📚 Class progress data:`, classProgress);
            
            if (classProgress.length === 0) {
                summaryEl.innerHTML = '<p class="text-sm text-gray-500 text-center col-span-3">কোনো অগ্রগতি তথ্য নেই</p>';
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
            if (!teachersLogbook[currentClass]) teachersLogbook[currentClass] = { class_logs: [], student_logs: {} };
            let logsToShow = currentLogTab === 'class' ? teachersLogbook[currentClass].class_logs : Object.values(teachersLogbook[currentClass].student_logs).flat();
            logsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
            if (logsToShow.length === 0) {
                displayEl.innerHTML = `<p class="text-center text-sm text-gray-500 p-4">কোনো নোট পাওয়া যায়নি।</p>`; return;
            }
            displayEl.innerHTML = logsToShow.map(log => {
                const student = log.studentId ? allStudents.find(s => s.id === log.studentId) : null;
                const priorityFlags = [];
                if (log.isImportant) priorityFlags.push('<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">গুরুত্বপূর্ণ</span>');
                if (log.needsFollowup) priorityFlags.push('<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">অনুসরণ প্রয়োজন</span>');
                
                return `<div class="log-entry bg-gray-50 p-3 rounded-md relative ${log.isImportant ? 'border-l-4 border-red-500' : ''}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="text-xs text-gray-500 mb-1">
                                <span><strong>${log.type}</strong> ${student ? `(${student.name})` : ''}</span> - <span>${new Date(log.date).toLocaleDateString('bn-BD')}</span>
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
            }).join('');
        }

        // --- LOGBOOK LOGIC (Same as before) ---
        function switchLogTab(tab) {
            currentLogTab = tab;
            document.querySelectorAll('.logbook-tabs button').forEach(b => b.classList.remove('active'));
            document.querySelector(`.logbook-tabs button[onclick="switchLogTab('${tab}')"]`).classList.add('active');
            renderTeachersLogbook();
        }
        function showAddLogModal() {
            document.getElementById('log-id').value = '';
            document.getElementById('log-modal-title').innerText = `"${currentClass}" এর জন্য নতুন নোট`;
            document.getElementById('log-details').value = '';
            document.getElementById('log-type').value = 'শিক্ষামূলক';
            document.getElementById('log-student-id').value = '';
            document.getElementById('log-important').checked = false;
            document.getElementById('log-followup').checked = false;
            document.getElementById('log-modal').style.display = 'flex';
        }
        function closeLogModal() { document.getElementById('log-modal').style.display = 'none'; }
        function saveLogEntry() {
            const logId = document.getElementById('log-id').value;
            const className = currentClass;
            const studentId = document.getElementById('log-student-id').value;
            const type = document.getElementById('log-type').value;
            const details = document.getElementById('log-details').value;
            const isImportant = document.getElementById('log-important').checked;
            const needsFollowup = document.getElementById('log-followup').checked;
            
            if (!details.trim()) { alert('অনুগ্রহ করে বিস্তারিত লিখুন।'); return; }
            
            const logData = { 
                type, 
                details, 
                isImportant, 
                needsFollowup,
                date: new Date().toISOString() 
            };
            
            if (logId) {
                let logFound = false;
                if (studentId) {
                    const studentLogs = teachersLogbook[className].student_logs[studentId];
                    const logIndex = studentLogs.findIndex(l => l.id === logId);
                    if (logIndex > -1) { 
                        studentLogs[logIndex] = { ...studentLogs[logIndex], ...logData }; 
                        logFound = true; 
                    }
                } else {
                    const classLogs = teachersLogbook[className].class_logs;
                    const logIndex = classLogs.findIndex(l => l.id === logId);
                    if (logIndex > -1) { 
                        classLogs[logIndex] = { ...classLogs[logIndex], ...logData }; 
                        logFound = true; 
                    }
                }
            } else {
                const newLog = { id: `log_${Date.now()}`, ...logData };
                if (studentId) {
                    newLog.studentId = studentId;
                    if (!teachersLogbook[className].student_logs[studentId]) teachersLogbook[className].student_logs[studentId] = [];
                    teachersLogbook[className].student_logs[studentId].push(newLog);
                } else {
                    teachersLogbook[className].class_logs.push(newLog);
                }
            }
            localStorage.setItem('teachersLogbook_v3', JSON.stringify(teachersLogbook));
            renderTeachersLogbook();
            if(document.getElementById('student-profile-modal').style.display === 'flex') showStudentProfile(studentId || currentStudentIdForProfile);
            closeLogModal();
        }
        function editLog(logId) {
            let log, studentId;
            if (teachersLogbook[currentClass].class_logs.find(l => l.id === logId)) {
                log = teachersLogbook[currentClass].class_logs.find(l => l.id === logId);
            } else {
                for (const sId in teachersLogbook[currentClass].student_logs) {
                    const foundLog = teachersLogbook[currentClass].student_logs[sId].find(l => l.id === logId);
                    if (foundLog) { log = foundLog; studentId = sId; break; }
                }
            }
            if (!log) return;
            document.getElementById('log-id').value = log.id;
            document.getElementById('log-modal-title').innerText = 'নোট সম্পাদনা করুন';
            document.getElementById('log-type').value = log.type;
            document.getElementById('log-details').value = log.details;
            document.getElementById('log-student-id').value = studentId || '';
            document.getElementById('log-important').checked = log.isImportant || false;
            document.getElementById('log-followup').checked = log.needsFollowup || false;
            document.getElementById('log-modal').style.display = 'flex';
        }
        function deleteLog(logId) {
            if (!confirm('আপনি কি এই নোটটি মুছে ফেলতে নিশ্চিত?')) return;
            let logFound = false;
            if (teachersLogbook[currentClass].class_logs.some(l => l.id === logId)) {
                teachersLogbook[currentClass].class_logs = teachersLogbook[currentClass].class_logs.filter(l => l.id !== logId);
                logFound = true;
            } else {
                for (const sId in teachersLogbook[currentClass].student_logs) {
                    const initialLength = teachersLogbook[currentClass].student_logs[sId].length;
                    teachersLogbook[currentClass].student_logs[sId] = teachersLogbook[currentClass].student_logs[sId].filter(l => l.id !== logId);
                    if (teachersLogbook[currentClass].student_logs[sId].length < initialLength) { logFound = true; break; }
                }
            }
            if (logFound) {
                localStorage.setItem('teachersLogbook_v3', JSON.stringify(teachersLogbook));
                renderTeachersLogbook();
            }
        }
        
        // --- STUDENT PROFILE LOGIC (UNIFIED VIEW) ---
        async function showStudentProfile(studentId) {
            currentStudentIdForProfile = studentId;
            const student = allStudents.find(s => s.id === studentId);
            if (!student) return;
            document.getElementById('student-profile-title').innerText = `${student.name} - বিস্তারিত প্রোফাইল`;
            const score = getHusnulKhulukScore(studentId);
            const studentLogs = (teachersLogbook[student.class]?.student_logs[studentId] || []).sort((a, b) => new Date(b.date) - new Date(a.date));
            const scoreHistory = scoreChangeHistory[studentId] || [];
            
            // Calculate attendance statistics (real data)
            const attendanceStats = await calculateAttendanceStats(student);
            
            const profileContent = `<div class="space-y-6">
                <!-- Profile Tabs -->
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8">
                        <button onclick="switchProfileTab('overview')" class="profile-tab active py-2 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">এক নজরে</button>
                        <button onclick="switchProfileTab('personal')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">ব্যক্তিগত তথ্য</button>
                        <button onclick="switchProfileTab('attendance')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">উপস্থিতি</button>
                        <button onclick="switchProfileTab('logs')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">শিক্ষকের নোট</button>
                        <button onclick="switchProfileTab('score-history')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">স্কোর ইতিহাস</button>
                        <button onclick="switchProfileTab('tarbiyah-goals')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">তরবিয়াহ লক্ষ্য</button>
                    </nav>
                </div>
                
                <!-- Overview Tab -->
                <div id="profile-overview" class="profile-tab-content">
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 class="font-semibold text-gray-700 mb-3">এক নজরে</h4>
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
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold text-gray-700">হুসনুল খুলুক স্কোর ইতিহাস</h4>
                        <button onclick="editHusnulKhuluk('${student.id}', ${score})" class="btn-primary text-white px-3 py-1 text-sm rounded-md">
                            স্কোর পরিবর্তন করুন
                        </button>
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
            document.getElementById('student-profile-content').innerHTML = profileContent;
            document.getElementById('student-profile-modal').style.display = 'flex';
        }
        function closeStudentProfileModal() { document.getElementById('student-profile-modal').style.display = 'none'; }
        
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
            closeStudentProfileModal();
            document.getElementById('log-id').value = '';
            document.getElementById('log-modal-title').innerText = `"${student.name}" এর জন্য নতুন নোট`;
            document.getElementById('log-details').value = '';
            document.getElementById('log-type').value = 'শিক্ষামূলক';
            document.getElementById('log-student-id').value = studentId;
            document.getElementById('log-modal').style.display = 'flex';
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
                
                title.innerText = "বই সম্পাদনা ও অগ্রগতি";
                document.getElementById('book-id').value = book.id;
                document.getElementById('book-name').value = book.book_name || book.book || '';
                document.getElementById('book-total-pages').value = book.total_pages || book.total || '';
                
                // Use real completed pages from database
                const completedPages = book.completed_pages || 0;
                document.getElementById('book-completed-pages').value = completedPages;
                
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
                document.getElementById('book-id').value = '';
                document.getElementById('book-name').value = '';
                document.getElementById('book-total-pages').value = '';
                deleteBtn.style.display = 'none';
                progressSection.style.display = 'none';
                historySection.style.display = 'none';
                document.getElementById('book-progress-note').value = '';
            }
            modal.style.display = 'flex';
        }
        function closeBookModal() { document.getElementById('book-modal').style.display = 'none'; }
        async function saveBook() {
            const bookId = document.getElementById('book-id').value;
            const bookName = document.getElementById('book-name').value;
            const totalPages = parseInt(document.getElementById('book-total-pages').value);
            const completedPages = parseInt(document.getElementById('book-completed-pages').value);
            const progressNote = document.getElementById('book-progress-note').value;

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
                    
                    // Add to progress history if pages changed
                    if (!book.progressHistory) {
                        book.progressHistory = [];
                    }
                    
                    const lastCompleted = book.progressHistory.length > 0 ? 
                        book.progressHistory[book.progressHistory.length - 1].completed : -1;
                        
                    if (completedPages !== lastCompleted) {
                         book.progressHistory.push({ 
                             date: new Date().toISOString(), 
                             completed: completedPages,
                             note: progressNote || null
                         });
                    }
                    
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
            const bookId = document.getElementById('book-id').value;
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
        function printStudentProfile() {
            const student = allStudents.find(s => s.id === currentStudentIdForProfile);
            if (!student) return;
            const score = getHusnulKhulukScore(student.id);
            const studentLogs = (teachersLogbook[student.class]?.student_logs[student.id] || []).sort((a,b) => new Date(b.date) - new Date(a.date));
            const classProgress = allEducationProgress.filter(p => p.class === student.class);
            const printContent = `<html><head><title>${student.name} - ছাত্র রিপোর্ট</title><script src="https://cdn.tailwindcss.com"><\/script><style> body { font-family: 'Segoe UI', sans-serif; } @media print { .no-print { display: none; } } </style></head><body class="bg-white p-8"><div class="text-center mb-8 border-b pb-4"><h1 class="text-3xl font-bold text-gray-800">মাদানী মক্তব</h1><p class="text-lg text-gray-600">ছাত্রের সার্বিক অবস্থার রিপোর্ট</p></div><div class="mb-6"><h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">মৌলিক তথ্য</h2><div class="grid grid-cols-2 gap-4 text-sm"><p><strong>নাম:</strong> ${student.name}</p><p><strong>রোল:</strong> ${student.rollNumber}</p><p><strong>পিতার নাম:</strong> ${student.fatherName}</p><p><strong>শ্রেণী:</strong> ${student.class}</p><p><strong>মোবাইল:</strong> ${student.mobile}</p><p><strong>ঠিকানা:</strong> ${student.upazila}, ${student.district}</p></div></div><div class="mb-6"><h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">এক নজরে</h2><div class="grid grid-cols-4 gap-4 text-center bg-gray-50 p-4 rounded-lg"><div><div class="text-2xl font-bold text-green-600">95%</div><div class="text-sm text-gray-500">উপস্থিতি</div></div><div><div class="text-2xl font-bold text-blue-600">${score}</div><div class="text-sm text-gray-500">হুসনুল খুলুক</div></div><div><div class="text-2xl font-bold text-purple-600">${studentLogs.length}</div><div class="text-sm text-gray-500">নোট সংখ্যা</div></div><div><div class="text-2xl font-bold text-yellow-600">${classProgress.length}</div><div class="text-sm text-gray-500">মোট বই</div></div></div></div><div class="mb-6"><h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">শিক্ষকের নোট</h2><div class="space-y-3 text-sm">${studentLogs.length > 0 ? studentLogs.map(log => `<div class="p-2 border rounded-md"><p><strong>${log.type} (${new Date(log.date).toLocaleDateString('bn-BD')}):</strong> ${log.details}</p></div>`).join('') : '<p>কোনো নোট নেই।</p>'}</div></div><div class="text-center text-xs text-gray-400 mt-8"><p>রিপোর্টটি ${new Date().toLocaleString('bn-BD')} তারিখে তৈরি করা হয়েছে।</p></div></body></html>`;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
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
        
        


