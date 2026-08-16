import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

export class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Basic fallback or load from env
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || '"EllipMart" <noreply@ellipmart.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

// Global instance
export const emailService: EmailProvider = new SMTPProvider();
