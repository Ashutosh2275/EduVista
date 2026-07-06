import { FilterQuery, SortOrder } from 'mongoose';
import { Enquiry, IEnquiryDocument } from '../models';

export class EnquiryRepository {
  /**
   * Finds enquiries matching a filter, sorted and paginated.
   */
  async find(
    filter: FilterQuery<IEnquiryDocument>,
    sort: Record<string, SortOrder>,
    skip: number,
    limit: number
  ): Promise<IEnquiryDocument[]> {
    return Enquiry.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'college', select: 'name slug logo' })
      .exec();
  }

  /**
   * Counts the total number of documents matching a filter.
   */
  async count(filter: FilterQuery<IEnquiryDocument>): Promise<number> {
    return Enquiry.countDocuments(filter).exec();
  }

  /**
   * Find an enquiry by ID.
   */
  async findById(id: string): Promise<IEnquiryDocument | null> {
    return Enquiry.findById(id).populate({ path: 'college', select: 'name slug logo' }).exec();
  }

  /**
   * Create a new enquiry document.
   */
  async create(data: Partial<IEnquiryDocument>): Promise<IEnquiryDocument> {
    const enquiry = new Enquiry(data);
    return enquiry.save();
  }

  /**
   * Update an existing enquiry document by ID.
   */
  async update(
    id: string,
    updateData: Partial<IEnquiryDocument>
  ): Promise<IEnquiryDocument | null> {
    return Enquiry.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate({ path: 'college', select: 'name slug logo' })
      .exec();
  }

  /**
   * Hard delete an enquiry document by ID.
   */
  async delete(id: string): Promise<boolean> {
    const result = await Enquiry.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export default EnquiryRepository;
