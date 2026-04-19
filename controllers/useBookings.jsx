// controllers/useBookings.jsx — Loads the signed-in user's bookings from
// PocketBase, and exposes actions for creating new ones and surfacing the
// just-completed booking to the confirmation screen.
(function () {
  const { useState, useEffect, useCallback } = React;
  const M = HB.Models.Bookings;

  function useBookings(user) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [completedBooking, setCompletedBooking] = useState(null);
    const [activeBookingId, setActiveBookingId] = useState(null);

    const refresh = useCallback(async () => {
      if (!user) { setBookings([]); return; }
      setLoading(true); setError(null);
      try {
        const list = await M.listForAuth();
        setBookings(list);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }, [user]);

    useEffect(() => { refresh(); }, [refresh]);

    // Called by BookScreen after it has built a PocketBase payload. Returns the
    // created record (with status=pending) so the confirmation screen can show it.
    const submitBooking = useCallback(async (payload) => {
      const created = await M.create(payload);
      setCompletedBooking(created);
      setBookings(list => [created, ...list]);
      return created;
    }, []);

    return {
      bookings, loading, error,
      completedBooking, setCompletedBooking,
      activeBookingId, setActiveBookingId,
      refresh, submitBooking,
    };
  }

  HB.Controllers.useBookings = useBookings;
})();
