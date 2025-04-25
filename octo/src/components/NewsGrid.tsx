'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';

interface NewsItem {
  _id: string;
  title: string;
  source: string;
  url: string;
  urlToImage?: string;
  description?: string;
  isAd?: boolean;
  publishedAt: string;
}

const NewsGrid = () => {
  const [news, setNews] = useState<(NewsItem | 'ad')[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ad component
  const AdUnit = ({ slotId }: { slotId: string }) => (
    <div className="rounded-lg overflow-hidden bg-white/5 col-span-full sm:col-span-2 lg:col-span-5">
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-9978045080089847`}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsbygoogle-init-${slotId}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const backendUri = process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:3040';
        const response = await fetch(`${backendUri}/api/news`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch news');

        let formattedNews = data.data.map((item: any) => ({
          _id: item._id,
          title: item.title,
          source: item.source,
          url: item.url,
          urlToImage: item.urlToImage,
          description: item.description,
          isAd: item.isAd || false,
          publishedAt: item.publishedAt,
        }));

        // Insert ads at specific positions (after every 5 news items)
        const newsWithAds: (NewsItem | 'ad')[] = [];
        formattedNews.forEach((item: NewsItem, index: number) => {
          newsWithAds.push(item);
          if ((index + 1) % 5 === 0 && index !== formattedNews.length - 1) {
            newsWithAds.push('ad');
          }
        });

        setNews(newsWithAds);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-md w-6/7 mx-auto rounded-lg p-4">
      {/* Global AdSense Script */}
      <Script
        id="adsbygoogle-script"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9978045080089847`}
        crossOrigin="anonymous"
      />

      <h2 className="text-xl font-bold text-white mb-4">Latest News</h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-4 rounded bg-white/5">
          Error loading news: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {news.map((item, index) => {
            if (item === 'ad') {
              return <AdUnit key={`ad-${index}`} slotId="6029210932" />;
            }

            const newsItem = item as NewsItem;
            return (
              <div
                key={newsItem._id}
                className="rounded-lg overflow-hidden transition-transform hover:scale-[1.02] bg-white/5 hover:bg-white/10"
              >
                <a href={newsItem.url} target="_blank" rel="noopener noreferrer" className="block h-full">
                  {newsItem.urlToImage && (
                    <div className="relative h-32 w-full overflow-hidden">
                      <img
                        src={newsItem.urlToImage}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/300x150?text=News+Image';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <span className="text-xs text-white">{formatDate(newsItem.publishedAt)}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-white line-clamp-2">{newsItem.title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-white/60">
                        {newsItem.source}
                      </p>
                      {!newsItem.urlToImage && (
                        <span className="text-xs text-white/50">
                          {formatDate(newsItem.publishedAt)}
                        </span>
                      )}
                    </div>
                    {newsItem.description && (
                      <p className="text-sm text-white/70 mt-2 line-clamp-2">{newsItem.description}</p>
                    )}
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsGrid;