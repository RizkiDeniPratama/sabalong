/**
 * Menghitung deadline berdasarkan jam kerja dinas.
 * Jam Kerja: 07:30 - 16:00
 * Istirahat: 12:00 - 13:00
 * Hari Kerja: Senin - Jumat (0-6, Minggu=0, Sabtu=6)
 *
 * @param {Date} startDate - Waktu mulai (saat admin assign)
 * @param {number} hoursNeeded - Durasi SLA dalam jam (misal: 4 jam)
 * @returns {Date} - Waktu deadline yang sudah disesuaikan
 */
export function calculateSLADeadline(startDate, hoursNeeded) {
  let remainingMinutes = hoursNeeded * 60;

  let cursor = new Date(startDate);

  const setTime = (date, h, m) => {
    const newDate = new Date(date);
    newDate.setHours(h, m, 0, 0);
    return newDate;
  };

  while (remainingMinutes > 0) {
    const day = cursor.getDay();

    if (day === 0 || day === 6) {
      cursor.setDate(cursor.getDate() + 1);
      cursor = setTime(cursor, 7, 30);
      continue;
    }

    // Definisi Batas Waktu Harian untuk hari ini
    const workStart = setTime(cursor, 7, 30);
    const breakStart = setTime(cursor, 12, 0);
    const breakEnd = setTime(cursor, 13, 0);
    const workEnd = setTime(cursor, 16, 0);

    // 2. Jika cursor sebelum jam kerja -> Geser ke 07:30
    if (cursor < workStart) {
      cursor = workStart;
    }

    // 3. Jika cursor di dalam jam istirahat -> Geser ke 13:00
    if (cursor >= breakStart && cursor < breakEnd) {
      cursor = breakEnd;
    }

    // 4. Jika cursor lewat jam kerja -> Geser ke BESOK 07:30
    if (cursor >= workEnd) {
      cursor.setDate(cursor.getDate() + 1);
      cursor = setTime(cursor, 7, 30);
      continue;
    }

    // --- LOGIKA PENGURANGAN WAKTU ---

    // Tentukan "Checkpoint" berikutnya (Istirahat atau Pulang)
    // Checkpoint adalah batas waktu terdekat di mana kita harus berhenti menghitung
    let nextCheckpoint;
    if (cursor < breakStart) {
      nextCheckpoint = breakStart; // Target: Jam Istirahat
    } else {
      nextCheckpoint = workEnd; // Target: Jam Pulang
    }

    // Hitung selisih menit dari sekarang (cursor) sampai checkpoint
    const msUntilCheckpoint = nextCheckpoint - cursor;
    const minutesUntilCheckpoint = msUntilCheckpoint / (1000 * 60);

    if (remainingMinutes <= minutesUntilCheckpoint) {
      // KASUS A: Cukup waktu di sesi ini!
      // Tambahkan sisa menit ke cursor dan SELESAI.
      cursor = new Date(cursor.getTime() + remainingMinutes * 60 * 1000);
      remainingMinutes = 0; // Loop berhenti
    } else {
      // KASUS B: Waktu tidak  cukup di sesi ini.
      // Habiskan waktu sesi ini, kurangi sisa menit, dan geser cursor ke checkpoint
      remainingMinutes -= minutesUntilCheckpoint;
      cursor = nextCheckpoint;

      // Jika checkpoint adalah jam istirahat, otomatis lompat ke selesai istirahat
      // agar loop berikutnya langsung mulai dari jam 13:00 (sesi sore)
      if (cursor.getTime() === breakStart.getTime()) {
        cursor = breakEnd;
      }
    }
  }

  return cursor;
}

// NOTE: calculateResolutionSLAPercentage has been moved to ../utils/slaUtils.js
// Import from there if needed: import { calculateResolutionSLAPercentage } from "../utils/slaUtils.js"
