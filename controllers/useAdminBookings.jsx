// controllers/useAdminBookings.jsx — Admin-only bookings list with approve/reject.
// PocketBase enforces access via the `admins` collection rule; this hook just
// wires the controller-state + actions.
(function () {
  const { useState, useEffect, useCallback } = React;
  const M = HB.Models.Bookings;

  function useAdminBookings(admin) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
      if (!admin) { setBookings([]); return; }
      setLoading(true); setError(null);
      try {
        const list = await M.listForAuth();
        setBookings(list);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }, [admin]);

    useEffect(() => { refresh(); }, [refresh]);

    const approve = useCallback(async (id, note) => {
      const updated = await M.updateStatus(id, 'approved', note || '');
      setBookings(list => list.map(b => b.id === id ? updated : b));
    }, []);

    const reject = useCallback(async (id, note) => {
      const updated = await M.updateStatus(id, 'rejected', note || '');
      setBookings(list => list.map(b => b.id === id ? updated : b));
    }, []);

    const setPending = useCallback(async (id, note) => {
      const updated = await M.updateStatus(id, 'pending', note || '');
      setBookings(list => list.map(b => b.id === id ? updated : b));
    }, []);

    return { bookings, loading, error, refresh, approve, reject, setPending };
  }

  HB.Controllers.useAdminBookings = useAdminBookings;
})();
