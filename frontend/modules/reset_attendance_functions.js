function showResetAttendanceModal() {
    document.getElementById('resetAttendanceModal').style.display = 'block';
    document.getElementById('resetConfirmationInput').value = '';
    document.getElementById('confirmResetBtn').disabled = true;
}

function closeResetAttendanceModal() {
    document.getElementById('resetAttendanceModal').style.display = 'none';
    document.getElementById('resetConfirmationInput').value = '';
    document.getElementById('confirmResetBtn').disabled = true;
}

async function confirmResetAttendance() {
    const confirmationInput = document.getElementById('resetConfirmationInput');
    const confirmationText = confirmationInput.value.trim().toUpperCase();
    
    if (confirmationText !== 'RESET') {
        showModal(t('error'), t('attendanceResetPleaseTypeReset'));
        return;
    }
    
    // Show loading state
    const confirmBtn = document.getElementById('confirmResetBtn');
    const originalText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
    confirmBtn.disabled = true;
    
    try {
        // Reset attendance in database by sending null instead of empty object
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(null) // Send null to reset attendance
        });
        
        if (response.ok) {
            // Clear local data
            attendance = {};
            savedAttendanceDates.clear();
            
            // Close modal
            closeResetAttendanceModal();
            
            // Update UI
            updateDashboard();
            refreshAttendanceCalendarIfVisible();
            
            // Reset attendance table if currently viewing
            await loadAttendanceForDate();
            
            showModal(t('success'), t('attendanceResetSuccess'));
            
            console.log('Attendance history reset successfully');
        } else {
            const errorData = await response.text();
            console.error('Server response:', errorData);
            throw new Error('Failed to reset attendance in database');
        }
    } catch (error) {
        console.error('Error resetting attendance:', error);
        showModal(t('error'), t('attendanceResetFailed'));
        
        // Reset button state
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
    }
}

// expose functions globally
Object.assign(window, { closeResetAttendanceModal, showResetAttendanceModal });
