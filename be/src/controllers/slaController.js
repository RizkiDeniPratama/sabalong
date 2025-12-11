import prisma from "../config/prisma.js";
import {
  calculateResolutionSLAPercentage,
  getSLAStatusLabel,
  calculateDelayHours,
  calculatePetugasPerformance,
} from "../utils/slaUtils.js";

export async function getAllSlas(req, res) {
  try {
    const slas = await prisma.slaConfig.findMany({
      orderBy: {
        resolution_hours: "asc",
      },
    });
    res.json({ success: true, data: slas });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data SLA",
      error: error.message,
    });
  }
}

export async function createSla(req, res) {
  try {
    const {
      sla_name,
      response_hours,
      resolution_hours,
      description,
      is_active,
    } = req.body;

    if (!sla_name || !response_hours || !resolution_hours) {
      return res.status(400).json({
        success: false,
        message: "Nama SLA, jam respons, dan jam resolusi wajib diisi",
      });
    }

    const newSla = await prisma.slaConfig.create({
      data: {
        sla_name,
        response_hours: parseInt(response_hours),
        resolution_hours: parseInt(resolution_hours),
        description,
        is_active,
      },
    });
    res
      .status(201)
      .json({ success: true, message: "SLA berhasil dibuat", data: newSla });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama SLA sudah ada" });
    }
    res.status(500).json({
      success: false,
      message: "Gagal membuat SLA baru",
      error: error.message,
    });
  }
}

export async function updateSla(req, res) {
  const { id } = req.params;
  const { sla_name, response_hours, resolution_hours, description, is_active } =
    req.body;

  try {
    const updatedSla = await prisma.slaConfig.update({
      where: { id: parseInt(id) },
      data: {
        sla_name,
        response_hours: response_hours ? parseInt(response_hours) : undefined,
        resolution_hours: resolution_hours
          ? parseInt(resolution_hours)
          : undefined,
        description,
        is_active,
      },
    });
    res.json({
      success: true,
      message: "SLA berhasil diperbarui",
      data: updatedSla,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "Nama SLA sudah digunakan." });
    }
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "SLA tidak ditemukan." });
    }
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui SLA",
      error: error.message,
    });
  }
}

export async function deleteSla(req, res) {
  const { id } = req.params;
  try {
    await prisma.slaConfig.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: "SLA berhasil dihapus" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "SLA tidak ditemukan." });
    }
    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "SLA tidak bisa dihapus karena masih digunakan oleh Layanan.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Gagal menghapus SLA",
      error: error.message,
    });
  }
}

export async function getPetugasSLAPerformance(req, res) {
  try {
    const { petugas_id } = req.params;
    const { start_date, end_date } = req.query;

    const whereClause = {
      assigned_to_id: parseInt(petugas_id),
      status: { in: ["completed", "selesai", "closed"] },
    };

    if (start_date && end_date) {
      whereClause.completed_at = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        service: { select: { nama_layanan: true } },
        requester: { select: { nama: true } },
      },
      orderBy: { completed_at: "desc" },
    });

    const petugas = await prisma.user.findUnique({
      where: { id: parseInt(petugas_id) },
      select: { nama: true, email: true },
    });

    if (tickets.length === 0) {
      return res.json({
        success: true,
        message: "Belum ada tiket yang diselesaikan",
        data: {
          petugas: {
            id: parseInt(petugas_id),
            nama: petugas?.nama,
            email: petugas?.email,
          },
          period: {
            start: start_date || "All time",
            end: end_date || "Now",
          },
          summary: {
            total_tickets: 0,
            avg_sla: 0,
            tickets_on_time: 0,
            tickets_late: 0,
            on_time_percentage: 0,
          },
          tickets: [],
        },
      });
    }

    // Calculate performance using shared utility
    const performance = calculatePetugasPerformance(tickets);

    // Map tickets with SLA details
    const ticketsWithSLA = tickets.map((ticket) => {
      const slaPercentage = calculateResolutionSLAPercentage(
        ticket.completed_at,
        ticket.resolution_deadline
      );

      return {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        judul: ticket.judul_permohonan,
        service: ticket.service.nama_layanan,
        requester: ticket.requester.nama,
        priority: ticket.priority,
        resolution_deadline: ticket.resolution_deadline,
        completed_at: ticket.completed_at,
        sla_percentage: slaPercentage,
        delay_hours: calculateDelayHours(ticket.completed_at, ticket.resolution_deadline),
        status: getSLAStatusLabel(slaPercentage),
      };
    });

    res.json({
      success: true,
      data: {
        petugas: {
          id: parseInt(petugas_id),
          nama: petugas.nama,
          email: petugas.email,
        },
        period: {
          start: start_date || "All time",
          end: end_date || "Now",
        },
        summary: performance,
        tickets: ticketsWithSLA,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil performa SLA petugas",
      error: error.message,
    });
  }
}

