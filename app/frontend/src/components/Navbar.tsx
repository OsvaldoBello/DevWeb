import { useEffect, useRef, useState } from 'react'
import type { Usuario } from '../api'

interface Props { usuario: Usuario; onSair: () => void; onMenu: () => void }

export default function Navbar({ usuario, onSair, onMenu }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setAberto(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc) }
  }, [aberto])

  const irParaAcoes = () => {
    setAberto(false)
    document.getElementById('acoes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="topo px-3 px-lg-4 py-3 d-flex align-items-center gap-3">
      <button className="btn btn-solid d-lg-none px-2" onClick={onMenu} aria-label="Abrir menu">
        <i className="bi bi-list fs-5" />
      </button>
      <div className="flex-grow-1">
        <div className="eyebrow">Gestão por indicadores</div>
        <h1 className="h3 fw-bold mb-0" style={{ color: 'var(--c-navy)' }}>Painel ENADE</h1>
        <div className="text-body-secondary small d-none d-sm-block">Acompanhamento do desempenho por oferta de curso e edição</div>
      </div>

      <div className="position-relative" ref={ref}>
        <button className="user-chip" onClick={() => setAberto(a => !a)} aria-haspopup="menu" aria-expanded={aberto}
                aria-label={`Menu do usuário ${usuario.nome}`}>
          <span className="avatar"><i className="bi bi-person-fill" /></span>
          <span className="text-start d-none d-md-block">
            <span className="d-block user-nome">{usuario.nome}</span>
            <span className="d-block user-login">@{usuario.login}</span>
          </span>
          <i className={`bi bi-chevron-down small chev ${aberto ? 'girado' : ''}`} />
        </button>

        {aberto && (
          <div className="user-menu" role="menu">
            <div className="user-menu-head">
              <span className="avatar avatar-lg"><i className="bi bi-person-fill" /></span>
              <div>
                <div className="fw-bold">{usuario.nome}</div>
                <div className="small text-body-secondary">@{usuario.login}</div>
                <span className="badge text-bg-success mt-1"><i className="bi bi-circle-fill me-1" style={{ fontSize: '.5rem' }} />Sessão ativa</span>
              </div>
            </div>
            <button className="user-menu-item" role="menuitem" onClick={irParaAcoes}>
              <i className="bi bi-clipboard-check" /> Ações de acompanhamento
            </button>
            <button className="user-menu-item" role="menuitem" onClick={() => { setAberto(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <i className="bi bi-grid-1x2" /> Voltar ao topo do painel
            </button>
            <button className="btn btn-sair w-100 mt-2 menu-sair" role="menuitem" onClick={onSair}>
              <i className="bi bi-box-arrow-right" /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
