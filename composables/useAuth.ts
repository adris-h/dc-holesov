import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore'

export type AuthUser = { uid: string; email: string | null; name: string | null; emailVerified: boolean }

export type SignUpData = {
  name: string
  email: string
  password: string
  nickname?: string
  club?: string
}

/**
 * Stav přihlášení (Firebase Auth). Hodnoty plní plugins/firebase.client.ts.
 * - ready: false, dokud Firebase nezjistí stav (na serveru/při generování vždy false)
 * - isAdmin: uživatel má dokument admins/{uid} (přiděluje se ručně ve Firebase konzoli)
 * Účet si může založit kdokoli (/registrace); admin práva ne.
 */
export function useAuth() {
  const nuxtApp = useNuxtApp()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isAdmin = useState<boolean>('auth-admin', () => false)
  const ready = useState<boolean>('auth-ready', () => false)
  const checkedUid = useState<string | null>('auth-checked-uid', () => null)

  /** Počká, než plugin pro daného uživatele dočte admin práva. */
  function waitForCheck(uid: string) {
    if (checkedUid.value === uid) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const stop = watch(checkedUid, (v) => {
        if (v === uid) {
          stop()
          resolve()
        }
      })
    })
  }

  /** Přihlásí a počká, než se ověří admin práva. Vrací, zda je uživatel admin. */
  async function login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(nuxtApp.$auth, email.trim(), password)
    await waitForCheck(cred.user.uid)
    return isAdmin.value
  }

  /** Založí účet + profil users/{uid} a pošle ověřovací e-mail. */
  async function register(data: SignUpData) {
    const name = data.name.trim()
    const cred = await createUserWithEmailAndPassword(nuxtApp.$auth, data.email.trim(), data.password)
    await updateProfile(cred.user, { displayName: name })
    const profile: Record<string, unknown> = { name, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
    if (data.nickname?.trim()) profile.nickname = data.nickname.trim()
    if (data.club?.trim()) profile.club = data.club.trim()
    await setDoc(doc(nuxtApp.$db as Firestore, 'users', cred.user.uid), profile)
    await waitForCheck(cred.user.uid)
    if (user.value?.uid === cred.user.uid) user.value = { ...user.value, name }
    // ověřovací e-mail – neúspěch nevadí, účet už existuje
    sendEmailVerification(cred.user).catch(() => {})
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(nuxtApp.$auth, email.trim())
  }

  async function logout() {
    await signOut(nuxtApp.$auth)
  }

  return { user, isAdmin, ready, login, register, resetPassword, logout }
}

/** Srozumitelná česká hláška k chybě z Firebase */
export function firebaseErrorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Nesprávný e-mail nebo heslo.',
    'auth/wrong-password': 'Nesprávný e-mail nebo heslo.',
    'auth/user-not-found': 'Účet s tímto e-mailem neexistuje.',
    'auth/invalid-email': 'Neplatný e-mail.',
    'auth/missing-email': 'Vyplňte e-mail.',
    'auth/email-already-in-use': 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
    'auth/weak-password': 'Heslo je příliš slabé (alespoň 6 znaků).',
    'auth/user-disabled': 'Účet je zablokovaný.',
    'auth/too-many-requests': 'Příliš mnoho pokusů. Zkuste to za chvíli.',
    'auth/network-request-failed': 'Chyba připojení. Zkontrolujte internet.',
    'auth/operation-not-allowed': 'Registrace e-mailem není ve Firebase povolená.',
    'permission-denied': 'Nemáte oprávnění k této akci.',
    'unavailable': 'Služba je dočasně nedostupná. Zkuste to znovu.',
  }
  return map[code] ?? 'Něco se pokazilo. Zkuste to prosím znovu.'
}
