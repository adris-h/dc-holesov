import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc, type Firestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, type Auth } from 'firebase/auth'
import type { AuthUser } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  // Stav přihlášení sdílený celou aplikací (viz composables/useAuth.ts)
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAdmin = useState<boolean>('auth-admin', () => false)
  const ready = useState<boolean>('auth-ready', () => false)
  // uid, pro který už je isAdmin vyhodnocené (kvůli čekání po přihlášení)
  const checkedUid = useState<string | null>('auth-checked-uid', () => null)
  // false = Firebase není nakonfigurovaný / nešel spustit → web běží dál, jen bez účtů a přihlášek
  const available = useState<boolean>('firebase-available', () => false)

  // Hodnoty z env (NUXT_PUBLIC_FIREBASE_*). Pro jistotu odstranit uvozovky a mezery,
  // kdyby se do GitHub Secrets zkopírovaly i s "…" z .env.
  const raw = useRuntimeConfig().public.firebase as Record<string, unknown>
  const config = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, String(v ?? '').trim().replace(/^["']|["']$/g, '').trim()]),
  ) as Record<string, string>

  const fallback = (reason: string) => {
    console.warn(`[firebase] ${reason} – účty a přihlášky na turnaje jsou vypnuté.`)
    ready.value = true
    return { provide: { db: null as Firestore | null, auth: null as Auth | null } }
  }

  if (!config.apiKey || !config.projectId) {
    return fallback('Chybí konfigurace (NUXT_PUBLIC_FIREBASE_API_KEY / PROJECT_ID)')
  }

  let db: Firestore
  let auth: Auth
  try {
    const app = getApps()[0] ?? initializeApp(config)
    db = getFirestore(app)
    auth = getAuth(app)
    auth.languageCode = 'cs' // e-maily (ověření, reset hesla) česky
  }
  catch (e) {
    return fallback(`Inicializace selhala: ${(e as Error)?.message ?? e}`)
  }
  available.value = true

  onAuthStateChanged(auth, async (u) => {
    user.value = u ? { uid: u.uid, email: u.email, name: u.displayName, emailVerified: u.emailVerified } : null
    // Admin = existuje dokument admins/{uid} (zakládá se ručně ve Firebase konzoli)
    let admin = false
    if (u) {
      try {
        admin = (await getDoc(doc(db, 'admins', u.uid))).exists()
      }
      catch {
        admin = false
      }
    }
    isAdmin.value = admin
    checkedUid.value = u?.uid ?? null
    ready.value = true
  })

  return { provide: { db: db as Firestore | null, auth: auth as Auth | null } }
})
