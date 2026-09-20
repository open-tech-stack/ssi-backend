// src/modules/notifications/notifications.helper.ts
import { Injectable, Logger } from '@nestjs/common';
import Expo from 'expo-server-sdk';

import { NotificationType } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

import { NotificationsService } from './notifications.service.js';

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

/**
 * Helper pour créer des notifications depuis d'autres services
 * (Programmes, Événements, Infos, Prières, Rappels) sans coupler
 * les modules entre eux.
 *
 * ⚠️ Toutes les méthodes sont "best-effort" : elles ne throw JAMAIS.
 * Une erreur de notification ne doit pas faire échouer la création
 * de l'entité métier.
 */
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
  // INTERNAL — best-effort
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
      const messages = users
        .filter(
          (u): u is { expoPushToken: string } =>
            !!u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken),
        )
        .map((u) => ({
          to: u.expoPushToken,
          sound: 'default' as const,
          title: payload.title,
          body: payload.message,
          data: { linkTo: payload.linkTo, type: payload.type },
        }));

      if (messages.length === 0) return;

      // 4) Envoi en chunks
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
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