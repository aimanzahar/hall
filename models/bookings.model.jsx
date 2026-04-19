// models/bookings.model.jsx — Bookings seed + pure operations. No React.
(function () {
  const BOOKINGS = [
    {
      id: 'b1',
      venueId: 'v1',
      venue: 'The Atrium',
      date: 'Fri, Apr 24',
      dateISO: '2026-04-24',
      time: '6:00 PM – 11:00 PM',
      guests: 140,
      status: 'upcoming',
      pin: '4 8 2 9',
      confirm: 'HB-2A7F91',
      total: 1380,
      checkinOpens: 'Fri 5:30 PM',
    },
    {
      id: 'b2',
      venueId: 'v5',
      venue: 'Cedar Hall',
      date: 'Today, Apr 19',
      dateISO: '2026-04-19',
      time: '8:00 PM – 1:00 AM',
      guests: 85,
      status: 'active',
      pin: '6 3 1 7',
      confirm: 'HB-91C4D2',
      total: 1020,
      checkinOpens: 'Ready now',
    },
    {
      id: 'b3',
      venueId: 'v3',
      venue: 'Garden Pavilion',
      date: 'Sat, May 09',
      dateISO: '2026-05-09',
      time: '3:00 PM – 10:00 PM',
      guests: 210,
      status: 'upcoming',
      pin: '0 5 5 2',
      confirm: 'HB-66B1E8',
      total: 2340,
      checkinOpens: 'Sat 2:30 PM',
    },
    {
      id: 'b4',
      venueId: 'v2',
      venue: 'Loft 47',
      date: 'Sat, Mar 22',
      dateISO: '2026-03-22',
      time: '7:00 PM – 12:00 AM',
      guests: 60,
      status: 'completed',
      pin: '——',
      confirm: 'HB-4710CC',
      total: 825,
      checkinOpens: '',
    },
  ];

  function findById(list, id) { return list.find(b => b.id === id); }
  function findActive(list) { return list.find(b => b.status === 'active'); }
  function firstActiveOrFirst(list) {
    const a = findActive(list);
    return a ? a.id : (list[0] && list[0].id);
  }
  function nextUpcoming(list) { return list.find(b => b.status === 'upcoming'); }
  function countByStatus(list, status) {
    return list.filter(b => b.status === status).length;
  }
  function activeOrUpcoming(list) {
    return list.filter(b => b.status === 'active' || b.status === 'upcoming');
  }
  function notCompleted(list) { return list.filter(b => b.status !== 'completed'); }
  function onlyCompleted(list) { return list.filter(b => b.status === 'completed'); }

  // Append a booking immutably. Reassigns a sequential id.
  function append(list, booking) {
    const id = 'b' + (list.length + 1);
    return [{ ...booking, id }, ...list];
  }

  // Construct a booking record (caller formats date/time via Schedule.fmt12).
  function make({ venue, date, time, guests, total, pin = '7 1 4 6', checkinOpens }) {
    return {
      id: 'b-new',
      venueId: venue.id,
      venue: venue.name,
      date,
      time,
      guests,
      status: 'upcoming',
      pin,
      confirm: 'HB-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      total,
      checkinOpens,
    };
  }

  HB.Models.Bookings = {
    BOOKINGS,
    findById, findActive, firstActiveOrFirst, nextUpcoming,
    countByStatus, activeOrUpcoming, notCompleted, onlyCompleted,
    append, make,
  };
})();
