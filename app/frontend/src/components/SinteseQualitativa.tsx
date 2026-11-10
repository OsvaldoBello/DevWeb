interface Props { forte?: string; atencao?: string; observacoes: string[] }

export default function SinteseQualitativa({ forte, atencao, observacoes }: Props) {
  return (
    <div className="card-soft p-4 h-100">
      <h2 className="card-title-sm">Síntese dos indicadores</h2>
      <div className="small text-body-secondary mb-3">Observações produzidas pelo grupo</div>
      <div className="d-grid gap-3">
        {forte && (
          <div className="alert alert-success sintese-item sintese-ok border-0 mb-0">
            <span className="ic text-success"><i className="bi bi-check-lg" /></span>
            <div><strong>Ponto forte</strong><div className="small">{forte}</div></div>
          </div>
        )}
        {atencao && (
          <div className="alert alert-warning sintese-item sintese-warn border-0 mb-0">
            <span className="ic text-warning"><i className="bi bi-exclamation-lg" /></span>
            <div><strong>Ponto de atenção</strong><div className="small">{atencao}</div></div>
          </div>
        )}
      </div>
      <hr />
      <div className="label-sm mb-2">Observações sobre a oferta</div>
      <ul className="small mb-0 ps-3">{observacoes.map((o, i) => <li key={i} className="mb-1">{o}</li>)}</ul>
    </div>
  )
}
