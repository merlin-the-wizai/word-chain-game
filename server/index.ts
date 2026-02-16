import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Repository of word chains
// Each adjacent pair forms a common phrase
const wordChains = [
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

// API endpoint to get a random word chain
app.get('/api/chain', (req: Request, res: Response) => {
  const randomIndex = Math.floor(Math.random() * wordChains.length);
  res.json(wordChains[randomIndex]);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎮 Word Chain Game server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/chain`);
});
