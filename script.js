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

// DOM elements
const light = document.getElementById('light');
const messageInput = document.getElementById('message');
const transmitBtn = document.getElementById('transmit');
const stopBtn = document.getElementById('stop');
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const morsePreview = document.getElementById('morse-preview');

// Default time unit (one dit duration in ms)
let unitTime = 200;
let isTransmitting = false;
let timeouts = [];

// Update speed display
speedSlider.addEventListener('input', () => {
  unitTime = parseInt(speedSlider.value);
  speedValue.textContent = `${unitTime}ms`;
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

// Event listeners
messageInput.addEventListener('input', updateMorsePreview);
transmitBtn.addEventListener('click', () => {
  if (isTransmitting) return;
  transmitBtn.disabled = true;
  playMorse(messageInput.value);
});
stopBtn.addEventListener('click', stopTransmission);

// Initialize preview
updateMorsePreview(); 