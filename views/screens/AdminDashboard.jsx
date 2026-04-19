// views/screens/AdminDashboard.jsx — Operations queue. Lists every booking,
// filterable by status, with approve / reject / revert actions. Data comes
// from the useAdminBookings controller (which talks to PocketBase).
(function () {
  const { useState, useMemo } = React;
  const M = HB.Models.Bookings;
  const { Icon } = HB.Views;

  function AdminDashboard({ admin, ctl, onLogout }) {
    const { bookings, loading, error, refresh, approve, reject, setPending } = ctl;
    const [filter, setFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);

    const counts = useMemo(() => ({
      all: bookings.length,
      pending:  M.countByStatus(bookings, 'pending'),
      approved: M.countByStatus(bookings, 'approved'),
      rejected: M.countByStatus(bookings, 'rejected'),
    }), [bookings]);

    const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();
      return bookings
        .filter(b => filter === 'all' || b.status === filter)
        .filter(b => !q ||
          b.venueName?.toLowerCase().includes(q) ||
          b.contactName?.toLowerCase().includes(q) ||
          b.contactEmail?.toLowerCase().includes(q) ||
          b.confirm?.toLowerCase().includes(q));
    }, [bookings, filter, search]);

    const openBooking = (b) => { setSelected(b); setNote(b.adminNote || ''); };
    const closeBooking = () => { setSelected(null); setNote(''); };

    const act = async (fn) => {
      if (!selected) return;
      setBusy(true);
      try {
        await fn(selected.id, note);
        closeBooking();
      } catch (e) {
        alert('Action failed: ' + (e.message || e));
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-brand">
            <div className="brand-mark admin-mark">A</div>
            <div>
              <div className="admin-brand-title">Hall<em>book</em> <span className="admin-chip sm">ADMIN</span></div>
              <div className="admin-brand-sub">Signed in as {admin?.email}</div>
            </div>
          </div>
          <div className="admin-topbar-right">
            <button className="btn ghost" onClick={refresh} disabled={loading}>
              <Icon name="arrow" size={12}/> {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </header>

        <section className="admin-main">
          <div className="admin-heading">
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>Booking <em>queue</em></h1>
              <p className="page-sub" style={{ margin: '4px 0 0' }}>
                Review incoming requests. Approve what fits, reject with a note what doesn't.
              </p>
            </div>
            {error && <div className="auth-error" style={{ maxWidth: 360 }}>{error}</div>}
          </div>

          <div className="admin-stats">
            <StatCard label="All requests" value={counts.all} />
            <StatCard label="Pending review" value={counts.pending} tone="warn" />
            <StatCard label="Approved" value={counts.approved} tone="ok" />
            <StatCard label="Rejected" value={counts.rejected} tone="bad" />
          </div>

          <div className="admin-toolbar">
            <div className="admin-filter-tabs">
              {[
                ['pending',  'Pending',  counts.pending],
                ['approved', 'Approved', counts.approved],
                ['rejected', 'Rejected', counts.rejected],
                ['all',      'All',      counts.all],
              ].map(([k, label, n]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`admin-tab ${filter === k ? 'active' : ''}`}>
                  {label} <span className="admin-tab-count">{n}</span>
                </button>
              ))}
            </div>
            <input className="admin-search" placeholder="Search venue, name, email, reference…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="admin-table-card">
            <div className="admin-table-head">
              <span>Venue</span>
              <span>Requested by</span>
              <span>Date &amp; time</span>
              <span>Guests</span>
              <span>Status</span>
              <span>Reference</span>
            </div>
            {filtered.length === 0 && (
              <div className="admin-empty">
                {loading ? 'Loading bookings…' : 'No bookings match the current filter.'}
              </div>
            )}
            {filtered.map(b => (
              <button key={b.id} className="admin-row" onClick={() => openBooking(b)}>
                <span className="admin-venue">
                  <strong>{b.venueName}</strong>
                  <span className="admin-muted">{b.venueExpand?.district || ''}</span>
                </span>
                <span>
                  <div>{b.contactName}</div>
                  <div className="admin-muted">{b.contactEmail}</div>
                </span>
                <span>
                  <div>{b.dateLabel}</div>
                  <div className="admin-muted">{b.timeLabel}</div>
                </span>
                <span>{b.guests}</span>
                <span><StatusBadge status={b.status}/></span>
                <span className="admin-mono">{b.confirm}</span>
              </button>
            ))}
          </div>
        </section>

        {selected && (
          <div className="admin-modal-scrim" onClick={closeBooking}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-head">
                <div>
                  <div className="admin-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Booking request</div>
                  <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500 }}>{selected.venueName}</h2>
                </div>
                <button className="btn ghost" onClick={closeBooking} aria-label="Close">✕</button>
              </div>

              <dl className="admin-dl">
                <Row k="Status"   v={<StatusBadge status={selected.status}/>}/>
                <Row k="Reference" v={<span className="admin-mono">{selected.confirm}</span>}/>
                <Row k="Date"     v={selected.dateLabel}/>
                <Row k="Time"     v={selected.timeLabel}/>
                <Row k="Event"    v={selected.eventType || '—'}/>
                <Row k="Guests"   v={selected.guests}/>
                <Row k="Contact"  v={<>
                  <div>{selected.contactName}</div>
                  <div className="admin-muted">{selected.contactEmail}</div>
                  <div className="admin-muted">{selected.contactPhone}</div>
                </>}/>
                {selected.notes && <Row k="Notes" v={<div className="admin-wrap">{selected.notes}</div>}/>}
                {selected.total != null && <Row k="Estimated total" v={`RM ${selected.total.toLocaleString()}`}/>}
              </dl>

              <div className="field" style={{ marginTop: 14 }}>
                <label>Admin note (shared with the customer)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Optional — e.g. 'Approved, please confirm catering head-count by Friday' or 'Rejected — slot clashes with another event'."
                  className="admin-textarea"/>
              </div>

              <div className="admin-modal-actions">
                {selected.status !== 'rejected' && (
                  <button className="btn" onClick={() => act(reject)} disabled={busy}>
                    Reject request
                  </button>
                )}
                {selected.status !== 'pending' && (
                  <button className="btn" onClick={() => act(setPending)} disabled={busy}>
                    Move back to pending
                  </button>
                )}
                {selected.status !== 'approved' && (
                  <button className="btn accent" onClick={() => act(approve)} disabled={busy}>
                    {busy ? 'Saving…' : 'Approve request'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Row({ k, v }) {
    return (<><dt>{k}</dt><dd>{v}</dd></>);
  }

  function StatCard({ label, value, tone }) {
    return (
      <div className={`admin-stat ${tone || ''}`}>
        <div className="admin-stat-label">{label}</div>
        <div className="admin-stat-value">{value}</div>
      </div>
    );
  }

  function StatusBadge({ status }) {
    const s = M.STATUS[status] || M.STATUS.pending;
    return <span className={`badge ${s.cls}`}>{s.dot} {s.label}</span>;
  }

  HB.Views.AdminDashboard = AdminDashboard;
})();
