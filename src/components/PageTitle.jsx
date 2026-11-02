export default function PageTitle({ icon, title, sub, children }) {
  return (
    <div className="page-title">
      <div className="ico"><i className={`bi bi-${icon}`} /></div>
      <div className="flex-grow-1"><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children}
    </div>
  )
}
