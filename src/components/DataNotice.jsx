import { Alert } from 'react-bootstrap'

// 공공데이터를 못 불러온 항목이 있을 때, 점수가 덜 정확하다는 걸 숨기지 않고 알린다
export default function DataNotice({ degraded }) {
  if (!degraded) return null
  const { quota = [], other = [] } = degraded
  return (
    <Alert variant="warning" className="py-2 small">
      <i className="bi bi-exclamation-triangle me-1" />
      {quota.length > 0 && <>공공데이터 <b>하루 호출 한도</b>를 넘어 <b>{quota.join(' · ')}</b> 정보를 못 불러왔어요. 한도는 한국 시간 자정에 초기화돼요. </>}
      {other.length > 0 && <><b>{other.join(' · ')}</b> 정보도 잠시 불러오지 못했어요. </>}
      그래서 지금 점수는 덜 정확하고, 성인 대상 장소는 이름으로만 걸러요.
    </Alert>
  )
}
