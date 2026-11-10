namespace PainelEnade.Api;

public record LoginRequest(string? Login, string? Senha);

public class Usuario
{
    public long Id { get; set; }
    public string Nome { get; set; } = "";
    public string Login { get; set; } = "";
    public string SenhaHash { get; set; } = "";
}

public class Oferta
{
    public long Id { get; set; }
    public string Codigo { get; set; } = "";
    public string Curso { get; set; } = "";
    public string GrauAcademico { get; set; } = "";
    public string Modalidade { get; set; } = "";
}

public class Resultado
{
    public long Id { get; set; }
    public long Edicao { get; set; }
    public long Inscritos { get; set; }
    public long Participantes { get; set; }
    public double NotaFg { get; set; }
    public double NotaCe { get; set; }
    public double? ConceitoContinuo { get; set; }
    public string ConceitoFaixa { get; set; } = "";
    public string PontoForte { get; set; } = "";
    public string PontoAtencao { get; set; } = "";
    public string OrigemDado { get; set; } = "";
    public string FonteUrl { get; set; } = "";
}

public class Acao
{
    public long Id { get; set; }
    public long OfertaId { get; set; }
    public string Titulo { get; set; } = "";
    public string Descricao { get; set; } = "";
    public string Situacao { get; set; } = "";
    public string Responsavel { get; set; } = "";
    public string Prazo { get; set; } = "";
    public string? NomeOriginalAnexo { get; set; }
    public string? CaminhoAnexo { get; set; }
}
