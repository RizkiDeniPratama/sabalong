import prisma from "../config/prisma.js";

export async function getAllServices(req, res) {
  try {
    const services = await prisma.serviceCatalog.findMany({
      where: {
        is_active: true,
      },
      include: {
        sla: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        nama_layanan: "asc",
      },
    });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data layanan",
      error: error.message,
    });
  }
}

export async function getServiceById(req, res) {
  const { id } = req.params;
  try {
    const service = await prisma.serviceCatalog.findUnique({
      where: { id: parseInt(id) },
      include: {
        sla: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Layanan tidak ditemukan" });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data layanan",
      error: error.message,
    });
  }
}

export async function createService(req, res) {
  try {
    const {
      nama_layanan,
      deskripsi,
      kategori,
      sla_id,
      default_priority,
      icon,
      skill_ids, // Ini akan berupa array ID skill, misal: [1, 2, 5]
    } = req.body;

    // Validasi input dasar
    if (
      !nama_layanan ||
      !sla_id ||
      !skill_ids ||
      !Array.isArray(skill_ids) ||
      skill_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama layanan, ID SLA, dan minimal satu ID Skill wajib diisi",
      });
    }

    // Gunakan transaksi Prisma untuk memastikan semua operasi berhasil atau gagal bersamaan
    const newService = await prisma.$transaction(async (tx) => {
      // 1. Buat ServiceCatalog dulu
      const service = await tx.serviceCatalog.create({
        data: {
          nama_layanan,
          deskripsi,
          kategori,
          sla_id: parseInt(sla_id),
          default_priority,
          icon,
          is_active: true, // Default aktif saat dibuat
        },
      });

      // 2. Siapkan data untuk tabel pivot ServiceSkill
      const serviceSkillData = skill_ids.map((skillId) => ({
        service_id: service.id,
        skill_id: parseInt(skillId),
      }));

      // 3. Masukkan data ke ServiceSkill
      await tx.serviceSkill.createMany({
        data: serviceSkillData,
      });

      return service; // Kembalikan data service yang baru dibuat
    });

    // Ambil data lengkap service yang baru dibuat beserta relasinya
    const createdServiceWithDetails = await prisma.serviceCatalog.findUnique({
      where: { id: newService.id },
      include: {
        sla: true,
        skills: { include: { skill: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Layanan berhasil dibuat",
      data: createdServiceWithDetails,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama layanan sudah ada" });
    }
    if (error.code === "P2003") {
      // Foreign key constraint failed (misal skill_id tidak ada)
      return res.status(400).json({
        success: false,
        message: "ID SLA atau salah satu ID Skill tidak valid.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat layanan baru",
      error: error.message,
    });
  }
}

export async function updateService(req, res) {
  const { id } = req.params;
  const {
    nama_layanan,
    deskripsi,
    kategori,
    sla_id,
    default_priority,
    icon,
    is_active,
    skill_ids, // Bisa jadi array ID skill yang baru
  } = req.body;

  try {
    const updatedService = await prisma.$transaction(async (tx) => {
      // 1. Update data dasar ServiceCatalog
      const service = await tx.serviceCatalog.update({
        where: { id: parseInt(id) },
        data: {
          nama_layanan,
          deskripsi,
          kategori,
          sla_id: sla_id ? parseInt(sla_id) : undefined,
          default_priority,
          icon,
          is_active,
        },
      });

      // 2. Jika ada `skill_ids` baru, update relasi di ServiceSkill
      if (skill_ids && Array.isArray(skill_ids)) {
        // Hapus relasi skill lama
        await tx.serviceSkill.deleteMany({
          where: { service_id: service.id },
        });

        // Buat relasi skill baru (jika array tidak kosong)
        if (skill_ids.length > 0) {
          const serviceSkillData = skill_ids.map((skillId) => ({
            service_id: service.id,
            skill_id: parseInt(skillId),
          }));
          await tx.serviceSkill.createMany({
            data: serviceSkillData,
          });
        }
      }
      return service;
    });

    // Ambil data lengkap setelah update
    const finalUpdatedService = await prisma.serviceCatalog.findUnique({
      where: { id: updatedService.id },
      include: {
        sla: true,
        skills: { include: { skill: true } },
      },
    });

    res.json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: finalUpdatedService,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama layanan sudah digunakan." });
    }
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Layanan tidak ditemukan." });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "ID SLA atau salah satu ID Skill tidak valid.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui layanan",
      error: error.message,
    });
  }
}

export async function deleteService(req, res) {
  const { id } = req.params;
  try {
    // Gunakan transaksi untuk menghapus service dan relasinya
    await prisma.$transaction(async (tx) => {
      // Hapus relasi di ServiceSkill dulu
      await tx.serviceSkill.deleteMany({
        where: { service_id: parseInt(id) },
      });
      // Baru hapus ServiceCatalog
      await tx.serviceCatalog.delete({
        where: { id: parseInt(id) },
      });
    });

    res.json({ success: true, message: "Layanan berhasil dihapus" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Layanan tidak ditemukan." });
    }
    // Error jika Layanan masih terpakai oleh Tiket
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Layanan tidak bisa dihapus karena masih digunakan oleh Tiket.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal menghapus layanan",
      error: error.message,
    });
  }
}
