import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Timestamp,
} from 'firebase/firestore'

/*
 * Přihlášky na turnaje – Firestore
 *
 *   registrations/{id}         veřejná část: tournament, name, nickname, club, status, createdAt (+ decidedAt),
 *                              uid (jen když se přihlásil uživatel s účtem)
 *                              veřejně čitelné jen se status == 'accepted'; vlastník vidí i své čekající/odmítnuté
 *   registrationContacts/{id}  kontakt (e-mail/telefon) – čte jen admin, stejné id jako přihláška
 *
 * Pravidla viz firestore.rules.
 */

export type RegistrationStatus = 'pending' | 'accepted' | 'rejected'

export type Registration = {
  id: string
  tournament: string // slug turnaje (content/tournaments/<slug>.md)
  name: string
  nickname?: string
  club?: string
  status: RegistrationStatus
  uid?: string // účet, ze kterého přihláška přišla
  createdAt: Date | null
  decidedAt: Date | null
}

export type RegistrationForm = {
  name: string
  nickname: string
  club: string
  contact: string
}

export const REG_LIMITS = { name: 80, nickname: 40, club: 80, contact: 120 }

function toDate(v: unknown): Date | null {
  return v && typeof (v as Timestamp).toDate === 'function' ? (v as Timestamp).toDate() : null
}

function toRegistration(d: QueryDocumentSnapshot<DocumentData>): Registration {
  const x = d.data()
  return {
    id: d.id,
    tournament: x.tournament,
    name: x.name,
    nickname: x.nickname || undefined,
    club: x.club || undefined,
    status: x.status,
    uid: x.uid || undefined,
    createdAt: toDate(x.createdAt),
    decidedAt: toDate(x.decidedAt),
  }
}

const byCreated = (a: Registration, b: Registration) =>
  (a.createdAt?.getTime() ?? Infinity) - (b.createdAt?.getTime() ?? Infinity)

/**
 * Živý odběr dotazu – běží jen v prohlížeči (od onMounted) a jen když `enabled()` vrací truthy hodnotu.
 * Když se hodnota změní (např. jiný uživatel), odběr se restartuje.
 * Na serveru / při generování vrací počáteční hodnotu.
 */
function useLiveQuery<T>(
  build: (db: Firestore) => Query<DocumentData>,
  map: (docs: QueryDocumentSnapshot<DocumentData>[]) => T,
  initial: T,
  enabled: () => unknown = () => true,
) {
  const nuxtApp = useNuxtApp()
  const data = ref(initial) as Ref<T>
  const loading = ref(true)
  const error = ref<string | null>(null)
  let unsub: (() => void) | undefined

  function stop() {
    unsub?.()
    unsub = undefined
  }
  function start() {
    stop()
    loading.value = true
    unsub = onSnapshot(build(nuxtApp.$db as Firestore), (snap) => {
      data.value = map(snap.docs)
      loading.value = false
      error.value = null
    }, (e) => {
      error.value = firebaseErrorMessage(e)
      loading.value = false
    })
  }

  onMounted(() => {
    watch(enabled, (on) => {
      if (on) start()
      else {
        stop()
        data.value = initial
        loading.value = false
      }
    }, { immediate: true })
  })
  onBeforeUnmount(stop)

  return { data, loading, error }
}

/** Přijaté přihlášky (veřejné). Bez slugu = všechny turnaje. */
export function useAcceptedRegistrations(slug?: string) {
  const { data, loading, error } = useLiveQuery(
    (db) => {
      const c: QueryConstraint[] = [where('status', '==', 'accepted')]
      if (slug) c.push(where('tournament', '==', slug))
      return query(collection(db, 'registrations'), ...c)
    },
    docs => docs.map(toRegistration).sort(byCreated),
    [] as Registration[],
  )
  return { list: data, loading, error }
}

/** Počty přijatých hráčů podle slugu turnaje (pro kalendář). */
export function useAcceptedCounts() {
  const { list, loading } = useAcceptedRegistrations()
  const counts = computed(() => {
    const out: Record<string, number> = {}
    for (const r of list.value) out[r.tournament] = (out[r.tournament] ?? 0) + 1
    return out
  })
  return { counts, loading }
}

/** Přihlášky přihlášeného uživatele (všechny stavy). */
export function useMyRegistrations() {
  const { user } = useAuth()
  const { data, loading, error } = useLiveQuery(
    db => query(collection(db, 'registrations'), where('uid', '==', user.value?.uid ?? '')),
    docs => docs.map(toRegistration).sort(byCreated),
    [] as Registration[],
    () => user.value?.uid,
  )
  return { list: data, loading, error }
}

/**
 * Zápisy do Firestore. Volat v setup() komponenty; vrácené funkce lze použít v obsluze událostí.
 * (useNuxtApp se po `await` v obsluze události nedá spolehlivě volat, proto se zachytí tady.)
 */
export function useRegistrationActions() {
  const nuxtApp = useNuxtApp()
  const { user } = useAuth()
  const db = () => nuxtApp.$db as Firestore

  /** Odeslání přihlášky – vznikne se status 'pending', čeká na schválení adminem. */
  async function submit(tournament: string, form: RegistrationForm) {
    const ref = doc(collection(db(), 'registrations'))
    const batch = writeBatch(db())
    const data: Record<string, unknown> = {
      tournament,
      name: form.name.trim(),
      status: 'pending',
      createdAt: serverTimestamp(),
    }
    if (form.nickname.trim()) data.nickname = form.nickname.trim()
    if (form.club.trim()) data.club = form.club.trim()
    if (user.value) data.uid = user.value.uid // přihlášený uživatel – přihláška se váže k účtu
    batch.set(ref, data)
    batch.set(doc(db(), 'registrationContacts', ref.id), { tournament, contact: form.contact.trim() })
    await batch.commit()
    return ref.id
  }

  /** Uživatel stáhne svou přihlášku (jen dokud čeká na schválení). */
  async function cancel(id: string) {
    const batch = writeBatch(db())
    batch.delete(doc(db(), 'registrations', id))
    batch.delete(doc(db(), 'registrationContacts', id))
    await batch.commit()
  }

  // ---- jen admin ----
  async function setStatus(id: string, status: RegistrationStatus) {
    await updateDoc(doc(db(), 'registrations', id), { status, decidedAt: serverTimestamp() })
  }

  async function remove(id: string) {
    const batch = writeBatch(db())
    batch.delete(doc(db(), 'registrations', id))
    batch.delete(doc(db(), 'registrationContacts', id))
    await batch.commit()
  }

  return { submit, cancel, setStatus, remove }
}

// ---------------- Admin ----------------

/** Všechny přihlášky (jen admin – odběr běží, jen když enabled() je true). */
export function useAllRegistrations(enabled: () => unknown) {
  const { data, loading, error } = useLiveQuery(
    db => query(collection(db, 'registrations')),
    docs => docs.map(toRegistration).sort(byCreated),
    [] as Registration[],
    enabled,
  )
  return { list: data, loading, error }
}

/** Kontakty k přihláškám (jen admin): id přihlášky -> kontakt */
export function useRegistrationContacts(enabled: () => unknown) {
  const { data, loading, error } = useLiveQuery(
    db => query(collection(db, 'registrationContacts')),
    docs => Object.fromEntries(docs.map(d => [d.id, String(d.data().contact ?? '')])) as Record<string, string>,
    {} as Record<string, string>,
    enabled,
  )
  return { contacts: data, loading, error }
}
