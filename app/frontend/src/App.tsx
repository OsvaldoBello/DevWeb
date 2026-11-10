import { useEffect, useState } from 'react'
import { ApiError, getSessao, req, setSessao, type Acao, type Oferta, type Painel, type Sessao } from './api'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Filtros from './components/Filtros'
import IndicadoresCards from './components/IndicadoresCards'
import EvolucaoChart from './components/EvolucaoChart'
import DesempenhoBarras from './components/DesempenhoBarras'
import SinteseQualitativa from './components/SinteseQualitativa'
import TabelaHistorico from './components/TabelaHistorico'
import Cobertura from './components/Cobertura'
import CrudAcoes from './components/CrudAcoes'
import Login from './components/Login'
import { FiltrosSkeleton, PainelSkeleton } from './components/Skeleton'

export default function App() {
  const [sessao, setSessaoState] = useState<Sessao | null>(getSessao())

  useEffect(() => {
    const h = () => setSessaoState(null)
    window.addEventListener('sessao-expirada', h)
    return () => window.removeEventListener('sessao-expirada', h)
  }, [])

  useEffect(() => {
    if (!getSessao()) return
    req<Sessao['usuario']>('/api/auth/me')
      .then(u => { const atual = getSessao(); if (atual) { const n = { ...atual, usuario: u }; setSessao(n); setSessaoState(n) } })
      .catch(() => {})
  }, [])

  const entrar = (s: Sessao) => { setSessao(s); setSessaoState(s) }
  const sair = async () => {
    try { await req('/api/auth/logout', { method: 'POST' }) } catch {}
    setSessao(null)
    setSessaoState(null)
  }

  if (!sessao) return <Login onEntrar={entrar} />
  return <Dashboard usuario={sessao.usuario} onSair={sair} />
}

