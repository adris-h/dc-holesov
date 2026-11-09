export const STATUS_LABEL: Record<string, string> = {
  open: 'Otevřeno',
  league: 'Liga',
  soon: 'Brzy',
  closed: 'Uzavřeno',
}

/** 2027-01-04 -> 4. 1. 2027 */
export function formatDate(iso?: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d}. ${m}. ${y}`
}

/** 2026-12-31 -> 31.12 */
export function formatShortDate(iso?: string) {
  if (!iso) return ''
  const [, m, d] = iso.split('-').map(Number)
  return `${d}.${m}`
}

/** content/tournaments/lednovy-turnaj.md -> lednovy-turnaj */
export function slugFromStem(stem: string) {
  return stem.split('/').pop() as string
}
