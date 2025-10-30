import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl = 'https://winery-backend.onrender.com/api';
  
  try {
    // Test 1: Try to access wines endpoint without authentication
    console.log('Testing wines endpoint without auth...');
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

    // Test 2: Try to get token
    console.log('Testing token endpoint...');
    const tokenResponse = await fetch(`${baseUrl}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.EXTERNAL_WINE_API_USERNAME || 'test',
        password: process.env.EXTERNAL_WINE_API_PASSWORD || 'test',
      }),
    });

    const tokenResult = {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      ok: tokenResponse.ok,
    };

    let tokenData = null;
    try {
      if (tokenResponse.ok) {
        tokenData = await tokenResponse.json();
      } else {
        tokenData = await tokenResponse.text();
      }
    } catch (e) {
      tokenData = 'Could not parse response';
    }

    // Test 3: Check environment variables
    const envCheck = {
      hasUsername: !!process.env.EXTERNAL_WINE_API_USERNAME,
      hasPassword: !!process.env.EXTERNAL_WINE_API_PASSWORD,
      username: process.env.EXTERNAL_WINE_API_USERNAME ? 'SET' : 'NOT SET',
      password: process.env.EXTERNAL_WINE_API_PASSWORD ? 'SET' : 'NOT SET',
    };

    res.status(200).json({
      success: true,
      tests: {
        winesEndpoint: {
          ...winesResult,
          data: winesData,
        },
        tokenEndpoint: {
          ...tokenResult,
          data: tokenData,
        },
        environment: envCheck,
      },
      baseUrl,
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
    });
  }
}