import prisma from "../config/prisma.js";
import {
  calculateResolutionSLAPercentage,
  getSLAStatusLabel,
  calculateDelayHours,
  calculatePetugasPerformance,
} from "../utils/slaUtils.js";

export async function getDashboardAnalytics(req, res) {
  try {
    const now = new Date();

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ============================================
    // 1. TICKET STATISTICS
    // ============================================
    const ticketCounts = await prisma.ticket.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const ticketStats = ticketCounts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {
        pending: 0,
        in_progress: 0,
        on_progress: 0, // legacy
        eskalasi: 0,
        completed: 0,
        selesai: 0, // legacy
        closed: 0,
        on_hold: 0, // legacy
      }
    );

    // ============================================
    // 2. PETUGAS STATISTICS
    // ============================================
    const totalPetugas = await prisma.user.count({
      where: { role: { role_name: "petugas" } },
    });

    const availablePetugas = await prisma.user.count({
      where: {
        role: { role_name: "petugas" },
        is_available: true,
      },
    });

    // ============================================
    // 3. USER STATISTICS
    // ============================================
    const totalUsers = await prisma.user.count({
      where: { role: { role_name: "user" } },
    });

    // ============================================
    // 4. FEEDBACK STATISTICS
    // ============================================
    const avgRatingAllTime = await prisma.feedback.aggregate({
      _avg: { rating: true },
    });

    const avgRatingThisMonth = await prisma.feedback.aggregate({
      _avg: { rating: true },
      where: {
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const avgRatingLastMonth = await prisma.feedback.aggregate({
      _avg: { rating: true },
      where: {
        created_at: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    });

    const totalFeedbackThisMonth = await prisma.feedback.count({
      where: {
        created_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // ============================================
    // 5. SLA PERFORMANCE (THIS MONTH)
    // ============================================
    const completedTicketsThisMonth = await prisma.ticket.findMany({
      where: {
        status: { in: ["completed", "selesai", "closed"] },
        completed_at: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
        assigned_to_id: { not: null },
      },
    });

    // Use shared utility for SLA calculation
    const slaPerformance = calculatePetugasPerformance(
      completedTicketsThisMonth
    );

    // ============================================
    // 6. TOP 3 PETUGAS (THIS MONTH)
    // ============================================
    const allPetugas = await prisma.user.findMany({
      where: {
        role: { role_name: "petugas" },
        is_active: true,
      },
      select: { id: true, nama: true },
    });

    const petugasPerformance = allPetugas.map((petugas) => {
      const petugasTickets = completedTicketsThisMonth.filter(
        (t) => t.assigned_to_id === petugas.id
      );

      const performance = calculatePetugasPerformance(petugasTickets);

      return {
        petugas_id: petugas.id,
        nama: petugas.nama,
        ...performance,
      };
    });

    const top3Petugas = petugasPerformance
      .filter((p) => p.total_tickets > 0)
      .sort((a, b) => b.avg_sla - a.avg_sla)
      .slice(0, 3);

    // ============================================
    // 7. PENDING TICKETS WITH URGENT DEADLINE
    // ============================================
    const urgentPendingTickets = await prisma.ticket.findMany({
      where: {
        status: "pending",
        response_deadline: {
          lte: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        ticket_number: true,
        response_deadline: true,
        priority: true,
      },
      orderBy: { response_deadline: "asc" },
      take: 5,
    });

    // ============================================
    // FORMAT RESPONSE
    // ============================================
    const response = {
      tickets: ticketStats,

      feedbacks: {
        average_rating_all_time: avgRatingAllTime._avg.rating
          ? parseFloat(avgRatingAllTime._avg.rating.toFixed(1))
          : 0,
        average_rating_this_month: avgRatingThisMonth._avg.rating
          ? parseFloat(avgRatingThisMonth._avg.rating.toFixed(1))
          : 0,
        average_rating_last_month: avgRatingLastMonth._avg.rating
          ? parseFloat(avgRatingLastMonth._avg.rating.toFixed(1))
          : 0,
        total_feedback_this_month: totalFeedbackThisMonth,
      },

      petugas: {
        total: totalPetugas,
        available: availablePetugas,
        busy: totalPetugas - availablePetugas,
      },

      users: {
        total: totalUsers,
      },

      sla_performance: {
        this_month: {
          total_completed_tickets: completedTicketsThisMonth.length,
          avg_sla_percentage: slaPerformance.avg_sla,
          tickets_on_time: slaPerformance.tickets_on_time,
          tickets_late: slaPerformance.tickets_late,
          on_time_rate: slaPerformance.on_time_percentage,
        },
        top_performers: top3Petugas,
      },

      response_performance: await getResponsePerformanceThisMonth(),

      urgent_alerts: {
        pending_tickets_near_deadline: urgentPendingTickets.length,
        tickets: urgentPendingTickets.map((t) => ({
          ticket_number: t.ticket_number,
          deadline: t.response_deadline,
          priority: t.priority,
          time_remaining_minutes: Math.max(
            0,
            Math.round((new Date(t.response_deadline) - now) / (1000 * 60))
          ),
        })),
      },
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data statistik",
      error: error.message,
    });
  }
}

// Helper function untuk response performance
async function getResponsePerformanceThisMonth() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const respondedTickets = await prisma.ticket.findMany({
    where: {
      first_response_at: { not: null },
      created_at: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    select: {
      response_deadline: true,
      first_response_at: true,
    },
  });

  if (respondedTickets.length === 0) {
    return {
      total_tickets: 0,
      tickets_on_time: 0,
      tickets_late: 0,
      on_time_percentage: 0,
    };
  }

  let onTimeCount = 0;
  
  respondedTickets.forEach((ticket) => {
    const responseTime = new Date(ticket.first_response_at);
    const deadline = new Date(ticket.response_deadline);
    
    if (responseTime <= deadline) {
      onTimeCount++;
    }
  });

  const lateCount = respondedTickets.length - onTimeCount;
  const onTimePercentage = Math.round((onTimeCount / respondedTickets.length) * 100);

  return {
    total_tickets: respondedTickets.length,
    tickets_on_time: onTimeCount,
    tickets_late: lateCount,
    on_time_percentage: onTimePercentage,
  };
}

// ============================================
// SLA Report (Detailed)
// ============================================
export async function getSLAReport(req, res) {
  try {
    const { start_date, end_date } = req.query;

    const now = new Date();
    const startDate = start_date
      ? new Date(start_date)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = end_date
      ? new Date(end_date)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const tickets = await prisma.ticket.findMany({
      where: {
        status: { in: ["completed", "selesai", "closed"] },
        completed_at: {
          gte: startDate,
          lte: endDate,
        },
        assigned_to_id: { not: null },
      },
      include: {
        assignee: { select: { id: true, nama: true } },
        service: { select: { nama_layanan: true } },
      },
    });

    // Calculate SLA for each ticket using shared utilities
    const ticketsWithSLA = tickets.map((ticket) => {
      const slaPercentage = calculateResolutionSLAPercentage(
        ticket.completed_at,
        ticket.resolution_deadline
      );

      return {
        ticket_number: ticket.ticket_number,
        service: ticket.service.nama_layanan,
        assignee: ticket.assignee.nama,
        priority: ticket.priority,
        resolution_deadline: ticket.resolution_deadline,
        completed_at: ticket.completed_at,
        sla_percentage: slaPercentage,
        delay_hours: calculateDelayHours(
          ticket.completed_at,
          ticket.resolution_deadline
        ),
        status: getSLAStatusLabel(slaPercentage),
      };
    });

    // Calculate summary using shared utility
    const summary = calculatePetugasPerformance(tickets);

    // Group by petugas
    const petugasMap = {};
    tickets.forEach((ticket) => {
      const petugasId = ticket.assignee.id;
      if (!petugasMap[petugasId]) {
        petugasMap[petugasId] = {
          nama: ticket.assignee.nama,
          tickets: [],
        };
      }
      petugasMap[petugasId].tickets.push(ticket);
    });

    const petugasStats = Object.values(petugasMap)
      .map((petugas) => {
        const performance = calculatePetugasPerformance(petugas.tickets);
        return {
          nama: petugas.nama,
          ...performance,
        };
      })
      .sort((a, b) => b.avg_sla - a.avg_sla);

    res.json({
      success: true,
      data: {
        period: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
        summary,
        petugas_performance: petugasStats,
        tickets: ticketsWithSLA,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil SLA report",
      error: error.message,
    });
  }
}
