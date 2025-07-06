document.addEventListener('DOMContentLoaded', () => {
    // Load user data and initialize dashboard
    loadUserData();
    setupModeSwitcher();
    setupLogout();
});

async function loadUserData() {
    try {
        const response = await fetch('/user');
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        updateDashboardUI(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function updateDashboardUI(userData) {
    // Update welcome message
    document.getElementById('welcomeMessage').textContent = 
        `Welcome back, ${userData.name || 'Student'}`;
    
    // Update study stats
    document.getElementById('studyStreak').textContent = userData.streak || '0';
    document.getElementById('weeklyHours').textContent = userData.weekly_hours || '0';
}

function setupModeSwitcher() {
    const modeLinks = document.querySelectorAll('[data-mode]');
    const modeContent = document.getElementById('modeContent');
    
    modeLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const mode = e.target.getAttribute('data-mode');
            
            // Highlight active mode
            modeLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            // Load mode content
            try {
                const response = await fetch(`/modes/${mode}`);
                if (!response.ok) throw new Error('Failed to load mode');
                
                modeContent.innerHTML = await response.text();
                
                // Initialize mode-specific JS
                switch(mode) {
                    case 'pomodoro':
                        import('./pomodoro.js');
                        break;
                    case 'flashcards':
                        import('./flashcards.js');
                        break;
                    case 'language':
                        import('./language.js');
                        break;
                    case 'chat':
                        import('./chatbot.js');
                        break;
                }
            } catch (error) {
                console.error(`Error loading ${mode} mode:`, error);
                modeContent.innerHTML = `
                    <div class="error-card">
                        <h3>Failed to load ${mode.replace('-', ' ')}</h3>
                        <p>Please try again later</p>
                    </div>
                `;
            }
        });
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/index.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}