// views/App.jsx — Composition root. Calls controllers, derives crumbs, routes
// the current screen. No domain state lives here.
(function () {
  const { useEffect } = React;
  const C = HB.Controllers;
  const { VENUES, getById } = HB.Models.Venues;
  const {
    Icon, Sidebar, Topbar, ChatFab, TweaksPanel, LandingHeader,
    HomeScreen, DiscoverScreen, VenueScreen, BookScreen,
    ConfirmScreen, BookingsScreen, CheckinScreen, AuthScreen,
  } = HB.Views;

  // Public routes render for anyone. Everything else forces an auth detour.
  const PUBLIC_ROUTES = new Set(['home', 'discover', 'venue', 'auth']);
  const PROTECTED_ROUTES = new Set(['book', 'confirm', 'bookings', 'checkin']);

  function buildCrumbs(route, selectedVenueId) {
    const venueName = getById(selectedVenueId, VENUES).name;
    return ({
      home: ['HallBook', 'Home'],
      discover: ['HallBook', 'Discover'],
      venue: ['HallBook', 'Discover', venueName || 'Venue'],
      book: ['HallBook', 'New booking'],
      confirm: ['HallBook', 'Confirmation'],
      bookings: ['HallBook', 'My bookings'],
      checkin: ['HallBook', 'Check-in'],
      auth: ['HallBook', 'Sign in'],
    })[route] || ['HallBook'];
  }

  function App({ tweakDefaults }) {
    const auth = C.useAuth();
    const { route, setRoute } = C.useRouter();
    const venueSel = C.useVenueSelection('v1');
    const bookingsCtl = C.useBookings();
    const tweaksCtl = C.useTweaks(tweakDefaults);
    const { sidebarOpen, openSidebar, closeSidebar } = C.useSidebar();

    // If an unauthenticated visitor lands on a protected route, divert to auth.
    useEffect(() => {
      if (!auth.user && PROTECTED_ROUTES.has(route)) setRoute('auth');
    }, [auth.user, route, setRoute]);

    // Successful auth returns the user to home (not back to the login screen).
    useEffect(() => {
      if (auth.user && route === 'auth') setRoute('home');
    }, [auth.user, route, setRoute]);

    // Dedicated auth page — full-bleed, no app chrome.
    if (route === 'auth' && !auth.user) {
      return (
        <AuthScreen
          login={auth.login}
          register={auth.register}
          busy={!auth.authReady}
          onClose={() => setRoute('home')}
        />
      );
    }

    // Public landing (no sidebar / topbar). Only home / discover / venue render here.
    if (!auth.user) {
      return (
        <div className="landing" data-screen-label={`Landing · ${route}`}>
          <LandingHeader
            route={route}
            setRoute={setRoute}
            onSignIn={() => setRoute('auth')}
          />
          <main className="landing-main" data-screen-label={route}>
            {route === 'home' && (
              <HomeScreen
                setRoute={setRoute}
                setSelectedVenue={venueSel.setSelectedVenue}
              />
            )}
            {route === 'discover' && (
              <DiscoverScreen
                setRoute={setRoute}
                setSelectedVenue={venueSel.setSelectedVenue}
              />
            )}
            {route === 'venue' && (
              <VenueScreen
                venueId={venueSel.selectedVenue}
                setRoute={setRoute}
                setDraft={venueSel.setDraft}
              />
            )}
          </main>
        </div>
      );
    }

    const crumbs = buildCrumbs(route, venueSel.selectedVenue);

    const topAction = (route === 'home' || route === 'discover')
      ? <button className="btn primary" onClick={() => setRoute('bookings')}>
          <Icon name="ticket" size={13}/> My bookings
        </button>
      : null;

    return (
      <div className="app" data-screen-label={`Screen · ${route}`}>
        <Sidebar
          route={route} setRoute={setRoute}
          bookings={auth.user ? bookingsCtl.bookings : []}
          open={sidebarOpen} onClose={closeSidebar}
          user={auth.user} onLogout={auth.logout}
          onSignIn={() => setRoute('auth')}
        />
        <div className={`sidebar-scrim ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}/>
        <main className="main" data-screen-label={route}>
          <Topbar crumbs={crumbs} action={topAction} onMenu={openSidebar}/>
          {route === 'home' && (
            <HomeScreen
              setRoute={setRoute}
              setSelectedVenue={venueSel.setSelectedVenue}
            />
          )}
          {route === 'discover' && (
            <DiscoverScreen
              setRoute={setRoute}
              setSelectedVenue={venueSel.setSelectedVenue}
            />
          )}
          {route === 'venue' && (
            <VenueScreen
              venueId={venueSel.selectedVenue}
              setRoute={setRoute}
              setDraft={venueSel.setDraft}
            />
          )}
          {route === 'book' && auth.user && (
            <BookScreen
              draft={venueSel.draft}
              setRoute={setRoute}
              setCompletedBooking={bookingsCtl.onBookingCreated}
            />
          )}
          {route === 'confirm' && auth.user && (
            <ConfirmScreen
              booking={bookingsCtl.completedBooking}
              setRoute={setRoute}
            />
          )}
          {route === 'bookings' && auth.user && (
            <BookingsScreen
              bookings={bookingsCtl.bookings}
              setRoute={setRoute}
              setActiveBookingId={bookingsCtl.setActiveBookingId}
            />
          )}
          {route === 'checkin' && auth.user && (
            <CheckinScreen
              bookings={bookingsCtl.bookings}
              activeBookingId={bookingsCtl.activeBookingId}
              setRoute={setRoute}
            />
          )}
        </main>
        <ChatFab/>
        {tweaksCtl.tweaksOpen && (
          <TweaksPanel
            tweaks={tweaksCtl.tweaks}
            updateTweak={tweaksCtl.updateTweak}
            close={() => tweaksCtl.setTweaksOpen(false)}
          />
        )}
      </div>
    );
  }

  HB.Views.App = App;
})();
