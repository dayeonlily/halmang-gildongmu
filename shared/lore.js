// 화면(src)과 에이전트(api/agent.js)가 함께 쓰는 콘텐츠 — 이야기·제주어·미션·체크리스트

// 아이 연령대 (프로필·미션·체크리스트가 모두 이 키를 씁니다)
export const AGE_BANDS = [
  { key: 'infant', label: '영아 (0~1세)', short: '영아', icon: 'emoji-smile' },
  { key: 'toddler', label: '걸음마기 (1~3세)', short: '걸음마', icon: 'person-walking' },
  { key: 'preschool', label: '유아 (4~6세)', short: '유아', icon: 'palette' },
  { key: 'lower', label: '초등 저학년 (7~9세)', short: '저학년', icon: 'backpack' },
  { key: 'upper', label: '초등 고학년 (10~12세)', short: '고학년', icon: 'compass' },
]

export const AGE_LABEL = Object.fromEntries(AGE_BANDS.map((a) => [a.key, a.short]))

// 아이가 여럿이면 가장 어린 아이를 기준으로 한다 (안전·적합도는 어린 쪽에 맞춰야 하므로). AGE_BANDS 는 어린 순서
export const youngestBand = (bands = []) => AGE_BANDS.find((a) => bands.includes(a.key))?.key

export const NEEDS = [
  { key: 'stroller', label: '유모차', icon: 'cart' },
  { key: 'wheelchair', label: '휠체어', icon: 'person-wheelchair' },
  { key: 'nursing', label: '수유·기저귀 케어', icon: 'droplet-half' },
  { key: 'sensory', label: '조용한 환경 선호', icon: 'volume-mute' },
]

export const BUDGETS = [
  { key: 'free', label: '무료 위주' },
  { key: 'low', label: '1만원 안팎' },
  { key: 'mid', label: '3만원 안팎' },
  { key: 'any', label: '상관없어요' },
]

