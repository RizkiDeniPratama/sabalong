import prisma from "../config/prisma.js";

export async function getDashboardAnalytics(req, res) {
  try {
    // 1. Hitung agregat tiket (total per status)
    const ticketCounts = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // 2. Hitung rata-rata rating feedback
    const averageRating = await prisma.feedback.aggregate({
      _avg: {
        rating: true,
      },
    });

    // 3. Hitung jumlah petugas (total dan yang available)
    const totalPetugas = await prisma.user.count({
      where: { role: { role_name: "petugas" } },
    });
    const availablePetugas = await prisma.user.count({
      where: {
        role: { role_name: "petugas" },
        is_available: true,
      },
    });

    // 4. Hitung total user (pemohon)
    const totalUsers = await prisma.user.count({
      where: { role: { role_name: "user" } },
    });

    // Format data agar mudah dibaca frontend
    const ticketStats = ticketCounts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      { pending: 0, on_progress: 0, eskalasi: 0, selesai: 0, closed: 0 }
    ); // Inisialisasi semua status

    const response = {
      tickets: ticketStats,
      feedbacks: {
        average_rating: averageRating._avg.rating
          ? averageRating._avg.rating.toFixed(1)
          : 0,
      },
      petugas: {
        total: totalPetugas,
        available: availablePetugas,
      },
      users: {
        total: totalUsers,
      },
    };

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data statistik",
      error: error.message,
    });
  }
}
