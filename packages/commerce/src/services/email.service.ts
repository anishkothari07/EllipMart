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
  private getTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = port === 465;
    const user = process.env.SMTP_USER || 'test';
    const from = process.env.SMTP_FROM || '"SmartGO" <noreply@smartgo.com>';

    console.log("---- SMTP CONFIGURATION ----");
    console.log({
      host,
      port,
      secure,
      user,
      from
    });
    console.log("----------------------------");

    try {
      await this.getTransporter().sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error("---- NODEMAILER ERROR ----");
      console.error(error);
      console.error("--------------------------");
      throw error;
    }
  }
}

// Global instance
export const emailService: EmailProvider = new SMTPProvider();
