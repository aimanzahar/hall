// views/screens/AboutScreen.jsx — Public "About" page: story, values, numbers.
(function () {
  const VALUES = [
    { title: 'Self-service first', body: 'Nobody wants to call a venue at 9pm on a Tuesday. Every step should be unlockable on your phone.' },
    { title: 'Fair pricing', body: 'Flat fees, no guest surcharges, no surge on Saturdays. What you see is what you pay.' },
    { title: 'Operators, not middlemen', body: 'We run the software venues actually use — not a marketplace that skims listings.' },
    { title: 'Open door, open data', body: 'Export your bookings any time. Your customer list belongs to you, not to us.' },
  ];

  const NUMBERS = [
    { n: '2,400+', label: 'Halls on the platform' },
    { n: '14', label: 'Cities live today' },
    { n: '184k', label: 'Self check-ins this year' },
    { n: '99.95%', label: 'Lock-dispatch uptime' },
  ];

  const TEAM = [
    { initials: 'AM', name: 'Amira Malik', role: 'Founder · Product' },
    { initials: 'JL', name: 'Jun Lee', role: 'Engineering' },
    { initials: 'RK', name: 'Raj Kapoor', role: 'Venue partnerships' },
    { initials: 'SN', name: 'Sara Nasir', role: 'Design' },
  ];

  function AboutScreen({ setRoute }) {
    return (
      <div className="page page-about">
        <section className="page-hero">
          <div className="eyebrow">About</div>
          <h1 className="page-title">We're building the <em>front door</em> of every hall.</h1>
          <p className="page-lede">HallBook started as a single spreadsheet shared between three event venues in 2023. Today it runs lock dispatch, availability, and self check-in for thousands of halls worldwide.</p>
        </section>

        <section className="about-numbers">
          {NUMBERS.map(s => (
            <div className="about-number" key={s.label}>
              <div className="about-number-n">{s.n}</div>
              <div className="about-number-label">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="about-values">
          <h2 className="section-title">What we stand for</h2>
          <div className="values-grid">
            {VALUES.map(v => (
              <div className="value-card" key={v.title}>
                <h4>{v.title}</h4>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-team">
          <h2 className="section-title">The people behind the platform</h2>
          <div className="team-grid">
            {TEAM.map(p => (
              <div className="team-card" key={p.name}>
                <div className="team-avatar">{p.initials}</div>
                <div className="team-name">{p.name}</div>
                <div className="team-role">{p.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="page-cta">
          <h2>Ready to list a hall or book one?</h2>
          <div className="page-cta-actions">
            <button className="btn primary" onClick={() => setRoute('auth')}>Create account</button>
            <button className="btn" onClick={() => setRoute('contact')}>Talk to us</button>
          </div>
        </section>
      </div>
    );
  }

  HB.Views.AboutScreen = AboutScreen;
})();
