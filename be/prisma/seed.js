// prisma/seed.js
import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai proses seeding V5.1 (Versi Lengkap)...");

  // --- 1. Seed Roles (Metode UPSERT: Aman) ---
  console.log("Mengisi data Roles...");
  const roleUser = await prisma.role.upsert({
    where: { role_name: "user" },
    update: {},
    create: { role_name: "user", role_description: "Pengguna akhir" },
  });
  // ... (kode untuk rolePetugas, roleAdmin, rolePimpinan tetap sama) ...
  const rolePetugas = await prisma.role.upsert({
    where: { role_name: "petugas" },
    update: {},
    create: { role_name: "petugas", role_description: "Petugas teknis" },
  });
  const roleAdmin = await prisma.role.upsert({
    where: { role_name: "admin" },
    update: {},
    create: { role_name: "admin", role_description: "Administrator sistem" },
  });
  const rolePimpinan = await prisma.role.upsert({
    where: { role_name: "pimpinan" },
    update: {},
    create: { role_name: "pimpinan", role_description: "Pimpinan" },
  });

  // --- 2. Seed Skills (Metode UPSERT: Aman) ---
  console.log("Mengisi data Skills...");
  const skillFE = await prisma.skill.upsert({
    where: { skill_name: "Frontend Development" },
    update: {},
    create: { skill_name: "Frontend Development", kategori: "Development" },
  });
  const skillBE = await prisma.skill.upsert({
    where: { skill_name: "Backend Development" },
    update: {},
    create: { skill_name: "Backend Development", kategori: "Development" },
  });
  const skillDB = await prisma.skill.upsert({
    where: { skill_name: "Database Management" },
    update: {},
    create: { skill_name: "Database Management", kategori: "Data" },
  });
  const skillJaringan = await prisma.skill.upsert({
    where: { skill_name: "Network Administration" },
    update: {},
    create: { skill_name: "Network Administration", kategori: "Network" },
  });
  const skillCyber = await prisma.skill.upsert({
    where: { skill_name: "Cybersecurity" },
    update: {},
    create: { skill_name: "Cybersecurity", kategori: "Security" },
  });
  const skillData = await prisma.skill.upsert({
    where: { skill_name: "Data Analysis" },
    update: {},
    create: { skill_name: "Data Analysis", kategori: "Data" },
  });
  const skillDesign = await prisma.skill.upsert({
    where: { skill_name: "UI/UX Design" },
    update: {},
    create: { skill_name: "UI/UX Design", kategori: "Design" },
  });

  // --- 3. Seed SLA Configs (Metode UPSERT: Aman) ---
  console.log("Mengisi data SLA Configs...");
  const slaStandard = await prisma.slaConfig.upsert({
    where: { sla_name: "Standard" },
    update: {},
    create: { sla_name: "Standard", response_hours: 4, resolution_hours: 72 }, // 3 hari
  });
  const slaExpress = await prisma.slaConfig.upsert({
    where: { sla_name: "Express" },
    update: {},
    create: { sla_name: "Express", response_hours: 2, resolution_hours: 24 }, // 1 hari
  });
  const slaExtended = await prisma.slaConfig.upsert({
    where: { sla_name: "Extended" },
    update: {},
    create: { sla_name: "Extended", response_hours: 24, resolution_hours: 168 }, // 1 minggu
  });

  // --- 4. Seed Users (Metode UPSERT: Aman) ---
  console.log('Mengisi data Users (password: "password123")...');
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sumbawakab.go.id" },
    update: {},
    create: {
      role_id: roleAdmin.id,
      nama: "Admin Diskominfo",
      email: "admin@sumbawakab.go.id",
      password: hashedPassword,
      instansi: "Diskominfotiksandi Kab. Sumbawa",
    },
  });
  // ... (kode untuk petugas1, petugas2, user1 tetap sama) ...
  const petugas1 = await prisma.user.upsert({
    where: { email: "ahmad@sumbawakab.go.id" },
    update: {},
    create: {
      role_id: rolePetugas.id,
      nama: "Ahmad Petugas (BE/DB)",
      email: "ahmad@sumbawakab.go.id",
      password: hashedPassword,
      instansi: "Diskominfotiksandi Kab. Sumbawa",
    },
  });
  const petugas2 = await prisma.user.upsert({
    where: { email: "siti@sumbawakab.go.id" },
    update: {},
    create: {
      role_id: rolePetugas.id,
      nama: "Siti Petugas (Jaringan)",
      email: "siti@sumbawakab.go.id",
      password: hashedPassword,
      instansi: "Diskominfotiksandi Kab. Sumbawa",
    },
  });
  const user1 = await prisma.user.upsert({
    where: { email: "budi@email.com" },
    update: {},
    create: {
      role_id: roleUser.id,
      nama: "Budi Santoso",
      email: "budi@email.com",
      password: hashedPassword,
      instansi: "Dinas Pendidikan",
    },
  });

  // --- 5. Seed UserSkills (Relasi Petugas <-> Skill) ---
  console.log("Menghubungkan Skills ke Petugas...");
  // (Data tetap sama, Anda bisa tambahkan jika perlu)
  await prisma.userSkill.upsert({
    where: { user_id_skill_id: { user_id: petugas1.id, skill_id: skillBE.id } },
    update: {},
    create: { user_id: petugas1.id, skill_id: skillBE.id, level: "senior" },
  });
  await prisma.userSkill.upsert({
    where: { user_id_skill_id: { user_id: petugas1.id, skill_id: skillDB.id } },
    update: {},
    create: { user_id: petugas1.id, skill_id: skillDB.id, level: "junior" },
  });
  await prisma.userSkill.upsert({
    where: {
      user_id_skill_id: { user_id: petugas2.id, skill_id: skillJaringan.id },
    },
    update: {},
    create: {
      user_id: petugas2.id,
      skill_id: skillJaringan.id,
      level: "senior",
    },
  });

  // --- 6. [DIPERBARUI] Seed ServiceCatalog (Semua 16 Layanan) ---
  console.log("Mengisi data Service Catalog (16 Layanan)...");

  // Kategori Development
  const srvWeb = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengembangan Website" },
    update: {},
    create: {
      nama_layanan: "Pengembangan Website",
      kategori: "Development",
      sla_id: slaExtended.id,
      default_priority: "medium",
    },
  });
  const srvApp = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengembangan Aplikasi" },
    update: {},
    create: {
      nama_layanan: "Pengembangan Aplikasi",
      kategori: "Development",
      sla_id: slaExtended.id,
      default_priority: "medium",
    },
  });
  const srvArVr = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengembangan Immersive Digital (AR/VR)" },
    update: {},
    create: {
      nama_layanan: "Pengembangan Immersive Digital (AR/VR)",
      kategori: "Development",
      sla_id: slaExtended.id,
      default_priority: "high",
    },
  });

  // Kategori Jaringan & Infrastruktur
  const srvEmail = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengajuan Email & Domain" },
    update: {},
    create: {
      nama_layanan: "Pengajuan Email & Domain",
      kategori: "Infrastructure",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });
  const srvZoom = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Fasilitasi Zoom" },
    update: {},
    create: {
      nama_layanan: "Fasilitasi Zoom",
      kategori: "Infrastructure",
      sla_id: slaStandard.id,
      default_priority: "low",
    },
  });
  const srvColo = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Colocation Server" },
    update: {},
    create: {
      nama_layanan: "Colocation Server",
      kategori: "Infrastructure",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });
  const srvJaringan = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Gangguan/Pasang Baru Jaringan" },
    update: {},
    create: {
      nama_layanan: "Gangguan/Pasang Baru Jaringan",
      kategori: "Infrastructure",
      sla_id: slaExpress.id,
      default_priority: "high",
    },
  });
  const srvWifi = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pemasangan Wifi Publik" },
    update: {},
    create: {
      nama_layanan: "Pemasangan Wifi Publik",
      kategori: "Infrastructure",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });
  const srvHosting = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Hosting & Cloud" },
    update: {},
    create: {
      nama_layanan: "Hosting & Cloud",
      kategori: "Infrastructure",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });
  const srvLive = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Fasilitasi Live Streaming" },
    update: {},
    create: {
      nama_layanan: "Fasilitasi Live Streaming",
      kategori: "Infrastructure",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });

  // Kategori Keamanan & Tata Kelola
  const srvTte = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengajuan TTE" },
    update: {},
    create: {
      nama_layanan: "Pengajuan TTE",
      kategori: "Security",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });
  const srvSiber = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengaduan Insiden Siber" },
    update: {},
    create: {
      nama_layanan: "Pengaduan Insiden Siber",
      kategori: "Security",
      sla_id: slaExpress.id,
      default_priority: "urgent",
    },
  });
  const srvSpbe = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Konsultasi Arsitektur SPBE" },
    update: {},
    create: {
      nama_layanan: "Konsultasi Arsitektur SPBE",
      kategori: "Governance",
      sla_id: slaExtended.id,
      default_priority: "medium",
    },
  });
  const srvClearance = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengajuan Clearance Belanja TIK" },
    update: {},
    create: {
      nama_layanan: "Pengajuan Clearance Belanja TIK",
      kategori: "Governance",
      sla_id: slaStandard.id,
      default_priority: "medium",
    },
  });

  // Kategori Data & Integrasi
  const srvIntegrasi = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Integrasi Sistem/Data (SPLP)" },
    update: {},
    create: {
      nama_layanan: "Integrasi Sistem/Data (SPLP)",
      kategori: "Data",
      sla_id: slaExtended.id,
      default_priority: "high",
    },
  });
  const srvData = await prisma.serviceCatalog.upsert({
    where: { nama_layanan: "Pengolahan dan Analitik Data" },
    update: {},
    create: {
      nama_layanan: "Pengolahan dan Analitik Data",
      kategori: "Data",
      sla_id: slaExtended.id,
      default_priority: "medium",
    },
  });

  // --- 7. [DIPERBARUI] Seed ServiceSkills (Relasi untuk semua layanan) ---
  console.log("Menghubungkan Skills ke Layanan (Multi-Skill)...");

  // Relasi (Saran - bisa Anda ubah)
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvWeb.id, skill_id: skillFE.id },
    },
    update: {},
    create: { service_id: srvWeb.id, skill_id: skillFE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvWeb.id, skill_id: skillBE.id },
    },
    update: {},
    create: { service_id: srvWeb.id, skill_id: skillBE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvWeb.id, skill_id: skillDB.id },
    },
    update: {},
    create: { service_id: srvWeb.id, skill_id: skillDB.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvWeb.id, skill_id: skillDesign.id },
    },
    update: {},
    create: { service_id: srvWeb.id, skill_id: skillDesign.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvApp.id, skill_id: skillFE.id },
    },
    update: {},
    create: { service_id: srvApp.id, skill_id: skillFE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvApp.id, skill_id: skillBE.id },
    },
    update: {},
    create: { service_id: srvApp.id, skill_id: skillBE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvApp.id, skill_id: skillDB.id },
    },
    update: {},
    create: { service_id: srvApp.id, skill_id: skillDB.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvArVr.id, skill_id: skillFE.id },
    },
    update: {},
    create: { service_id: srvArVr.id, skill_id: skillFE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvArVr.id, skill_id: skillDesign.id },
    },
    update: {},
    create: { service_id: srvArVr.id, skill_id: skillDesign.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvEmail.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvEmail.id, skill_id: skillJaringan.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvZoom.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvZoom.id, skill_id: skillJaringan.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvColo.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvColo.id, skill_id: skillJaringan.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvJaringan.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvJaringan.id, skill_id: skillJaringan.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvWifi.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvWifi.id, skill_id: skillJaringan.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvHosting.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvHosting.id, skill_id: skillJaringan.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvLive.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvLive.id, skill_id: skillJaringan.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvTte.id, skill_id: skillCyber.id },
    },
    update: {},
    create: { service_id: srvTte.id, skill_id: skillCyber.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvSiber.id, skill_id: skillCyber.id },
    },
    update: {},
    create: { service_id: srvSiber.id, skill_id: skillCyber.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvSpbe.id, skill_id: skillBE.id },
    },
    update: {},
    create: { service_id: srvSpbe.id, skill_id: skillBE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvClearance.id,
        skill_id: skillJaringan.id,
      },
    },
    update: {},
    create: { service_id: srvClearance.id, skill_id: skillJaringan.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvIntegrasi.id,
        skill_id: skillBE.id,
      },
    },
    update: {},
    create: { service_id: srvIntegrasi.id, skill_id: skillBE.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: {
        service_id: srvIntegrasi.id,
        skill_id: skillDB.id,
      },
    },
    update: {},
    create: { service_id: srvIntegrasi.id, skill_id: skillDB.id },
  });

  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvData.id, skill_id: skillData.id },
    },
    update: {},
    create: { service_id: srvData.id, skill_id: skillData.id },
  });
  await prisma.serviceSkill.upsert({
    where: {
      service_id_skill_id: { service_id: srvData.id, skill_id: skillDB.id },
    },
    update: {},
    create: { service_id: srvData.id, skill_id: skillDB.id },
  });

  console.log("\n🎉 Seeding V5.1 (Lengkap) selesai!");
  console.log('\n📝 Default credentials (password: "password123"):');
  console.log(`Admin: ${adminUser.email}`);
  console.log(`Petugas 1: ${petugas1.email}`);
  console.log(`Petugas 2: ${petugas2.email}`);
  console.log(`User: ${user1.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Koneksi database ditutup.");
  });
