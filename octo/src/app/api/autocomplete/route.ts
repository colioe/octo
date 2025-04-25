import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we're handling GET requests
  if (req.method === 'GET') {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      const response = await fetch(`https://ac.duckduckgo.com/ac/?q=${query}&type=list`);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
