// views/screens/VenueScreen.jsx — Venue detail + weekly availability picker.
(function () {
  const { useState, useMemo, useEffect } = React;
  const V = HB.Models.Venues;
  const { buildSchedule, fmt12, visibleHours } = HB.Models.Schedule;
  const { Icon, VenueHero } = HB.Views;

  function VenueScreen({ venueId, setRoute, setDraft, venues }) {
    const v = V.getById(venueId, venues) || venues[0];
    const seed = (v && v.id ? v.id.length : 1) + (v && v.priceHour ? v.priceHour % 7 : 0);
    const schedule = useMemo(() => buildSchedule(seed), [seed]);
    const [selDay, setSelDay] = useState(4);
    const [selStart, setSelStart] = useState(18);
    const [selEnd, setSelEnd] = useState(22);

    if (!v) return null;

    const hours = Math.max(0, selEnd - selStart);
    const hallTotal = hours * v.priceHour;

    const proceedToBook = () => {
      setDraft({ venueId: v.id, day: schedule[selDay], start: selStart, end: selEnd });
      setRoute('book');
    };

    return (
      <div className="page">
        <button className="btn ghost" style={{ marginBottom:14, paddingLeft:4 }} onClick={() => setRoute('discover')}>
          <Icon name="arrow-left" size={14}/> Back to halls
        </button>

        <div className="layout-venue-gallery">
          <VenueHero venue={v} className="gallery-main"/>
          <VenueHero venue={v} className="gallery-small" style={{ filter:'brightness(0.96)' }}/>
          <VenueHero venue={v} className="gallery-small" style={{ filter:'brightness(1.04)' }}/>
          <VenueHero venue={v} className="gallery-small" style={{ filter:'brightness(0.92) saturate(0.9)' }}/>
          <VenueHero venue={v} className="gallery-small" style={{ filter:'brightness(1.08) contrast(1.05)' }}/>
        </div>

        <div className="layout-venue-detail">
          <div>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:6, flexWrap:'wrap' }}>
              <div>
                <h1 className="page-title" style={{ marginBottom:6 }}>{v.name}</h1>
                <div style={{ display:'flex', gap:14, alignItems:'center', color:'var(--ink-2)', fontSize:13.5, flexWrap:'wrap' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><Icon name="pin" size={13}/> {v.district}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><Icon name="star" size={13}/> {v.rating} · {v.reviews} reviews</span>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><Icon name="users" size={13}/> Up to {v.capacity}</span>
                </div>
              </div>
              <span className={`badge ${v.available === 'now' ? 'ok' : v.available === 'soon' ? 'warn' : 'neutral'}`}>
                ● {v.available === 'now' ? 'Available' : v.available === 'soon' ? 'Limited' : 'Fully booked'}
              </span>
            </div>

            <p style={{ fontSize:15, lineHeight:1.6, color:'var(--ink-2)', maxWidth:620, marginTop:18, textWrap:'pretty' }}>
              {v.description || `A ${v.size} hall with ${v.ceiling} ceilings.`}
            </p>

            <div className="quick-stats">
              {[
                ['Capacity',   `${v.capacity} guests`],
                ['Floor area', v.size || '—'],
                ['Ceiling',    v.ceiling || '—'],
                ['State',      v.state || '—'],
              ].map(([k, val]) => (
                <div key={k} style={{ borderLeft:'2px solid var(--line)', paddingLeft:12 }}>
                  <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--muted)' }}>{k}</div>
                  <div style={{ fontSize:18, fontWeight:500, marginTop:2 }}>{val}</div>
                </div>
              ))}
            </div>

            {v.tags && v.tags.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
                {v.tags.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontSize:18, fontWeight:500, margin:0, letterSpacing:'-0.01em' }}>Pick your slot</h2>
              <div className="calendar-legend">
                <span><span className="sw open"/> Open</span>
                <span><span className="sw sel"/> Selected</span>
                <span><span className="sw hold"/> On hold</span>
                <span><span className="sw booked"/> Booked</span>
              </div>
            </div>

            <Calendar schedule={schedule} selDay={selDay} setSelDay={setSelDay}
              selStart={selStart} selEnd={selEnd} setSelStart={setSelStart} setSelEnd={setSelEnd}/>
          </div>

          <div>
            <div className="card card-pad" style={{ position:'sticky', top:84 }}>
              <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:500, letterSpacing:'-0.01em' }}>RM{v.priceHour}<span style={{ fontSize:13, color:'var(--muted)', fontWeight:400 }}>/hr</span></div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>Minimum 3 hours · No payment upfront</div>
                </div>
                <span className="badge neutral">Needs admin approval</span>
              </div>
              <hr className="hr" style={{ margin:'14px 0' }}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div className="field">
                  <label>Date</label>
                  <input readOnly value={`${schedule[selDay].day} Apr ${schedule[selDay].date}`}/>
                </div>
                <div className="field">
                  <label>Hours</label>
                  <input readOnly value={`${hours}h`}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                <div className="field">
                  <label>From</label>
                  <input readOnly value={fmt12(selStart)}/>
                </div>
                <div className="field">
                  <label>To</label>
                  <input readOnly value={fmt12(selEnd)}/>
                </div>
              </div>
              <div style={{ fontSize:13, display:'flex', justifyContent:'space-between', color:'var(--ink-2)' }}>
                <span>{hours} hours × RM{v.priceHour}</span>
                <span>RM{hallTotal.toLocaleString()}</span>
              </div>
              <hr className="hr" style={{ margin:'12px 0' }}/>
              <div style={{ fontSize:15, fontWeight:600, display:'flex', justifyContent:'space-between' }}>
                <span>Estimated total</span>
                <span>RM{hallTotal.toLocaleString()}</span>
              </div>
              <button className="btn accent lg"
                style={{ width:'100%', justifyContent:'center', marginTop:14 }}
                onClick={proceedToBook}
                disabled={hours < 1}>
                Continue to booking form <Icon name="arrow" size={14}/>
              </button>
              <div style={{ fontSize:11.5, color:'var(--muted)', textAlign:'center', marginTop:10 }}>
                Free to request · Pay on-site once approved
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
      <div style={{ border:'1px solid var(--line)', borderRadius:10, padding:14, background:'var(--panel)' }}>
        <div className="cal">
          <div />
          {schedule.map((d, di) => (
            <div key={di} className={`cal-head ${di === 4 ? 'today' : ''}`} onClick={() => setSelDay(di)} style={{ cursor:'pointer' }}>
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
                  <div key={di + '-' + h} className={`cal-cell ${status} ${selected ? 'selected' : ''}`}
                    onMouseDown={() => onCellDown(di, h, status)}
                    onMouseEnter={() => onCellEnter(di, h, status)}/>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:12.5, color:'var(--muted)', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
          <span>Click-drag to select a range</span>
          <span style={{ color:'var(--ink)' }}>{schedule[selDay].day} · {fmt12(selStart)} – {fmt12(selEnd)}</span>
        </div>
      </div>
    );
  }

  HB.Views.VenueScreen = VenueScreen;
})();
