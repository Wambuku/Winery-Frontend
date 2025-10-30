import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = 'https://winery-backend.onrender.com/api';
  
  try {
    console.log('Testing external wine API from server...');
    
    // Test the wines endpoint directly from server
    const winesResponse = await fetch(`${baseUrl}/wines/?page=1&limit=3&sortBy=name&sortOrder=asc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const winesResult = {
      status: winesResponse.status,
      statusText: winesResponse.statusText,
      ok: winesResponse.ok,
      headers: Object.fromEntries(winesResponse.headers.entries()),
    };

    let winesData = null;
    try {
      if (winesResponse.ok) {
        winesData = await winesResponse.json();
      } else {
        winesData = await winesResponse.text();
      }
    } catch (e) {
      winesData = 'Could not parse response';
    }

    res.status(200).json({
      success: true,
      serverTest: {
        ...winesResult,
        data: winesData,
      },
      message: 'This request was made from the server, so no CORS issues',
    });
  } catch (error) {
    console.error('Server-side test failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
    });
  }
}