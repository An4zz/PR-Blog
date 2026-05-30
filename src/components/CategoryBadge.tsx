import { getCategory } from '../data/categories'
import type { CategoryId } from '../lib/types'

export default function CategoryBadge({ category }: { category: CategoryId }) {
  const cat = getCategory(category)
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: cat.color }}
    >
      <span aria-hidden>{cat.emoji}</span>
      {cat.label}
    </span>
  )
}
