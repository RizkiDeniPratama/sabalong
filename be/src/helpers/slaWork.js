export function getNextWorkingHourStart(date) {
  const cursor = new Date(date);

  const setTime = (d, h, m) => {
    const newDate = new Date(d);
    newDate.setHours(h, m, 0, 0);
    return newDate;
  };

  while (true) {
    const day = cursor.getDay();

    // 1. Jika weekend, lompat ke Senin
    if (day === 0) {
      // Minggu
      cursor.setDate(cursor.getDate() + 1); // Ke Senin
      cursor = setTime(cursor, 7, 30);
      break;
    }
    if (day === 6) {
      // Sabtu
      cursor.setDate(cursor.getDate() + 2); // Ke Senin
      cursor = setTime(cursor, 7, 30);
      break;
    }

    // 2. Hari kerja - cek jamnya
    const workStart = setTime(cursor, 7, 30);
    const workEnd = setTime(cursor, 16, 0);

    // Jika sebelum jam kerja → return jam 07:30 hari ini
    if (cursor < workStart) {
      return workStart;
    }

    // Jika di dalam jam kerja → return sekarang
    if (cursor >= workStart && cursor < workEnd) {
      return cursor;
    }

    // Jika setelah jam kerja → return jam 07:30 besok
    if (cursor >= workEnd) {
      cursor.setDate(cursor.getDate() + 1);
      cursor = setTime(cursor, 7, 30);
      continue; // Check lagi apakah besok weekend
    }
  }

  return cursor;
}
