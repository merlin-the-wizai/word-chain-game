import { useState, useEffect, useRef, FormEvent } from 'react';
import confetti from 'canvas-confetti';

interface GameState {
  wordChain: string[];
  currentWordIndex: number;
  revealedLetters: number;
  completedWords: boolean[];
  failedWords: boolean[];        // Words that were fully revealed but not guessed
  isGameComplete: boolean;
  startTime: number;
  endTime: number | null;
  guessInput: string;
  shouldJiggle: boolean;          // Trigger jiggle animation
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    wordChain: [],
    currentWordIndex: 0,
    revealedLetters: 1, // Always show first letter
    completedWords: [],
    failedWords: [],
    isGameComplete: false,
    startTime: 0,
    endTime: null,
    guessInput: '',
    shouldJiggle: false,
  });

  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch word chain on mount
  useEffect(() => {
    fetch('/api/chain')
      .then((res) => res.json())
      .then((chain: string[]) => {
        const startTime = Date.now();
        setGameState((prev) => ({
          ...prev,
          wordChain: chain,
          completedWords: [true, ...new Array(chain.length - 1).fill(false)], // First word revealed
          failedWords: new Array(chain.length).fill(false),
          currentWordIndex: 1, // Start guessing from second word
          startTime,
        }));
      })
      .catch((err) => console.error('Failed to fetch word chain:', err));
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.wordChain.length === 0 || gameState.isGameComplete) return;

    timerRef.current = window.setInterval(() => {
      setElapsedTime((Date.now() - gameState.startTime) / 1000);
    }, 10); // Update every 10ms for smooth display

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.startTime, gameState.wordChain.length, gameState.isGameComplete]);

  // Focus input when ready
  useEffect(() => {
    if (inputRef.current && !gameState.isGameComplete) {
      inputRef.current.focus();
    }
  }, [gameState.currentWordIndex, gameState.isGameComplete]);

  const handleGuess = (e: FormEvent) => {
    e.preventDefault();
    if (gameState.isGameComplete || gameState.guessInput.trim() === '') return;

    const currentWord = gameState.wordChain[gameState.currentWordIndex];
    const guess = gameState.guessInput.trim();

    // Case-insensitive comparison
    if (guess.toLowerCase() === currentWord.toLowerCase()) {
      // Correct guess!
      const newCompletedWords = [...gameState.completedWords];
      newCompletedWords[gameState.currentWordIndex] = true;

      const nextIndex = gameState.currentWordIndex + 1;
      const isComplete = nextIndex >= gameState.wordChain.length;

      if (isComplete) {
        // Game complete!
        const endTime = Date.now();
        if (timerRef.current) clearInterval(timerRef.current);
        
        setGameState((prev) => ({
          ...prev,
          completedWords: newCompletedWords,
          isGameComplete: true,
          endTime,
          guessInput: '',
        }));

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Move to next word
        setGameState((prev) => ({
          ...prev,
          completedWords: newCompletedWords,
          currentWordIndex: nextIndex,
          revealedLetters: 1, // Reset to first letter only
          guessInput: '',
        }));
      }
    } else {
      // Wrong guess
      const maxLetters = currentWord.length;
      const newRevealedLetters = gameState.revealedLetters + 1;

      // Trigger jiggle animation
      setGameState((prev) => ({ ...prev, shouldJiggle: true, guessInput: '' }));
      setTimeout(() => {
        setGameState((prev) => ({ ...prev, shouldJiggle: false }));
      }, 500);

      // Check if we've revealed all letters
      if (newRevealedLetters >= maxLetters) {
        // Word fully revealed but not guessed - mark as failed and move on
        const newFailedWords = [...gameState.failedWords];
        newFailedWords[gameState.currentWordIndex] = true;

        const nextIndex = gameState.currentWordIndex + 1;
        const isComplete = nextIndex >= gameState.wordChain.length;

        if (isComplete) {
          // Game complete (even with failed words)
          const endTime = Date.now();
          if (timerRef.current) clearInterval(timerRef.current);
          
          setGameState((prev) => ({
            ...prev,
            failedWords: newFailedWords,
            isGameComplete: true,
            endTime,
          }));
        } else {
          // Move to next word
          setGameState((prev) => ({
            ...prev,
            failedWords: newFailedWords,
            currentWordIndex: nextIndex,
            revealedLetters: 1,
          }));
        }
      } else {
        // Reveal one more letter
        setGameState((prev) => ({
          ...prev,
          revealedLetters: newRevealedLetters,
        }));
      }
    }
  };

  const handlePlayAgain = () => {
    // Fetch a new word chain
    fetch('/api/chain')
      .then((res) => res.json())
      .then((chain: string[]) => {
        const startTime = Date.now();
        setGameState((prev) => ({
          ...prev,
          wordChain: chain,
          currentWordIndex: 1,
          revealedLetters: 1,
          completedWords: [true, ...new Array(chain.length - 1).fill(false)],
          failedWords: new Array(chain.length).fill(false),
          isGameComplete: false,
          startTime,
          endTime: null,
          guessInput: '',
          shouldJiggle: false,
        }));
        setElapsedTime(0);
      })
      .catch((err) => console.error('Failed to fetch word chain:', err));
  };

  const renderWord = (word: string, wordIndex: number) => {
    const isCompleted = gameState.completedWords[wordIndex];
    const isFailed = gameState.failedWords[wordIndex];
    const isCurrent = wordIndex === gameState.currentWordIndex;

    if (isCompleted) {
      return <span className="word-revealed">{word}</span>;
    }

    if (isFailed) {
      return <span className="word-failed">{word}</span>;
    }

    if (!isCurrent) {
      return <span className="word-locked">???</span>;
    }

    // Show revealed letters
    const letters = word.split('');
    return (
      <span className="word-current">
        {letters.map((letter, idx) => {
          if (idx < gameState.revealedLetters) {
            return <span key={idx} className="letter-revealed">{letter}</span>;
          }
          return <span key={idx} className="letter-hidden">_</span>;
        })}
        <span className="letter-count"> ({word.length} letters)</span>
      </span>
    );
  };

  const formatTime = (seconds: number): string => {
    return Math.floor(seconds).toString();
  };

  const currentTime = gameState.isGameComplete && gameState.endTime
    ? (gameState.endTime - gameState.startTime) / 1000
    : elapsedTime;

  if (gameState.wordChain.length === 0) {
    return (
      <div className="app">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🔗 Word Chain Game</h1>
        <div className="timer">⏱️ Time: {formatTime(currentTime)}s</div>
      </header>

      <div className="game-container">
        {!gameState.isGameComplete && (
          <div className="progress">
            Word {gameState.currentWordIndex + 1} of {gameState.wordChain.length}
          </div>
        )}

        <div className="word-chain">
          {gameState.wordChain.map((word, idx) => (
            <div key={idx} className="word-item">
              {renderWord(word, idx)}
            </div>
          ))}
        </div>

        {!gameState.isGameComplete ? (
          <form onSubmit={handleGuess} className="guess-form">
            <input
              ref={inputRef}
              type="text"
              value={gameState.guessInput}
              onChange={(e) =>
                setGameState((prev) => ({ ...prev, guessInput: e.target.value }))
              }
              placeholder="Enter your guess..."
              className={`guess-input ${gameState.shouldJiggle ? 'jiggle' : ''}`}
              autoFocus
            />
            <button type="submit" className="submit-btn">
              Submit Guess
            </button>
          </form>
        ) : (
          <div className="complete-screen">
            <h2 className="congrats">🎉 Congratulations! 🎉</h2>
            <div className="final-time">
              You completed the chain in <strong>{formatTime(currentTime)}s</strong>!
            </div>
            <button onClick={handlePlayAgain} className="play-again-btn">
              🔄 Play Again
            </button>
          </div>
        )}

        <div className="instructions">
          <p>
            <strong>How to play:</strong> Guess words that form common phrases with adjacent words.
            Wrong guesses reveal one more letter!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
