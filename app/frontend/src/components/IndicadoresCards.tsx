import type { Painel } from '../api'

export const COR_FAIXA: Record<string, string> = {
  '1': '#dc3545', '2': '#fd7e14', '3': '#0dcaf0', '4': '#1e40af', '5': '#198754',
}
export const corFaixa = (f: string) =>
  ({ '1': 'danger', '2': 'warning', '3': 'info', '4': 'primary', '5': 'success' } as Record<string, string>)[f] ?? 'secondary'
export const fmt2 = (n: number | null | undefined) => (n == null ? '—' : n.toFixed(2))

function situacao(faixa: string) {
  if (faixa === '4' || faixa === '5') return { texto: 'Bom', classe: '', st: '#15803d', st2: '#22c55e', icone: 'bi-emoji-smile-fill', nota: 'Resultado acima do esperado' }
  if (faixa === '3') return { texto: 'Acompanhar', classe: 'st-amarelo', st: '#f59e0b', st2: '#fcd34d', icone: 'bi-eye-fill', nota: 'Satisfatório; manter monitoramento' }
  return { texto: 'Atenção', classe: '', st: '#dc2626', st2: '#fb7185', icone: 'bi-exclamation-triangle-fill', nota: 'Resultado abaixo do satisfatório' }
}

export default function IndicadoresCards({ p }: { p: Painel }) {
  const faixa = p.conceito_faixa ?? 'SC'
  const sit = situacao(faixa)
  const part = p.taxa_participacao ?? 0
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card-soft metric h-100 p-3" style={{ ['--acento' as string]: '#1e40af' }}>
          <div className="d-flex justify-content-between"><span className="label-sm">Conceito ENADE contínuo</span><span className="icone"><i className="bi bi-graph-up-arrow" /></span></div>
          <div className="valor mt-2">{fmt2(p.nota_continua)}</div>
          <div className="small text-body-secondary">escala de 0.00 a 5.00</div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card-soft metric h-100 p-3" style={{ ['--acento' as string]: COR_FAIXA[faixa] ?? '#6c757d' }}>
          <div className="d-flex justify-content-between"><span className="label-sm">Conceito ENADE faixa</span><span className="icone"><i className="bi bi-award" /></span></div>
          <div className="mt-2"><span className="faixa-badge" style={{ background: COR_FAIXA[faixa] ?? '#6c757d' }}>{faixa}</span></div>
          <div className="small text-body-secondary mt-1">{faixa === 'SC' ? 'Sem conceito publicado' : 'Faixa publicada pelo Inep'}</div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <div className="card-soft metric h-100 p-3" style={{ ['--acento' as string]: '#198754' }}>
          <div className="d-flex justify-content-between"><span className="label-sm">Participação</span><span className="icone"><i className="bi bi-people" /></span></div>
          <div className="valor mt-2">{part.toFixed(1)}%</div>
          <div className="progress mt-1" role="progressbar" aria-label="Participação" aria-valuenow={part} aria-valuemin={0} aria-valuemax={100} style={{ height: 6 }}>
            <div className="progress-bar bg-success" style={{ width: `${part}%` }} />
          </div>
          <div className="small text-body-secondary mt-1">{p.participantes} de {p.inscritos} inscritos</div>
        </div>
      </div>
      <div className="col-12 col-md-6 col-xl-3">
        <div className={`status-card ${sit.classe}`} style={{ ['--st' as string]: sit.st, ['--st2' as string]: sit.st2 }} role="status">
          <div className="d-flex justify-content-between align-items-start">
            <span className="label-sm">Situação</span>
            <span className="st-icone"><i className={`bi ${sit.icone}`} /></span>
          </div>
          <div className="st-valor">{sit.texto}</div>
          <div className="small" style={{ opacity: .9 }}>{sit.nota}</div>
        </div>
      </div>
    </div>
  )
}
