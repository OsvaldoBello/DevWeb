export const Sk = ({ w = '100%', h = 16, className = '' }: { w?: number | string; h?: number; className?: string }) => (
  <span className={`sk ${className}`} style={{ width: w, height: h }} aria-hidden="true" />
)

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-soft p-4 h-100 ${className}`}>{children}</div>
)

export function FiltrosSkeleton() {
  return (
    <div className="card-soft p-3 mb-4" aria-hidden="true">
      <div className="row g-3">
        <div className="col-12 col-md-8"><Sk w={110} h={10} className="mb-2" /><Sk h={38} /></div>
        <div className="col-12 col-md-4"><Sk w={110} h={10} className="mb-2" /><Sk h={38} /></div>
      </div>
    </div>
  )
}

export function PainelSkeleton() {
  return (
    <div role="status" aria-label="Carregando painel">
      <div className="row g-3 mb-4">
        {[0, 1, 2, 3].map(i => (
          <div className="col-12 col-md-6 col-xl-3" key={i}>
            <Card><Sk w={140} h={10} className="mb-3" /><Sk w={90} h={34} className="mb-2" /><Sk w={120} h={10} /></Card>
          </div>
        ))}
      </div>
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-5"><Card><Sk w={160} h={18} className="mb-3" /><Sk h={30} className="mb-3" /><Sk h={230} /></Card></div>
        <div className="col-12 col-md-6 col-xl-3"><Card><Sk w={120} h={18} className="mb-4" /><Sk h={12} className="mb-4" /><Sk h={12} className="mb-4" /><Sk h={70} /></Card></div>
        <div className="col-12 col-md-6 col-xl-4"><Card><Sk w={170} h={18} className="mb-4" /><Sk h={70} className="mb-3" /><Sk h={70} className="mb-3" /><Sk h={40} /></Card></div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-8"><Card><Sk w={170} h={18} className="mb-4" />{[0, 1, 2].map(i => <Sk key={i} h={28} className="mb-2" />)}</Card></div>
        <div className="col-12 col-xl-4"><Card><Sk w={150} h={18} className="mb-4" /><Sk h={60} className="mb-2" /><Sk h={60} /></Card></div>
      </div>
    </div>
  )
}

export function LinhasSkeleton({ colunas, linhas = 3 }: { colunas: number; linhas?: number }) {
  return (
    <>
      {Array.from({ length: linhas }).map((_, i) => (
        <tr key={i} aria-hidden="true">{Array.from({ length: colunas }).map((__, j) => <td key={j}><Sk h={16} w={j === 0 ? '80%' : '60%'} /></td>)}</tr>
      ))}
    </>
  )
}
