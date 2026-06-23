import { useEffect } from 'react'
import { animate, useMotionValue, useTransform, motion } from 'framer-motion'

interface Props {
  value: number
  digits?: number
  suffix?: string
}

export function AnimatedNumber({ value, digits = 4, suffix = '' }: Props) {
  const mv = useMotionValue(value)
  const display = useTransform(mv, (v) => {
    if (!Number.isFinite(v)) return '—'
    return Math.abs(v) >= 1000 ? v.toFixed(1) : v.toFixed(digits)
  })

  useEffect(() => {
    const controls = animate(mv, value, {
      type: 'spring',
      stiffness: 140,
      damping: 18,
      mass: 0.6,
    })
    return () => controls.stop()
  }, [value, mv])

  return (
    <motion.span
      key={value}
      initial={{ scale: 0.96, opacity: 0.7 }}
      animate={{ scale: [1.06, 1], opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="inline-block"
    >
      <motion.span>{display}</motion.span>
      {suffix && <span className="text-slate-400 text-2xl ml-2">{suffix}</span>}
    </motion.span>
  )
}
