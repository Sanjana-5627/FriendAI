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
  const [indoorOutdoor, setIndoorOutdoor] = useState('all');
  const [search, setSearch] = useState('');
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
  }, [category, costFilter, indoorOutdoor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlaces();
  };

  const handleAddPlaceAsTask = async (place) => {
    try {
      await apiHelpers.createTask({
        title: `Visit ${place.name} (${place.category})`,
        description: `${place.description} Address: ${place.address}`,
        priority: 'medium',
        category: 'social'
      });
      setAddedTasks(prev => new Set(prev).add(place.id));
      toast.success(`✓ Added "${place.name}" to your tasks!`);
    } catch (err) {
      toast.error('Failed to add to tasks');
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

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none"
            >
              <option value="all">All Costs</option>
              <option value="free">Free Activities</option>
              <option value="paid">Paid / Commercial</option>
            </select>

            <select
              value={indoorOutdoor}
              onChange={(e) => setIndoorOutdoor(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs focus:outline-none"
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
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-8">
          <Compass className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No places match your filters</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try resetting your category or search terms to browse available activities.
          </p>
          <button
            onClick={() => { setCategory('all'); setCostFilter('all'); setIndoorOutdoor('all'); setSearch(''); }}
            className="mt-3 btn-secondary text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => {
            const isAdded = addedTasks.has(place.id);
            return (
              <div
                key={place.id}
                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge-mono text-[10px]">
                      {place.category}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {place.cost === 'free' ? 'Free Entry' : 'Paid'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {place.name}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>

                  <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 pt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{place.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400">
                    Approx. {place.distanceKm || '1.2'} km away
                  </span>

                  <button
                    onClick={() => handleAddPlaceAsTask(place)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isAdded
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-default'
                        : 'btn-primary'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Saved to Tasks</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Add as Task</span>
                      </>
                    )}
                  </button>
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
