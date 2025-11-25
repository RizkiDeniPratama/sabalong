import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/auth.js";

export async function getAllUsers(req, res) {
  try {
    const { role } = req.query; // Opsional filter ?role=petugas

    const whereClause = {};
    if (role) {
      const roleRecord = await prisma.role.findUnique({
        where: { role_name: role },
      });
      if (roleRecord) {
        whereClause.role_id = roleRecord.id;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Role tidak valid." });
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        role: true, // Sertakan info role
        skills: {
          // Sertakan info skill jika ada
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
    });

    // Hapus password dari response demi keamanan
    const usersWithoutPassword = users.map((user) => {
      // console.log("ini isi user ", user.password);

      const { password, ...userWithoutPass } = user;

      return userWithoutPass;
    });

    res.json({ success: true, data: usersWithoutPassword });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data users",
      error: error.message,
    });
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    // Hapus password dari response
    const { password, ...userWithoutPassword } = user;

    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: error.message,
    });
  }
}

export async function getProfile(req, res) {
  console.log("req.user = ", req.user);

  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nama: true,
        email: true,
        instansi: true,
        alamat: true,
        no_telepon: true,
        avatar: true,
        is_active: true,
        is_available: true,
        created_at: true,
        role: {
          select: {
            role_name: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data profil",
      error: error.message,
    });
  }
}

export async function createUser(req, res) {
  try {
    const {
      role_id,
      nama,
      email,
      password,
      instansi,
      alamat,
      no_telepon,
      is_active,
      is_available,
      skills, // Array of objects, contoh: [{ skill_id: 1, level: 'junior' }]
    } = req.body;
    console.log("ini yg dikirim fe 2 = ", req.body);

    if (!role_id || !nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Role, Nama, Email, dan Password wajib diisi",
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const roleExists = await prisma.role.findUnique({
      where: { id: parseInt(role_id) },
    });
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: "Role ID tidak valid",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role_id: parseInt(role_id),
          nama,
          email,
          password: hashedPassword,
          instansi,
          alamat,
          no_telepon,
          is_active: is_active ?? true,
          is_available: is_available ?? true,
        },
      });

      if (
        roleExists.role_name === "petugas" &&
        Array.isArray(skills) &&
        skills.length > 0
      ) {
        const userSkillData = skills.map((skill) => ({
          user_id: user.id,
          skill_id: parseInt(skill.skill_id),
          level: skill.level || "junior",
        }));

        await tx.userSkill.createMany({
          data: userSkillData,
        });
      }

      return user;
    });

    const createdUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        email: true,
        nama: true,
        role_id: true,
        instansi: true,
        alamat: true,
        no_telepon: true,
        is_active: true,
        is_available: true,
        role: true,
        skills: { include: { skill: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: createdUser,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "Salah satu ID Skill tidak valid." });
    }
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat user baru",
      error: error.message,
    });
  }
}

export async function updateUser(req, res) {
  console.log("ini yg dikirim fe terbaru = ", req.body);

  const { id } = req.params;
  const {
    role_id,
    nama,
    password,
    instansi,
    alamat,
    no_telepon,
    is_active,
    is_available,
    skills, // Array of objects
  } = req.body;

  try {
    const userId = parseInt(id);
    const dataToUpdate = {
      nama,
      instansi,
      alamat,
      no_telepon,
      is_active,
      is_available,
    };

    if (role_id) {
      const roleExists = await prisma.role.findUnique({
        where: { id: parseInt(role_id) },
      });
      if (!roleExists) {
        return res
          .status(400)
          .json({ success: false, message: "Role ID tidak valid" });
      }
      dataToUpdate.role_id = parseInt(role_id);
    }

    if (password) {
      dataToUpdate.password = await hashPassword(password);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: dataToUpdate,
        include: { role: true },
      });

      // Logika untuk mengelola skill berdasarkan role
      if (user.role.role_name === "petugas") {
        // Hanya proses skill jika user adalah 'petugas'
        if (Array.isArray(skills)) {
          // Jika ada array 'skills' yang dikirim, perbarui skills
          await tx.userSkill.deleteMany({ where: { user_id: userId } }); // Hapus yang lama

          if (skills.length > 0) {
            const userSkillData = skills.map((skill) => ({
              user_id: user.id,
              skill_id: parseInt(skill.skill_id),
              level: skill.level || "junior",
            }));
            await tx.userSkill.createMany({ data: userSkillData }); // Tambah yang baru
          }
        }
      } else {
        // Jika user bukan 'petugas', pastikan mereka tidak punya skill
        await tx.userSkill.deleteMany({ where: { user_id: userId } });
      }

      return user;
    });

    const finalUpdatedUser = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      select: {
        id: true,
        email: true,
        nama: true,
        role_id: true,
        is_active: true,
        is_available: true,
        role: true,
        instansi: true,
        alamat: true,
        no_telepon: true,
        skills: { include: { skill: true } },
      },
    });

    res.json({
      success: true,
      message: "User berhasil diperbarui",
      data: finalUpdatedUser,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "Salah satu ID Skill tidak valid." });
    }
    console.error("Error updating user= ", error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui user",
      error: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const userId = parseInt(id);

    // Ambil info user untuk cek apakah dia admin terakhir
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    if (!userToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    // Proteksi: Jangan hapus admin terakhir
    if (userToDelete.role.role_name === "admin") {
      const adminCount = await prisma.user.count({
        where: { role: { role_name: "admin" } },
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Tidak bisa menghapus admin terakhir.",
        });
      }
    }

    // Gunakan transaksi untuk menghapus user dan relasinya
    await prisma.$transaction(async (tx) => {
      // Hapus relasi UserSkill dulu
      await tx.userSkill.deleteMany({ where: { user_id: userId } });
      // Hapus feedback yang dibuat user (opsional, bisa juga di set null user_id nya)
      // await tx.feedback.deleteMany({ where: { user_id: userId } });
      // Hapus notifikasi user
      await tx.notification.deleteMany({ where: { user_id: userId } });
      // Hapus log yang dibuat user (opsional, tergantung kebijakan audit)
      // await tx.ticketLog.deleteMany({ where: { action_by: userId } });

      // PENTING: Apa yang terjadi pada tiket yang dibuat/ditugaskan/dieskalasi oleh user ini?
      // Kita sudah set 'onDelete: Restrict/SetNull' di skema, jadi Prisma akan mencegah
      // penghapusan jika user masih jadi requester tiket aktif, atau akan set null
      // jika user adalah assignee/escalator. Ini aman.

      // Baru hapus User
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    if (error.code === "P2025") {
      // Double check record not found
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }
    // Error P2003/P2014 biasanya karena relasi yang belum dihapus atau dicegah oleh onDelete: Restrict
    if (
      error.code === "P2003" ||
      error.message.includes("Foreign key constraint failed")
    ) {
      console.error("Foreign Key Error on Delete:", error);
      return res.status(400).json({
        success: false,
        message:
          "User tidak bisa dihapus karena masih terkait dengan data lain (misal: tiket aktif).",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
}
