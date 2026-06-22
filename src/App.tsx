import { useEffect, useMemo, useState } from 'react'
import { calcMvybr } from './calc'
import type { TimeUnit, WindModel } from './calc'
import { windCoefficient } from './calc'
import { searchCity, getWeather } from './weather'
import type { GeoResult } from './weather'

const TIME_UNIT_LABEL: Record<TimeUnit, string> = {
  min: 'мин',
  h: 'ч',
  s: 'с',
}

const todayIso = () => new Date().toISOString().slice(0, 10)

const LS_CITY = 'np-calc:city'
const LS_QUERY = 'np-calc:cityQuery'

function loadCity(): GeoResult | null {
  try {
    const raw = localStorage.getItem(LS_CITY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      typeof parsed.name === 'string'
    ) {
      return parsed as GeoResult
    }
  } catch {
    /* ignore */
  }
  return null
}

function loadQuery(): string {
  try {
    return localStorage.getItem(LS_QUERY) ?? ''
  } catch {
    return ''
  }
}

function fmt(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return '—'
  if (Math.abs(x) >= 1000) return x.toFixed(1)
  return x.toFixed(digits)
}

export default function App() {
  const savedCity = loadCity()
  const savedQuery = loadQuery()
  const [cityQuery, setCityQuery] = useState(savedQuery || savedCity?.name || 'Москва')
  const [cityOptions, setCityOptions] = useState<GeoResult[]>([])
  const [city, setCity] = useState<GeoResult | null>(savedCity)
  const [searching, setSearching] = useState(false)
  const [date, setDate] = useState(todayIso())

  const [t, setT] = useState<number | ''>('')
  const [wind, setWind] = useState<number | ''>('')
  const [weatherSource, setWeatherSource] = useState<'archive' | 'forecast' | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  const [tp, setTp] = useState<number>(60)
  const [tc, setTc] = useState<number>(120)
  const [tz, setTz] = useState<number>(60)
  const [N, setN] = useState<number>(1)
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('min')

  const [windModel, setWindModel] = useState<WindModel>('linear')
  const [manualK, setManualK] = useState<number>(1)

  const handleCitySearch = async () => {
    setSearching(true)
    try {
      const res = await searchCity(cityQuery)
      setCityOptions(res)
      if (res.length === 1) setCity(res[0])
    } catch {
      setCityOptions([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (!city) handleCitySearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      if (city) localStorage.setItem(LS_CITY, JSON.stringify(city))
    } catch {
      /* ignore quota */
    }
  }, [city])

  useEffect(() => {
    try {
      localStorage.setItem(LS_QUERY, cityQuery)
    } catch {
      /* ignore quota */
    }
  }, [cityQuery])

  const fetchWeather = async () => {
    if (!city) return
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const w = await getWeather(city.latitude, city.longitude, date)
      if (Number.isFinite(w.temperature)) setT(+w.temperature.toFixed(1))
      if (Number.isFinite(w.windspeed)) setWind(+w.windspeed.toFixed(1))
      setWeatherSource(w.source)
    } catch (e) {
      setWeatherError(e instanceof Error ? e.message : 'ошибка')
    } finally {
      setWeatherLoading(false)
    }
  }

  useEffect(() => {
    if (city) fetchWeather()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, date])

  const K = useMemo(() => {
    const v = typeof wind === 'number' ? wind : 0
    return windCoefficient(v, windModel, manualK)
  }, [wind, windModel, manualK])

  const result = useMemo(() => {
    if (typeof t !== 'number') return null
    return calcMvybr({ t, tp, tc, tz, K, N })
  }, [t, tp, tc, tz, K, N])

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Калькулятор выбросов НП из ж/д цистерн
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Формула 2.36 (Кузьмин). Температура и ветер — Open-Meteo. K(v) — поправка на ветер.
          </p>
        </header>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Локация и дата
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            <div className="flex gap-2">
              <input
                className="ctl flex-1"
                placeholder="Город"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              />
              <button
                onClick={handleCitySearch}
                className="ctl-btn shrink-0"
                disabled={searching}
              >
                {searching ? '…' : 'Найти'}
              </button>
            </div>
            <input
              type="date"
              className="ctl"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {cityOptions.length > 1 && (
            <div className="mt-3 grid gap-1">
              {cityOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCity(c)}
                  className={`text-left rounded px-3 py-2 text-sm border ${
                    city?.id === c.id
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-slate-500">
                    {c.admin1 ? `, ${c.admin1}` : ''}
                    {c.country ? `, ${c.country}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {city && (
            <div className="mt-3 text-xs text-slate-500">
              {city.name}
              {city.admin1 ? `, ${city.admin1}` : ''} · {city.latitude.toFixed(3)},{' '}
              {city.longitude.toFixed(3)}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field
              label="Температура t, °C"
              hint={
                weatherLoading
                  ? 'загрузка…'
                  : weatherError
                    ? weatherError
                    : weatherSource
                      ? weatherSource === 'archive'
                        ? 'из архива Open-Meteo'
                        : 'прогноз Open-Meteo'
                      : undefined
              }
            >
              <NumberInput value={t} onChange={setT} step={0.1} />
            </Field>
            <Field
              label="Скорость ветра v, м/с"
              hint={weatherSource ? '10 м над землёй, среднее за сутки' : undefined}
            >
              <NumberInput value={wind} onChange={setWind} step={0.1} />
            </Field>
          </div>

          {city && (
            <button
              onClick={fetchWeather}
              className="mt-3 text-xs text-slate-600 underline hover:text-slate-900"
            >
              обновить погоду
            </button>
          )}
        </section>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Время этапов и количество цистерн
            </h2>
            <div className="inline-flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(['min', 'h', 's'] as TimeUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setTimeUnit(u)}
                  className={`px-2 py-1 rounded ${
                    timeUnit === u
                      ? 'bg-white shadow text-slate-900 font-medium'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {TIME_UNIT_LABEL[u]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label={`t_п, ${TIME_UNIT_LABEL[timeUnit]}`} hint="подготовка">
              <NumberInput value={tp} onChange={(v) => setTp(typeof v === 'number' ? v : 0)} step={1} />
            </Field>
            <Field label={`t_с, ${TIME_UNIT_LABEL[timeUnit]}`} hint="слив">
              <NumberInput value={tc} onChange={(v) => setTc(typeof v === 'number' ? v : 0)} step={1} />
            </Field>
            <Field label={`t_з, ${TIME_UNIT_LABEL[timeUnit]}`} hint="заключительный">
              <NumberInput value={tz} onChange={(v) => setTz(typeof v === 'number' ? v : 0)} step={1} />
            </Field>
            <Field label="N, цистерн" hint="за период">
              <NumberInput value={N} onChange={(v) => setN(typeof v === 'number' ? v : 0)} step={1} />
            </Field>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Время подставляется в формулу как есть, без пересчёта. Сверяйте с источником, в каких единицах
            калиброваны коэффициенты (0.023, 0.01133, 0.16, 1.05·10⁻⁴).
          </div>
        </section>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Поправка на ветер K(v)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Модель K(v)">
              <select
                className="ctl ctl-select"
                value={windModel}
                onChange={(e) => setWindModel(e.target.value as WindModel)}
              >
                <option value="linear">Линейная: 1 + 0.1·v</option>
                <option value="sqrt">Корень: √(1 + v/5)</option>
                <option value="gost">Кусочная (ОНД-86): 1.0 / 1.2 / 1.5 / 1.8</option>
                <option value="manual">Ввести вручную</option>
              </select>
            </Field>
            <Field
              label={windModel === 'manual' ? 'K вручную' : 'K (расчётный)'}
              hint={windModel === 'manual' ? undefined : `при v=${typeof wind === 'number' ? wind : 0} м/с`}
            >
              {windModel === 'manual' ? (
                <NumberInput
                  value={manualK}
                  onChange={(v) => setManualK(typeof v === 'number' ? v : 1)}
                  step={0.05}
                />
              ) : (
                <div className="ctl-readonly">{fmt(K, 3)}</div>
              )}
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-slate-900 bg-slate-900 p-5 text-white shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Суммарные выбросы M_sum (N цистерн × M_выбр × K)
          </h2>
          <div className="text-4xl font-semibold font-mono">
            {result ? `${fmt(result.Msum, 4)} кг` : '—'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            на одну цистерну: {result ? `${fmt(result.Mvybr, 4)} кг` : '—'}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
            <Stat label="M_п" value={result ? fmt(result.Mp) : '—'} />
            <Stat label="M_с" value={result ? fmt(result.Mc) : '—'} />
            <Stat label="M_з" value={result ? fmt(result.Mz) : '—'} />
            <Stat label="K" value={result ? fmt(result.K, 3) : '—'} />
            <Stat label="N" value={result ? String(result.N) : '—'} />
          </div>
          {result && (
            <div className="mt-4 border-t border-slate-700 pt-3 text-xs text-slate-300 font-mono leading-relaxed space-y-0.5">
              <div>
                t_п = {tp} {TIME_UNIT_LABEL[timeUnit]}, t_с = {tc} {TIME_UNIT_LABEL[timeUnit]}, t_з ={' '}
                {tz} {TIME_UNIT_LABEL[timeUnit]}
              </div>
              <div>e^(0.06·(t−25)) = {fmt(result.factor, 4)}</div>
              <div>M_п = 0.023 · factor · t_п = {fmt(result.Mp, 4)}</div>
              <div>
                M_с = {fmt(result.cFactor, 5)} · factor · t_с = {fmt(result.Mc, 4)}
              </div>
              <div>
                M_з = {fmt(result.zFactor, 4)} · (1 − e^(−0.16·t_з)) + 1.05·10⁻⁴·t_з ={' '}
                {fmt(result.Mz, 4)}
              </div>
              <div>M_выбр (без K) = M_п + M_с + M_з = {fmt(result.Mbase, 4)} кг</div>
              <div>
                M_выбр × K = {fmt(result.Mbase, 4)} × {fmt(result.K, 3)} = {fmt(result.Mvybr, 4)} кг
              </div>
              <div>
                M_sum = N · M_выбр = {result.N} × {fmt(result.Mvybr, 4)} ={' '}
                <span className="text-white">{fmt(result.Msum, 4)} кг</span>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-8 text-xs text-slate-400">
          Источник погоды: Open-Meteo (open-meteo.com), без API-ключа. Архив до вчера, прогноз —
          с сегодня.
        </footer>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2 mb-1 min-h-[1rem]">
        <span className="text-xs font-medium text-slate-600 truncate">{label}</span>
        <span className="text-xs text-slate-400 truncate text-right">{hint ?? ' '}</span>
      </div>
      {children}
    </label>
  )
}

function NumberInput({
  value,
  onChange,
  step,
}: {
  value: number | ''
  onChange: (v: number | '') => void
  step?: number
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step ?? 'any'}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? '' : Number(v))
      }}
      className="ctl font-mono"
    />
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  )
}
