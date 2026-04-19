// shell.jsx — App shell: Sidebar, Topbar, Placeholder

const { useState, useEffect, useMemo, useRef } = React;

function Icon({ name, size = 16 }) {
  const s = size;
  const stroke = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>);
    case 'compass': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/></svg>);
    case 'calendar': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>);
    case 'ticket': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 7v10"/></svg>);
    case 'qr': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h7"/></svg>);
    case 'heart': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M20.8 8.6c0 3-3.5 5.7-8.8 10.4-5.3-4.7-8.8-7.4-8.8-10.4a4.6 4.6 0 0 1 8.8-2 4.6 4.6 0 0 1 8.8 2z"/></svg>);
    case 'settings': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5h0a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>);
    case 'search': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case 'star': return (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1z"/></svg>);
    case 'users': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M16 4a4 4 0 0 1 0 8M23 21a8 8 0 0 0-6-7.7"/></svg>);
    case 'arrow': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case 'arrow-left': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>);
    case 'check': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M4 12l5 5L20 6"/></svg>);
    case 'clock': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case 'map': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2z"/><path d="M9 3v16M15 5v16"/></svg>);
    case 'grid': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>);
    case 'chat': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M21 12a8 8 0 0 1-11.3 7.3L4 21l1.7-5.7A8 8 0 1 1 21 12z"/></svg>);
    case 'plus': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14"/></svg>);
    case 'pin': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>);
    case 'sparkle': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>);
    case 'menu': return (<svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M4 6h16M4 12h16M4 18h16"/></svg>);
    default: return null;
  }
}

function Sidebar({ route, setRoute, bookings, open, onClose }) {
  const activeCount = bookings.filter(b => b.status === 'active').length;
  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length;
  const nav = (r) => { setRoute(r); if (onClose) onClose(); };
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">H</div>
        <div className="brand-name">Hall<em>book</em></div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Book</div>
        <button className={`nav-item ${route === 'discover' ? 'active' : ''}`} onClick={() => nav('discover')}>
          <Icon name="compass"/> Discover <span className="kbd">G D</span>
        </button>
        <button className={`nav-item ${route === 'venue' ? 'active' : ''}`} onClick={() => nav('venue')}>
          <Icon name="pin"/> The Atrium
        </button>
        <button className={`nav-item ${route === 'book' ? 'active' : ''}`} onClick={() => nav('book')}>
          <Icon name="plus"/> New booking
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-label">Manage</div>
        <button className={`nav-item ${route === 'bookings' ? 'active' : ''}`} onClick={() => nav('bookings')}>
          <Icon name="ticket"/> My bookings <span className="count">{upcomingCount + activeCount}</span>
        </button>
        <button className={`nav-item ${route === 'checkin' ? 'active' : ''}`} onClick={() => nav('checkin')}>
          <Icon name="qr"/> Self check-in {activeCount > 0 && <span className="count" style={{background: 'rgba(23,133,74,0.12)', color: 'var(--ok)'}}>{activeCount} live</span>}
        </button>
        <button className="nav-item"><Icon name="heart"/> Saved</button>
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        <button className="nav-item"><Icon name="settings"/> Settings</button>
      </div>

      <div className="user-chip">
        <div className="avatar">AM</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Amira Malik</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>amira@studio.co</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs, action, onMenu }) {
  return (
    <div className="topbar">
      <button className="topbar-menu" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" size={18}/>
      </button>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span>/</span>}
            {i === crumbs.length - 1 ? <strong>{c}</strong> : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        <Icon name="search" size={14}/>
        <input placeholder="Search venues, cities, dates…" />
        <span className="kbd">⌘K</span>
      </div>
      {action}
    </div>
  );
}

function Placeholder({ w, h, label, hero = 'warm' }) {
  return (
    <div className={`ph ${hero}`} style={{ width: w, height: h }}>
      <div className="ph-label">{label}</div>
    </div>
  );
}

function ChatFab() {
  return (
    <button className="chat-fab" title="Chat support">
      <Icon name="chat" size={18}/>
    </button>
  );
}

Object.assign(window, { Icon, Sidebar, Topbar, Placeholder, ChatFab });
