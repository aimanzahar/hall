// views/screens/BookScreen.jsx — Multi-step booking form.
// Form state is view-local; on submit, hands a booking record (built via
// HB.Models.Bookings.make) to onBookingCreated in the controller layer.
(function () {
  const { useState } = React;
  const { VENUES, getById } = HB.Models.Venues;
  const { buildSchedule, fmt12 } = HB.Models.Schedule;
  const Bookings = HB.Models.Bookings;
  const { Icon } = HB.Views;

  const ADDON_PRICES = { Catering: 640, 'AV Package': 280, Floral: 420 };

  function BookScreen({ draft, setRoute, setCompletedBooking }) {
    const [step, setStep] = useState(0);
    const v = getById(draft?.venueId || 'v1', VENUES);
    const day = draft?.day || buildSchedule(v.id.charCodeAt(1))[4];
    const [start, setStart] = useState(draft?.start || 18);
    const [end, setEnd] = useState(draft?.end || 23);
    const [guests, setGuests] = useState(120);
    const [eventType, setEventType] = useState('Wedding');
    const [addons, setAddons] = useState({ Catering: true, 'AV Package': false, Floral: false });
    const [contactName, setContactName] = useState('Amira Malik');
    const [contactEmail, setContactEmail] = useState('amira@studio.co');
    const [contactPhone, setContactPhone] = useState('+1 (415) 555-0142');
    const [payMethod, setPayMethod] = useState('card');

    const hours = end - start;
    const hallTotal = hours * v.priceHour;
    const addonCost = Object.entries(addons).reduce(
      (s, [k, on]) => on ? s + ADDON_PRICES[k] : s, 0
    );
    const serviceFee = 45;
    const total = hallTotal + addonCost + serviceFee;

    const steps = ['Details', 'Add-ons', 'Contact', 'Payment'];

    const next = () => {
      if (step < 3) {
        setStep(step + 1);
        return;
      }
      const record = Bookings.make({
        venue: v,
        date: `${day.day}, Apr ${day.date}`,
        time: `${fmt12(start)} – ${fmt12(end)}`,
        guests,
        total,
        checkinOpens: `${day.day} ${fmt12(start - 1).replace(':00', ':30')}`,
      });
      setCompletedBooking(record);
      setRoute('confirm');
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
                  <SummaryRow key={name} k={name} v={`+$${ADDON_PRICES[name]}`}/>
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

  HB.Views.BookScreen = BookScreen;
  HB.Views.SummaryRow = SummaryRow; // Checkin reuses SummaryRow
})();