// ── 할망 이야기 (구연체) ─────────────────────────────────
export const STORIES = [
  {
    id: 'seolmundae',
    title: '설문대할망, 한라산을 쌓다',
    emoji: '⛰️',
    minAge: 'toddler',
    place: '한라산·물장오리',
    lines: [
      '아이고, 우리 강아지 왔구나. 앉아 보라, 할망이 아주 오래된 이야기 하나 들려주켜.',
      '옛날 옛적, 하늘과 땅이 딱 붙어 있던 때가 있었어. 설문대할망이 기지개를 쭉 켜니까 하늘이 위로 쑤욱 올라가고 땅이 아래로 내려앉았주.',
      '할망은 어찌나 큰지 치마폭에 흙을 가득 퍼 담아 날랐어. 한 줌 두 줌 쌓으니 그게 바로 한라산이 되었구나.',
      '치마 터진 구멍으로 흙이 졸졸 흘러내린 자리마다 작은 오름이 봉긋봉긋 생겼주. 그래서 제주에는 오름이 삼백 개가 넘는 거여.',
      '한라산 꼭대기가 뾰족해서 할망 머리가 아프다고 하니, 꼭대기를 뚝 떼어 던져 버렸어. 그게 바다에 떨어져 산방산이 되었다는 이야기도 있지.',
      '자, 우리 강아지도 오름 하나 올라가 볼까? 할망이 쌓은 흙 위를 한 걸음 한 걸음 걸어 보는 거여.',
    ],
  },
  {
    id: 'ohbaek',
    title: '오백 아들과 죽솥 이야기',
    emoji: '🪨',
    minAge: 'preschool',
    place: '영실기암·오백장군',
    lines: [
      '오늘은 형제 사랑 이야기를 해 주켜. 설문대할망에게는 아들이 오백이나 있었어.',
      '어느 해 큰 흉년이 들어 먹을 게 없었지. 할망은 아들들 먹일 죽을 큰 솥에 끓이다가 그만 발을 헛디뎌 솥에 빠지고 말았어.',
      '아들들이 돌아와 죽을 맛있게 먹었는데, 막내가 뒤늦게 돌아와 죽을 먹다 뼈다귀를 발견했어. 막내는 너무 슬퍼서 멀리 차귀도로 달려가 바위가 되었주.',
      '형들도 그 사실을 알고 한라산 영실 계곡에 모여 슬피 울다 모두 바위가 되었다. 그게 오백장군 바위여.',
      '어때, 바위들이 꼭 형제들 같지? 영실에 가면 바위마다 이름을 붙여 보렴.',
      '(보호자님께: 슬픈 대목은 아이 반응을 보며 "가족을 아끼는 마음" 이야기로 이어 가 주세요.)',
    ],
  },
  {
    id: 'haenyeo',
    title: '바다 숨 쉬는 해녀 할망',
    emoji: '🐚',
    minAge: 'toddler',
    place: '해녀박물관·바닷가',
    lines: [
      '혼저옵서예! 오늘은 바다 밑으로 들어가는 해녀 할망 이야기여.',
      '해녀는 산소통 없이 숨 한 번 꾹 참고 바다 속으로 쏙 들어가. 전복, 소라, 미역을 따 오는 거주. 이걸 물질이라 해.',
      '물 위로 올라와 참았던 숨을 "호오이~" 하고 내쉬는 소리가 숨비소리여. 휘파람 같지? 우리도 한번 따라 해 볼까?',
      '테왁은 물 위에 둥둥 뜨는 동그란 박이고, 망사리는 딴 것을 담는 그물주머니여. 테왁이 해녀 할망 쉼터이자 안전 장비주.',
      '해녀는 바다가 주는 만큼만 따고, 어린 것은 놓아줬어. 바다와 사이좋게 지내는 지혜였지. 그래서 해녀 문화는 유네스코 인류무형문화유산이 되었단다.',
      '오늘 바닷가에서는 물 가까이 가지 말고, 할망 손 꼭 잡고 구경만 하는 거여. 알았지?',
    ],
  },
  {
    id: 'hareubang',
    title: '돌하르방은 왜 눈이 커요?',
    emoji: '🗿',
    minAge: 'infant',
    place: '제주 돌문화공원',
    lines: [
      '우리 아기, 돌하르방 보았나? 동그란 눈에 커다란 코, 두 손은 배 위에 가지런히 얹고 서 있주.',
      '제주는 바람 많고, 돌 많고, 여자 많다 해서 삼다도라 불렀어. 돌이 그만큼 흔했으니 돌로 마을 지킴이를 만든 거여.',
      '하르방은 할아버지라는 뜻이야. 마을 입구에 서서 나쁜 기운은 막고 사람들을 지켜 주었지.',
      '눈이 큰 건 사방을 두루 살피려는 거여. 코를 쓰다듬으면 좋은 일이 생긴다는 말도 있단다.',
      '우리 아기도 돌하르방처럼 눈 크게 뜨고 제주를 구경해 볼까?',
    ],
  },
  {
    id: 'yeongdeung',
    title: '바람의 할망, 영등할망',
    emoji: '🌬️',
    minAge: 'lower',
    place: '제주 전역',
    lines: [
      '음력 이월이면 제주 바다에 바람이 휘잉 불지? 그건 영등할망이 오시는 소리여.',
      '영등할망은 바람의 여신이야. 이월 초하루에 제주에 와서 보름 동안 머물며 바다에 해초와 소라 씨를 뿌려 주고 가신다지.',
      '그래서 이 기간에는 바다에 나가지 않고 할망을 정성껏 맞이했어. 해녀들은 풍성한 물질을 빌었고.',
      '바람은 무섭기도 하지만 바다 생명을 키워 주는 선물이기도 해. 오늘 바람 부는 날이면, 영등할망이 오셨나 하고 말해 보렴.',
    ],
  },
]

