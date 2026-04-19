// views/screens/ConfirmScreen.jsx — Post-booking success page.
(function () {
  const { VENUES, getById } = HB.Models.Venues;
  const { Icon } = HB.Views;

  function ConfirmScreen({ booking, setRoute }) {
    if (!booking) { setRoute('discover'); return null; }
    const v = getById(booking.venueId, VENUES);
    return (
      <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '30px 0 18px' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(23,133,74,0.12)', display: 'inline-grid', placeItems: 'center', color: 'var(--ok)' }}>
            <Icon name="check" size={26}/>
          </div>
          <h1 className="page-title" style={{ marginTop: 16 }}>You're <em>booked</em></h1>
          <p className="page-sub">Confirmation sent to amira@studio.co · {booking.confirm}</p>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className={`ph ${v.hero}`} style={{ aspectRatio: '16/6' }}>
            <div className="ph-label">{v.name.toUpperCase()}</div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{v.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{v.district}</div>
              </div>
              <span className="badge ok">● Confirmed</span>
            </div>

            <div className="confirm-trio">
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.06em' }}>Date</div><div style={{ fontWeight: 500, marginTop: 2 }}>{booking.date}</div></div>
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.06em' }}>Time</div><div style={{ fontWeight: 500, marginTop: 2 }}>{booking.time}</div></div>
              <div><div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.06em' }}>Guests</div><div style={{ fontWeight: 500, marginTop: 2 }}>{booking.guests}</div></div>
            </div>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.06em' }}>Self check-in PIN</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '0.1em' }}>{booking.pin}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Sent again 2h before start</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.06em' }}>Doors unlock</div>
                <div style={{ fontWeight: 500, marginTop: 4 }}>{booking.checkinOpens}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>30 min before start</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn accent" onClick={() => setRoute('checkin')}><Icon name="qr" size={13}/> View check-in</button>
              <button className="btn" onClick={() => setRoute('bookings')}>All bookings</button>
              <button className="btn ghost" style={{ marginLeft: 'auto' }}>Add to calendar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  HB.Views.ConfirmScreen = ConfirmScreen;
})();
