-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBRE');

-- CreateEnum
CREATE TYPE "ProgrammeKind" AS ENUM ('CULTE_DIMANCHE', 'PRIERE_VENDREDI');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');

-- CreateEnum
CREATE TYPE "InfoStatus" AS ENUM ('A_VENIR', 'EN_COURS', 'TERMINE', 'ANNULE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "ProgrammeSectionKey" AS ENUM ('ACCUEIL', 'ANIMATION', 'LOUANGE_ADORATION', 'PREDICATION', 'INTERPRETATION', 'PARKING', 'LIBRE');

-- CreateEnum
CREATE TYPE "EvenementKind" AS ENUM ('MARIAGE', 'CAMP', 'SORTIE', 'CONFERENCE', 'FORMATION', 'ACTION_DE_GRACE', 'JOURNEE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PublicCible" AS ENUM ('ENFANTS_ET_ADOS', 'ADOS', 'FEMMES_AFEC', 'JEUNESSE', 'ENFANTS_DE_PASTEURS', 'FEMMES', 'HOMMES_MARIES', 'PERSONNES_AGEES', 'CONSEIL', 'PASTEUR', 'VEUVES_ET_ORPHELINS', 'AUTRE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBRE',
    "personId" TEXT,
    "refreshTokenHash" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "fullName" TEXT NOT NULL,
    "role" TEXT,
    "avatar" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "kind" "ProgrammeKind" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "status" "InfoStatus" NOT NULL DEFAULT 'A_VENIR',
    "location" TEXT,
    "hasHolyCommunion" BOOLEAN,
    "holyCommunionMessage" TEXT,
    "notes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notification" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_sections" (
    "id" TEXT NOT NULL,
    "key" "ProgrammeSectionKey" NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "value" TEXT,
    "programmeId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "programme_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_section_persons" (
    "sectionId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "programme_section_persons_pkey" PRIMARY KEY ("sectionId","personId")
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL,
    "kind" "EvenementKind" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detail" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "status" "InfoStatus" NOT NULL DEFAULT 'A_VENIR',
    "location" TEXT,
    "publishedAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notification" BOOLEAN NOT NULL DEFAULT false,
    "brideName" TEXT,
    "groomName" TEXT,
    "townHallTime" TEXT,
    "townHallPlace" TEXT,
    "ceremonyTime" TEXT,
    "ceremonyPlace" TEXT,
    "receptionPlace" TEXT,
    "audience" "PublicCible",
    "audienceOther" TEXT,
    "theme" TEXT,
    "speaker" TEXT,
    "trainer" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detail" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prieres" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "location" TEXT,
    "detail" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rappels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rappels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rappel_elements" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "rappelId" TEXT NOT NULL,

    CONSTRAINT "rappel_elements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_code_key" ON "users"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_personId_key" ON "users"("personId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "people_fullName_idx" ON "people"("fullName");

-- CreateIndex
CREATE INDEX "people_deletedAt_idx" ON "people"("deletedAt");

-- CreateIndex
CREATE INDEX "groups_name_idx" ON "groups"("name");

-- CreateIndex
CREATE INDEX "groups_deletedAt_idx" ON "groups"("deletedAt");

-- CreateIndex
CREATE INDEX "programmes_kind_idx" ON "programmes"("kind");

-- CreateIndex
CREATE INDEX "programmes_status_idx" ON "programmes"("status");

-- CreateIndex
CREATE INDEX "programmes_startsAt_idx" ON "programmes"("startsAt");

-- CreateIndex
CREATE INDEX "programmes_deletedAt_idx" ON "programmes"("deletedAt");

-- CreateIndex
CREATE INDEX "programme_sections_programmeId_idx" ON "programme_sections"("programmeId");

-- CreateIndex
CREATE INDEX "programme_section_persons_personId_idx" ON "programme_section_persons"("personId");

-- CreateIndex
CREATE INDEX "evenements_kind_idx" ON "evenements"("kind");

-- CreateIndex
CREATE INDEX "evenements_startsAt_idx" ON "evenements"("startsAt");

-- CreateIndex
CREATE INDEX "evenements_deletedAt_idx" ON "evenements"("deletedAt");

-- CreateIndex
CREATE INDEX "infos_deletedAt_idx" ON "infos"("deletedAt");

-- CreateIndex
CREATE INDEX "infos_createdAt_idx" ON "infos"("createdAt");

-- CreateIndex
CREATE INDEX "prieres_deletedAt_idx" ON "prieres"("deletedAt");

-- CreateIndex
CREATE INDEX "prieres_date_idx" ON "prieres"("date");

-- CreateIndex
CREATE INDEX "rappels_deletedAt_idx" ON "rappels"("deletedAt");

-- CreateIndex
CREATE INDEX "rappels_createdAt_idx" ON "rappels"("createdAt");

-- CreateIndex
CREATE INDEX "rappel_elements_rappelId_idx" ON "rappel_elements"("rappelId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_sections" ADD CONSTRAINT "programme_sections_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_sections" ADD CONSTRAINT "programme_sections_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_section_persons" ADD CONSTRAINT "programme_section_persons_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "programme_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_section_persons" ADD CONSTRAINT "programme_section_persons_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rappel_elements" ADD CONSTRAINT "rappel_elements_rappelId_fkey" FOREIGN KEY ("rappelId") REFERENCES "rappels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
