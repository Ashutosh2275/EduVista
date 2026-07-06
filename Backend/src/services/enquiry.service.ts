import { FilterQuery, SortOrder } from 'mongoose';
import { EnquiryRepository } from '../repositories/enquiry.repository';
import { CollegeRepository } from '../repositories/college.repository';
import { IEnquiryDocument } from '../models';
import {
  ApiError,
  buildRegexFilter,
  buildRangeFilter,
  mergeFilters,
  parseSortQuery,
  buildPaginationMeta,
} from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

export class EnquiryService {
  private enquiryRepository: EnquiryRepository;
  private collegeRepository: CollegeRepository;

  constructor() {
    this.enquiryRepository = new EnquiryRepository();
    this.collegeRepository = new CollegeRepository();
  }

  /**
   * Public: Submit a new student enquiry.
   * Unauthenticated.
   */
  async submitEnquiry(data: Partial<IEnquiryDocument>): Promise<IEnquiryDocument> {
    // 1. Verify college reference if provided
    if (data.college) {
      const college = await this.collegeRepository.findById(data.college.toString());
      if (!college || college.status !== 'published') {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.COLLEGE_NOT_FOUND,
          'Selected college not found or is in draft mode.'
        );
      }
    }

    // 2. Create enquiry document
    const enquiry = await this.enquiryRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      interestedCourse: data.interestedCourse,
      college: data.college,
      message: data.message,
    });

    // ────────────────────────────────────────────────────────────
    // Future CRM / SMTP Integration Hooks
    // ────────────────────────────────────────────────────────────
    // - Send email confirmation to the student
    // - Notify college administrator of the new query
    // - Sync query to centralized CRM (Salesforce / HubSpot)
    // ────────────────────────────────────────────────────────────

    return enquiry;
  }

  /**
   * Admin: List all enquiries with advanced filters, pagination, and search.
   */
  async getEnquiries(options: {
    q?: string;
    status?: string;
    course?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ enquiries: IEnquiryDocument[]; pagination: any }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const filters: FilterQuery<IEnquiryDocument>[] = [];

    // Search query on Name / Email / Phone / Course
    if (options.q) {
      const regex = buildRegexFilter(options.q);
      if (regex) {
        filters.push({
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
            { interestedCourse: regex },
          ],
        });
      }
    }

    if (options.status) {
      filters.push({ status: options.status });
    }

    if (options.course) {
      filters.push({ interestedCourse: buildRegexFilter(options.course) });
    }

    // Date range filter
    if (options.startDate || options.endDate) {
      const start = options.startDate ? new Date(options.startDate) : undefined;
      const end = options.endDate ? new Date(options.endDate) : undefined;
      
      // Set end of day for the end boundary
      if (end) end.setHours(23, 59, 59, 999);

      filters.push(buildRangeFilter('createdAt', start?.getTime(), end?.getTime()));
    }

    const finalFilter = mergeFilters(...filters);
    const sort = parseSortQuery(options.sort, { createdAt: -1 }) as Record<string, SortOrder>;

    const enquiries = await this.enquiryRepository.find(finalFilter, sort, skip, limit);
    const total = await this.enquiryRepository.count(finalFilter);
    const pagination = buildPaginationMeta(total, page, limit);

    return { enquiries, pagination };
  }

  /**
   * Admin: Retrieve detail of a single student enquiry.
   */
  async getEnquiryById(id: string): Promise<IEnquiryDocument> {
    const enquiry = await this.enquiryRepository.findById(id);
    if (!enquiry) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ENQUIRY_NOT_FOUND,
        'Enquiry ticket not found.'
      );
    }
    return enquiry;
  }

  /**
   * Admin: Update ticket progress status.
   */
  async updateStatus(
    id: string,
    status: 'new' | 'contacted' | 'in-progress' | 'closed'
  ): Promise<IEnquiryDocument> {
    const updated = await this.enquiryRepository.update(id, { status });
    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ENQUIRY_NOT_FOUND,
        'Enquiry ticket not found.'
      );
    }
    return updated;
  }

  /**
   * Admin: Update processing notes on an enquiry ticket.
   */
  async updateNotes(id: string, notes: string): Promise<IEnquiryDocument> {
    const updated = await this.enquiryRepository.update(id, { notes });
    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ENQUIRY_NOT_FOUND,
        'Enquiry ticket not found.'
      );
    }
    return updated;
  }

  /**
   * Admin: Permanently delete an enquiry ticket.
   */
  async deleteEnquiry(id: string): Promise<void> {
    const deleted = await this.enquiryRepository.delete(id);
    if (!deleted) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ENQUIRY_NOT_FOUND,
        'Enquiry ticket not found or already deleted.'
      );
    }
  }
}

export default EnquiryService;
