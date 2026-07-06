import nodemailer from 'nodemailer';
import env from '../config/env';
import logger from '../utils/logger';
import ApiError from '../utils/ApiError';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import { buildPasswordResetEmail } from '../templates/passwordResetEmail';

export interface SmtpConfigStatus {
  configured: boolean;
  host: string;
  port: number;
  secure: boolean;
  missing: string[];
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
  }

  /**
   * Returns SMTP configuration status for diagnostics.
   */
  getSmtpStatus(): SmtpConfigStatus {
    const missing: string[] = [];
    if (!env.SMTP_HOST) missing.push('SMTP_HOST');
    if (!env.SMTP_PORT) missing.push('SMTP_PORT');
    if (!env.SMTP_USER) missing.push('SMTP_USER');
    if (!env.SMTP_PASS) missing.push('SMTP_PASS');

    return {
      configured: missing.length === 0,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      missing,
    };
  }

  isSmtpConfigured(): boolean {
    return this.getSmtpStatus().configured;
  }

  /**
   * Validates SMTP env vars and throws a descriptive ApiError when incomplete.
   */
  assertSmtpConfigured(): void {
    const status = this.getSmtpStatus();
    if (!status.configured) {
      logger.error('[Email] SMTP is not configured', { missing: status.missing });
      throw new ApiError(
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SMTP_NOT_CONFIGURED,
        `Email service is not configured. Missing: ${status.missing.join(', ')}. ` +
          'Set SMTP credentials in the backend .env file to enable password reset emails.'
      );
    }
  }

  /**
   * Sends an email. Throws ApiError on SMTP misconfiguration or delivery failure.
   */
  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    this.assertSmtpConfigured();

    logger.info(`[Email] Sending "${subject}" to ${to}`);

    try {
      await this.transporter.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
      });
      logger.info(`[Email] Sent successfully: "${subject}" to ${to}`);
    } catch (error) {
      const err = error as Error;
      logger.error(`[Email] Delivery failed: ${err.message}`, { to, subject, stack: err.stack });
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EMAIL_SEND_FAILED,
        'Failed to send email. Please verify SMTP credentials and try again.'
      );
    }
  }

  // ────────────────────────────────────────────────────────────
  // Templates
  // ────────────────────────────────────────────────────────────

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = `Welcome to EduVista, ${name}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Welcome to EduVista!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering on EduVista, the AI-Powered Educational Discovery Platform.</p>
        <p>You can now log in, search for top colleges, compare tuition fees, and manage your wishlist.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${env.FRONTEND_URL}/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Platform</a>
        </div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br/>The EduVista Team</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Reset Your EduVista Password';
    const html = buildPasswordResetEmail(name, resetUrl);
    await this.sendMail(to, subject, html);
  }

  async sendEnquiryConfirmationEmail(to: string, name: string, courseName: string): Promise<void> {
    const subject = 'We Received Your EduVista Enquiry';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Enquiry Received</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to EduVista. We have received your query regarding the course: <strong>${courseName}</strong>.</p>
        <p>Our educational counselors will review your details and contact you within 24 to 48 business hours.</p>
        <p>Thank you for choosing EduVista for your educational discovery journey.</p>
        <p>Best regards,<br/>The EduVista Team</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }

  async sendAdminNotificationEmail(adminEmail: string, details: Record<string, string>): Promise<void> {
    const subject = 'EduVista Alert: New Student Enquiry';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #4f46e5;">New Enquiry Received</h2>
        <p>A student has submitted a new inquiry query on the portal:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Student Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${details.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${details.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${details.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Interested Course:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${details.interestedCourse}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Message:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${details.message}</td>
          </tr>
        </table>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${env.FRONTEND_URL}/admin/enquiries" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Admin CRM</a>
        </div>
        <p>Best regards,<br/>EduVista Engine</p>
      </div>
    `;
    await this.sendMail(adminEmail, subject, html);
  }
}

export default EmailService;
