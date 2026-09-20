// src/config/configuration.ts
/**
 * Configuration typée exposée via ConfigService.
 *
 * Utilisation dans le code :
 *   const config = app.get(ConfigService);
 *   const port = config.get<number>('app.port');
 *   const secret = config.get<string>('jwt.accessSecret');
 */

export interface AppConfig {
  app: {
    env: 'development' | 'production' | 'test';
    port: number;
    swaggerEnabled: boolean;
  };
  database: {
    url: string;
    directUrl?: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
}

export default (): AppConfig => ({
  app: {
    env: (process.env.NODE_ENV as AppConfig['app']['env']) ?? 'development',
    port: parseInt(process.env.PORT ?? '5000', 10),
    swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
  },
  database: {
    url: process.env.DATABASE_URL as string,
    directUrl: process.env.DIRECT_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
});