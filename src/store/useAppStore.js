import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { askHalmang } from '../api/client'
import { youngestBand } from '../../shared/lore'

// 후기 표(trip_reviews)를 아직 안 만들었을 때 나는 오류인지 (SQL 을 실행하기 전에는 조용히 넘어간다)
const isMissingTable = (e) => e?.code === 'PGRST205' || e?.code === '42P01' || (/trip_reviews/.test(e?.message ?? '') && /schema cache|does not exist/.test(e?.message ?? ''))

const readLegacyStamps = () => { try { return JSON.parse(localStorage.getItem('halmang-history-stamps')) ?? [] } catch { return [] } }

const needSupabase = (get) => {
  if (supabase) return false
  get().toast('Supabase 설정(.env.local)이 필요해요', 'warning')
  return true
}

// ── 앱 전체가 함께 쓰는 상태(store) ──────────────────────
// 인증 · 가족 프로필 · 여행 일정 · 미션 스탬프 · 할망 대화 · 아이 모드
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
          if (!session) set({ profile: null, profileLoaded: true, basket: [], stamps: [], reviews: [], messages: [] })
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

      loadAll: async () => {
        await Promise.all([get().loadProfile(), get().loadBasket(), get().loadStamps(), get().loadReviews()])
        get().mergeLocalStamps()
      },

      // ③ 가족 프로필
      profile: null,
      profileLoaded: false, // 로그인 직후 서버에서 가족 정보를 다 불러왔는지 (불러오기 전에는 '정보 없음'으로 판단하면 안 됨)
      loadProfile: async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', get().user.id).maybeSingle()
        set({ profileLoaded: true })
        if (error) return get().toast(error.message, 'danger')
        // 가족 정보의 아이 나이가 추천 기준이 되도록 불러올 때마다 맞춘다 (아이가 여럿이면 가장 어린 아이)
        set({ profile: data, ...(youngestBand(data?.child_age_bands) ? { ageBand: youngestBand(data.child_age_bands) } : {}) })
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

      // ④ 여행 일정
      basket: [],
      loadBasket: async () => {
        const { data, error } = await supabase.from('basket_items').select('*').order('day').order('created_at')
        if (error) return get().toast(error.message, 'danger')
        set({ basket: data })
      },
      addToBasket: async (spot) => {
        if (needSupabase(get)) return
        if (!get().user) return get().toast('로그인하면 일정에 담을 수 있어요', 'warning')
        if (get().basket.some((b) => b.content_id === spot.id)) return get().toast('이미 담았어요', 'warning')
        const row = {
          content_id: spot.id, content_type: spot.type ?? '', title: spot.title, addr: spot.addr ?? '',
          image: spot.image ?? '', lat: spot.lat, lng: spot.lng, score: spot.scores?.total ?? null,
        }
        const { data, error } = await supabase.from('basket_items').insert(row).select().single()
        if (error) return get().toast(error.message, 'danger')
        set({ basket: [...get().basket, data] })
        get().toast(`'${spot.title}' 일정에 담았어요`)
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
      // 로그인하지 않고 모은 역사 도장: 이 기기에 저장해 두었다가, 로그인하면 계정으로 합친다
      localStamps: readLegacyStamps(),
      toggleLocalStamp: (id) => {
        const cur = get().localStamps
        set({ localStamps: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] })
      },
      mergeLocalStamps: async () => {
        const local = get().localStamps
        if (!local.length || !get().user || !supabase) return
        const { error } = await supabase.from('mission_stamps').upsert(local.map((mission_id) => ({ mission_id })), { onConflict: 'user_id,mission_id', ignoreDuplicates: true })
        if (error) return // 실패해도 이 기기의 도장은 그대로 남겨 두고, 다음 로그인 때 다시 시도
        set({ localStamps: [], stamps: [...new Set([...get().stamps, ...local])] })
        try { localStorage.removeItem('halmang-history-stamps') } catch { /* 무시 */ }
        get().toast(`이 기기에서 모은 도장 ${local.length}개를 계정으로 옮겼어요`)
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

      // ⑥ 여행 후기: 일차별로 별점·글·그날의 루트를 남긴다. 공개를 고르면 다른 가족도 볼 수 있다
      reviews: [],            // 내 후기
      publicReviews: [],      // 다른 가족이 공개한 후기
      reviewsReady: true,     // false 면 DB 에 trip_reviews 표가 아직 없다 (supabase/reviews.sql 미실행)
      loadReviews: async () => {
        const { data, error } = await supabase.from('trip_reviews').select('*').eq('user_id', get().user.id).order('created_at', { ascending: false })
        if (error) return set({ reviewsReady: !isMissingTable(error) })
        set({ reviews: data, reviewsReady: true })
      },
      loadPublicReviews: async () => {
        if (!supabase) return
        const { data, error } = await supabase.from('trip_reviews').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(60)
        if (error) return set({ reviewsReady: !isMissingTable(error) })
        set({ publicReviews: data, reviewsReady: true })
      },
      saveReview: async (r) => {
        if (needSupabase(get)) return false
        if (!get().user) { get().toast('로그인하면 후기를 남길 수 있어요', 'warning'); return false }
        if (!get().reviewsReady) { get().toast('후기 기능을 쓰려면 Supabase 에서 reviews.sql 을 먼저 실행해 주세요', 'warning'); return false }
        const row = {
          day: r.day, title: r.title.trim(), body: r.body.trim(), rating: r.rating, route: r.route, is_public: r.is_public,
          author: get().profile?.display_name || '익명의 가족', updated_at: new Date().toISOString(),
        }
        const q = r.id
          ? supabase.from('trip_reviews').update(row).eq('id', r.id)
          : supabase.from('trip_reviews').insert(row)
        const { data, error } = await q.select().single()
        if (error) { get().toast(error.message, 'danger'); return false }
        set({ reviews: r.id ? get().reviews.map((x) => (x.id === r.id ? data : x)) : [data, ...get().reviews] })
        get().loadPublicReviews()
        get().toast(r.id ? '후기를 고쳤어요' : '후기를 남겼어요 🎉')
        return true
      },
      deleteReview: async (id) => {
        const prev = get().reviews
        set({ reviews: prev.filter((x) => x.id !== id), publicReviews: get().publicReviews.filter((x) => x.id !== id) })
        const { error } = await supabase.from('trip_reviews').delete().eq('id', id)
        if (error) { set({ reviews: prev }); get().toast(error.message, 'danger') }
      },

      // ⑦ 할망 에이전트 대화 — 페이지를 옮겨도 대화가 남도록 store 에 둡니다
      messages: [],
      chatLoading: false,
      sendMessage: async (text) => {
        // 오류 말풍선은 할망에게 보내는 대화 기록에서 뺀다
        const history = get().messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.text }))
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true })
        try {
          const { answer, steps, provider, fallback } = await askHalmang(text, history, get().profile)
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps, provider, fallback }] })
        } catch (e) {
          // 잠깐 뜨는 알림 대신 대화 안에 이유를 남기고, 다시 시도할 수 있게 한다
          set({ messages: [...get().messages, { role: 'assistant', text: e.message, error: true, retryText: text }] })
        } finally {
          set({ chatLoading: false })
        }
      },
      // 마지막에 실패한 질문을 다시 보낸다 (실패 말풍선과 그 질문을 지우고 새로 보냄)
      retryMessage: async () => {
        const list = get().messages
        const last = list.at(-1)
        if (!last?.error) return
        const text = last.retryText
        set({ messages: list.slice(0, list.length - (list.at(-2)?.role === 'user' ? 2 : 1)) })
        await get().sendMessage(text)
      },
      clearChat: () => set({ messages: [] }),

      // ⑧ 아이 연령대 (새로고침해도 유지)
      ageBand: 'preschool',
      setAgeBand: (ageBand) => set({ ageBand }),
    }),
    {
      name: 'halmang-gildongmu',
      partialize: (s) => ({ ageBand: s.ageBand, localStamps: s.localStamps }),
    },
  ),
)