// ── 제주어 카드 (연령별) ─────────────────────────────────
// ※ 표기·발음은 지역과 세대에 따라 조금씩 달라요. 화면에도 그렇게 안내합니다.
export const JEJU_WORDS_BY_AGE = {
  // 영아: 보호자가 들려주는 짧은 소리 말
  infant: [
    { jeju: '혼저옵서예', ko: '어서 오세요', tip: '제주 어디서나 들리는 환영 인사', emoji: '👋' },
    { jeju: '사랑햄수다', ko: '사랑해요', tip: '아기 눈을 보며 천천히 말해 주세요', emoji: '💛' },
    { jeju: '고맙수다', ko: '고맙습니다', tip: '"-수다"는 정중한 끝맺음', emoji: '🙏' },
    { jeju: '바당', ko: '바다', tip: '"바당~ 철썩" 파도 소리와 함께 들려주세요', emoji: '🌊' },
    { jeju: '보름', ko: '바람', tip: '바람이 불 때 "보름 분다~" 하고 말해 보세요', emoji: '🌬️' },
    { jeju: '하르방', ko: '할아버지', tip: '돌하르방은 "돌 할아버지"라는 뜻이에요', emoji: '🗿' },
    { jeju: '할망', ko: '할머니', tip: '설문대할망, 영등할망의 그 "할망"', emoji: '👵' },
    { jeju: '웡이자랑', ko: '자장자장 (제주 자장가 소리)', tip: '아기를 재울 때 불러 주던 제주 자장가의 후렴이에요', emoji: '🌙' },
  ],
  // 걸음마기: 동물·가족·자연 이름
  toddler: [
    { jeju: '강생이', ko: '강아지', tip: '"멍멍!" 소리도 같이 내 봐요', emoji: '🐶' },
    { jeju: '고냉이', ko: '고양이', tip: '"야옹~" 하고 불러 봐요', emoji: '🐱' },
    { jeju: '쉐', ko: '소', tip: '"음메~" 제주 들판의 소를 만나면 불러 봐요', emoji: '🐮' },
    { jeju: '돗', ko: '돼지', tip: '제주 흑돼지의 "돼지"를 제주어로 "돗"이라 해요', emoji: '🐷' },
    { jeju: '독', ko: '닭', tip: '"꼬꼬댁!" 소리와 함께', emoji: '🐔' },
    { jeju: '어멍', ko: '엄마(어머니)', tip: '엄마를 부르는 제주 말', emoji: '👩' },
    { jeju: '아방', ko: '아빠(아버지)', tip: '아빠를 부르는 제주 말', emoji: '👨' },
    { jeju: '오름', ko: '작은 화산 언덕', tip: '제주에만 360여 개가 있어요', emoji: '⛰️' },
  ],
  // 유아: 인사·음식·바다 먹거리
  preschool: [
    { jeju: '혼저 먹읍서', ko: '어서 드세요', tip: '밥 먹기 전에 가족에게 말해 봐요', emoji: '🍚' },
    { jeju: '하영 먹읍서', ko: '많이 드세요', tip: '"하영"은 "많이"라는 뜻이에요', emoji: '🥢' },
    { jeju: '곱닥허다', ko: '예쁘다', tip: '예쁜 꽃을 보면 "곱닥허다!"', emoji: '🌸' },
    { jeju: '메역', ko: '미역', tip: '바다에서 자라는 초록 풀 같은 먹거리', emoji: '🌿' },
    { jeju: '구젱기', ko: '소라', tip: '귀에 대면 바다 소리가 나요', emoji: '🐚' },
    { jeju: '보말', ko: '바다 고둥', tip: '보말국·보말죽으로 먹어요', emoji: '🐌' },
    { jeju: '감저', ko: '고구마', tip: '제주에서는 고구마를 "감저"라 불러요', emoji: '🍠' },
    { jeju: '지슬', ko: '감자', tip: '제주에서는 감자를 "지슬"이라 불러요', emoji: '🥔' },
  ],
  // 초등 저학년: 묻고 답하는 말, 짧은 표현
  lower: [
    { jeju: '무사', ko: '왜', tip: '"무사 경 햄수광?"은 "왜 그러고 있어요?"', emoji: '❓' },
    { jeju: '게메마씸', ko: '글쎄요', tip: '"-마씸"은 높임을 더하는 말이에요', emoji: '🤔' },
    { jeju: '호썰', ko: '조금', tip: '"호썰 쉬엉 갑서" = 조금 쉬었다 가세요', emoji: '☕' },
    { jeju: '하영', ko: '많이', tip: '"하영 놀아보게!" = 많이 놀아 보자!', emoji: '🎈' },
    { jeju: '몬딱', ko: '모두, 전부', tip: '"몬딱 혼디 가게" = 모두 같이 가자', emoji: '👨‍👩‍👧' },
    { jeju: '혼디', ko: '함께', tip: '"혼디 놀게" = 같이 놀자', emoji: '🤝' },
    { jeju: '어디 감수광?', ko: '어디 가세요?', tip: '길에서 만난 어른께 건네는 인사말', emoji: '🚶' },
    { jeju: '폭삭 속았수다', ko: '정말 수고 많으셨어요', tip: '"폭삭"은 아주, "속다"는 수고하다', emoji: '🌼' },
  ],
  // 초등 고학년: 문화·생활 낱말과 정신
  upper: [
    { jeju: '괸당', ko: '가까운 친척·이웃', tip: '피를 나눈 사이를 넘어 이웃까지 아우르는 말', emoji: '🏘️' },
    { jeju: '삼춘', ko: '어른을 부르는 다정한 호칭', tip: '꼭 친척이 아니어도 "삼춘"이라 불러요', emoji: '🧑‍🌾' },
    { jeju: '물질', ko: '해녀가 바다에서 해산물을 따는 일', tip: '해녀 문화는 유네스코 인류무형문화유산이에요', emoji: '🤿' },
    { jeju: '테왁·망사리', ko: '해녀의 떠 있는 도구와 그물주머니', tip: '테왁은 쉼터, 망사리는 수확물 주머니', emoji: '🟠' },
    { jeju: '수눌음', ko: '서로 돕는 품앗이', tip: '농사·집짓기를 번갈아 도우며 함께 살던 문화', emoji: '🌾' },
    { jeju: '조냥', ko: '아끼고 절약하는 생활 지혜', tip: '"조냥정신"은 자원이 귀한 섬에서 이어진 정신', emoji: '♻️' },
    { jeju: '지꺼지다', ko: '기쁘다', tip: '"지꺼진 하루"처럼 써 볼 수 있어요', emoji: '😊' },
    { jeju: '놀멍 쉬멍 걸으멍', ko: '놀며 쉬며 걸으며', tip: '제주 올레길의 느린 여행 정신', emoji: '🚶' },
  ],
}
// 에이전트·옛 코드용: 모든 연령 카드를 중복 없이 한 줄로
export const JEJU_WORDS = Object.values(JEJU_WORDS_BY_AGE).flat().filter((w, i, a) => a.findIndex((x) => x.jeju === w.jeju) === i)
export const wordsFor = (ageKey) => JEJU_WORDS_BY_AGE[ageKey] ?? JEJU_WORDS_BY_AGE.preschool

