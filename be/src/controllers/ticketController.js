import prisma from "../config/prisma.js";

function addHoursToDate(date, hours) {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

export async function createTicket(req, res) {
  try {
    let attachmentPath = null;

    if (req.file) {
      attachmentPath = "/uploads/" + req.file.filename;
    } else if (req.body.attachment) {
      attachmentPath = req.body.attachment;
    }
    const { service_id, judul_permohonan, deskripsi } = req.body;
    const requesterId = req.user.id;

    if (!service_id || !judul_permohonan || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: "Layanan, judul, dan deskripsi wajib diisi",
      });
    }

    const service = await prisma.serviceCatalog.findUnique({
      where: { id: parseInt(service_id) },
      include: { sla: true },
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Layanan tidak ditemukan" });
    }

    const now = new Date();
    const response_deadline = addHoursToDate(now, service.sla.response_hours);
    const resolution_deadline = addHoursToDate(
      now,
      service.sla.resolution_hours
    );
    const ticket_number = `TKT-${Date.now()}`;

    const staffToNotify = await prisma.user.findMany({
      where: {
        role: {
          role_name: { in: ["admin", "petugas"] },
        },
        is_active: true,
      },
      select: { id: true },
    });

    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          ticket_number,
          judul_permohonan,
          deskripsi,
          attachment: attachmentPath,
          priority: service.default_priority,
          status: "pending",
          response_deadline,
          resolution_deadline,
          created_at: now,
          user_id: requesterId,
          service_id: parseInt(service_id),
        },
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.id,
          action_by: requesterId,
          action_type: "created",
          notes: "Tiket berhasil dibuat oleh pemohon.",
        },
      });

      if (staffToNotify.length > 0) {
        const notifications = staffToNotify.map((staff) => ({
          user_id: staff.id,
          ticket_id: ticket.id,
          type: "new_ticket",
          title: "Tiket Baru Dibuat",
          message: `Tiket baru #${ticket_number} telah dibuat oleh ${req.user.nama}.`,
        }));
        await tx.notification.createMany({
          data: notifications,
        });
      }

      return ticket;
    });

    res.status(201).json({
      success: true,
      message: "Tiket berhasil dibuat",
      data: newTicket,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "ID Layanan tidak valid" });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat tiket baru",
      error: error.message,
    });
  }
}

export async function getAllTickets(req, res) {
  try {
    const { id: userId, role: userRole } = req.user;
    const { limit } = req.query;

    let whereClause = {};
    const orderByClause = { created_at: "desc" };

    if (userRole === "user") {
      whereClause = { user_id: userId };
    } else if (userRole === "petugas") {
      whereClause = {
        OR: [
          { assigned_to_id: userId },
          { status: "pending", assigned_to_id: null },
        ],
      };
    }

    const options = {
      where: whereClause,
      include: {
        requester: {
          select: { nama: true, instansi: true },
        },
        assignee: {
          select: { nama: true },
        },
        service: {
          select: { nama_layanan: true },
        },
      },
      orderBy: orderByClause,
    };

    // ✅ Tambahkan limit jika dikirim (contoh ?limit=5)
    if (limit) {
      options.take = parseInt(limit);
    }

    // ✅ Gunakan options ini
    const tickets = await prisma.ticket.findMany(options);

    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data tiket",
      error: error.message,
    });
  }
}

export async function getTicketById(req, res) {
  try {
    const { id: ticketId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        requester: { select: { nama: true, email: true, instansi: true } },
        assignee: { select: { nama: true, email: true } },
        service: { include: { sla: true } },
        logs: {
          orderBy: { created_at: "asc" },
          include: { user: { select: { nama: true } } },
        },
      },
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan" });
    }

    // Otorisasi: Siapa yang boleh lihat tiket ini?
    if (userRole === "admin" || userRole === "pimpinan") {
      return res.json({ success: true, data: ticket });
    }
    if (
      userRole === "petugas" &&
      (ticket.assigned_to_id === userId || ticket.user_id === userId)
    ) {
      return res.json({ success: true, data: ticket });
    }
    if (userRole === "user" && ticket.user_id === userId) {
      return res.json({ success: true, data: ticket });
    }

    return res.status(403).json({
      success: false,
      message: "Anda tidak memiliki akses ke tiket ini",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail tiket",
      error: error.message,
    });
  }
}

