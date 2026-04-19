// views/screens/ConfirmScreen.jsx — Shown after a booking request is submitted.
// The request is pending until an admin reviews it.
(function () {
  const { Icon, VenueHero } = HB.Views;
  const V = HB.Models.Venues;

  function ConfirmScreen({ booking, setRoute, venues }) {
    if (!booking) { setRoute('discover'); return null; }
    const v = V.getById(booking.venueExpand?.slug || booking.venueName, venues);

    return (
      <div className="page" style={{ maxWidth:720, margin:'0 auto' }}>
        <div style={{ textAlign:'center', padding:'30px 0 18px' }}>
          <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(181,105,30,0.15)', display:'inline-grid', placeItems:'center', color:'var(--warn, #b5691e)' }}>
            <Icon name="clock" size={26}/>
          </div>
          <h1 className="page-title" style={{ marginTop:16 }}>Request <em>submitted</em></h1>
          <p className="page-sub">Ref {booking.confirm} · Confirmation sent to {booking.contactEmail}</p>
        </div>

        <div className="card" style={{ overflow:'hidden' }}>
          {v && <VenueHero venue={v} style={{ aspectRatio:'16/6' }}/>}
          <div style={{ padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:500 }}>{booking.venueName}</div>
                <div style={{ color:'var(--muted)', fontSize:13 }}>{v?.district || ''}</div>
              </div>
              <span className="badge neutral">● Pending review</span>
            </div>

            <div className="confirm-trio">
              <div><div className="confirm-k">Date</div><div className="confirm-v">{booking.dateLabel}</div></div>
              <div><div className="confirm-k">Time</div><div className="confirm-v">{booking.timeLabel}</div></div>
              <div><div className="confirm-k">Guests</div><div className="confirm-v">{booking.guests}</div></div>
            </div>

            <div className="info-box" style={{ marginTop:18 }}>
              <strong>What happens next</strong>
              Our admin team reviews every booking request within 24 hours. You'll get an email the moment a decision is made. In the meantime, feel free to submit more requests for other dates or halls.
            </div>

            <div style={{ display:'flex', gap:10, marginTop:24, flexWrap:'wrap' }}>
              <button className="btn accent" onClick={() => setRoute('bookings')}>
                <Icon name="ticket" size={13}/> View my bookings
              </button>
              <button className="btn" onClick={() => setRoute('discover')}>Browse more halls</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  HB.Views.ConfirmScreen = ConfirmScreen;
})();
