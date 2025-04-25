'use client';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';

type ScenarioType = 'nature' | 'urban' | 'space' | 'beach';

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


const SettingsDrawer = ({ isOpen, onClose }) => {
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
    const savedScenario = localStorage.getItem('background-scenario');

    if (savedBg) setBackground(savedBg);
    if (savedEngine) setSearchEngine(savedEngine);
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedNotes) {
      setNotes(savedNotes);
      setLocalNotes(savedNotes);
    }
    if (savedScenario) setScenario(savedScenario as ScenarioType);
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
      const res = await fetch(`${PEXELS_API_URL}?query=${query}&per_page=15`, {
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
          className="fixed top-0 right-0 h-full w-80 bg-gray-900 p-6 shadow-lg z-50 overflow-y-auto"
        >
          <button onClick={onClose} className="text-white mb-4">Close</button>
          <h2 className="text-white text-lg font-semibold mb-4">Customize</h2>
          
          <div className="space-y-6">
            {/* Watchlist Editor */}
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-white text-sm mb-2">Stock Watchlist (Max 3)</h3>
              
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Add stock symbol"
                  className="flex-1 bg-gray-800 text-white p-2 rounded-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                />
                <button
                  onClick={handleAddStock}
                  disabled={!newStock || watchlist.length >= 3}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              
              <div className="space-y-2 mb-3">
                {watchlist.map((stock) => (
                  <div key={stock} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <span className="text-white">{stock}</span>
                    <button
                      onClick={() => handleRemoveStock(stock)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
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
                    className={`px-2 py-1 text-xs rounded ${
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
            <div className="border-t border-gray-600 pt-4">
              <h3 className="text-white text-sm mb-2">Notes</h3>
              <textarea
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                className="w-full bg-gray-800 text-white p-2 rounded-lg h-24"
                placeholder="Type your notes here..."
              />
            </div>

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

            {/* Current Background Preview */}
            {background && (
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-white text-sm mb-2">Current Background</h3>
                <div 
                  className="w-full h-24 bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${background})` }}
                />
              </div>
            )}

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
                      onClick={() => handleSearchEngineChange(engine)}
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
};

export default SettingsDrawer;