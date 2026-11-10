using Dapper;

namespace PainelEnade.Api.Endpoints;

public static class PainelEndpoints
{
    public static void MapPainel(this RouteGroupBuilder api)
    {
        api.MapGet("/ofertas", Ofertas);
        api.MapGet("/edicoes", Edicoes);
        api.MapGet("/painel", Painel);
    }

    static IResult Ofertas(Db db)
    {
        using var conn = db.Abrir();
        return Results.Ok(conn.Query<Oferta>(
            "select id, codigo, curso, grau_academico, modalidade from oferta order by curso"));
    }

    static IResult Edicoes(Db db)
    {
        using var conn = db.Abrir();
        return Results.Ok(conn.Query<int>("select distinct edicao from resultado order by edicao"));
    }

    static IResult Painel(long? oferta_id, int? edicao, Db db)
    {
        if (oferta_id is null)
            return Results.BadRequest(new { erro = "Informe oferta_id." });

        using var conn = db.Abrir();
        var oferta = conn.QuerySingleOrDefault<Oferta>(
            "select id, codigo, curso, grau_academico, modalidade from oferta where id = @oferta_id",
            new { oferta_id });
        if (oferta is null)
            return Results.NotFound(new { erro = "Oferta não encontrada." });

        var resultados = conn.Query<Resultado>("""
            select id, edicao, inscritos, participantes, nota_fg, nota_ce, conceito_continuo, conceito_faixa,
                   ponto_forte, ponto_atencao, origem_dado, fonte_url
            from resultado where oferta_id = @oferta_id order by edicao
            """, new { oferta_id }).ToList();

        static double Taxa(Resultado r) => Math.Round(r.Participantes * 100.0 / r.Inscritos, 2);

        var historico = resultados.Select(r => new
        {
            r.Edicao,
            NotaContinua = r.ConceitoContinuo,
            r.ConceitoFaixa,
            FormacaoGeral = r.NotaFg,
            ComponenteEspecifico = r.NotaCe,
            r.Inscritos,
            r.Participantes,
            TaxaParticipacao = Taxa(r),
            r.OrigemDado,
            r.FonteUrl
        }).ToList();

        long? ed = edicao ?? resultados.LastOrDefault()?.Edicao;
        var sel = resultados.FirstOrDefault(r => r.Edicao == ed);
        var serieLimitada = resultados.Count == 1;
        var observacoes = Observacoes(resultados);

        if (sel is null)
            return Results.Ok(new
            {
                oferta, edicao = ed, sem_dados = true, serie_limitada = serieLimitada,
                historico, observacoes
            });

        return Results.Ok(new
        {
            oferta, edicao = ed, sem_dados = false, serie_limitada = serieLimitada,
            nota_continua = sel.ConceitoContinuo,
            conceito_faixa = sel.ConceitoFaixa,
            formacao_geral = sel.NotaFg,
            componente_especifico = sel.NotaCe,
            inscritos = sel.Inscritos,
            participantes = sel.Participantes,
            taxa_participacao = Taxa(sel),
            ponto_forte = sel.PontoForte,
            ponto_atencao = sel.PontoAtencao,
            origem_dado = sel.OrigemDado,
            fonte_url = sel.FonteUrl,
            historico, observacoes
        });
    }

    static string[] Observacoes(List<Resultado> rs)
    {
        if (rs.Count == 0) return ["Nenhuma edição oficial cadastrada para esta oferta."];

        static string N(double v) => v.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture).Replace('.', ',');
        static double Taxa(Resultado r) => r.Participantes * 100.0 / r.Inscritos;
        var n = rs.Count;
        var plural = n == 1 ? "edição oficial" : "edições oficiais";

        var abaixo = rs.Count(r => r.NotaCe < r.NotaFg);
        var dif = rs.Average(r => r.NotaFg - r.NotaCe);
        var obs1 = abaixo == 0
            ? $"O Componente Específico ficou igual ou acima da Formação Geral em todas as {n} {plural}."
            : $"O Componente Específico ficou abaixo da Formação Geral em {abaixo} de {n} {plural} "
              + $"(diferença média FG − CE: {N(dif)} pontos)" + (abaixo * 2 > n ? "; é nele que as ações deveriam se concentrar." : ".");

        string obs2;
        if (n == 1)
            obs2 = $"Há apenas uma edição oficial ({rs[0].Edicao}); não é possível medir a evolução do curso (série histórica limitada).";
        else
        {
            var a = rs[0]; var b = rs[^1];
            obs2 = $"Entre {a.Edicao} e {b.Edicao}, a participação foi de {N(Taxa(a))}% para {N(Taxa(b))}%";
            if (a.ConceitoContinuo is double ca && b.ConceitoContinuo is double cb)
            {
                obs2 += $" e o conceito contínuo de {N(ca)} para {N(cb)} ({(cb >= ca ? "+" : "−")}{N(Math.Abs(cb - ca))})";
                if (Taxa(b) > Taxa(a) && cb < ca) obs2 += ": mais participação não se traduziu em conceito maior";
            }
            obs2 += ".";
        }
        return [obs1, obs2];
    }
}
