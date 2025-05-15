# Morse Code Light Simulator

A visual Morse code simulator that displays flashing light signals based on text input. This application simulates a naval signal lamp transmitting Morse code messages.

## Features

- Convert text to Morse code
- Visual representation with flashing light
- Adjustable transmission speed
- Live Morse code preview
- Multi-line message support
- No server required - runs entirely in the browser

## Usage

1. Open `index.html` in your browser
2. Enter your message in the text area
3. Adjust the speed if desired (default is 200ms per unit)
4. Click "Transmit Message" to begin the visual Morse code transmission
5. Use "Stop" to halt transmission at any time

## Morse Code Timing

This simulator follows standard Morse code timing:
- Dit (dot): 1 time unit
- Dah (dash): 3 time units
- Space between elements within a character: 1 time unit
- Space between characters: 3 time units
- Space between words: 7 time units
- Space between lines: 10 time units

## Project Structure

```
.
├── index.html      # Main HTML file
├── style.css       # Styles for the application
├── script.js       # Morse code logic and controls
└── assets
    └── background.jpg  # Background image with naval signaler
```

## License

See LICENSE file for details.
