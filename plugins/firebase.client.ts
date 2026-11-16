import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { AuthUser } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { firebase } = useRuntimeConfig().public
  const app = getApps()[0] ?? initializeApp(firebase)
  const db = getFirestore(app)
  const auth = getAuth(app)
  auth.languageCode = 'cs' // e-maily (ověření, reset hesla) česky

  // Stav přihlášení sdílený celou aplikací (viz composables/useAuth.ts)
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAdmin = useState<boolean>('auth-admin', () => false)
  const ready = useState<boolean>('auth-ready', () => false)
  // uid, pro který už je isAdmin vyhodnocené (kvůli čekání po přihlášení)
  const checkedUid = useState<string | null>('auth-checked-uid', () => null)

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

  return { provide: { db, auth } }
})
