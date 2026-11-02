// 별점: onChange 가 있으면 눌러서 고르고, 없으면 보기만 한다
export default function Stars({ value, onChange, size = '1.1rem' }) {
  return (
    <span className="text-warning" style={{ fontSize: size, whiteSpace: 'nowrap' }} aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`bi bi-star${n <= value ? '-fill' : ''}`} role={onChange ? 'button' : undefined} style={onChange ? { cursor: 'pointer', marginRight: 2 } : { marginRight: 1 }}
          onClick={onChange ? () => onChange(n) : undefined} />
      ))}
    </span>
  )
}
