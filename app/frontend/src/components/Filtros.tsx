import type { Oferta } from '../api'

interface Props {
  ofertas: Oferta[]; edicoes: number[]
  ofertaId: number | null; edicao: number | null
  edicoesComDados?: number[]
  onOferta: (id: number) => void; onEdicao: (ano: number) => void
}

export default function Filtros({ ofertas, edicoes, ofertaId, edicao, edicoesComDados, onOferta, onEdicao }: Props) {
  return (
    <div className="card-soft p-3 mb-4">
      <div className="row g-3 align-items-end">
        <div className="col-12 col-md-8">
          <label htmlFor="oferta" className="label-sm mb-1"><i className="bi bi-mortarboard me-1" />Oferta de curso</label>
          <select id="oferta" className="form-select" value={ofertaId ?? ''} onChange={e => onOferta(Number(e.target.value))}>
            {ofertas.map(o => (
              <option key={o.id} value={o.id}>{o.curso} · {o.grau_academico} · {o.modalidade}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label htmlFor="edicao" className="label-sm mb-1"><i className="bi bi-calendar3 me-1" />Edição do ENADE</label>
          <select id="edicao" className="form-select" value={edicao ?? ''} onChange={e => onEdicao(Number(e.target.value))}>
            {edicoes.map(a => (
              <option key={a} value={a}>{a}{edicoesComDados && !edicoesComDados.includes(a) ? ' · sem dados' : ''}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
