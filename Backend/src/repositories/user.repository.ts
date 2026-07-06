import { User, IUserDocument } from '../models';
import { RegisterData } from '../types';

/**
 * UserRepository
 *
 * Implements the Repository Pattern for User collection operations.
 * Isolates Mongoose DB actions from business logic.
 */
export class UserRepository {
  /**
   * Find a user by their email address.
   * Can optionally include select fields (like password).
   */
  async findByEmail(email: string, includePassword = false): Promise<IUserDocument | null> {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Find a user by their ID.
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).exec();
  }

  /**
   * Find a user by their phone number.
   */
  async findByPhone(phone: string): Promise<IUserDocument | null> {
    return User.findOne({ phone: phone.trim() }).exec();
  }

  /**
   * Create a new user in the database.
   */
  async create(userData: RegisterData): Promise<IUserDocument> {
    const user = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      field: userData.field || '',
    });
    return user.save();
  }

  /**
   * Update user details.
   */
  async update(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  /**
   * Check if an email exists in the database.
   */
  async existsEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase().trim() });
    return count > 0;
  }

  /**
   * Check if a phone number exists in the database.
   */
  async existsPhone(phone: string): Promise<boolean> {
    const count = await User.countDocuments({ phone: phone.trim() });
    return count > 0;
  }

  /**
   * Finds users matching a filter, sorted and paginated.
   */
  async find(
    filter: any,
    sort: any,
    skip: number,
    limit: number
  ): Promise<IUserDocument[]> {
    return User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Count total user documents matching a filter.
   */
  async count(filter: any): Promise<number> {
    return User.countDocuments(filter).exec();
  }

  /**
   * Store hashed password reset token and expiry.
   */
  async savePasswordReset(
    userId: string,
    hashedToken: string,
    expiresAt: Date
  ): Promise<void> {
    await User.updateOne(
      { _id: userId },
      { $set: { passwordResetToken: hashedToken, passwordResetExpires: expiresAt } }
    );
  }

  /**
   * Find user by valid (non-expired) password reset token hash.
   */
  async findByPasswordResetToken(hashedToken: string): Promise<IUserDocument | null> {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    })
      .select('+password +passwordResetToken +passwordResetExpires')
      .exec();
  }

  /**
   * Clear password reset fields after successful reset.
   */
  async clearPasswordReset(userId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      { $unset: { passwordResetToken: '', passwordResetExpires: '' } }
    );
  }

  /**
   * Update user password hash.
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
  }
}

export default UserRepository;
