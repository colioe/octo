'use client';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { FiX, FiRefreshCw, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';

type ScenarioType = 'nature' | 'urban' | 'space' | 'beach' | 'mountains' | 'forest' | 'desert' | 'cityscape' | 'waterfall' | 'sunset';

const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY!;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

// Common stock symbols for user selection
const POPULAR_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'MA',
    'UNH', 'HD', 'PG', 'XOM', 'LLY', 'JNJ', 'BAC', 'AVGO', 'WMT', 'KO',
    'PEP', 'ADBE', 'COST', 'MRK', 'ORCL', 'PFE', 'ABBV', 'CVX', 'DIS', 'CRM',
    'ACN', 'NKE', 'TMO', 'MCD', 'DHR', 'INTC', 'LIN', 'QCOM', 'TXN', 'NEE',
    'AMD', 'UPS', 'IBM', 'PM', 'LOW', 'CAT', 'SBUX', 'MS', 'GS', 'GE',
    'AMAT', 'BLK', 'AMGN', 'ISRG', 'VRTX', 'LMT', 'CI', 'NOW', 'PLD', 'ADI',
    'CB', 'MDT', 'DE', 'REGN', 'BA', 'SYK', 'ZTS', 'ADP', 'T', 'BKNG',
    'ELV', 'MO', 'AXP', 'TJX', 'SPGI', 'ETN', 'MMC', 'WM', 'APD', 'FISV',
    'SCHW', 'GILD', 'HUM', 'FDX', 'CSCO', 'ROST', 'GM', 'PSX', 'GD', 'MU',
    'CL', 'BIIB', 'EW', 'ITW', 'SO', 'DUK', 'C', 'TRV', 'EOG', 'ILMN',
    'BMY', 'PGR', 'HCA', 'AEP', 'NOC', 'AFL', 'BSX', 'EXC', 'SPG', 'ALL',
    'TGT', 'MAR', 'KMB', 'EMR', 'SLB', 'F', 'ECL', 'TEL', 'MCK', 'HPQ',
    'D', 'A', 'WBA', 'VLO', 'PCAR', 'KMI', 'PAYX', 'HAL', 'WELL', 'ORLY',
    'DOW', 'CNC', 'AZO', 'NEM', 'WMB', 'XEL', 'SRE', 'CTAS', 'STZ', 'DVN',
    'CTSH', 'PRU', 'LHX', 'CMG', 'CARR', 'OTIS', 'DFS', 'MTD', 'KR', 'TDG',
    'FANG', 'NUE', 'FTNT', 'PPG', 'O', 'MSI', 'APH', 'CHD', 'DG', 'DLR',
    'EBAY', 'PH', 'RSG', 'VRSK', 'HIG', 'KEYS', 'PWR', 'ROK', 'BKR', 'AVB',
    'ANET', 'HES', 'YUM', 'LDOS', 'TSCO', 'ETR', 'CAH', 'FAST', 'MLM', 'BBY',
    'AEE', 'CNP', 'BAX', 'CMS', 'CE', 'GLW', 'ZBRA', 'CF', 'VFC', 'BR',
    'AES', 'PEG', 'BALL', 'NRG', 'STE', 'TYL', 'TXT', 'INCY', 'WRB', 'AKAM',
    'RCL', 'UAL', 'LUV', 'DAL', 'AAL', 'CHRW', 'L', 'MTB', 'HBAN', 'USB',
    'PNC', 'FITB', 'CFG', 'RF', 'KEY', 'CMA', 'ALLY', 'ZION'
  ];

interface Drawer {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDrawer: React.FC<Drawer> = ({ isOpen, onClose }) => {
  const { 
    setBackground, 
    searchEngine, 
    setSearchEngine,
    watchlist,
    setWatchlist,
    background,
    notes,
    setNotes
  } = useAppContext();
  
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<ScenarioType>('nature');
  const [newStock, setNewStock] = useState('');
  const [localNotes, setLocalNotes] = useState(notes);

  // Load all settings from localStorage on initial render
  useEffect(() => {
    const savedBg = localStorage.getItem('user-bg');
    const savedEngine = localStorage.getItem('search-engine');
    const savedWatchlist = localStorage.getItem('watchlist');
    const savedNotes = localStorage.getItem('notes');
    const savedScenario = localStorage.getItem('background-scenario') as ScenarioType | null;

    if (savedBg) {
      setBackground(savedBg);
    } else {
      // If no background is configured, fetch a default nature scenario
      fetchImageFromPexels('nature');
    }
    
    if (savedEngine) setSearchEngine(savedEngine);
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedNotes) {
      setNotes(savedNotes);
      setLocalNotes(savedNotes);
    }
    if (savedScenario) setScenario(savedScenario);
  }, [setBackground, setSearchEngine, setWatchlist, setNotes]);

