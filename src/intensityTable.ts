// Приложение Д: интенсивность выбросов НП (кг/мин) и температурный коэффициент Kt
// от температуры воздуха T, °C. Шаг 1 °C, диапазон [-30; +30].
// Используется для расчёта по формулам M_п = q_п·t_п, M_с = q_с·t_с,
// M_з = (q_з / 0.16) · (1 − e^(−0.16·t_з)) + 1.05·10⁻⁴ · t_з.

export interface IntensityRow {
  t: number
  kt: number
  qp: number
  qc: number
  qz: number
}

export const INTENSITY_TABLE: readonly IntensityRow[] = [
  { t: -30, kt: 0.0369, qp: 0.00849, qc: 0.000418, qz: 3.87e-6 },
  { t: -29, kt: 0.0392, qp: 0.00901, qc: 0.000444, qz: 4.11e-6 },
  { t: -28, kt: 0.0415, qp: 0.00955, qc: 0.000470, qz: 4.36e-6 },
  { t: -27, kt: 0.0440, qp: 0.01012, qc: 0.000498, qz: 4.62e-6 },
  { t: -26, kt: 0.0467, qp: 0.01074, qc: 0.000529, qz: 4.90e-6 },
  { t: -25, kt: 0.0495, qp: 0.01138, qc: 0.000561, qz: 5.19e-6 },
  { t: -24, kt: 0.0525, qp: 0.01207, qc: 0.000594, qz: 5.51e-6 },
  { t: -23, kt: 0.0557, qp: 0.01281, qc: 0.000631, qz: 5.84e-6 },
  { t: -22, kt: 0.0591, qp: 0.01359, qc: 0.000669, qz: 6.20e-6 },
  { t: -21, kt: 0.0627, qp: 0.01442, qc: 0.000710, qz: 6.58e-6 },
  { t: -20, kt: 0.0665, qp: 0.01530, qc: 0.000753, qz: 6.98e-6 },
  { t: -19, kt: 0.0705, qp: 0.01622, qc: 0.000799, qz: 7.40e-6 },
  { t: -18, kt: 0.0748, qp: 0.01720, qc: 0.000847, qz: 7.85e-6 },
  { t: -17, kt: 0.0794, qp: 0.01826, qc: 0.000899, qz: 8.33e-6 },
  { t: -16, kt: 0.0842, qp: 0.01937, qc: 0.000954, qz: 8.84e-6 },
  { t: -15, kt: 0.0893, qp: 0.02054, qc: 0.001012, qz: 9.38e-6 },
  { t: -14, kt: 0.0948, qp: 0.02180, qc: 0.001074, qz: 9.95e-6 },
  { t: -13, kt: 0.1005, qp: 0.02312, qc: 0.001139, qz: 1.055e-5 },
  { t: -12, kt: 0.1066, qp: 0.02452, qc: 0.001208, qz: 1.119e-5 },
  { t: -11, kt: 0.1131, qp: 0.02601, qc: 0.001281, qz: 1.187e-5 },
  { t: -10, kt: 0.1200, qp: 0.02760, qc: 0.001360, qz: 1.260e-5 },
  { t: -9, kt: 0.1273, qp: 0.02928, qc: 0.001442, qz: 1.336e-5 },
  { t: -8, kt: 0.1350, qp: 0.03105, qc: 0.001530, qz: 1.418e-5 },
  { t: -7, kt: 0.1432, qp: 0.03294, qc: 0.001622, qz: 1.503e-5 },
  { t: -6, kt: 0.1519, qp: 0.03494, qc: 0.001721, qz: 1.595e-5 },
  { t: -5, kt: 0.1612, qp: 0.03708, qc: 0.001826, qz: 1.692e-5 },
  { t: -4, kt: 0.1710, qp: 0.03933, qc: 0.001937, qz: 1.795e-5 },
  { t: -3, kt: 0.1814, qp: 0.04172, qc: 0.002055, qz: 1.904e-5 },
  { t: -2, kt: 0.1925, qp: 0.04427, qc: 0.002180, qz: 2.020e-5 },
  { t: -1, kt: 0.2042, qp: 0.04697, qc: 0.002314, qz: 2.144e-5 },
  { t: 0, kt: 0.2167, qp: 0.04984, qc: 0.002455, qz: 2.275e-5 },
  { t: 1, kt: 0.2300, qp: 0.05290, qc: 0.002606, qz: 2.415e-5 },
  { t: 2, kt: 0.2441, qp: 0.05614, qc: 0.002765, qz: 2.563e-5 },
  { t: 3, kt: 0.2590, qp: 0.05957, qc: 0.002935, qz: 2.719e-5 },
  { t: 4, kt: 0.2749, qp: 0.06323, qc: 0.003115, qz: 2.887e-5 },
  { t: 5, kt: 0.2917, qp: 0.06709, qc: 0.003305, qz: 3.063e-5 },
  { t: 6, kt: 0.3096, qp: 0.07121, qc: 0.003508, qz: 3.251e-5 },
  { t: 7, kt: 0.3286, qp: 0.07558, qc: 0.003724, qz: 3.450e-5 },
  { t: 8, kt: 0.3487, qp: 0.08020, qc: 0.003951, qz: 3.662e-5 },
  { t: 9, kt: 0.3700, qp: 0.08510, qc: 0.004192, qz: 3.885e-5 },
  { t: 10, kt: 0.3927, qp: 0.09032, qc: 0.004449, qz: 4.123e-5 },
  { t: 11, kt: 0.4167, qp: 0.09584, qc: 0.004722, qz: 4.375e-5 },
  { t: 12, kt: 0.4423, qp: 0.10173, qc: 0.005012, qz: 4.644e-5 },
  { t: 13, kt: 0.4695, qp: 0.10798, qc: 0.005319, qz: 4.929e-5 },
  { t: 14, kt: 0.4983, qp: 0.11461, qc: 0.005646, qz: 5.232e-5 },
  { t: 15, kt: 0.5289, qp: 0.12165, qc: 0.005993, qz: 5.553e-5 },
  { t: 16, kt: 0.5614, qp: 0.12912, qc: 0.006361, qz: 5.894e-5 },
  { t: 17, kt: 0.5958, qp: 0.13703, qc: 0.006751, qz: 6.255e-5 },
  { t: 18, kt: 0.6324, qp: 0.14545, qc: 0.007166, qz: 6.640e-5 },
  { t: 19, kt: 0.6712, qp: 0.15438, qc: 0.007605, qz: 7.048e-5 },
  { t: 20, kt: 0.7125, qp: 0.16388, qc: 0.008073, qz: 7.481e-5 },
  { t: 21, kt: 0.7563, qp: 0.17395, qc: 0.008569, qz: 7.941e-5 },
  { t: 22, kt: 0.8028, qp: 0.18464, qc: 0.009097, qz: 8.429e-5 },
  { t: 23, kt: 0.8521, qp: 0.19598, qc: 0.009655, qz: 8.947e-5 },
  { t: 24, kt: 0.9045, qp: 0.20804, qc: 0.010249, qz: 9.497e-5 },
  { t: 25, kt: 1.0000, qp: 0.23000, qc: 0.011330, qz: 1.050e-4 },
  { t: 26, kt: 1.0618, qp: 0.24421, qc: 0.012030, qz: 1.115e-4 },
  { t: 27, kt: 1.1269, qp: 0.25919, qc: 0.012768, qz: 1.183e-4 },
  { t: 28, kt: 1.1956, qp: 0.27499, qc: 0.013548, qz: 1.255e-4 },
  { t: 29, kt: 1.2682, qp: 0.29169, qc: 0.014371, qz: 1.332e-4 },
  { t: 30, kt: 1.3450, qp: 0.30935, qc: 0.015240, qz: 1.412e-4 },
]

