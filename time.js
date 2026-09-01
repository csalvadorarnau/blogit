export function relativeTime(isoDate) {
  const then = new Date(isoDate).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - then) / 1000))

  if (diffSec < 60) return 'ahora'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `hace ${diffHour} h`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `hace ${diffDay} d`
  const diffWeek = Math.floor(diffDay / 7)
  if (diffWeek < 5) return `hace ${diffWeek} sem`
  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `hace ${diffMonth} mes${diffMonth > 1 ? 'es' : ''}`
  const diffYear = Math.floor(diffDay / 365)
  return `hace ${diffYear} año${diffYear > 1 ? 's' : ''}`
}
