import { intensitiesAt } from './intensityTable'

export type WindModel = 'linear' | 'sqrt' | 'gost' | 'manual'

export function windCoefficient(v: number, model: WindModel, manual: number): number {
  if (!Number.isFinite(v) || v < 0) v = 0
  switch (model) {
    case 'linear':
      return 1 + 0.1 * v
    case 'sqrt':
      return Math.sqrt(1 + v / 5)
    case 'gost':
      if (v < 2) return 1.0
      if (v < 5) return 1.2
      if (v < 10) return 1.5
      return 1.8
    case 'manual':
      return Number.isFinite(manual) && manual > 0 ? manual : 1
  }
}

export type TimeUnit = 'min' | 'h' | 's'

export interface CalcInput {
  t: number
  tp: number
  tc: number
  tz: number
  K: number
  N: number
}

export interface CalcBreakdown {
  Mp: number
  Mc: number
  Mz: number
  Mbase: number
  K: number
  Mvybr: number
  N: number
  Msum: number
  kt: number
  qp: number
  qc: number
  qz: number
  zSaturation: number
  zTail: number
  interpolated: boolean
  clamped: boolean
}

// Расчёт по табличным интенсивностям (Приложение Д).
// Время этапов tp/tc/tz — в минутах. q_* — кг/мин.
// M_п = q_п · t_п
// M_с = q_с · t_с
// M_з = (q_з / 0.16) · (1 − e^(−0.16·t_з)) + 1.05·10⁻⁴ · t_з    (формула 2.35, насыщение)
// M_выбр = (M_п + M_с + M_з) · K(v)
// M_sum = N · M_выбр
export function calcMvybr({ t, tp, tc, tz, K, N }: CalcInput): CalcBreakdown {
  const { kt, qp, qc, qz, interpolated, clamped } = intensitiesAt(t)
  const Mp = qp * tp
  const Mc = qc * tc
  const zSaturation = (qz / 0.16) * (1 - Math.exp(-0.16 * tz))
  const zTail = 1.05e-4 * tz
  const Mz = zSaturation + zTail
  const Mbase = Mp + Mc + Mz
  const Mvybr = Mbase * K
  const Nsafe = Number.isFinite(N) && N > 0 ? N : 0
  const Msum = Mvybr * Nsafe
  return {
    Mp,
    Mc,
    Mz,
    Mbase,
    K,
    Mvybr,
    N: Nsafe,
    Msum,
    kt,
    qp,
    qc,
    qz,
    zSaturation,
    zTail,
    interpolated,
    clamped,
  }
}
