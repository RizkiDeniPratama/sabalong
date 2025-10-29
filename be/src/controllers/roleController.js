import prisma from "../config/prisma.js";

export async function getAllRoles(req, res) {
  try {
    const roles = await prisma.role.findMany();
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data roles",
      error: error.message,
    });
  }
}

export async function createRole(req, res) {
  try {
    const { role_name, role_description } = req.body;
    if (!role_name) {
      return res
        .status(400)
        .json({ success: false, message: "Nama role harus diisi" });
    }

    const newRole = await prisma.role.create({
      data: {
        role_name,
        role_description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Role baru berhasil ditambahkan",
      data: newRole,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama role sudah ada" });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat role baru",
      error: error.message,
    });
  }
}

export async function updateRole(req, res) {
  const { id } = req.params;
  const { role_name, role_description } = req.body;

  try {
    const updateRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        role_name,
        role_description,
      },
    });
    res.status(200).json({
      success: true,
      message: "Role berhasil diupdate",
      data: updateRole,
    });
  } catch (error) {
    if (error.code === "P2002") {
      // Handle unique constraint violation
      return res
        .status(400)
        .json({ success: false, message: "Nama role sudah digunakan." });
    }
    if (error.code === "P2025") {
      // Handle record not found
      return res
        .status(404)
        .json({ success: false, message: "Role tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui role",
      error: error.message,
    });
  }
}

export async function deleteRole(req, res) {
  const { id } = req.params;
  try {
    const deletedRole = await prisma.role.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({
      success: true,
      message: `Role ${deletedRole.role_name} berhasil dihapus`,
    });
  } catch (error) {}
}
