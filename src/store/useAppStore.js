import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { askHalmang } from '../api/client'

const needSupabase = (get) => {
  if (supabase) return false
  get().toast('Supabase 설정(.env.local)이 필요해요', 'warning')
  return true
}

// ── 앱 전체가 함께 쓰는 상태(store) ──────────────────────
// 인증 · 가족 프로필 · 여행 바구니 · 미션 스탬프 · 할망 대화 · 아이 모드
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 알림(토스트)
      toasts: [],
      toast: (message, variant = 'success') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2800)
      },

      // ② 인증 (Supabase Auth)
      user: null,
      authReady: false,
      initAuth: async () => {
        if (!supabase) return set({ authReady: true })
        const { data } = await supabase.auth.getSession()
        set({ user: data.session?.user ?? null, authReady: true })
        if (data.session) get().loadAll()
        else set({ profileLoaded: true })
        supabase.auth.onAuthStateChange((_e, session) => {
          const prev = get().user?.id
          set({ user: session?.user ?? null })
          if (session?.user && session.user.id !== prev) { set({ profileLoaded: false }); get().loadAll() }
          if (!session) set({ profile: null, profileLoaded: true, basket: [], stamps: [], messages: [] })
        })
      },
      signUp: async (email, password) => {
        if (needSupabase(get)) return { ok: false }
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) { get().toast(error.message, 'danger'); return { ok: false } }
        // 이메일 확인이 켜져 있으면 session 이 비어 있음
        return { ok: true, needsConfirm: !data.session }
      },
      signIn: async (email, password) => {
        if (needSupabase(get)) return false
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { get().toast(error.message, 'danger'); return false }
        return true
      },
      signOut: async () => { await supabase?.auth.signOut() },

      loadAll: async () => { await Promise.all([get().loadProfile(), get().loadBasket(), get().loadStamps()]) },

      // ③ 가족 프로필
      profile: null,
      profileLoaded: false, // 로그인 직후 서버에서 가족 정보를 다 불러왔는지 (불러오기 전에는 '정보 없음'으로 판단하면 안 됨)
      loadProfile: async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', get().user.id).maybeSingle()
        set({ profileLoaded: true })
        if (error) return get().toast(error.message, 'danger')
        set({ profile: data })
      },
      saveProfile: async (p) => {
        if (needSupabase(get) || !get().user) return false
        const row = { ...p, id: get().user.id, updated_at: new Date().toISOString() }
        const { data, error } = await supabase.from('profiles').upsert(row).select().single()
        if (error) { get().toast(error.message, 'danger'); return false }
        set({ profile: data })
        get().toast('가족 정보를 저장했어요')
        return true
      },

      // ④ 여행 바구니
      basket: [],
      loadBasket: async () => {
        const { data, error } = await supabase.from('basket_items').select('*').order('day').order('created_at')
        if (error) return get().toast(error.message, 'danger')
        set({ basket: data })
      },
      addToBasket: async (spot) => {
        if (needSupabase(get)) return
        if (!get().user) return get().toast('로그인하면 바구니에 담을 수 있어요', 'warning')
        if (get().basket.some((b) => b.content_id === spot.id)) return get().toast('이미 담았어요', 'warning')
        const row = {
          content_id: spot.id, content_type: spot.type ?? '', title: spot.title, addr: spot.addr ?? '',
          image: spot.image ?? '', lat: spot.lat, lng: spot.lng, score: spot.scores?.total ?? null,
        }
        const { data, error } = await supabase.from('basket_items').insert(row).select().single()
        if (error) return get().toast(error.message, 'danger')
        set({ basket: [...get().basket, data] })
        get().toast(`'${spot.title}' 바구니에 담았어요`)
      },
      updateBasketItem: async (id, patch) => {
        const prev = get().basket
        set({ basket: prev.map((b) => (b.id === id ? { ...b, ...patch } : b)) })
        const { error } = await supabase.from('basket_items').update(patch).eq('id', id)
        if (error) { set({ basket: prev }); get().toast(error.message, 'danger') }
      },
      removeFromBasket: async (id) => {
        const prev = get().basket
        set({ basket: prev.filter((b) => b.id !== id) })
        const { error } = await supabase.from('basket_items').delete().eq('id', id)
        if (error) { set({ basket: prev }); get().toast(error.message, 'danger') }
      },

      // ⑤ 미션 스탬프
      stamps: [],
      loadStamps: async () => {
        const { data, error } = await supabase.from('mission_stamps').select('mission_id')
        if (error) return get().toast(error.message, 'danger')
        set({ stamps: data.map((r) => r.mission_id) })
      },
      toggleStamp: async (missionId) => {
        if (!get().user) return get().toast('로그인하면 스탬프가 저장돼요', 'warning')
        const done = get().stamps.includes(missionId)
        const prev = get().stamps
        set({ stamps: done ? prev.filter((x) => x !== missionId) : [...prev, missionId] })
        const q = done
          ? supabase.from('mission_stamps').delete().eq('mission_id', missionId)
          : supabase.from('mission_stamps').insert({ mission_id: missionId })
        const { error } = await q
        if (error) { set({ stamps: prev }); get().toast(error.message, 'danger') }
        else if (!done) get().toast('스탬프 쾅! 🎉')
      },

      // ⑥ 할망 에이전트 대화 — 페이지를 옮겨도 대화가 남도록 store 에 둡니다
      messages: [],
      chatLoading: false,
      sendMessage: async (text) => {
        const history = get().messages.map((m) => ({ role: m.role, content: m.text }))
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true })
        try {
          const { answer, steps } = await askHalmang(text, history, get().profile)
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps }] })
        } catch (e) {
          get().toast(e.message, 'danger')
        } finally {
          set({ chatLoading: false })
        }
      },

      // ⑦ 아이와 함께 모드 (새로고침해도 유지)
      kidsMode: false,
      setKidsMode: (kidsMode) => set({ kidsMode }),
      ageBand: 'preschool',
      setAgeBand: (ageBand) => set({ ageBand }),
    }),
    {
      name: 'halmang-gildongmu',
      partialize: (s) => ({ kidsMode: s.kidsMode, ageBand: s.ageBand }),
    },
  ),
)
