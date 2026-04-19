// screens2.jsx — Booking flow, My Bookings, Checkin
const { useState: uSt2, useMemo: uMm2, useEffect: uEf2 } = React;

// ———————————————————————————————————————— BOOKING FLOW
function BookScreen({ draft, setRoute, setCompletedBooking }) {
  const [step, setStep] = uSt2(0);
  const v = VENUES.find(x => x.id === (draft?.venueId || 'v1')) || VENUES[0];
  const day = draft?.day || buildSchedule(v.id.charCodeAt(1))[4];
  const [start, setStart] = uSt2(draft?.start || 18);
  const [end, setEnd] = uSt2(draft?.end || 23);
  const [guests, setGuests] = uSt2(120);
  const [eventType, setEventType] = uSt2('Wedding');
  const [addons, setAddons] = uSt2({ Catering: true, 'AV Package': false, Floral: false });
  const [contactName, setContactName] = uSt2('Amira Malik');
  const [contactEmail, setContactEmail] = uSt2('amira@studio.co');
  const [contactPhone, setContactPhone] = uSt2('+1 (415) 555-0142');
  const [payMethod, setPayMethod] = uSt2('card');

  const hours = end - start;
  const hallTotal = hours * v.priceHour;
  const addonCost = Object.entries(addons).reduce((s, [k, on]) => on ? s + { 'Catering': 640, 'AV Package': 280, 'Floral': 420 }[k] : s, 0);
  const serviceFee = 45;
  const total = hallTotal + addonCost + serviceFee;

  const steps = ['Details', 'Add-ons', 'Contact', 'Payment'];

  const next = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Complete booking
      setCompletedBooking({
        id: 'b-new', venueId: v.id, venue: v.name,
        date: `${day.day}, Apr ${day.date}`, time: `${fmt12(start)} – ${fmt12(end)}`,
        guests, status: 'upcoming', pin: '7 1 4 6', confirm: 'HB-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        total, checkinOpens: `${day.day} ${fmt12(start - 1).replace(':00', ':30')}`,
      });
      setRoute('confirm');
    }
  };

  return (
    <div className="page" style={{ maxWidth: 1040 }}>
      <button className="btn ghost" style={{ marginBottom: 14, paddingLeft: 4 }} onClick={() => setRoute('venue')}>
        <Icon name="arrow-left" size={14}/> Back to {v.name}
      </button>
      <h1 className="page-title" style={{ marginBottom: 6 }}>Book <em>{v.name}</em></h1>
      <p className="page-sub" style={{ marginBottom: 26 }}>{day.day}, Apr {day.date} · {fmt12(start)} – {fmt12(end)} · {hours} hours</p>

      <div className="steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="num">{i < step ? <Icon name="check" size={12}/> : i + 1}</div>
              <span>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="step-sep"/>}
          </React.Fragment>
        ))}
      </div>

      <div className="layout-book-flow">
        <div className="card card-pad" style={{ padding: 24 }}>
          {step === 0 && (
            <div style={{ display: 'grid', gap: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Event details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label>Event type</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)}>
                    <option>Wedding</option><option>Birthday</option><option>Corporate</option><option>Gala</option><option>Reception</option>
                  </select>
                </div>
                <div className="field">
                  <label>Expected guests</label>
                  <input type="number" value={guests} onChange={e => setGuests(+e.target.value)}/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label>Start</label>
                  <select value={start} onChange={e => setStart(+e.target.value)}>
                    {Array.from({ length: 16 }, (_, i) => 8 + i).map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>End</label>
                  <select value={end} onChange={e => setEnd(+e.target.value)}>
                    {Array.from({ length: 16 }, (_, i) => start + 1 + i).filter(h => h <= 24).map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Setup notes (optional)</label>
                <textarea placeholder="E.g. round tables for 10, stage at the south wall…"
                  style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 10, minHeight: 80, background: 'var(--panel)', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: 13.5 }}/>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Add-ons</h3>
              <p className="page-sub" style={{ margin: 0 }}>Pre-stocked and set up before you arrive. Cancel up to 24h before.</p>
              {[
                ['Catering', 640, 'Chef-prepared buffet for up to 150. Vegetarian options included.'],
                ['AV Package', 280, 'Stage speakers, 2 wireless mics, LED uplights, and a tech-free dashboard.'],
                ['Floral', 420, 'Fresh arrangements delivered morning-of. 8 table centerpieces + 2 arches.'],
              ].map(([name, price, desc]) => (
                <label key={name} style={{
                  display: 'flex', gap: 14, padding: 14, border: '1px solid var(--line)', borderRadius: 10,
                  cursor: 'pointer', alignItems: 'flex-start',
                  background: addons[name] ? 'var(--accent-weak)' : 'var(--panel)',
                  borderColor: addons[name] ? 'var(--accent)' : 'var(--line)',
                }}>
                  <input type="checkbox" checked={addons[name]} onChange={() => setAddons(a => ({ ...a, [name]: !a[name] }))} style={{ marginTop: 3 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 500 }}>{name}</div>
                      <div style={{ fontWeight: 500 }}>+${price}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Who's hosting?</h3>
              <div className="field">
                <label>Full name</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="field">
                  <label>Email for confirmation</label>
                  <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}/>
                </div>
                <div className="field">
                  <label>Phone for PIN delivery</label>
                  <input value={contactPhone} onChange={e => setContactPhone(e.target.value)}/>
                </div>
              </div>
              <div style={{ padding: 14, background: 'var(--line-2)', borderRadius: 10, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                <strong style={{ display: 'block', marginBottom: 2 }}>Self check-in details</strong>
                Your QR code and a 4-digit PIN will be sent 2 hours before start. The door unlocks 30 minutes before your slot. No staff on site — if you need help, tap Support from your booking.
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'grid', gap: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Payment</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {['card', 'ach', 'later'].map(m => (
                  <button key={m} className={`chip ${payMethod === m ? 'selected' : ''}`} onClick={() => setPayMethod(m)} style={{ padding: '6px 14px', fontSize: 13 }}>
                    {{ card: 'Credit card', ach: 'ACH transfer', later: 'Pay 50% now, rest later' }[m]}
                  </button>
                ))}
              </div>
              {payMethod === 'card' && (
                <>
                  <div className="field">
                    <label>Card number</label>
                    <input placeholder="•••• •••• •••• 4242" defaultValue="4242 4242 4242 4242"/>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="field"><label>Expiry</label><input defaultValue="04 / 28"/></div>
                    <div className="field"><label>CVC</label><input defaultValue="•••"/></div>
                    <div className="field"><label>ZIP</label><input defaultValue="94110"/></div>
                  </div>
                </>
              )}
              {payMethod === 'ach' && <div style={{ padding: 14, background: 'var(--line-2)', borderRadius: 10, fontSize: 13 }}>We'll email instructions to complete a bank transfer within 24 hours.</div>}
              {payMethod === 'later' && <div style={{ padding: 14, background: 'var(--line-2)', borderRadius: 10, fontSize: 13 }}>50% held today, balance auto-charged 7 days before your event.</div>}

              <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input type="checkbox" defaultChecked/> I agree to the venue rules, cancellation policy, and $500 refundable damage hold.
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button className="btn" onClick={() => step > 0 ? setStep(step - 1) : setRoute('venue')}>
              <Icon name="arrow-left" size={13}/> Back
            </button>
            <button className="btn accent" onClick={next}>
              {step < 3 ? 'Continue' : 'Confirm & book'} <Icon name="arrow" size={13}/>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 84, overflow: 'hidden' }}>
            <div className={`ph ${v.hero}`} style={{ aspectRatio: '16/9' }}>
              <div className="ph-label">{v.name.toUpperCase()}</div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{v.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{v.district}</div>
              <hr className="hr" style={{ margin: '14px 0' }}/>
              <SummaryRow k="Date" v={`${day.day}, Apr ${day.date}`}/>
              <SummaryRow k="Time" v={`${fmt12(start)} – ${fmt12(end)}`}/>
              <SummaryRow k="Guests" v={guests}/>
              <hr className="hr" style={{ margin: '14px 0' }}/>
              <SummaryRow k={`Hall (${hours}h)`} v={`$${hallTotal}`}/>
              {Object.entries(addons).filter(([, on]) => on).map(([name]) => (
                <SummaryRow key={name} k={name} v={`+$${ { Catering: 640, 'AV Package': 280, Floral: 420 }[name] }`}/>
              ))}
              <SummaryRow k="Service fee" v={`$${serviceFee}`}/>
              <hr className="hr" style={{ margin: '14px 0' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600 }}>
                <span>Total</span><span>${total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)', padding: '3px 0' }}>
      <span>{k}</span><span style={{ color: 'var(--ink)' }}>{v}</span>
    </div>
  );
}

// ———————————————————————————————————————— CONFIRMATION
function ConfirmScreen({ booking, setRoute }) {
  if (!booking) { setRoute('discover'); return null; }
  const v = VENUES.find(x => x.id === booking.venueId);
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

// ———————————————————————————————————————— MY BOOKINGS
function BookingsScreen({ bookings, setRoute, setActiveBookingId }) {
  const [tab, setTab] = uSt2('upcoming');
  const filtered = bookings.filter(b => tab === 'upcoming' ? (b.status === 'active' || b.status === 'upcoming') : b.status === 'completed');
  const active = bookings.find(b => b.status === 'active');
  const nextUp = bookings.filter(b => b.status === 'upcoming')[0];

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
          ['Upcoming', bookings.filter(b => b.status === 'upcoming').length, 'Next: ' + (nextUp ? nextUp.date : '—')],
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
          const v = VENUES.find(x => x.id === b.venueId);
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

// ———————————————————————————————————————— CHECKIN
function CheckinScreen({ bookings, activeBookingId, setRoute }) {
  const booking = bookings.find(b => b.id === activeBookingId)
    || bookings.find(b => b.status === 'active')
    || bookings.find(b => b.status === 'upcoming')
    || bookings[0];
  const v = VENUES.find(x => x.id === booking.venueId);
  const [doorState, setDoorState] = uSt2('locked'); // locked | unlocked
  const [method, setMethod] = uSt2('qr'); // qr | pin
  const isLive = booking.status === 'active';

  // Fake QR pattern
  const qrModules = uMm2(() => {
    const seed = booking.confirm.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: 21 * 21 }, (_, i) => {
      const x = i % 21, y = Math.floor(i / 21);
      // corner markers
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

  uEf2(() => {
    if (!isLive) setDoorState('locked');
  }, [isLive, booking.id]);

  const unlock = () => {
    setDoorState('unlocking');
    setTimeout(() => setDoorState('unlocked'), 1400);
  };

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

      {/* Booking selector */}
      {bookings.filter(b => b.status !== 'completed').length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {bookings.filter(b => b.status !== 'completed').map(b => (
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
        {/* Left: QR / PIN */}
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

          {/* Door state */}
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

        {/* Right: booking details + next actions */}
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

Object.assign(window, { BookScreen, ConfirmScreen, BookingsScreen, CheckinScreen });