function Dashboard({ usuario, onSair }: { usuario: Sessao['usuario']; onSair: () => void }) {
  const [menu, setMenu] = useState(false)
  const [recolhida, setRecolhida] = useState(() => {
    try { return localStorage.getItem('sidebar_recolhida') === '1' } catch { return false }
  })
  const alternarSidebar = () => setRecolhida(r => {
    try { localStorage.setItem('sidebar_recolhida', r ? '0' : '1') } catch {}
    return !r
  })

  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [edicoes, setEdicoes] = useState<number[]>([])
  const [ofertaId, setOfertaId] = useState<number | null>(null)
  const [edicao, setEdicao] = useState<number | null>(null)
  const [painel, setPainel] = useState<Painel | null>(null)
  const [carregandoPainel, setCarregandoPainel] = useState(true)
  const [acoes, setAcoes] = useState<Acao[]>([])
  const [carregandoAcoes, setCarregandoAcoes] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([req<Oferta[]>('/api/ofertas'), req<number[]>('/api/edicoes')])
      .then(([o, e]) => { setOfertas(o); setEdicoes(e); setOfertaId(o[0]?.id ?? null) })
      .catch((e: ApiError) => { setErro(e.message); setCarregandoPainel(false); setCarregandoAcoes(false) })
  }, [])

  useEffect(() => {
    if (ofertaId == null) return
    let ativo = true
    setErro(''); setCarregandoPainel(true)
    const qs = `oferta_id=${ofertaId}${edicao != null ? `&edicao=${edicao}` : ''}`
    req<Painel>(`/api/painel?${qs}`)
      .then(p => { if (ativo) setPainel(p) })
      .catch((e: ApiError) => { if (ativo) setErro(e.message) })
      .finally(() => { if (ativo) setCarregandoPainel(false) })
    return () => { ativo = false }
  }, [ofertaId, edicao])

  const [versaoAcoes, setVersaoAcoes] = useState(0)
  useEffect(() => {
    if (ofertaId == null) return
    let ativo = true
    setCarregandoAcoes(true)
    req<Acao[]>(`/api/acoes?oferta_id=${ofertaId}`)
      .then(a => { if (ativo) setAcoes(a) })
      .catch((e: ApiError) => { if (ativo) setErro(e.message) })
      .finally(() => { if (ativo) setCarregandoAcoes(false) })
    return () => { ativo = false }
  }, [ofertaId, versaoAcoes])

  const trocouOferta = painel != null && painel.oferta.id !== ofertaId
  const primeiraCarga = painel == null || trocouOferta
  const edicaoExibida = painel && !trocouOferta ? painel.edicao : edicao

  return (
    <>
      <Sidebar aberta={menu} recolhida={recolhida} onFechar={() => setMenu(false)} onAlternar={alternarSidebar} anos={edicoes} />
      <div className={`main-area ${recolhida ? 'recolhida' : ''}`}>
        <div id="topo" />
        <Navbar usuario={usuario} onSair={onSair} onMenu={() => setMenu(true)} />
        <main className="container-fluid px-3 px-lg-4 py-4">
          {erro && <div className="alert alert-danger d-flex gap-2" role="alert"><i className="bi bi-exclamation-triangle-fill" />{erro}</div>}

          {ofertas.length === 0 && !erro ? <FiltrosSkeleton /> : (
            <Filtros ofertas={ofertas} edicoes={edicoes} ofertaId={ofertaId} edicao={edicaoExibida}
                     edicoesComDados={painel && !trocouOferta ? painel.historico.map(h => h.edicao) : undefined}
                     onOferta={id => { setEdicao(null); setOfertaId(id) }}
                     onEdicao={setEdicao} />
          )}

          {primeiraCarga && carregandoPainel && !erro && <PainelSkeleton />}

          {painel && !trocouOferta && (
            <div className={carregandoPainel ? 'recarregando' : ''}>
              {painel.serie_limitada && (
                <div className="alert alert-warning d-flex align-items-center gap-2 py-2" role="status">
                  <i className="bi bi-info-circle-fill" />
                  <span className="fw-semibold">Série histórica limitada para esta oferta</span>
                </div>
              )}

              {painel.sem_dados ? (
                <div className="card-soft vazio mb-4">
                  <i className="bi bi-inbox" />
                  <div className="h5 mt-2 mb-1">Sem dados para esta oferta/edição</div>
                  {painel.historico.length > 0 ? (
                    <>
                      <div className="text-body-secondary mb-3">
                        Esta oferta possui dados oficiais {painel.historico.length === 1 ? 'apenas na edição' : 'nas edições'}:
                      </div>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {painel.historico.map(h => (
                          <button key={h.edicao} className="btn btn-solid" onClick={() => setEdicao(h.edicao)}>
                            <i className="bi bi-calendar-check" /> {h.edicao}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : <div className="text-body-secondary">Nenhuma edição oficial cadastrada para esta oferta.</div>}
                </div>
              ) : (
                <IndicadoresCards p={painel} />
              )}

              <div className="row g-3 mb-4">
                <div className="col-12 col-xl-5">
                  <div className="card-soft p-4 h-100">
                    <h2 className="card-title-sm">Evolução do curso</h2>
                    <div className="small text-body-secondary mb-3">Indicadores nas edições disponíveis</div>
                    <EvolucaoChart historico={painel.historico} edicaoSelecionada={painel.edicao ?? 0} onSelecionar={setEdicao} />
                  </div>
                </div>
                {!painel.sem_dados && (
                  <div className="col-12 col-md-6 col-xl-3">
                    <DesempenhoBarras fg={painel.formacao_geral!} ce={painel.componente_especifico!} />
                  </div>
                )}
                <div className={`col-12 col-md-6 ${painel.sem_dados ? 'col-xl-7' : 'col-xl-4'}`}>
                  <SinteseQualitativa forte={painel.ponto_forte} atencao={painel.ponto_atencao} observacoes={painel.observacoes} />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-xl-8">
                  <TabelaHistorico historico={painel.historico} edicaoSelecionada={painel.edicao ?? 0} />
                </div>
                <div className="col-12 col-xl-4"><Cobertura ofertas={ofertas} edicoes={edicoes} /></div>
              </div>
            </div>
          )}

          {ofertaId != null && (
            <CrudAcoes ofertaId={ofertaId} acoes={acoes.filter(a => a.oferta_id === ofertaId)} carregando={carregandoAcoes} onMudou={() => setVersaoAcoes(v => v + 1)} />
          )}
        </main>
      </div>
    </>
  )
}
