import React from 'react'

interface AgeRatingProps {
  rating: string
  size?: 'sm' | 'md' | 'lg'
  position?: 'bottom-right' | 'top-right' | 'top-left' | 'bottom-left'
}

const AgeRating = ({ rating, size = 'md', position = 'bottom-right' }: AgeRatingProps) => {
  // 分級對應表
  const ratingMap: Record<string, { level: string; color: string; bgColor: string }> = {
    '普遍級': { level: '0+', color: 'text-green-800', bgColor: 'bg-green-100' },
    '保護級': { level: '6+', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    '輔導級': { level: '12+', color: 'text-orange-800', bgColor: 'bg-orange-100' },
    '限制級': { level: '18+', color: 'text-red-800', bgColor: 'bg-red-100' },
    // 英文分級備用
    'G': { level: '0+', color: 'text-green-800', bgColor: 'bg-green-100' },
    'PG': { level: '6+', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    'PG-13': { level: '12+', color: 'text-orange-800', bgColor: 'bg-orange-100' },
    'R': { level: '15+', color: 'text-red-800', bgColor: 'bg-red-100' },
  }

  const ratingInfo = ratingMap[rating] || ratingMap['保護級'] // 預設為保護級

  // 尺寸對應
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1.5'
  }

  // 位置對應
  const positionClasses = {
    'bottom-right': 'absolute bottom-2 right-2',
    'top-right': 'absolute top-2 right-2',
    'top-left': 'absolute top-2 left-2',
    'bottom-left': 'absolute bottom-2 left-2'
  }

  return (
    <div className={`${positionClasses[position]} z-10`}>
      <div className={`${ratingInfo.bgColor} ${ratingInfo.color} ${sizeClasses[size]} font-bold rounded border border-current/20`}>
        {ratingInfo.level}
      </div>
    </div>
  )
}

export default AgeRating
