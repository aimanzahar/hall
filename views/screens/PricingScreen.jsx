// views/screens/PricingScreen.jsx — Public pricing page with three tiers.
(function () {
  const { Icon } = HB.Views;

  const TIERS = [
    {
      id: 'casual',
      name: 'Casual',
      tagline: 'For the occasional booker.',
      price: 'Free',
      priceSuffix: 'forever',
      features: [
        'Browse every public hall',
        'Book up to 2 events / month',
        'Self check-in by PIN',
        'Standard email support',
      ],
      cta: 'Create account',
      accent: false,
    },
    {
      id: 'host',
      name: 'Host',
      tagline: 'For teams that run events often.',
      price: '$29',
      priceSuffix: '/ month',
      features: [
        'Unlimited bookings',
        'Seat maps & floor plans',
        'Split payment links',
        'Priority support (< 2h)',
        'Team roster (up to 5 seats)',
      ],
      cta: 'Start 14-day trial',
      accent: true,
    },
    {
      id: 'venue',
      name: 'Venue',
      tagline: 'For hall operators listing on HallBook.',
      price: 'Custom',
      priceSuffix: 'talk to us',
      features: [
        'Dynamic pricing engine',
        'Smart lock + PIN dispatch',
        'Revenue analytics',
        'Dedicated account manager',
        'SLA: 99.95% uptime',
      ],
      cta: 'Talk to sales',
      accent: false,
    },
  ];

  const FAQ = [
    {
      q: 'Can I cancel anytime?',
      a: 'Yes — cancel with one click. Paid plans pro-rate to the day.',
    },
    {
      q: 'Is there a setup fee?',
      a: 'No setup fees on any plan. Venue customers get a free onboarding session.',
    },
    {
      q: 'Do you charge per guest?',
      a: 'Never. Flat monthly pricing regardless of event size.',
    },
    {
      q: 'Do you support invoicing?',
      a: 'Host and Venue plans both receive GST-compliant invoices every cycle.',
    },
  ];

  function PricingScreen({ setRoute }) {
    return (
      <div className="page page-pricing">
        <section className="page-hero">
          <div className="eyebrow">Pricing</div>
          <h1 className="page-title">Straightforward pricing. <em>No surprises.</em></h1>
          <p className="page-lede">Start free. Upgrade when your events outgrow the Casual plan. Every tier includes 24/7 self check-in and instant PIN dispatch.</p>
        </section>

        <section className="pricing-tiers">
          {TIERS.map(t => (
            <article key={t.id} className={`pricing-card ${t.accent ? 'is-accent' : ''}`}>
              {t.accent && <div className="pricing-badge">Most popular</div>}
              <h3 className="pricing-name">{t.name}</h3>
              <p className="pricing-tagline">{t.tagline}</p>
              <div className="pricing-price">
                <span className="pricing-amount">{t.price}</span>
                <span className="pricing-suffix">{t.priceSuffix}</span>
              </div>
              <ul className="pricing-features">
                {t.features.map(f => (
                  <li key={f}><Icon name="check" size={14}/> {f}</li>
                ))}
              </ul>
              <button
                className={`btn ${t.accent ? 'primary' : ''} pricing-cta`}
                onClick={() => setRoute('auth')}
              >
                {t.cta}
              </button>
            </article>
          ))}
        </section>

        <section className="pricing-faq">
          <h2 className="section-title">Frequently asked</h2>
          <div className="faq-grid">
            {FAQ.map(item => (
              <div className="faq-item" key={item.q}>
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  HB.Views.PricingScreen = PricingScreen;
})();