// ── 연령별 미션 카드 ─────────────────────────────────────
// kind: 미션의 성격 (화면에서 종류별로 골라 볼 수 있어요)
export const MISSION_KINDS = [
  { key: 'sense', label: '오감', icon: 'ear' },
  { key: 'body', label: '몸놀이', icon: 'person-walking' },
  { key: 'look', label: '관찰', icon: 'binoculars' },
  { key: 'make', label: '만들기', icon: 'palette' },
  { key: 'culture', label: '문화', icon: 'bank' },
  { key: 'heart', label: '배려', icon: 'heart' },
]
// ※ id 는 저장된 스탬프와 이어지니 바꾸지 마세요 (m- 로 시작하는 건 처음부터 있던 미션)
export const MISSIONS = [
  // ─ 영아(0~1세): 보호자와 함께하는 오감 놀이 ─
  { id: 'm-stone', age: ['infant', 'toddler'], kind: 'culture', title: '돌하르방 코 쓰다듬기', text: '돌하르방을 만나면 코를 살짝 쓰다듬고 "안녕" 인사해요.', icon: 'hand-index-thumb', stamp: '🗿' },
  { id: 'm-wind', age: ['infant', 'toddler', 'preschool'], kind: 'sense', title: '바람 소리 듣기', text: '눈을 감고 10초 동안 바람 소리를 들어요. 무슨 소리 같아요?', icon: 'wind', stamp: '🌬️' },
  { id: 'i-sea', age: ['infant'], kind: 'sense', title: '파도 소리 들려주기', text: '아기를 안고 파도 소리를 1분 들려주며 "철썩~ 바당 소리" 하고 말해 줘요. (물가에서 한 걸음 떨어져서)', icon: 'water', stamp: '🌊' },
  { id: 'i-touch', age: ['infant'], kind: 'sense', title: '보드라운 것 만져 보기', text: '안전하고 깨끗한 곳에서 풀잎·고운 모래·돌담 앞 바람을 살짝 느끼게 해 줘요.', icon: 'hand-index', stamp: '🌿' },
  { id: 'i-yellow', age: ['infant'], kind: 'look', title: '노란 유채꽃 보여주기', text: '노란 꽃을 가리키며 "노랑~ 예쁘다" 하고 말해 줘요. 아기가 시선을 따라가는지 지켜봐요.', icon: 'flower1', stamp: '🌼' },
  { id: 'i-lullaby', age: ['infant'], kind: 'culture', title: '제주 자장가 불러 주기', text: '낮잠 전에 "웡이자랑 웡이자랑" 하고 천천히 흥얼거려 줘요.', icon: 'moon-stars', stamp: '🌙' },
  { id: 'i-scent', age: ['infant'], kind: 'sense', title: '귤 향기 맡아 보기', text: '귤 껍질의 향기를 코 가까이에서 맡게 해 줘요. (알레르기가 없을 때만, 입에 넣지 않게)', icon: 'emoji-smile', stamp: '🍊' },
  { id: 'i-photo', age: ['infant'], kind: 'make', title: '첫 제주 사진 남기기', text: '아기와 바다·오름 배경으로 사진 한 장을 찍고 오늘 날짜를 적어 두어요.', icon: 'camera', stamp: '📷' },

  // ─ 걸음마기(1~3세): 몸으로 만나는 제주 ─
  { id: 'm-color', age: ['toddler', 'preschool'], kind: 'look', title: '제주 색깔 찾기', text: '검은 돌, 노란 유채, 파란 바다. 보이는 색을 손가락으로 짚어 봐요.', icon: 'palette', stamp: '🎨' },
  { id: 't-stack', age: ['toddler'], kind: 'make', title: '돌 세 개 쌓기', text: '해변의 큰 돌 세 개를 쌓아 봐요. 작은 돌은 입에 넣지 않게 곁에서 지켜봐요.', icon: 'layers', stamp: '🪨' },
  { id: 't-animal', age: ['toddler'], kind: 'sense', title: '동물 소리 따라 하기', text: '강생이·고냉이·쉐 소리를 내며 놀아요. (제주 목장·농장에서 만나면 더 좋아요)', icon: 'megaphone', stamp: '🐮' },
  { id: 't-hop', age: ['toddler'], kind: 'body', title: '언덕 폴짝폴짝', text: '낮고 완만한 언덕에서 보호자 손을 잡고 폴짝폴짝 다섯 번 뛰어요.', icon: 'arrow-up-circle', stamp: '🦘' },
  { id: 't-orange', age: ['toddler'], kind: 'look', title: '주황색 찾기', text: '길에서 귤·꽃·지붕 중 주황색을 찾으면 "주황!" 하고 외쳐요.', icon: 'circle-fill', stamp: '🟠' },
  { id: 't-bye', age: ['toddler'], kind: 'heart', title: '바다에게 인사하기', text: '"바당아 안녕~" 하고 손을 흔들어요. 물 가까이는 가지 않고 모래 위에서만!', icon: 'hand-thumbs-up', stamp: '👋' },
  { id: 't-hareubang', age: ['toddler', 'preschool'], kind: 'body', title: '돌하르방 따라 하기', text: '두 손을 배 위에 올리고 눈을 크게 뜨고 꼼짝 않고 서 있어 봐요. 누가 더 오래 버틸까요?', icon: 'emoji-neutral', stamp: '🗿' },

  // ─ 유아(4~6세): 표현하고 체험하기 ─
  { id: 'm-sumbi', age: ['preschool', 'lower'], kind: 'body', title: '숨비소리 따라 하기', text: '숨을 크게 들이마시고 "호오이~" 휘파람처럼 내쉬어 봐요.', icon: 'mic', stamp: '🐚' },
  { id: 'm-oreum', age: ['preschool', 'lower'], kind: 'make', title: '오름 이름 짓기', text: '오름이나 언덕을 보고 나만의 이름을 지어 가족에게 소개해요.', icon: 'signpost-split', stamp: '⛰️' },
  { id: 'm-word', age: ['preschool', 'lower', 'upper'], kind: 'culture', title: '제주어 3개 말하기', text: '오늘 제주어 카드에서 배운 말 세 가지를 하루 동안 써 봐요.', icon: 'chat-heart', stamp: '💬' },
  { id: 'p-draw', age: ['preschool'], kind: 'make', title: '오늘의 풍경 그리기', text: '보이는 오름이나 바다 중 하나를 종이에 그려요. 어디가 가장 마음에 들었는지 말해 봐요.', icon: 'brush', stamp: '🖍️' },
  { id: 'p-shell', age: ['preschool'], kind: 'look', title: '다른 조개껍데기 3가지', text: '모양이 다른 조개껍데기 세 가지를 찾아 사진을 찍어요. 사진만 찍고 제자리에 두고 와요.', icon: 'search-heart', stamp: '🐚' },
  { id: 'p-wall', age: ['preschool'], kind: 'look', title: '돌담 구멍으로 바람 느끼기', text: '돌담 앞에 서서 구멍으로 바람이 지나가는 걸 느껴 봐요. 돌담은 올라타지 않아요.', icon: 'wind', stamp: '🧱' },
  { id: 'p-step', age: ['preschool'], kind: 'body', title: '할망 걸음으로 성큼성큼', text: '설문대할망처럼 아주 큰 걸음으로 열 걸음을 걸어 봐요. 작은 걸음과 어느 쪽이 빠를까요?', icon: 'person-walking', stamp: '👣' },
  { id: 'p-thanks', age: ['preschool'], kind: 'heart', title: '"고맙수다" 말하기', text: '오늘 나를 도와준 사람에게 "고맙수다!" 하고 인사해요.', icon: 'heart', stamp: '🙏' },
  { id: 'p-tewak', age: ['preschool'], kind: 'culture', title: '테왁과 망사리 찾기', text: '해녀박물관이나 바닷가에서 테왁(둥근 박)과 망사리(그물주머니)를 찾아 사진을 찍어요.', icon: 'binoculars', stamp: '🟠' },

  // ─ 초등 저학년(7~9세): 관찰하고 이야기하기 ─
  { id: 'm-stone2', age: ['lower', 'upper'], kind: 'look', title: '돌담 구멍의 비밀', text: '제주 돌담은 구멍이 숭숭 뚫려 있어요. 왜 그럴까요? (바람이 지나가도록!)', icon: 'search', stamp: '🧱' },
  { id: 'm-trash', age: ['lower', 'upper'], kind: 'heart', title: '해변 쓰레기 3개 줍기', text: '바다를 아끼는 해녀 할망처럼, 안전한 곳에서 쓰레기 세 개를 주워요.', icon: 'recycle', stamp: '♻️' },
  { id: 'l-map', age: ['lower'], kind: 'make', title: '나만의 보물지도 그리기', text: '오늘 다닌 길을 지도로 그려요. 출발점·간식 먹은 곳·화장실을 표시해 보세요.', icon: 'map', stamp: '🗺️' },
  { id: 'l-weather', age: ['lower'], kind: 'look', title: '날씨 기자 되기', text: '하늘·바람·기온을 살펴보고 "오늘의 제주 날씨"를 한 문장 뉴스로 전해요.', icon: 'cloud-sun', stamp: '🎙️' },
  { id: 'l-count', age: ['lower'], kind: 'look', title: '돌담 돌 세어 보기', text: '돌담 한 칸에 돌이 몇 개일지 어림해 본 뒤 직접 세어 봐요. 얼마나 비슷했나요?', icon: '123', stamp: '🔢' },
  { id: 'l-ask', age: ['lower'], kind: 'culture', title: '삼춘께 물어보기', text: '보호자와 함께 안내소·가게 어른께 "이 동네에서 제일 좋은 곳은 어디예요?" 하고 여쭤봐요.', icon: 'chat-quote', stamp: '🙋' },
  { id: 'l-retell', age: ['lower'], kind: 'culture', title: '할망 이야기 다시 들려주기', text: '오늘 들은 이야기를 세 문장으로 가족에게 들려줘요.', icon: 'book', stamp: '📖' },
  { id: 'l-three', age: ['lower'], kind: 'make', title: '사진 세 장으로 하루 이야기', text: '처음·중간·마지막 장면을 사진 세 장으로 남기고 제목을 붙여요.', icon: 'images', stamp: '🖼️' },

  // ─ 초등 고학년(10~12세): 계획하고 해설하기 ─
  { id: 'm-map', age: ['upper'], kind: 'look', title: '가족 길잡이 되기', text: '오늘 일정 지도를 보고 다음 장소까지 길을 안내해 봐요.', icon: 'map', stamp: '🧭' },
  { id: 'm-diary', age: ['upper'], kind: 'make', title: '할망에게 편지 쓰기', text: '오늘 가장 기억에 남는 장면을 설문대할망에게 편지로 남겨요.', icon: 'envelope-heart', stamp: '💌' },
  { id: 'u-compass', age: ['upper'], kind: 'look', title: '해와 그림자로 방위 찾기', text: '해와 그림자로 동서남북을 가늠해 본 뒤 지도 앱과 맞춰 보세요. 얼마나 맞았을까요?', icon: 'compass', stamp: '🧭' },
  { id: 'u-budget', age: ['upper'], kind: 'make', title: '여행 가계부 쓰기', text: '오늘 쓴 입장료·간식비를 적고 합계를 계산해요. 내일 예산도 정해 보세요.', icon: 'calculator', stamp: '🧮' },
  { id: 'u-compare', age: ['upper'], kind: 'culture', title: '오름 vs 바다 비교하기', text: '오름과 바다의 분위기를 장점 세 가지씩 비교해 한 편의 글로 써요.', icon: 'columns-gap', stamp: '⚖️' },
  { id: 'u-sign', age: ['upper'], kind: 'culture', title: '제주어 간판 해독하기', text: '간판·안내문에서 제주어를 찾아 표준어로 풀어 봐요. (예: "혼저옵서예")', icon: 'signpost', stamp: '🔤' },
  { id: 'u-guide', age: ['upper'], kind: 'culture', title: '가족 해설사 되기', text: '오늘 본 장소 하나를 골라 안내판을 읽고 1분 동안 가족에게 해설해 줘요.', icon: 'megaphone', stamp: '🎤' },
  { id: 'u-safe', age: ['upper'], kind: 'heart', title: '안전 점검대장', text: '계단·바위·파도처럼 위험한 곳 세 가지를 찾아 동생에게 알려 줘요.', icon: 'shield-check', stamp: '🦺' },
]

