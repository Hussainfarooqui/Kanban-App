/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `boardId` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `url` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Column` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Column` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_boardId_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileUrl",
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "boardId",
DROP COLUMN "name",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Board";
