import type { Oferta } from '../api'

export default function Cobertura({ ofertas, edicoes }: { ofertas: Oferta[]; edicoes: number[] }) {
  const itens = [
    { rotulo: 'Ofertas', valor: ofertas.length, icone: 'bi-mortarboard' },
    { rotulo: 'Edições na base', valor: edicoes.length, icone: 'bi-calendar3' },
    { rotulo: 'Primeiro ano', valor: edicoes[0] ?? '—', icone: 'bi-skip-start' },
    { rotulo: 'Último ano', valor: edicoes[edicoes.length - 1] ?? '—', icone: 'bi-skip-end' },
  ]
  return (
    <div className="card-soft p-4 h-100">
      <h2 className="card-title-sm">Cobertura do recorte</h2>
      <div className="small text-body-secondary mb-3">Ofertas e edições disponíveis</div>
      <div className="row g-2">
        {itens.map(i => (
          <div className="col-6" key={i.rotulo}>
            <div className="border rounded-3 p-2 px-3">
              <div className="label-sm"><i className={`bi ${i.icone} me-1`} />{i.rotulo}</div>
              <div className="fs-4 fw-bold" style={{ color: 'var(--c-navy)' }}>{i.valor}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="alert alert-light border small mt-3 mb-0">
        <i className="bi bi-info-circle me-1" />
        Somente resultados <strong>oficiais do Inep</strong> são exibidos. Ofertas com uma única edição mostram aviso de série limitada.
      </div>
    </div>
  )
}
