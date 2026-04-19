// home.jsx — HallBook landing page with anime.js-powered animations
// Uses window globals: VENUES, Icon, anime

const { useState: uSH, useEffect: uEH, useRef: uRH, useMemo: uMH } = React;

function HomeScreen({ setRoute, setSelectedVenue }) {
  const heroTitleRef = uRH(null);
  const heroSubRef = uRH(null);
  const heroCtaRef = uRH(null);
  const heroBadgeRef = uRH(null);
  const orbsRef = uRH(null);
  const floatCardsRef = uRH(null);
  const statsRef = uRH(null);
  const featuresRef = uRH(null);
  const marqueeRef = uRH(null);
  const venueSecRef = uRH(null);
  const ctaBannerRef = uRH(null);
  const logoRef = uRH(null);
  const tickerRef = uRH(null);
  const pointerRef = uRH({ x: 0, y: 0 });

  const featuredVenues = uMH(() => VENUES.slice(0, 6), []);
  const floatVenues = uMH(() => VENUES.slice(0, 4), []);

  const categories = [
    'Weddings', 'Corporate', 'Birthdays', 'Galas', 'Workshops',
    'Receptions', 'Pop-ups', 'Photoshoots', 'Fundraisers', 'Concerts',
    'Conferences', 'Launches',
  ];

  // Hero entrance + continuous animations
  uEH(() => {
    const A = window.anime;
    if (!A) return;

    // Split title into animated letters
    const title = heroTitleRef.current;
    if (title && !title.dataset.split) {
      const html = title.innerHTML;
      // Walk text nodes only to preserve <em> spans
      const walk = (node) => {
        if (node.nodeType === 3) {
          const frag = document.createDocumentFragment();
          node.textContent.split('').forEach(ch => {
            const s = document.createElement('span');
            s.className = 'hero-letter';
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            s.style.display = 'inline-block';
            s.style.willChange = 'transform, opacity, filter';
            frag.appendChild(s);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.childNodes.length) {
          Array.from(node.childNodes).forEach(walk);
        }
      };
      Array.from(title.childNodes).forEach(walk);
      title.dataset.split = '1';
    }

    // Master timeline
    const tl = A.timeline({ easing: 'easeOutExpo' });

    tl.add({
      targets: heroBadgeRef.current,
      translateY: [18, 0],
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 700,
    })
    .add({
      targets: title ? title.querySelectorAll('.hero-letter') : [],
      translateY: [60, 0],
      opacity: [0, 1],
      rotateX: [-90, 0],
      filter: ['blur(12px)', 'blur(0px)'],
      duration: 900,
      delay: A.stagger(28),
    }, '-=400')
    .add({
      targets: heroSubRef.current,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 700,
    }, '-=500')
    .add({
      targets: heroCtaRef.current ? heroCtaRef.current.children : [],
      translateY: [24, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 700,
      delay: A.stagger(90),
    }, '-=500')
    .add({
      targets: tickerRef.current,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 600,
    }, '-=400');

    // Orbs — continuous slow drift
    if (orbsRef.current) {
      Array.from(orbsRef.current.children).forEach((el, i) => {
        A({
          targets: el,
          translateX: [
            { value: (i % 2 === 0 ? 40 : -40), duration: 5200 + i * 500 },
            { value: 0, duration: 5200 + i * 500 },
          ],
          translateY: [
            { value: (i % 2 === 0 ? -30 : 30), duration: 4700 + i * 400 },
            { value: 0, duration: 4700 + i * 400 },
          ],
          scale: [
            { value: 1.12, duration: 4200 },
            { value: 1, duration: 4200 },
          ],
          easing: 'easeInOutSine',
          loop: true,
          direction: 'alternate',
        });
      });
    }

    // Floating venue cards — drift + bob
    if (floatCardsRef.current) {
      Array.from(floatCardsRef.current.children).forEach((el, i) => {
        A({
          targets: el,
          translateY: [
            { value: -14, duration: 2600 + i * 300, easing: 'easeInOutSine' },
            { value: 0, duration: 2600 + i * 300, easing: 'easeInOutSine' },
          ],
          rotate: [
            { value: i % 2 === 0 ? 2.5 : -2.5, duration: 3400 },
            { value: 0, duration: 3400 },
          ],
          direction: 'alternate',
          loop: true,
          delay: i * 220,
        });
      });
    }

    // Ticker live-pulse dot
    const pulse = document.querySelectorAll('.home-pulse-dot');
    pulse.forEach(el => {
      A({
        targets: el,
        scale: [1, 1.9, 1],
        opacity: [1, 0, 1],
        duration: 1800,
        loop: true,
        easing: 'easeOutQuad',
      });
    });

    // Logo spin once on mount + subtle continuous bob
    if (logoRef.current) {
      A({
        targets: logoRef.current,
        rotate: [0, 360],
        scale: [0.5, 1],
        duration: 1400,
        easing: 'easeOutBack',
      });
    }

    // Scroll-triggered reveals for sections
    const reveal = (el, opts = {}) => {
      if (!el) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            A({
              targets: e.target.querySelectorAll('[data-reveal]'),
              translateY: [40, 0],
              opacity: [0, 1],
              scale: [0.96, 1],
              filter: ['blur(6px)', 'blur(0px)'],
              easing: 'easeOutExpo',
              duration: 900,
              delay: A.stagger(80),
              ...opts,
            });
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, root: document.querySelector('.main') });
      io.observe(el);
    };
    reveal(statsRef.current);
    reveal(featuresRef.current);
    reveal(venueSecRef.current);
    reveal(ctaBannerRef.current);

    // Stats counters
    if (statsRef.current) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll('[data-count]').forEach(el => {
            const target = +el.dataset.count;
            const decimals = +(el.dataset.decimals || 0);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const obj = { n: 0 };
            A({
              targets: obj,
              n: target,
              duration: 1800,
              easing: 'easeOutExpo',
              update: () => {
                let v;
                if (decimals > 0) v = obj.n.toFixed(decimals);
                else if (target >= 1000) v = Math.round(obj.n).toLocaleString();
                else v = Math.round(obj.n).toString();
                el.textContent = prefix + v + suffix;
              },
            });
          });
          io.unobserve(e.target);
        });
      }, { threshold: 0.4, root: document.querySelector('.main') });
      io.observe(statsRef.current);
    }

    // Marquee infinite scroll
    if (marqueeRef.current) {
      const track = marqueeRef.current.querySelector('.home-marquee-track');
      if (track) {
        A({
          targets: track,
          translateX: ['0%', '-50%'],
          duration: 24000,
          easing: 'linear',
          loop: true,
        });
      }
    }

    // Parallax on pointer for hero orbs + float cards
    const onMove = (e) => {
      const r = heroCtaRef.current?.closest('.home-hero')?.getBoundingClientRect();
      if (!r) return;
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      pointerRef.current = { x: px, y: py };
      if (orbsRef.current) {
        Array.from(orbsRef.current.children).forEach((el, i) => {
          const m = (i + 1) * 12;
          el.style.transform = `translate(${px * m}px, ${py * m}px)`;
        });
      }
      if (floatCardsRef.current) {
        Array.from(floatCardsRef.current.children).forEach((el, i) => {
          const m = 10 + i * 4;
          el.style.setProperty('--px', `${-px * m}px`);
          el.style.setProperty('--py', `${-py * m}px`);
        });
      }
    };
    const hero = document.querySelector('.home-hero');
    hero && hero.addEventListener('mousemove', onMove);
    return () => { hero && hero.removeEventListener('mousemove', onMove); };
  }, []);

  const goDiscover = () => setRoute('discover');
  const openVenue = (v) => { setSelectedVenue(v.id); setRoute('venue'); };

  const handleCtaHover = (e) => {
    const A = window.anime;
    if (!A) return;
    A({
      targets: e.currentTarget,
      scale: [1, 1.04],
      duration: 240,
      easing: 'easeOutBack',
    });
  };
  const handleCtaLeave = (e) => {
    const A = window.anime;
    if (!A) return;
    A({ targets: e.currentTarget, scale: 1, duration: 220, easing: 'easeOutQuad' });
  };

  return (
    <div className="home-page">
      {/* ————— HERO ————— */}
      <section className="home-hero">
        <div className="home-orbs" ref={orbsRef} aria-hidden="true">
          <div className="orb orb-1"/>
          <div className="orb orb-2"/>
          <div className="orb orb-3"/>
          <div className="orb orb-4"/>
        </div>

        <div className="home-grid-lines" aria-hidden="true"/>

        <div className="home-hero-inner">
          <div className="home-hero-left">
            <div className="home-badge" ref={heroBadgeRef}>
              <span ref={logoRef} className="home-badge-logo">H</span>
              <span className="home-pulse-dot"/>
              <span>Now live in 14 cities</span>
            </div>

            <h1 className="home-title" ref={heroTitleRef}>
              Unlock any hall.<br/>
              <em>Any</em> time.
            </h1>

            <p className="home-sub" ref={heroSubRef}>
              HallBook is 24/7 self-service venue booking.
              Browse open halls, pick a slot, and walk straight in —
              no staff, no waiting. The door unlocks 30 minutes before your event.
            </p>

            <div className="home-cta-row" ref={heroCtaRef}>
              <button
                className="home-cta-primary"
                onMouseEnter={handleCtaHover}
                onMouseLeave={handleCtaLeave}
                onClick={goDiscover}
              >
                <span>Find a hall tonight</span>
                <Icon name="arrow" size={15}/>
                <span className="home-cta-sheen"/>
              </button>
              <button
                className="home-cta-secondary"
                onMouseEnter={handleCtaHover}
                onMouseLeave={handleCtaLeave}
                onClick={() => setRoute('bookings')}
              >
                <Icon name="ticket" size={14}/>
                <span>My bookings</span>
              </button>
            </div>

            <div className="home-ticker" ref={tickerRef}>
              <span className="home-pulse-dot big"/>
              <span className="home-ticker-count">3 halls</span>
              <span className="home-ticker-sep">·</span>
              <span className="home-ticker-text">available in the next 30 minutes near you</span>
            </div>
          </div>

          {/* Right: floating preview cards */}
          <div className="home-hero-right">
            <div className="home-float-stack" ref={floatCardsRef}>
              {floatVenues.map((v, i) => (
                <div
                  key={v.id}
                  className={`home-float-card home-float-card-${i}`}
                  onClick={() => openVenue(v)}
                >
                  <div className={`home-float-hero ph ${v.hero}`}>
                    <div className="ph-label">{v.name.toUpperCase()}</div>
                  </div>
                  <div className="home-float-body">
                    <div className="home-float-top">
                      <div className="home-float-title">{v.name}</div>
                      <div className="home-float-rating"><Icon name="star" size={11}/> {v.rating}</div>
                    </div>
                    <div className="home-float-sub">{v.district}</div>
                    <div className="home-float-tags">
                      <span className={`dot ${v.available === 'now' ? 'ok' : v.available === 'soon' ? 'warn' : 'bad'}`}/>
                      <span>{v.available === 'now' ? 'Open now' : v.available === 'soon' ? 'Limited' : 'Booked'}</span>
                      <span className="home-float-price">${v.priceHour}<small>/hr</small></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ————— MARQUEE ————— */}
      <section className="home-marquee" ref={marqueeRef} aria-hidden="true">
        <div className="home-marquee-track">
          {[...categories, ...categories].map((c, i) => (
            <span key={i} className="home-marquee-item">
              <Icon name="sparkle" size={12}/> {c}
            </span>
          ))}
        </div>
      </section>

      {/* ————— STATS ————— */}
      <section className="home-section home-stats" ref={statsRef}>
        <div className="home-section-head">
          <div data-reveal>
            <div className="home-kicker">By the numbers</div>
            <h2 className="home-h2">A new way of booking — <em>finally</em>.</h2>
          </div>
        </div>
        <div className="home-stats-grid">
          {[
            { label: 'Halls on the platform', n: 2400, prefix: '', suffix: '+', d: 0 },
            { label: 'Self check-ins this year', n: 184000, prefix: '', suffix: '', d: 0 },
            { label: 'Average rating', n: 4.9, prefix: '', suffix: ' / 5', d: 1 },
            { label: 'Door-to-door access', n: 24, prefix: '', suffix: '/7', d: 0 },
          ].map((s, i) => (
            <div key={i} className="home-stat-card" data-reveal>
              <div className="home-stat-val">
                <span data-count={s.n} data-decimals={s.d} data-prefix={s.prefix} data-suffix={s.suffix}>{s.prefix}0{s.suffix}</span>
              </div>
              <div className="home-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ————— HOW IT WORKS ————— */}
      <section className="home-section home-features" ref={featuresRef}>
        <div className="home-section-head">
          <div data-reveal>
            <div className="home-kicker">How it works</div>
            <h2 className="home-h2">Three steps. <em>Zero</em> phone calls.</h2>
            <p className="home-section-sub">From browse to door unlock in under five minutes.</p>
          </div>
        </div>
        <div className="home-feature-grid">
          {[
            { icon: 'compass', title: 'Discover', desc: 'Browse halls with live availability. Filter by capacity, date, price, or distance.' },
            { icon: 'calendar', title: 'Book instantly', desc: 'Pick your slot and pay. Reserved to the minute — the calendar is always in sync.' },
            { icon: 'qr',     title: 'Walk right in',  desc: 'Your QR code or 4-digit PIN unlocks the door 30 minutes before start. No staff needed.' },
          ].map((f, i) => (
            <div key={i} className="home-feature-card" data-reveal>
              <div className="home-feature-num">0{i + 1}</div>
              <div className="home-feature-icon"><Icon name={f.icon} size={20}/></div>
              <div className="home-feature-title">{f.title}</div>
              <div className="home-feature-desc">{f.desc}</div>
              <div className="home-feature-arrow"><Icon name="arrow" size={14}/></div>
            </div>
          ))}
        </div>
      </section>

      {/* ————— FEATURED VENUES ————— */}
      <section className="home-section" ref={venueSecRef}>
        <div className="home-section-head split">
          <div data-reveal>
            <div className="home-kicker">Featured</div>
            <h2 className="home-h2">Halls people are <em>loving</em></h2>
          </div>
          <button className="home-link" data-reveal onClick={goDiscover}>
            See all halls <Icon name="arrow" size={13}/>
          </button>
        </div>
        <div className="home-venues-grid">
          {featuredVenues.map((v) => (
            <div key={v.id} className="home-venue-card" data-reveal onClick={() => openVenue(v)}>
              <div className={`home-venue-hero ph ${v.hero}`}>
                <div className="ph-label">{v.name.toUpperCase()}</div>
                <div className="home-venue-avail">
                  <span className={`dot ${v.available === 'now' ? 'ok' : v.available === 'soon' ? 'warn' : 'bad'}`}/>
                  {v.available === 'now' ? 'Open' : v.available === 'soon' ? 'Limited' : 'Booked'}
                </div>
              </div>
              <div className="home-venue-body">
                <div className="home-venue-top">
                  <div>
                    <div className="home-venue-title">{v.name}</div>
                    <div className="home-venue-sub">{v.district} · {v.capacity} guests</div>
                  </div>
                  <div className="home-venue-price">${v.priceHour}<small>/hr</small></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ————— CTA BANNER ————— */}
      <section className="home-banner" ref={ctaBannerRef}>
        <div className="home-banner-orbs" aria-hidden="true">
          <div className="banner-orb o1"/>
          <div className="banner-orb o2"/>
        </div>
        <div className="home-banner-inner" data-reveal>
          <h2 className="home-banner-title">
            Your next event is a <em>tap</em> away.
          </h2>
          <p className="home-banner-sub">
            Join thousands of hosts who've skipped the phone calls, the paperwork, and the front-desk waits.
          </p>
          <div className="home-cta-row center">
            <button
              className="home-cta-primary big"
              onMouseEnter={handleCtaHover}
              onMouseLeave={handleCtaLeave}
              onClick={goDiscover}
            >
              <span>Start browsing halls</span>
              <Icon name="arrow" size={15}/>
              <span className="home-cta-sheen"/>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { HomeScreen });