// ── 보호자 체크리스트 (아동생활복지 관점, 발달단계별) ─────
export const CHECKLISTS = {
  infant: {
    focus: '수면·수유 리듬과 체온 조절이 가장 중요한 시기예요.',
    groups: [
      { title: '이동·휴식', items: ['낮잠 시간에 맞춰 이동 시간표 짜기', '수유·기저귀 갈이 가능한 곳(수유실) 미리 확인', '차량 이동은 1~2시간마다 쉬기', '카시트 항상 착용'] },
      { title: '건강·안전', items: ['체온계·해열제(소아용)·여벌 옷 챙기기', '바람 불 땐 담요·모자로 귓바퀴·목 보호', '자외선 차단은 그늘·모자·유모차 햇빛가리개로', '이유식·분유는 보냉·보온 준비'] },
    ],
  },
  toddler: {
    focus: '걷고 만지고 입에 넣는 시기, 한눈 팔면 위험해요. 손 닿는 거리 유지!',
    groups: [
      { title: '이동·휴식', items: ['걷기 코스는 짧게(30분 이내) 끊기', '유모차는 꼭 챙기고 지쳤을 때 바로 태우기', '화장실·간식 타이밍 미리 계획'] },
      { title: '건강·안전', items: ['물가·계단·돌담은 항상 보호자 팔 길이 안에서', '작은 돌·조개껍데기 입에 넣지 않게 지켜보기', '낯선 동물·해파리 만지지 않기', '아이 연락처·숙소 이름을 적은 팔찌/스티커'] },
    ],
  },
  preschool: {
    focus: '호기심이 폭발하는 시기, 선택권을 주면서 안전 규칙을 함께 정해요.',
    groups: [
      { title: '이동·휴식', items: ['"오늘의 약속 3가지"를 출발 전에 같이 정하기', '체험·놀이를 길게 한 곳 + 짧게 한 곳 섞기', '피곤하면 바로 쉬는 여유 일정'] },
      { title: '건강·안전', items: ['길 잃으면 "그 자리에서 기다리기" 연습', '바닷가 파도·바위 구역은 어른과 손잡기', '자외선·모자·물 자주 마시기', '해산물 알레르기 체크 후 식당 선택'] },
    ],
  },
  lower: {
    focus: '스스로 해 보고 싶은 시기, 역할을 주면 여행이 배움이 돼요.',
    groups: [
      { title: '이동·휴식', items: ['미션 카드로 이동 시간을 놀이처럼', '하루 1곳은 아이가 고르게 하기', '걷기 코스는 1시간 이내로 시작'] },
      { title: '건강·안전', items: ['보호자 연락처를 외우거나 적어 두기', '수영·물놀이는 구명조끼 착용', '오름·해안길은 미끄럼 방지 신발', '카메라 찍느라 놓치지 않게 아이 위치 자주 확인'] },
    ],
  },
  upper: {
    focus: '자율성이 커지는 시기, 계획 세우기에 참여시키면 만족도가 올라가요.',
    groups: [
      { title: '이동·휴식', items: ['일정표 일부를 아이가 직접 구성', '사진·스케치·여행 일기 시간 넣기', '또래 아이를 위한 체험 프로그램 확인'] },
      { title: '건강·안전', items: ['비상 연락 방법(위치 공유·전화)을 함께 확인', '바다·계곡은 안전 수칙을 같이 읽기', '충분한 수분·간식, 무리한 오름 코스 피하기'] },
    ],
  },
}

