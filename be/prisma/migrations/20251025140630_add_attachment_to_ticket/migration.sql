/*
  Warnings:

  - You are about to drop the column `priority_level` on the `service_catalog` table. All the data in the column will be lost.
  - Added the required column `default_priority` to the `service_catalog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hello-prisma"."service_catalog" DROP COLUMN "priority_level",
ADD COLUMN     "default_priority" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "hello-prisma"."tickets" ADD COLUMN     "attachment" VARCHAR(500);
