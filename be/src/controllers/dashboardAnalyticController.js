import prisma from "../config/prisma.js";

export async function getDashboardAnalytics(req, res) {
  try {
    // 1. Hitung agregat tiket (total per status)
    const ticketCounts = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }); // 2. Hitung jumlah petugas (total dan yang available)

    // --- (Ini tetap sama) ---
    const totalPetugas = await prisma.user.count({
      where: { role: { role_name: "petugas" } },
    });
    const availablePetugas = await prisma.user.count({
      where: {
        role: { role_name: "petugas" },
        is_available: true,
      },
    }); // 3. Hitung total user (pemohon)

    const totalUsers = await prisma.user.count({
      where: { role: { role_name: "user" } },
    });

    // --- LOGIKA FEEDBACK YANG DIPERBARUI ---
    const now = new Date();
    // Tentukan awal dan akhir bulan INI
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // Tentukan awal dan akhir bulan LALU
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 4. Hitung statistik feedback

    // Rata-rata rating KESELURUHAN (All-Time)
    const avgRatingAllTime = await prisma.feedback.aggregate({
      _avg: { rating: true },
    });

    // Rata-rata rating BULAN INI
    const avgRatingThisMonth = await prisma.feedback.aggregate({
      _avg: { rating: true },
      where: {
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // Rata-rata rating BULAN LALU
    const avgRatingLastMonth = await prisma.feedback.aggregate({
      _avg: { rating: true }, // <-- PERBAIKAN LOGIKA (bukan .count)
      where: {
        created_at: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    });

    // Total feedback BULAN INI
    const totalFeedbackThisMonth = await prisma.feedback.count({
      where: {
        created_at: {
          // <-- PERBAIKAN TYPO
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }); // Format data tiket

    const ticketStats = ticketCounts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      { pending: 0, on_progress: 0, eskalasi: 0, selesai: 0, closed: 0 }
    );

    // Format respons
    const response = {
      tickets: ticketStats,
      feedbacks: {
        // PERBAIKI NAMA VARIABEL AGAR JELAS
        average_rating_all_time: avgRatingAllTime._avg.rating
          ? avgRatingAllTime._avg.rating.toFixed(1)
          : 0,
        average_rating_this_month: avgRatingThisMonth._avg.rating
          ? avgRatingThisMonth._avg.rating.toFixed(1)
          : 0,
        average_rating_last_month: avgRatingLastMonth._avg.rating
          ? avgRatingLastMonth._avg.rating.toFixed(1)
          : 0,
        total_feedback_this_month: totalFeedbackThisMonth,
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
