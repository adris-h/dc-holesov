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

/** Hledání bez ohledu na diakritiku a velikost písmen: matchText('Čáp Jiří', 'cap') -> true */
export function normalizeText(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}
export function matchText(haystack: string | (string | undefined)[], query: string) {
  const q = normalizeText(query)
  if (!q) return true
  const text = Array.isArray(haystack) ? haystack.filter(Boolean).join(' ') : haystack
  return normalizeText(text).includes(q)
}

/** Styl polí ve filtrech tabulek (TableFilter) */
export const FILTER_INPUT = 'rounded-lg border border-line-strong bg-white px-4 py-2.5 font-sans text-[15px] text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10'
