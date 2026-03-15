const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const statusText = document.getElementById('status');
const circle = document.querySelector('.progress-ring__circle');
const timerCard = document.querySelector('.timer-card');

const CACHED_TIME = 25 * 60; // 25 minutes
let timeLeft = CACHED_TIME;
let isRunning = false;
let timerId = null;

// Icons
const playIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>`;
const pauseIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="currentColor"/></svg>`;

// Circle Math
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = 0;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    // We want the ring to decrease as time goes down, so offset increases. 
    // at 100% time left, offset = 0. at 0% time left, offset = circumference.
    circle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update document title for background tracking
    if (isRunning) {
        document.title = `${timeDisplay.textContent} - Focus`;
    } else {
        document.title = `Modern Pomodoro Timer`;
    }
    
    const percent = (timeLeft / CACHED_TIME) * 100;
    setProgress(percent);
}

function playNotification() {
    // Generate an elegant notification chime using Web Audio API
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        
        const playTone = (freq, startTime, duration) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
            
            // Envelope
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
            gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start(audioCtx.currentTime + startTime);
            oscillator.stop(audioCtx.currentTime + startTime + duration);
        };

        // Elegant melodic chime
        playTone(523.25, 0, 0.8);    // C5
        playTone(659.25, 0.15, 0.8); // E5
        playTone(783.99, 0.3, 1.2);  // G5
        playTone(1046.50, 0.45, 1.5); // C6
    } catch (e) {
        console.warn("AudioContext block/error", e);
    }
}

function toggleTimer() {
    // Need to initialize AudioContext on user interaction if we want to play sound later
    if (isRunning) {
        // Pause
        clearInterval(timerId);
        isRunning = false;
        startBtn.innerHTML = playIcon;
        statusText.textContent = "Paused";
        circle.style.stroke = "#f43f5e";
    } else {
        // Start
        if (timeLeft === 0) resetTimer(); // Auto reset if starting from 0
        
        isRunning = true;
        startBtn.innerHTML = pauseIcon;
        statusText.textContent = "Focus Time";
        timerCard.classList.remove('timer-done');
        circle.style.stroke = "#f43f5e";
        
        // Timer tick
        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            }
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                startBtn.innerHTML = playIcon;
                statusText.textContent = "Session Complete!";
                timerCard.classList.add('timer-done');
                circle.style.stroke = "#10b981"; // Emerald green on finish
                updateDisplay();
                playNotification();
            }
        }, 1000); // Intentionally 1000ms for realistic timer
    }
    updateDisplay();
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = CACHED_TIME;
    startBtn.innerHTML = playIcon;
    statusText.textContent = "Focus Time";
    timerCard.classList.remove('timer-done');
    circle.style.stroke = "#f43f5e";
    updateDisplay();
}

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize
updateDisplay();
