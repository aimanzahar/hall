// views/shell/Topbar.jsx — Breadcrumb + search + optional right-action.
(function () {
  const { Icon } = HB.Views;

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

  HB.Views.Topbar = Topbar;
})();
