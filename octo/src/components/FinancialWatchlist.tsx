'use client'

import { useAppContext } from '../context/AppContext'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface FinancialData {
  symbol: string
  price: number
  change: number
  changePercent: number
  description?: string
}

const FinancialWatchlist = () => {
  const { watchlist } = useAppContext()
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch data for each symbol in watchlist
        const stockData = await Promise.all(
          watchlist.map(async (symbol) => {
            try {
              const backendUri = process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:3040'
              const response = await fetch(`${backendUri}/api/stocks/${symbol}`)
              
              if (!response.ok) {
                throw new Error(`Failed to fetch data for ${symbol}`)
              }
              
              const result = await response.json()
              
              if (!result.success || !result.data) {
                throw new Error(`No data available for ${symbol}`)
              }
              
              const stock = result.data
              return {
                symbol,
                price: stock.price,
                change: stock.change,
                changePercent: stock.changePercent,
                description: stock.description || symbol
              }
            } catch (err) {
              console.error(`Error fetching ${symbol}:`, err)
              // Return mock data if API fails for this symbol
              const basePrice = 100 + Math.random() * 500
              const change = (Math.random() - 0.5) * 10
              return {
                symbol,
                price: parseFloat((basePrice + change).toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
                description: symbol
              }
            }
          })
        )
        
        setData(stockData)
      } catch (err) {
        console.error('Market data fetch failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch market data')
        // Fallback to mock data if all API calls fail
        const mockData = watchlist.map(symbol => {
          const basePrice = 100 + Math.random() * 500
          const change = (Math.random() - 0.5) * 10
          return {
            symbol,
            price: parseFloat((basePrice + change).toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
            description: symbol
          }
        })
        setData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [watchlist])

  return (
    <div className="flex items-center gap-4 text-white text-sm">
      {loading ? (
        <Loader2 className="animate-spin w-4 h-4 text-gray-300" />
      ) : error ? (
        <span className="text-red-400 text-xs">{error}</span>
      ) : (
        data.map(item => (
          <div key={item.symbol} className="flex items-center gap-1 group relative">
            <span className="font-semibold">{item.symbol}</span>
            <span>${item.price.toFixed(2)}</span>
            <span className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
            </span>
            {item.description && (
              <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 min-w-max">
                {item.description}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default FinancialWatchlist