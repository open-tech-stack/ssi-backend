// src/modules/health/health.service.ts
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Service health.
 *
 * Fournit un état synthétique de l'API et de la base de données.
 * Utilisé notamment pour les healthchecks de déploiement et pour
 * vérifier rapidement que la connexion Prisma fonctionne.
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Vérifie la connexion à la base et compte les entités principales.
   * Retourne un objet prêt à être exposé par le controller.
   */
  async check() {
    const startedAt = Date.now();

    let dbConnected = false;
    let counts: Record<string, number> = {};
    let dbError: string | null = null;

    try {
      // On compte toutes les entités principales en parallèle.
      const [
        users,
        people,
        groups,
        programmes,
        evenements,
        infos,
        prieres,
        rappels,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.person.count(),
        this.prisma.group.count(),
        this.prisma.programme.count(),
        this.prisma.evenement.count(),
        this.prisma.info.count(),
        this.prisma.priere.count(),
        this.prisma.rappel.count(),
      ]);

      counts = {
        users,
        people,
        groups,
        programmes,
        evenements,
        infos,
        prieres,
        rappels,
      };
      dbConnected = true;
    } catch (err) {
      dbConnected = false;
      dbError = err instanceof Error ? err.message : 'unknown error';
      this.logger.error(`Health check DB failed: ${dbError}`);
    }

    const durationMs = Date.now() - startedAt;

    return {
      status: dbConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      database: {
        connected: dbConnected,
        latencyMs: durationMs,
        counts,
        error: dbError,
      },
      version: process.env.npm_package_version ?? '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}