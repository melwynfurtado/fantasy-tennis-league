/*
  Warnings:

  - You are about to drop the column `gender` on the `Participant` table. All the data in the column will be lost.
  - Made the column `email` on table `Participant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_participantId_fkey";

-- DropForeignKey
ALTER TABLE "TeamPlayer" DROP CONSTRAINT "TeamPlayer_teamId_fkey";

-- Update NULL emails with placeholder values before making email required
UPDATE "Participant" SET "email" = 'participant' || "id" || '@example.com' WHERE "email" IS NULL;

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "gender",
ALTER COLUMN "email" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
