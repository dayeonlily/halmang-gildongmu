import { Alert, Spinner } from 'react-bootstrap'

export function Loading({ text = '불러오는 중...' }) {
  return <div className="text-center py-5 text-muted"><Spinner animation="border" size="sm" className="me-2" />{text}</div>
}
export function ErrorAlert({ error }) {
  if (!error) return null
  return <Alert variant="danger"><i className="bi bi-exclamation-triangle me-2" />{String(error)}</Alert>
}
export function Empty({ text = '결과가 없어요', icon = 'inbox' }) {
  return <div className="text-center py-5 text-muted"><i className={`bi bi-${icon} fs-1 d-block mb-2`} />{text}</div>
}
