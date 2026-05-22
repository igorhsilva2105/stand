const terminalOutput = document.getElementById('terminal-output');

// Registrando o Service Worker (Opcional, mas recomendado para PWAs reais no futuro)
if ('serviceWorker' in navigator) {
    // Isso é apenas um stub, para a PWA ser instalável sem erros no Lighthouse
    // Para funcionar offline real, você precisaria de um arquivo service-worker.js
    console.log("Service Worker supported.");
}

// Material 3 Dynamic Themes
const m3Themes = {
    lavender: { bg: '#141218', surface: '#211F26', surfaceContainer: '#36343B', primary: '#D0BCFF', tertiary: '#F2B8B5', text: '#E6E0E9' },
    mint:     { bg: '#0F1714', surface: '#192823', surfaceContainer: '#2D3E38', primary: '#80D8BA', tertiary: '#A8C7FA', text: '#E0E3E1' },
    rose:     { bg: '#200F10', surface: '#2C1516', surfaceContainer: '#452A2A', primary: '#FFB4AB', tertiary: '#E2C36D', text: '#F4DDDD' },
    ocean:    { bg: '#111418', surface: '#1A2027', surfaceContainer: '#2B343D', primary: '#A8C7FA', tertiary: '#C6BFFF', text: '#E2E2E5' }
};

// Mock File System
let currentPath = '~';
const fileSystem = {
    '~': {
        type: 'dir',
        contents: {
            'documents': { type: 'dir', contents: {
                'material_guidelines.txt': { type: 'file', content: 'Material 3 Expressive emphasizes dynamic color, playful shapes, and adaptable typography.' },
                'passwords.bak': { type: 'file', content: 'admin: android16\nroot: expressive_ui' }
            }},
            'media': { type: 'dir', contents: {
                'ringtone.ogg': { type: 'file', content: '[AUDIO BINARY DATA]' }
            }},
            'readme.md': { type: 'file', content: 'Welcome to Android Expressive Terminal.\nType "help" for a list of commands.' },
            'system.log': { type: 'file', content: 'Material You engine initialized...\nDynamic colors generated.' }
        }
    }
};

const commandHistory = [];
let historyIndex = -1;
let currentInputContainer = null;
let currentInput = null;
let currentDisplay = null;

const bootSequence = [
    { text: "Initializing Android 16 Environment...", class: "log-system", delay: 300 },
    { text: "Loading Material 3 Expressive UI...", class: "log-system", delay: 200 },
    { text: "Generating dynamic color tokens... [OK]", class: "log-system", delay: 400 },
    { text: "System UI is ready.", class: "log-info", delay: 300 },
    { text: "Type 'help' to see available commands.", class: "log-main", delay: 100 }
];

function focusInput() {
    if(currentInput) currentInput.focus();
}

async function runBootSequence() {
    for (const step of bootSequence) {
        await new Promise(r => setTimeout(r, step.delay));
        printLog(step.text, step.class);
    }
    createNewInputLine();
}

function printLog(text, className = '') {
    const line = document.createElement('div');
    line.className = `log-line ${className}`;
    line.innerHTML = text.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    terminalOutput.insertBefore(line, currentInputContainer);
    scrollToBottom();
}

function scrollToBottom() {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function getPromptHTML() {
    return `
        <div class="prompt-chip">
            <span class="prompt-user">user</span>
            <span class="prompt-divider">/</span>
            <span class="prompt-path">${currentPath}</span>
        </div>`;
}

function getDirFromPath(path) {
    if (path === '~') return fileSystem['~'];
    let currentDir = fileSystem['~'];
    if (path.startsWith('~/')) {
        const parts = path.substring(2).split('/');
        for (let part of parts) {
            if (currentDir.contents && currentDir.contents[part] && currentDir.contents[part].type === 'dir') {
                currentDir = currentDir.contents[part];
            } else {
                return null;
            }
        }
    }
    return currentDir;
}

function createNewInputLine() {
    if (currentInputContainer) {
        const oldCursor = currentInputContainer.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();
        if(currentInput) currentInput.disabled = true;
    }

    const container = document.createElement('div');
    container.className = 'input-line';
    container.innerHTML = getPromptHTML();

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';

    const display = document.createElement('span');
    display.className = 'input-display';
    
    const cursor = document.createElement('span');
    cursor.className = 'cursor';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'cmd-input';
    input.autocomplete = 'off';
    input.spellcheck = false;

    input.addEventListener('input', () => {
        display.textContent = input.value;
        scrollToBottom();
    });

    input.addEventListener('keydown', handleKeyDown);

    wrapper.appendChild(display);
    wrapper.appendChild(cursor);
    wrapper.appendChild(input);
    container.appendChild(wrapper);

    terminalOutput.appendChild(container);
    
    currentInputContainer = container;
    currentInput = input;
    currentDisplay = display;
    
    setTimeout(() => input.focus(), 10);
    scrollToBottom();
}

function handleKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = currentInput.value.trim();
        
        const staticContainer = document.createElement('div');
        staticContainer.className = 'input-line';
        staticContainer.style.marginTop = '4px';
        staticContainer.style.marginBottom = '4px';
        staticContainer.innerHTML = `${getPromptHTML()} <span class="input-display" style="padding-top:4px;">${cmd}</span>`;
        terminalOutput.insertBefore(staticContainer, currentInputContainer);

        if (cmd) {
            commandHistory.push(cmd);
            historyIndex = commandHistory.length;
            processCommand(cmd);
        } else {
            createNewInputLine();
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            currentInput.value = commandHistory[historyIndex];
            currentDisplay.textContent = currentInput.value;
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            currentInput.value = commandHistory[historyIndex];
            currentDisplay.textContent = currentInput.value;
        } else {
            historyIndex = commandHistory.length;
            currentInput.value = '';
            currentDisplay.textContent = '';
        }
    }
}

