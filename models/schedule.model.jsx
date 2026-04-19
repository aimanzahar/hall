// models/schedule.model.jsx — Pure time + weekly-schedule helpers. No React.
(function () {
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 7-day hour grid: 24 cells/day, status: 'open' | 'booked' | 'hold'.
  function buildSchedule(seed = 1) {
    return DAY_NAMES.map((d, di) => ({
      day: d,
      date: 19 + di,
      hours: Array.from({ length: 24 }, (_, h) => {
        const x = (di * 7 + h * 3 + seed) % 11;
        if (h < 8) return 'open';
        if (x === 0 || x === 3) return 'booked';
        if (x === 5) return 'hold';
        return 'open';
      }),
    }));
  }

  function fmt12(h) {
    const am = h < 12 || h === 24;
    const n = h % 12 === 0 ? 12 : h % 12;
    return `${n}:00 ${am && h !== 24 ? 'AM' : 'PM'}`;
  }

  // Visible hour range for the picker (8am – 11pm inclusive end = 23).
  function visibleHours(startH = 8, count = 16) {
    return Array.from({ length: count }, (_, i) => startH + i);
  }

  HB.Models.Schedule = { DAY_NAMES, buildSchedule, fmt12, visibleHours };
})();
