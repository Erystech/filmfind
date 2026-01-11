const TMDB_API_KEY = process.env.TMDB_API_KEY; // Store in Vercel environment variables
const BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(req, res) {
  // Enabling CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, ...params } = req.query;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    // Building query string from params
    const queryParams = new URLSearchParams({
      api_key: TMDB_API_KEY,
      ...params
    });

    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('TMDB API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}