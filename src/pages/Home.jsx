import { Button, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { IslandScene } from '../scene/JejuScene'
import WeatherStrip from '../components/WeatherStrip'
import Intro from './Intro'
import { useAppStore } from '../store/useAppStore'

const STEPS = [
  { icon: 'people', title: '우리 가족 알려주기', text: '아이 나이, 유모차·휠체어, 예산을 한 번만 적어요.' },
  { icon: 'compass', title: '길동무 스팟 받기', text: '관광·무장애·날씨 데이터로 접근성·안전·가격 점수를 매겨 추천해요.' },
  { icon: 'basket2', title: '바구니에 담아 일정 짜기', text: '마음에 드는 곳을 담고 날짜별로 배치해요.' },
  { icon: 'balloon-heart', title: '놀면서 배우는 제주', text: '할망 이야기, 미션 카드, 제주어 카드로 문화를 만나요.' },
]

export default function Home() {
  const kids = useAppStore((s) => s.kidsMode)
  const user = useAppStore((s) => s.user)
  const ready = useAppStore((s) => s.authReady)
  if (!ready) return <div className="intro" /> // 로그인 여부를 확인하는 동안 같은 배경만 보여 깜빡임을 막는다
  if (!user) return <Intro />
  return (
    <>
      <section className="hero mb-4">
        <div className="hero-copy">
          <span className="chip mb-3"><i className="bi bi-heart-fill" />아동 친화 · 무장애 제주 여행</span>
          <h1>{kids ? <>혼저옵서예! <em>할망</em>이랑<br />같이 걸어 볼까?</> : <>아이와 함께 걷는 제주,<br /><em>할망 길동무</em></>}</h1>
          <p className="text-muted fs-5 my-3">유모차도 휠체어도 괜찮은 길, 비 오는 날의 실내 대안, 그리고 설문대할망 이야기까지. 가족 맞춤으로 안전하고 의미 있게 걸어요.</p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Button as={Link} to={user ? '/explore' : '/login'} size="lg"><i className="bi bi-compass me-2" />{user ? '길동무 찾으러 가기' : '시작하기'}</Button>
            <Button as={Link} to="/kids" size="lg" variant="outline-primary"><i className="bi bi-balloon-heart me-2" />아이와 함께</Button>
          </div>
          <WeatherStrip />
        </div>
        <div>
          <IslandScene hero height={430} />
          <div className="text-center small text-muted mt-2"><i className="bi bi-hand-index me-1" />끌어서 돌려 보고, 휠로 확대해 보세요</div>
        </div>
      </section>

      <Row xs={1} sm={2} lg={4} className="g-3 mb-4">
        {STEPS.map((s, i) => (
          <Col key={s.title}>
            <div className="soft-card step-card">
              <div className="num">{i + 1}</div>
              <h5 className="mb-1"><i className={`bi bi-${s.icon} me-2 text-primary`} />{s.title}</h5>
              <p className="small text-muted mb-0">{s.text}</p>
            </div>
          </Col>
        ))}
      </Row>

      <div className="soft-card p-3 small text-muted">
        <i className="bi bi-database-check me-1" />이 서비스는 <b>한국관광공사 국문 관광정보</b>, <b>한국관광공사 무장애 여행정보</b>, <b>기상청 단기예보</b> 공공데이터 오픈 API를 사용하며, 가족 정보와 여행 바구니는 Supabase에 저장됩니다.
      </div>
    </>
  )
}
