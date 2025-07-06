const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const tipDisplay = document.getElementById('tipDisplay');
const progressCircle = document.getElementById('progressCircle');

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes
let timeLeft = WORK_DURATION;
let isWorking = true;
let timerInterval = null;
let circumference = 2 * Math.PI * 90;

progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

function updateTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
    
    // Update progress circle
    const progress = isWorking 
        ? 1 - (seconds / WORK_DURATION)
        : 1 - (seconds / BREAK_DURATION);
    const offset = circumference - progress * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function startTimer() {
    if (timerInterval) return;
    
    startBtn.textContent = 'Pause';
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            // Switch mode
            isWorking = !isWorking;
            timeLeft = isWorking ? WORK_DURATION : BREAK_DURATION;
            
            // Update UI
            document.querySelector('.timer-label').textContent = 
                isWorking ? 'Focus Time' : 'Break Time';
            
            // Get new tip
            fetchPomodoroTip();
            
            // Restart automatically
            setTimeout(startTimer, 2000);
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.textContent = 'Resume';
}

async function fetchPomodoroTip() {
    try {
        const response = await fetch('/pomodoro/tip');
        const data = await response.json();
        tipDisplay.textContent = data.tip;
        tipDisplay.classList.add('pulse');
        setTimeout(() => tipDisplay.classList.remove('pulse'), 2000);
    } catch (error) {
        tipDisplay.textContent = "Stay focused! You're doing great!";
    }
}

startBtn.addEventListener('click', () => {
    if (timerInterval) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener('click', () => {
    pauseTimer();
    timeLeft = isWorking ? WORK_DURATION : BREAK_DURATION;
    updateTimerDisplay(timeLeft);
});

// Initial setup
updateTimerDisplay(timeLeft);
fetchPomodoroTip();