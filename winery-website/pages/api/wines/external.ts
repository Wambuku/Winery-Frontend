import { NextApiRequest, NextApiResponse } from 'next';
import { wineService } from '../../../services/api/wineService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Extract parameters from query
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const sortBy = (req.query.sortBy as string) || 'name';
      const sortOrder = (req.query.sortOrder as string) || 'asc';
      const inStock = req.query.inStock ? req.query.inStock === 'true' : undefined;
      
      // Build filters
      const filters: any = {};
      if (inStock !== undefined) filters.inStock = inStock;
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.region) filters.region = req.query.region as string;
      if (req.query.search) filters.search = req.query.search as string;
      
      // Get wines from external API
      const result = await wineService.getExternalWines(
        filters,
        { field: sortBy as any, direction: sortOrder as any },
        { page, limit }
      );
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          source: 'external_api'
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'EXTERNAL_API_ERROR',
          message: 'Failed to fetch wines from external API',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  } else if (req.method === 'POST' && req.query.action === 'sync') {
    try {
      // Sync external wines with internal database
      const result = await wineService.syncExternalWines();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: `Successfully synced ${result.data.synced} wines`
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SYNC_ERROR',
          message: 'Failed to sync wines from external API',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed`
      }
    });
  }
}