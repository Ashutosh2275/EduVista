import { CompareRepository } from '../repositories/compare.repository';
import { CollegeRepository } from '../repositories/college.repository';
import { ApiError } from '../utils';
import { HTTP_STATUS, ERROR_CODES } from '../constants';

export class CompareService {
  private compareRepository: CompareRepository;
  private collegeRepository: CollegeRepository;

  constructor() {
    this.compareRepository = new CompareRepository();
    this.collegeRepository = new CollegeRepository();
  }

  /**
   * Overwrite comparison list.
   * Business Rules:
   * - Limit up to 3 colleges.
   * - Prevent duplicates.
   * - Colleges must exist and be 'published'.
   */
  async saveCompareSelection(userId: string, collegeIds: string[]): Promise<void> {
    // 1. Enforce limit of 3 colleges
    if (collegeIds.length > 3) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.BAD_REQUEST,
        'You can compare up to 3 colleges simultaneously.'
      );
    }

    // 2. Remove duplicate IDs in input array
    const uniqueIds = Array.from(new Set(collegeIds));

    // 3. Verify each college exists and is published
    for (const id of uniqueIds) {
      const college = await this.collegeRepository.findById(id);
      if (!college || college.status !== 'published') {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.COLLEGE_NOT_FOUND,
          `College with ID ${id} not found or is not active.`
        );
      }
    }

    // 4. Save selection
    await this.compareRepository.saveCompareSelection(userId, uniqueIds);
  }

  /**
   * Get comparison details, populating all fields required by comparison matrix.
   */
  async getCompareDetails(userId: string): Promise<any[]> {
    const selection = await this.compareRepository.findByUserId(userId);
    if (!selection || selection.colleges.length === 0) {
      return [];
    }

    // Populate comparison metrics
    await selection.populate({
      path: 'colleges',
      select: 'name slug logo location accreditation nirfRanking naacGrade fees placements facilities rating reviewCount aiMatchScore status banner establishedYear ownership',
    });

    // Filter out any that were archived or deleted in the meantime
    const activeColleges = selection.colleges.filter(
      (c: any) => c && c.status === 'published'
    );

    return activeColleges;
  }

  /**
   * Clear comparison selection list.
   */
  async clearCompare(userId: string): Promise<void> {
    await this.compareRepository.clear(userId);
  }
}

export default CompareService;
