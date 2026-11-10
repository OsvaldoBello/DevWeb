import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { req, urlAnexo, type Acao } from '../api'
import ConfirmModal from './ConfirmModal'

const EXT = ['.pdf', '.png', '.jpg', '.jpeg']
const MAX = 2 * 1024 * 1024
const SITUACOES = ['Em planejamento', 'Em andamento', 'Concluída']

interface Props {
  ofertaId: number
  acao: Acao | null
  somenteLeitura: boolean
  onFechar: () => void
  onSalvo: (mensagem: string) => void
}

const tamanho = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)

export default function CrudAcoesModal({ ofertaId, acao, somenteLeitura, onFechar, onSalvo }: Props) {
  const [titulo, setTitulo] = useState(acao?.titulo ?? '')
  const [descricao, setDescricao] = useState(acao?.descricao ?? '')
  const [situacao, setSituacao] = useState(acao?.situacao ?? SITUACOES[0])
  const [responsavel, setResponsavel] = useState(acao?.responsavel ?? '')
  const [prazo, setPrazo] = useState(acao?.prazo ?? '')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [remover, setRemover] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = anterior; document.removeEventListener('keydown', esc) }
  }, [onFechar])

  const escolherArquivo = (f: File | null) => {
    setErro('')
    if (f) {
      const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
      if (!EXT.includes(ext)) { setErro('Formato não permitido. Envie .pdf, .png, .jpg ou .jpeg.'); setArquivo(null); return }
      if (f.size > MAX) { setErro('Arquivo maior que 2 MB. Envie um arquivo menor.'); setArquivo(null); return }
    }
    setArquivo(f)
  }

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !descricao.trim() || !responsavel.trim() || !prazo) {
      setErro('Preencha título, descrição, responsável e prazo.'); return
    }
    if (acao) setConfirmando(true)
    else void salvar()
  }

  const salvar = async () => {
    const fd = new FormData()
    fd.append('titulo', titulo); fd.append('descricao', descricao); fd.append('situacao', situacao)
    fd.append('responsavel', responsavel); fd.append('prazo', prazo)
    if (arquivo) fd.append('anexo', arquivo)
    if (acao) fd.append('remover_anexo', String(remover && !arquivo))
    else fd.append('oferta_id', String(ofertaId))
    setSalvando(true); setErro('')
    try {
      await req(acao ? `/api/acoes/${acao.id}` : '/api/acoes', { method: acao ? 'PUT' : 'POST', body: fd })
      onSalvo(acao ? 'Ação atualizada com sucesso.' : 'Ação cadastrada com sucesso.')
    } catch (err) { setErro((err as Error).message); setConfirmando(false) } finally { setSalvando(false) }
  }

  const ro = somenteLeitura
  const cabecalho = ro ? { icone: 'bi-eye', titulo: 'Detalhes da ação', sub: 'Consulta somente leitura' }
    : acao ? { icone: 'bi-pencil-square', titulo: 'Editar ação', sub: 'Atualize os dados e o anexo' }
    : { icone: 'bi-plus-circle', titulo: 'Nova ação', sub: 'Cadastre uma ação de acompanhamento' }

  return createPortal(
    <>
      <div className="modal-backdrop fade show" onClick={onFechar} />
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true" aria-label={cabecalho.titulo}
           onMouseDown={e => { if (e.target === e.currentTarget) onFechar() }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <form className="modal-content modal-acao" onSubmit={aoEnviar} noValidate>
            <div className="modal-header modal-acao-head">
              <span className="modal-icone"><i className={`bi ${cabecalho.icone}`} /></span>
              <div className="flex-grow-1">
                <h2 className="modal-title h5 fw-bold mb-0">{cabecalho.titulo}</h2>
                <div className="small opacity-75">{cabecalho.sub}</div>
              </div>
              <button type="button" className="btn-close btn-close-white" aria-label="Fechar" onClick={onFechar} />
            </div>

            <div className="modal-body p-4">
              {erro && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill" /> {erro}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label label-sm" htmlFor="titulo">Título</label>
                <input id="titulo" className="form-control" maxLength={150} placeholder="Ex.: Oficina de revisão de conteúdos" value={titulo} disabled={ro} onChange={e => setTitulo(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label label-sm" htmlFor="descricao">Descrição</label>
                <textarea id="descricao" className="form-control" rows={3} placeholder="Descreva o que será feito" value={descricao} disabled={ro} onChange={e => setDescricao(e.target.value)} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label label-sm" htmlFor="situacao">Situação</label>
                  <select id="situacao" className="form-select" value={situacao} disabled={ro} onChange={e => setSituacao(e.target.value)}>
                    {SITUACOES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label label-sm" htmlFor="responsavel">Responsável</label>
                  <input id="responsavel" className="form-control" placeholder="Nome ou setor" value={responsavel} disabled={ro} onChange={e => setResponsavel(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label label-sm" htmlFor="prazo">Prazo</label>
                  <input id="prazo" type="date" className="form-control" value={prazo} disabled={ro} onChange={e => setPrazo(e.target.value)} />
                </div>
              </div>

              <div className="label-sm mb-2">Anexo</div>
              {acao?.caminho_anexo && (
                <div className="anexo-atual mb-2">
                  <i className="bi bi-paperclip fs-5" />
                  <a href={urlAnexo(acao.caminho_anexo)} target="_blank" rel="noreferrer" className="flex-grow-1 text-decoration-none fw-semibold">{acao.nome_original_anexo}</a>
                  {!ro && (
                    <div className="form-check mb-0">
                      <input id="remover" type="checkbox" className="form-check-input" checked={remover} onChange={e => setRemover(e.target.checked)} />
                      <label htmlFor="remover" className="form-check-label small">Remover anexo</label>
                    </div>
                  )}
                </div>
              )}
              {!acao?.caminho_anexo && ro && <div className="text-body-secondary small">Esta ação não possui anexo.</div>}
              {!ro && (
                <label className={`dropzone ${arquivo ? 'cheio' : ''}`} htmlFor="anexo">
                  <input id="anexo" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => escolherArquivo(e.target.files?.[0] ?? null)} />
                  <i className={`bi ${arquivo ? 'bi-file-earmark-check' : 'bi-cloud-arrow-up'} fs-2`} />
                  {arquivo ? (
                    <div><div className="fw-semibold">{arquivo.name}</div><div className="small text-body-secondary">{tamanho(arquivo.size)} · clique para trocar</div></div>
                  ) : (
                    <div>
                      <div className="fw-semibold">{acao?.caminho_anexo ? 'Clique para substituir o anexo (opcional)' : 'Clique para escolher um arquivo (opcional)'}</div>
                      <div className="small text-body-secondary">PDF, PNG, JPG ou JPEG · até 2 MB</div>
                    </div>
                  )}
                </label>
              )}
            </div>

            <div className="modal-footer border-0 pt-0 px-4 pb-4">
              <button type="button" className="btn btn-soft-muted" onClick={onFechar}>{ro ? 'Fechar' : 'Cancelar'}</button>
              {!ro && (
                <button className="btn btn-grad" disabled={salvando}>
                  {salvando ? <><span className="spinner-border spinner-border-sm" /> Salvando…</> : <><i className="bi bi-check2" /> Salvar</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      {confirmando && (
        <ConfirmModal
          titulo="Salvar as alterações desta ação?"
          mensagem={remover && !arquivo ? 'O anexo atual será removido do disco.' : arquivo ? 'O anexo atual será substituído pelo novo arquivo.' : 'Os dados informados substituirão os atuais.'}
          confirmarTexto="Salvar alterações" variante="primary" icone="bi-pencil-square" carregando={salvando}
          onConfirmar={() => void salvar()} onCancelar={() => setConfirmando(false)} />
      )}
    </>,
    document.body,
  )
}
