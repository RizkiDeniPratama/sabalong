import prisma from "../config/prisma.js";

/**
 * Mendapatkan semua konfigurasi SLA
 * Rute: GET /api/slas
 * Akses: Semua user terautentikasi
 */
export async function getAllSlas(req, res) {
  try {
    const slas = await prisma.slaConfig.findMany({
      orderBy: {
        resolution_hours: "asc", // Urutkan dari SLA tercepat
      },
    });
    res.json({ success: true, data: slas });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data SLA",
      error: error.message,
    });
  }
}

/**
 * Membuat konfigurasi SLA baru
 * Rute: POST /api/slas
 * Akses: Admin
 */
export async function createSla(req, res) {
  try {
    const {
      sla_name,
      response_hours,
      resolution_hours,
      description,
      is_active,
    } = req.body;

    // Validasi input dasar
    if (!sla_name || !response_hours || !resolution_hours) {
      return res.status(400).json({
        success: false,
        message: "Nama SLA, jam respons, dan jam resolusi wajib diisi",
      });
    }

    const newSla = await prisma.slaConfig.create({
      data: {
        sla_name,
        response_hours: parseInt(response_hours),
        resolution_hours: parseInt(resolution_hours),
        description,
        is_active,
      },
    });
    res
      .status(201)
      .json({ success: true, message: "SLA berhasil dibuat", data: newSla });
  } catch (error) {
    // Tangani error jika sla_name sudah ada (unique constraint)
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama SLA sudah ada" });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat SLA baru",
      error: error.message,
    });
  }
}

/**
 * Mengupdate konfigurasi SLA
 * Rute: PUT /api/slas/:id
 * Akses: Admin
 */
export async function updateSla(req, res) {
  const { id } = req.params;
  const { sla_name, response_hours, resolution_hours, description, is_active } =
    req.body;

  try {
    const updatedSla = await prisma.slaConfig.update({
      where: { id: parseInt(id) },
      data: {
        sla_name,
        response_hours: response_hours ? parseInt(response_hours) : undefined,
        resolution_hours: resolution_hours
          ? parseInt(resolution_hours)
          : undefined,
        description,
        is_active,
      },
    });
    res.json({
      success: true,
      message: "SLA berhasil diperbarui",
      data: updatedSla,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama SLA sudah digunakan." });
    }
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "SLA tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui SLA",
      error: error.message,
    });
  }
}

/**
 * Menghapus konfigurasi SLA
 * Rute: DELETE /api/slas/:id
 * Akses: Admin
 */
export async function deleteSla(req, res) {
  const { id } = req.params;
  try {
    await prisma.slaConfig.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: "SLA berhasil dihapus" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "SLA tidak ditemukan." });
    }
    // Error jika SLA masih terpakai oleh ServiceCatalog
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "SLA tidak bisa dihapus karena masih digunakan oleh Layanan.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal menghapus SLA",
      error: error.message,
    });
  }
}
