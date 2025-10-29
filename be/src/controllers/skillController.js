import prisma from "../config/prisma.js";

export async function getAllSkills(req, res) {
  try {
    const skills = await prisma.skill.findMany();
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data skills",
      error: error.message,
    });
  }
}

export async function getSkillById(req, res) {
  const { id } = req.params;
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(id) },
    });
    if (!skill) {
      return res.status(404).json({
        success: false,
      });
    }
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data skill",
      error: error.message,
    });
  }
}

export async function createSkill(req, res) {
  try {
    const { skill_name, skill_description, kategori } = req.body;
    if (!skill_name) {
      return res
        .status(400)
        .json({ success: false, message: "Nama skill harus diisi" });
    }

    const newSkill = await prisma.skill.create({
      data: {
        skill_name,
        skill_description,
        kategori,
      },
    });
    res.status(201).json({
      success: true,
      message: "Skill baru berhasil ditambahkan",
      data: newSkill,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama skill sudah ada" });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat skill baru",
      error: error.message,
    });
  }
}

export async function updateSkill(req, res) {
  const { id } = req.params;
  const { skill_name, skill_description, katagori } = req.body;
  try {
    const updateSkill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: {
        skill_name,
        skill_description,
        katagori,
      },
    });
    res.json({
      success: true,
      message: "Skill berhasil diperbarui",
      data: updateSkill,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama skill sudah digunakan." });
    }
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Skill tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui skill",
      error: error.message,
    });
  }
}

export async function deleteSkill(req, res) {
  const { id } = req.params;
  try {
    const deleteSkill = await prisma.skill.delete({
      where: { id: parseInt(id) },
    });
    res.json({
      success: true,
      message: `Skill ${deleteSkill.skill_name} berhasil dihapus`,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Skill tidak ditemukan." });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message:
          "Skill tidak bisa dihapus karena masih digunakan oleh user atau layanan.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal menghapus skill",
      error: error.message,
    });
  }
}
