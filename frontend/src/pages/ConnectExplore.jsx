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
  Sparkles, 
  ExternalLink, 
  Plus, 
  Check, 
  AlertCircle,
  PhoneCall,
  Sun
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

  const handleAddAsTask = async (place) => {
    try {
      await apiHelpers.createTask({
        title: `Visit ${place.name}`,
        description: `${place.description} (${place.address})`,
        priority: 'medium',
        category: 'wellness'
      });
      setAddedTasks(prev => new Set(prev).add(place.id));
      toast.success(`✓ Added "${place.name}" to your wellness tasks!`);
    } catch (err) {
      toast.error('Failed to add to tasks');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anti-Loneliness & Community Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Connect & Explore
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
            Break through indoor isolation and digital fatigue. Discover quiet green spaces, welcoming cafes, community workshops, and activities designed to revitalize your connection with the world.
          </p>
        </div>
      </div>

      {/* Gentle Micro-Actions for Instant Connection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-start space-x-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">15-Min Sunshine Walk</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Step outside for sunlight and open sky. Regulates cortisol and naturally resets mood.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-start space-x-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Quick Check-in Call</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Send a 60-second voice note or call a friend. Low pressure, instant human resonance.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-start space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Change of Scenery</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Take a book or laptop to a nearby cafe or library. Enjoy pleasant ambient community.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        
        {/* Category horizontal scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search and Secondary Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search places, keywords, activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300"
            >
              <option value="all">Cost: All</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid / Tickets</option>
            </select>

            <select
              value={indoorOutdoor}
              onChange={(e) => setIndoorOutdoor(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300"
            >
              <option value="all">Setting: Any</option>
              <option value="outdoor">Outdoor Fresh Air</option>
              <option value="indoor">Indoor Cozy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Places & Activity Directory Cards */}
      {loading ? (
        <LoadingSpinner text="Searching curated community spots..." />
      ) : places.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No places match your filters</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting the category or search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => {
            const isAdded = addedTasks.has(place.id);
            return (
              <div
                key={place.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      {place.category}
                    </span>
                    <span className={`text-[11px] font-bold ${place.isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                      {place.isFree ? 'Free Access' : place.cost}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                    {place.name}
                  </h3>

                  <div className="flex items-center space-x-1 text-gray-400 text-xs mt-1 mb-2.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{place.address}</span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                    {place.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {place.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">
                    ⏱️ {place.estimatedDuration}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddAsTask(place)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                        isAdded 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 cursor-default'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add Task</span>
                        </>
                      )}
                    </button>

                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
