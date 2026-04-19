// views/screens/DiscoverScreen.jsx — Grid/map listing of halls.
// View-local UI state: filter chip, grid-vs-map toggle, selected pin.
(function () {
  const { useState } = React;
  const { VENUES, byFilter, availableNow } = HB.Models.Venues;
  const { Icon } = HB.Views;

  function DiscoverScreen({ setRoute, setSelectedVenue }) {
    const [filter, setFilter] = useState('all');
    const [view, setView] = useState('grid');
    const [selectedPin, setSelectedPin] = useState('v1');

    const filtered = byFilter(VENUES, filter);
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

        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>Open right now</h2>
              <p className="page-sub" style={{ marginTop: 2 }}>Three halls with door-unlock available in the next 30 minutes.</p>
            </div>
            <button className="btn ghost" onClick={() => setFilter('available')}>See all <Icon name="arrow" size={13}/></button>
          </div>
          <div className="venue-grid cols-3">
            {availableNow(VENUES).slice(0, 3).map(v => (
              <VenueCard key={v.id} v={v} onClick={() => openVenue(v)}/>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Shared between grid and map; kept local since only DiscoverScreen uses it.
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
          <div className="map-road" style={{ left: 0, right: 0, top: '55%', height: 6 }}/>
          <div className="map-road" style={{ left: '40%', top: 0, bottom: 0, width: 6 }}/>
          <div className="map-road" style={{ left: 0, right: 0, top: '20%', height: 2 }}/>
          <div className="map-road" style={{ left: '75%', top: 0, bottom: 0, width: 2 }}/>
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

  HB.Views.DiscoverScreen = DiscoverScreen;
})();
