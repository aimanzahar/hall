// views/App.jsx — Composition root. Calls controllers, derives crumbs, routes
// the current screen. No domain state lives here.
(function () {
  const C = HB.Controllers;
  const { VENUES, getById } = HB.Models.Venues;
  const {
    Icon, Sidebar, Topbar, ChatFab, TweaksPanel,
    HomeScreen, DiscoverScreen, VenueScreen, BookScreen,
    ConfirmScreen, BookingsScreen, CheckinScreen,
  } = HB.Views;

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
    })[route] || ['HallBook'];
  }

  function App({ tweakDefaults }) {
    const { route, setRoute } = C.useRouter();
    const venueSel = C.useVenueSelection('v1');
    const bookingsCtl = C.useBookings();
    const tweaksCtl = C.useTweaks(tweakDefaults);
    const { sidebarOpen, openSidebar, closeSidebar } = C.useSidebar();

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
          bookings={bookingsCtl.bookings}
          open={sidebarOpen} onClose={closeSidebar}
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
          {route === 'book' && (
            <BookScreen
              draft={venueSel.draft}
              setRoute={setRoute}
              setCompletedBooking={bookingsCtl.onBookingCreated}
            />
          )}
          {route === 'confirm' && (
            <ConfirmScreen
              booking={bookingsCtl.completedBooking}
              setRoute={setRoute}
            />
          )}
          {route === 'bookings' && (
            <BookingsScreen
              bookings={bookingsCtl.bookings}
              setRoute={setRoute}
              setActiveBookingId={bookingsCtl.setActiveBookingId}
            />
          )}
          {route === 'checkin' && (
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
