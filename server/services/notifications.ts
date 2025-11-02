import { storage } from "../storage";
import type { InsertNotification } from "@shared/schema";
import { sendEmail, getBatchCompletionEmail, getStatusUpdateEmail } from "./emailService";

/**
 * Notification Service - Email and SMS notifications
 * 
 * This service provides notification delivery through multiple channels.
 * Integrated with Resend for email notifications.
 * SMS support ready for Twilio integration.
 */

export interface NotificationChannel {
  send(userEmail: string, message: string, metadata?: any): Promise<boolean>;
}

/**
 * Email Channel - Resend implementation
 */
class EmailChannel implements NotificationChannel {
  async send(userEmail: string, message: string, metadata?: any): Promise<boolean> {
    try {
      // Use template-based emails for better formatting
      if (metadata?.type === "batch_completion") {
        const html = getBatchCompletionEmail(metadata.batchNumber, metadata.totalApplications);
        return await sendEmail({
          to: userEmail,
          subject: `Batch #${metadata.batchNumber} Completed - ${metadata.totalApplications} Applications`,
          html,
        });
      } else if (metadata?.type === "status_change") {
        const html = getStatusUpdateEmail(
          metadata.jobTitle,
          metadata.company,
          metadata.oldStatus,
          metadata.newStatus
        );
        return await sendEmail({
          to: userEmail,
          subject: `Application Status Update - ${metadata.jobTitle}`,
          html,
        });
      } else {
        // Generic email for other notification types
        return await sendEmail({
          to: userEmail,
          subject: "JobApply.pro Notification",
          html: `<p>${message}</p>`,
        });
      }
    } catch (error) {
      console.error(`[Email] Failed to send to ${userEmail}:`, error);
      return false;
    }
  }
}

/**
 * SMS Channel - Placeholder implementation
 */
class SmsChannel implements NotificationChannel {
  async send(userId: string, message: string, metadata?: any): Promise<boolean> {
    console.log(`[SMS] Would send to user ${userId}: ${message}`);
    // TODO: Implement SMS provider (Twilio)
    return true;
  }
}

/**
 * Notification Service - Manages all notification delivery
 */
class NotificationService {
  private channels: Map<string, NotificationChannel>;

  constructor() {
    this.channels = new Map();
    this.channels.set("email", new EmailChannel());
    this.channels.set("sms", new SmsChannel());
  }

  /**
   * Send a notification through specified channels
   */
  async send(
    userId: string,
    type: string,
    message: string,
    channels: ("email" | "sms" | "in_app")[],
    metadata?: any
  ): Promise<void> {
    console.log(`[Notifications] Sending "${type}" to user ${userId} via channels:`, channels);

    // Always create in-app notification
    const notification: InsertNotification = {
      userId,
      type,
      message,
      channel: "in_app",
      metadata,
    };

    await storage.createNotification(notification);

    // Get user info and preferences
    const user = await storage.getUser(userId);
    if (!user) {
      console.error(`[Notifications] User ${userId} not found`);
      return;
    }

    const preferences = await storage.getUserNotificationPreferences(userId);

    // Send through additional channels based on preferences
    for (const channel of channels) {
      if (channel === "in_app") continue; // Already handled

      if (channel === "email" && preferences?.emailEnabled) {
        const emailChannel = this.channels.get("email");
        await emailChannel?.send(user.email, message, metadata);
      }

      if (channel === "sms" && preferences?.smsEnabled) {
        const smsChannel = this.channels.get("sms");
        await smsChannel?.send(user.phone || "", message, metadata);
      }
    }
  }

  /**
   * Trigger notification for batch completion
   */
  async notifyBatchCompletion(userId: string, batchNumber: number, totalApplications: number): Promise<void> {
    console.log(`[Notifications] Batch completion for user ${userId}, batch ${batchNumber}`);

    const preferences = await storage.getUserNotificationPreferences(userId);
    if (!preferences?.batchCompletionAlerts) {
      console.log(`[Notifications] Batch completion alerts disabled for user ${userId}`);
      return;
    }

    const message = `Batch ${batchNumber} completed! ${totalApplications} applications have been processed.`;
    const metadata = {
      batchNumber,
      totalApplications,
      type: "batch_completion",
    };

    await this.send(userId, "batch_completion", message, ["in_app", "email"], metadata);
  }

  /**
   * Trigger notification for application status change
   */
  async notifyStatusChange(
    userId: string,
    jobTitle: string,
    company: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    console.log(`[Notifications] Status change for user ${userId}: ${jobTitle} at ${company}`);

    const preferences = await storage.getUserNotificationPreferences(userId);
    if (!preferences?.statusUpdateAlerts) {
      console.log(`[Notifications] Status update alerts disabled for user ${userId}`);
      return;
    }

    const statusMessages: Record<string, string> = {
      in_review: "is now under review",
      interviewing: "has moved to interviewing stage",
      rejected: "was unfortunately rejected",
      offer: "resulted in an offer! Congratulations!",
    };

    const statusMessage = statusMessages[newStatus] || `status changed to ${newStatus}`;
    const message = `Your application for ${jobTitle} at ${company} ${statusMessage}.`;
    const metadata = {
      jobTitle,
      company,
      oldStatus,
      newStatus,
      type: "status_change",
    };

    await this.send(userId, "status_update", message, ["in_app", "email"], metadata);
  }

  /**
   * Trigger notification for batch processing start
   */
  async notifyBatchProcessing(userId: string, batchNumber: number, totalApplications: number): Promise<void> {
    console.log(`[Notifications] Batch processing started for user ${userId}, batch ${batchNumber}`);

    const message = `Batch ${batchNumber} is now being processed. ${totalApplications} applications are being submitted.`;
    const metadata = {
      batchNumber,
      totalApplications,
      type: "batch_processing",
    };

    await this.send(userId, "batch_processing", message, ["in_app"], metadata);
  }

  /**
   * Trigger notification for batch failure
   */
  async notifyBatchFailure(userId: string, batchNumber: number, error: string): Promise<void> {
    console.log(`[Notifications] Batch failure for user ${userId}, batch ${batchNumber}`);

    const message = `Batch ${batchNumber} encountered an error during processing. Our team has been notified.`;
    const metadata = {
      batchNumber,
      error,
      type: "batch_failure",
    };

    await this.send(userId, "batch_failure", message, ["in_app", "email"], metadata);
  }
}

export const notificationService = new NotificationService();
