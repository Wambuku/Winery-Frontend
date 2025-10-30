import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../types';

const wineRegions = [
  'Bordeaux, France',
  'Burgundy, France',
  'Champagne, France',
  'Loire Valley, France',
  'Rhône Valley, France',
  'Tuscany, Italy',
  'Piedmont, Italy',
  'Veneto, Italy',
  'Rioja, Spain',
  'Ribera del Duero, Spain',
  'Douro, Portugal',
  'Napa Valley, California',
  'Sonoma County, California',
  'Willamette Valley, Oregon',
  'Barossa Valley, Australia',
  'Hunter Valley, Australia',
  'Marlborough, New Zealand',
  'Stellenbosch, South Africa',
  'Mosel, Germany',
  'Rheingau, Germany',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<string[]>>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed`,
      },
    });
  }

  try {
    return res.status(200).json({
      success: true,
      data: wineRegions,
    });
  } catch (error) {
    console.error('Regions API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
}