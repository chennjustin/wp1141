interface TagChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

const TagChip = ({ children, active = false, onClick }: TagChipProps) => {
  return (
    <span
      onClick={onClick}
      className={`inline-block text-sm px-2 py-0.5 rounded-full transition-colors ${
        active
          ? 'bg-primary text-white'
          : onClick
          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {children}
    </span>
  )
}

export default TagChip

