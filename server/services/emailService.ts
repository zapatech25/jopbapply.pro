import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'JobApply.pro <noreply@jobapply.pro>';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export function getBatchCompletionEmail(batchNumber: number, totalApplications: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .stats { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Batch Completed!</h1>
          </div>
          <div class="content">
            <p>Great news! Your application batch has been successfully processed.</p>
            
            <div class="stats">
              <p style="margin: 0;"><strong>Batch Number:</strong> #${batchNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>Total Applications:</strong> ${totalApplications}</p>
            </div>
            
            <p>All applications in this batch have been submitted and are now being tracked. You can view their status and progress in your dashboard.</p>
            
            <center>
              <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/dashboard" class="button">View Applications</a>
            </center>
            
            <p>We'll notify you when there are updates to your application statuses.</p>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPasswordResetEmail(resetLink: string, userEmail: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your JobApply.pro account associated with <strong>${userEmail}</strong>.</p>
            
            <p>Click the button below to reset your password. This link will expire in 60 minutes.</p>
            
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </div>
            
            <p>For security reasons, this link can only be used once.</p>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getStatusUpdateEmail(jobTitle: string, company: string, oldStatus: string, newStatus: string): string {
  const statusColors: Record<string, string> = {
    applied: '#3b82f6',
    in_review: '#eab308',
    interviewing: '#a855f7',
    rejected: '#ef4444',
    offer: '#22c55e',
  };

  const formatStatus = (status: string) => status.replace('_', ' ').toUpperCase();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0077FF 0%, #22C55E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .job-info { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .status-change { display: flex; align-items: center; justify-content: center; gap: 20px; margin: 30px 0; }
          .status { padding: 12px 20px; border-radius: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .button { display: inline-block; background: #0077FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <p>There's been an update to one of your job applications!</p>
            
            <div class="job-info">
              <p style="margin: 0;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0 0 0;"><strong>Company:</strong> ${company}</p>
            </div>
            
            <div class="status-change">
              <span class="status" style="background: ${statusColors[oldStatus] || '#6b7280'}20; color: ${statusColors[oldStatus] || '#6b7280'};">
                ${formatStatus(oldStatus)}
              </span>
              <span style="font-size: 24px;">→</span>
              <span class="status" style="background: ${statusColors[newStatus] || '#6b7280'}20; color: ${statusColors[newStatus] || '#6b7280'};">
                ${formatStatus(newStatus)}
              </span>
            </div>
            
            <p>Keep track of all your applications and their progress in your dashboard.</p>
            
            <center>
              <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/dashboard" class="button">View Dashboard</a>
            </center>
          </div>
          <div class="footer">
            <p>JobApply.pro - Streamlining your job search</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