export interface Intensities {
  kt: number
  qp: number
  qc: number
  qz: number
  interpolated: boolean
  clamped: boolean
}

export function intensitiesAt(t: number): Intensities {
  const minT = INTENSITY_TABLE[0].t
  const maxT = INTENSITY_TABLE[INTENSITY_TABLE.length - 1].t

  if (!Number.isFinite(t)) {
    const m = INTENSITY_TABLE[Math.round((25 - minT))]
    return { kt: m.kt, qp: m.qp, qc: m.qc, qz: m.qz, interpolated: false, clamped: false }
  }

  let clamped = false
  let tc = t
  if (t <= minT) {
    tc = minT
    clamped = true
  } else if (t >= maxT) {
    tc = maxT
    clamped = true
  }

  const lowerIdx = Math.floor(tc - minT)
  const upperIdx = Math.min(lowerIdx + 1, INTENSITY_TABLE.length - 1)
  const a = INTENSITY_TABLE[lowerIdx]
  const b = INTENSITY_TABLE[upperIdx]
  const frac = tc - a.t

  if (frac === 0 || lowerIdx === upperIdx) {
    return { kt: a.kt, qp: a.qp, qc: a.qc, qz: a.qz, interpolated: false, clamped }
  }

  const lerp = (x: number, y: number) => x + (y - x) * frac
  return {
    kt: lerp(a.kt, b.kt),
    qp: lerp(a.qp, b.qp),
    qc: lerp(a.qc, b.qc),
    qz: lerp(a.qz, b.qz),
    interpolated: true,
    clamped,
  }
}
