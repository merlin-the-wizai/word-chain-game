import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Datamuse API helper
async function fetchDatamuse(word: string): Promise<string[]> {
  try {
    // Find words that commonly pair with the given word
    // rel_jja = words that modify/follow the word (e.g., "bird" → "watching")
    const response = await fetch(
      `https://api.datamuse.com/words?rel_jja=${encodeURIComponent(word.toLowerCase())}&max=30`
    );
    const data = await response.json();
    
    // Extract word strings and capitalize them
    return data
      .map((item: any) => item.word)
      .filter((w: string) => w && /^[a-z]+$/i.test(w)) // Only single words, no hyphens
      .filter((w: string) => w.length >= 3 && w.length <= 12) // Reasonable length
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .slice(0, 15);
  } catch (error) {
    console.error('Datamuse API error:', error);
    return [];
  }
}

// Generate a word chain dynamically
async function generateWordChain(): Promise<string[]> {
  const chain: string[] = [];
  
  // Seed words that commonly start phrases
  const seedWords = [
    'Bird', 'Fire', 'Snow', 'Sun', 'Water', 'Moon', 'Star', 'Rock',
    'Time', 'Book', 'Light', 'Tree', 'Glass', 'Paper', 'Ice', 'Wind'
  ];
  
  // Start with a random seed
  const firstWord = seedWords[Math.floor(Math.random() * seedWords.length)];
  chain.push(firstWord);
  
  // Build chain by finding words that follow
  let maxAttempts = 20; // Safety limit
  while (chain.length < 6 && maxAttempts > 0) {
    maxAttempts--;
    
    const currentWord = chain[chain.length - 1];
    const candidates = await fetchDatamuse(currentWord);
    
    if (candidates.length === 0) {
      // No candidates found, try a different path
      console.log(`No candidates for "${currentWord}", backtracking...`);
      break;
    }
    
    // Pick a random candidate that we haven't used yet
    const unusedCandidates = candidates.filter(w => !chain.includes(w));
    if (unusedCandidates.length > 0) {
      const nextWord = unusedCandidates[Math.floor(Math.random() * unusedCandidates.length)];
      chain.push(nextWord);
    } else {
      break;
    }
  }
  
  // If we didn't get 6 words, return a fallback chain
  if (chain.length < 6) {
    console.log(`Generated chain too short (${chain.length}), using fallback`);
    return fallbackChains[Math.floor(Math.random() * fallbackChains.length)];
  }
  
  console.log('Generated chain:', chain);
  return chain;
}

// Fallback word chains (used if API fails or chain generation fails)
// Each adjacent pair forms a common phrase
const fallbackChains = [
  [
    'Bird',
    'Watching',
    'Party',
    'Animal',
    'Shelter',
    'Home'
  ],
  [
    'Snow',
    'Ball',
    'Park',
    'Bench',
    'Press',
    'Release'
  ],
  [
    'Sun',
    'Flower',
    'Pot',
    'Luck',
    'Dragon',
    'Fly'
  ],
  [
    'Fire',
    'Truck',
    'Stop',
    'Light',
    'House',
    'Keeper'
  ],
  [
    'Time',
    'Machine',
    'Gun',
    'Powder',
    'Room',
    'Service'
  ],
  [
    'Book',
    'Mark',
    'Down',
    'Town',
    'Hall',
    'Pass'
  ],
  [
    'Water',
    'Fall',
    'Out',
    'Side',
    'Walk',
    'Away'
  ],
  [
    'Star',
    'Fish',
    'Bowl',
    'Game',
    'Plan',
    'Ahead'
  ],
  [
    'Rock',
    'Star',
    'Light',
    'Weight',
    'Loss',
    'Prevention'
  ],
  [
    'Moon',
    'Light',
    'Speed',
    'Dial',
    'Tone',
    'Deaf'
  ]
];

// API endpoint to get a dynamically generated word chain
app.get('/api/chain', async (req: Request, res: Response) => {
  try {
    const chain = await generateWordChain();
    res.json(chain);
  } catch (error) {
    console.error('Error generating chain:', error);
    // Fallback to a random hardcoded chain
    const randomIndex = Math.floor(Math.random() * fallbackChains.length);
    res.json(fallbackChains[randomIndex]);
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎮 Word Chain Game server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/chain`);
});
