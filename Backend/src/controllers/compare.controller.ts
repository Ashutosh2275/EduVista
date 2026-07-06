import { Request, Response } from 'express';
import { CompareService } from '../services/compare.service';
import { ApiResponse, ApiError } from '../utils';

export class CompareController {
  private compareService: CompareService;

  constructor() {
    this.compareService = new CompareService();
  }

  /**
   * POST /api/v1/compare
   * Save comparison college selection list.
   */
  saveCompareSelection = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    const { collegeIds } = req.body;

    if (!collegeIds || !Array.isArray(collegeIds)) {
      throw ApiError.badRequest('collegeIds array is required in request body.');
    }

    await this.compareService.saveCompareSelection(req.user.id, collegeIds);
    return ApiResponse.success(res, null, 'Comparison selection list saved.');
  };

  /**
   * GET /api/v1/compare
   * Fetch detailed college statistics for comparison matrix.
   */
  getCompareDetails = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    const matrix = await this.compareService.getCompareDetails(req.user.id);
    return ApiResponse.success(res, matrix, 'Comparison details compiled.');
  };

  /**
   * DELETE /api/v1/compare
   * Clear comparison selection list.
   */
  clearCompare = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw ApiError.unauthorized();
    await this.compareService.clearCompare(req.user.id);
    return ApiResponse.success(res, null, 'Comparison list cleared.');
  };
}

export default CompareController;
