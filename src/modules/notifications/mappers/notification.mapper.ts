// src/modules/notifications/mappers/notification.mapper.ts
import type { Notification } from '../../../generated/prisma/client.js';

import type { NotificationResponse } from '../types/notification-response.type.js';

export class NotificationMapper {
  static toResponse(n: Notification): NotificationResponse {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      linkTo: n.linkTo,
      sourceId: n.sourceId,
      read: n.read,
      pushed: n.pushed,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    };
  }

  static toResponseList(items: Notification[]): NotificationResponse[] {
    return items.map((n) => NotificationMapper.toResponse(n));
  }
}