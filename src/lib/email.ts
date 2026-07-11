import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Brevo SMTP Client Configuration
// Used for: Newsletters, Marketing emails, Notifications, Broadcasting
// NOT used for: OTP/Auth emails (those use Supabase's built-in email)
// ---------------------------------------------------------------------------

const BREVO_SMTP_HOST = process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com";
const BREVO_SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT ?? "587", 10);
const BREVO_SMTP_LOGIN = process.env.BREVO_SMTP_LOGIN ?? "";
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY ?? "";
const BREVO_FROM_EMAIL =
  process.env.BREVO_FROM_EMAIL ?? "noreply@abwcurious.com";
const BREVO_FROM_NAME = "ABWcurious";

// Create a reusable transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: BREVO_SMTP_PORT,
  secure: BREVO_SMTP_PORT === 465, // true for port 465, false for 587
  auth: {
    user: BREVO_SMTP_LOGIN,
    pass: BREVO_SMTP_KEY,
  },
  // Connection pooling for better performance with batch sends
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 14, // messages per second (Brevo free tier: 300/day)
});

// Verify transporter on startup (non-blocking)
if (BREVO_SMTP_LOGIN && BREVO_SMTP_KEY) {
  transporter.verify().then(() => {
    console.log("[email] Brevo SMTP transporter ready (for newsletters/broadcasts)");
  }).catch((err: Error) => {
    console.warn("[email] Brevo SMTP verification failed:", err.message);
  });
} else {
  console.warn("[email] Brevo SMTP credentials not configured. Newsletter/broadcast features will not work.");
}

// ---------------------------------------------------------------------------
// Newsletter Email Wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps arbitrary HTML content in the ABWcurious branded email shell.
 */
