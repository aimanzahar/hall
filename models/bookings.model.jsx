// models/bookings.model.jsx — Booking CRUD against PocketBase + pure helpers.
// Status values: 'pending' | 'approved' | 'rejected'.
(function () {
  function getPB() { return HB.Models.Auth && HB.Models.Auth.pb; }

  const STATUS = {
    pending:  { label: 'Pending review', cls: 'neutral', dot: '●' },
    approved: { label: 'Approved',       cls: 'ok',      dot: '●' },
    rejected: { label: 'Rejected',       cls: 'bad',     dot: '●' },
  };

  function fromRecord(r) {
    const exp = r.expand || {};
    return {
      id: r.id,
      user: r.user,
      venue: r.venue,
      venueExpand: exp.venue || null,
      userExpand: exp.user || null,
      venueName: r.venueName,
      dateISO: r.dateISO,
      timeStart: r.timeStart,
      timeEnd: r.timeEnd,
      dateLabel: r.dateLabel,
      timeLabel: r.timeLabel,
      guests: r.guests,
      eventType: r.eventType,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      contactPhone: r.contactPhone,
      notes: r.notes,
      status: r.status,
      adminNote: r.adminNote,
      confirm: r.confirm,
      total: r.total,
      created: r.created,
      updated: r.updated,
    };
  }

  // List bookings visible to the current auth token. PB rules already filter
  // users to their own rows and grant admins access to everything.
  async function listForAuth({ expand = 'venue,user', sort = '-created' } = {}) {
    const pb = getPB();
    if (!pb) return [];
    const res = await pb.collection('bookings').getFullList({ sort, expand });
    return res.map(fromRecord);
  }

  async function create(payload) {
    const pb = getPB();
    if (!pb) throw new Error('PocketBase unavailable');
    const rec = await pb.collection('bookings').create(payload, { expand: 'venue,user' });
    return fromRecord(rec);
  }

  async function updateStatus(id, status, adminNote) {
    const pb = getPB();
    if (!pb) throw new Error('PocketBase unavailable');
    const data = { status };
    if (typeof adminNote === 'string') data.adminNote = adminNote;
    const rec = await pb.collection('bookings').update(id, data, { expand: 'venue,user' });
    return fromRecord(rec);
  }

  async function remove(id) {
    const pb = getPB();
    if (!pb) throw new Error('PocketBase unavailable');
    await pb.collection('bookings').delete(id);
  }

  // Builds the outgoing booking payload for PocketBase from the Book-screen
  // draft. Takes the venue object (for the PB record id + denormalised name)
  // and the current user record.
  function makePayload({ venue, user, day, start, end, guests, eventType,
                        contactName, contactEmail, contactPhone, notes, total }) {
    const yyyy = 2026;
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const dd = String(day.date).padStart(2, '0');
    const timeStart = String(start).padStart(2, '0') + ':00';
    const timeEnd = String(end).padStart(2, '0') + ':00';
    const confirm = 'HB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    return {
      user: user.id,
      venue: venue._id || venue.recordId,
      venueName: venue.name,
      dateISO: `${yyyy}-${month}-${dd}`,
      timeStart, timeEnd,
      dateLabel: `${day.day}, Apr ${day.date}`,
      timeLabel: `${fmt12(start)} – ${fmt12(end)}`,
      guests, eventType,
      contactName, contactEmail, contactPhone,
      notes: notes || '',
      status: 'pending',
      confirm, total,
    };
  }

  function fmt12(h) {
    const am = h < 12 || h === 24;
    const n = h % 12 === 0 ? 12 : h % 12;
    return `${n}:00 ${am && h !== 24 ? 'AM' : 'PM'}`;
  }

  // Pure local helpers retained for the screens.
  function findById(list, id) { return list.find(b => b.id === id); }
  function countByStatus(list, status) { return list.filter(b => b.status === status).length; }
  function byStatus(list, status) { return list.filter(b => b.status === status); }

  HB.Models.Bookings = {
    STATUS,
    listForAuth, create, updateStatus, remove, makePayload,
    findById, countByStatus, byStatus,
  };
})();
