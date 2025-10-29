import { verifyToken } from "../utils/auth.js";
import prisma from "../config/prisma.js";

// Middleware: Autentikasi user
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan atau format salah",
      });
    }
    const token = authHeader.substring(7);

    const decoded = verifyToken(token);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Token tidak valid atau expired" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan atau tidak aktif",
      });
    }

    // Attach user ke request
    req.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role.role_name, // 'admin', 'petugas', dll.
      role_id: user.role_id,
    };
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saat autentikasi",
      error: error.message,
    });
  }
}

// Middleware: Otorisasi berdasarkan role
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Anda tidak memiliki akses" });
    }
    next();
  };
}
