// screens.jsx — HallBook screens
// Uses window globals: VENUES, BOOKINGS, buildSchedule, Icon, Placeholder

const { useState: useSt, useMemo: useMm, useEffect: useEf } = React;

// ———————————————————————————————————————— DISCOVER
function DiscoverScreen({ setRoute, setSelectedVenue }) {
  const [filter, setFilter] = useSt('all');
  const [view, setView] = useSt('grid'); // grid | map
  const [selectedPin, setSelectedPin] = useSt('v1');

  const filtered = VENUES.filter(v => {
    if (filter === 'available') return v.available === 'now';
    if (filter === 'small') return v.capacity < 100;
    if (filter === 'large') return v.capacity >= 150;
    return true;
  });

  const openVenue = (v) => { setSelectedVenue(v.id); setRoute('venue'); };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Find a hall for <em>tonight</em></h1>
          <p className="page-sub">24/7 self check-in · No staff, no wait. Available halls are booked and unlocked instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="segmented">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Icon name="grid" size={13}/></button>
            <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}><Icon name="map" size={13}/></button>
          </div>
          <button className="btn"><Icon name="sparkle" size={13}/> Smart match</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { k: 'all', label: 'All halls' },
          { k: 'available', label: 'Available now' },
          { k: 'small', label: 'Under 100 guests' },
          { k: 'large', label: '150+ guests' },
        ].map(f => (
          <button key={f.k} className={`chip ${filter === f.k ? 'selected' : ''}`} onClick={() => setFilter(f.k)}>{f.label}</button>
        ))}
        <div style={{ flex: 1 }}/>
        <button className="chip"><Icon name="calendar" size={12}/> Any date</button>
        <button className="chip"><Icon name="users" size={12}/> Any size</button>
        <button className="chip">Price · Any</button>
      </div>

      {view === 'map' ? (
        <MapView venues={filtered} selected={selectedPin} setSelected={setSelectedPin} onOpen={openVenue}/>
      ) : (
        <div className="venue-grid cols-3">
          {filtered.map(v => <VenueCard key={v.id} v={v} onClick={() => openVenue(v)}/>)}
        </div>
      )}

      {/* Secondary section */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>Open right now</h2>
            <p className="page-sub" style={{ marginTop: 2 }}>Three halls with door-unlock available in the next 30 minutes.</p>
          </div>
          <button className="btn ghost" onClick={() => setFilter('available')}>See all <Icon name="arrow" size={13}/></button>
        </div>
        <div className="venue-grid cols-3">
          {VENUES.filter(v => v.available === 'now').slice(0, 3).map(v => (
            <VenueCard key={v.id} v={v} onClick={() => openVenue(v)}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function VenueCard({ v, onClick }) {
  const availLabel = { now: 'Available', soon: 'Limited', booked: 'Booked' }[v.available];
  const availDot = { now: 'ok', soon: 'warn', booked: 'bad' }[v.available];
  return (
    <div className="venue-card" onClick={onClick}>
      <div className={`hero ph ${v.hero}`} style={{ position: 'relative' }}>
        <div className="ph-label">{v.name.toUpperCase()} · HERO</div>
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(255,255,255,0.92)', borderRadius: 999,
          padding: '3px 10px', fontSize: 11.5, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#111',
        }}>
          <span className={`dot ${availDot}`} style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }}/>
          {availLabel}
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.92)', borderRadius: 6,
          padding: '3px 8px', fontSize: 11.5,
          color: '#111', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="star" size={11}/> {v.rating}
        </div>
      </div>
      <div className="body">
        <div className="row1">
          <div>
            <div className="title">{v.name}</div>
            <div className="sub">{v.district} · {v.capacity} guests · {v.size}</div>
          </div>
          <div className="price" style={{ textAlign: 'right' }}>
            ${v.priceHour}<small>/hr</small>
          </div>
        </div>
        <div className="row2">
          {v.tags.slice(0, 2).map(t => <span key={t} className="chip" style={{ fontSize: 11, padding: '1px 7px' }}>{t}</span>)}
          <div className="avail" style={{ marginLeft: 'auto' }}>
            <Icon name="clock" size={11}/> {v.nextGap}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapView({ venues, selected, setSelected, onOpen }) {
  const sel = venues.find(v => v.id === selected) || venues[0];
  return (
    <div className="layout-map">
      <div className="map">
        {/* roads */}
        <div className="map-road" style={{ left: 0, right: 0, top: '55%', height: 6 }}/>
        <div className="map-road" style={{ left: '40%', top: 0, bottom: 0, width: 6 }}/>
        <div className="map-road" style={{ left: 0, right: 0, top: '20%', height: 2 }}/>
        <div className="map-road" style={{ left: '75%', top: 0, bottom: 0, width: 2 }}/>
        {/* pins */}
        {venues.map(v => (
          <div
            key={v.id}
            className={`map-pin ${v.available === 'soon' ? 'soon' : v.available === 'booked' ? 'booked' : ''} ${selected === v.id ? 'selected' : ''}`}
            style={{ left: `${v.coord[0]}%`, top: `${v.coord[1]}%` }}
            onClick={() => setSelected(v.id)}
          >
            <div className="bubble">
              <span className="availdot"/> ${v.priceHour}/hr
            </div>
            <div className="stick"/>
          </div>
        ))}
        {/* legend */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14,
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 8, padding: '8px 12px', fontSize: 11.5,
          display: 'flex', gap: 12,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="dot ok"/> Now</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="dot warn"/> Soon</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span className="dot bad"/> Booked</span>
        </div>
      </div>
      <div>
        <VenueCard v={sel} onClick={() => onOpen(sel)}/>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
          Showing {venues.length} halls · drag the map to refine
        </div>
      </div>
    </div>
  );
}

// ———————————————————————————————————————— VENUE DETAIL
function VenueScreen({ venueId, setRoute, setDraft }) {
  const v = VENUES.find(x => x.id === venueId) || VENUES[0];
  const schedule = useMm(() => buildSchedule(v.id.charCodeAt(1)), [v.id]);
  const [selDay, setSelDay] = useSt(4); // Friday
  const [selStart, setSelStart] = useSt(18);
  const [selEnd, setSelEnd] = useSt(23);

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

      {/* Hero gallery */}
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
        {/* Left: info */}
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

          {/* Quick stats */}
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

          {/* Availability calendar */}
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

        {/* Right: booking panel */}
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

function fmt12(h) {
  const am = h < 12 || h === 24;
  const n = h % 12 === 0 ? 12 : h % 12;
  return `${n}:00 ${am && h !== 24 ? 'AM' : 'PM'}`;
}

function Calendar({ schedule, selDay, setSelDay, selStart, selEnd, setSelStart, setSelEnd }) {
  const [dragging, setDragging] = useSt(null);
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
  useEf(() => {
    const up = () => setDragging(null);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // Show only 8am–11pm range
  const hours = Array.from({ length: 16 }, (_, i) => 8 + i);

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

Object.assign(window, { DiscoverScreen, VenueScreen, VenueCard, Calendar, fmt12 });
