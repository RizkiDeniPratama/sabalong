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
      skill_ids, // String JSON jika dari FormData
      sop, // String text jika bukan file
    } = req.body;

    // --- 1. HANDLE FILE UPLOADS ---
    let iconPath = null;
    let flowchartPath = null;
    let sopPath = sop || null; // Default ambil dari text input jika ada

    // Cek file yang diupload
    if (req.files) {
      if (req.files.icon?.[0]) {
        iconPath = "/uploads/" + req.files.icon[0].filename;
      }
      if (req.files.flowchart?.[0]) {
        flowchartPath = "/uploads/" + req.files.flowchart[0].filename;
      }
      if (req.files.sop_file?.[0]) {
        // Jika ada file SOP, timpa text SOP
        sopPath = "/uploads/" + req.files.sop_file[0].filename;
      }
    }

    // --- 2. VALIDASI ---
    if (!nama_layanan || !sla_id || !skill_ids) {
      return res.status(400).json({
        success: false,
        message: "Nama layanan, SLA, dan skill wajib diisi",
      });
    }

    // Parse skill_ids (karena FormData mengirim array sebagai string JSON)
    let parsedSkillIds = [];
    try {
      parsedSkillIds =
        typeof skill_ids === "string" ? JSON.parse(skill_ids) : skill_ids;

      if (!Array.isArray(parsedSkillIds)) {
        throw new Error("Bukan array");
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Format skill_ids tidak valid (harus array JSON)",
      });
    }

    if (parsedSkillIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Minimal satu skill harus dipilih",
      });
    }

    // --- 3. SIMPAN KE DB ---
    const newService = await prisma.$transaction(async (tx) => {
      // A. Buat Service
      const service = await tx.serviceCatalog.create({
        data: {
          nama_layanan,
          deskripsi,
          kategori,
          sla_id: parseInt(sla_id),
          default_priority,
          is_active: true, // Default aktif

          // File Paths
          icon: iconPath,
          flowchart: flowchartPath,
          sop: sopPath,
        },
      });

      // B. Buat Relasi Skill
      const skillData = parsedSkillIds.map((id) => ({
        service_id: service.id,
        skill_id: parseInt(id),
      }));

      await tx.serviceSkill.createMany({ data: skillData });

      return service;
    });

    // Ambil data lengkap untuk response
    const createdService = await prisma.serviceCatalog.findUnique({
      where: { id: newService.id },
      include: {
        sla: true,
        skills: { include: { skill: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Layanan berhasil dibuat",
      data: createdService,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama layanan sudah digunakan" });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "SLA ID atau Skill ID tidak valid" });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat layanan",
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
    is_active,
    skill_ids,
    sop,
    icon,
  } = req.body;

  try {
    // --- 1. SIAPKAN DATA UPDATE ---
    let dataToUpdate = {
      nama_layanan,
      deskripsi,
      kategori,
      default_priority,
    };

    // Handle Boolean is_active (FormData mengirim string "true"/"false")
    if (typeof is_active !== "undefined") {
      dataToUpdate.is_active =
        String(is_active) === "true" || is_active === true || is_active === 1;
    }

    if (sla_id) dataToUpdate.sla_id = parseInt(sla_id);

    // Update Text SOP jika ada
    if (sop) dataToUpdate.sop = sop;

    // --- 2. HANDLE FILE UPLOADS ---
    // Jika tidak ada file icon baru, tapi ada string icon lama, biarkan (jangan di-null-kan)
    // Jika ada file icon baru, update path-nya

    if (req.files) {
      if (req.files.icon?.[0]) {
        dataToUpdate.icon = "/uploads/" + req.files.icon[0].filename;
      }
      if (req.files.flowchart?.[0]) {
        dataToUpdate.flowchart = "/uploads/" + req.files.flowchart[0].filename;
      }
      if (req.files.sop_file?.[0]) {
        dataToUpdate.sop = "/uploads/" + req.files.sop_file[0].filename;
      }
    }

    // --- 3. HANDLE SKILLS ---
    let parsedSkillIds = null;
    if (typeof skill_ids !== "undefined") {
      try {
        parsedSkillIds =
          typeof skill_ids === "string" ? JSON.parse(skill_ids) : skill_ids;
        if (!Array.isArray(parsedSkillIds)) throw new Error();
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Format skill_ids tidak valid" });
      }
    }

    // --- 4. TRANSAKSI DB ---
    const updatedService = await prisma.$transaction(async (tx) => {
      // A. Update Service
      const service = await tx.serviceCatalog.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
      });

      // B. Update Skills (Hapus Lama -> Buat Baru)
      if (parsedSkillIds !== null) {
        await tx.serviceSkill.deleteMany({ where: { service_id: service.id } });

        if (parsedSkillIds.length > 0) {
          const skillData = parsedSkillIds.map((skillId) => ({
            service_id: service.id,
            skill_id: parseInt(skillId),
          }));
          await tx.serviceSkill.createMany({ data: skillData });
        }
      }

      return service;
    });

    // Ambil data lengkap
    const finalService = await prisma.serviceCatalog.findUnique({
      where: { id: updatedService.id },
      include: {
        sla: true,
        skills: { include: { skill: true } },
      },
    });

    res.json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: finalService,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025")
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    if (error.code === "P2002")
      return res.status(400).json({ message: "Nama layanan sudah digunakan" });

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
