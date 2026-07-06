import { Request, Response } from 'express';
import { EnquiryService } from '../services/enquiry.service';
import { ApiResponse, parsePagination, ApiError } from '../utils';

export class EnquiryController {
  private enquiryService: EnquiryService;

  constructor() {
    this.enquiryService = new EnquiryService();
  }

  /**
   * POST /api/v1/enquiries
   * Submit student enquiry (Public, no auth needed).
   */
  submitEnquiry = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, phone, interestedCourse, college, message } = req.body;

    const enquiry = await this.enquiryService.submitEnquiry({
      name,
      email,
      phone,
      interestedCourse,
      college,
      message,
    });

    return ApiResponse.created(res, enquiry, 'Enquiry ticket submitted successfully.');
  };

  /**
   * GET /api/v1/admin/enquiries
   * Get enquiries with filters, pagination, and search (Admin Only).
   */
  adminGetEnquiries = async (req: Request, res: Response): Promise<Response> => {
    const { page, limit } = parsePagination(req, 20);
    const { q, status, course, startDate, endDate, sort } = req.query;

    const { enquiries, pagination } = await this.enquiryService.getEnquiries({
      q: q as string,
      status: status as string,
      course: course as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sort: sort as string,
      page,
      limit,
    });

    return ApiResponse.paginated(res, enquiries, pagination, 'Enquiry tickets retrieved.');
  };

  /**
   * GET /api/v1/admin/enquiries/:id
   * Fetch single enquiry ticket details (Admin Only).
   */
  adminGetEnquiryById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const enquiry = await this.enquiryService.getEnquiryById(id as string);
    return ApiResponse.success(res, enquiry, 'Enquiry details fetched.');
  };

  /**
   * PATCH /api/v1/admin/enquiries/:id/status
   * Update enquiry ticket status (Admin Only).
   */
  adminUpdateStatus = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'contacted', 'in-progress', 'closed'].includes(status)) {
      throw ApiError.badRequest("Invalid or missing status parameter in request body. Must be 'new', 'contacted', 'in-progress', or 'closed'.");
    }

    const enquiry = await this.enquiryService.updateStatus(id as string, status);
    return ApiResponse.success(res, enquiry, 'Enquiry status updated successfully.');
  };

  /**
   * PATCH /api/v1/admin/enquiries/:id/notes
   * Update resolution notes on enquiry ticket (Admin Only).
   */
  adminUpdateNotes = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { notes } = req.body;

    if (notes === undefined) {
      throw ApiError.badRequest('notes string is required in request body.');
    }

    const enquiry = await this.enquiryService.updateNotes(id as string, notes);
    return ApiResponse.success(res, enquiry, 'Enquiry resolution notes updated.');
  };

  /**
   * DELETE /api/v1/admin/enquiries/:id
   * Permanently delete enquiry ticket (Admin Only).
   */
  adminDeleteEnquiry = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.enquiryService.deleteEnquiry(id as string);
    return ApiResponse.success(res, null, 'Enquiry ticket deleted successfully.');
  };
}

export default EnquiryController;
