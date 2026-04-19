// views/screens/BookingsScreen.jsx — List of the signed-in user's bookings,
// grouped by status tab (pending / approved / rejected / all).
(function () {
  const { useState, useMemo } = React;
  const M = HB.Models.Bookings;
  const V = HB.Models.Venues;
  const { Icon, VenueHero } = HB.Views;

  function BookingsScreen({ bookings, loading, error, refresh, setRoute, venues }) {
    const [tab, setTab] = useState('all');

    const counts = useMemo(() => ({
      all: bookings.length,
      pending:  M.countByStatus(bookings, 'pending'),
      approved: M.countByStatus(bookings, 'approved'),
      rejected: M.countByStatus(bookings, 'rejected'),
    }), [bookings]);

    const filtered = tab === 'all' ? bookings : M.byStatus(bookings, tab);

    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">My <em>bookings</em></h1>
            <p className="page-sub">Every hall you've requested — including pending reviews and past decisions.</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn" onClick={refresh} disabled={loading}>
              <Icon name="arrow" size={12}/> {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button className="btn accent" onClick={() => setRoute('discover')}><Icon name="plus" size={13}/> New booking</button>
          </div>
        </div>

        {error && <div className="auth-error" role="alert" style={{ marginBottom:16 }}>{error}</div>}

        <div className="stat-row" style={{ marginBottom:22 }}>
          <div className="stat"><div className="stat-label">All requests</div><div className="stat-val">{counts.all}</div><div className="stat-delta">Across every status</div></div>
          <div className="stat"><div className="stat-label">Pending</div><div className="stat-val">{counts.pending}</div><div className="stat-delta">Awaiting review</div></div>
          <div className="stat"><div className="stat-label">Approved</div><div className="stat-val">{counts.approved}</div><div className="stat-delta up">Ready to go</div></div>
          <div className="stat"><div className="stat-label">Rejected</div><div className="stat-val">{counts.rejected}</div><div className="stat-delta">Try another date</div></div>
        </div>

        <div className="booking-tabs">
          {[
            ['all',      'All',      counts.all],
            ['pending',  'Pending',  counts.pending],
            ['approved', 'Approved', counts.approved],
            ['rejected', 'Rejected', counts.rejected],
          ].map(([k, label, n]) => (
            <button key={k} className={`booking-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
              {label} <span className="admin-tab-count">{n}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="admin-empty" style={{ borderRadius:12, border:'1px solid var(--line)' }}>
            {loading ? 'Loading bookings…' : 'No bookings to show in this view.'}
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => {
              const slug = b.venueExpand?.slug;
              const v = slug ? V.getById(slug, venues) : null;
              const status = M.STATUS[b.status] || M.STATUS.pending;
              return (
                <div key={b.id} className="booking-item">
                  {v
                    ? <VenueHero venue={v} className="booking-thumb"/>
                    : <div className="booking-thumb ph warm"><div className="ph-label">{(b.venueName || '').toUpperCase()}</div></div>
                  }
                  <div className="booking-main">
                    <div className="booking-row-top">
                      <div>
                        <div className="booking-venue-name">{b.venueName}</div>
                        <div className="admin-muted">{v?.district || ''} · Ref {b.confirm}</div>
                      </div>
                      <span className={`badge ${status.cls}`}>{status.dot} {status.label}</span>
                    </div>
                    <div className="booking-row-meta">
                      <span><Icon name="calendar" size={12}/> {b.dateLabel}</span>
                      <span><Icon name="clock" size={12}/> {b.timeLabel}</span>
                      <span><Icon name="users" size={12}/> {b.guests} guests</span>
                      <span><Icon name="ticket" size={12}/> RM {b.total?.toLocaleString() || '—'}</span>
                    </div>
                    {b.adminNote && (
                      <div className="booking-note">
                        <strong>Admin note:</strong> {b.adminNote}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  HB.Views.BookingsScreen = BookingsScreen;
})();
