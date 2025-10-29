-- CreateTable
CREATE TABLE "hello-prisma"."roles" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,
    "role_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."users" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "instansi" VARCHAR(100),
    "alamat" TEXT,
    "no_telepon" VARCHAR(20),
    "avatar" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."skills" (
    "id" SERIAL NOT NULL,
    "skill_name" VARCHAR(100) NOT NULL,
    "skill_description" TEXT,
    "kategori" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."user_skills" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."sla_config" (
    "id" SERIAL NOT NULL,
    "sla_name" VARCHAR(100) NOT NULL,
    "response_hours" INTEGER NOT NULL,
    "resolution_hours" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."service_skills" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "service_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."service_catalog" (
    "id" SERIAL NOT NULL,
    "nama_layanan" VARCHAR(150) NOT NULL,
    "deskripsi" TEXT,
    "kategori" VARCHAR(50),
    "sla_id" INTEGER NOT NULL,
    "priority_level" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "icon" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(20) NOT NULL,
    "judul_permohonan" VARCHAR(200) NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "priority" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "eskalasi_reason" TEXT,
    "response_deadline" TIMESTAMP(3) NOT NULL,
    "resolution_deadline" TIMESTAMP(3) NOT NULL,
    "first_response_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assigned_to_id" INTEGER,
    "eskalasi_from_id" INTEGER,
    "service_id" INTEGER NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."ticket_logs" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "action_by" INTEGER NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "old_value" VARCHAR(100),
    "new_value" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."feedbacks" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hello-prisma"."notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ticket_id" INTEGER,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "hello-prisma"."roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "hello-prisma"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_is_available_idx" ON "hello-prisma"."users"("role_id", "is_available");

-- CreateIndex
CREATE UNIQUE INDEX "skills_skill_name_key" ON "hello-prisma"."skills"("skill_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_user_id_skill_id_key" ON "hello-prisma"."user_skills"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_skills_service_id_skill_id_key" ON "hello-prisma"."service_skills"("service_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticket_number_key" ON "hello-prisma"."tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "tickets_status_assigned_to_id_idx" ON "hello-prisma"."tickets"("status", "assigned_to_id");

-- CreateIndex
CREATE INDEX "ticket_logs_ticket_id_created_at_idx" ON "hello-prisma"."ticket_logs"("ticket_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_ticket_id_key" ON "hello-prisma"."feedbacks"("ticket_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "hello-prisma"."notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "hello-prisma"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "hello-prisma"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hello-prisma"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "hello-prisma"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."service_skills" ADD CONSTRAINT "service_skills_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "hello-prisma"."service_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."service_skills" ADD CONSTRAINT "service_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "hello-prisma"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."service_catalog" ADD CONSTRAINT "service_catalog_sla_id_fkey" FOREIGN KEY ("sla_id") REFERENCES "hello-prisma"."sla_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."tickets" ADD CONSTRAINT "tickets_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "hello-prisma"."service_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hello-prisma"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."tickets" ADD CONSTRAINT "tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "hello-prisma"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."tickets" ADD CONSTRAINT "tickets_eskalasi_from_id_fkey" FOREIGN KEY ("eskalasi_from_id") REFERENCES "hello-prisma"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."ticket_logs" ADD CONSTRAINT "ticket_logs_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "hello-prisma"."tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."ticket_logs" ADD CONSTRAINT "ticket_logs_action_by_fkey" FOREIGN KEY ("action_by") REFERENCES "hello-prisma"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."feedbacks" ADD CONSTRAINT "feedbacks_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "hello-prisma"."tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hello-prisma"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "hello-prisma"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hello-prisma"."notifications" ADD CONSTRAINT "notifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "hello-prisma"."tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
