// controllers/useBookings.jsx — Owns the bookings list + active-id + last-completed.
// Actions call into HB.Models.Bookings for pure data transforms.
(function () {
  const { useState } = React;
  const M = HB.Models.Bookings;

  function useBookings() {
    const [bookings, setBookings] = useState(M.BOOKINGS);
    const [completedBooking, setCompletedBooking] = useState(null);
    const [activeBookingId, setActiveBookingId] = useState(
      () => M.firstActiveOrFirst(M.BOOKINGS)
    );

    // Caller (BookScreen) builds a draft record via Models.Bookings.make; we
    // append it and stash it as "just completed" for the confirmation screen.
    const onBookingCreated = (draft) => {
      setCompletedBooking(draft);
      setBookings(list => M.append(list, draft));
    };

    return {
      bookings,
      completedBooking,
      activeBookingId,
      setActiveBookingId,
      onBookingCreated,
    };
  }

  HB.Controllers.useBookings = useBookings;
})();
