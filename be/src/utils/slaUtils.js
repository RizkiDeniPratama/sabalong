/**
 * Shared SLA Utility Functions
 * Centralized SLA calculations to avoid duplication across controllers
 */

/**
 * Calculate Resolution SLA Percentage
 * - On time (before deadline) = 100%
 * - Late 1-2 hours = 90%
 * - Late 2-4 hours = 80%
 * - Late 4-8 hours = 70%
 * - Late 8-12 hours = 60%
 * - Late 12-24 hours = 50%
 * - Late > 24 hours = 0%
 *
 * @param {Date|string} completedAt - Completion timestamp
 * @param {Date|string} resolutionDeadline - Deadline timestamp
 * @returns {number|null} - SLA percentage or null if data incomplete
 */
export function calculateResolutionSLAPercentage(completedAt, resolutionDeadline) {
  if (!completedAt || !resolutionDeadline) return null;

  const completed = new Date(completedAt);
  const deadline = new Date(resolutionDeadline);

  const diffMs = completed - deadline;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 0) return 100;
  if (diffHours <= 2) return 90;
  if (diffHours <= 4) return 80;
  if (diffHours <= 8) return 70;
  if (diffHours <= 12) return 60;
  if (diffHours <= 24) return 50;

  return 0;
}

/**
 * Get SLA Status Label (English, standardized)
 *
 * @param {number|null} slaPercentage - SLA percentage
 * @returns {string} - Status label
 */
export function getSLAStatusLabel(slaPercentage) {
  if (slaPercentage === null) return "Not Completed";
  if (slaPercentage === 100) return "On Time";
  if (slaPercentage >= 90) return "Slightly Late";
  if (slaPercentage >= 70) return "Late";
  return "Very Late";
}

/**
 * Calculate delay hours between completion and deadline
 *
 * @param {Date|string} completedAt - Completion timestamp
 * @param {Date|string} deadline - Deadline timestamp
 * @returns {number} - Delay in hours (0 if on time)
 */
export function calculateDelayHours(completedAt, deadline) {
  if (!completedAt || !deadline) return 0;

  const completed = new Date(completedAt);
  const deadlineDate = new Date(deadline);

  const diffMs = completed - deadlineDate;
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.max(0, Math.round(diffHours * 10) / 10);
}

/**
 * Calculate petugas SLA performance from tickets
 *
 * @param {Array} tickets - Array of completed tickets
 * @returns {Object} - Performance summary
 */
export function calculatePetugasPerformance(tickets) {
  if (!tickets || tickets.length === 0) {
    return {
      total_tickets: 0,
      avg_sla: 0,
      tickets_on_time: 0,
      tickets_late: 0,
      on_time_percentage: 0,
    };
  }

  let totalSLA = 0;
  let ticketsWithSLA = 0;
  let onTimeCount = 0;

  tickets.forEach((ticket) => {
    const sla = calculateResolutionSLAPercentage(
      ticket.completed_at,
      ticket.resolution_deadline
    );
    if (sla !== null) {
      totalSLA += sla;
      ticketsWithSLA++;
      if (sla === 100) onTimeCount++;
    }
  });

  const avgSLA = ticketsWithSLA > 0 ? Math.round(totalSLA / ticketsWithSLA) : 0;

  return {
    total_tickets: tickets.length,
    avg_sla: avgSLA,
    tickets_on_time: onTimeCount,
    tickets_late: tickets.length - onTimeCount,
    on_time_percentage: Math.round((onTimeCount / tickets.length) * 100),
  };
}
