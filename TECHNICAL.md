# Technical Explanation

## State Design

The game uses a single `GameState` object managed by React's `useState`:

```typescript
interface GameState {
  wordChain: string[];           // Full word list from API
  currentWordIndex: number;      // Which word we're guessing (0-5)
  revealedLetters: number;       // How many letters to show
  completedWords: boolean[];     // Track which words are solved
  isGameComplete: boolean;       // Game over flag
  startTime: number;             // When timer started (ms)
  endTime: number | null;        // When game finished (ms)
  guessInput: string;            // Current input value
}
```

### State Flow:
1. **Initialization**: Fetch word chain from API, set `startTime`, mark first word as complete
2. **Per word**: Start with `revealedLetters = 1` (first letter only)
3. **Wrong guess**: Increment `revealedLetters` by 1
4. **Correct guess**: Mark word complete, move to next, reset `revealedLetters = 1`
5. **Game complete**: Set `isGameComplete = true`, store `endTime`, stop timer

### Why this design?
- **Single source of truth**: All game logic reads from one state object
- **Atomic updates**: Each guess triggers one state update
- **Easy reset**: Play Again just resets the state object
- **No prop drilling**: Everything in one component keeps it simple

---

## Reveal-Letter Logic

### Progressive Revealing Algorithm:

```typescript
// On wrong guess:
setGameState((prev) => ({
  ...prev,
  revealedLetters: Math.min(prev.revealedLetters + 1, maxLetters),
  guessInput: '',
}));
```

### Rendering Logic:

```typescript
const renderWord = (word: string, wordIndex: number) => {
  const letters = word.split('');
  
  return letters.map((letter, idx) => {
    if (idx < gameState.revealedLetters) {
      return <span className="letter-revealed">{letter}</span>;
    }
    return <span className="letter-hidden">_</span>;
  });
};
```

### Key Features:
- **Bounded**: `Math.min()` prevents revealing more letters than exist
- **Left-to-right**: Always reveal from index 0 upward
- **First letter free**: Start at `revealedLetters = 1`
- **Visual feedback**: Different CSS classes for revealed vs hidden

### Example Progression:
```
Word: "WATCHING"
Guess 1 (wrong): W _ _ _ _ _ _ _
Guess 2 (wrong): W A _ _ _ _ _ _
Guess 3 (wrong): W A T _ _ _ _ _
Guess 4 (correct): WATCHING ✓
```

---

## Timer Implementation

### Three-Component System:

**1. State (`startTime`, `endTime`, `elapsedTime`)**
```typescript
const [gameState, setGameState] = useState({
  startTime: 0,      // Set when word chain loads
  endTime: null,     // Set when game completes
});

const [elapsedTime, setElapsedTime] = useState(0);
```

**2. Interval Loop (updates every 10ms)**
```typescript
useEffect(() => {
  if (gameState.isGameComplete) return;

  timerRef.current = window.setInterval(() => {
    setElapsedTime((Date.now() - gameState.startTime) / 1000);
  }, 10);

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [gameState.startTime, gameState.isGameComplete]);
```

**3. Display Logic**
```typescript
const currentTime = gameState.isGameComplete && gameState.endTime
  ? (gameState.endTime - gameState.startTime) / 1000  // Final frozen time
  : elapsedTime;                                       // Live updating time

<div className="timer">⏱️ Time: {currentTime.toFixed(2)}s</div>
```

### Why This Works:
- **High precision**: Updates every 10ms for smooth display
- **Automatic cleanup**: `clearInterval` in useEffect return
- **Freezes on complete**: Switches to `endTime` calculation
- **Two decimal places**: `.toFixed(2)` for readability

### Timer Lifecycle:
```
1. Page loads → startTime = Date.now()
2. Interval starts → updates elapsedTime every 10ms
3. Last word guessed → endTime = Date.now(), clearInterval()
4. Display frozen → shows (endTime - startTime)
5. Play Again → reset startTime, restart interval
```

---

## Additional Implementation Notes

### Case-Insensitive Matching
```typescript
if (guess.toLowerCase() === currentWord.toLowerCase()) {
  // Correct!
}
```

### Input Auto-Focus
```typescript
useEffect(() => {
  if (inputRef.current && !gameState.isGameComplete) {
    inputRef.current.focus();
  }
}, [gameState.currentWordIndex, gameState.isGameComplete]);
```
Re-focuses after each correct guess and on game load.

### Confetti Trigger
```typescript
import confetti from 'canvas-confetti';

// On game complete:
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
});
```

### API Proxy (Vite)
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```
This lets the frontend call `/api/chain` without CORS issues.

---

## Project Structure

```
word-chain-game/
├── client/               # React frontend
│   ├── src/
│   │   ├── App.tsx      # Main game component
│   │   ├── App.css      # All styling
│   │   └── main.tsx     # React entry point
│   ├── index.html       # HTML shell
│   └── vite.config.ts   # Vite + proxy config
│
├── server/              # Express backend
│   └── index.ts         # API endpoint
│
└── README.md            # Setup instructions
```

---

## Running the Game

### Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Game runs on http://localhost:5173
```

The frontend proxies `/api/*` requests to the backend automatically.

---

## Potential Enhancements

- Add difficulty levels (different word chains)
- Track high scores (localStorage)
- Hint system (skip revealing a letter for a time penalty)
- Multiplayer mode
- Custom word chains via UI
- Sound effects
- Dark mode

---

Built with 🔮 by Merlin
