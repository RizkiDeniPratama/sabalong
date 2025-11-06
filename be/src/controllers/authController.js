import prisma from "../config/prisma.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

// Register (hanya untuk role 'user')
// export async function register(req, res) {
//   try {
//     const { nama, email, password, instansi, alamat, no_telepon } = req.body;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email sudah terdaftar" });
//     }

//     const userRole = await prisma.role.findUnique({
//       where: { role_name: "user" },
//     });
//     if (!userRole) {
//       return res
//         .status(500)
//         .json({ success: false, message: 'Role "user" tidak ditemukan.' });
//     }

//     const hashedPwd = await hashPassword(password);

//     const user = await prisma.user.create({
//       data: {
//         role_id: userRole.id,
//         nama,
//         email,
//         password: hashedPwd,
//         instansi,
//         alamat,
//         no_telepon,
//         is_active: true, // User langsung aktif
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Registrasi berhasil. Silakan login.",
//       data: { userId: user.id, email: user.email },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error saat registrasi",
//       error: error.message,
//     });
//   }
// }

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }

    if (!user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Akun Anda tidak aktif" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.role_name,
    });

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        access_token: token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role.role_name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saat login",
      error: error.message,
    });
  }
}

export async function logout(req, res) {
  res.json({ success: true, message: "Logout berhasil" });
}

export async function changePassword(req, res) {
  try {
    const { passwordLama, passwordBaru } = req.body;
    const { id } = req.user;
    // 1. Validasi input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password lama dan password baru wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      // Aturan password minimal
      return res.status(400).json({
        success: false,
        message: "Password baru minimal harus 6 karakter",
      });
    }

    // 2. Ambil user (termasuk password-nya) dari DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    // 3. Bandingkan password lama
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Password lama salah" });
    }

    // 4. Hash password baru
    const hashedNewPassword = await hashPassword(newPassword);

    // 5. Update password di DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    res.json({ success: true, message: "Password berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengganti password",
      error: error.message,
    });
  }
}
