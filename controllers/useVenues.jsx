// controllers/useVenues.jsx — Loads the venue catalog from PocketBase once on
// mount. Returns `{ venues, loading, error, refresh }`. Screens should read
// venues from here instead of importing a static list.
(function () {
  const { useState, useEffect, useCallback } = React;
  const V = HB.Models.Venues;

  function useVenues() {
    const [venues, setVenues] = useState(V.FALLBACK);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await V.fetchAll();
        if (Array.isArray(list) && list.length) setVenues(list);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { venues, loading, error, refresh };
  }

  HB.Controllers.useVenues = useVenues;
})();
