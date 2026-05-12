let currentCode = null;
let timerInterval = null;
let history = [];

window.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    updateHistoryDisplay();
    document.getElementById('generateBtn').addEventListener('click', generateCode);
    document.getElementById('secretKey').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') generateCode();
    });
});

async function generateCode() {
    const secretKey = document.getElementById('secretKey').value.trim();
    if (!secretKey) {
        showToast('Please enter a 2FA secret key!', 'error');
        return;
    }
    try {
        const cleanKey = secretKey.replace(/\s+/g, '');
        const code = await generateTOTP(cleanKey);
        currentCode = code;
        document.getElementById('miniCode').textContent = formatCode(code);
        document.getElementById('codeDisplay').textContent = formatCode(code);
        document.getElementById('codeSection').style.display = 'block';
        await navigator.clipboard.writeText(code);
        addToHistory(code);
        startTimer();
        showToast('Code generated and copied!', 'success');
    } catch (error) {
        showToast('Invalid 2FA key!', 'error');
    }
}

function formatCode(code) {
    return code.slice(0,3) + ' ' + code.slice(3);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const remaining = getTimeRemaining();
    document.getElementById('timer').textContent = 'Valid for: ' + remaining + ' seconds';
    if (remaining === 30) {
        const secretKey = document.getElementById('secretKey').value.trim();
        if (secretKey && currentCode) generateCode();
    }
}

function copyCode() {
    if (currentCode) {
        navigator.clipboard.writeText(currentCode);
        showToast('Code copied!', 'success');
    }
}

function copyFromHistory(code) {
    navigator.clipboard.writeText(code);
    showToast('Copied from history!', 'success');
}

function addToHistory(code) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',hour12:true});
    history.unshift({code, timestamp, date:now.getTime()});
    if (history.length > 50) history = history.slice(0,50);
    saveHistory();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');
    const clearBtn = document.getElementById('clearBtn');
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No codes generated yet</p>';
        clearBtn.style.display = 'none';
        historyCount.textContent = '0 codes saved';
        return;
    }
    historyCount.textContent = history.length + ' code' + (history.length > 1 ? 's' : '') + ' saved';
    clearBtn.style.display = 'block';
    historyList.innerHTML = history.map(item => 
        '<div class="history-item"><span class="history-time">' + item.timestamp + 
        '</span><span class="history-code">' + formatCode(item.code) + 
        '</span><button class="history-copy-btn" onclick="copyFromHistory(\'' + item.code + '\')">Copy</button></div>'
    ).join('');
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        history = [];
        saveHistory();
        updateHistoryDisplay();
        showToast('History cleared!', 'success');
    }
}

function saveHistory() {
    try {
        localStorage.setItem('2fa_history', JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save history');
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('2fa_history');
        if (saved) history = JSON.parse(saved);
    } catch (error) {
        history = [];
    }
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'error' ? '
' : '
';
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}