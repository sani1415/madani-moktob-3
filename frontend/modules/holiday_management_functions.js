function addHoliday() {
    const startDateInput = document.getElementById('holidayStartDate');
    const endDateInput = document.getElementById('holidayEndDate');
    const nameInput = document.getElementById('holidayName');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const name = nameInput.value.trim();
    
    if (!startDate || !name) {
        showModal(t('error'), 'Please enter holiday start date and name');
        return;
    }
    
    // If no end date is provided, use start date (single day holiday)
    const finalEndDate = endDate || startDate;
    
    // Validate date range
    if (new Date(startDate) > new Date(finalEndDate)) {
        showModal(t('error'), 'Start date cannot be after end date');
        return;
    }
    
    // Check if any date in the range conflicts with existing holidays
    const conflictingHoliday = holidays.find(h => {
        const existingStart = new Date(h.startDate);
        const existingEnd = new Date(h.endDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(finalEndDate);
        
        return (newStart <= existingEnd && newEnd >= existingStart);
    });
    
    if (conflictingHoliday) {
        showModal(t('error'), 'Holiday dates conflict with existing holiday: ' + conflictingHoliday.name);
        return;
    }
    
    holidays.push({ 
        startDate, 
        endDate: finalEndDate, 
        name,
        // Keep legacy date field for compatibility
        date: startDate
    });
    holidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    saveData();
    displayHolidays();
    
    // Clear inputs
    startDateInput.value = '';
    endDateInput.value = '';
    nameInput.value = '';
    
    const dayCount = Math.ceil((new Date(finalEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    showModal(t('success'), `Holiday added successfully (${dayCount} day${dayCount > 1 ? 's' : ''})`);
}

function deleteHoliday(index) {
    holidays.splice(index, 1);
    saveData();
    displayHolidays();
    showModal(t('success'), 'Holiday deleted successfully');
}

function displayHolidays() {
    const holidaysList = document.getElementById('holidaysList');
    if (!holidaysList) return;
    
    if (holidays.length === 0) {
        holidaysList.innerHTML = '<p>No holidays configured.</p>';
        return;
    }
    
    holidaysList.innerHTML = holidays.map((holiday, index) => {
        const startDate = holiday.startDate || holiday.date;
        const endDate = holiday.endDate || holiday.date;
        const isRange = startDate !== endDate;
        const dayCount = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
        
        return `
            <div class="holiday-item">
                <div class="holiday-info">
                    <strong>${holiday.name}</strong>
                    <span class="holiday-date">
                        ${isRange ? `${startDate} to ${endDate} (${dayCount} days)` : startDate}
                    </span>
                </div>
                <button onclick="deleteHoliday(${index})" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function isHoliday(date) {
    if (!holidays || holidays.length === 0) return false;
    
    return holidays.some(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        
        // Handle both date strings and date objects
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        // Convert to date strings for comparison (YYYY-MM-DD format)
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
}

function getHolidayName(date) {
    if (!holidays || holidays.length === 0) return '';
    
    const holiday = holidays.find(h => {
        const startDate = h.startDate || h.date;
        const endDate = h.endDate || h.date;
        
        // Handle both date strings and date objects
        let checkDate;
        if (typeof date === 'string') {
            checkDate = new Date(date);
        } else {
            checkDate = date;
        }
        
        // Convert to date strings for comparison (YYYY-MM-DD format)
        const checkDateStr = checkDate.toISOString().split('T')[0];
        const startDateStr = new Date(startDate).toISOString().split('T')[0];
        const endDateStr = new Date(endDate).toISOString().split('T')[0];
        
        return checkDateStr >= startDateStr && checkDateStr <= endDateStr;
    });
    return holiday ? holiday.name : '';
}

// expose functions globally
Object.assign(window, { addHoliday, deleteHoliday, displayHolidays, getHolidayName, isHoliday });
