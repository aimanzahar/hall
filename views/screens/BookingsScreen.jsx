// views/screens/BookingsScreen.jsx — List of bookings, tabbed upcoming/past.
// Receives the bookings list + setRoute + setActiveBookingId from controllers.
(function () {
  const { useState } = React;
  const { VENUES, getById } = HB.Models.Venues;
  const M = HB.Models.Bookings;
  const { Icon } = HB.Views;

  function BookingsScreen({ bookings, setRoute, setActiveBookingId }) {
    const [tab, setTab] = useState('upcoming');
    const filtered = tab === 'upcoming'
      ? M.activeOrUpcoming(bookings)
      : M.onlyCompleted(bookings);
    const active = M.findActive(bookings);
    const nextUp = M.nextUpcoming(bookings);

    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">My <em>bookings</em></h1>
            <p className="page-sub">Everything you've reserved. Self-checkin is ready for any active event.</p>
          </div>
          <button className="btn accent" onClick={() => setRoute('discover')}><Icon name="plus" size={13}/> New booking</button>
        </div>

        {active && (
          <div className="card" style={{ overflow: 'hidden', marginBottom: 22, border: '1px solid var(--accent)', background: 'var(--accent-weak)' }}>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 0 4px rgba(23,133,74,0.2)' }}/>
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--ok)' }}>Live now · door unlocked</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.01em' }}>{active.venue}</div>
                <div style={{ color: 'var(--ink-2)', fontSize: 13.5, marginTop: 2 }}>{active.date} · {active.time} · {active.guests} guests</div>
              </div>
              <button className="btn accent lg" onClick={() => { setActiveBookingId(active.id); setRoute('checkin'); }}>
                <Icon name="qr" size={14}/> Open check-in
              </button>
            </div>
          </div>
        )}

        <div className="stat-row" style={{ marginBottom: 22 }}>
          {[
            ['Upcoming', M.countByStatus(bookings, 'upcoming'), 'Next: ' + (nextUp ? nextUp.date : '—')],
            ['Total spent', '$5,565', 'Past 12 months'],
            ['Hours booked', '32', '+8 vs last quarter', 'up'],
            ['Favorite venue', 'Cedar Hall', '4 visits'],
          ].map(([l, v, d, cls]) => (
            <div key={l} className="stat">
              <div className="stat-label">{l}</div>
              <div className="stat-val">{v}</div>
              <div className={`stat-delta ${cls || ''}`}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 0 }}>
          {[['upcoming', 'Upcoming & active'], ['completed', 'Past events']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '10px 14px', fontSize: 13.5, fontWeight: 500,
              color: tab === k ? 'var(--ink)' : 'var(--muted)',
              borderBottom: tab === k ? '2px solid var(--ink)' : '2px solid transparent',
              marginBottom: -1,
            }}>{l}</button>
          ))}
        </div>

        <div className="card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div className="booking-head">
            <span/>
            <span>Venue</span>
            <span>Date & time</span>
            <span>Guests</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {filtered.map(b => {
            const v = getById(b.venueId, VENUES);
            return (
              <div key={b.id} className="booking-row" onClick={() => { setActiveBookingId(b.id); setRoute('checkin'); }}>
                <div className={`thumb ph ${v.hero}`}/>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{b.venue}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{v.district} · {b.confirm}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{b.date}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.time}</div>
                </div>
                <div style={{ fontSize: 13.5 }}>{b.guests}</div>
                <div>
                  {b.status === 'active' && <span className="badge ok">● Live now</span>}
                  {b.status === 'upcoming' && <span className="badge neutral">● Upcoming</span>}
                  {b.status === 'completed' && <span className="badge neutral">Completed</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {b.status !== 'completed' ? (
                    <button className="btn" style={{ padding: '6px 10px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setActiveBookingId(b.id); setRoute('checkin'); }}>
                      <Icon name="qr" size={12}/> Check-in
                    </button>
                  ) : (
                    <button className="btn" style={{ padding: '6px 10px', fontSize: 12 }}>Rebook</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  HB.Views.BookingsScreen = BookingsScreen;
})();
