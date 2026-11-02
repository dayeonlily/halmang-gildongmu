# 할망 길동무 — 아이와 함께 걷는 제주

Vite + React + Router + Zustand + Bootstrap + Supabase + three.js(react-three-fiber) + Claude 에이전트

## 시작하기
```bash
cd C:\vibe\prj\project
copy .env.example .env.local     # 값 채우기
npm run dev                      # http://localhost:5173  (화면 + /api 함께 동작)
```
1. Supabase 대시보드 → SQL Editor 에 `supabase/schema.sql` 을 붙여 넣고 Run
2. `.env.local` 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATA_GO_KR_KEY`(Decoding 키), `ANTHROPIC_API_KEY` 입력
3. `npm run dev` 로 실행해 `/api/hello` 에서 키 설정 여부를 확인
   (공공데이터포털에서 `KorService2`, `KorWithService2`, `VilageFcstInfoService_2.0` 활용 신청 필요)

## 구조
```
api/       Vercel 서버 함수 (/api/파일명) — 비밀 키는 여기서만
server/    공공데이터 호출·점수 계산 (api/ 와 에이전트가 함께 import)
shared/    화면·에이전트 공용 콘텐츠 (할망 이야기·제주어·미션·체크리스트)
src/
  router.jsx · layouts/   주소별 페이지, 좌측 레일(모바일: 하단 탭), 로그인 가드
  store/                  Zustand: 인증·프로필·바구니·스탬프·대화·아이 모드
  scene/JejuScene.jsx     three.js 3D 제주섬 + 스팟 핀 + 할망 캐릭터
  pages/                  Home · Login · Profile · Explore · Basket · Kids · Care · Halmang · Status
supabase/schema.sql       profiles · basket_items · mission_stamps (+RLS)
```

## 공공데이터 API 3종
| API | 역할 |
|---|---|
| 한국관광공사 국문 관광정보 (KorService2) | 스팟 검색·요금(문화시설) |
| 한국관광공사 무장애 여행정보 (KorWithService2) | 유모차·휠체어·수유실 → 접근성 점수 |
| 기상청 단기예보 | 비·더위·바람 → 안전 점수, 실내 대안 |

추천 점수 = 접근성 45% + 안전 30% + 가격 25% (`server/recommend.js`)

## 배포 (Vercel)
`vercel` 로 프로젝트 연결 → Environment Variables 에 위 4개 값 등록 → `vercel --prod`
