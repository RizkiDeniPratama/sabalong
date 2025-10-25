/*
  Warnings:

  - A unique constraint covering the columns `[nama_layanan]` on the table `service_catalog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "service_catalog_nama_layanan_key" ON "hello-prisma"."service_catalog"("nama_layanan");
