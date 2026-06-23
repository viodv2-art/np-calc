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
  source: 'metno' | 'wttr'
}

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const METNO_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact'
const WTTR_URL = 'https://wttr.in'

const UA = 'np-calculator/0.2 github.com/viodv2-art/np-calc'

export async function searchCity(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return []
  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=8&language=ru&format=json`
  const r = await fetch(url)
  if (!r.ok) throw new Error('geocoding failed')
  const j = await r.json()
  return (j.results ?? []) as GeoResult[]
}

async function fetchMetno(lat: number, lon: number, isoDate: string): Promise<WeatherData> {
  const url = `${METNO_URL}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
  if (!r.ok) throw new Error(`met.no http ${r.status}`)
  const j = await r.json()
  const series: Array<{
    time: string
    data: { instant: { details: { air_temperature?: number; wind_speed?: number } } }
  }> = j?.properties?.timeseries ?? []
  if (!series.length) throw new Error('met.no empty timeseries')

  const dayPoints = series.filter((p) => p.time.startsWith(isoDate))
  const pool = dayPoints.length ? dayPoints : series.slice(0, 8)
  const temps: number[] = []
  const winds: number[] = []
  for (const p of pool) {
    const d = p.data?.instant?.details
    if (typeof d?.air_temperature === 'number') temps.push(d.air_temperature)
    if (typeof d?.wind_speed === 'number') winds.push(d.wind_speed)
  }
  if (!temps.length || !winds.length) throw new Error('met.no missing details')
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  return {
    temperature: +avg(temps).toFixed(1),
    windspeed: +avg(winds).toFixed(1),
    source: 'metno',
  }
}

async function fetchWttr(lat: number, lon: number, isoDate: string): Promise<WeatherData> {
  const url = `${WTTR_URL}/${lat.toFixed(4)},${lon.toFixed(4)}?format=j1`
  const r = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`wttr.in http ${r.status}`)
  const j = await r.json()
  const days: Array<{
    date: string
    hourly: Array<{ tempC: string; windspeedKmph: string }>
  }> = j?.weather ?? []
  if (!days.length) throw new Error('wttr.in empty')

  const day = days.find((d) => d.date === isoDate) ?? days[0]
  const temps: number[] = []
  const winds: number[] = []
  for (const h of day.hourly ?? []) {
    const t = Number(h.tempC)
    const wKmh = Number(h.windspeedKmph)
    if (Number.isFinite(t)) temps.push(t)
    if (Number.isFinite(wKmh)) winds.push(wKmh / 3.6)
  }
  if (!temps.length || !winds.length) throw new Error('wttr.in missing values')
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  return {
    temperature: +avg(temps).toFixed(1),
    windspeed: +avg(winds).toFixed(1),
    source: 'wttr',
  }
}

export async function getWeather(lat: number, lon: number, isoDate: string): Promise<WeatherData> {
  try {
    return await fetchMetno(lat, lon, isoDate)
  } catch (e) {
    try {
      return await fetchWttr(lat, lon, isoDate)
    } catch (e2) {
      throw new Error(
        `оба источника недоступны: met.no (${e instanceof Error ? e.message : 'err'}), wttr.in (${e2 instanceof Error ? e2.message : 'err'})`,
      )
    }
  }
}
