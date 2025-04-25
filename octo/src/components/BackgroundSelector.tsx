'use client'
import { useAppContext } from '../context/AppContext'
import { useEffect, useState } from 'react'

type ScenarioType = 'nature' | 'urban' | 'space' | 'beach'

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY!;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

const BackgroundSelector = () => {
  const { background, setBackground } = useAppContext();
  const [scenario, setScenario] = useState<ScenarioType>('nature');
  const [loading, setLoading] = useState(false);

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
      fetchImageFromPexels(scenario);
    }
  }, [scenario, setBackground]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Background Scenario</h2>

      <select
        value={scenario}
        onChange={(e) => {
          const value = e.target.value as ScenarioType;
          setScenario(value);
          fetchImageFromPexels(value);
        }}
        className="w-full mb-4 bg-black/20 text-white p-2 rounded-lg"
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
  );
};

export default BackgroundSelector;
