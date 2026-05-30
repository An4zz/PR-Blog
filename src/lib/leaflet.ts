import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getCategory } from '../data/categories'
import type { CategoryId } from './types'

// Fix Leaflet's default marker icons under bundlers (used by the draggable
// location picker marker).
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

/** Puerto Rico map defaults. */
export const PR_CENTER: [number, number] = [18.22, -66.43]
export const PR_ZOOM = 9

const iconCache = new Map<CategoryId, L.DivIcon>()

/** A colored teardrop pin with the category emoji, cached per category. */
export function categoryIcon(category: CategoryId): L.DivIcon {
  const cached = iconCache.get(category)
  if (cached) return cached

  const cat = getCategory(category)
  const icon = L.divIcon({
    className: 'pr-pin',
    html: `
      <div style="
        width:30px;height:30px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${cat.color};
        border:2px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,.4);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:14px;line-height:1;">${cat.emoji}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
  iconCache.set(category, icon)
  return icon
}
