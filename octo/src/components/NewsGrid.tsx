// src/components/NewsGrid.tsx
'use client'
import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  source: string;
  url: string;
  image?: string;
  isAd?: boolean;
}

const NewsGrid = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching news with some ads
    const fetchNews = async () => {
      try {
        // In a real app, you would fetch from a news API
        const mockNews: NewsItem[] = [
          {
            title: 'Latest developments in renewable energy',
            source: 'Tech News',
            url: '#',
            image: 'https://via.placeholder.com/150'
          },
          {
            title: 'Sponsored: Try our new productivity tool',
            source: 'Advertiser',
            url: '#',
            isAd: true
          },
          {
            title: 'Stock markets reach all-time high',
            source: 'Financial Times',
            url: '#'
          },
          {
            title: 'New JavaScript framework released',
            source: 'Dev Blog',
            url: '#',
            image: 'https://via.placeholder.com/150'
          },
          {
            title: 'Sponsored: Learn coding in 30 days',
            source: 'Advertiser',
            url: '#',
            isAd: true
          },
          {
            title: 'Global climate summit results',
            source: 'World News',
            url: '#'
          }
        ];
        
        setNews(mockNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">News</h2>
      {loading ? (
        <div className="text-white">Loading news...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item, index) => (
            <div 
              key={index} 
              className={`rounded-lg overflow-hidden ${item.isAd ? 'border-2 border-yellow-400' : 'bg-white/5'}`}
            >
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-3">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className={`text-sm ${item.isAd ? 'text-yellow-400' : 'text-white/60'}`}>
                  {item.source}
                </p>
                {item.isAd && (
                  <span className="text-xs text-yellow-400">Sponsored</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsGrid;