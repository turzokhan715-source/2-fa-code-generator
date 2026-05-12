let currentSecret = '';
let countdownInterval = null;
let history = [];

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem('totpHistory');
    if (saved) {
        try {
            history = JSON.parse(saved);
            updateHistoryDisplay();
        } catch (e) {
            console.error('Failed to load history:', e);
            history = [];
        }
    }
}

// Save history to localStorage
function saveHistory() {
    try {
        localStorage.setItem('totpHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

// Generate TOTP code
async function generateCode() {
    const secretInput = document.getElementById('secretKey');
    const secret = secretInput.value.trim().toUpperCase().replace(/\s/g, '');
    
    if (!secret) {
        alert('⚠️ Please enter a secret key!');
        return;
    }
    
    try {
        // Generate code (AWAIT added here!)
        const code = await generateTOTP(secret);
        currentSecret = secret;
        
        // Display code
        document.getElementById('totpCode').textContent = code;
        document.getElementById('timerWrapper').style.display = 'flex';
        
        // Auto-copy to clipboard
        copyToClipboard(code);
        
        // Clear input field
        secretInput.value = '';
        
        // Add to history
        addToHistory(secret, code);
        
        // Start countdown
        startCountdown();
        
    } catch (error) {
        alert('❌ Invalid secret key! Please check and try again.');
        console.error('Generation error:', error);
    }
}

// Copy to clipboard with visual feedback
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyHint();
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showCopyHint();
    } catch (err) {
        console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textarea);
}

// Show copy hint
function showCopyHint() {
    const hint = document.getElementById('copyHint');
    hint.classList.add('show');
    setTimeout(() => {
        hint.classList.remove('show');
    }, 2000);
}

// Start 30-second countdown
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const now = Math.floor(Date.now() / 1000);
    let remaining = 30 - (now % 30);
    
    updateTimer(remaining);
    
    countdownInterval = setInterval(async () => {
        const now = Math.floor(Date.now() / 1000);
        remaining = 30 - (now % 30);
        
        updateTimer(remaining);
        
        // Auto-refresh code when timer hits 0
        if (remaining === 30 && currentSecret) {
            const newCode = await generateTOTP(currentSecret);
            document.getElementById('totpCode').textContent = newCode;
            addToHistory(currentSecret, newCode);
        }
    }, 1000);
}

// Update timer display
function updateTimer(seconds) {
    document.getElementById('timer').textContent = seconds;
    
    const circle = document.getElementById('timerProgress');
    const circumference = 87.96;
    const offset = circumference - (seconds / 30) * circumference;
    circle.style.strokeDashoffset = offset;
}

// Add code to history
function addToHistory(secret, code) {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
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
    
    historyCount.textContent = `${history.length} saved`;
    
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
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});
