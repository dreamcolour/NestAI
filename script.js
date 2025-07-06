// Main application module
class NestAI {
    constructor() {
        this.apiKey = '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';
        this.timer = {
            interval: null,
            timeLeft: 25 * 60,
            isRunning: false,
            mode: 'pomodoro'
        };
        this.chatHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTimer();
        this.setupHeatmap();
        this.checkFirstVisit();
    }

    setupEventListeners() {
        // Timer controls
        document.getElementById('start-timer').addEventListener('click', this.startTimer.bind(this));
        document.getElementById('pause-timer').addEventListener('click', this.pauseTimer.bind(this));
        document.getElementById('reset-timer').addEventListener('click', this.resetTimer.bind(this));

        // Timer modes
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setTimerMode(e.target.dataset.time);
            });
        });

        // Chat controls
        document.getElementById('send-message').addEventListener('click', this.sendMessage.bind(this));
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('clear-chat').addEventListener('click', this.clearChat.bind(this));

        // API key modal
        document.getElementById('confirm-api').addEventListener('click', () => {
            document.getElementById('api-key-modal').classList.remove('active');
            localStorage.setItem('nestai-first-visit', 'false');
        });

        // Theme toggle
        document.getElementById('theme-switch').addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-theme', e.target.checked ? 'light' : 'dark');
        });
    }

    checkFirstVisit() {
        const firstVisit = localStorage.getItem('nestai-first-visit') !== 'false';
        if (firstVisit) {
            document.getElementById('api-key-modal').classList.add('active');
        }
    }

    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.isRunning = true;
            this.timer.interval = setInterval(() => {
                this.timer.timeLeft--;
                this.renderTimer();
                
                if (this.timer.timeLeft <= 0) {
                    clearInterval(this.timer.interval);
                    this.timer.isRunning = false;
                    this.showToast('Timer completed! Take a break.');
                    this.playNotificationSound();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            clearInterval(this.timer.interval);
            this.timer.isRunning = false;
        }
    }

    resetTimer() {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.setTimerMode(this.timer.mode === 'pomodoro' ? 25 : (this.timer.mode === 'short' ? 15 : 30));
    }

    setTimerMode(minutes) {
        this.timer.timeLeft = minutes * 60;
        this.timer.mode = minutes === 25 ? 'pomodoro' : (minutes === 15 ? 'short' : 'long');
        this.renderTimer();
    }

    renderTimer() {
        const minutes = Math.floor(this.timer.timeLeft / 60);
        const seconds = this.timer.timeLeft % 60;
        document.querySelector('.focus-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress ring
        const totalTime = this.timer.mode === 'pomodoro' ? 25 * 60 : 
                         (this.timer.mode === 'short' ? 15 * 60 : 30 * 60);
        const progress = (this.timer.timeLeft / totalTime) * 283;
        document.querySelector('.ring-progress').style.strokeDashoffset = progress;
    }

    setupHeatmap() {
        const ctx = document.getElementById('heatmap-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Focus Time (min)',
                    data: [45, 60, 30, 75, 90, 20, 0],
                    backgroundColor: [
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)'
                    ],
                    borderColor: [
                        'rgba(46, 125, 50, 1)',
                        'rgba(46, 125, 50, 1)',
                        'rgba(46, 125, 50, 1)',
                        'rgba(46, 125, 50, 1)',
                        'rgba(46, 125, 50, 1)',
                        'rgba(46, 125, 50, 1)',
                        'rgba(46, 125, 50, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessageToChat('user', message);
        input.value = '';
        
        // Check if message is for Nester
        if (message.toLowerCase().includes('@nester')) {
            try {
                const response = await this.askNester(message.replace('@nester', '').trim());
                const content = response.choices[0].message.content;
                this.addMessageToChat('nester', content);
            } catch (error) {
                console.error('Error contacting Nester:', error);
                this.addMessageToChat('nester', "I'm having trouble connecting right now. Please try again later.");
                this.showToast('Nester is unavailable. Check your connection.');
            }
        }
    }

    async askNester(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are Nester, a friendly study assistant with Japanese aesthetic. Provide concise, helpful responses to student queries. Use markdown for formatting when appropriate. Keep responses under 200 words."
                }, {
                    role: "user",
                    content: prompt
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        return await response.json();
    }

    addMessageToChat(sender, content) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = sender === 'user' ? 'Y' : 'N';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Use marked to parse markdown if it's from Nester
        if (sender === 'nester') {
            contentDiv.innerHTML = marked.parse(content);
        } else {
            contentDiv.innerHTML = `<p>${content}</p>`;
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to history
        this.chatHistory.push({ sender, content });
    }

    clearChat() {
        document.getElementById('chat-messages').innerHTML = `
            <div class="message nester-message">
                <div class="message-avatar">N</div>
                <div class="message-content">
                    <p>こんにちは! I'm Nester, your study companion. How can I assist you today?</p>
                </div>
            </div>
        `;
        this.chatHistory = [];
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    playNotificationSound() {
        // In a real app, you would play a sound here
        console.log('Notification sound played');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new NestAI();
});

// Service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}