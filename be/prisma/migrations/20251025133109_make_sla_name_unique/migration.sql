/*
  Warnings:

  - A unique constraint covering the columns `[sla_name]` on the table `sla_config` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sla_config_sla_name_key" ON "hello-prisma"."sla_config"("sla_name");
