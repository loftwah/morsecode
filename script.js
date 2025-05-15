// Morse code mapping
const MORSE = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....',
  '7': '--...', '8': '---..', '9': '----.', ' ': ' '
};

// Naval prosigns (not automatically populated)
const NAVAL_PROSIGNS = {
  'Over (K)': '-·-',
  'Out (SK)': '···-·-',
  'Understood (R)': '·-·',
  'Wait (AS)': '·-···',
  'Error (HH)': '········',
  'SOS': '···---···'
};

// Audio context
let audioContext = null;
let isSoundEnabled = true;

// Initialize audio context
function initAudio() {
  // Create audio context on user interaction to comply with browser policies
  if (audioContext === null) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Play tone with specified duration
function playTone(duration) {
  if (!audioContext || !isSoundEnabled) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz is a typical Morse tone
  
  // Apply fade in/out to avoid clicks
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + duration/1000 - 0.01);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration/1000);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration/1000);
}

// DOM elements
const light = document.getElementById('light');
const messageInput = document.getElementById('message');
const transmitBtn = document.getElementById('transmit');
const stopBtn = document.getElementById('stop');
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const wpmValue = document.getElementById('wpm-value');
const morsePreview = document.getElementById('morse-preview');
const soundToggle = document.getElementById('toggle-sound');
const presetButtons = document.querySelectorAll('.preset');
const toggleReferenceBtn = document.getElementById('toggle-reference');
const morseReference = document.getElementById('morse-reference');
const lettersGrid = document.getElementById('letters-grid');
const numbersGrid = document.getElementById('numbers-grid');

// Default time unit (one dit duration in ms)
let unitTime = 200;
let isTransmitting = false;
let timeouts = [];

// Calculate WPM based on unit time
// Adjusted formula: WPM = 1200 / unitTimeMs
function calculateWPM(unitTimeMs) {
  return Math.round(1200 / unitTimeMs);
}

// Update speed display and WPM
function updateSpeedDisplay() {
  speedValue.textContent = `${unitTime}ms`;
  wpmValue.textContent = `(${calculateWPM(unitTime)} WPM)`;
}

// Update speed display on slider change
speedSlider.addEventListener('input', () => {
  unitTime = parseInt(speedSlider.value);
  updateSpeedDisplay();
});

// Preset buttons
presetButtons.forEach(button => {
  button.addEventListener('click', () => {
    const speed = parseInt(button.getAttribute('data-speed'));
    unitTime = speed;
    speedSlider.value = speed;
    updateSpeedDisplay();
  });
});

// Convert text to Morse code
function textToMorse(text) {
  return text.toUpperCase().split('').map(char => {
    return MORSE[char] || '';
  }).join(' ');
}

// Display Morse code preview
function updateMorsePreview() {
  const text = messageInput.value;
  const lines = text.split('\n');
  const morseLines = lines.map(line => textToMorse(line));
  morsePreview.textContent = morseLines.join('\n');
}

// Blink the light for a specified duration
function blink(duration) {
  light.classList.add('on');
  playTone(duration);
  const timeout = setTimeout(() => {
    light.classList.remove('on');
  }, duration);
  timeouts.push(timeout);
}

// Play Morse code sequence
function playMorse(message) {
  if (!message) return;
  
  isTransmitting = true;
  const lines = message.split('\n');
  let totalTime = 0;
  
  // Process each line with a gap between lines
  lines.forEach((line, lineIndex) => {
    const encoded = textToMorse(line);
    
    // Process each character in the Morse code
    for (let i = 0; i < encoded.length; i++) {
      const char = encoded[i];
      
      if (char === '.') {
        // Dit (short signal)
        const timeout = setTimeout(() => {
          if (isTransmitting) blink(unitTime);
        }, totalTime);
        timeouts.push(timeout);
        totalTime += unitTime * 2; // Signal + gap
      } else if (char === '-') {
        // Dah (long signal)
        const timeout = setTimeout(() => {
          if (isTransmitting) blink(unitTime * 3);
        }, totalTime);
        timeouts.push(timeout);
        totalTime += unitTime * 4; // Signal + gap
      } else if (char === ' ') {
        // Space between letters (already included 1 unit, so add 2 more)
        totalTime += unitTime * 2;
      }
    }
    
    // Add gap between lines (5 units after the last character's gap)
    if (lineIndex < lines.length - 1) {
      totalTime += unitTime * 10; // Line break pause
    }
  });
  
  // Reset when done
  const timeout = setTimeout(() => {
    isTransmitting = false;
    transmitBtn.disabled = false;
  }, totalTime);
  timeouts.push(timeout);
}

// Stop transmission
function stopTransmission() {
  isTransmitting = false;
  timeouts.forEach(id => clearTimeout(id));
  timeouts = [];
  light.classList.remove('on');
  transmitBtn.disabled = false;
}

// Populate Morse code reference
function populateMorseReference() {
  // Populate letters grid
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const code = MORSE[letter];
    
    const item = document.createElement('div');
    item.className = 'reference-item';
    
    const charSpan = document.createElement('span');
    charSpan.className = 'char';
    charSpan.textContent = letter;
    
    const codeSpan = document.createElement('span');
    codeSpan.className = 'code';
    codeSpan.textContent = formatMorseCode(code);
    
    item.appendChild(charSpan);
    item.appendChild(codeSpan);
    lettersGrid.appendChild(item);
  }
  
  // Populate numbers grid
  for (let i = 0; i <= 9; i++) {
    const number = i.toString();
    const code = MORSE[number];
    
    const item = document.createElement('div');
    item.className = 'reference-item';
    
    const charSpan = document.createElement('span');
    charSpan.className = 'char';
    charSpan.textContent = number;
    
    const codeSpan = document.createElement('span');
    codeSpan.className = 'code';
    codeSpan.textContent = formatMorseCode(code);
    
    item.appendChild(charSpan);
    item.appendChild(codeSpan);
    numbersGrid.appendChild(item);
  }
}

// Format Morse code with proper symbols
function formatMorseCode(code) {
  if (!code) return '';
  return code.replace(/\./g, '·').replace(/\-/g, '-');
}

// Toggle Morse code reference
toggleReferenceBtn.addEventListener('click', () => {
  morseReference.classList.toggle('hidden');
  toggleReferenceBtn.textContent = morseReference.classList.contains('hidden') 
    ? 'Show Morse Code Reference' 
    : 'Hide Morse Code Reference';
});

// Event listeners
messageInput.addEventListener('input', updateMorsePreview);
transmitBtn.addEventListener('click', () => {
  if (isTransmitting) return;
  initAudio(); // Initialize audio context on user interaction
  transmitBtn.disabled = true;
  playMorse(messageInput.value);
});
stopBtn.addEventListener('click', stopTransmission);

// Sound toggle
soundToggle.addEventListener('click', () => {
  isSoundEnabled = !isSoundEnabled;
  soundToggle.textContent = isSoundEnabled ? 'Sound: ON' : 'Sound: OFF';
});

// Initialize preview and WPM display
updateMorsePreview();
updateSpeedDisplay();
populateMorseReference(); 