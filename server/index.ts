import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Predefined word chain
// Each adjacent pair forms a common phrase
const wordChain = [
  'Bird',
  'Watching',
  'Party',
  'Animal',
  'Shelter',
  'Home'
];

// API endpoint to get the word chain
app.get('/api/chain', (req: Request, res: Response) => {
  res.json(wordChain);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🎮 Word Chain Game server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/chain`);
});
