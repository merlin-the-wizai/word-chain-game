# Word Chain Game

A 6-word phrase chain guessing game built with React, TypeScript, and Node.js.

## How to Play

1. The first word is revealed
2. Guess the next word that forms a common phrase with the previous word
3. Only the first letter and word length are shown
4. Wrong guesses reveal one additional letter
5. Complete all 6 words to finish the game
6. Beat your best time!

## Setup

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install all dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

## Running the Game

### Option 1: Run both (from root directory)

```bash
# Terminal 1 - Start the backend server
npm run server

# Terminal 2 - Start the frontend
npm run dev
```

### Option 2: Run individually

```bash
# Start backend (from server directory)
cd server
npm run dev

# Start frontend (from client directory)
cd client
npm run dev
```

The game will open at `http://localhost:5173`

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Styling**: CSS (no framework dependencies)

## Game Logic

- Case-insensitive matching
- Progressive letter reveals on wrong guesses
- Timer starts on page load, stops on completion
- Confetti celebration on win
- Full state reset on replay
