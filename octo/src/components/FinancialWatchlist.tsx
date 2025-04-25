'use client'

import { useAppContext } from '../context/AppContext'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface FinancialData {
  symbol: string
  price: number
  change: number
}

const FinancialWatchlist = () => {
  const { watchlist } = useAppContext()
  const [data, setData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const mockData = watchlist.map(symbol => {
          const basePrice = 100 + Math.random() * 500
          const change = (Math.random() - 0.5) * 10
          const price = basePrice + change
          return {
            symbol,
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
          }
        })

        setData(mockData)
      } catch (err) {
        console.error('Market data fetch failed', err)
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
      ) : (
        data.slice(0, 3).map(item => (
          <div key={item.symbol} className="flex items-center gap-1">
            <span className="font-semibold">{item.symbol}</span>
            <span>${item.price.toFixed(2)}</span>
            <span className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

export default FinancialWatchlist
