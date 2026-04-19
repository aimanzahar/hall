// controllers/useVenueSelection.jsx — Cross-screen venue & booking-draft state.
// `selectedVenue` drives the venue detail screen; `draft` carries Calendar →
// BookScreen selection (day/hours).
(function () {
  const { useState } = React;

  function useVenueSelection(defaultVenueId = 'v1') {
    const [selectedVenue, setSelectedVenue] = useState(defaultVenueId);
    const [draft, setDraft] = useState(null);
    return { selectedVenue, setSelectedVenue, draft, setDraft };
  }

  HB.Controllers.useVenueSelection = useVenueSelection;
})();
