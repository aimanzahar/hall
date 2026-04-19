// views/screens/HomeScreen.jsx — Landing page. Receives the PocketBase-loaded
// venue list via props and drives its hero animations from anime.js.
(function () {
  const { useEffect, useRef, useMemo } = React;
  const { Icon, VenueHero } = HB.Views;

  const CATEGORIES = [
    'Majlis Kahwin', 'Corporate', 'Birthdays', 'Galas', 'Workshops',
    'Receptions', 'Pop-ups', 'Photoshoots', 'Fundraisers', 'Concerts',
    'Conferences', 'Launches',
  ];

  function HomeScreen({ setRoute, setSelectedVenue, venues, onSignIn, onAdminSignIn }) {
    const heroTitleRef = useRef(null);
    const heroSubRef = useRef(null);
    const heroCtaRef = useRef(null);
    const heroBadgeRef = useRef(null);
    const orbsRef = useRef(null);
    const floatCardsRef = useRef(null);
    const statsRef = useRef(null);
    const featuresRef = useRef(null);
    const marqueeRef = useRef(null);
    const venueSecRef = useRef(null);
    const ctaBannerRef = useRef(null);
    const logoRef = useRef(null);
    const tickerRef = useRef(null);

    const list = venues && venues.length ? venues : [];
    const featuredVenues = useMemo(() => list.slice(0, 6), [list]);
    const floatVenues = useMemo(() => list.slice(0, 4), [list]);
    const availableCount = useMemo(() => list.filter(v => v.available === 'now').length, [list]);

    useEffect(() => {
      const A = window.anime;
      if (!A) return;

      const title = heroTitleRef.current;
      if (title && !title.dataset.split) {
        // Split into words (kept as atomic `.hero-word` inline-blocks so a word
        // never breaks mid-letter) and then split each word into animatable
        // letter spans inside.
        const walk = (node) => {
          if (node.nodeType === 3) {
            const frag = document.createDocumentFragment();
            const tokens = node.textContent.split(/(\s+)/);
            tokens.forEach(tok => {
              if (!tok) return;
              if (/^\s+$/.test(tok)) {
                frag.appendChild(document.createTextNode(tok));
                return;
              }
              const word = document.createElement('span');
              word.className = 'hero-word';
              for (const ch of tok) {
                const s = document.createElement('span');
                s.className = 'hero-letter';
                s.textContent = ch;
                s.style.display = 'inline-block';
                s.style.willChange = 'transform, opacity, filter';
                word.appendChild(s);
              }
              frag.appendChild(word);
            });
            node.parentNode.replaceChild(frag, node);
          } else if (node.nodeType === 1 && node.childNodes.length) {
            Array.from(node.childNodes).forEach(walk);
          }
        };
        Array.from(title.childNodes).forEach(walk);
        title.dataset.split = '1';
      }

      const tl = A.timeline({ easing: 'easeOutExpo' });
      tl.add({ targets: heroBadgeRef.current, translateY: [18,0], opacity:[0,1], scale:[0.92,1], duration: 700 })
        .add({ targets: title ? title.querySelectorAll('.hero-letter') : [], translateY:[60,0], opacity:[0,1], rotateX:[-90,0], filter:['blur(12px)','blur(0px)'], duration: 900, delay: A.stagger(28) }, '-=400')
        .add({ targets: heroSubRef.current, translateY:[20,0], opacity:[0,1], duration: 700 }, '-=500')
        .add({ targets: heroCtaRef.current ? heroCtaRef.current.children : [], translateY:[24,0], opacity:[0,1], scale:[0.9,1], duration: 700, delay: A.stagger(90) }, '-=500')
        .add({ targets: tickerRef.current, opacity:[0,1], translateY:[10,0], duration: 600 }, '-=400');

      if (orbsRef.current) {
        Array.from(orbsRef.current.children).forEach((el, i) => {
          A({
            targets: el,
            translateX: [{ value:(i%2===0?40:-40), duration:5200+i*500 }, { value:0, duration:5200+i*500 }],
            translateY: [{ value:(i%2===0?-30:30), duration:4700+i*400 }, { value:0, duration:4700+i*400 }],
            scale: [{ value:1.12, duration:4200 }, { value:1, duration:4200 }],
            easing:'easeInOutSine', loop:true, direction:'alternate',
          });
        });
      }
      if (floatCardsRef.current) {
        Array.from(floatCardsRef.current.children).forEach((el, i) => {
          A({
            targets: el,
            translateY: [{ value:-14, duration:2600+i*300, easing:'easeInOutSine' }, { value:0, duration:2600+i*300, easing:'easeInOutSine' }],
            rotate: [{ value:i%2===0?2.5:-2.5, duration:3400 }, { value:0, duration:3400 }],
            direction:'alternate', loop:true, delay:i*220,
          });
        });
      }

      document.querySelectorAll('.home-pulse-dot').forEach(el => {
        A({ targets: el, scale:[1,1.9,1], opacity:[1,0,1], duration:1800, loop:true, easing:'easeOutQuad' });
      });
      if (logoRef.current) {
        A({ targets: logoRef.current, rotate:[0,360], scale:[0.5,1], duration:1400, easing:'easeOutBack' });
      }

      const reveal = (el) => {
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              A({
                targets: e.target.querySelectorAll('[data-reveal]'),
                translateY:[40,0], opacity:[0,1], scale:[0.96,1],
                filter:['blur(6px)','blur(0px)'],
                easing:'easeOutExpo', duration:900, delay:A.stagger(80),
              });
              io.unobserve(e.target);
            }
          });
        }, { threshold:0.15, root: document.querySelector('.landing-main, .main') });
        io.observe(el);
      };
      reveal(statsRef.current);
      reveal(featuresRef.current);
      reveal(venueSecRef.current);
      reveal(ctaBannerRef.current);

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
              A({ targets: obj, n: target, duration: 1800, easing: 'easeOutExpo',
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
        }, { threshold:0.4, root: document.querySelector('.landing-main, .main') });
        io.observe(statsRef.current);
      }
      if (marqueeRef.current) {
        const track = marqueeRef.current.querySelector('.home-marquee-track');
        if (track) A({ targets: track, translateX:['0%','-50%'], duration:24000, easing:'linear', loop:true });
      }
    }, [list.length]);

    const goDiscover = () => setRoute('discover');
    const openVenue = (v) => { setSelectedVenue(v.id); setRoute('venue'); };

    const handleCtaHover = (e) => {
      const A = window.anime;
      if (!A) return;
      A({ targets: e.currentTarget, scale:[1,1.04], duration:240, easing:'easeOutBack' });
    };
    const handleCtaLeave = (e) => {
      const A = window.anime;
      if (!A) return;
      A({ targets: e.currentTarget, scale:1, duration:220, easing:'easeOutQuad' });
    };

    return (
      <div className="home-page">
        <section className="home-hero">
          <div className="home-orbs" ref={orbsRef} aria-hidden="true">
            <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/><div className="orb orb-4"/>
          </div>
          <div className="home-grid-lines" aria-hidden="true"/>
          <div className="home-hero-inner">
            <div className="home-hero-left">
              <div className="home-badge" ref={heroBadgeRef}>
                <span ref={logoRef} className="home-badge-logo">H</span>
                <span className="home-pulse-dot"/>
                <span>Live in 6 Malaysian cities</span>
              </div>
              <h1 className="home-title" ref={heroTitleRef}>
                Book a hall.<br/>
                <em>Anywhere</em> in Malaysia.
              </h1>
              <p className="home-sub" ref={heroSubRef}>
                HallBook is Malaysia's self-service venue booking platform.
                Browse halls from KL to Kuching, pick a date and slot, and submit
                your request — every booking is reviewed by the venue team before it's confirmed.
              </p>
              <div className="home-cta-row" ref={heroCtaRef}>
                <button className="home-cta-primary" onMouseEnter={handleCtaHover} onMouseLeave={handleCtaLeave} onClick={goDiscover}>
                  <span>Browse halls</span><Icon name="arrow" size={15}/><span className="home-cta-sheen"/>
                </button>
                <button className="home-cta-secondary" onMouseEnter={handleCtaHover} onMouseLeave={handleCtaLeave} onClick={onSignIn}>
                  <Icon name="ticket" size={14}/><span>Sign in / Sign up</span>
                </button>
              </div>
              <div className="home-ticker" ref={tickerRef}>
                <span className="home-pulse-dot big"/>
                <span className="home-ticker-count">{availableCount} hall{availableCount === 1 ? '' : 's'}</span>
                <span className="home-ticker-sep">·</span>
                <span className="home-ticker-text">available for booking this week</span>
              </div>
            </div>

            <div className="home-hero-right">
              <div className="home-float-stack" ref={floatCardsRef}>
                {floatVenues.map((v, i) => (
                  <div key={v.id} className={`home-float-card home-float-card-${i}`} onClick={() => openVenue(v)}>
                    <VenueHero venue={v} className="home-float-hero"/>
                    <div className="home-float-body">
                      <div className="home-float-top">
                        <div className="home-float-title">{v.name}</div>
                        <div className="home-float-rating"><Icon name="star" size={11}/> {v.rating}</div>
                      </div>
                      <div className="home-float-sub">{v.district}</div>
                      <div className="home-float-tags">
                        <span className={`dot ${v.available === 'now' ? 'ok' : v.available === 'soon' ? 'warn' : 'bad'}`}/>
                        <span>{v.available === 'now' ? 'Open now' : v.available === 'soon' ? 'Limited' : 'Booked'}</span>
                        <span className="home-float-price">RM{v.priceHour}<small>/hr</small></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="home-marquee" ref={marqueeRef} aria-hidden="true">
          <div className="home-marquee-track">
            {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
              <span key={i} className="home-marquee-item"><Icon name="sparkle" size={12}/> {c}</span>
            ))}
          </div>
        </section>

        <section className="home-section home-stats" ref={statsRef}>
          <div className="home-section-head">
            <div data-reveal>
              <div className="home-kicker">By the numbers</div>
              <h2 className="home-h2">Malaysia's easiest way to <em>book a hall</em>.</h2>
            </div>
          </div>
          <div className="home-stats-grid">
            {[
              { label: 'Halls across Malaysia',   n: list.length || 6, prefix:'', suffix:'+', d: 0 },
              { label: 'Average host rating',     n: 4.8,              prefix:'', suffix:' / 5', d: 1 },
              { label: 'States covered',          n: 6,                prefix:'', suffix:'',  d: 0 },
              { label: 'Request review',          n: 24,               prefix:'', suffix:'h or less', d: 0 },
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

        <section className="home-section home-features" ref={featuresRef}>
          <div className="home-section-head">
            <div data-reveal>
              <div className="home-kicker">How it works</div>
              <h2 className="home-h2">Three steps. <em>Zero</em> phone calls.</h2>
              <p className="home-section-sub">Browse, request, get confirmed — all online.</p>
            </div>
          </div>
          <div className="home-feature-grid">
            {[
              { icon:'compass',  title:'Discover',        desc:'Browse halls across KL, Selangor, Penang, Johor, Sabah and Sarawak with live availability.' },
              { icon:'calendar', title:'Submit request',  desc:'Pick your date and time slot, fill in the event details, and submit — no payment required upfront.' },
              { icon:'check',    title:'Get approved',    desc:'The venue admin reviews your request within 24 hours and you get an approval or a reason why not.' },
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

        <section className="home-section" ref={venueSecRef}>
          <div className="home-section-head split">
            <div data-reveal>
              <div className="home-kicker">Featured halls</div>
              <h2 className="home-h2">From KLCC to <em>Kuching</em></h2>
            </div>
            <button className="home-link" data-reveal onClick={goDiscover}>
              See all halls <Icon name="arrow" size={13}/>
            </button>
          </div>
          <div className="home-venues-grid">
            {featuredVenues.map((v) => (
              <div key={v.id} className="home-venue-card" data-reveal onClick={() => openVenue(v)}>
                <VenueHero venue={v} className="home-venue-hero" overlay={
                  <div className="home-venue-avail">
                    <span className={`dot ${v.available === 'now' ? 'ok' : v.available === 'soon' ? 'warn' : 'bad'}`}/>
                    {v.available === 'now' ? 'Open' : v.available === 'soon' ? 'Limited' : 'Booked'}
                  </div>
                }/>
                <div className="home-venue-body">
                  <div className="home-venue-top">
                    <div>
                      <div className="home-venue-title">{v.name}</div>
                      <div className="home-venue-sub">{v.district} · {v.capacity} guests</div>
                    </div>
                    <div className="home-venue-price">RM{v.priceHour}<small>/hr</small></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-banner" ref={ctaBannerRef}>
          <div className="home-banner-orbs" aria-hidden="true">
            <div className="banner-orb o1"/><div className="banner-orb o2"/>
          </div>
          <div className="home-banner-inner" data-reveal>
            <h2 className="home-banner-title">Your next event is a <em>request</em> away.</h2>
            <p className="home-banner-sub">Sign up, pick a hall, submit your booking — it's that simple.</p>
            <div className="home-cta-row center">
              <button className="home-cta-primary big" onMouseEnter={handleCtaHover} onMouseLeave={handleCtaLeave} onClick={goDiscover}>
                <span>Start browsing</span><Icon name="arrow" size={15}/><span className="home-cta-sheen"/>
              </button>
              {onAdminSignIn && (
                <button className="home-cta-secondary big" onClick={onAdminSignIn}>
                  <Icon name="qr" size={14}/><span>Admin sign-in</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  HB.Views.HomeScreen = HomeScreen;
})();
