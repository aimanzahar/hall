// views/App.jsx — Composition root. Loads venues + bookings from PocketBase,
// routes the current screen, and enforces user / admin separation.
(function () {
  const { useEffect } = React;
  const C = HB.Controllers;
  const V = HB.Models.Venues;
  const {
    Icon, Sidebar, Topbar, ChatFab, TweaksPanel, LandingHeader,
    HomeScreen, DiscoverScreen, VenueScreen, BookScreen,
    ConfirmScreen, BookingsScreen, AuthScreen,
    AdminLoginScreen, AdminDashboard,
  } = HB.Views;

  const PUBLIC_ROUTES      = new Set(['home', 'discover', 'venue', 'auth', 'admin-login']);
  const USER_ROUTES        = new Set(['book', 'confirm', 'bookings']);
  const ADMIN_ROUTES       = new Set(['admin']);

  function buildCrumbs(route, selectedVenueId, venues) {
    const venueName = (V.getById(selectedVenueId, venues) || {}).name;
    return ({
      home:        ['HallBook', 'Home'],
      discover:    ['HallBook', 'Discover'],
      venue:       ['HallBook', 'Discover', venueName || 'Venue'],
      book:        ['HallBook', 'New booking'],
      confirm:     ['HallBook', 'Request submitted'],
      bookings:    ['HallBook', 'My bookings'],
      auth:        ['HallBook', 'Sign in'],
    })[route] || ['HallBook'];
  }

  function App({ tweakDefaults }) {
    const auth        = C.useAuth();
    const { route, setRoute } = C.useRouter();
    const venueCtl    = C.useVenues();
    const venueSel    = C.useVenueSelection();
    const userBookings  = C.useBookings(auth.role === 'user' ? auth.user : null);
    const adminBookings = C.useAdminBookings(auth.role === 'admin' ? auth.user : null);
    const tweaksCtl   = C.useTweaks(tweakDefaults);
    const { sidebarOpen, openSidebar, closeSidebar } = C.useSidebar();

    const venues = venueCtl.venues;

    // --- route guards ---
    // 1. Protected user routes require a signed-in customer (role==='user').
    useEffect(() => {
      if (USER_ROUTES.has(route) && auth.role !== 'user') setRoute('auth');
    }, [auth.role, route, setRoute]);

    // 2. Admin-only routes require an admin session.
    useEffect(() => {
      if (ADMIN_ROUTES.has(route) && auth.role !== 'admin') setRoute('admin-login');
    }, [auth.role, route, setRoute]);

    // 3. An admin shouldn't see the customer sign-in screen; drop them home.
    useEffect(() => {
      if (route === 'auth' && auth.role === 'admin') setRoute('admin');
    }, [auth.role, route, setRoute]);

    // 4. A signed-in customer hitting 'auth' / 'admin-login' or the public
    //    'home' landing is sent straight to the discover catalogue.
    useEffect(() => {
      if (route === 'auth' && auth.role === 'user') setRoute('discover');
      if (route === 'home' && auth.role === 'user') setRoute('discover');
      if (route === 'admin-login' && auth.role === 'admin') setRoute('admin');
    }, [auth.role, route, setRoute]);

    // --- dedicated full-bleed auth screens ---
    if (route === 'auth' && !auth.user) {
      return (
        <AuthScreen
          login={auth.login}
          register={auth.register}
          busy={!auth.authReady}
          onClose={() => setRoute('home')}
          onAdminSignIn={() => setRoute('admin-login')}
        />
      );
    }

    if (route === 'admin-login' && auth.role !== 'admin') {
      return (
        <AdminLoginScreen
          loginAdmin={auth.loginAdmin}
          busy={!auth.authReady}
          onBack={() => setRoute('home')}
        />
      );
    }

    // --- admin shell ---
    if (auth.role === 'admin') {
      return (
        <AdminDashboard
          admin={auth.user}
          ctl={adminBookings}
          onLogout={() => { auth.logout(); setRoute('home'); }}
        />
      );
    }

    // --- public landing (no sidebar / topbar) ---
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
                venues={venues}
                onSignIn={() => setRoute('auth')}
                onAdminSignIn={() => setRoute('admin-login')}
              />
            )}
            {route === 'discover' && (
              <DiscoverScreen
                setRoute={setRoute}
                setSelectedVenue={venueSel.setSelectedVenue}
                venues={venues}
              />
            )}
            {route === 'venue' && (
              <VenueScreen
                venueId={venueSel.selectedVenue || (venues[0] && venues[0].id)}
                setRoute={setRoute}
                setDraft={venueSel.setDraft}
                venues={venues}
              />
            )}
          </main>
        </div>
      );
    }

    // --- authenticated customer shell ---
    const crumbs = buildCrumbs(route, venueSel.selectedVenue, venues);
    const topAction = route === 'discover'
      ? <button className="btn primary" onClick={() => setRoute('bookings')}>
          <Icon name="ticket" size={13}/> My bookings
        </button>
      : null;

    return (
      <div className="app" data-screen-label={`Screen · ${route}`}>
        <Sidebar
          route={route} setRoute={setRoute}
          bookings={userBookings.bookings}
          open={sidebarOpen} onClose={closeSidebar}
          user={auth.user} onLogout={auth.logout}
          onSignIn={() => setRoute('auth')}
        />
        <div className={`sidebar-scrim ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}/>
        <main className="main" data-screen-label={route}>
          <Topbar crumbs={crumbs} action={topAction} onMenu={openSidebar}/>
          {route === 'discover' && (
            <DiscoverScreen
              setRoute={setRoute}
              setSelectedVenue={venueSel.setSelectedVenue}
              venues={venues}
            />
          )}
          {route === 'venue' && (
            <VenueScreen
              venueId={venueSel.selectedVenue || (venues[0] && venues[0].id)}
              setRoute={setRoute}
              setDraft={venueSel.setDraft}
              venues={venues}
            />
          )}
          {route === 'book' && (
            <BookScreen
              draft={venueSel.draft}
              setRoute={setRoute}
              venues={venues}
              user={auth.user}
              submitBooking={userBookings.submitBooking}
            />
          )}
          {route === 'confirm' && (
            <ConfirmScreen
              booking={userBookings.completedBooking}
              setRoute={setRoute}
              venues={venues}
            />
          )}
          {route === 'bookings' && (
            <BookingsScreen
              bookings={userBookings.bookings}
              loading={userBookings.loading}
              error={userBookings.error}
              refresh={userBookings.refresh}
              setRoute={setRoute}
              venues={venues}
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
