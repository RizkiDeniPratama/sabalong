import prisma from "../config/prisma.js";

export async function createFeedback(req, res) {
  try {
    const { ticket_id, rating, review } = req.body;
    const { id: userId, role: userRole } = req.user;

    // 1. Validasi input dasar
    if (!ticket_id || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Ticket ID dan Rating wajib diisi" });
    }

    // 2. Ambil data tiket untuk validasi
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticket_id) },
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan" });
    }

    // 3. Validasi Keamanan: Hanya pemohon tiket yang boleh kasih feedback
    if (ticket.user_id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Anda bukan pemilik tiket ini" });
    }

    // 4. Validasi Logika Bisnis: Hanya tiket 'selesai'
    if (ticket.status !== "selesai") {
      return res
        .status(400)
        .json({ success: false, message: "Tiket ini belum selesai" });
    }

    // 5. Validasi Logika Bisnis: Cek duplikat feedback
    const existingFeedback = await prisma.feedback.findUnique({
      where: { ticket_id: parseInt(ticket_id) },
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah memberikan feedback untuk tiket ini",
      });
    }

    // Ambil semua Admin & Pimpinan untuk notifikasi
    const staffToNotify = await prisma.user.findMany({
      where: {
        role: {
          role_name: { in: ["admin", "pimpinan"] },
        },
        is_active: true,
      },
      select: { id: true },
    });

    // 6. Buat Feedback dan Notifikasi (dalam transaksi)
    const newFeedback = await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: {
          ticket_id: parseInt(ticket_id),
          user_id: userId,
          rating: parseInt(rating),
          review: review,
        },
      });

      // Buat notifikasi untuk semua Admin & Pimpinan
      if (staffToNotify.length > 0) {
        const notifications = staffToNotify.map((staff) => ({
          user_id: staff.id,
          ticket_id: ticket.id,
          type: "new_feedback",
          title: "Feedback Baru Diterima",
          message: `Feedback baru (${rating} bintang) diterima untuk tiket #${ticket.ticket_number}.`,
        }));
        await tx.notification.createMany({
          data: notifications,
        });
      }

      return feedback;
    });

    res.status(201).json({
      success: true,
      message: "Feedback berhasil dikirim",
      data: newFeedback,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "ID Tiket tidak valid." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal mengirim feedback",
      error: error.message,
    });
  }
}

export async function getAllFeedbacks(req, res) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        // Sertakan info tiket dan user pembuat feedback
        ticket: {
          select: { id: true, ticket_number: true, judul_permohonan: true },
        },
        user: {
          select: { id: true, nama: true, instansi: true },
        },
      },
    });

    res.json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data feedback",
      error: error.message,
    });
  }
}
