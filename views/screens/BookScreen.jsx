// views/screens/BookScreen.jsx — Booking request form.
// Three steps: Event details → Contact → Review. On submit, creates a
// `status:pending` booking in PocketBase and hands the record to the
// confirmation screen.
(function () {
  const { useState, useMemo } = React;
  const V = HB.Models.Venues;
  const { buildSchedule, fmt12 } = HB.Models.Schedule;
  const Bookings = HB.Models.Bookings;
  const { Icon, VenueHero } = HB.Views;

  const EVENT_TYPES = ['Wedding', 'Reception', 'Birthday', 'Corporate', 'Conference', 'Workshop', 'Gala', 'Other'];

  function BookScreen({ draft, setRoute, venues, user, submitBooking }) {
    const v = V.getById(draft?.venueId || (venues[0] && venues[0].id), venues);
    const fallbackDay = buildSchedule((v && v.id && v.id.length) || 3)[4];
    const day = draft?.day || fallbackDay;

    const [step, setStep] = useState(0);
    const [start, setStart] = useState(draft?.start || 18);
    const [end, setEnd] = useState(draft?.end || 22);
    const [guests, setGuests] = useState(100);
    const [eventType, setEventType] = useState('Wedding');
    const [notes, setNotes] = useState('');

    const [contactName, setContactName] = useState(user?.name || '');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [contactPhone, setContactPhone] = useState('');

    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);

    const hours = Math.max(0, end - start);
    const total = hours * (v?.priceHour || 0);

    const errors = useMemo(() => {
      const e = {};
      if (!v) e.venue = 'Pick a venue before booking.';
      if (start >= end) e.time = 'End time must be after start time.';
      if (hours < 1) e.time = 'Select at least 1 hour.';
      if (!guests || guests < 1) e.guests = 'Enter number of guests (minimum 1).';
      if (v && guests > v.capacity) e.guests = `This hall seats ${v.capacity} max.`;
      if (!eventType) e.eventType = 'Pick an event type.';
      if (!contactName.trim()) e.contactName = 'Full name is required.';
      if (contactName.trim().length > 0 && contactName.trim().length < 2) e.contactName = 'Enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) e.contactEmail = 'Enter a valid email address.';
      const phoneDigits = contactPhone.replace(/\D/g, '');
      if (phoneDigits.length < 8) e.contactPhone = 'Enter a Malaysian phone number (min 8 digits).';
      if (notes.length > 1200) e.notes = 'Notes must be under 1,200 characters.';
      return e;
    }, [v, start, end, hours, guests, eventType, contactName, contactEmail, contactPhone, notes]);

    const stepErrors = {
      0: ['time', 'guests', 'eventType'].filter(k => errors[k]),
      1: ['contactName', 'contactEmail', 'contactPhone'].filter(k => errors[k]),
      2: [],
    };
    const currentStepValid = stepErrors[step].length === 0;
    const allValid = Object.keys(errors).length === 0;

    const markTouched = (keys) => setTouched(t => {
      const next = { ...t };
      keys.forEach(k => { next[k] = true; });
      return next;
    });

    const next = async () => {
      if (step === 0) {
        markTouched(['time','guests','eventType']);
        if (!currentStepValid) return;
        setStep(1);
        return;
      }
      if (step === 1) {
        markTouched(['contactName','contactEmail','contactPhone']);
        if (!currentStepValid) return;
        setStep(2);
        return;
      }
      if (!allValid || !v || !user) return;
      setSubmitting(true); setApiError(null);
      try {
        const payload = Bookings.makePayload({
          venue: v, user, day, start, end, guests: +guests, eventType,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          notes: notes.trim(), total,
        });
        await submitBooking(payload);
        setRoute('confirm');
      } catch (e) {
        setApiError(HB.Models.Auth.errorMessage(e));
      } finally {
        setSubmitting(false);
      }
    };

    if (!v) {
      return (
        <div className="page" style={{ maxWidth:640 }}>
          <p>No venue selected. <button className="btn accent" onClick={() => setRoute('discover')}>Browse halls</button></p>
        </div>
      );
    }

    const steps = ['Event details', 'Contact', 'Review & submit'];

    return (
      <div className="page" style={{ maxWidth:1040 }}>
        <button className="btn ghost" style={{ marginBottom:14, paddingLeft:4 }} onClick={() => setRoute('venue')}>
          <Icon name="arrow-left" size={14}/> Back to {v.name}
        </button>
        <h1 className="page-title" style={{ marginBottom:6 }}>Book <em>{v.name}</em></h1>
        <p className="page-sub" style={{ marginBottom:26 }}>
          {day.day}, Apr {day.date} · {fmt12(start)} – {fmt12(end)} · {hours} hour{hours === 1 ? '' : 's'}
        </p>

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
          <div className="card card-pad" style={{ padding:24 }}>
            {step === 0 && (
              <div style={{ display:'grid', gap:18 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:500 }}>Event details</h3>

                <div className="grid-2">
                  <Field label="Event type" error={touched.eventType && errors.eventType}>
                    <select value={eventType} onChange={e => setEventType(e.target.value)}
                      onBlur={() => markTouched(['eventType'])}>
                      {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Expected guests" error={touched.guests && errors.guests}>
                    <input type="number" min="1" max={v.capacity} value={guests}
                      onChange={e => setGuests(+e.target.value)}
                      onBlur={() => markTouched(['guests'])}/>
                  </Field>
                </div>

                <div className="grid-2">
                  <Field label="Start time" error={touched.time && errors.time}>
                    <select value={start} onChange={e => { const nv = +e.target.value; setStart(nv); if (end <= nv) setEnd(nv + 1); markTouched(['time']); }}>
                      {Array.from({ length: 16 }, (_, i) => 8 + i).map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                    </select>
                  </Field>
                  <Field label="End time" error={touched.time && errors.time}>
                    <select value={end} onChange={e => { setEnd(+e.target.value); markTouched(['time']); }}>
                      {Array.from({ length: 16 }, (_, i) => start + 1 + i).filter(h => h <= 24).map(h => <option key={h} value={h}>{fmt12(h)}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Setup notes (optional)" error={touched.notes && errors.notes}>
                  <textarea placeholder="E.g. Round tables for 10, pelamin on the north wall, halal catering required…"
                    value={notes} onChange={e => setNotes(e.target.value)}
                    onBlur={() => markTouched(['notes'])}
                    className="form-textarea"/>
                  <div className="form-hint">{notes.length} / 1200</div>
                </Field>
              </div>
            )}

            {step === 1 && (
              <div style={{ display:'grid', gap:14 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:500 }}>Who's hosting?</h3>
                <Field label="Full name" error={touched.contactName && errors.contactName}>
                  <input value={contactName} onChange={e => setContactName(e.target.value)}
                    onBlur={() => markTouched(['contactName'])}
                    placeholder="e.g. Aiman bin Zahar"/>
                </Field>
                <div className="grid-2">
                  <Field label="Email" error={touched.contactEmail && errors.contactEmail}>
                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                      onBlur={() => markTouched(['contactEmail'])}
                      placeholder="you@example.com"/>
                  </Field>
                  <Field label="Phone" error={touched.contactPhone && errors.contactPhone}>
                    <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                      onBlur={() => markTouched(['contactPhone'])}
                      placeholder="+60 12-345 6789"/>
                  </Field>
                </div>
                <div className="info-box">
                  <strong>How we'll contact you</strong>
                  We'll email the confirmation once an admin reviews your request. Keep your phone handy — if there's a scheduling conflict we'll call.
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display:'grid', gap:14 }}>
                <h3 style={{ margin:0, fontSize:16, fontWeight:500 }}>Review &amp; submit</h3>
                <p className="page-sub" style={{ margin:0 }}>
                  Double-check your details. When you submit, your request goes to our admin queue as <strong>Pending</strong>. You'll hear back within 24 hours.
                </p>
                <div className="review-grid">
                  <ReviewRow label="Venue"       value={`${v.name} · ${v.district}`}/>
                  <ReviewRow label="Event"       value={eventType}/>
                  <ReviewRow label="Date"        value={`${day.day}, Apr ${day.date}`}/>
                  <ReviewRow label="Time"        value={`${fmt12(start)} – ${fmt12(end)} (${hours}h)`}/>
                  <ReviewRow label="Guests"      value={guests}/>
                  <ReviewRow label="Contact"     value={<>
                    <div>{contactName}</div>
                    <div className="admin-muted">{contactEmail}</div>
                    <div className="admin-muted">{contactPhone}</div>
                  </>}/>
                  {notes.trim() && <ReviewRow label="Notes" value={<div style={{ whiteSpace:'pre-wrap' }}>{notes}</div>}/>}
                  <ReviewRow label="Estimated total" value={`RM ${total.toLocaleString()}`}/>
                </div>
                {apiError && <div className="auth-error" role="alert">{apiError}</div>}
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'space-between', marginTop:28, gap:10 }}>
              <button className="btn" onClick={() => step > 0 ? setStep(step - 1) : setRoute('venue')} disabled={submitting}>
                <Icon name="arrow-left" size={13}/> Back
              </button>
              <button className="btn accent" onClick={next} disabled={submitting || (step < 2 && !currentStepValid) || (step === 2 && !allValid)}>
                {submitting ? 'Submitting…' : (step < 2 ? 'Continue' : 'Submit booking request')}
                <Icon name="arrow" size={13}/>
              </button>
            </div>
          </div>

          <div>
            <div className="card" style={{ position:'sticky', top:84, overflow:'hidden' }}>
              <VenueHero venue={v} style={{ aspectRatio:'16/9' }}/>
              <div style={{ padding:18 }}>
                <div style={{ fontWeight:600, fontSize:15 }}>{v.name}</div>
                <div style={{ color:'var(--muted)', fontSize:12.5 }}>{v.district}</div>
                <hr className="hr" style={{ margin:'14px 0' }}/>
                <SummaryRow k="Date"   v={`${day.day}, Apr ${day.date}`}/>
                <SummaryRow k="Time"   v={`${fmt12(start)} – ${fmt12(end)}`}/>
                <SummaryRow k="Guests" v={guests}/>
                <hr className="hr" style={{ margin:'14px 0' }}/>
                <SummaryRow k={`Hall (${hours}h)`} v={`RM ${(hours * v.priceHour).toLocaleString()}`}/>
                <hr className="hr" style={{ margin:'14px 0' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:600 }}>
                  <span>Estimated total</span><span>RM {total.toLocaleString()}</span>
                </div>
                <div style={{ fontSize:11.5, color:'var(--muted)', marginTop:10 }}>
                  Payment collected on-site after admin approval.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Field({ label, children, error }) {
    return (
      <div className={`field ${error ? 'has-error' : ''}`}>
        <label>{label}</label>
        {children}
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  }

  function SummaryRow({ k, v }) {
    return (
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--ink-2)', padding:'3px 0' }}>
        <span>{k}</span><span style={{ color:'var(--ink)' }}>{v}</span>
      </div>
    );
  }

  function ReviewRow({ label, value }) {
    return (<>
      <div className="review-k">{label}</div>
      <div className="review-v">{value}</div>
    </>);
  }

  HB.Views.BookScreen = BookScreen;
  HB.Views.SummaryRow = SummaryRow;
})();
