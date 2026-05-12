* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, 
 0%, 
 100%);
    min-height: 100vh;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container {
    max-width: 500px;
    width: 100%;
}

/* Main Card */
.main-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

label {
    display: block;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
    font-size: 0.95rem;
}

input[type="text"] {
    width: 100%;
    padding: 15px;
    border: 2px solid 
;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: 'Courier New', monospace;
    margin-bottom: 15px;
}

input[type="text"]:focus {
    outline: none;
    border-color: 
;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Action Row - Button + Code Box */
.action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    align-items: center;
}

button {
    padding: 15px;
    background: linear-gradient(135deg, 
 0%, 
 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

button:active {
    transform: translateY(0);
}

/* Code Box */
.code-box {
    padding: 15px;
    background: 
;
    border: 2px dashed 
;
    border-radius: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 55px;
}

#totpCode {
    font-size: 1.8rem;
    font-weight: bold;
    color: 
;
    font-family: 'Courier New', monospace;
    letter-spacing: 3px;
}

.timer-wrapper {
    position: relative;
    width: 35px;
    height: 35px;
    flex-shrink: 0;
}

.timer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.8rem;
    font-weight: bold;
    color: 
;
}

.timer-circle {
    transform: rotate(-90deg);
}

.timer-circle circle {
    fill: none;
    stroke-width: 3;
}

.timer-circle circle:first-child {
    stroke: 
;
}

.timer-circle circle:last-child {
    stroke: 
;
    stroke-dasharray: 94.2;
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
}

.copy-hint {
    margin-top: 12px;
    color: 
;
    font-weight: 600;
    font-size: 0.85rem;
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.copy-hint.show {
    opacity: 1;
}

/* History Card */
.history-card {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 2px solid 
;
}

.history-header h2 {
    font-size: 1.2rem;
    color: #333;
}

#historyCount {
    font-size: 0.85rem;
    color: #666;
}

.history-list {
    overflow-y: auto;
    max-height: 300px;
}

.history-list::-webkit-scrollbar {
    width: 6px;
}

.history-list::-webkit-scrollbar-track {
    background: 
;
    border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb {
    background: 
;
    border-radius: 10px;
}

.empty-state {
    text-align: center;
    color: #999;
    padding: 30px 20px;
    font-style: italic;
}

.history-item {
    padding: 12px;
    background: 
;
    border-radius: 10px;
    margin-bottom: 8px;
    transition: background 0.2s;
}

.history-item:hover {
    background: 
;
}

.history-code {
    font-size: 1.3rem;
    font-weight: bold;
    color: 
;
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
    margin-bottom: 4px;
}

.history-key {
    font-size: 0.8rem;
    color: #666;
    font-family: 'Courier New', monospace;
    word-break: break-all;
}

.history-time {
    font-size: 0.7rem;
    color: #999;
    margin-top: 4px;
}

/* Responsive */
@media (max-width: 600px) {
    .action-row {
        grid-template-columns: 1fr;
    }
    
    #totpCode {
        font-size: 1.5rem;
    }
}
