import { Fragment, useEffect, useState } from 'react'
import { Badge, Button, Carousel, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { fetchDetail } from '../api/client'
import { Loading, ErrorAlert } from './Status'
import ScoreBars, { ScorePill } from './ScoreBars'
import { storyFor } from '../../shared/lore'

const TYPE_LABEL = { 12: '관광지', 14: '문화시설', 15: '축제·행사', 28: '레포츠·체험', 32: '숙박', 38: '쇼핑', 39: '음식점' }

// 무장애 항목 → 아이콘과 이름 (정보가 등록된 것만 켜짐)
const ACCESS_FLAGS = [
  ['stroller', '유모차', 'cart'], ['wheelchair', '휠체어', 'person-wheelchair'], ['elevator', '엘리베이터', 'building-up'],
  ['restroom', '장애인 화장실', 'badge-wc'], ['parking', '장애인 주차', 'p-square'], ['exit', '출입구 정보', 'door-open'],
  ['lactation', '수유실', 'droplet-half'], ['babychair', '유아 의자', 'person-standing-dress'],
]
const ACCESS_TEXT = [['stroller', '유모차'], ['wheelchair', '휠체어'], ['elevator', '엘리베이터'], ['restroom', '화장실'], ['parking', '주차'], ['exit', '출입구'], ['lactation', '수유실'], ['route', '대중교통'], ['family', '영유아 가족'], ['etc', '기타']]

// 장소 상세 창 — 카드를 누르면 열립니다
export default function SpotDetail({ spot, inBasket, onAdd, onHide }) {
  const nav = useNavigate()
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [full, setFull] = useState(false)

  useEffect(() => {
    if (!spot) return
    setD(null); setErr(''); setFull(false)
    fetchDetail(spot.id, spot.type).then(setD).catch((e) => setErr(e.message))
  }, [spot])

  if (!spot) return null
  const a = d?.access ?? spot.access
  const story = storyFor(`${spot.title} ${d?.overview ?? ''}`)
  const mapQ = encodeURIComponent(`${spot.title},${spot.lat},${spot.lng}`)
  const tips = [
    spot.indoor ? '실내라 비·더위·바람 걱정이 적어요' : '야외 장소예요 — 모자·물·여벌 옷을 챙기세요',
    spot.scores.access >= 70 ? '무장애 정보가 잘 갖춰진 곳이에요' : spot.access?.registered ? '무장애 시설 일부만 등록돼 있어요. 방문 전 전화 확인을 권해요' : '무장애 정보가 등록되지 않았어요. 유모차·휠체어는 전화 확인이 필요해요',
  ]

  return (
    <Modal show onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="display-font fs-4">{spot.title} <ScorePill score={spot.scores.total} /></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {err && <ErrorAlert error={err} />}
        {!d && !err && <Loading text="상세 정보를 불러오는 중..." />}
        {d && (
          <>
            {d.gallery.length > 0 && (
              <Carousel className="rounded-4 overflow-hidden mb-3" interval={null} indicators={d.gallery.length > 1} controls={d.gallery.length > 1}>
                {d.gallery.map((src) => (
                  <Carousel.Item key={src}><img src={src} alt={spot.title} className="d-block w-100" style={{ height: 280, objectFit: 'cover' }} loading="lazy" /></Carousel.Item>
                ))}
              </Carousel>
            )}
            <div className="d-flex flex-wrap gap-1 mb-2">
              <Badge bg="secondary">{TYPE_LABEL[spot.type] ?? '장소'}</Badge>
              <Badge bg={spot.indoor ? 'info' : 'success'}>{spot.indoor ? '실내' : '야외'}</Badge>
              <Badge bg="light" text="dark">{spot.price}</Badge>
            </div>
            <div className="text-muted small mb-3"><i className="bi bi-geo-alt me-1" />{spot.addr}</div>

            <div className="soft-card p-3 mb-3"><ScoreBars scores={spot.scores} />
              <ul className="small mb-0 mt-2 ps-3">{tips.map((t) => <li key={t}>{t}</li>)}</ul></div>

            {d.overview && (
              <div className="mb-3">
                <h6 className="fw-bold"><i className="bi bi-info-circle me-1 text-primary" />소개</h6>
                <p className="mb-1" style={{ whiteSpace: 'pre-line', ...(full ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>{d.overview}</p>
                {d.overview.length > 140 && <Button variant="link" size="sm" className="p-0" onClick={() => setFull(!full)}>{full ? '접기' : '더 보기'}</Button>}
              </div>
            )}

            {d.facts.length > 0 && (
              <div className="mb-3">
                <h6 className="fw-bold"><i className="bi bi-clock me-1 text-primary" />이용 정보</h6>
                <dl className="row small mb-0">
                  {d.facts.map(([k, v]) => <Fragment key={k}><dt className="col-4 col-md-3">{k}</dt><dd className="col-8 col-md-9" style={{ whiteSpace: 'pre-line' }}>{v}</dd></Fragment>)}
                </dl>
              </div>
            )}

            <div className="mb-3">
              <h6 className="fw-bold"><i className="bi bi-universal-access me-1 text-primary" />무장애·아이 동반 정보</h6>
              {a?.registered ? (
                <>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {ACCESS_FLAGS.map(([k, label, icon]) => (
                      <Badge key={k} bg={a.flags?.[k] ? 'success' : 'light'} text={a.flags?.[k] ? undefined : 'muted'} className={a.flags?.[k] ? '' : 'border opacity-75'}>
                        <i className={`bi bi-${icon} me-1`} />{label}{a.flags?.[k] ? '' : ' 정보 없음'}
                      </Badge>
                    ))}
                  </div>
                  <dl className="row small mb-0">
                    {ACCESS_TEXT.filter(([k]) => a[k]).map(([k, label]) => <Fragment key={k}><dt className="col-4 col-md-3">{label}</dt><dd className="col-8 col-md-9">{a[k]}</dd></Fragment>)}
                  </dl>
                </>
              ) : <div className="small text-muted">무장애 여행정보에 등록되지 않은 장소예요. 유모차·휠체어 이동 동선은 방문 전에 전화로 확인해 주세요.</div>}
            </div>

            {story && (
              <div className="soft-card p-3 mb-3 d-flex align-items-center gap-3" style={{ background: 'var(--hm-orange-soft)' }}>
                <div style={{ fontSize: '2rem' }}>{story.emoji}</div>
                <div className="flex-grow-1"><div className="small text-muted">이 장소와 어울리는 할망 이야기</div><div className="fw-bold">{story.title}</div></div>
                <Button size="sm" onClick={() => nav(`/kids?story=${story.id}`)}><i className="bi bi-play-fill me-1" />들으러 가기</Button>
              </div>
            )}

            <div className="d-flex flex-wrap gap-2">
              {d.tel && /\d/.test(d.tel) && <Button as="a" variant="outline-secondary" size="sm" href={`tel:${(d.tel.match(/[\d-]{7,}/) ?? [''])[0]}`}><i className="bi bi-telephone me-1" />전화</Button>}
              {d.homepage && <Button as="a" variant="outline-secondary" size="sm" href={d.homepage} target="_blank" rel="noreferrer"><i className="bi bi-box-arrow-up-right me-1" />홈페이지</Button>}
              <Button as="a" variant="outline-secondary" size="sm" href={`https://map.kakao.com/link/map/${mapQ}`} target="_blank" rel="noreferrer"><i className="bi bi-map me-1" />지도 보기</Button>
              <Button as="a" variant="outline-secondary" size="sm" href={`https://map.kakao.com/link/to/${mapQ}`} target="_blank" rel="noreferrer"><i className="bi bi-signpost-2 me-1" />길찾기</Button>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>닫기</Button>
        <Button disabled={inBasket} onClick={() => onAdd(spot)}><i className={`bi bi-${inBasket ? 'check2' : 'basket2'} me-1`} />{inBasket ? '담았어요' : '바구니에 담기'}</Button>
      </Modal.Footer>
    </Modal>
  )
}
