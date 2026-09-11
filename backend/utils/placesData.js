// Curated Places & Activities Directory with filtering & distance calculations
// Supports local recommendations, outdoor/indoor activities, free vs paid, and interest matching

export const CURATED_PLACES_AND_ACTIVITIES = [
  {
    id: 'place_1',
    name: 'Serenity Botanical Gardens & Park',
    category: 'park',
    description: 'A peaceful community park featuring shaded walking trails, pond benches, and lush greenery ideal for decompressing.',
    address: '42 Greenway Blvd (Downtown Area)',
    cost: 'free',
    isFree: true,
    isOutdoor: true,
    estimatedDuration: '45-90 min',
    tags: ['nature', 'walking', 'fresh-air', 'peaceful', 'mindfulness'],
    recommendedFor: ['low physical activity', 'high screen time', 'stress relief'],
    distanceKm: 1.2,
    rating: 4.8,
    website: 'https://maps.google.com/?q=Botanical+Gardens'
  },
  {
    id: 'place_2',
    name: 'Metropolitan Central Library & Quiet Study Pods',
    category: 'library',
    description: 'Public library with quiet reading lounges, free Wi-Fi, audiobooks, and community reading circles.',
    address: '100 Heritage Plaza, 3rd Floor',
    cost: 'free',
    isFree: true,
    isOutdoor: false,
    estimatedDuration: '1-3 hours',
    tags: ['reading', 'learning', 'study', 'focus', 'quiet'],
    recommendedFor: ['focus', 'change of environment', 'learning'],
    distanceKm: 2.1,
    rating: 4.7,
    website: 'https://maps.google.com/?q=Central+Library'
  },
  {
    id: 'place_3',
    name: 'The Artisan Roast & Reading Cafe',
    category: 'cafe',
    description: 'Cozy neighborhood coffee shop with natural lighting, acoustic background music, and communal tables welcoming remote work.',
    address: '15 Maple St, Arts District',
    cost: '$',
    isFree: false,
    isOutdoor: false,
    estimatedDuration: '1-2 hours',
    tags: ['coffee', 'social', 'study', 'relaxed', 'people-watching'],
    recommendedFor: ['low social interaction', 'working from a different environment'],
    distanceKm: 0.8,
    rating: 4.6,
    website: 'https://maps.google.com/?q=Coffee+Shop'
  },
  {
    id: 'place_4',
    name: 'Community Wellness Center & Bouldering Gym',
    category: 'gym',
    description: 'Beginner-friendly climbing gym and fitness studio offering day passes, open yoga, and functional fitness areas.',
    address: '88 Summit Ave, North Quarter',
    cost: '$$',
    isFree: false,
    isOutdoor: false,
    estimatedDuration: '1-2 hours',
    tags: ['fitness', 'bouldering', 'exercise', 'energy', 'community'],
    recommendedFor: ['physical activity', 'stress relief', 'active social'],
    distanceKm: 3.4,
    rating: 4.9,
    website: 'https://maps.google.com/?q=Climbing+Gym'
  },
  {
    id: 'place_5',
    name: 'City MakerSpace & Creative Pottery Workshop',
    category: 'workshop',
    description: 'Interactive open workshop space where community members learn hands-on ceramics, painting, and woodwork.',
    address: '220 Industrial Parkway, Studio 4',
    cost: '$$',
    isFree: false,
    isOutdoor: false,
    estimatedDuration: '2 hours',
    tags: ['creativity', 'hands-on', 'art', 'mindful', 'hobby'],
    recommendedFor: ['creative expression', 'meeting people', 'new hobby'],
    distanceKm: 4.0,
    rating: 4.8,
    website: 'https://maps.google.com/?q=Makerspace+Workshop'
  },
  {
    id: 'place_6',
    name: 'Riverside Community Recreation Trail',
    category: 'sports',
    description: 'Paved multi-use trail along the river with bike rentals, outdoor fitness equipment, and scenic vistas.',
    address: 'Riverside Park Access Point B',
    cost: 'free',
    isFree: true,
    isOutdoor: true,
    estimatedDuration: '30-60 min',
    tags: ['running', 'cycling', 'walking', 'river', 'cardio'],
    recommendedFor: ['cardio', 'sunlight', 'low physical activity'],
    distanceKm: 1.5,
    rating: 4.7,
    website: 'https://maps.google.com/?q=Riverside+Trail'
  },
  {
    id: 'place_7',
    name: 'Historic Book Haven & Independent Bookshop',
    category: 'bookstore',
    description: 'Two-story indie bookstore holding weekly book clubs, author readings, and quiet browsing nooks.',
    address: '54 Elm Street',
    cost: 'free',
    isFree: true,
    isOutdoor: false,
    estimatedDuration: '45-90 min',
    tags: ['books', 'reading', 'browsing', 'calm', 'culture'],
    recommendedFor: ['mindfulness', 'quiet discovery', 'unplugging'],
    distanceKm: 1.8,
    rating: 4.9,
    website: 'https://maps.google.com/?q=Bookstore'
  },
  {
    id: 'place_8',
    name: 'Modern Contemporary Art Museum',
    category: 'museum',
    description: 'Inspiring contemporary galleries featuring rotating exhibits, sculpture courtyard, and peaceful reflection benches.',
    address: '300 Museum Way, Cultural District',
    cost: '$',
    isFree: false,
    isOutdoor: false,
    estimatedDuration: '1.5-2.5 hours',
    tags: ['art', 'culture', 'inspiration', 'visual', 'calm'],
    recommendedFor: ['inspiration', 'walking', 'mental refresh'],
    distanceKm: 3.2,
    rating: 4.6,
    website: 'https://maps.google.com/?q=Art+Museum'
  },
  {
    id: 'place_9',
    name: 'Weekend Farmers & Makers Market',
    category: 'event',
    description: 'Vibrant local open-air market with local produce, artisanal baked goods, live street music, and community stalls.',
    address: 'Civic Square, Pavilion Plaza',
    cost: 'free',
    isFree: true,
    isOutdoor: true,
    estimatedDuration: '1-2 hours',
    tags: ['market', 'community', 'social', 'local', 'food'],
    recommendedFor: ['low social interaction', 'weekend outdoor activity'],
    distanceKm: 2.5,
    rating: 4.8,
    website: 'https://maps.google.com/?q=Farmers+Market'
  }
];

/**
 * Filter activities by category, cost, indoor/outdoor, and max distance.
 */
export const filterPlacesAndActivities = ({
  category,
  cost,
  indoorOutdoor,
  maxDistanceKm,
  search
} = {}) => {
  return CURATED_PLACES_AND_ACTIVITIES.filter(item => {
    if (category && category !== 'all' && item.category !== category) return false;
    if (cost === 'free' && !item.isFree) return false;
    if (cost === 'paid' && item.isFree) return false;
    if (indoorOutdoor === 'indoor' && item.isOutdoor) return false;
    if (indoorOutdoor === 'outdoor' && !item.isOutdoor) return false;
    if (maxDistanceKm && item.distanceKm > Number(maxDistanceKm)) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = item.name.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q) ||
                    item.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
};
