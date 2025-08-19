// This will be the main module for the Teachers' Corner
async function initializeTeachersCorner() {
    const content = document.getElementById('teachers-corner-content');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch('/api/teachers-corner');
        const data = await response.json();

        if (response.ok) {
            if (data.length === 0) {
                content.innerHTML = '<p>No data available in the Teachers\' Corner yet.</p>';
            } else {
                content.innerHTML = `
                    <div class="teachers-corner-grid">
                        ${data.map(item => `
                            <div class="teachers-corner-item">
                                <h3>${item.title}</h3>
                                <p>${item.content}</p>
                                <span class="category-badge">${item.category}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } else {
            content.innerHTML = `<p>Error: ${data.error}</p>`;
        }
    } catch (error) {
        content.innerHTML = '<p>Failed to load data. Please try again later.</p>';
        console.error('Error fetching Teachers\' Corner data:', error);
    }
}

export { initializeTeachersCorner };