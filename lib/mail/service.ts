import { transporter } from "./transporter";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class EmailService {
  /**
   * Default sender
   */
  private static readonly defaultFrom =
    '"Executive Corner" <no-reply@execorner.com>';

  /**
   * Send email
   */
  static async send({
    from,
    ...options
  }: Mail.Options): Promise<SMTPTransport.SentMessageInfo> {
    try {
      const startedAt = Date.now();

      const info = await transporter.sendMail({
        from: from ?? EmailService.defaultFrom,
        ...options,
      });

      const duration = Date.now() - startedAt;

      console.log(
        [
          "📧 Email Sent",
          `To       : ${options.to}`,
          `Subject  : ${options.subject}`,
          `MessageID: ${info.messageId}`,
          `Duration : ${duration} ms`,
        ].join("\n"),
      );

      return info;
    } catch (error) {
      console.error("❌ Email Failed");

      console.error({
        to: options.to,
        subject: options.subject,
        error,
      });

      throw error;
    }
  }

  /**
   * Verify SMTP Connection
   */
  static async verify() {
    try {
      await transporter.verify();

      console.log("✅ SMTP Connected");
    } catch (error) {
      console.error("❌ SMTP Connection Failed");
      throw error;
    }
  }
}