export async function assignTicket(req, res) {
  try {
    const { id: ticketId } = req.params;
    const { petugas_id } = req.body;
    const adminId = req.user.id;

    if (!petugas_id) {
      return res
        .status(400)
        .json({ success: false, message: "ID Petugas wajib diisi" });
    }

    const petugas = await prisma.user.findFirst({
      where: { id: parseInt(petugas_id), role: { role_name: "petugas" } },
    });

    if (!petugas) {
      return res
        .status(404)
        .json({ success: false, message: "Petugas tidak ditemukan" });
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id: parseInt(ticketId) },
        data: {
          assigned_to_id: parseInt(petugas_id),
          status: "on_progress", // Otomatis jadi 'on_progress'
        },
      });

      await tx.user.update({
        where: { id: parseInt(petugas_id) },
        data: { is_available: false }, // Petugas jadi sibuk
      });

      await tx.ticketLog.create({
        data: {
          ticket_id: ticket.id,
          action_by: adminId,
          action_type: "assigned",
          old_value: ticket.status,
          new_value: "on_progress",
          notes: `Tiket ditugaskan kepada ${petugas.nama}.`,
        },
      });

      // Buat Notifikasi untuk Petugas yang ditugaskan
      await tx.notification.create({
        data: {
          user_id: petugas.id,
          ticket_id: ticket.id,
          type: "assigned",
          title: "Tugas Tiket Baru",
          message: `Anda telah ditugaskan untuk tiket #${ticket.ticket_number}.`,
        },
      });

      return ticket;
    });

    res.json({
      success: true,
      message: `Tiket berhasil ditugaskan ke ${petugas.nama}`,
      data: updatedTicket,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal menugaskan tiket",
      error: error.message,
    });
  }
}

export async function updateTicketStatus(req, res) {
  try {
    const { id: ticketId } = req.params;
    const { status, notes } = req.body; // Status baru: 'on_progress', 'selesai', 'closed', 'on_hold'
    const { id: userId, role: userRole } = req.user;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status wajib diisi" });
    }

    // Validasi status
    const validStatus = ["on_progress", "selesai", "closed", "on_hold"];
    if (!validStatus.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Nilai status tidak valid" });
    }

    // Ambil tiket
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan" });
    }

    // Otorisasi: Hanya Admin atau Petugas yang ditugaskan
    if (userRole !== "admin" && ticket.assigned_to_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak mengubah status tiket ini",
      });
    }

    const oldStatus = ticket.status;

    // Logika jika status 'selesai'
    const dataToUpdate = {
      status: status,
      completed_at: status === "selesai" ? new Date() : null, // Catat waktu selesai
    };

    // Catat first response jika ini respons pertama
    if (status === "on_progress" && !ticket.first_response_at) {
      dataToUpdate.first_response_at = new Date();
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      // 1. Update tiket
      const updated = await tx.ticket.update({
        where: { id: parseInt(ticketId) },
        data: dataToUpdate,
      });

      // 2. Jika 'selesai' ATAU 'closed', buat petugas 'available' lagi
      if (
        (status === "selesai" || status === "closed") &&
        ticket.assigned_to_id
      ) {
        await tx.user.update({
          where: { id: ticket.assigned_to_id },
          data: { is_available: true },
        });
      }

      // 3. Buat log
      await tx.ticketLog.create({
        data: {
          ticket_id: updated.id,
          action_by: userId,
          action_type: "status_changed",
          old_value: oldStatus,
          new_value: status,
          notes: notes || `Status diubah ke ${status}`,
        },
      });

      // 4. Buat Notifikasi untuk Pemohon
      await tx.notification.create({
        data: {
          user_id: ticket.user_id, // Kirim ke pemohon
          ticket_id: ticket.id,
          type: "status_update",
          title: "Status Tiket Berubah",
          message: `Status tiket #${ticket.ticket_number} telah diubah menjadi "${status}".`,
        },
      });

      return updated;
    });

    res.json({
      success: true,
      message: "Status tiket berhasil diperbarui",
      data: updatedTicket,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal mengubah status tiket",
      error: error.message,
    });
  }
}

