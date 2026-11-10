import { useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import type { Historico } from '../api'

type Modo = 'continuo' | 'participacao' | 'fgce'
interface Props { historico: Historico[]; edicaoSelecionada: number; onSelecionar: (ano: number) => void }

const AZUL = '#1e40af', OURO = '#f5b301', VERDE = '#198754', ROXO = '#7c3aed'

export default function EvolucaoChart({ historico, edicaoSelecionada, onSelecionar }: Props) {
  const [modo, setModo] = useState<Modo>('continuo')
  const labels = historico.map(h => String(h.edicao))
  const idxSel = historico.findIndex(h => h.edicao === edicaoSelecionada)

  if (historico.length === 0)
    return <div className="text-center text-body-secondary py-5">Nenhuma edição registrada para esta oferta.</div>

  const base = (max: number, sufixo = ''): ChartOptions<any> => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false, axis: 'x' },
    plugins: { legend: { display: modo === 'fgce', position: 'bottom' }, tooltip: { padding: 10, cornerRadius: 8 } },
    scales: {
      y: { min: 0, max, grid: { color: '#eef1f6' }, ticks: { callback: (v: number | string) => `${v}${sufixo}` } },
      x: { grid: { display: false }, offset: true },
    },
    onClick: (_e: unknown, els: { index: number }[]) => { if (els.length) onSelecionar(historico[els[0].index].edicao) },
    onHover: (e: any, els: unknown[]) => { if (e.native?.target) (e.native.target as HTMLElement).style.cursor = els.length ? 'pointer' : 'default' },
  })

  const destaque = (cor: string) => ({
    pointRadius: historico.map((_, i) => (i === idxSel ? 8 : 4)),
    pointBackgroundColor: historico.map((_, i) => (i === idxSel ? cor : '#fff')),
    pointBorderColor: cor, pointBorderWidth: 2, pointHoverRadius: 9,
  })

  return (
    <>
      <ul className="nav nav-pills nav-pills-sm gap-1 mb-3">
        {([['continuo', 'Conceito contínuo'], ['participacao', 'Participação'], ['fgce', 'FG × CE']] as [Modo, string][]).map(([m, t]) => (
          <li className="nav-item" key={m}>
            <button className={`nav-link ${modo === m ? 'active' : ''}`} onClick={() => setModo(m)}>{t}</button>
          </li>
        ))}
      </ul>
      <div className="chart-box">
        {modo === 'continuo' && (
          <Line
            data={{ labels, datasets: [{
              label: 'Conceito contínuo', data: historico.map(h => h.nota_continua),
              borderColor: OURO, backgroundColor: 'rgba(245,179,1,.15)', fill: true, tension: .35, borderWidth: 3, spanGaps: true,
              ...destaque(AZUL),
            }] }}
            options={{ ...base(5), plugins: { ...base(5).plugins, tooltip: { padding: 10, cornerRadius: 8, callbacks: {
              label: (c: any) => ` Contínuo: ${Number(c.parsed.y).toFixed(2)}`,
              afterLabel: (c: any) => ` Faixa: ${historico[c.dataIndex].conceito_faixa}`,
            } } } }}
          />
        )}
        {modo === 'participacao' && (
          <Line
            data={{ labels, datasets: [{
              label: 'Participação (%)', data: historico.map(h => h.taxa_participacao),
              borderColor: VERDE, backgroundColor: 'rgba(25,135,84,.12)', fill: true, tension: .35, borderWidth: 3,
              ...destaque(VERDE),
            }] }}
            options={{ ...base(100, '%'), plugins: { ...base(100).plugins, tooltip: { padding: 10, cornerRadius: 8, callbacks: {
              label: (c: any) => ` Participação: ${Number(c.parsed.y).toFixed(1)}%`,
              afterLabel: (c: any) => ` ${historico[c.dataIndex].participantes} de ${historico[c.dataIndex].inscritos} inscritos`,
            } } } }}
          />
        )}
        {modo === 'fgce' && (
          <Bar
            data={{ labels, datasets: [
              { label: 'Formação Geral', data: historico.map(h => h.formacao_geral), backgroundColor: historico.map((_, i) => (i === idxSel ? '#0dcaf0' : 'rgba(13,202,240,.45)')), borderRadius: 6 },
              { label: 'Componente Específico', data: historico.map(h => h.componente_especifico), backgroundColor: historico.map((_, i) => (i === idxSel ? ROXO : 'rgba(124,58,237,.45)')), borderRadius: 6 },
            ] }}
            options={base(100)}
          />
        )}
      </div>
      <div className="small text-body-secondary mt-2"><i className="bi bi-hand-index me-1" />Clique em um ponto ou barra para trocar a edição.</div>
    </>
  )
}
