import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "opportunity_assigned"
  | "usecase_validated"
  | "survey_published"
  | "adr_created"
  | "assessment_completed"
  | "ingestion_done"
  | "briefing_ready"
  | "generic";

export interface SendNotificationOptions {
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

export async function sendNotification(opts: SendNotificationOptions) {
  return prisma.notification.create({
    data: {
      workspaceId: opts.workspaceId,
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body ?? null,
      link: opts.link ?? null,
    },
  });
}

export async function sendNotificationToMany(
  userIds: string[],
  opts: Omit<SendNotificationOptions, "userId">
) {
  if (userIds.length === 0) return;
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      workspaceId: opts.workspaceId,
      userId,
      type: opts.type,
      title: opts.title,
      body: opts.body ?? null,
      link: opts.link ?? null,
    })),
  });
}
