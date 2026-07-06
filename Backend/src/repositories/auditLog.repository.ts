import { FilterQuery, SortOrder } from 'mongoose';
import { AuditLog, IAuditLogDocument } from '../models';

export class AuditLogRepository {
  /**
   * List logs sorted and paginated.
   */
  async find(
    filter: FilterQuery<IAuditLogDocument>,
    sort: Record<string, SortOrder>,
    skip: number,
    limit: number
  ): Promise<IAuditLogDocument[]> {
    return AuditLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'adminId', select: 'name email role' })
      .exec();
  }

  /**
   * Count total log entries matching a filter.
   */
  async count(filter: FilterQuery<IAuditLogDocument>): Promise<number> {
    return AuditLog.countDocuments(filter).exec();
  }

  /**
   * Create an audit log entry.
   */
  async create(data: Partial<IAuditLogDocument>): Promise<IAuditLogDocument> {
    const log = new AuditLog(data);
    return log.save();
  }
}

export default AuditLogRepository;
