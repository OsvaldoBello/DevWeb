import { useEffect, useMemo, useState } from 'react'
import { req, urlAnexo, type Acao } from '../api'
import CrudAcoesModal from './CrudAcoesModal'
import ConfirmModal from './ConfirmModal'
import { LinhasSkeleton } from './Skeleton'

type Modo = { tipo: 'novo' } | { tipo: 'editar' | 'ver'; acao: Acao } | null

const ESTILO_SIT: Record<string, { classe: string; icone: string }> = {
  'Em planejamento': { classe: 'planejamento', icone: 'bi-calendar-event' },
  'Em andamento': { classe: 'andamento', icone: 'bi-arrow-repeat' },
  'Concluída': { classe: 'concluida', icone: 'bi-check-circle-fill' },
}

const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function CrudAcoes({ ofertaId, acoes, carregando, onMudou }: { ofertaId: number; acoes: Acao[]; carregando: boolean; onMudou: () => void }) {
  const [modo, setModo] = useState<Modo>(null)
  const [msg, setMsg] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroSit, setFiltroSit] = useState('')
  const [excluindo, setExcluindo] = useState<Acao | null>(null)
  const [apagando, setApagando] = useState(false)

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 5000)
    return () => clearTimeout(t)
  }, [msg])

  useEffect(() => { setBusca(''); setFiltroSit('') }, [ofertaId])

  const visiveis = useMemo(() => {
    const q = norm(busca.trim())
    return acoes.filter(a =>
      (!filtroSit || a.situacao === filtroSit) &&
      (!q || norm(`${a.titulo} ${a.descricao} ${a.responsavel} ${a.nome_original_anexo ?? ''}`).includes(q)))
  }, [acoes, busca, filtroSit])

  const filtrando = busca.trim() !== '' || filtroSit !== ''

  const confirmarExclusao = async () => {
    if (!excluindo) return
    setApagando(true)
    try {
      await req(`/api/acoes/${excluindo.id}`, { method: 'DELETE' })
      setMsg({ tipo: 'success', texto: 'Ação excluída com sucesso.' })
      onMudou()
    } catch (e) { setMsg({ tipo: 'danger', texto: (e as Error).message }) }
    finally { setApagando(false); setExcluindo(null) }
  }

  return (
    <div className="card-soft p-4 mb-5" id="acoes">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="card-title-sm">Ações de acompanhamento</h2>
          <div className="small text-body-secondary">Anexos PDF, PNG ou JPG de até 2 MB</div>
        </div>
        <button className="btn btn-grad" onClick={() => setModo({ tipo: 'novo' })}>
          <i className="bi bi-plus-lg" /> Nova ação
        </button>
      </div>

      <div className="row g-2 busca mb-3">
        <div className="col-12 col-md-7">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search" /></span>
            <input type="search" className="form-control" placeholder="Buscar por título, descrição ou responsável"
                   aria-label="Buscar ações" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <div className="col-8 col-md-3">
          <select className="form-select" aria-label="Filtrar por situação" value={filtroSit} onChange={e => setFiltroSit(e.target.value)}>
            <option value="">Todas as situações</option>
            <option>Em planejamento</option><option>Em andamento</option><option>Concluída</option>
          </select>
        </div>
        <div className="col-4 col-md-2">
          <button className="btn btn-soft-muted w-100" disabled={!filtrando} onClick={() => { setBusca(''); setFiltroSit('') }}>
            <i className="bi bi-x-lg" /> Limpar
          </button>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.tipo} d-flex align-items-center gap-2 py-2`} role="alert">
          <i className={`bi ${msg.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} /> {msg.texto}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead><tr><th>Título</th><th>Situação</th><th>Responsável</th><th>Prazo</th><th>Anexo</th><th className="text-end">Ações</th></tr></thead>
          <tbody>
            {carregando && acoes.length === 0 && <LinhasSkeleton colunas={6} />}
            {visiveis.map(a => (
              <tr key={a.id}>
                <td className="fw-semibold">{a.titulo}</td>
                <td><span className={`status-pill ${ESTILO_SIT[a.situacao]?.classe ?? ''}`}><i className={`bi ${ESTILO_SIT[a.situacao]?.icone ?? ''}`} />{a.situacao}</span></td>
                <td>{a.responsavel}</td>
                <td>{a.prazo.split('-').reverse().join('/')}</td>
                <td>{a.caminho_anexo
                  ? <a href={urlAnexo(a.caminho_anexo)} target="_blank" rel="noreferrer" className="text-decoration-none">
                      <i className="bi bi-paperclip" /> {a.nome_original_anexo}</a>
                  : <span className="text-body-secondary">—</span>}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-icon ver me-1" title="Visualizar" aria-label={`Visualizar ${a.titulo}`} onClick={() => setModo({ tipo: 'ver', acao: a })}><i className="bi bi-eye" /></button>
                  <button className="btn btn-icon edit me-1" title="Editar" aria-label={`Editar ${a.titulo}`} onClick={() => setModo({ tipo: 'editar', acao: a })}><i className="bi bi-pencil" /></button>
                  <button className="btn btn-icon del" title="Excluir" aria-label={`Excluir ${a.titulo}`} onClick={() => setExcluindo(a)}><i className="bi bi-trash3" /></button>
                </td>
              </tr>
            ))}
            {!carregando && visiveis.length === 0 && (
              <tr><td colSpan={6} className="text-center text-body-secondary py-4">
                {filtrando ? 'Nenhuma ação encontrada para esta busca.' : 'Nenhuma ação cadastrada para esta oferta.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {acoes.length > 0 && (
        <div className="small text-body-secondary mt-2">Mostrando {visiveis.length} de {acoes.length} {acoes.length === 1 ? 'ação' : 'ações'}</div>
      )}

      {excluindo && (
        <ConfirmModal
          titulo="Deseja realmente excluir esta ação?"
          mensagem={`"${excluindo.titulo}" será removida${excluindo.caminho_anexo ? ', junto com o anexo' : ''}. Esta operação não pode ser desfeita.`}
          confirmarTexto="Excluir" variante="danger" carregando={apagando}
          onConfirmar={confirmarExclusao} onCancelar={() => setExcluindo(null)} />
      )}

      {modo && (
        <CrudAcoesModal
          ofertaId={ofertaId}
          acao={modo.tipo === 'novo' ? null : modo.acao}
          somenteLeitura={modo.tipo === 'ver'}
          onFechar={() => setModo(null)}
          onSalvo={texto => { setModo(null); setMsg({ tipo: 'success', texto }); onMudou() }}
        />
      )}
    </div>
  )
}
