// src/modules/notifications/mappers/notification.mapper.ts
import type { Notification } from '../../../generated/prisma/client.js';

import type { NotificationResponse } from '../types/notification-response.type.js';

/**
 * Le mapper reçoit soit une Notification brute (avec `read: false`
 * par défaut), soit une Notification enrichie avec `read` calculé
 * pour un user donné.
 */
type NotificationWithRead = Notification & { read: boolean };

export class NotificationMapper {
  static toResponse(n: NotificationWithRead): NotificationResponse {
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

  static toResponseList(items: NotificationWithRead[]): NotificationResponse[] {
    return items.map((n) => NotificationMapper.toResponse(n));
  }
}