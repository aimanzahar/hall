// models/venues.model.jsx — Venue data: PocketBase fetcher + pure query ops.
// Seed data mirrors the tools/venues.seed.json payload so the UI still renders
// something sensible when PocketBase is unreachable.
(function () {
  function getPB() { return HB.Models.Auth && HB.Models.Auth.pb; }

  // Offline fallback. Keys match the PocketBase `venues` collection; `id` uses
  // the slug so links remain stable even without a live fetch.
  const FALLBACK = [
    { id: 'atrium-klcc',            name: 'The Atrium KLCC',         district: 'KLCC · Kuala Lumpur',        state: 'Kuala Lumpur', capacity: 220, priceHour: 480, rating: 4.9, reviews: 312, tags: ['Wedding','Gala','Corporate'],    available: 'now',    nextGap: 'Free until 11:00 PM tonight', coord: [38,42], hero: 'warm',  size: '4,200 sqft',      ceiling: '18 ft',  addons: ['Catering','AV Package','Floral'],      description: 'A glass-roofed atrium at the foot of the Twin Towers.' },
    { id: 'dewan-seri-selangor',    name: 'Dewan Seri Selangor',     district: 'Shah Alam · Selangor',        state: 'Selangor',     capacity: 450, priceHour: 320, rating: 4.8, reviews: 488, tags: ['Wedding','Reception','Community'], available: 'now',    nextGap: 'Free this weekend',            coord: [25,68], hero: 'sage',  size: '7,800 sqft',      ceiling: '24 ft',  addons: ['Catering','Stage','Uplighting'],       description: 'The grande dame of Malay weddings in Shah Alam.' },
    { id: 'penang-heritage-hall',   name: 'Penang Heritage Hall',    district: 'George Town · Penang',        state: 'Penang',       capacity: 140, priceHour: 280, rating: 4.9, reviews: 204, tags: ['Wedding','Cultural','Workshop'],   available: 'soon',   nextGap: 'Opens at 6:00 PM',             coord: [62,28], hero: 'cool',  size: '2,600 sqft',      ceiling: '14 ft',  addons: ['Catering','Audio','Heritage tour'],    description: 'A restored pre-war shophouse just off Armenian Street.' },
    { id: 'johor-premier-ballroom', name: 'Johor Premier Ballroom',  district: 'Iskandar Puteri · Johor',     state: 'Johor',        capacity: 380, priceHour: 420, rating: 4.7, reviews: 176, tags: ['Corporate','Conference','Gala'],   available: 'booked', nextGap: 'Next open Fri 8:00 AM',        coord: [72,58], hero: 'ink',   size: '6,400 sqft',      ceiling: '22 ft',  addons: ['AV Package','Stage','Green room'],     description: 'A column-free ballroom on the 12th floor, overlooking the Straits.' },
    { id: 'sabah-garden-pavilion',  name: 'Sabah Garden Pavilion',   district: 'Likas Bay · Kota Kinabalu',   state: 'Sabah',        capacity: 260, priceHour: 560, rating: 4.9, reviews: 267, tags: ['Wedding','Reception','Outdoor'],   available: 'now',    nextGap: 'Free until 2:00 AM',           coord: [52,76], hero: 'amber', size: '5,800 sqft lawn', ceiling: 'Outdoor', addons: ['Catering','Tent','String lights'],     description: 'A seaside pavilion with unbroken sunset views over Likas Bay.' },
    { id: 'kuching-riverside-loft', name: 'Kuching Riverside Loft',  district: 'Waterfront · Kuching',        state: 'Sarawak',      capacity: 90,  priceHour: 220, rating: 4.6, reviews: 98,  tags: ['Meeting','Birthday','Workshop'],   available: 'soon',   nextGap: 'Opens at 9:30 PM',             coord: [82,38], hero: 'stone', size: '1,600 sqft',      ceiling: '12 ft',  addons: ['AV Package','Coffee bar'],             description: 'An industrial loft above the Kuching waterfront promenade.' },
  ];

  // Normalises a PocketBase record into the shape the UI expects.
  function fromRecord(r) {
    return {
      id: r.slug || r.id,          // use slug as stable UI id
      _id: r.id,                   // raw PB id (needed when creating bookings)
      name: r.name,
      district: r.district,
      state: r.state,
      capacity: r.capacity,
      priceHour: r.priceHour,
      rating: r.rating,
      reviews: r.reviews,
      tags: Array.isArray(r.tags) ? r.tags : [],
      available: r.available,
      nextGap: r.nextGap,
      coord: Array.isArray(r.coord) ? r.coord : [50, 50],
      hero: r.hero || 'warm',
      size: r.size,
      ceiling: r.ceiling,
      addons: Array.isArray(r.addons) ? r.addons : [],
      description: r.description,
      image: r.image,              // filename; resolved via pbImageUrl
      collectionId: r.collectionId,
      recordId: r.id,
    };
  }

  async function fetchAll() {
    const pb = getPB();
    if (!pb) return FALLBACK;
    const res = await pb.collection('venues').getFullList({ sort: 'name' });
    return res.map(fromRecord);
  }

  function pbImageUrl(venue, thumb = '') {
    if (!venue || !venue.image || !venue.collectionId || !venue.recordId) return null;
    const base = HB.Models.Auth ? HB.Models.Auth.PB_URL : '';
    const suffix = thumb ? `?thumb=${thumb}` : '';
    return `${base}/api/files/${venue.collectionId}/${venue.recordId}/${venue.image}${suffix}`;
  }

  function getById(id, list) {
    if (!id || !list) return list && list[0];
    return list.find(v => v.id === id || v._id === id) || list[0];
  }

  function byFilter(list, filter) {
    return list.filter(v => {
      if (filter === 'available') return v.available === 'now';
      if (filter === 'small') return v.capacity < 120;
      if (filter === 'large') return v.capacity >= 250;
      return true;
    });
  }

  function availableNow(list) {
    return list.filter(v => v.available === 'now');
  }

  HB.Models.Venues = { FALLBACK, fetchAll, pbImageUrl, getById, byFilter, availableNow };
})();
