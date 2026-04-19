// views/screens/DiscoverScreen.jsx — Browse/search grid for halls.
(function () {
  const { useState, useMemo } = React;
  const V = HB.Models.Venues;
  const { Icon, VenueHero } = HB.Views;

  function DiscoverScreen({ setRoute, setSelectedVenue, venues }) {
    const [filter, setFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const [view, setView] = useState('grid');
    const [search, setSearch] = useState('');
    const [selectedPin, setSelectedPin] = useState(venues[0] && venues[0].id);

    const states = useMemo(() => {
      const set = new Set(venues.map(v => v.state).filter(Boolean));
      return ['all', ...Array.from(set).sort()];
    }, [venues]);

    const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();
      return V.byFilter(venues, filter)
        .filter(v => stateFilter === 'all' || v.state === stateFilter)
        .filter(v => !q || v.name.toLowerCase().includes(q) ||
                          v.district.toLowerCase().includes(q) ||
                          (v.tags || []).some(t => t.toLowerCase().includes(q)));
    }, [venues, filter, stateFilter, search]);

    const openVenue = (v) => { setSelectedVenue(v.id); setRoute('venue'); };

    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="page-title">Find a hall in <em>Malaysia</em></h1>
            <p className="page-sub">Browse halls, check availability, and submit a booking request. The venue team reviews every request within 24 hours.</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div className="segmented">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Icon name="grid" size={13}/></button>
              <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}><Icon name="map" size={13}/></button>
            </div>
          </div>
        </div>

        <div className="discover-filters">
          <input className="discover-search" placeholder="Search by name, location or tag…"
            value={search} onChange={e => setSearch(e.target.value)}/>
          <div className="discover-chips">
            {[
              { k:'all',       label:'All halls' },
              { k:'available', label:'Available now' },
              { k:'small',     label:'Under 120 guests' },
              { k:'large',     label:'250+ guests' },
            ].map(f => (
              <button key={f.k} className={`chip ${filter === f.k ? 'selected' : ''}`} onClick={() => setFilter(f.k)}>{f.label}</button>
            ))}
          </div>
          <div className="discover-chips">
            {states.map(s => (
              <button key={s} className={`chip ${stateFilter === s ? 'selected' : ''}`} onClick={() => setStateFilter(s)}>
                {s === 'all' ? 'All states' : s}
              </button>
            ))}
          </div>
        </div>

        {view === 'map' ? (
          <MapView venues={filtered} selected={selectedPin} setSelected={setSelectedPin} onOpen={openVenue}/>
        ) : (
          filtered.length ? (
            <div className="venue-grid cols-3">
              {filtered.map(v => <VenueCard key={v.id} v={v} onClick={() => openVenue(v)}/>)}
            </div>
          ) : (
            <div className="admin-empty" style={{ borderRadius:12, border:'1px solid var(--line)' }}>
              No halls match your filters. Try clearing a filter or search term.
            </div>
          )
        )}
      </div>
    );
  }

  function VenueCard({ v, onClick }) {
    const availLabel = { now:'Available', soon:'Limited', booked:'Fully booked' }[v.available] || 'Available';
    const availDot = { now:'ok', soon:'warn', booked:'bad' }[v.available] || 'ok';
    return (
      <div className="venue-card" onClick={onClick}>
        <VenueHero venue={v} className="hero" overlay={<>
          <div className="venue-pill left">
            <span className={`dot ${availDot}`}/> {availLabel}
          </div>
          <div className="venue-pill right">
            <Icon name="star" size={11}/> {v.rating}
          </div>
        </>}/>
        <div className="body">
          <div className="row1">
            <div>
              <div className="title">{v.name}</div>
              <div className="sub">{v.district} · {v.capacity} guests · {v.size}</div>
            </div>
            <div className="price" style={{ textAlign:'right' }}>
              RM{v.priceHour}<small>/hr</small>
            </div>
          </div>
          <div className="row2">
            {(v.tags || []).slice(0, 2).map(t => <span key={t} className="chip" style={{ fontSize:11, padding:'1px 7px' }}>{t}</span>)}
            <div className="avail" style={{ marginLeft:'auto' }}>
              <Icon name="clock" size={11}/> {v.nextGap}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function MapView({ venues, selected, setSelected, onOpen }) {
    const sel = venues.find(v => v.id === selected) || venues[0];
    if (!sel) return <div className="admin-empty">No halls to plot.</div>;
    return (
      <div className="layout-map">
        <div className="map">
          <div className="map-road" style={{ left:0, right:0, top:'55%', height:6 }}/>
          <div className="map-road" style={{ left:'40%', top:0, bottom:0, width:6 }}/>
          <div className="map-road" style={{ left:0, right:0, top:'20%', height:2 }}/>
          <div className="map-road" style={{ left:'75%', top:0, bottom:0, width:2 }}/>
          {venues.map(v => (
            <div key={v.id}
              className={`map-pin ${v.available === 'soon' ? 'soon' : v.available === 'booked' ? 'booked' : ''} ${selected === v.id ? 'selected' : ''}`}
              style={{ left: `${(v.coord || [50,50])[0]}%`, top: `${(v.coord || [50,50])[1]}%` }}
              onClick={() => setSelected(v.id)}>
              <div className="bubble"><span className="availdot"/> RM{v.priceHour}/hr</div>
              <div className="stick"/>
            </div>
          ))}
          <div className="map-legend">
            <span><span className="dot ok"/> Available</span>
            <span><span className="dot warn"/> Limited</span>
            <span><span className="dot bad"/> Booked</span>
          </div>
        </div>
        <div>
          <VenueCard v={sel} onClick={() => onOpen(sel)}/>
          <div style={{ marginTop:12, fontSize:12, color:'var(--muted)' }}>
            Showing {venues.length} hall{venues.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    );
  }

  HB.Views.DiscoverScreen = DiscoverScreen;
})();
