// src/modules/notifications/notifications.helper.ts
import { Injectable, Logger } from '@nestjs/common';
import Expo from 'expo-server-sdk';

import { NotificationType } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

import { NotificationsService } from './notifications.service.js';

/**
 * ⚠️ IMPORTANT : cet ID doit être IDENTIQUE à celui utilisé côté mobile
 * dans `src/services/push.service.ts` (ANDROID_CHANNEL_ID).
 *
 * Si tu changes la config du canal (sound, vibration…), tu DOIS changer
 * cet ID ET l'ID côté mobile, puis faire réinstaller l'app aux users.
 * Les canaux Android sont immuables une fois créés.
 */
const ANDROID_CHANNEL_ID = 'ssi-default-v2';

/**
 * Image affichée dans la notification (grande icône à droite).
 * ⚠️ Doit être une URL HTTPS publique (CDN, GitHub raw, etc.).
 */
const NOTIFICATION_IMAGE_URL =
  'https://raw.githubusercontent.com/open-tech-stack/public-images/main/illustration/00001.png';

/**
 * Payload interne de création d'une notification.
 */
interface CreateNotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  linkTo: string;
  sourceId: string;
}

@Injectable()
export class NotificationsHelper {
  private readonly logger = new Logger(NotificationsHelper.name);
  private readonly expo = new Expo();

  constructor(
    private readonly notifications: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  // ------------------------------------------------------------------
  // PROGRAMME
  // ------------------------------------------------------------------
  async notifyProgramme(programme: {
    id: string;
    title: string;
    summary: string;
  }) {
    await this.safeCreate({
      type: NotificationType.PROGRAMME,
      title: 'Nouveau programme publié',
      message: `${programme.title} — ${programme.summary}`,
      linkTo: `/programmes/${programme.id}`,
      sourceId: programme.id,
    });
  }

  // ------------------------------------------------------------------
  // ÉVÉNEMENT
  // ------------------------------------------------------------------
  async notifyEvenement(evenement: {
    id: string;
    title: string;
    summary: string;
  }) {
    await this.safeCreate({
      type: NotificationType.EVENEMENT,
      title: 'Nouvel événement',
      message: `${evenement.title} — ${evenement.summary}`,
      linkTo: `/evenements/${evenement.id}`,
      sourceId: evenement.id,
    });
  }

  // ------------------------------------------------------------------
  // INFO
  // ------------------------------------------------------------------
  async notifyInfo(info: { id: string; title: string; summary: string }) {
    await this.safeCreate({
      type: NotificationType.INFO,
      title: 'Nouvelle information',
      message: `${info.title} — ${info.summary}`,
      linkTo: `/infos/${info.id}`,
      sourceId: info.id,
    });
  }

  // ------------------------------------------------------------------
  // PRIÈRE
  // ------------------------------------------------------------------
  async notifyPriere(priere: { id: string; title: string }) {
    await this.safeCreate({
      type: NotificationType.PRIERE,
      title: 'Nouveau sujet de prière',
      message: priere.title,
      linkTo: `/prieres/${priere.id}`,
      sourceId: priere.id,
    });
  }

  // ------------------------------------------------------------------
  // RAPPEL
  // ------------------------------------------------------------------
  async notifyRappel(rappel: {
    id: string;
    title: string;
    detail?: string | null;
  }) {
    await this.safeCreate({
      type: NotificationType.RAPPEL,
      title: 'Nouveau rappel',
      message: rappel.title,
      linkTo: `/rappels/${rappel.id}`,
      sourceId: rappel.id,
    });
  }

  // ------------------------------------------------------------------
  // INTERNAL — best-effort (ne throw JAMAIS)
  // ------------------------------------------------------------------
  private async safeCreate(payload: CreateNotificationPayload): Promise<void> {
    try {
      // 1) Enregistre la notification en base
      await this.notifications.create({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        linkTo: payload.linkTo,
        sourceId: payload.sourceId,
      });

      // 2) Récupère les users avec un token push
      const users = await this.prisma.user.findMany({
        where: { expoPushToken: { not: null }, deletedAt: null },
        select: { expoPushToken: true },
      });

      // 3) Construit les messages Expo
      //
      //    ⚠️ Propriétés CRITIQUES pour son/vibration :
      //       - sound: 'default'       → iOS joue le son
      //       - priority: 'high'       → iOS réveille l'appareil
      //       - channelId: '<id>'      → Android utilise le canal
      //
      //    🎨 Propriétés de design :
      //       - richContent.image      → image à droite de la notif (Android)
      //       - autoDismiss: false     → la notif reste après un tap
      const messages = users
        .filter(
          (u): u is { expoPushToken: string } =>
            !!u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken),
        )
        .map((u) => ({
          to: u.expoPushToken,

          // Contenu
          title: payload.title,
          body: payload.message,

          // Son & vibration
          sound: 'default' as const,
          priority: 'high' as const,
          channelId: ANDROID_CHANNEL_ID,

          // Comportement
          autoDismiss: false,

          // 🖼️ Image dans la notif (grande icône à droite)
          richContent: {
            image: NOTIFICATION_IMAGE_URL,
          },

          // Deep link + type
          data: {
            linkTo: payload.linkTo,
            type: payload.type,
          },
        }));

      if (messages.length === 0) return;

      // 4) Envoi en chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);

        // Log les erreurs éventuelles (token invalide, etc.)
        tickets.forEach((ticket, i) => {
          if (ticket.status === 'error') {
            this.logger.warn(
              `Push error [${chunk[i]?.to ?? '?'}]: ${ticket.message} (${
                ticket.details?.error ?? 'unknown'
              })`,
            );
          }
        });
      }
    } catch (err) {
      this.logger.warn(
        `Échec notification (${payload.type}) : ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}