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

async function selectTeachersClass() {
	const selectedClass = getSelectedTeachersClass();
	renderClassSummary(selectedClass);
	renderStudentsList(selectedClass);
	// Reload progress list after ensuring latest data
	await ensureDataLoaded();
	renderClassEducationProgress(selectedClass);
}

async function showTeachersCorner() {
	await ensureDataLoaded();
	populateTeachersClassDropdown();
	const selectedClass = getSelectedTeachersClass();
	renderClassSummary(selectedClass);
	renderStudentsList(selectedClass);
	renderClassEducationProgress(selectedClass);
}

// Exports
export { showTeachersCorner, selectTeachersClass, viewProgressHistory, closeProgressHistoryModal }