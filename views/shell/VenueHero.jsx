// views/shell/VenueHero.jsx — Renders a venue's hero image if uploaded to
// PocketBase; falls back to the colour placeholder so the UI stays filled in
// when PB is unreachable (dev / offline).
(function () {
  function VenueHero({ venue, className = '', style = {}, children, overlay }) {
    const url = HB.Models.Venues.pbImageUrl(venue);
    if (url) {
      return (
        <div
          className={`venue-hero-img ${className}`}
          style={{ backgroundImage: `url("${url}")`, ...style }}
        >
          {overlay}
          {children}
        </div>
      );
    }
    return (
      <div className={`ph ${venue.hero || 'warm'} ${className}`} style={style}>
        <div className="ph-label">{(venue.name || '').toUpperCase()}</div>
        {overlay}
        {children}
      </div>
    );
  }

  HB.Views.VenueHero = VenueHero;
})();
