// views/shell/Sidebar.jsx — Left navigation rail. Pure view — receives route +
// bookings as props and emits setRoute/onClose.
(function () {
  const { Icon } = HB.Views;
  const M = HB.Models.Bookings;

  function Sidebar({ route, setRoute, bookings, open, onClose }) {
    const activeCount = M.countByStatus(bookings, 'active');
    const upcomingCount = M.countByStatus(bookings, 'upcoming');
    const nav = (r) => { setRoute(r); if (onClose) onClose(); };
    return (
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">H</div>
          <div className="brand-name">Hall<em>book</em></div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Book</div>
          <button className={`nav-item ${route === 'home' ? 'active' : ''}`} onClick={() => nav('home')}>
            <Icon name="home"/> Home <span className="kbd">G H</span>
          </button>
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

  HB.Views.Sidebar = Sidebar;
})();
