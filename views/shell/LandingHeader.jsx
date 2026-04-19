// views/shell/LandingHeader.jsx — Minimal header for the public landing.
// No sidebar / breadcrumbs / search — just brand + navigation + auth CTA.
(function () {
  function LandingHeader({ route, setRoute, onSignIn }) {
    const navLink = (target, label) => (
      <button
        type="button"
        className={`landing-navlink ${route === target ? 'active' : ''}`}
        onClick={() => setRoute(target)}
      >{label}</button>
    );
    return (
      <header className="landing-header">
        <button
          type="button"
          className="landing-brand"
          onClick={() => setRoute('home')}
          aria-label="HallBook home"
        >
          <span className="brand-mark">H</span>
          <span className="brand-name">Hall<em>book</em></span>
        </button>
        <nav className="landing-nav">
          {navLink('home', 'Home')}
          {navLink('discover', 'Discover')}
        </nav>
        <div className="landing-actions">
          <button className="landing-navlink" onClick={onSignIn}>Sign in</button>
          <button className="btn primary landing-cta" onClick={onSignIn}>
            Create account
          </button>
        </div>
      </header>
    );
  }

  HB.Views.LandingHeader = LandingHeader;
})();
