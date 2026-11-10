function Barra({ rotulo, valor, cor, icone }: { rotulo: string; valor: number; cor: string; icone: string }) {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-1">
        <span><i className={`bi ${icone} me-1`} />{rotulo}</span><strong>{valor.toFixed(2)}%</strong>
      </div>
      <div className="progress" role="progressbar" aria-label={rotulo} aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100} style={{ height: 14 }}>
        <div className={`progress-bar ${cor}`} style={{ width: `${Math.min(100, Math.max(0, valor))}%`, transition: 'width .6s' }} />
      </div>
    </div>
  )
}

export default function DesempenhoBarras({ fg, ce }: { fg: number; ce: number }) {
  const dif = fg - ce
  return (
    <div className="card-soft p-4 h-100">
      <h2 className="card-title-sm">Desempenho</h2>
      <div className="small text-body-secondary mb-4">Notas brutas por componente (0 a 100%)</div>
      <Barra rotulo="Formação Geral" valor={fg} cor="bg-info" icone="bi-journal-text" />
      <Barra rotulo="Componente Específico" valor={ce} cor="bg-primary" icone="bi-cpu" />
      <div className="rounded-3 p-3 small" style={{ background: '#eef2fb', color: 'var(--c-navy)' }}>
        <strong>Leitura:</strong>{' '}
        {Math.abs(dif) < 0.005 ? 'os dois componentes têm a mesma nota.'
          : dif > 0 ? `a Formação Geral está ${dif.toFixed(2)} pontos acima do Componente Específico.`
          : `o Componente Específico está ${(-dif).toFixed(2)} pontos acima da Formação Geral.`}
      </div>
    </div>
  )
}
