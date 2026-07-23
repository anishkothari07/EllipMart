import { prisma as db } from "@/lib/prisma/client";
import { NotificationStatus } from "@prisma/client";
import { providerRegistry } from "./providers/provider.registry";

export class NotificationJobProcessor {
  /**
   * Process a NotificationJob with exponential retries and Dead Letter Queue management
   */
  static async processJob(jobId: string) {
    const job = await db.notificationJob.findUnique({
      where: { id: jobId },
      include: { notification: { include: { actions: true } } },
    });

    if (!job || job.status === NotificationStatus.SENT || job.status === NotificationStatus.DEAD) {
      return;
    }

    const { notification } = job;
    if (!notification) return;

    // Update job to PROCESSING
    await db.notificationJob.update({
      where: { id: jobId },
      data: { status: NotificationStatus.PROCESSING },
    });

    const provider = providerRegistry.getDefault(notification.channel);
    const recipientContact = notification.recipientContact || notification.recipientId || "";

    const payloadObj = notification.payload ? JSON.parse(notification.payload) : {};

    const dispatchResult = await provider.send({
      recipient: recipientContact,
      subject: notification.title || undefined,
      body: notification.body || "",
      html: notification.body || undefined,
      title: notification.title || undefined,
      data: payloadObj,
      actions: notification.actions.map((a) => ({ label: a.label, url: a.url, type: a.type })),
    });

    // Log delivery entry in NotificationLog
    await db.notificationLog.create({
      data: {
        notificationId: notification.id,
        recipient: recipientContact,
        provider: dispatchResult.providerName,
        channel: notification.channel,
        templateId: notification.templateId,
        latencyMs: dispatchResult.latencyMs,
        status: dispatchResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        response: JSON.stringify(dispatchResult.responseRaw || { error: dispatchResult.error }),
        retries: job.attempts,
      },
    });

    if (dispatchResult.success) {
      // Mark Job & Notification as SENT
      await db.notificationJob.update({
        where: { id: jobId },
        data: { status: NotificationStatus.SENT },
      });
      await db.notification.update({
        where: { id: notification.id },
        data: { status: NotificationStatus.SENT, sentAt: new Date() },
      });
    } else {
      const nextAttempt = job.attempts + 1;
      const isDead = nextAttempt >= job.maxRetries;

      if (isDead) {
        // Move to Dead Letter Queue (DEAD)
        await db.notificationJob.update({
          where: { id: jobId },
          data: {
            attempts: nextAttempt,
            lastError: dispatchResult.error,
            status: NotificationStatus.DEAD,
          },
        });
        await db.notification.update({
          where: { id: notification.id },
          data: { status: NotificationStatus.DEAD, failedAt: new Date() },
        });
      } else {
        // Exponential backoff retry calculation (2^attempts * 1000ms)
        const delayMs = Math.pow(2, nextAttempt) * 1000;
        const nextAttemptAt = new Date(Date.now() + delayMs);

        await db.notificationJob.update({
          where: { id: jobId },
          data: {
            attempts: nextAttempt,
            lastError: dispatchResult.error,
            status: NotificationStatus.RETRYING,
            nextAttemptAt,
          },
        });
        await db.notification.update({
          where: { id: notification.id },
          data: { status: NotificationStatus.RETRYING },
        });
      }
    }
  }

  /**
   * Process all pending / retry jobs ready for execution
   */
  static async processPendingJobs() {
    const pendingJobs = await db.notificationJob.findMany({
      where: {
        status: { in: [NotificationStatus.PENDING, NotificationStatus.RETRYING] },
        nextAttemptAt: { lte: new Date() },
      },
      take: 20,
    });

    for (const job of pendingJobs) {
      await this.processJob(job.id);
    }
  }
}
