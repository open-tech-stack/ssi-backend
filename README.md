<div align="center">

# 🔧 SSI Backend

**API NestJS — SIM SOMGANDE Information**

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

API REST pour le dashboard web et l'application mobile de l'église SIM SOMGANDE.

[🌐 Dashboard](https://ssi-dashboard.vercel.app) · [📘 Swagger](https://ssi-backend-two.vercel.app/docs) · [📱 Mobile](https://github.com/<ton-compte>/sim-somgande)

</div>

---

## ✨ Fonctionnalités

- 🔐 **Auth JWT** — Login par code, access + refresh tokens, rotation
- 🍪 **Double flux web/mobile** — Cookies `httpOnly` (web) ou tokens dans le body (mobile)
- 📦 **9 modules CRUD** — Programmes, événements, infos, prières, rappels, personnes, groupes, users, notifications
- 🗑️ **Soft delete + restore** — Corbeille sur tous les modules + suppression définitive
- 🔔 **Push notifications** — Expo Push Service (Android + iOS)
- 👤 **Notifications par user** — Table `NotificationRead` pour un état "lu" individuel
- 📝 **Audit** — Logs masqués (jamais de code en clair)

---

## 🏗️ Stack

| Couche | Technologie |
|---|---|
| **Framework** | NestJS 11 |
| **Langage** | TypeScript 5 (strict) |
| **ORM** | Prisma 6 |
| **DB** | PostgreSQL 16 (Prisma Cloud) |
| **Auth** | Passport JWT + bcrypt |
| **Push** | expo-server-sdk |
| **Docs** | Swagger (OpenAPI 3) |
| **Déploiement** | Vercel (Serverless) |

---

## 🚀 Démarrage rapide

```bash
# 1. Clone
git clone https://github.com/<ton-compte>/ssi-backend.git
cd ssi-backend

# 2. Installe
npm install

# 3. Configure
cp .env.example .env
# Édite .env (voir Configuration)

# 4. Migrations Prisma
npx prisma migrate deploy
npx prisma generate

# 5. Lance
npm run start:dev


NODE_ENV=development
PORT=5000
DATABASE_URL=<URL Prisma dev>
DIRECT_URL=<URL Prisma dev>
JWT_ACCESS_SECRET=<secret dev>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<secret dev>
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=
SWAGGER_ENABLED=true


src/
├── modules/
│   ├── auth/              # Login, refresh, logout, me
│   ├── users/             # Gestion des comptes + push tokens
│   ├── people/            # Répertoire des personnes
│   ├── groups/            # Groupes (musical, protocole…)
│   ├── programmes/        # Cultes + prières
│   ├── evenements/        # Événements
│   ├── infos/             # Annonces
│   ├── prieres/           # Sujets de prière
│   ├── rappels/           # Rappels + éléments
│   └── notifications/     # Notifications + push helper
├── common/
│   ├── decorators/        # @Public, @Roles, @CurrentUser
│   ├── guards/            # JwtAuthGuard, RolesGuard
│   └── filters/           # Exceptions globales
├── config/                # Configuration typée
├── prisma/                # PrismaService
├── generated/             # Client Prisma (généré)
└── main.ts                # Bootstrap NestJS