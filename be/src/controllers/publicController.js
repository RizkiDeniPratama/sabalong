import prisma from "../config/prisma.js";

export async function getPublicServices(req, res) {
  try {
    const services = await prisma.serviceCatalog.findMany({
      where: { is_active: true },
      select: {
        id: true,
        nama_layanan: true,
        kategori: true,
        icon: true,
        deskripsi: true,
        sop: true,
        flowchart: true,
      },
    });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getLatestFeedbacks(req, res) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      take: 10,
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { nama: true, instansi: true } },
        ticket: { select: { service: { select: { nama_layanan: true } } } },
      },
    });
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function trackTicket(req, res) {
  try {
    const { ticket_number } = req.params;
    const ticket = await prisma.ticket.findUnique({
      where: { ticket_number },
      select: {
        ticket_number: true,
        status: true,
        created_at: true,
        updated_at: true,
        priority: true,
        logs: {
          select: {
            action_type: true,
            created_at: true,
            notes: true,
          },
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Tiket tidak ditemukan" });

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
