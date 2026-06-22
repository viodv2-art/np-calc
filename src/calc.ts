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
  factor: number
  cFactor: number
  zFactor: number
}

export function calcMvybr({ t, tp, tc, tz, K, N }: CalcInput): CalcBreakdown {
  const factor = Math.exp(0.06 * (t - 25))
  const Mp = 0.023 * factor * tp
  const cFactor = 0.23 / 2 + 0.01133
  const Mc = cFactor * factor * tc
  const zFactor = (0.01133 * factor) / 0.16
  const Mz = zFactor * (1 - Math.exp(-0.16 * tz)) + 1.05e-4 * tz
  const Mbase = Mp + Mc + Mz
  const Mvybr = Mbase * K
  const Nsafe = Number.isFinite(N) && N > 0 ? N : 0
  const Msum = Mvybr * Nsafe
  return { Mp, Mc, Mz, Mbase, K, Mvybr, N: Nsafe, Msum, factor, cFactor, zFactor }
}
