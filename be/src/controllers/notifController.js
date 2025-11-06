import prisma from "../config/prisma.js";

export async function getAllNotifications(req, res) {
  try {
    const { id: userId } = req.user;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 30, // Batasi 50 notifikasi terbaru
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
      error: error.message,
    });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id: notificationId } = req.params;
    const { id: userId } = req.user;

    // Temukan notifikasi dulu untuk memastikan milik user
    const notification = await prisma.notification.findFirst({
      where: {
        id: parseInt(notificationId),
        user_id: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan atau bukan milik Anda",
      });
    }

    // Update jika belum dibaca
    if (!notification.is_read) {
      const updatedNotification = await prisma.notification.update({
        where: {
          id: parseInt(notificationId),
        },
        data: {
          is_read: true,
        },
      });
      return res.json({
        success: true,
        message: "Notifikasi ditandai sudah dibaca",
        data: updatedNotification,
      });
    }

    res.json({
      success: true,
      message: "Notifikasi sudah dibaca sebelumnya",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui notifikasi",
      error: error.message,
    });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const { id: userId } = req.user;

    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false, // Hanya update yang belum dibaca
      },
      data: {
        is_read: true,
      },
    });

    res.json({
      success: true,
      message: "Semua notifikasi ditandai sudah dibaca",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui notifikasi",
      error: error.message,
    });
  }
}
