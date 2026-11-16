import { deleteField, doc, onSnapshot, serverTimestamp, setDoc, updateDoc, type Firestore } from 'firebase/firestore'

/** Profil uživatele – users/{uid}. Čte a píše jen vlastník (admin smí číst). */
export type Profile = { name: string; nickname?: string; club?: string }

export const PROFILE_LIMITS = { name: 80, nickname: 40, club: 80 }

/** Živý profil přihlášeného uživatele (v prohlížeči; při odhlášení null). */
export function useProfile() {
  const nuxtApp = useNuxtApp()
  const { user } = useAuth()
  const profile = ref<Profile | null>(null)
  const loading = ref(true)
  let unsub: (() => void) | undefined

  function stop() {
    unsub?.()
    unsub = undefined
  }

  onMounted(() => {
    watch(() => user.value?.uid, (uid) => {
      stop()
      profile.value = null
      if (!uid) {
        loading.value = false
        return
      }
      const db = nuxtApp.$db as Firestore | null
      if (!db) {
        loading.value = false
        return
      }
      loading.value = true
      unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
        const d = snap.data()
        profile.value = d
          ? { name: d.name ?? '', nickname: d.nickname || undefined, club: d.club || undefined }
          : null
        loading.value = false
      }, () => {
        loading.value = false
      })
    }, { immediate: true })
  })
  onBeforeUnmount(stop)

  /** Uloží profil. Prázdná volitelná pole se smažou. Pokud profil chybí (starší účet), založí ho. */
  async function saveProfile(p: Profile) {
    const uid = user.value?.uid
    if (!uid) throw new Error('Nepřihlášen')
    const db = nuxtApp.$db as Firestore | null
    if (!db) throw firebaseUnavailable()
    const ref = doc(db, 'users', uid)
    const name = p.name.trim()
    const nickname = p.nickname?.trim() ?? ''
    const club = p.club?.trim() ?? ''
    if (profile.value) {
      await updateDoc(ref, {
        name,
        nickname: nickname || deleteField(),
        club: club || deleteField(),
        updatedAt: serverTimestamp(),
      })
    }
    else {
      const data: Record<string, unknown> = { name, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
      if (nickname) data.nickname = nickname
      if (club) data.club = club
      await setDoc(ref, data)
    }
  }

  return { profile, loading, saveProfile }
}