function wrapNewsletterHtml(subject: string, htmlContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #f4f5f7; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    .email-wrapper { width: 100%; background-color: #f4f5f7; padding: 40px 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .email-header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 28px 40px; text-align: center; }
    .email-header h1 { margin: 0; color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 20px; font-weight: 700; }
    .email-body { padding: 32px 40px; font-family: 'Inter', Arial, sans-serif; color: #374151; font-size: 15px; line-height: 1.7; }
    .email-footer { padding: 24px 40px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .email-footer p { margin: 0 0 6px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .email-footer a { color: #0891b2; text-decoration: none; }
    .email-footer .brand { font-weight: 600; color: #6b7280; }
    @media only screen and (max-width: 600px) {
      .email-body, .email-header, .email-footer { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>ABWcurious</h1>
      </div>
      <div class="email-body">
        ${htmlContent}
      </div>
      <div class="email-footer">
        <p class="brand">ABWcurious &mdash; Curiosity Unleashed</p>
        <p>&copy; ${new Date().getFullYear()} ABWcurious. All rights reserved.</p>
        <p>
          <a href="https://abwcurious.com">abwcurious.com</a> &nbsp;&bull;&nbsp;
          <a href="https://abwcurious.com/privacy">Privacy Policy</a> &nbsp;&bull;&nbsp;
          <a href="%%unsubscribe%%">Unsubscribe</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Notification Email Wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps notification HTML content in the ABWcurious branded email shell.
 * Similar to newsletter but with a different header style for system notifications.
 */
function wrapNotificationHtml(subject: string, htmlContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #f4f5f7; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    .email-wrapper { width: 100%; background-color: #f4f5f7; padding: 40px 0; }
    .email-container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .email-header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 28px 40px; text-align: center; }
    .email-header h1 { margin: 0; color: #ffffff; font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 700; }
    .email-body { padding: 32px 40px; font-family: 'Inter', Arial, sans-serif; color: #374151; font-size: 15px; line-height: 1.7; }
    .email-footer { padding: 24px 40px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .email-footer p { margin: 0 0 6px; font-family: 'Inter', Arial, sans-serif; font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .email-footer a { color: #0891b2; text-decoration: none; }
    .email-footer .brand { font-weight: 600; color: #6b7280; }
    @media only screen and (max-width: 600px) {
      .email-body, .email-header, .email-footer { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>ABWcurious Notification</h1>
      </div>
      <div class="email-body">
        ${htmlContent}
      </div>
      <div class="email-footer">
        <p class="brand">ABWcurious &mdash; Curiosity Unleashed</p>
        <p>&copy; ${new Date().getFullYear()} ABWcurious. All rights reserved.</p>
        <p>
          <a href="https://abwcurious.com">abwcurious.com</a> &nbsp;&bull;&nbsp;
          <a href="https://abwcurious.com/privacy">Privacy Policy</a> &nbsp;&bull;&nbsp;
          <a href="https://abwcurious.com/preferences">Email Preferences</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Minimal HTML-escape to prevent injection in dynamic content.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ---------------------------------------------------------------------------
// Public API — Brevo Only (Newsletters, Notifications, Marketing)
// ---------------------------------------------------------------------------

/**
 * Sends a single newsletter / marketing email via Brevo SMTP.
 *
 * @param toEmail     - Recipient email address
 * @param subject     - Email subject line
 * @param htmlContent - Inner HTML content to be wrapped in the branded template
 * @returns           - Nodemailer send info on success
 * @throws            - Re-throws after logging if the send fails
 */
export async function sendNewsletterEmail(
  toEmail: string,
  subject: string,
  htmlContent: string,
) {
  const from = `${BREVO_FROM_NAME} <${BREVO_FROM_EMAIL}>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html: wrapNewsletterHtml(subject, htmlContent),
      headers: {
        "List-Unsubscribe": "<https://abwcurious.com/unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    console.log(
      `[email] Newsletter email sent to ${toEmail} – messageId: ${info.messageId}`,
    );
    return { id: info.messageId };
  } catch (error) {
    console.error(
      `[email] Failed to send newsletter email to ${toEmail}:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

/**
 * Sends a notification email via Brevo SMTP (event reminders, notices, alerts).
 *
 * @param toEmail     - Recipient email address
 * @param subject     - Email subject line
 * @param htmlContent - Inner HTML content to be wrapped in the notification template
 * @returns           - Nodemailer send info on success
 * @throws            - Re-throws after logging if the send fails
 */
export async function sendNotificationEmail(
  toEmail: string,
  subject: string,
  htmlContent: string,
) {
  const from = `${BREVO_FROM_NAME} <${BREVO_FROM_EMAIL}>`;

  try {
    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject,
      html: wrapNotificationHtml(subject, htmlContent),
    });

    console.log(
      `[email] Notification email sent to ${toEmail} – messageId: ${info.messageId}`,
    );
    return { id: info.messageId };
  } catch (error) {
    console.error(
      `[email] Failed to send notification email to ${toEmail}:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}

/**
 * Sends a newsletter to multiple recipients via Brevo SMTP (broadcasting).
 * Sends individually for better error isolation and deliverability.
 *
 * @param recipients  - Array of recipient email addresses
 * @param subject     - Email subject line
 * @param htmlContent - Inner HTML content to be wrapped in the branded template
 * @returns           - Object with sent count and any errors
 */
export async function sendNewsletterBatch(
  recipients: string[],
  subject: string,
  htmlContent: string,
) {
  const from = `${BREVO_FROM_NAME} <${BREVO_FROM_EMAIL}>`;
  const html = wrapNewsletterHtml(subject, htmlContent);

  let sentCount = 0;
  const errors: { email: string; error: string }[] = [];

  // Send emails in parallel batches for efficiency
  const BATCH_SIZE = 10;
  const batches: string[][] = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map(async (email) => {
        const info = await transporter.sendMail({
          from,
          to: email,
          subject,
          html,
          headers: {
            "List-Unsubscribe": "<https://abwcurious.com/unsubscribe>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        });
        return { email, messageId: info.messageId };
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        sentCount++;
        console.log(
          `[email] Newsletter sent to ${result.value.email} – messageId: ${result.value.messageId}`,
        );
      } else {
        const email = batch[results.indexOf(result)];
        const errorMsg =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        errors.push({ email, error: errorMsg });
        console.error(
          `[email] Failed to send newsletter to ${email}:`,
          errorMsg,
        );
      }
    }
  }

  console.log(
    `[email] Newsletter batch complete – sent: ${sentCount}, errors: ${errors.length}`,
  );

  return { sentCount, errors };
}
