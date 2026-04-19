// models/venues.model.jsx — Venues seed data + pure query operations. No React.
(function () {
  const VENUES = [
    {
      id: 'v1',
      name: 'The Atrium',
      district: 'Downtown · Riverside',
      capacity: 180,
      priceHour: 240,
      rating: 4.9,
      reviews: 312,
      tags: ['Wedding', 'Gala', 'Corporate'],
      available: 'now',
      nextGap: 'Free until 11pm tonight',
      coord: [38, 42],
      hero: 'warm',
      size: '4,200 sqft',
      ceiling: '18 ft',
      addons: ['Catering', 'AV Package', 'Floral'],
    },
    {
      id: 'v2',
      name: 'Loft 47',
      district: 'Arts District',
      capacity: 90,
      priceHour: 165,
      rating: 4.8,
      reviews: 204,
      tags: ['Birthday', 'Workshop'],
      available: 'soon',
      nextGap: 'Opens at 6:00 PM',
      coord: [62, 28],
      hero: 'cool',
      size: '2,100 sqft',
      ceiling: '14 ft',
      addons: ['Catering', 'DJ Booth'],
    },
    {
      id: 'v3',
      name: 'Garden Pavilion',
      district: 'North Park',
      capacity: 240,
      priceHour: 320,
      rating: 4.9,
      reviews: 488,
      tags: ['Wedding', 'Reception'],
      available: 'now',
      nextGap: 'Free 2h remaining',
      coord: [25, 68],
      hero: 'sage',
      size: '5,800 sqft',
      ceiling: 'Outdoor',
      addons: ['Catering', 'Tent', 'Heaters'],
    },
    {
      id: 'v4',
      name: 'The Forum',
      district: 'Midtown',
      capacity: 320,
      priceHour: 410,
      rating: 4.7,
      reviews: 176,
      tags: ['Corporate', 'Conference'],
      available: 'booked',
      nextGap: 'Next open Fri 8:00 AM',
      coord: [72, 58],
      hero: 'ink',
      size: '7,400 sqft',
      ceiling: '22 ft',
      addons: ['AV Package', 'Stage'],
    },
    {
      id: 'v5',
      name: 'Cedar Hall',
      district: 'Westside',
      capacity: 120,
      priceHour: 195,
      rating: 4.8,
      reviews: 267,
      tags: ['Birthday', 'Anniversary'],
      available: 'now',
      nextGap: 'Free until 2:00 AM',
      coord: [52, 76],
      hero: 'amber',
      size: '2,900 sqft',
      ceiling: '16 ft',
      addons: ['Catering', 'Photo Booth'],
    },
    {
      id: 'v6',
      name: 'Marble Room',
      district: 'Financial',
      capacity: 60,
      priceHour: 140,
      rating: 4.6,
      reviews: 98,
      tags: ['Meeting', 'Intimate'],
      available: 'soon',
      nextGap: 'Opens at 9:30 PM',
      coord: [82, 38],
      hero: 'stone',
      size: '1,400 sqft',
      ceiling: '12 ft',
      addons: ['AV Package'],
    },
  ];

  function getById(id, list = VENUES) {
    return list.find(v => v.id === id) || list[0];
  }

  // filter key: 'all' | 'available' | 'small' | 'large'
  function byFilter(list, filter) {
    return list.filter(v => {
      if (filter === 'available') return v.available === 'now';
      if (filter === 'small') return v.capacity < 100;
      if (filter === 'large') return v.capacity >= 150;
      return true;
    });
  }

  function availableNow(list) {
    return list.filter(v => v.available === 'now');
  }

  HB.Models.Venues = { VENUES, getById, byFilter, availableNow };
})();
