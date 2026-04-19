// views/screens/CheckinScreen.jsx — QR/PIN + door-unlock simulation.
// Picks which booking to show from (activeBookingId | first active | first upcoming | first).
(function () {
  const { useState, useMemo, useEffect } = React;
  const { VENUES, getById } = HB.Models.Venues;
  const { fmt12 } = HB.Models.Schedule;
  const M = HB.Models.Bookings;
  const { Icon, SummaryRow } = HB.Views;

  function CheckinScreen({ bookings, activeBookingId, setRoute }) {
    const booking = M.findById(bookings, activeBookingId)
      || M.findActive(bookings)
      || M.nextUpcoming(bookings)
      || bookings[0];
    const v = getById(booking.venueId, VENUES);
    const [doorState, setDoorState] = useState('locked');
    const [method, setMethod] = useState('qr');
    const isLive = booking.status === 'active';

    // Deterministic QR pattern seeded by booking.confirm.
    const qrModules = useMemo(() => {
      const seed = booking.confirm.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      return Array.from({ length: 21 * 21 }, (_, i) => {
        const x = i % 21, y = Math.floor(i / 21);
        const inCorner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
        if (inCorner) {
          const cx = x < 7 ? x : x - 14, cy = y < 7 ? y : y - 14;
          const edge = cx === 0 || cx === 6 || cy === 0 || cy === 6;
          const mid = cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4;
          return edge || mid;
        }
        return ((x * 7 + y * 13 + seed * (x + y + 1)) % 11) < 5;
      });
    }, [booking.confirm]);

    useEffect(() => {
      if (!isLive) setDoorState('locked');
    }, [isLive, booking.id]);

    const unlock = () => {
      setDoorState('unlocking');
      setTimeout(() => setDoorState('unlocked'), 1400);
    };

    const liveOrUpcoming = M.notCompleted(bookings);

    return (
      <div className="page" style={{ maxWidth: 1040 }}>
        <div className="page-head">
          <div>
            <h1 className="page-title">Self <em>check-in</em></h1>
            <p className="page-sub">Scan at the door kiosk, or enter your PIN. The system works 24/7 with no staff on site.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="segmented">
              <button className={method === 'qr' ? 'active' : ''} onClick={() => setMethod('qr')}>QR code</button>
              <button className={method === 'pin' ? 'active' : ''} onClick={() => setMethod('pin')}>PIN fallback</button>
            </div>
          </div>
        </div>

        {liveOrUpcoming.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {liveOrUpcoming.map(b => (
              <button key={b.id}
                className={`chip ${b.id === booking.id ? 'selected' : ''}`}
                onClick={() => setRoute('checkin')}
                style={{ padding: '6px 12px' }}>
                {b.venue} · {b.date}
                {b.status === 'active' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7ae6a7', marginLeft: 4 }}/>}
              </button>
            ))}
          </div>
        )}

        <div className="layout-checkin">
          <div className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              {isLive ? (
                <>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 0 4px rgba(23,133,74,0.2)' }}/>
                  <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ok)', fontWeight: 600 }}>Ready at door</span>
                </>
              ) : (
                <>
                  <Icon name="clock" size={12}/>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Check-in opens {booking.checkinOpens}</span>
                </>
              )}
            </div>

            {method === 'qr' ? (
              <div className="qr" style={{ filter: isLive ? 'none' : 'grayscale(0.6) opacity(0.55)' }}>
                {qrModules.map((on, i) => <div key={i} className={on ? 'm' : ''}/>)}
              </div>
            ) : (
              <div style={{ padding: '40px 0', filter: isLive ? 'none' : 'opacity(0.55)' }}>
                <div className="pin-box">
                  {booking.pin.split(' ').map((d, i) => <div key={i} className="pin-digit">{d}</div>)}
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Enter on door keypad</div>
              </div>
            )}

            <div style={{ marginTop: 24, fontSize: 13, color: 'var(--ink-2)' }}>
              {method === 'qr'
                ? 'Hold your phone to the kiosk scanner. The door unlocks automatically.'
                : 'Keypad is to the right of the main entrance. Press # after your PIN.'}
            </div>

            <div style={{
              marginTop: 22, width: '100%', padding: 16, borderRadius: 10,
              border: '1px solid var(--line)',
              background: doorState === 'unlocked' ? 'rgba(23,133,74,0.08)' : 'var(--line-2)',
              borderColor: doorState === 'unlocked' ? 'var(--ok)' : 'var(--line)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: doorState === 'unlocked' ? 'var(--ok)' : 'var(--ink)',
                color: '#fff', display: 'grid', placeItems: 'center',
                transition: 'background 300ms',
              }}>
                {doorState === 'unlocked' ? <Icon name="check" size={18}/> :
                 doorState === 'unlocking' ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 800ms linear infinite' }}/> :
                 <Icon name="qr" size={18}/>}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {doorState === 'unlocked' ? 'Door unlocked — welcome in' :
                   doorState === 'unlocking' ? 'Verifying and unlocking…' :
                   'Door locked'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
                  {doorState === 'unlocked' ? `Auto-relocks at ${fmt12(parseInt(booking.time.split(':')[0]) + 5 || 23)}` :
                   isLive ? 'Tap simulate to test the flow without leaving home' :
                   'Opens 30 min before your event starts'}
                </div>
              </div>
              {isLive && doorState !== 'unlocked' && (
                <button className="btn accent" onClick={unlock} disabled={doorState === 'unlocking'}>
                  Simulate scan
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div className={`ph ${v.hero}`} style={{ aspectRatio: '16/7' }}>
                <div className="ph-label">{v.name.toUpperCase()}</div>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{booking.venue}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{v.district}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <SummaryRow k="Date" v={booking.date}/>
                  <SummaryRow k="Time" v={booking.time}/>
                  <SummaryRow k="Guests" v={booking.guests}/>
                  <SummaryRow k="Confirm" v={booking.confirm}/>
                </div>
              </div>
            </div>

            <div className="card card-pad">
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Next actions</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <ActionRow icon="pin" title="Get directions" sub="7 min walk · 2 min drive"/>
                <ActionRow icon="users" title="Update guest count" sub={`Currently ${booking.guests} · ends 2h before`}/>
                <ActionRow icon="chat" title="Chat support" sub="24/7 · usually under 1 min"/>
                <ActionRow icon="settings" title="Venue controls" sub="Lights, climate, music in-app"/>
              </div>
            </div>

            <button className="btn ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setRoute('bookings')}>
              <Icon name="arrow-left" size={13}/> All bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ActionRow({ icon, title, sub }) {
    return (
      <button style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8,
        background: 'var(--panel)', textAlign: 'left', width: '100%',
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--line-2)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
          <Icon name={icon} size={14}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>
        </div>
        <Icon name="arrow" size={13}/>
      </button>
    );
  }

  HB.Views.CheckinScreen = CheckinScreen;
})();
