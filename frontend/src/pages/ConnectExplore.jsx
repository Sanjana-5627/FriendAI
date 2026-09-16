import React, { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';
import { 
  Compass, 
  MapPin, 
  Search, 
  Filter, 
  Coffee, 
  Trees, 
  BookOpen, 
  Dumbbell, 
  Palette, 
  Users, 
  Plus, 
  Check, 
  PhoneCall,
  Sun,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const ConnectExplore = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [indoorOutdoor, setIndoorOutdoor] = useState('all');
  const [search, setSearch] = useState('');
  const [visitDays, setVisitDays] = useState({});
  const [addedTasks, setAddedTasks] = useState(new Set());

  const categories = [
    { id: 'all', label: 'All Activities', icon: Compass },
    { id: 'park', label: 'Parks & Nature', icon: Trees },
    { id: 'cafe', label: 'Cafes & Study', icon: Coffee },
    { id: 'library', label: 'Libraries', icon: BookOpen },
    { id: 'gym', label: 'Sports & Gyms', icon: Dumbbell },
    { id: 'workshop', label: 'Creative Workshops', icon: Palette },
    { id: 'bookstore', label: 'Bookstores', icon: BookOpen },
    { id: 'event', label: 'Markets & Events', icon: Users },
  ];

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const res = await apiHelpers.getPlacesAndActivities({
        category: category !== 'all' ? category : undefined,
        cost: costFilter !== 'all' ? costFilter : undefined,
        minCost: minCost !== '' ? minCost : undefined,
        maxCost: maxCost !== '' ? maxCost : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
        indoorOutdoor: indoorOutdoor !== 'all' ? indoorOutdoor : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setPlaces(res.data || []);
    } catch (err) {
      console.error('Fetch places error:', err);
      toast.error('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [category, costFilter, minCost, maxCost, selectedLocation, indoorOutdoor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  const calculateTargetDate = (dayChoice) => {
    const d = new Date();
    if (dayChoice === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (dayChoice === 'this_weekend') {
      const day = d.getDay();
      const distToSaturday = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + distToSaturday);
    } else if (dayChoice === 'next_week') {
      d.setDate(d.getDate() + 7);
    }
    return d.toISOString().split('T')[0];
  };

  const handleScheduleVisit = async (place) => {
    const choice = visitDays[place.id] || 'today';
    const targetDate = calculateTargetDate(choice);
    const dayLabel = choice === 'today' ? 'Today' : (choice === 'tomorrow' ? 'Tomorrow' : (choice === 'this_weekend' ? 'This Weekend' : 'Next Week'));

    try {
      await apiHelpers.createTask({
        title: `Explore: ${place.name} (${place.category})`,
        description: `Scheduled for ${dayLabel}. Address: ${place.address} (${place.neighborhood || 'Local Area'}). Est. Cost: ${place.costAmount === 0 ? 'Free' : `$${place.costAmount}`}.`,
        priority: 'medium',
        category: 'social',
        due_date: targetDate
      });
      setAddedTasks(prev => new Set(prev).add(place.id));
      toast.success(`✓ Scheduled visit to ${place.name} for ${dayLabel}!`);
    } catch (err) {
      toast.error('Failed to schedule visit');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Monochromatic Editorial Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
            Anti-Isolation & Exploration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Connect & Explore
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Break through indoor isolation and digital fatigue. Discover quiet green spaces, welcoming cafes, and low-pressure community spots to reset your relationship with the real world.
          </p>
        </div>
      </div>

      {/* Micro-Reconnections Strip (Monochromatic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-start space-x-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg shrink-0">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">15-Min Daylight Walk</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Step outside for natural light and open air. Resets circadian rhythm and lowers tension.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-start space-x-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Quick Voice Check-in</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Send a 60-second voice note or phone a friend. Low pressure, instant human resonance.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-start space-x-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Ambient Community</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Bring a book or notebook to a quiet cafe or library. Work alongside gentle ambient presence.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search places by name, neighborhood, or activity..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </form>

          {/* Filter Bar Controls */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Location Selector */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none"
            >
              <option value="all">📍 All Locations</option>
              <option value="Downtown">Downtown</option>
              <option value="Arts District">Arts District</option>
              <option value="North Quarter">North Quarter</option>
              <option value="Riverside">Riverside</option>
              <option value="Midtown">Midtown</option>
              <option value="Cultural District">Cultural District</option>
              <option value="Civic Square">Civic Square</option>
            </select>

            {/* Min and Max Cost Inputs */}
            <div className="flex items-center space-x-1.5 bg-stone-50 dark:bg-stone-950 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800">
              <span className="text-stone-400 font-medium">Cost:</span>
              <span className="text-stone-500">$</span>
              <input
                type="number"
                min="0"
                value={minCost}
                onChange={(e) => setMinCost(e.target.value)}
                placeholder="Min"
                className="w-11 bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none text-xs"
              />
              <span className="text-stone-400">–</span>
              <span className="text-stone-500">$</span>
              <input
                type="number"
                min="0"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
                placeholder="Max"
                className="w-11 bg-transparent text-stone-900 dark:text-stone-100 focus:outline-none text-xs"
              />
            </div>

            {/* Cost Type Quick Selector */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none"
            >
              <option value="all">Free & Paid</option>
              <option value="free">Free Activities</option>
              <option value="paid">Paid Activities</option>
            </select>

            {/* Environment Selector */}
            <select
              value={indoorOutdoor}
              onChange={(e) => setIndoorOutdoor(e.target.value)}
              className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none"
            >
              <option value="all">Indoor & Outdoor</option>
              <option value="outdoor">Outdoor Nature</option>
              <option value="indoor">Indoor Spaces</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/25'
                    : 'bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <LoadingSpinner text="Searching curated local activities..." />
      ) : places.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-8">
          <Compass className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">No places match your filters</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
            Try adjusting your cost range, location, or category to discover nearby spots.
          </p>
          <button
            onClick={() => { setCategory('all'); setCostFilter('all'); setMinCost(''); setMaxCost(''); setSelectedLocation('all'); setIndoorOutdoor('all'); setSearch(''); }}
            className="mt-3 btn-secondary text-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => {
            const isAdded = addedTasks.has(place.id);
            const costBadge = place.costAmount === 0 ? 'Free Entry' : `Est. $${place.costAmount}`;
            return (
              <div
                key={place.id}
                className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400/80 dark:hover:border-amber-600/80 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="badge-happy text-[10px]">
                        {place.category}
                      </span>
                      {place.neighborhood && (
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded font-medium">
                          {place.neighborhood}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      place.costAmount === 0
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {costBadge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {place.name}
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>

                  <div className="flex items-center space-x-1.5 text-[11px] text-stone-400 pt-1">
                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{place.address}</span>
                  </div>
                </div>

                {/* Visit Day & Scheduling Section */}
                <div className="space-y-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-stone-400">
                      Approx. {place.distanceKm || '1.2'} km away
                    </span>
                    <a
                      href={place.website || `https://maps.google.com/?q=${encodeURIComponent(place.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Map View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* Visit Day Choice & Action Button */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center space-x-1 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <select
                        value={visitDays[place.id] || 'today'}
                        onChange={(e) => setVisitDays(prev => ({ ...prev, [place.id]: e.target.value }))}
                        className="bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 focus:outline-none"
                      >
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this_weekend">Weekend</option>
                        <option value="next_week">Next Week</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleScheduleVisit(place)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        isAdded
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 cursor-default'
                          : 'btn-primary'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Scheduled ✓</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Schedule Visit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default ConnectExplore;
