-- AlterTable
ALTER TABLE "prieres" ADD COLUMN     "notification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "rappels" ADD COLUMN     "notification" BOOLEAN NOT NULL DEFAULT false;
