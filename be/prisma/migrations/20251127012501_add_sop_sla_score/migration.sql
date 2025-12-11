-- AlterTable
ALTER TABLE "hello-prisma"."service_catalog" ADD COLUMN     "flowchart" VARCHAR(255),
ADD COLUMN     "sop" TEXT;

-- AlterTable
ALTER TABLE "hello-prisma"."tickets" ADD COLUMN     "actual_duration" INTEGER,
ADD COLUMN     "sla_score" DOUBLE PRECISION,
ALTER COLUMN "response_deadline" DROP NOT NULL,
ALTER COLUMN "resolution_deadline" DROP NOT NULL;
