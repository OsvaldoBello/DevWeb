export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export interface Oferta { id: number; codigo: string; curso: string; grau_academico: string; modalidade: string }
export interface Usuario { nome: string; login: string }

export interface Historico {
  edicao: number
  nota_continua: number | null
  conceito_faixa: string
  formacao_geral: number
  componente_especifico: number
  inscritos: number
  participantes: number
  taxa_participacao: number
  origem_dado: string
  fonte_url: string
}

export interface Painel {
  oferta: Oferta
  edicao: number | null
  sem_dados: boolean
  serie_limitada: boolean
  nota_continua?: number | null
  conceito_faixa?: string
  formacao_geral?: number
  componente_especifico?: number
  inscritos?: number
  participantes?: number
  taxa_participacao?: number
  ponto_forte?: string
  ponto_atencao?: string
  origem_dado?: string
  historico: Historico[]
  observacoes: string[]
}

export interface Acao {
  id: number
  oferta_id: number
  titulo: string
  descricao: string
  situacao: string
  responsavel: string
  prazo: string
  nome_original_anexo: string | null
  caminho_anexo: string | null
}

const KEY = 'painel_enade_auth'
export interface Sessao { token: string; usuario: Usuario }

export const getSessao = (): Sessao | null => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { return null }
}
export const setSessao = (s: Sessao | null) => {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY) } catch {}
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const s = getSessao()
  if (s) headers.set('Authorization', `Bearer ${s.token}`)
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json')
  let res: Response
  try {
    res = await fetch(`${API}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar à API. Verifique se o backend está rodando em ' + API)
  }
  if (res.status === 401 && path !== '/api/auth/login') {
    setSessao(null)
    window.dispatchEvent(new Event('sessao-expirada'))
  }
  if (!res.ok) {
    const corpo = await res.json().catch(() => null)
    throw new ApiError(res.status, corpo?.erro ?? (res.status === 413 ? 'Arquivo maior que 2 MB. Envie um arquivo menor.' : `Erro ${res.status}`))
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const urlAnexo = (caminho: string) => `${API}/uploads/${encodeURIComponent(caminho)}`
