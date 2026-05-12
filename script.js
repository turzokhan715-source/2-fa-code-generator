let currentSecret = '';
let countdownInterval = null;
let history = [];

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem('totpHistory');
    if (saved) {
        history = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('totpHistory', JSON.stringify(history));
}

// Generate TOTP code
function generateCode() {
    const secretInput = document.getElementById('secretKey');
    const secret = secretInput.value.trim().toUpperCase().replace(/\s/g, '');
    
    if (!secret) {
        alert('Please enter a secret key!');
        return;
    }
    
    try {
        const code = generateTOTP(secret);
        currentSecret = secret;
        
        // Display code
        document.getElementById('totpCode').textContent = code;
        document.getElementById('timerWrapper').style.display = 'block';
        
        // Auto-copy to clipboard
        copyToClipboard(code);
        
        // Clear input field
        secretInput.value = '';
        
        // Add to history
        addToHistory(secret, code);
        
        // Start countdown
        startCountdown();
        
    } catch (error) {
        alert('Invalid secret key! Please check and try again.');
        console.error(error);
    }
}

// Copy to clipboard with visual feedback
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const hint = document.getElementById('copyHint');
        hint.classList.add('show');
        setTimeout(() => {
            hint.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Start 30-second countdown
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const now = Math.floor(Date.now() / 1000);
    let remaining = 30 - (now % 30);
    
    updateTimer(remaining);
    
    countdownInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        remaining = 30 - (now % 30);
        
        updateTimer(remaining);
        
        // Auto-refresh code when timer hits 0
        if (remaining === 30 && currentSecret) {
            const newCode = generateTOTP(currentSecret);
            document.getElementById('totpCode').textContent = newCode;
            addToHistory(currentSecret, newCode);
        }
    }, 1000);
}

// Update timer display
function updateTimer(seconds) {
    document.getElementById('timer').textContent = seconds;
    
    const circle = document.getElementById('timerProgress');
    const circumference = 94.2;
    const offset = circumference - (seconds / 30) * circumference;
    circle.style.strokeDashoffset = offset;
}

// Add code to history
function addToHistory(secret, code) {
    const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Add to beginning of array
    history.unshift({
        secret: secret,
        code: code,
        time: timestamp
    });
    
    // Keep only last 50
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    saveHistory();
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    
    historyCount.textContent = `${history.length} codes saved`;
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No codes generated yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-code">${item.code}</div>
            <div class="history-key">Key: ${item.secret}</div>
            <div class="history-time">${item.time}</div>
        </div>
    `).join('');
}

// Allow Enter key to generate
document.getElementById('secretKey').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateCode();
    }
});

// Load history on page load
loadHistory();
