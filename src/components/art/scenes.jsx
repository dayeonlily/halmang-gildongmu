import {
  Abalone, Bubbles, Canola, Cauldron, Cloud, Fish, Haenyeo2D, Halmang2D, Hareubang2D, Hill, House, Kid2D, Kite, Mist,
  Mountain, Oreum, Rock, Sanbang, Sea, Seaweed, Seeds, Shell, Sky as Sky_, StoneWall, Sun, Swirl, Table, Tewak,
} from './parts'

// 장면 = 이야기의 한 줄에 맞춘 그림 (STORIES[].lines 와 같은 순서). 400 x 280.
const Far = () => <><Mountain x={70} y={196} w={210} h={72} c1="#b4bfdf" /><Mountain x={322} y={196} w={250} h={98} c1="#aab6dc" /></>
const Heart = ({ x, y, s = 1, c = '#f2a6b8' }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 0 c-6 -8 -16 0 -8 8 l8 8 l8 -8 c8 -8 -2 -16 -8 -8Z" fill={c} />
const SONS = ['#8ec5e6', '#f2a6b8', '#f4d34a', '#a8cfa0', '#c4b3e6', '#f2a65a']

// ── 설문대할망, 한라산을 쌓다 ──
const seolmundae = [
  () => (<><Sky_ tone="day" /><Cloud x={72} y={52} /><Cloud x={322} y={74} s={1.15} /><Far /><Hill y={205} c2="#8fbf93" /><Canola x={16} y={252} n={10} w={160} /><Halmang2D x={206} y={264} s={0.95} pose="wave" /></>),
  () => (<><Sky_ tone="dawn" /><rect width="400" height="22" fill="#c8c0d8" opacity=".7" /><Cloud x={64} y={46} /><Cloud x={338} y={40} s={1.1} /><path d="M118 70 v-34 m-6 8 l6 -10 l6 10 M282 70 v-34 m-6 8 l6 -10 l6 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" /><Hill y={228} c="#c9d9a8" c2="#a9c78f" /><Halmang2D x={200} y={270} s={1} pose="stretch" /></>),
  () => (<><Sky_ tone="day" /><Far /><Mountain x={318} y={236} w={230} h={150} c1="#9fc7a2" /><Oreum x={34} y={232} c="#c9a88a" /><Oreum x={64} y={236} s={0.8} c="#b9a083" /><Hill y={236} c="#a8cfa0" c2="#8fbf93" /><Halmang2D x={166} y={270} s={0.92} pose="pour" /></>),
  () => (<><Sky_ tone="day" /><Cloud x={300} y={48} /><Hill y={196} c="#bcd9a6" />{[[60, 216, 1.3], [142, 206, 0.9], [222, 222, 1.6], [312, 208, 1.1], [372, 226, 1.4]].map(([x, y, s], i) => <Oreum key={i} x={x} y={y} s={s} c={i % 2 ? '#a8cfa0' : '#9bc08c'} />)}<Hill y={236} c="#a8cfa0" c2="#8fbf93" /><Oreum x={104} y={246} s={1.1} crater={false} /><Oreum x={274} y={250} s={1.3} /><path d="M70 266 q30 -5 62 2 t62 -2 t62 2" stroke="#9b7653" strokeWidth="3.2" strokeDasharray="1 7" strokeLinecap="round" fill="none" /><Halmang2D x={40} y={272} s={0.46} pose="wave" /></>),
  () => (<><Sky_ tone="day" /><Cloud x={72} y={44} /><Sea y={196} c="#9fd0dc" /><Sanbang x={336} y={206} w={100} h={88} /><path d="M268 206 q6 -16 12 0 M282 206 q8 -22 14 0 M300 206 q6 -14 12 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" /><path d="M0 226 C60 206 124 220 176 234 V280 H0Z" fill="#a8cfa0" /><path d="M104 78 Q210 14 304 134" stroke="#fff" strokeOpacity=".85" strokeWidth="2.6" strokeDasharray="2 9" strokeLinecap="round" fill="none" /><Halmang2D x={84} y={272} s={0.92} pose="throw" /></>),
  () => (<><Sky_ tone="day" /><Far /><Hill y={198} c="#bcd9a6" /><Oreum x={272} y={240} s={4.3} c="#a8cfa0" /><path d="M118 274 Q184 252 222 222 Q252 196 264 160" stroke="#f3e6c3" strokeWidth="9" strokeLinecap="round" fill="none" /><Cloud x={332} y={84} s={1.25} /><Halmang2D x={332} y={92} s={0.4} pose="wave" /><Kid2D x={176} y={266} s={1.35} color="#e9a9b8" walk /><Kid2D x={212} y={252} s={0.9} color="#8ec5e6" walk /></>),
]

// ── 오백 아들과 죽솥 이야기 ──
const ohbaek = [
  () => (<><Sky_ tone="day" /><Cloud x={80} y={52} /><Far /><Hill y={206} c2="#8fbf93" /><Halmang2D x={286} y={268} s={0.8} /><>{[40, 80, 118, 156, 194].map((x, i) => <Kid2D key={i} x={x} y={266 + (i % 2) * 4} s={0.75 + (i % 3) * 0.06} color={SONS[i]} walk />)}</></>),
  () => (<><Sky_ tone="dusk" /><Mountain x={330} y={200} w={220} h={80} c1="#c8b8cf" /><Hill y={222} c="#cdbf8f" c2="#b7aa7a" /><Cloud x={86} y={56} /><Cauldron x={218} y={264} s={1.35} /><>{[40, 70, 100].map((x, i) => <Kid2D key={i} x={x} y={268} s={0.62} color={SONS[i + 2]} />)}</></>),
  () => (<><Sky_ tone="sea" /><Sea y={168} /><Rock x={312} y={198} s={1.7} /><Rock x={346} y={200} s={1.15} /><path d="M286 196 q8 -10 16 0 M328 200 q8 -10 16 0" stroke="#fff" strokeWidth="2.4" fill="none" /><path d="M0 204 C80 190 150 208 214 224 V280 H0Z" fill="#eadcb2" /><path d="M150 188 Q226 146 290 158" stroke="#fff" strokeOpacity=".85" strokeWidth="2.4" strokeDasharray="2 9" strokeLinecap="round" fill="none" /><circle cx="64" cy="262" r="2.4" fill="#d9c9a0" /><circle cx="78" cy="268" r="3" fill="#d9c9a0" /><Kid2D x={118} y={266} s={1.15} color="#f2a6b8" walk /></>),
  () => (<><Sky_ tone="wind" /><Mountain x={310} y={200} w={300} h={110} c1="#a6b4c9" /><Hill y={214} c="#a9bfa0" c2="#8fa88f" /><Mist y={192} o={0.5} />{[[100, 214, 0.9], [190, 212, 1], [270, 210, 0.9], [340, 212, 1], [40, 236, 1.2], [78, 226, 1.5], [120, 238, 1.1], [160, 228, 1.7], [205, 240, 1.3], [245, 226, 1.6], [285, 238, 1.2], [325, 228, 1.5], [365, 240, 1.1]].map(([x, y, s], i) => <Rock key={i} x={x} y={y} s={s} />)}</>),
  () => (<><Sky_ tone="day" /><Cloud x={74} y={48} /><Hill y={216} c2="#8fbf93" /><Canola x={20} y={262} n={10} w={350} /><Rock x={92} y={262} s={2.4} face /><Rock x={202} y={268} s={3} face /><Rock x={312} y={262} s={2.4} face /></>),
  () => (<><Sky_ tone="day" /><Far /><Hill y={206} c2="#8fbf93" /><Rock x={252} y={236} s={1.6} face /><Rock x={310} y={242} s={1.95} face /><Rock x={362} y={236} s={1.4} face /><Kid2D x={92} y={266} s={1.55} color="#e9a9b8" point /><Kid2D x={140} y={266} s={1.05} color="#8ec5e6" point /></>),
]

// ── 바다 숨 쉬는 해녀 할망 ──
const haenyeo = [
  () => (<><Sky_ tone="sea" /><Sun x={332} y={52} /><Cloud x={74} y={48} /><Sea y={150} /><Tewak x={256} y={190} s={0.9} net={false} /><path d="M0 222 C60 202 130 216 190 234 V280 H0Z" fill="#8f8b86" /><Haenyeo2D x={96} y={268} s={0.95} pose="wave" /></>),
  () => (<><Sky_ tone="deep" /><rect width="400" height="36" fill="#c6e8f0" /><path d="M0 36 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" strokeWidth="2" fill="none" /><path d="M0 252 C80 236 160 254 240 246 C300 240 360 252 400 244 V280 H0Z" fill="#5f7886" /><Seaweed x={40} y={252} /><Seaweed x={74} y={254} h={40} /><Seaweed x={330} y={250} /><Abalone x={296} y={246} /><Abalone x={140} y={250} s={0.8} /><g transform="rotate(168 200 130)"><Haenyeo2D x={200} y={212} s={0.72} /></g><Bubbles x={206} y={78} /><Bubbles x={186} y={56} /><Fish x={86} y={130} /><Fish x={318} y={170} flip c="#f4d34a" /></>),
  () => (<><Sky_ tone="sea" /><Sun x={64} y={50} /><Sea y={172} /><Haenyeo2D x={200} y={262} s={1.1} clipBelow={-84} /><path d="M0 172 q25 -9 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V280 H0Z" fill="#9fd0dc" opacity=".92" /><path d="M0 190 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" strokeOpacity=".6" strokeWidth="2" fill="none" /><path d="M222 92 q9 -9 0 -18 M234 96 q13 -13 0 -26 M246 100 q16 -16 0 -34" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" /></>),
  () => (<><Sky_ tone="sea" /><Cloud x={316} y={48} /><Sea y={122} /><Tewak x={200} y={168} s={1.9} /><Fish x={84} y={200} /><Fish x={330} y={226} flip c="#f4d34a" /><Shell x={150} y={234} s={1.1} /><Shell x={256} y={248} s={0.9} /><Tewak x={338} y={140} s={0.36} net={false} /></>),
  () => (<><Sky_ tone="dusk" /><Sun x={206} y={150} r={30} c="#ffc18a" /><Sea y={160} c="#a6cbd0" /><path d="M0 224 C60 204 130 218 190 236 V280 H0Z" fill="#8f8b86" /><Haenyeo2D x={104} y={268} s={0.95} pose="stand" /><Shell x={142} y={174} s={1.25} /><path d="M154 168 Q214 118 280 188" stroke="#fff" strokeOpacity=".85" strokeWidth="2.4" strokeDasharray="2 9" strokeLinecap="round" fill="none" /><Heart x={260} y={118} s={1.3} /><Heart x={292} y={96} s={0.9} /><Heart x={232} y={92} s={0.8} c="#f4d34a" /></>),
  () => (<><Sky_ tone="sea" /><Sun x={330} y={54} /><Sea y={150} /><Tewak x={318} y={172} s={0.55} net={false} /><path d="M0 216 C100 200 220 222 400 206 V280 H0Z" fill="#efe2bb" /><Halmang2D x={134} y={268} s={0.8} /><Kid2D x={190} y={270} s={1} color="#8ec5e6" /></>),
]

// ── 돌하르방은 왜 눈이 커요? ──
const hareubang = [
  () => (<><Sky_ tone="day" /><Cloud x={72} y={50} /><Far /><Hill y={212} c2="#8fbf93" /><Canola x={14} y={262} n={10} w={150} /><Canola x={240} y={262} n={7} w={140} /><Hareubang2D x={200} y={268} s={1.2} /></>),
  () => (<><Sky_ tone="wind" /><Hill y={206} c2="#8fbf93" /><StoneWall x={8} y={254} w={128} /><Rock x={30} y={236} s={0.9} /><Rock x={64} y={232} s={0.7} /><Swirl x={150} y={116} s={1.4} /><Swirl x={176} y={156} s={1.1} flip /><Swirl x={160} y={196} s={1.2} /><path d="M170 252 v-14 M182 252 v-18 M194 252 v-12" stroke="#6fa56a" strokeWidth="2.2" /><Haenyeo2D x={322} y={268} s={0.82} pose="stand" /></>),
  () => (<><Sky_ tone="day" /><Cloud x={300} y={46} /><Hill y={214} c2="#8fbf93" /><House x={74} y={226} s={1.5} /><House x={150} y={236} s={1.15} /><StoneWall x={14} y={266} w={210} /><Hareubang2D x={312} y={270} s={1} /></>),
  () => (<><Sky_ tone="day" /><Cloud x={80} y={48} /><Hill y={244} c2="#8fbf93" /><Hareubang2D x={236} y={306} s={1.75} /><path d="M-10 212 Q100 160 214 108" stroke="#8ec5e6" strokeWidth="19" strokeLinecap="round" fill="none" /><circle cx="220" cy="104" r="11" fill="#f7dcc6" stroke="#6b5a52" strokeOpacity=".4" /><path d="M262 72 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3Z M170 66 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2Z" fill="#ffe27a" /></>),
  () => (<><Sky_ tone="day" /><Far /><Hill y={210} c2="#8fbf93" /><Hareubang2D x={134} y={270} s={1.05} /><Kid2D x={262} y={272} s={1.25} color="#f7d36b" /><path d="M214 140 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3Z M312 120 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3Z" fill="#ffe27a" /><Heart x={330} y={200} s={1.1} /></>),
]

// ── 바람의 할망, 영등할망 ──
const yeongdeung = [
  () => (<><Sky_ tone="wind" /><Cloud x={84} y={50} /><Cloud x={300} y={74} s={1.2} /><Sea y={146} c="#86b4c4" /><path d="M296 156 q32 16 64 0 l-8 14 h-48Z" fill="#a67c52" /><path d="M328 156 V120 L352 152Z" fill="#fff" stroke="#6b5a52" strokeOpacity=".4" /><Swirl x={40} y={96} s={1.6} /><Swirl x={150} y={124} s={1.3} flip /><Swirl x={110} y={190} s={1.5} /><Swirl x={250} y={210} s={1.2} /><Mist y={168} o={0.35} /></>),
  () => (<><Sky_ tone="wind" /><Sea y={206} c="#86b4c4" /><Cloud x={200} y={246} s={2.3} /><Halmang2D x={200} y={236} s={0.72} pose="wave" /><path d="M216 130 q42 -14 74 6 q-32 4 -58 12Z" fill="#a79bd4" opacity=".85" /><Swirl x={290} y={118} s={1.3} /><Swirl x={50} y={90} s={1.5} flip /><Seeds x={262} y={150} n={13} /><Cloud x={70} y={54} /></>),
  () => (<><Sky_ tone="dawn" /><Sun x={320} y={60} c="#ffc89a" /><Sea y={150} c="#9fcdd6" /><path d="M0 218 C100 204 220 224 400 208 V280 H0Z" fill="#e9dcb4" /><Table x={200} y={266} s={1.6} /><Haenyeo2D x={104} y={270} s={0.82} pose="pray" /><Haenyeo2D x={300} y={270} s={0.82} pose="pray" flip /></>),
  () => (<><Sky_ tone="day" /><Cloud x={74} y={40} /><Hill y={208} c2="#8fbf93" /><Kite x={100} y={72} s={1.5} /><Kite x={206} y={50} s={1.15} c="#f4d34a" /><Kite x={306} y={92} s={1.3} c="#8ec5e6" /><Swirl x={140} y={150} s={1.3} /><Swirl x={256} y={144} s={1.1} flip /><Canola x={20} y={268} n={10} w={350} /><Kid2D x={124} y={268} s={1.2} color="#f2a6b8" walk /><Kid2D x={244} y={270} s={1.05} color="#8ec5e6" point /></>),
]

export const SCENES = { seolmundae, ohbaek, haenyeo, hareubang, yeongdeung }
