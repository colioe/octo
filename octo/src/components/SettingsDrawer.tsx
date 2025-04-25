'use client';
import { motion } from 'framer-motion'
import { useAppContext } from '../context/AppContext'
import { useState, useEffect } from 'react'

type ScenarioType = 'nature' | 'urban' | 'space' | 'beach'

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY!;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

const SettingsDrawer = ({ isOpen, onClose }) => {
  const { setBackground, searchEngine, setSearchEngine } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<ScenarioType>('nature');

  const fetchImageFromPexels = async (query: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${PEXELS_API_URL}?query=${query}&per_page=15`, {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      const data = await res.json();
      const photos = data.photos;

      if (photos && photos.length > 0) {
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        const imageUrl = randomPhoto.src.large2x || randomPhoto.src.original;
        setBackground(imageUrl);
        localStorage.setItem('user-bg', imageUrl); // 🔥 Save to localStorage
      }
    } catch (error) {
      console.error('Error fetching from Pexels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedBg = localStorage.getItem('user-bg');
    if (savedBg) {
      setBackground(savedBg);
    } else {
      fetchImageFromPexels(scenario); // Fetch initial image on mount
    }
  }, [scenario, setBackground]);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed top-0 right-0 h-full w-80 bg-gray-900 p-6 shadow-lg z-50"
        >
          <button onClick={onClose} className="text-white mb-4">Close</button>
          <h2 className="text-white text-lg font-semibold mb-4">Customize</h2>
          <div className="space-y-4">
            {/* Dynamic Background Selection */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-white text-sm mb-2">Background Scenario</h3>
              <select
                value={scenario}
                onChange={(e) => {
                  const value = e.target.value as ScenarioType;
                  setScenario(value);
                  fetchImageFromPexels(value);
                }}
                className="w-full bg-gray-800 text-white p-2 rounded-lg"
              >
                <option value="nature">Nature</option>
                <option value="urban">Urban</option>
                <option value="space">Space</option>
                <option value="beach">Beach</option>
              </select>

              <button
                onClick={() => fetchImageFromPexels(scenario)}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-all"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Background'}
              </button>
            </div>

            {/* Search Engine Selection */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-white text-sm mb-2">Select Search Engine</h3>
              <div className="flex flex-wrap gap-2">
                {['google', 'bing', 'duckduckgo'].map((engine) => {
                  const active = searchEngine === engine;
                  return (
                    <button
                      key={engine}
                      type="button"
                      onClick={() => setSearchEngine(engine)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {engine.charAt(0).toUpperCase() + engine.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

export default SettingsDrawer;
