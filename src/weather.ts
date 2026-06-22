export interface GeoResult {
  id: number
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
}

export interface WeatherData {
  temperature: number
  windspeed: number
  source: 'archive' | 'forecast'
}

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

export async function searchCity(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return []
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=8&language=ru&format=json`
  const r = await fetch(url)
  if (!r.ok) throw new Error('geocoding failed')
  const j = await r.json()
  return (j.results ?? []) as GeoResult[]
}

function avg(arr: (number | null)[]): number {
  const xs = arr.filter((x): x is number => typeof x === 'number')
  if (!xs.length) return NaN
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

export async function getWeather(
  lat: number,
  lon: number,
  isoDate: string,
): Promise<WeatherData> {
  const today = new Date().toISOString().slice(0, 10)
  const target = isoDate
  const useArchive = target < today
  const base = useArchive ? ARCHIVE_URL : FORECAST_URL
  const url =
    `${base}?latitude=${lat}&longitude=${lon}` +
    `&start_date=${target}&end_date=${target}` +
    `&hourly=temperature_2m,windspeed_10m&timezone=auto`
  const r = await fetch(url)
  if (!r.ok) throw new Error('weather fetch failed')
  const j = await r.json()
  const temps = (j.hourly?.temperature_2m ?? []) as (number | null)[]
  const winds = (j.hourly?.windspeed_10m ?? []) as (number | null)[]
  const t = avg(temps)
  const wKmh = avg(winds)
  const wMs = wKmh / 3.6
  return {
    temperature: Number.isFinite(t) ? +t.toFixed(1) : NaN,
    windspeed: Number.isFinite(wMs) ? +wMs.toFixed(1) : NaN,
    source: useArchive ? 'archive' : 'forecast',
  }
}
