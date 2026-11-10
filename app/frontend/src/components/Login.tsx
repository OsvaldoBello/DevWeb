import { useRef, useState, type FormEvent } from 'react'
import { req, type Sessao } from '../api'
import '../login.css'

const DESTAQUES = [
  { icone: 'bi-speedometer2', titulo: 'Indicadores por oferta', texto: 'Conceito contínuo, faixa e participação em um só lugar.' },
  { icone: 'bi-clock-history', titulo: 'Histórico de edições', texto: 'Compare a evolução do ENADE ao longo dos ciclos.' },
  { icone: 'bi-clipboard-check', titulo: 'Ações de acompanhamento', texto: 'Registre responsáveis, prazos e evidências anexas.' },
]

export default function Login({ onEntrar }: { onEntrar: (s: Sessao) => void }) {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [enviando, setEnviando] = useState(false)

  const falhar = (msg: string) => {
    setErro(msg)
    const f = formRef.current
    if (f) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake') }
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (!login.trim() || !senha) { falhar('Informe login e senha.'); return }
    setEnviando(true); setErro('')
    try {
      onEntrar(await req<Sessao>('/api/auth/login', { method: 'POST', body: JSON.stringify({ login, senha }) }))
    } catch (err) {
      falhar((err as Error).message)
    } finally { setEnviando(false) }
  }

  return (
    <div className="row g-0 login-wrap">
      <aside className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 login-hero">
        <div className="hero-logo"><i className="bi bi-bar-chart-line-fill" /></div>
        <div>
          <h1 className="display-5 fw-bold mb-2">Painel ENADE</h1>
          <p className="fs-5 opacity-75 mb-5">Computação e desenvolvimento de sistemas · Recorte R07</p>
          <div className="d-grid gap-4">
            {DESTAQUES.map(d => (
              <div className="hero-item" key={d.titulo}>
                <i className={`bi ${d.icone}`} />
                <div><div className="fw-semibold">{d.titulo}</div><div className="small opacity-75">{d.texto}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div />
      </aside>

      <main className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4 bg-white">
        <form ref={formRef} onSubmit={enviar} noValidate className="login-card">
          <div className="d-lg-none text-center mb-4">
            <i className="bi bi-bar-chart-line-fill fs-1 text-primary" />
            <div className="h4 fw-bold mb-0">Painel ENADE</div>
          </div>
          <h2 className="h3 fw-bold mb-1">Bem-vindo de volta</h2>
          <p className="text-body-secondary mb-4">Entre para acessar os indicadores.</p>

          {erro && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill" /> <span>{erro}</span>
            </div>
          )}

          <label htmlFor="login" className="form-label fw-semibold small">Login</label>
          <div className="input-group mb-3">
            <span className="input-group-text"><i className="bi bi-person" /></span>
            <input id="login" className="form-control" placeholder="Digite seu login" autoFocus autoComplete="username"
                   value={login} onChange={e => setLogin(e.target.value)} />
          </div>

          <label htmlFor="senha" className="form-label fw-semibold small">Senha</label>
          <div className="input-group mb-4">
            <span className="input-group-text"><i className="bi bi-lock" /></span>
            <input id="senha" type={ver ? 'text' : 'password'} className="form-control" placeholder="Digite sua senha"
                   autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} />
            <button type="button" className="btn btn-toggle" onClick={() => setVer(v => !v)}
                    aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>
              <i className={`bi ${ver ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>

          <button className="btn btn-primary btn-entrar w-100" disabled={enviando}>
            {enviando
              ? <><span className="spinner-border spinner-border-sm me-2" /> Entrando…</>
              : <>Entrar <i className="bi bi-arrow-right ms-1" /></>}
          </button>

          <div className="demo-box small p-3 mt-4 d-flex gap-2">
            <i className="bi bi-info-circle-fill" />
            <span>Acesso de demonstração: <strong>admin</strong> / <strong>123</strong></span>
          </div>
        </form>
      </main>
    </div>
  )
}
