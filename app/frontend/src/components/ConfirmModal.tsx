import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  titulo: string
  mensagem?: string
  confirmarTexto: string
  variante?: 'danger' | 'primary'
  icone?: string
  carregando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export default function ConfirmModal({ titulo, mensagem, confirmarTexto, variante = 'primary', icone, carregando, onConfirmar, onCancelar }: Props) {
  const cancelar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelar.current?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancelar() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [onCancelar])

  return createPortal(
    <>
      <div className="confirm-backdrop" onClick={onCancelar} />
      <div className="confirm-wrap" role="alertdialog" aria-modal="true" aria-label={titulo}>
        <div className="confirm-card">
          <div className={`confirm-icone ${variante}`}>
            <i className={`bi ${icone ?? (variante === 'danger' ? 'bi-trash3' : 'bi-question-circle')}`} />
          </div>
          <h2 className="h5 fw-bold mb-2">{titulo}</h2>
          {mensagem && <p className="text-body-secondary mb-4">{mensagem}</p>}
          <div className="d-flex gap-2 justify-content-center">
            <button ref={cancelar} type="button" className="btn btn-soft-muted" onClick={onCancelar} disabled={carregando}>Cancelar</button>
            <button type="button" className={`btn confirm-ok ${variante === 'danger' ? 'btn-perigo' : 'btn-grad'}`} onClick={onConfirmar} disabled={carregando}>
              {carregando ? <span className="spinner-border spinner-border-sm" /> : null} {confirmarTexto}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
