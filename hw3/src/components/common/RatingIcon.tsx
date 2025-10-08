import React from 'react'

interface RatingIconProps {
  rating?: string
  className?: string
}

function getRatingStyle(rating: string | undefined) {
  const r = rating || ''
  if (/限制|R-?18/i.test(r)) return { bg: 'bg-red-600', label: 'R', title: '限制級' }
  if (/輔?15|PG-?15/i.test(r)) return { bg: 'bg-orange-600', label: '15', title: '輔15' }
  if (/輔?12|PG-?12/i.test(r)) return { bg: 'bg-yellow-500', label: '12', title: '輔12' }
  if (/保護|P(?!G)/i.test(r)) return { bg: 'bg-green-700', label: 'P', title: '保護級' }
  // 普遍級或未知
  return { bg: 'bg-green-600', label: 'G', title: '普遍級' }
}

export default function RatingIcon({ rating, className = '' }: RatingIconProps) {
  const style = getRatingStyle(rating)
  return (
    <div
      title={style.title}
      className={`inline-flex items-center justify-center rounded-sm px-1.5 h-5 text-[10px] font-bold text-white ${style.bg} ${className}`}
    >
      {style.label}
    </div>
  )
}