// 연령 상관없이 점검할 접근성 체크 (유모차·휠체어)
export const ACCESS_CHECK = [
  '방문 전 전화로 "유모차·휠체어 이동 가능한 동선" 확인',
  '엘리베이터·경사로·장애인 화장실 위치 확인',
  '비 오는 날 미끄러운 바닥·데크 구간 확인',
  '가까운 주차 구역과 하차장 위치 확인',
]

// ── 응급 정보 (전국 공통 번호만 수록) ────────────────────
export const EMERGENCY = [
  { name: '119', desc: '응급·화재·구조 (제주 어디서나)', tel: '119', tone: 'danger' },
  { name: '1339', desc: '응급의료상담 · 질병관리 콜센터', tel: '1339', tone: 'warning' },
  { name: '122', desc: '해양 사고·바다 응급 (해양경찰)', tel: '122', tone: 'primary' },
  { name: '112', desc: '실종·범죄 신고', tel: '112', tone: 'dark' },
  { name: '129', desc: '보건복지상담센터', tel: '129', tone: 'secondary' },
]

export const FIRST_AID = [
  { title: '아이가 물을 마셨거나 물에 빠졌어요', body: '즉시 119에 연락하고 구조를 기다리며, 의식·호흡을 확인해요. 무리한 처치는 하지 마세요.' },
  { title: '열이 나고 처져요', body: '옷을 가볍게 하고 수분을 주며 체온을 재요. 38도 이상이 계속되거나 경련·축 처짐이 있으면 119 또는 응급실.' },
  { title: '길을 잃었어요', body: '주변 상점·관리소에 알리고 112에 신고해요. 아이에게는 평소 "그 자리에서 기다리기"를 알려 주세요.' },
  { title: '벌레·해파리에 쏘였어요', body: '해수(바닷물)로 씻고 문지르지 마세요. 호흡곤란·전신 두드러기가 있으면 즉시 119.' },
]

export const findStory = (id) => STORIES.find((s) => s.id === id)
export const missionsFor = (ageKey) => MISSIONS.filter((m) => m.age.includes(ageKey))

// 장소 이름·소개글에서 어울리는 할망 이야기를 찾는다 (상세 창의 "이 장소와 어울리는 이야기")
const STORY_KEYWORDS = [
  ['haenyeo', ['해녀', '물질', '숨비', '테왁']],
  ['ohbaek', ['영실', '오백장군', '오백']],
  ['hareubang', ['돌하르방', '하르방', '돌문화', '돌담', '현무암']],
  ['yeongdeung', ['영등', '바람', '풍어']],
  ['seolmundae', ['설문대', '한라산', '오름', '물장오리', '산방산', '화산']],
]
export function storyFor(text = '') {
  const hit = STORY_KEYWORDS.find(([, words]) => words.some((w) => text.includes(w)))
  return hit ? findStory(hit[0]) : null
}
