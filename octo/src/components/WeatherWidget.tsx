'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2, MapPin } from 'lucide-react'

interface WeatherData {
  temp_c: number
  condition: string
  icon: string
  location: string
}

const WeatherWidgetSmall = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const locationRes = await axios.get('/api/ip-location')
        const { latitude, longitude } = locationRes.data

        const weatherRes = await axios.get('https://api.weatherapi.com/v1/current.json', {
          params: {
            key: '14b2ea8ac3ec4afbb9e92137252504',
            q: `${latitude},${longitude}`,
          },
        })

        const current = weatherRes.data.current

        setWeather({
          temp_c: current.temp_c,
          condition: current.condition.text,
          icon: current.condition.icon,
          location: locationRes.data.city,
        })
      } catch (err) {
        console.error('Weather fetch failed', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  return (
    <div className="flex items-center gap-2 text-white text-sm">
      {loading ? (
        <Loader2 className="animate-spin w-4 h-4 text-gray-300" />
      ) : weather ? (
        <>
          <img src={weather.icon} alt="Weather" className="w-6 h-6" />
          <span>{weather.temp_c}°C</span>
          <span className="text-gray-400 hidden sm:inline">{weather.location}</span>
        </>
      ) : (
        <span className="text-gray-400">N/A</span>
      )}
    </div>
  )
}

export default WeatherWidgetSmall