function processCommand(rawCmd) {
    const args = rawCmd.split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case 'help':
            printLog(`Available commands:
  help      - Show this message
  clear     - Clear terminal output
  ls        - List directory contents
  cd [dir]  - Change directory
  cat [file]- Display file contents
  date      - Show current system date
  theme     - Change Material You theme (lavender, mint, rose, ocean)
  express   - Trigger expressive shape animation`);
            break;
        case 'clear':
            terminalOutput.innerHTML = '';
            currentInputContainer = null;
            break;
        case 'date':
            printLog(new Date().toString(), 'log-info');
            break;
        case 'ls':
            executeLs(args);
            break;
        case 'cd':
            executeCd(args);
            break;
        case 'cat':
            executeCat(args);
            break;
        case 'theme':
            executeTheme(args);
            break;
        case 'express':
            document.getElementById('app').style.animation = 'express 2s ease-in-out';
            setTimeout(() => { document.getElementById('app').style.animation = ''; }, 2000);
            printLog('Applying expressive shapes...', 'log-warning');
            break;
        default:
            printLog(`Command not found: ${cmd}`, 'log-error');
    }
    
    createNewInputLine();
}

function executeLs(args) {
    const dir = getDirFromPath(currentPath);
    if (!dir || !dir.contents) {
        printLog('Cannot read directory.', 'log-error');
        return;
    }
    const items = Object.keys(dir.contents);
    if (items.length === 0) return;
    
    let output = '';
    items.forEach(item => {
        const type = dir.contents[item].type;
        if (type === 'dir') {
            output += `<span style="color: var(--md-tertiary); font-weight:bold; background: var(--md-surface-container); padding: 2px 8px; border-radius: 8px; margin-right: 8px;">${item}/</span> `;
        } else {
            output += `<span style="margin-right: 12px;">${item}</span>`;
        }
    });
    
    const div = document.createElement('div');
    div.className = `log-line`;
    div.style.display = 'flex';
    div.style.flexWrap = 'wrap';
    div.style.gap = '8px';
    div.style.marginTop = '4px';
    div.innerHTML = output;
    terminalOutput.insertBefore(div, currentInputContainer);
    scrollToBottom();
}

function executeCd(args) {
    if (args.length < 2) {
        currentPath = '~';
        return;
    }
    const target = args[1];
    if (target === '..') {
        if (currentPath !== '~') {
            const parts = currentPath.split('/');
            parts.pop();
            currentPath = parts.join('/');
            if (currentPath === '') currentPath = '~';
        }
        return;
    }
    if (target === '~') {
        currentPath = '~';
        return;
    }
    const currentDir = getDirFromPath(currentPath);
    if (currentDir && currentDir.contents && currentDir.contents[target]) {
        if (currentDir.contents[target].type === 'dir') {
            currentPath = currentPath === '~' ? `~/${target}` : `${currentPath}/${target}`;
        } else {
            printLog(`cd: ${target}: Not a directory`, 'log-error');
        }
    } else {
        printLog(`cd: ${target}: No such file or directory`, 'log-error');
    }
}

function executeCat(args) {
    if (args.length < 2) {
        printLog('cat: missing operand', 'log-error');
        return;
    }
    const target = args[1];
    const currentDir = getDirFromPath(currentPath);
    if (currentDir && currentDir.contents && currentDir.contents[target]) {
        if (currentDir.contents[target].type === 'file') {
            printLog(currentDir.contents[target].content);
        } else {
            printLog(`cat: ${target}: Is a directory`, 'log-error');
        }
    } else {
        printLog(`cat: ${target}: No such file or directory`, 'log-error');
    }
}

function executeTheme(args) {
    if (args.length < 2) {
        printLog('Usage: theme [lavender|mint|rose|ocean]', 'log-warning');
        return;
    }
    const themeName = args[1].toLowerCase();
    const theme = m3Themes[themeName];
    
    if (theme) {
        const root = document.documentElement;
        root.style.setProperty('--md-bg', theme.bg);
        root.style.setProperty('--md-surface', theme.surface);
        root.style.setProperty('--md-surface-container', theme.surfaceContainer);
        root.style.setProperty('--md-primary', theme.primary);
        root.style.setProperty('--md-tertiary', theme.tertiary);
        root.style.setProperty('--md-text-main', theme.text);
        
        document.querySelector('meta[name="theme-color"]').setAttribute('content', theme.bg);
        printLog(`Material You theme applied: ${themeName}`, 'log-info');
    } else {
        printLog(`Unknown theme: ${themeName}. Try: lavender, mint, rose, ocean.`, 'log-error');
    }
}

// Initialize App
window.onload = () => {
    runBootSequence();
};