  // Save notes to context and localStorage when changed
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotes(localNotes);
      localStorage.setItem('notes', localNotes);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localNotes, setNotes]);

  const fetchImageFromPexels = async (query: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${PEXELS_API_URL}?query=${query}&per_page=20`, {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      const data = await res.json();
      const photos = data.photos;

      if (photos && photos.length > 0) {
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        const imageUrl = randomPhoto.src.original;
        setBackground(imageUrl);
        localStorage.setItem('user-bg', imageUrl);
        localStorage.setItem('background-scenario', query);
      }
    } catch (error) {
      console.error('Error fetching from Pexels:', error);
      // Fallback to a default nature image if API fails
      const fallbackImages = {
        nature: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
        urban: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
        space: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031',
        beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
        desert: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
        cityscape: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
        waterfall: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
        sunset: 'https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6'
      };
      
      const fallbackUrl = fallbackImages[query as keyof typeof fallbackImages] || fallbackImages.nature;
      setBackground(fallbackUrl);
      localStorage.setItem('user-bg', fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = () => {
    if (!newStock || watchlist.includes(newStock.toUpperCase()) || watchlist.length >= 3) return;
    
    const updatedWatchlist = [...watchlist, newStock.toUpperCase()];
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    setNewStock('');
  };

  const handleRemoveStock = (stockToRemove: string) => {
    const updatedWatchlist = watchlist.filter(stock => stock !== stockToRemove);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  const handleSearchEngineChange = (engine: string) => {
    setSearchEngine(engine);
    localStorage.setItem('search-engine', engine);
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm p-6 shadow-2xl z-50 overflow-y-auto border-l border-gray-800"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">Settings</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="space-y-8">
            {/* Watchlist Editor */}
            <div>
              <h3 className="text-white text-md font-semibold mb-3 flex items-center gap-2">
                <span>Stock Watchlist</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  Max {watchlist.length}/3
                </span>
              </h3>
              
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Add stock symbol"
                  className="flex-1 bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                />
                <button
                  onClick={handleAddStock}
                  disabled={!newStock || watchlist.length >= 3}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FiPlus size={18} />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                {watchlist.map((stock) => (
                  <div key={stock} className="flex items-center justify-between bg-gray-800/80 p-3 rounded-lg border border-gray-700">
                    <span className="text-white font-medium">{stock}</span>
                    <button
                      onClick={() => handleRemoveStock(stock)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-400 mb-2">Popular stocks:</div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_STOCKS.map((stock) => (
                  <button
                    key={stock}
                    onClick={() => setNewStock(stock)}
                    disabled={watchlist.includes(stock) || watchlist.length >= 3}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      watchlist.includes(stock) 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {stock}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="text-white text-md font-semibold mb-3">Notes</h3>
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                className="w-full bg-gray-800/80 text-white p-3 rounded-lg h-32 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all"
                placeholder="Type your notes here..."
              />
            </div>

            {/* Dynamic Background Selection */}
            <div>
              <h3 className="text-white text-md font-semibold mb-3">Background</h3>
              <div className="flex items-center gap-2 mb-3">
                <select
                  value={scenario}
                  onChange={(e) => {
                    const value = e.target.value as ScenarioType;
                    setScenario(value);
                    fetchImageFromPexels(value);
                  }}
                  className="flex-1 bg-gray-800/80 text-white p-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none transition-all"
                >
                  <option value="nature">Nature</option>
                  <option value="urban">Urban</option>
                  <option value="space">Space</option>
                  <option value="beach">Beach</option>
                  <option value="mountains">Mountains</option>
                  <option value="forest">Forest</option>
                  <option value="desert">Desert</option>
                  <option value="cityscape">Cityscape</option>
                  <option value="waterfall">Waterfall</option>
                  <option value="sunset">Sunset</option>
                </select>
                <button
                  onClick={() => fetchImageFromPexels(scenario)}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? <FiRefreshCw className="animate-spin" size={18} /> : <FiRefreshCw size={18} />}
                </button>
              </div>

              {/* Current Background Preview */}
              {background && (
                <div className="mt-3">
                  <div 
                    className="w-full h-32 bg-cover bg-center rounded-lg border border-gray-700 overflow-hidden relative group"
                    style={{ backgroundImage: `url(${background})` }}
                  >
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                        Current Background
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Engine Selection */}
            <div>
              <h3 className="text-white text-md font-semibold mb-3">Search Engine</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'google', name: 'Google' },
                  { id: 'bing', name: 'Bing' },
                  { id: 'duckduckgo', name: 'DuckDuckGo' }
                ].map((engine) => {
                  const active = searchEngine === engine.id;
                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => handleSearchEngineChange(engine.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                        active
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {active && <FiCheck size={16} />}
                      {engine.name}
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
};

export default SettingsDrawer;