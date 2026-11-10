import type { Historico } from '../api'
import { COR_FAIXA, fmt2 } from './IndicadoresCards'

export default function TabelaHistorico({ historico, edicaoSelecionada }: { historico: Historico[]; edicaoSelecionada: number }) {
  return (
    <div className="card-soft p-4 h-100" id="historico">
      <h2 className="card-title-sm">Histórico de edições</h2>
      <div className="small text-body-secondary mb-3">Todas as edições oficiais registradas para a oferta</div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead><tr>
            <th>Edição</th><th>Contínuo</th><th>Faixa</th><th>FG</th><th>CE</th><th>Participação</th><th>Origem</th>
          </tr></thead>
          <tbody>
            {historico.map(h => (
              <tr key={h.edicao} className={h.edicao === edicaoSelecionada ? 'table-primary' : ''}>
                <td className="fw-semibold">{h.edicao}</td>
                <td>{fmt2(h.nota_continua)}</td>
                <td><span className="badge" style={{ background: COR_FAIXA[h.conceito_faixa] ?? '#6c757d' }}>{h.conceito_faixa}</span></td>
                <td>{h.formacao_geral.toFixed(2)}</td>
                <td>{h.componente_especifico.toFixed(2)}</td>
                <td>{h.taxa_participacao.toFixed(1)}% <span className="text-body-secondary small">({h.participantes}/{h.inscritos})</span></td>
                <td>
                  <a href={h.fonte_url} target="_blank" rel="noreferrer" className="text-decoration-none">
                    <span className="badge text-bg-light border">{h.origem_dado === 'OFICIAL_INEP' ? 'Oficial Inep' : 'Simulado'} <i className="bi bi-box-arrow-up-right" /></span>
                  </a>
                </td>
              </tr>
            ))}
            {historico.length === 0 && <tr><td colSpan={7} className="text-center text-body-secondary">Nenhuma edição registrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
