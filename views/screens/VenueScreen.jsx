// views/screens/VenueScreen.jsx — Venue detail + weekly availability picker.
// Owns view-local picker state (day/start/end); emits a "draft" to the controller
// when the user clicks "Continue to book".
(function () {
  const { useState, useMemo, useEffect } = React;
  const { VENUES, getById } = HB.Models.Venues;
  const { buildSchedule, fmt12, visibleHours } = HB.Models.Schedule;
  const { Icon } = HB.Views;

  function VenueScreen({ venueId, setRoute, setDraft }) {
    const v = getById(venueId, VENUES);
    const schedule = useMemo(() => buildSchedule(v.id.charCodeAt(1)), [v.id]);
    const [selDay, setSelDay] = useState(4); // Friday
    const [selStart, setSelStart] = useState(18);
    const [selEnd, setSelEnd] = useState(23);

    const proceedToBook = () => {
      setDraft({
        venueId: v.id,
        day: schedule[selDay],
        start: selStart,
        end: selEnd,
      });
      setRoute('book');
    };

    return (
      <div className="page">
        <button className="btn ghost" style={{ marginBottom: 14, paddingLeft: 4 }} onClick={() => setRoute('discover')}>
          <Icon name="arrow-left" size={14}/> Discover
        </button>

        <div className="layout-venue-gallery">
          <div className={`ph ${v.hero}`}>
            <div className="ph-label">{v.name.toUpperCase()} · MAIN HALL</div>
          </div>
          <div className={`ph ${v.hero}`} style={{ filter: 'brightness(0.96)' }}>
            <div className="ph-label">ENTRANCE</div>
          </div>
          <div className={`ph ${v.hero}`} style={{ filter: 'brightness(1.04)' }}>
            <div className="ph-label">BAR AREA</div>
          </div>
          <div className={`ph ${v.hero}`} style={{ filter: 'brightness(0.92)' }}>
            <div className="ph-label">STAGE</div>
          </div>
          <div className={`ph ${v.hero}`} style={{ filter: 'brightness(1.08)' }}>
            <div className="ph-label">LOUNGE</div>
          </div>
        </div>

        <div className="layout-venue-detail">
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
              <div>
                <h1 className="page-title" style={{ marginBottom: 6 }}>{v.name}</h1>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', color: 'var(--ink-2)', fontSize: 13.5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={13}/> {v.district}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="star" size={13}/> {v.rating} · {v.reviews} reviews</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="users" size={13}/> Up to {v.capacity}</span>
                </div>
              </div>
              <span className="badge ok">●  Available now · unlock at door</span>
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 620, marginTop: 18, textWrap: 'pretty' }}>
              A {v.size} hall with {v.ceiling} ceilings, full catering kitchen, and a modular stage. Self check-in via QR or 4-digit PIN — the door unlocks 30 minutes before your slot. No staff on site.
            </p>

            <div className="quick-stats">
              {[
                ['Capacity', `${v.capacity}`],
                ['Floor area', v.size],
                ['Ceiling', v.ceiling],
                ['Setup time', '45 min'],
              ].map(([k, val]) => (
                <div key={k} style={{ borderLeft: '2px solid var(--line)', paddingLeft: 12 }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>Pick your slot</h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--line-2)', borderRadius: 2 }}/> Open</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: 2 }}/> Selected</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'rgba(181,105,30,0.16)', borderRadius: 2 }}/> On hold</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'repeating-linear-gradient(45deg, #e2e2e2 0 3px, #ededed 3px 6px)', borderRadius: 2 }}/> Booked</span>
              </div>
            </div>

            <Calendar
              schedule={schedule}
              selDay={selDay} setSelDay={setSelDay}
              selStart={selStart} selEnd={selEnd}
              setSelStart={setSelStart} setSelEnd={setSelEnd}
            />
          </div>

          <div>
            <div className="card card-pad" style={{ position: 'sticky', top: 84 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>${v.priceHour}<span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>/hr</span></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Minimum 3 hours</div>
                </div>
                <span className="badge ok">Instant book</span>
              </div>
              <hr className="hr" style={{ margin: '14px 0' }}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field">
                  <label>Date</label>
                  <input readOnly value={`${schedule[selDay].day} Apr ${schedule[selDay].date}`}/>
                </div>
                <div className="field">
                  <label>Guests</label>
                  <input defaultValue="120"/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div className="field">
                  <label>From</label>
                  <input readOnly value={`${fmt12(selStart)}`}/>
                </div>
                <div className="field">
                  <label>To</label>
                  <input readOnly value={`${fmt12(selEnd)}`}/>
                </div>
              </div>
              <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
                <span>{selEnd - selStart} hours × ${v.priceHour}</span>
                <span>${(selEnd - selStart) * v.priceHour}</span>
              </div>
              <div style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)', marginTop: 4 }}>
                <span>Service fee</span>
                <span>$45</span>
              </div>
              <hr className="hr" style={{ margin: '12px 0' }}/>
              <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated total</span>
                <span>${(selEnd - selStart) * v.priceHour + 45}</span>
              </div>
              <button className="btn accent lg" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }} onClick={proceedToBook}>
                Continue to book <Icon name="arrow" size={14}/>
              </button>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
                Free cancellation up to 48 hours before start
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Calendar({ schedule, selDay, setSelDay, selStart, selEnd, setSelStart, setSelEnd }) {
    const [dragging, setDragging] = useState(null);
    const onCellDown = (di, h, status) => {
      if (status === 'booked') return;
      setSelDay(di); setSelStart(h); setSelEnd(h + 1);
      setDragging(h);
    };
    const onCellEnter = (di, h, status) => {
      if (dragging === null || status === 'booked' || di !== selDay) return;
      const start = Math.min(dragging, h);
      const end = Math.max(dragging, h) + 1;
      setSelStart(start); setSelEnd(end);
    };
    useEffect(() => {
      const up = () => setDragging(null);
      window.addEventListener('mouseup', up);
      return () => window.removeEventListener('mouseup', up);
    }, []);

    const hours = visibleHours();

    return (
      <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14, background: 'var(--panel)' }}>
        <div className="cal">
          <div />
          {schedule.map((d, di) => (
            <div key={di} className={`cal-head ${di === 4 ? 'today' : ''}`} onClick={() => setSelDay(di)} style={{ cursor: 'pointer' }}>
              <div>{d.day}</div>
              <div className="dnum">{d.date}</div>
            </div>
          ))}
          {hours.map(h => (
            <React.Fragment key={h}>
              <div className="cal-hour">{h === 12 ? '12p' : h > 12 ? (h - 12) + 'p' : h + 'a'}</div>
              {schedule.map((d, di) => {
                const status = d.hours[h];
                const selected = di === selDay && h >= selStart && h < selEnd;
                return (
                  <div
                    key={di + '-' + h}
                    className={`cal-cell ${status} ${selected ? 'selected' : ''}`}
                    onMouseDown={() => onCellDown(di, h, status)}
                    onMouseEnter={() => onCellEnter(di, h, status)}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Click-drag to select a range</span>
          <span style={{ color: 'var(--ink)' }}>{schedule[selDay].day} · {fmt12(selStart)} – {fmt12(selEnd)}</span>
        </div>
      </div>
    );
  }

  HB.Views.VenueScreen = VenueScreen;
})();
