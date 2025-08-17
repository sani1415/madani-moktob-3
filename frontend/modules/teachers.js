// Teachers Corner Module
// High-verbosity, readable code with clear naming

import * as Settings from './settings.js';

function getTodayString() {
	const today = new Date();
	const y = today.getFullYear();
	const m = String(today.getMonth() + 1).padStart(2, '0');
	const d = String(today.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

async function ensureDataLoaded() {
	if (typeof window.loadEducationProgress === 'function') {
		await window.loadEducationProgress();
	}
	if (typeof window.loadBooks === 'function') {
		await window.loadBooks();
	}
	if (!window.classes || window.classes.length === 0) {
		try {
			const classesResponse = await fetch('/api/classes');
			if (classesResponse.ok) {
				window.classes = await classesResponse.json();
			}
		} catch (e) {
			console.error('Failed to load classes:', e);
		}
	}
}

function populateTeachersClassDropdown() {
	const selectEl = document.getElementById('teachersClassSelect');
	if (!selectEl) return;
	const currentValue = selectEl.value;
	selectEl.innerHTML = '';
	const defaultOption = document.createElement('option');
	defaultOption.value = '';
	defaultOption.textContent = t('selectClass');
	selectEl.appendChild(defaultOption);
	if (Array.isArray(window.classes)) {
		window.classes.forEach(cls => {
			const option = document.createElement('option');
			option.value = cls.name;
			option.textContent = cls.name;
			selectEl.appendChild(option);
		});
	}
	selectEl.value = currentValue;
}

function getSelectedTeachersClass() {
	const selectEl = document.getElementById('teachersClassSelect');
	return selectEl ? selectEl.value : '';
}

function renderClassSummary(selectedClass) {
	const totalEl = document.getElementById('teachersTotalStudents');
	const presentEl = document.getElementById('teachersPresentToday');
	const absentEl = document.getElementById('teachersAbsentToday');
	const rateEl = document.getElementById('teachersAttendanceRate');
	if (!totalEl || !presentEl || !absentEl || !rateEl) return;
	const studentsInClass = (window.students || []).filter(s => !selectedClass || s.class === selectedClass);
	const total = studentsInClass.length;
	const today = getTodayString();
	const todayAttendance = window.attendance && window.attendance[today] ? window.attendance[today] : {};
	let present = 0;
	let absent = 0;
	studentsInClass.forEach(s => {
		const sAttendance = todayAttendance[s.id];
		if (!sAttendance || sAttendance.status === 'neutral' || !sAttendance.status) return;
		if (sAttendance.status === 'present') present++;
		if (sAttendance.status === 'absent') absent++;
	});
	const rate = total > 0 ? Math.round((present / total) * 100) : 0;
	totalEl.textContent = String(total);
	presentEl.textContent = String(present);
	absentEl.textContent = String(absent);
	rateEl.textContent = `${rate}%`;
}

function renderStudentsList(selectedClass) {
	const container = document.getElementById('teachersStudentList');
	if (!container) return;
	const studentsInClass = (window.students || [])
		.filter(s => !selectedClass || s.class === selectedClass)
		.sort((a, b) => {
			const classA = window.getClassNumber ? window.getClassNumber(a.class) : 0;
			const classB = window.getClassNumber ? window.getClassNumber(b.class) : 0;
			if (classA !== classB) return classA - classB;
			const rollA = window.parseRollNumber ? window.parseRollNumber(a.rollNumber) : parseInt(a.rollNumber || '0', 10);
			const rollB = window.parseRollNumber ? window.parseRollNumber(b.rollNumber) : parseInt(b.rollNumber || '0', 10);
			return rollA - rollB;
		});
	if (studentsInClass.length === 0) {
		container.innerHTML = `<p>${t('noStudentsFoundRegister')}</p>`;
		return;
	}
	container.innerHTML = studentsInClass.map(s => `
		<div class="student-row">
			<div class="student-info">
				<h4>Roll: ${s.rollNumber || 'N/A'} - <span class="clickable-name" onclick="showStudentDetail('${s.id}')">${s.name} বিন ${s.fatherName}</span></h4>
			</div>
		</div>
	`).join('');
}

function renderClassEducationProgress(selectedClass) {
	const container = document.getElementById('teachersProgressList');
	if (!container) return;
	const progress = (Settings.educationProgress || [])
		.filter(p => !selectedClass || p.class_name === selectedClass);
	if (progress.length === 0) {
		container.innerHTML = `<p class="no-data">${t('noBooksAddedYet')}</p>`;
		return;
	}
	container.innerHTML = progress.map(book => {
		const pct = book.total_pages > 0 ? Math.round((book.completed_pages / book.total_pages) * 100) : 0;
		const remaining = book.total_pages - book.completed_pages;
		return `
			<div class="book-card" data-id="${book.id}">
				<div class="book-header">
					<h4>${book.book_name}</h4>
					<span class="book-class">${book.class_name}</span>
				</div>
				<div class="book-subject">${book.subject_name}</div>
				<div class="book-progress">
					<div class="progress-bar"><div class="progress-fill" style="width: ${pct}%"></div></div>
					<div class="progress-text">${book.completed_pages} / ${book.total_pages} (${pct}%)</div>
				</div>
				<div class="book-stats">
					<div class="stat"><span class="label">Completed:</span><span class="value">${book.completed_pages}</span></div>
					<div class="stat"><span class="label">Remaining:</span><span class="value">${remaining}</span></div>
				</div>
				<div class="book-actions">
					<button class="btn btn-secondary btn-small" onclick="editBookDetails(${book.id})"><i class="fas fa-edit"></i> ${t('editDetails')}</button>
					<button class="btn btn-primary btn-small" onclick="updateBookProgress(${book.id})"><i class="fas fa-chart-line"></i> ${t('updateProgress')}</button>
					<button class="btn btn-secondary btn-small" onclick="viewProgressHistory(${book.id}, '${book.book_name}')"><i class="fas fa-history"></i> History</button>
					<button class="btn btn-danger btn-small" onclick="deleteBookProgress(${book.id})"><i class="fas fa-trash"></i> ${t('deleteBook')}</button>
				</div>
			</div>
		`;
	}).join('');
}

async function viewProgressHistory(progressId, bookName) {
	try {
		const response = await fetch(`/api/education/${progressId}/history`);
		let history = [];
		if (response.ok) {
			history = await response.json();
		}
		const modal = document.getElementById('teachersHistoryModal');
		const title = document.getElementById('teachersHistoryTitle');
		const body = document.getElementById('teachersHistoryBody');
		if (!modal || !title || !body) return;
		title.textContent = `${bookName} - Progress History`;
		if (!history || history.length === 0) {
			body.innerHTML = '<p class="no-data">No history found.</p>';
		} else {
			body.innerHTML = history.map(h => {
				const dateStr = (h.created_at || '').toString().replace('T', ' ').replace('Z', '');
				const noteStr = h.note ? `<div class="text-xs" style="color:#7f8c8d; margin-top:4px;">${h.note}</div>` : '';
				return `<div class="list-item"><div class="list-item-info"><strong>${h.completed_pages} pages</strong><span>${dateStr}</span>${noteStr}</div></div>`;
			}).join('');
		}
		modal.style.display = 'block';
	} catch (e) {
		console.error('Failed to load progress history:', e);
		showModal('Error', 'Failed to load progress history');
	}
}

function closeProgressHistoryModal() {
	const modal = document.getElementById('teachersHistoryModal');
	if (modal) modal.style.display = 'none';
}

function renderAlerts(selectedClass) {
	const container = document.getElementById('alerts-content');
	if (!container) return;
	const studentsInClass = (window.students || []).filter(s => !selectedClass || s.class === selectedClass);
	const alerts = [];
	// Placeholder/derived alerts (since prototype used local randoms/logbook)
	const today = getTodayString();
	const todayAttendance = window.attendance && window.attendance[today] ? window.attendance[today] : {};
	const missingAttendance = studentsInClass.filter(s => !todayAttendance[s.id] || !todayAttendance[s.id].status || todayAttendance[s.id].status === 'neutral');
	if (missingAttendance.length > 0) {
		alerts.push({ type: 'info', icon: 'fas fa-clipboard-list', title: 'Unmarked Attendance', message: `${missingAttendance.length} students not marked today.` });
	}
	if (alerts.length === 0) {
		container.innerHTML = '<p class="text-sm" style="color:#666; padding:8px 0;">No alerts.</p>';
		return;
	}
	container.innerHTML = alerts.map(a => `
		<div class="list-item">
			<div class="list-item-info">
				<strong>${a.title}</strong>
				<span>${a.message}</span>
			</div>
		</div>
	`).join('');
}

function renderPerformance(students) {
	const perfEl = document.getElementById('performance-chart');
	if (!perfEl) return;
	if (!students || students.length === 0) {
		perfEl.innerHTML = '<p class="no-data">No student data</p>';
		return;
	}
	// Simple categorization based on roll for placeholder (until a score system is added)
	let mustaid = 0, mutawassit = 0, mujtahid = 0;
	students.forEach(s => {
		const roll = parseInt(s.rollNumber || '0', 10);
		if (roll % 3 === 0) mustaid++; else if (roll % 3 === 1) mutawassit++; else mujtahid++;
	});
	perfEl.innerHTML = `
		<div class="form-row">
			<div class="form-group" style="flex:1; display:flex; justify-content:space-between;"><span>মুস্তাইদ</span><strong>${mustaid}</strong></div>
			<div class="form-group" style="flex:1; display:flex; justify-content:space-between;"><span>মুতাওয়াসসিত</span><strong>${mutawassit}</strong></div>
			<div class="form-group" style="flex:1; display:flex; justify-content:space-between;"><span>মুজতাহিদ</span><strong>${mujtahid}</strong></div>
		</div>
	`;
}

function renderRecentClassLogs(selectedClass) {
	const logsEl = document.getElementById('recent-class-logs');
	if (!logsEl) return;
	logsEl.innerHTML = '<p class="no-data">No logs yet</p>';
}

function renderTeachersLogbookPlaceholder() {
	const logEl = document.getElementById('logbook-display');
	if (!logEl) return;
	logEl.innerHTML = '<p class="no-data">No teacher notes yet</p>';
}

// Prototype feature state
let teachersLogbook = JSON.parse(localStorage.getItem('teachersLogbook_v3')) || {};
let studentScores = JSON.parse(localStorage.getItem('studentScores_v3')) || {};
let scoreChangeHistory = JSON.parse(localStorage.getItem('scoreChangeHistory_v1')) || {};
let currentClass = null;
let currentLogTab = 'class';
let currentStudentIdForProfile = null;

function renderTodaySummaryProto(students) {
	const total = students.length;
	const today = getTodayString();
	const todayAttendance = window.attendance && window.attendance[today] ? window.attendance[today] : {};
	let present = 0;
	let absent = 0;
	students.forEach(s => {
		const a = todayAttendance[s.id];
		if (!a || !a.status || a.status === 'neutral') return;
		if (a.status === 'present') present++;
		if (a.status === 'absent') absent++;
	});
	const rate = total > 0 ? Math.round((present / total) * 100) : 0;
	const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
	setText('class-total-students', total);
	setText('class-present-today', present);
	setText('class-absent-today', absent);
	setText('class-attendance-rate', `${rate}%`);
}

function getHusnulKhulukScore(studentId) {
	if (!studentScores[studentId]) {
		studentScores[studentId] = Math.floor(Math.random() * 61) + 40;
		localStorage.setItem('studentScores_v3', JSON.stringify(studentScores));
	}
	return studentScores[studentId];
}

function editHusnulKhuluk(studentId, currentScore) {
	document.getElementById('score-student-id').value = studentId;
	document.getElementById('new-score').value = currentScore;
	document.getElementById('score-change-reason').value = '';
	document.getElementById('score-modal').style.display = 'flex';
}

function closeScoreModal() { const m = document.getElementById('score-modal'); if (m) m.style.display = 'none'; }

function saveNewScore() {
	const studentId = document.getElementById('score-student-id').value;
	const newScore = parseInt(document.getElementById('new-score').value, 10);
	const changeReason = document.getElementById('score-change-reason').value;
	const oldScore = studentScores[studentId] || 0;
	if (!isNaN(newScore) && newScore >= 0 && newScore <= 100) {
		if (!scoreChangeHistory[studentId]) scoreChangeHistory[studentId] = [];
		scoreChangeHistory[studentId].push({ date: new Date().toISOString(), oldScore, newScore, reason: changeReason || 'N/A', changedBy: 'Teacher' });
		studentScores[studentId] = newScore;
		localStorage.setItem('studentScores_v3', JSON.stringify(studentScores));
		localStorage.setItem('scoreChangeHistory_v1', JSON.stringify(scoreChangeHistory));
		const studentsInClass = (window.students || []).filter(s => !currentClass || s.class === currentClass);
		renderClassStudentList(studentsInClass);
		renderPerformance(studentsInClass);
		closeScoreModal();
	}
}

function renderClassStudentList(students) {
	const listEl = document.getElementById('class-student-list');
	if (!listEl) return;
	if (!students || students.length === 0) {
		listEl.innerHTML = `<tr><td colspan="3" class="text-center p-4">No students in this class.</td></tr>`;
		return;
	}
	listEl.innerHTML = students.map(s => {
		const score = getHusnulKhulukScore(s.id);
		let badgeClass = 'bg-red-500';
		if (score >= 80) badgeClass = 'bg-green-500'; else if (score >= 60) badgeClass = 'bg-yellow-500';
		return `<tr class="border-b hover:bg-gray-50">
			<td class="px-4 py-2 text-center"><span onclick="editHusnulKhuluk('${s.id}', ${score})" class="text-white px-2 py-1 rounded ${badgeClass}" title="Edit score">${score}</span></td>
			<td class="px-4 py-2 font-medium">${s.rollNumber || ''}</td>
			<td onclick="showStudentProfile('${s.id}')" class="px-4 py-2 text-blue-600 hover:underline cursor-pointer">${s.name}</td>
		</tr>`;
	}).join('');
}

function renderTeachersLogbook() {
	const displayEl = document.getElementById('logbook-display');
	if (!displayEl) return;
	if (!teachersLogbook[currentClass]) teachersLogbook[currentClass] = { class_logs: [], student_logs: {} };
	let logsToShow = currentLogTab === 'class' ? teachersLogbook[currentClass].class_logs : Object.values(teachersLogbook[currentClass].student_logs).flat();
	logsToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
	if (logsToShow.length === 0) {
		displayEl.innerHTML = `<p class="text-center text-sm text-gray-500 p-4">No notes found.</p>`; return;
	}
	displayEl.innerHTML = logsToShow.map(log => {
		return `<div class="bg-gray-50 p-3 rounded-md">
			<div class="text-xs text-gray-500 mb-1">
				<span><strong>${log.type}</strong>${log.studentId ? ` (${(window.students||[]).find(s=>s.id===log.studentId)?.name || ''})` : ''}</span> - <span>${new Date(log.date).toLocaleDateString()}</span>
			</div>
			<p class="text-sm text-gray-800">${log.details}</p>
		</div>`;
	}).join('');
}

function switchLogTab(tab) { currentLogTab = tab; document.querySelectorAll('.logbook-tabs button').forEach(b => b.classList.remove('active')); const btn = document.querySelector(`.logbook-tabs button[onclick="switchLogTab('${tab}')"]`); if (btn) btn.classList.add('active'); renderTeachersLogbook(); }

function showAddLogModal(studentId = '') {
	const teachersSection = document.getElementById('teachers');
	if (!teachersSection || !teachersSection.classList.contains('active')) return;
	document.getElementById('log-id').value = '';
	document.getElementById('log-modal-title').innerText = currentClass ? `New note for "${currentClass}"` : 'New note';
	document.getElementById('log-details').value = '';
	document.getElementById('log-type').value = 'Educational';
	document.getElementById('log-student-id').value = studentId || '';
	document.getElementById('log-important').checked = false;
	document.getElementById('log-followup').checked = false;
	document.getElementById('log-modal').style.display = 'flex';
}
function closeLogModal() { const m = document.getElementById('log-modal'); if (m) m.style.display = 'none'; }
function saveLogEntry() {
	const logId = document.getElementById('log-id').value;
	const className = currentClass;
	const studentId = document.getElementById('log-student-id').value;
	const type = document.getElementById('log-type').value;
	const details = document.getElementById('log-details').value;
	const isImportant = document.getElementById('log-important').checked;
	const needsFollowup = document.getElementById('log-followup').checked;
	if (!details.trim()) { alert('Please enter details.'); return; }
	const logData = { type, details, isImportant, needsFollowup, date: new Date().toISOString() };
	if (!teachersLogbook[className]) teachersLogbook[className] = { class_logs: [], student_logs: {} };
	if (logId) {
		let updated = false;
		if (studentId) {
			const list = teachersLogbook[className].student_logs[studentId] || [];
			const idx = list.findIndex(l => l.id === logId);
			if (idx > -1) { list[idx] = { ...list[idx], ...logData }; teachersLogbook[className].student_logs[studentId] = list; updated = true; }
		} else {
			const list = teachersLogbook[className].class_logs;
			const idx = list.findIndex(l => l.id === logId);
			if (idx > -1) { list[idx] = { ...list[idx], ...logData }; updated = true; }
		}
		if (!updated) return;
	} else {
		const newLog = { id: `log_${Date.now()}`, ...logData };
		if (studentId) {
			if (!teachersLogbook[className].student_logs[studentId]) teachersLogbook[className].student_logs[studentId] = [];
			teachersLogbook[className].student_logs[studentId].push(newLog);
		} else {
			teachersLogbook[className].class_logs.push(newLog);
		}
	}
	localStorage.setItem('teachersLogbook_v3', JSON.stringify(teachersLogbook));
	renderTeachersLogbook();
	const spm = document.getElementById('student-profile-modal');
	if (spm && spm.style.display === 'flex' && (studentId || currentStudentIdForProfile)) showStudentProfile(studentId || currentStudentIdForProfile);
	closeLogModal();
}

function editLog(logId) {
	if (!teachersLogbook[currentClass]) return;
	let log = teachersLogbook[currentClass].class_logs.find(l => l.id === logId);
	let studentId;
	if (!log) {
		for (const sId in (teachersLogbook[currentClass].student_logs || {})) {
			const found = teachersLogbook[currentClass].student_logs[sId].find(l => l.id === logId);
			if (found) { log = found; studentId = sId; break; }
		}
	}
	if (!log) return;
	document.getElementById('log-id').value = log.id;
	document.getElementById('log-modal-title').innerText = 'Edit note';
	document.getElementById('log-type').value = log.type;
	document.getElementById('log-details').value = log.details;
	document.getElementById('log-student-id').value = studentId || '';
	document.getElementById('log-important').checked = log.isImportant || false;
	document.getElementById('log-followup').checked = log.needsFollowup || false;
	document.getElementById('log-modal').style.display = 'flex';
}
function deleteLog(logId) {
	if (!confirm('Delete this note?')) return;
	if (!teachersLogbook[currentClass]) return;
	let removed = false;
	const cls = teachersLogbook[currentClass].class_logs;
	const before = cls.length; teachersLogbook[currentClass].class_logs = cls.filter(l => l.id !== logId); removed = removed || (teachersLogbook[currentClass].class_logs.length < before);
	if (!removed) {
		for (const sId in (teachersLogbook[currentClass].student_logs || {})) {
			const list = teachersLogbook[currentClass].student_logs[sId];
			const bl = list.length;
			teachersLogbook[currentClass].student_logs[sId] = list.filter(l => l.id !== logId);
			if (teachersLogbook[currentClass].student_logs[sId].length < bl) { removed = true; break; }
		}
	}
	if (removed) {
		localStorage.setItem('teachersLogbook_v3', JSON.stringify(teachersLogbook));
		renderTeachersLogbook();
	}
}

function showStudentProfile(studentId) {
	const teachersSection = document.getElementById('teachers');
	if (!teachersSection || !teachersSection.classList.contains('active')) return;
	currentStudentIdForProfile = studentId;
	const student = (window.students || []).find(s => s.id === studentId);
	if (!student) return;
	document.getElementById('student-profile-title').innerText = `${student.name} - Details`;
	const score = getHusnulKhulukScore(studentId);
	const studentLogs = (teachersLogbook[student.class]?.student_logs[studentId] || []).sort((a, b) => new Date(b.date) - new Date(a.date));
	const scoreHistory = scoreChangeHistory[studentId] || [];
	const content = `
		<div class="space-y-6">
			<div class="border-b border-gray-200">
				<nav class="flex space-x-8">
					<button onclick="switchProfileTab('overview')" class="profile-tab active py-2 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">Overview</button>
					<button onclick="switchProfileTab('logs')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">Teacher Notes</button>
					<button onclick="switchProfileTab('score-history')" class="profile-tab py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">Score History</button>
				</nav>
			</div>
			<div id="profile-overview" class="profile-tab-content">
				<div class="bg-gray-50 p-4 rounded-lg mb-4">
					<h4 class="font-semibold text-gray-700 mb-3">At a glance</h4>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div><div class="text-lg font-bold text-green-600">95%</div><div class="text-xs text-gray-500">Attendance</div></div>
						<div><div class="text-lg font-bold text-blue-600">${score}</div><div class="text-xs text-gray-500">Husnul Khuluq</div></div>
						<div><div class="text-lg font-bold text-purple-600">${studentLogs.length}</div><div class="text-xs text-gray-500">Notes</div></div>
						<div><div class="text-sm font-bold text-gray-700">${student.class}</div><div class="text-xs text-gray-500">Class</div></div>
					</div>
				</div>
				<div>
					<h4 class="font-semibold text-gray-700 mb-2">Basic Info</h4>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
						<p><strong>Roll:</strong> ${student.rollNumber || ''}</p>
						<p><strong>Father's Name:</strong> ${student.fatherName || ''}</p>
						<p><strong>Mobile:</strong> ${student.mobileNumber || student.mobile || ''}</p>
						<p><strong>Address:</strong> ${student.upazila || ''}${student.district ? ', ' + student.district : ''}</p>
					</div>
				</div>
			</div>
			<div id="profile-logs" class="profile-tab-content hidden">
				<div class="flex justify-between items-center mb-4">
					<h4 class="font-semibold text-gray-700">Teacher Notes (${studentLogs.length})</h4>
					<button onclick="showAddStudentLogModal('${student.id}')" class="btn-success text-white px-3 py-1 text-sm rounded-md flex items-center gap-1"><i class="fas fa-plus"></i> New Note</button>
				</div>
				<div class="space-y-3">
					${studentLogs.length > 0 ? studentLogs.map(log => `
						<div class="bg-gray-50 p-3 rounded-md">
							<div class="text-xs text-gray-500 mb-1"><strong>${log.type}</strong> - ${new Date(log.date).toLocaleDateString()}</div>
							<p class="text-sm text-gray-800">${log.details}</p>
						</div>`).join('') : '<p class="text-sm text-gray-500 text-center p-4">No notes.</p>'}
				</div>
			</div>
			<div id="profile-score-history" class="profile-tab-content hidden">
				<div class="flex justify-between items-center mb-4"><h4 class="font-semibold text-gray-700">Score History</h4><button onclick="editHusnulKhuluk('${student.id}', ${score})" class="btn-primary text-white px-3 py-1 text-sm rounded-md">Edit Score</button></div>
				<div class="space-y-3">
					${(scoreHistory || []).length > 0 ? scoreHistory.map(change => `
						<div class="bg-gray-50 p-3 rounded-md">
							<div class="flex justify-between items-center mb-2"><div class="text-sm font-medium text-gray-700">${change.oldScore} → ${change.newScore}</div><div class="text-xs text-gray-500">${new Date(change.date).toLocaleDateString()}</div></div>
							<div class="text-xs text-gray-600"><strong>Reason:</strong> ${change.reason}</div>
						</div>`).reverse().join('') : '<p class="text-sm text-gray-500 text-center p-4">No score changes.</p>'}
				</div>
			</div>
		</div>`;
	document.getElementById('student-profile-content').innerHTML = content;
	document.getElementById('student-profile-modal').style.display = 'flex';
}
function closeStudentProfileModal() { const m = document.getElementById('student-profile-modal'); if (m) m.style.display = 'none'; }
function switchProfileTab(tabName) {
	document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.add('hidden'));
	document.querySelectorAll('.profile-tab').forEach(t => { t.classList.remove('active', 'border-blue-500', 'text-blue-600'); t.classList.add('border-transparent', 'text-gray-500'); });
	document.getElementById(`profile-${tabName}`).classList.remove('hidden');
	const activeTab = document.querySelector(`[onclick="switchProfileTab('${tabName}')"]`);
	if (activeTab) { activeTab.classList.add('active', 'border-blue-500', 'text-blue-600'); activeTab.classList.remove('border-transparent', 'text-gray-500'); }
}
function showAddStudentLogModal(studentId) { const s = (window.students || []).find(x => x.id === studentId); if (!s) return; closeStudentProfileModal(); showAddLogModal(studentId); }

async function showBookModal(bookId = null) {
	const teachersSection = document.getElementById('teachers');
	if (!teachersSection || !teachersSection.classList.contains('active')) return;
	const modal = document.getElementById('book-modal');
	const title = document.getElementById('book-modal-title');
	const deleteBtn = document.getElementById('delete-book-btn');
	const progressSection = document.getElementById('book-progress-section');
	const historySection = document.getElementById('book-progress-history-section');
	const historyList = document.getElementById('progress-history-list');
	if (bookId) {
		const book = (Settings.educationProgress || []).find(b => b.id === bookId);
		if (!book) return;
		title.innerText = 'Edit Book & Progress';
		document.getElementById('book-id').value = book.id;
		document.getElementById('book-name').value = book.book_name;
		document.getElementById('book-total-pages').value = book.total_pages;
		// Load history
		try {
			const res = await fetch(`/api/education/${book.id}/history`);
			const hist = res.ok ? await res.json() : [];
			historyList.innerHTML = hist.length > 0 ? hist.map(h => `<li class="mb-1"><div class="text-xs font-medium">${new Date(h.created_at).toLocaleString()}: ${h.completed_pages} pages</div>${h.note ? `<div class=\"text-xs text-gray-600 italic\">${h.note}</div>` : ''}</li>`).reverse().join('') : '<li>No history.</li>';
		} catch (_) { historyList.innerHTML = '<li>No history.</li>'; }
		deleteBtn.style.display = 'block';
		progressSection.style.display = 'block';
		historySection.style.display = 'block';
	} else {
		title.innerText = 'Add New Book';
		document.getElementById('book-id').value = '';
		document.getElementById('book-name').value = '';
		document.getElementById('book-total-pages').value = '';
		deleteBtn.style.display = 'none';
		progressSection.style.display = 'none';
		historySection.style.display = 'none';
		historyList.innerHTML = '';
	}
	modal.style.display = 'flex';
}
function closeBookModal() { const m = document.getElementById('book-modal'); if (m) m.style.display = 'none'; }

async function saveBook() {
	const bookId = document.getElementById('book-id').value;
	const bookName = document.getElementById('book-name').value.trim();
	const totalPages = parseInt(document.getElementById('book-total-pages').value, 10);
	const completedPagesValue = document.getElementById('book-completed-pages').value;
	const completedPages = completedPagesValue === '' ? null : parseInt(completedPagesValue, 10);
	const progressNote = document.getElementById('book-progress-note').value;
	if (!bookName || isNaN(totalPages) || totalPages <= 0) { alert('Please enter valid book name and total pages.'); return; }
	if (bookId) {
		// Update details and/or progress
		const book = (Settings.educationProgress || []).find(b => b.id == bookId);
		if (!book) return;
		// If name or total changed, update details
		if (book.book_name !== bookName || book.total_pages !== totalPages) {
			await fetch(`/api/education/${bookId}/edit`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class_name: book.class_name, subject_name: book.subject_name || 'General', book_id: book.book_id || null, book_name: bookName, total_pages: totalPages, completed_pages: book.completed_pages || 0, notes: book.notes || '' }) });
		}
		// If completed pages provided and changed, update progress with history
		if (completedPages !== null && completedPages !== book.completed_pages) {
			if (completedPages < 0 || completedPages > totalPages) { alert(`Enter a number between 0 and ${totalPages}.`); return; }
			await fetch(`/api/education/${bookId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed_pages: completedPages, notes: progressNote || '' }) });
		}
	} else {
		// Create new book entry (ensure book exists in catalog)
		let catalogBook = (window.books || []).find(b => (b.book_name || '').trim().toLowerCase() === bookName.toLowerCase());
		if (!catalogBook) {
			try {
				const classId = Settings.getClassIdByName ? Settings.getClassIdByName(currentClass) : null;
				const resp = await fetch('/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book_name: bookName, class_id: classId }) });
				if (resp.ok) { await Settings.loadBooks(); catalogBook = (window.books || []).find(b => (b.book_name || '').trim().toLowerCase() === bookName.toLowerCase()); }
			} catch (_) {}
		}
		await fetch('/api/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ class_name: currentClass || '', subject_name: 'General', book_id: catalogBook ? catalogBook.id : null, book_name: bookName, total_pages: totalPages, completed_pages: completedPages || 0, notes: progressNote || '' }) });
	}
	await Settings.loadEducationProgress();
	renderClassEducationProgress(currentClass);
	closeBookModal();
}

async function deleteBook() {
	const bookId = document.getElementById('book-id').value;
	if (!bookId) return;
	if (!confirm('Delete this book?')) return;
	await fetch(`/api/education/${bookId}`, { method: 'DELETE' });
	await Settings.loadEducationProgress();
	renderClassEducationProgress(currentClass);
	closeBookModal();
}

function renderClassEducationProgress(className) {
	const progressEl = document.getElementById('class-education-progress');
	const classProgress = (Settings.educationProgress || []).filter(p => !className || p.class_name === className);
	if (classProgress.length === 0) { progressEl.innerHTML = `<p class="text-sm text-gray-500">No books for this class.</p>`; return; }
	progressEl.innerHTML = classProgress.map(p => {
		const percentage = p.total_pages > 0 ? Math.round((p.completed_pages / p.total_pages) * 100) : 0;
		const remaining = p.total_pages - p.completed_pages;
		return `<div>
			<div class="flex justify-between items-center mb-1">
				<span onclick="showBookModal(${p.id})" class="text-sm font-medium text-gray-700 hover:text-blue-500 cursor-pointer" title="Edit book">${p.book_name}</span>
				<span class="text-xs text-gray-500">${p.completed_pages}/${remaining}</span>
			</div>
			<div class="w-full bg-gray-200 rounded-full h-2.5">
				<div class="bg-blue-500 h-2.5 rounded-full" style="width: ${percentage}%"></div>
			</div>
		</div>`;
	}).join('');
}

function printStudentProfile() {
	const student = (window.students || []).find(s => s.id === currentStudentIdForProfile);
	if (!student) return;
	const score = getHusnulKhulukScore(student.id);
	const studentLogs = (teachersLogbook[student.class]?.student_logs[student.id] || []).sort((a,b) => new Date(b.date) - new Date(a.date));
	const classProgress = (Settings.educationProgress || []).filter(p => p.class_name === student.class);
	const printContent = `<html><head><title>${student.name} - Student Report</title><script src="https://cdn.tailwindcss.com"><\/script><style> body { font-family: 'Segoe UI', sans-serif; } @media print { .no-print { display: none; } } </style></head><body class="bg-white p-8"><div class="text-center mb-8 border-b pb-4"><h1 class="text-3xl font-bold text-gray-800">Madani Maktab</h1><p class="text-lg text-gray-600">Student Overall Report</p></div><div class="mb-6"><h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">Basic Info</h2><div class="grid grid-cols-2 gap-4 text-sm"><p><strong>Name:</strong> ${student.name}</p><p><strong>Roll:</strong> ${student.rollNumber || ''}</p><p><strong>Father's Name:</strong> ${student.fatherName || ''}</p><p><strong>Class:</strong> ${student.class}</p><p><strong>Mobile:</strong> ${student.mobileNumber || student.mobile || ''}</p><p><strong>Address:</strong> ${student.upazila || ''}${student.district ? ', ' + student.district : ''}</p></div></div><div class="mb-6"><h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">At a glance</h2><div class="grid grid-cols-4 gap-4 text-center bg-gray-50 p-4 rounded-lg"><div><div class="text-2xl font-bold text-green-600">95%</div><div class="text-sm text-gray-500">Attendance</div></div><div><div class="text-2xl font-bold text-blue-600">${score}</div><div class="text-sm text-gray-500">Husnul Khuluq</div></div><div><div class="text-2xl font-bold text-purple-600">${studentLogs.length}</div><div class="text-sm text-gray-500">Notes</div></div><div><div class="text-2xl font-bold text-yellow-600">${classProgress.length}</div><div class="text-sm text-gray-500">Total Books</div></div></div></div><div class="mb-6"><h2 class="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4">Teacher Notes</h2><div class="space-y-3 text-sm">${studentLogs.length > 0 ? studentLogs.map(log => `<div class="p-2 border rounded-md"><p><strong>${log.type} (${new Date(log.date).toLocaleDateString()}):</strong> ${log.details}</p></div>`).join('') : '<p>No notes.</p>'}</div></div><div class="text-center text-xs text-gray-400 mt-8"><p>Generated on ${new Date().toLocaleString()}</p></div></body></html>`;
	const w = window.open('', '_blank'); w.document.write(printContent); w.document.close(); setTimeout(() => { w.print(); w.close(); }, 500);
}

// Hook class selection and rendering
async function selectTeachersClass() {
	currentClass = getSelectedTeachersClass();
	const studentsInClass = (window.students || []).filter(s => !currentClass || s.class === currentClass);
	renderTodaySummaryProto(studentsInClass);
	renderAlerts(currentClass);
	renderPerformance(studentsInClass);
	renderRecentClassLogs(currentClass);
	renderTeachersLogbook();
	renderClassStudentList(studentsInClass);
	await Settings.loadEducationProgress();
	renderClassEducationProgress(currentClass);
}

async function showTeachersCorner() {
	await ensureDataLoaded();
	populateTeachersClassDropdown();
	currentClass = getSelectedTeachersClass();
	const studentsInClass = (window.students || []).filter(s => !currentClass || s.class === currentClass);
	renderTodaySummaryProto(studentsInClass);
	renderAlerts(currentClass);
	renderPerformance(studentsInClass);
	renderRecentClassLogs(currentClass);
	renderTeachersLogbook();
	renderClassStudentList(studentsInClass);
	renderClassEducationProgress(currentClass);
}

// Expose additional prototype-style functions
export { editHusnulKhuluk, closeScoreModal, saveNewScore, showAddLogModal, closeLogModal, saveLogEntry, editLog, deleteLog, showStudentProfile, closeStudentProfileModal, switchProfileTab, showAddStudentLogModal, showBookModal, closeBookModal, saveBook, deleteBook }