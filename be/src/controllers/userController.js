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
    console.log("ini id = ", req.user);
    console.log("hahahhaha");

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
      role_id, // Wajib diisi Admin
      nama,
      email,
      password, // Password awal
      instansi,
      alamat,
      no_telepon,
      is_active,
      is_available,
      skill_ids, // Array ID skill jika role_id adalah 'petugas'
      level, // Level 'junior' atau 'senior' jika role_id adalah 'petugas'
    } = req.body;

    // Validasi input dasar
    if (!role_id || !nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Role, Nama, Email, dan Password wajib diisi",
      });
    }

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email sudah terdaftar" });
    }

    // Cek apakah role_id valid
    const roleExists = await prisma.role.findUnique({
      where: { id: parseInt(role_id) },
    });
    if (!roleExists) {
      return res
        .status(400)
        .json({ success: false, message: "Role ID tidak valid" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Gunakan transaksi jika perlu membuat UserSkill (untuk Petugas)
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Buat User dulu
      const user = await tx.user.create({
        data: {
          role_id: parseInt(role_id),
          nama,
          email,
          password: hashedPassword,
          instansi,
          alamat,
          no_telepon,
          is_active: is_active ?? true, // Default true jika tidak diisi
          is_available: is_available ?? true, // Default true
        },
      });

      // 2. Jika role adalah 'petugas' dan ada skill_ids, buat UserSkill
      if (
        roleExists.role_name === "petugas" &&
        skill_ids &&
        Array.isArray(skill_ids) &&
        skill_ids.length > 0
      ) {
        const userSkillData = skill_ids.map((skillId) => ({
          user_id: user.id,
          skill_id: parseInt(skillId),
          level: level || "junior", // Default junior jika level tidak diisi
        }));
        await tx.userSkill.createMany({
          data: userSkillData,
        });
      }
      return user;
    });

    // Ambil data user baru (tanpa password) untuk response
    const createdUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      select: {
        id: true,
        email: true,
        nama: true,
        role_id: true,
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
      // Foreign key constraint (misal skill_id tidak valid)
      return res
        .status(400)
        .json({ success: false, message: "Salah satu ID Skill tidak valid." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat user baru",
      error: error.message,
    });
  }
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const {
    role_id,
    nama,
    // email tidak diupdate biasanya, atau perlu proses verifikasi khusus
    password, // Jika ingin ganti password
    instansi,
    alamat,
    no_telepon,
    is_active,
    is_available,
    skill_ids, // Array ID skill baru untuk petugas
    level, // Level baru untuk petugas
  } = req.body;

  try {
    const userId = parseInt(id);

    // Siapkan data yang akan diupdate
    const dataToUpdate = {
      nama,
      instansi,
      alamat,
      no_telepon,
      is_active,
      is_available,
    };

    // Update role jika diisi
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

    // Hash password baru jika diisi
    if (password) {
      dataToUpdate.password = await hashPassword(password);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update data dasar User
      const user = await tx.user.update({
        where: { id: userId },
        data: dataToUpdate,
        include: { role: true }, // Ambil info role untuk cek
      });

      // 2. Jika user adalah petugas, update skills
      if (user.role.role_name === "petugas") {
        // Hapus skill lama
        await tx.userSkill.deleteMany({
          where: { user_id: userId },
        });

        // Tambah skill baru jika ada skill_ids
        if (skill_ids && Array.isArray(skill_ids) && skill_ids.length > 0) {
          const userSkillData = skill_ids.map((skillId) => ({
            user_id: user.id,
            skill_id: parseInt(skillId),
            level: level || "junior",
          }));
          await tx.userSkill.createMany({
            data: userSkillData,
          });
        }
      } else {
        // Jika role diubah DARI petugas KE role lain, hapus semua skillnya
        await tx.userSkill.deleteMany({
          where: { user_id: userId },
        });
      }
      return user;
    });

    // Ambil data user yang sudah diupdate (tanpa password)
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
