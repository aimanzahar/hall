// views/shell/Sidebar.jsx — Left navigation rail. Pure view — receives route +
// bookings as props and emits setRoute/onClose.
(function () {
  const { Icon } = HB.Views;
  const M = HB.Models.Bookings;

  function Sidebar({ route, setRoute, bookings, open, onClose, user, onLogout, onSignIn }) {
    const pending = M.countByStatus(bookings, 'pending');
    const approved = M.countByStatus(bookings, 'approved');
    const nav = (r) => { setRoute(r); if (onClose) onClose(); };

    const displayName = (user && (user.name || user.email)) || 'Guest';
    const displayEmail = (user && user.email) || '';
    const initials = (displayName || 'G')
      .split(/[\s@.]+/).filter(Boolean).slice(0, 2)
      .map(s => s[0].toUpperCase()).join('') || 'G';
    return (
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">H</div>
          <div className="brand-name">Hall<em>book</em></div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Browse</div>
          <button className={`nav-item ${route === 'discover' ? 'active' : ''}`} onClick={() => nav('discover')}>
            <Icon name="compass"/> Discover halls
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">My requests</div>
          <button className={`nav-item ${route === 'bookings' ? 'active' : ''}`} onClick={() => nav('bookings')}>
            <Icon name="ticket"/> My bookings
            <span className="count">{pending + approved}</span>
          </button>
        </div>

        {user ? (
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayEmail}</div>
            </div>
            {onLogout && (
              <button className="user-logout" onClick={onLogout} title="Sign out" aria-label="Sign out">
                Sign out
              </button>
            )}
          </div>
        ) : (
          <button className="btn primary user-signin"
            onClick={() => { if (onSignIn) onSignIn(); if (onClose) onClose(); }}>
            Sign in · Create account
          </button>
        )}
      </aside>
    );
  }

  HB.Views.Sidebar = Sidebar;
})();
