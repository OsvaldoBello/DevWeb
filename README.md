# Painel ENADE: Gestão por Indicadores (Recorte R07)

## O que é o projeto

Aplicação web local para acompanhar os indicadores públicos do **Conceito ENADE** (Inep) das três ofertas do
recorte **R07 – Computação e desenvolvimento de sistemas**, apoiando a tomada de decisão acadêmica:

| Oferta | Grau | Modalidade |
|---|---|---|
| Ciência da Computação | Bacharelado | Presencial |
| Engenharia de Computação | Bacharelado | Presencial |
| Tecnologia em Análise e Desenvolvimento de Sistemas | Tecnológico | EaD |

O usuário faz login, escolhe a oferta e a edição do ENADE e vê:

- **Indicadores:** conceito contínuo (0 a 5), conceito em faixa (1 a 5 ou `SC`), percentual de participação e situação (Bom, Acompanhar ou Atenção).
- **Desempenho:** notas brutas de Formação Geral e Componente Específico em barras de progresso.
- **Síntese:** ponto forte, ponto de atenção e duas observações sobre a oferta.
- **Histórico:** tabela com todas as edições oficiais da oferta e gráficos de evolução. Quando há uma única edição, aparece o aviso "Série histórica limitada para esta oferta"; quando a edição não tem registro, aparece "Sem dados para esta oferta/edição".
- **Ações de acompanhamento:** CRUD completo (listar, visualizar, cadastrar, editar, excluir) vinculado à oferta, com anexo opcional em PDF, PNG, JPG ou JPEG de até 2 MB, busca e filtro por situação.

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Backend | C# · ASP.NET Core 9 (Minimal API) · Dapper · BCrypt.Net |
| Banco de dados | SQLite local (`painel_enade.db`) |
| Frontend | React 18 · TypeScript · Vite · Bootstrap 5 · Bootstrap Icons |
| Gráficos (extra) | Chart.js · react-chartjs-2 |
| Fontes | Sora e Source Sans 3 (pacotes locais, funcionam sem internet) |
| Upload | Disco local, pasta `app/uploads/` |

Nenhum serviço de nuvem é utilizado.

## Como iniciar

### Pré-requisitos
- [.NET SDK 8 ou 9](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### 1. Backend (http://localhost:5000)
```bash
cd app/backend
dotnet run
```
Na primeira execução o banco `app/backend/painel_enade.db` é criado automaticamente a partir de
`banco/estrutura.sql` e `banco/dados_iniciais.sql`. Para recriar o banco do zero, apague o arquivo `.db` e rode de novo.

### 2. Frontend (http://localhost:5173), em outro terminal
```bash
cd app/frontend
npm install
npm run dev
```
Abra http://localhost:5173.

### Usuário de demonstração
| Login | Senha |
|---|---|
| `admin` | `123` |

## Configuração do banco

Não há credenciais: o SQLite é um arquivo local. A string de conexão fica em `app/backend/appsettings.json`
(`ConnectionStrings:Banco`). Os scripts também podem ser executados manualmente:
```bash
sqlite3 painel_enade.db < banco/estrutura.sql
sqlite3 painel_enade.db < banco/dados_iniciais.sql
```
Se o backend rodar em outra porta, copie `app/frontend/.env.example` para `.env` e ajuste `VITE_API_URL`.

## Estrutura de pastas

```text
.
├── README.md
├── app/
│   ├── backend/            API em C# (Program.cs, Endpoints/, Models.cs)
│   ├── frontend/           SPA React + Vite + TypeScript (src/components/)
│   └── uploads/            Anexos das ações (inclui o PDF de demonstração)
├── banco/
│   ├── estrutura.sql       DDL das tabelas
│   └── dados_iniciais.sql  Ofertas, resultados oficiais, usuário e ações de demonstração
└── docs/
    └── contribuicoes.pdf   Quadro de contribuições
```

## Dados

`banco/dados_iniciais.sql` contém as 3 ofertas e os **6 resultados oficiais do Inep** do arquivo
`R07_enade_2015_2025.csv` (linhas `OFICIAL_INEP`): Ciência da Computação 2017 e 2021; Engenharia de
Computação 2017, 2019 e 2023; ADS 2021. As linhas `SIMULADO_DIDATICO` do CSV **não** foram carregadas.

- Participação = `participantes / inscritos × 100` (calculada pelo banco e pela API).
- Conceito em faixa aceita `1` a `5` ou `SC` (nesse caso o contínuo pode ser nulo).
- O seletor de edição lista as edições existentes na base (2017, 2019, 2021, 2023) e marca as que não têm dados para a oferta escolhida.
- As observações do painel são calculadas a partir dos resultados da própria oferta.

## API

Tudo em `/api`, exceto o login, exige `Authorization: Bearer <token>`.

| Rota | Função |
|---|---|
| `POST /api/auth/login` | `{login, senha}` → `{token, usuario}` |
| `POST /api/auth/logout` | Revoga o token |
| `GET /api/auth/me` | Confirma que o token ainda vale |
| `GET /api/ofertas` | As 3 ofertas do recorte |
| `GET /api/edicoes` | Edições existentes na base |
| `GET /api/painel?oferta_id=&edicao=` | Indicadores, `historico`, `serie_limitada`, `sem_dados`, `observacoes` (sem `edicao`, usa a mais recente da oferta) |
| `GET /api/acoes?oferta_id=` | Lista as ações da oferta |
| `GET /api/acoes/{id}` | Consulta uma ação |
| `POST /api/acoes` | Cadastra (multipart/form-data, arquivo opcional no campo `anexo`) |
| `PUT /api/acoes/{id}` | Edita: mantém, substitui (`anexo`) ou remove (`remover_anexo=true`) o anexo |
| `DELETE /api/acoes/{id}` | Exclui a ação **e o arquivo físico** do anexo |

## Upload de anexos

- Formatos: `.pdf`, `.png`, `.jpg`, `.jpeg`. Tamanho máximo: **2 MB**, validado no servidor e no navegador. Acima do limite a API responde 413 com mensagem clara.
- O arquivo é salvo em `app/uploads/` como `{ticks}_{guid}{ext}`; o banco guarda `nome_original_anexo` e `caminho_anexo`.
- Os arquivos são servidos em `http://localhost:5000/uploads/<arquivo>`.
- A ação "Revisão dos conteúdos do componente específico" (Engenharia de Computação) já vem com um PDF anexo.

## Decisões e limitações

- **Sessão:** o login devolve um token aleatório guardado na tabela `sessao` do banco e no `localStorage` do navegador; vale 8 horas, sobrevive a reinício do backend e o "Sair" revoga o token.
- **Extras:** os requisitos obrigatórios funcionam só com HTML, Bootstrap e React. O Chart.js, a barra lateral recolhível, o skeleton de carregamento e os modais de confirmação são recursos extras.
- Um único usuário de demonstração, sem perfis. CORS aberto e arquivos de `/uploads` sem autenticação (uso local e didático).
- Não há importador de CSV: os dados foram inseridos manualmente no SQL.
- Projeto feito para rodar **localmente**; não foi preparado para hospedagem em nuvem.
