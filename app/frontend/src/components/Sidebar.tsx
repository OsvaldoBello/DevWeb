import { useState } from 'react'

interface Props { aberta: boolean; recolhida: boolean; onFechar: () => void; onAlternar: () => void; anos: number[] }

export default function Sidebar({ aberta, recolhida, onFechar, onAlternar, anos }: Props) {
  const [ativo, setAtivo] = useState('painel')
  const ir = (id: string, alvo: string) => {
    setAtivo(id)
    document.getElementById(alvo)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onFechar()
  }
  return (
    <>
      <div className={`sidebar-backdrop ${aberta ? 'aberta' : ''}`} onClick={onFechar} />
      <aside className={`sidebar ${aberta ? 'aberta' : ''} ${recolhida ? 'recolhida' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo"><i className="bi bi-bar-chart-line-fill" /></div>
          <div className="rot flex-grow-1">
            <div className="fw-bold fs-5 lh-1 brand-name">Painel ENADE</div>
            <small className="opacity-75">Painel institucional</small>
          </div>
          <button className="sidebar-toggle d-none d-lg-grid" onClick={onAlternar} aria-pressed={recolhida}
                  title={recolhida ? 'Expandir barra lateral' : 'Recolher barra lateral'}
                  aria-label={recolhida ? 'Expandir barra lateral' : 'Recolher barra lateral'}>
            <i className={`bi ${recolhida ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`} />
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <button className={`nav-item-btn ${ativo === 'painel' ? 'ativo' : ''}`} onClick={() => ir('painel', 'topo')} title="Painel">
            <i className="bi bi-grid-1x2-fill" /><span className="rot">Painel</span>
          </button>
          <button className={`nav-item-btn ${ativo === 'historico' ? 'ativo' : ''}`} onClick={() => ir('historico', 'historico')} title="Histórico">
            <i className="bi bi-clock-history" /><span className="rot">Histórico</span>
          </button>
          <button className={`nav-item-btn ${ativo === 'acoes' ? 'ativo' : ''}`} onClick={() => ir('acoes', 'acoes')} title="Ações de acompanhamento">
            <i className="bi bi-clipboard-check" /><span className="rot">Ações de acompanhamento</span>
          </button>
        </nav>
        <div className="sidebar-foot">
          <div className="fw-semibold text-white">Recorte R07</div>
          <div>Computação e desenvolvimento de sistemas</div>
          <div className="mt-3">Dados públicos do Inep</div>
          {anos.length > 0 && <div>Edições: {anos[0]}–{anos[anos.length - 1]}</div>}
        </div>
      </aside>
    </>
  )
}
