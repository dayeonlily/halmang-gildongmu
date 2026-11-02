# 할망 길동무 — 아이와 함께 걷는 제주

Vite + React + Router + Zustand + Bootstrap + Supabase + three.js(react-three-fiber) + Claude 에이전트

## 시작하기
```bash
cd C:\vibe\prj\project
copy .env.example .env.local     # 값 채우기
npm run dev                      # http://localhost:5173  (화면 + /api 함께 동작)
```
1. Supabase 대시보드 → SQL Editor 에 `supabase/schema.sql` 을 붙여 넣고 Run
2. `.env.local` 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATA_GO_KR_KEY`(Decoding 키), `ANTHROPIC_API_KEY` 입력 (선택: Claude 를 쓸 수 없을 때 대신 답하는 `GEMINI_API_KEY`)
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

## 제주 역사 스탬프 투어 (/history)
연령별 탭(미취학~초등 저학년 / 초등 고학년)에서 선사→탐라→고려→조선→근현대 순으로 코스 카드를 보고 스탬프를 찍어요.
- 코스 데이터: `shared/history.js` (카드 추가·수정은 여기만)
- 화면: `src/pages/HistoryTour.jsx`, 스타일: `src/styles/theme.css` 맨 아래
- 스탬프 저장: 로그인하면 Supabase `mission_stamps`, 아니면 이 기기(localStorage) — DB 변경 없음
- 카드의 검색 버튼은 `/explore?q=장소명` 으로 길동무 찾기를 엽니다

## 공공데이터 API 3종
| API | 역할 |
|---|---|
| 한국관광공사 국문 관광정보 (KorService2) | 스팟 검색·요금(문화시설) |
| 한국관광공사 무장애 여행정보 (KorWithService2) | 유모차·휠체어·수유실 → 접근성 점수 |
| 기상청 단기예보 | 비·더위·바람 → 안전 점수, 실내 대안 |

추천 점수 = 접근성 45% + 안전 30% + 가격 25% (`server/recommend.js`)

## 배포 (Vercel)
`vercel` 로 프로젝트 연결 → Environment Variables 에 위 4개 값 등록 → `vercel --prod`

## 장소 정보 미리 받아 두기 (공공데이터 하루 한도 대응)

공공데이터포털은 API마다 **하루 호출 횟수**가 정해져 있어서(개발 계정), 검색할 때마다 장소 정보를 부르면 금방 바닥납니다.
그래서 장소별 소개글·소개정보·무장애 정보와 집중률 예측을 파일(`server/data/places.json`, `crowd.json`)에 미리 받아 두고,
서버는 이 파일을 먼저 읽습니다. 파일에 없는 장소만 공공데이터를 직접 부릅니다.

- **자동:** `.github/workflows/place-cache.yml` 이 매일 한국 시간 00:30(한도 초기화 직후)에 실행되어 조금씩 채우고 저장소에 올립니다. Vercel 이 알아서 다시 배포합니다.
  GitHub 저장소 → Settings → Secrets and variables → Actions 에 `DATA_GO_KR_KEY`(Decoding 키)를 등록해야 합니다.
- **손으로:** `npm run cache:places` (옵션: `-- --max 800 --types 12,28,14,15`). 한도에 닿으면 거기서 멈추고 받은 것까지 저장하며, 다음 실행에서 이어서 채웁니다.
- 제주 장소는 약 1,700곳이라 하루 한도로는 이틀쯤이면 다 채워집니다. 채워지기 전에는 한도 초과 안내가 화면에 나옵니다.