export async function getPetugasSLARanking(req, res) {
  try {
    const { start_date, end_date } = req.query;

    const petugasList = await prisma.user.findMany({
      where: {
        role: { role_name: "petugas" },
        is_active: true,
      },
      select: { id: true, nama: true, email: true },
    });

    const whereClause = {
      status: { in: ["completed", "selesai", "closed"] },
      assigned_to_id: { not: null },
    };

    if (start_date && end_date) {
      whereClause.completed_at = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    }

    const allTickets = await prisma.ticket.findMany({
      where: whereClause,
    });

    // Calculate performance for each petugas using shared utility
    const performanceList = petugasList.map((petugas) => {
      const petugasTickets = allTickets.filter(
        (t) => t.assigned_to_id === petugas.id
      );

      const performance = calculatePetugasPerformance(petugasTickets);

      return {
        petugas: {
          id: petugas.id,
          nama: petugas.nama,
          email: petugas.email,
        },
        ...performance,
      };
    });

    // Sort by avg_sla (descending)
    performanceList.sort((a, b) => b.avg_sla - a.avg_sla);

    // Add rank
    performanceList.forEach((item, index) => {
      item.rank = index + 1;
    });

    res.json({
      success: true,
      data: {
        period: {
          start: start_date || "All time",
          end: end_date || "Now",
        },
        total_petugas: petugasList.length,
        ranking: performanceList,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil ranking SLA petugas",
      error: error.message,
    });
  }
}

export async function getTicketResolutionSLA(req, res) {
  try {
    const { id } = req.params;
    const { user } = req;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignee: { select: { nama: true } },
        service: {
          select: { nama_layanan: true },
          include: { sla: true },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan",
      });
    }



    // Security check: petugas can only access tickets assigned to them
    if (user.role === "petugas" && ticket.assigned_to_id !== user.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke tiket ini",
      });
    }

    const slaPercentage = calculateResolutionSLAPercentage(
      ticket.completed_at,
      ticket.resolution_deadline
    );

    res.json({
      success: true,
      data: {
        ticket_number: ticket.ticket_number,
        status: ticket.status,
        assignee: ticket.assignee?.nama || "Belum di-assign",
        service: ticket.service.nama_layanan,
        sla_config: {
          resolution_hours: ticket.service.sla.resolution_hours,
        },
        resolution_sla: {
          deadline: ticket.resolution_deadline,
          actual_completion: ticket.completed_at,
          percentage: slaPercentage,
          delay_hours: calculateDelayHours(ticket.completed_at, ticket.resolution_deadline),
          status: getSLAStatusLabel(slaPercentage),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail Resolution SLA tiket",
      error: error.message,
    });
  }
}

export async function getAdminResponsePerformance(req, res) {
  try {
    const { start_date, end_date } = req.query;

    const whereClause = {
      first_response_at: { not: null },
    };

    if (start_date && end_date) {
      whereClause.created_at = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      select: {
        ticket_number: true,
        response_deadline: true,
        first_response_at: true,
        priority: true,
      },
    });

    if (tickets.length === 0) {
      return res.json({
        success: true,
        message: "Belum ada tiket yang di-assign",
        data: {
          total_tickets: 0,
          tickets_on_time: 0,
          tickets_late: 0,
          on_time_percentage: 0,
        },
      });
    }

    const ticketsWithSLA = tickets.map((ticket) => {
      const responded = new Date(ticket.first_response_at);
      const deadline = new Date(ticket.response_deadline);

      const diffMs = responded - deadline;
      const diffHours = diffMs / (1000 * 60 * 60);
      const isOnTime = diffMs <= 0;

      return {
        ticket_number: ticket.ticket_number,
        response_deadline: ticket.response_deadline,
        first_response_at: ticket.first_response_at,
        delay_hours: Math.max(0, Math.round(diffHours * 10) / 10),
        is_on_time: isOnTime,
      };
    });

    const ticketsOnTime = ticketsWithSLA.filter((t) => t.is_on_time).length;
    const ticketsLate = tickets.length - ticketsOnTime;
    const onTimePercentage = Math.round((ticketsOnTime / tickets.length) * 100);

    res.json({
      success: true,
      data: {
        period: {
          start: start_date || "All time",
          end: end_date || "Now",
        },
        summary: {
          total_tickets: tickets.length,
          tickets_on_time: ticketsOnTime,
          tickets_late: ticketsLate,
          on_time_percentage: onTimePercentage,
        },
        tickets: ticketsWithSLA,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil performa Response SLA admin",
      error: error.message,
    });
  }
}
