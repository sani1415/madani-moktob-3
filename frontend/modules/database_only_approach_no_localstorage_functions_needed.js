
function saveData() {
    // Database-only approach - data is automatically saved to database via API calls
    // No localStorage saving needed
    console.log('Data saved to database via API calls');
}

function showModal(title, message) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="closeModal()" class="btn btn-primary">${t('ok')}</button>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function showEncodingErrorModal(message) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3 style="color: #e74c3c;">🔤 Bengali Text Encoding Error</h3>
        <div style="
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 15px 0;
            white-space: pre-line;
            line-height: 1.6;
            text-align: left;
            font-size: 14px;
            color: #856404;
        ">${message}</div>
        <button onclick="closeModal()" class="btn btn-primary">${t('ok')}</button>
    `;
    
    modal.style.display = 'block';
}

// Export functions for module imports
export { showModal, closeModal, saveData, showEncodingErrorModal };

// Also expose functions globally for backward compatibility
Object.assign(window, { closeModal, saveData, showEncodingErrorModal, showModal });