export async function addTicketLog(req, res) {
  try {
    const { id: ticketId } = req.params;
    const { notes } = req.body;
    const { id: userId, role: userRole } = req.user;

    if (!notes) {
      return res
        .status(400)
        .json({ success: false, message: "Komentar (notes) wajib diisi" });
    }

    // Ambil tiket untuk validasi
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
    });
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan" });
    }

    // Otorisasi: Hanya Admin, Petugas terkait, atau Pemilik tiket
    if (
      userRole !== "admin" &&
      ticket.assigned_to_id !== userId &&
      ticket.user_id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak menambahkan komentar di tiket ini",
      });
    }

    // Tentukan siapa yang akan dapat notifikasi
    // Jika User komentar, notif ke Petugas. Jika Petugas komentar, notif ke User.
    let recipientId = null;
    if (userRole === "user") {
      recipientId = ticket.assigned_to_id; // Kirim ke Petugas (jika ada)
    } else {
      // Jika Petugas atau Admin
      recipientId = ticket.user_id; // Kirim ke User
    }

    const newLog = await prisma.$transaction(async (tx) => {
      // 1. Buat log
      const log = await tx.ticketLog.create({
        data: {
          ticket_id: parseInt(ticketId),
          action_by: userId,
          action_type: "commented",
          notes: notes,
        },
      });

      // 2. Buat notifikasi (jika ada penerima)
      if (recipientId) {
        await tx.notification.create({
          data: {
            user_id: recipientId,
            ticket_id: ticket.id,
            type: "new_comment",
            title: "Komentar Baru di Tiket",
            message: `${req.user.nama} menambahkan komentar di tiket #${ticket.ticket_number}.`,
          },
        });
      }
      return log;
    });

    res.status(201).json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: newLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan komentar",
      error: error.message,
    });
  }
}

export async function escalateTicket(req, res) {
  try {
    const { id: ticketId } = req.params;
    const { eskalasi_reason } = req.body;
    const { id: userId, role: userRole } = req.user;

    if (!eskalasi_reason) {
      return res
        .status(400)
        .json({ success: false, message: "Alasan eskalasi wajib diisi" });
    }

    // Ambil tiket
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
    });
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan" });
    }

    // Otorisasi: Hanya Petugas yang sedang ditugaskan
    if (ticket.assigned_to_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Hanya petugas yang ditugaskan yang bisa melakukan eskalasi",
      });
    }

    // Ambil semua Admin untuk dinotifikasi
    const admins = await prisma.user.findMany({
      where: { role: { role_name: "admin" }, is_active: true },
      select: { id: true },
    });

    const escalatedTicket = await prisma.$transaction(async (tx) => {
      // 1. Update tiket
      const updated = await tx.ticket.update({
        where: { id: parseInt(ticketId) },
        data: {
          status: "eskalasi", // Ubah status
          eskalasi_from_id: userId, // Catat siapa yg eskalasi
          eskalasi_reason: eskalasi_reason,
          assigned_to_id: null, // Kosongkan petugas (agar bisa di-assign ulang)
        },
      });

      // 2. Buat petugas jadi 'available' lagi
      await tx.user.update({
        where: { id: userId },
        data: { is_available: true },
      });

      // 3. Buat log
      await tx.ticketLog.create({
        data: {
          ticket_id: updated.id,
          action_by: userId,
          action_type: "escalated",
          old_value: ticket.status,
          new_value: "eskalasi",
          notes: eskalasi_reason,
        },
      });

      // 4. Buat Notifikasi untuk semua Admin
      if (admins.length > 0) {
        const notifications = admins.map((admin) => ({
          user_id: admin.id,
          ticket_id: ticket.id,
          type: "escalation",
          title: "Tiket Dieskalasi",
          message: `Tiket #${ticket.ticket_number} telah dieskalasi oleh ${req.user.nama}.`,
        }));
        await tx.notification.createMany({
          data: notifications,
        });
      }

      return updated;
    });

    res.json({
      success: true,
      message: "Tiket berhasil dieskalasi dan dikembalikan ke antrian",
      data: escalatedTicket,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal eskalasi tiket",
      error: error.message,
    });
  }
}
