/*
  Warnings:

  - Added the required column `tokenExpiration` to the `Integration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "tokenExpiration" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "internalId" DROP NOT NULL,
ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "profile" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "audience" SET DEFAULT 0,
ALTER COLUMN "pictureId" DROP NOT NULL,
ALTER COLUMN "providerId" DROP NOT NULL,
ALTER COLUMN "timezone" SET DEFAULT 0,
ALTER COLUMN "lastReadNotifications" DROP NOT NULL,
ALTER COLUMN "inviteId" DROP NOT NULL;
