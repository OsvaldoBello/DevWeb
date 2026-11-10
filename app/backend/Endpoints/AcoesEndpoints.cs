using System.Globalization;
using Dapper;

namespace PainelEnade.Api.Endpoints;

public static class AcoesEndpoints
{
    static readonly string[] ExtensoesPermitidas = [".pdf", ".png", ".jpg", ".jpeg"];
    const long TamanhoMaximo = 2 * 1024 * 1024;
    static readonly string[] Situacoes = ["Em planejamento", "Em andamento", "Concluída"];

    const string Colunas = """
        id, oferta_id, titulo, descricao, situacao, responsavel, prazo,
        nome_original_anexo, caminho_anexo
        """;

    public static void MapAcoes(this RouteGroupBuilder api)
    {
        api.MapGet("/acoes", Listar);
        api.MapGet("/acoes/{id:long}", Obter);
        api.MapPost("/acoes", Criar);
        api.MapPut("/acoes/{id:long}", Atualizar);
        api.MapDelete("/acoes/{id:long}", Excluir);
    }

    static IResult Listar(long? oferta_id, Db db)
    {
        using var conn = db.Abrir();
        var sql = $"select {Colunas} from acao " + (oferta_id is null ? "" : "where oferta_id = @oferta_id ") + "order by prazo, id";
        return Results.Ok(conn.Query<Acao>(sql, new { oferta_id }));
    }

    static IResult Obter(long id, Db db)
    {
        using var conn = db.Abrir();
        var a = conn.QuerySingleOrDefault<Acao>($"select {Colunas} from acao where id = @id", new { id });
        return a is null ? Results.NotFound(new { erro = "Ação não encontrada." }) : Results.Ok(a);
    }

    static async Task<IResult> Criar(HttpRequest req, Db db, Sessoes sessoes)
    {
        var form = await LerForm(req);
        if (form is null) return ErroCorpoGrande;
        var (dados, erro) = Validar(form, exigirOferta: true);
        if (erro is not null) return Results.BadRequest(new { erro });

        using var conn = db.Abrir();
        if (conn.ExecuteScalar<long>("select count(*) from oferta where id = @OfertaId", dados) == 0)
            return Results.BadRequest(new { erro = "Oferta inexistente." });

        string? nomeOriginal = null, caminho = null;
        var arquivo = form.Files.GetFile("anexo");
        if (arquivo is { Length: > 0 })
        {
            var errArq = ValidarArquivo(arquivo);
            if (errArq is not null) return Results.BadRequest(new { erro = errArq });
            nomeOriginal = Path.GetFileName(arquivo.FileName);
            caminho = await SalvarArquivo(arquivo, sessoes.UploadsPath);
        }

        try
        {
            var id = conn.ExecuteScalar<long>("""
                insert into acao (oferta_id, titulo, descricao, situacao, responsavel, prazo, nome_original_anexo, caminho_anexo)
                values (@OfertaId, @Titulo, @Descricao, @Situacao, @Responsavel, @Prazo, @nomeOriginal, @caminho);
                select last_insert_rowid();
                """, new { dados.OfertaId, dados.Titulo, dados.Descricao, dados.Situacao, dados.Responsavel, dados.Prazo, nomeOriginal, caminho });
            var a = conn.QuerySingle<Acao>($"select {Colunas} from acao where id = @id", new { id });
            return Results.Created($"/api/acoes/{id}", a);
        }
        catch
        {
            ApagarArquivo(sessoes.UploadsPath, caminho);
            throw;
        }
    }

    static async Task<IResult> Atualizar(long id, HttpRequest req, Db db, Sessoes sessoes)
    {
        using var conn = db.Abrir();
        var atual = conn.QuerySingleOrDefault<Acao>($"select {Colunas} from acao where id = @id", new { id });
        if (atual is null) return Results.NotFound(new { erro = "Ação não encontrada." });

        var form = await LerForm(req);
        if (form is null) return ErroCorpoGrande;
        var (dados, erro) = Validar(form, exigirOferta: false);
        if (erro is not null) return Results.BadRequest(new { erro });

        var arquivo = form.Files.GetFile("anexo");
        var remover = string.Equals(form["remover_anexo"].ToString(), "true", StringComparison.OrdinalIgnoreCase);

        var nomeOriginal = atual.NomeOriginalAnexo;
        var caminho = atual.CaminhoAnexo;
        string? antigoParaApagar = null;
        string? novoSalvo = null;

        if (arquivo is { Length: > 0 })
        {
            var errArq = ValidarArquivo(arquivo);
            if (errArq is not null) return Results.BadRequest(new { erro = errArq });
            novoSalvo = await SalvarArquivo(arquivo, sessoes.UploadsPath);
            antigoParaApagar = atual.CaminhoAnexo;
            nomeOriginal = Path.GetFileName(arquivo.FileName);
            caminho = novoSalvo;
        }
        else if (remover)
        {
            antigoParaApagar = atual.CaminhoAnexo;
            nomeOriginal = null;
            caminho = null;
        }

        try
        {
            conn.Execute("""
                update acao set titulo = @Titulo, descricao = @Descricao, situacao = @Situacao,
                    responsavel = @Responsavel, prazo = @Prazo,
                    nome_original_anexo = @nomeOriginal, caminho_anexo = @caminho,
                    atualizado_em = datetime('now')
                where id = @id
                """, new { dados.Titulo, dados.Descricao, dados.Situacao, dados.Responsavel, dados.Prazo, nomeOriginal, caminho, id });
        }
        catch
        {
            ApagarArquivo(sessoes.UploadsPath, novoSalvo);
            throw;
        }

        ApagarArquivo(sessoes.UploadsPath, antigoParaApagar);
        return Results.Ok(conn.QuerySingle<Acao>($"select {Colunas} from acao where id = @id", new { id }));
    }

    static IResult Excluir(long id, Db db, Sessoes sessoes)
    {
        using var conn = db.Abrir();
        var atual = conn.QuerySingleOrDefault<Acao>($"select {Colunas} from acao where id = @id", new { id });
        if (atual is null) return Results.NotFound(new { erro = "Ação não encontrada." });

        conn.Execute("delete from acao where id = @id", new { id });
        ApagarArquivo(sessoes.UploadsPath, atual.CaminhoAnexo);
        return Results.NoContent();
    }

    static async Task<IFormCollection?> LerForm(HttpRequest req)
    {
        try { return await req.ReadFormAsync(); }
        catch (Exception e) when (e is BadHttpRequestException or InvalidDataException or IOException)
        { return null; }
    }

    static readonly IResult ErroCorpoGrande = Results.Json(
        new { erro = "Arquivo maior que 2 MB. Envie um arquivo menor." }, statusCode: StatusCodes.Status413PayloadTooLarge);

    record Dados(long OfertaId, string Titulo, string Descricao, string Situacao, string Responsavel, string Prazo);

    static (Dados dados, string? erro) Validar(IFormCollection f, bool exigirOferta)
    {
        string V(string k) => f[k].ToString().Trim();
        long ofertaId = 0;
        if (exigirOferta && !long.TryParse(V("oferta_id"), out ofertaId))
            return (default!, "Informe a oferta (oferta_id).");
        if (V("titulo").Length == 0) return (default!, "O título é obrigatório.");
        if (V("titulo").Length > 150) return (default!, "O título deve ter no máximo 150 caracteres.");
        if (V("descricao").Length == 0) return (default!, "A descrição é obrigatória.");
        if (!Situacoes.Contains(V("situacao")))
            return (default!, "Situação inválida. Use: Em planejamento, Em andamento ou Concluída.");
        if (V("responsavel").Length == 0) return (default!, "O responsável é obrigatório.");
        if (!DateTime.TryParseExact(V("prazo"), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _))
            return (default!, "Informe um prazo válido (AAAA-MM-DD).");

        return (new Dados(ofertaId, V("titulo"), V("descricao"), V("situacao"), V("responsavel"), V("prazo")), null);
    }

    static string? ValidarArquivo(IFormFile arquivo)
    {
        var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
        if (!ExtensoesPermitidas.Contains(ext))
            return "Formato não permitido. Envie um arquivo .pdf, .png, .jpg ou .jpeg.";
        if (arquivo.Length > TamanhoMaximo)
            return "Arquivo maior que 2 MB. Envie um arquivo menor.";
        return null;
    }

    static async Task<string> SalvarArquivo(IFormFile arquivo, string pasta)
    {
        var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
        var nome = $"{DateTime.UtcNow.Ticks}_{Guid.NewGuid():N}{ext}";
        await using var fs = File.Create(Path.Combine(pasta, nome));
        await arquivo.CopyToAsync(fs);
        return nome;
    }

    static void ApagarArquivo(string pasta, string? nome)
    {
        if (string.IsNullOrEmpty(nome)) return;
        var caminho = Path.Combine(pasta, Path.GetFileName(nome));
        try { if (File.Exists(caminho)) File.Delete(caminho); } catch (IOException) {}
    }
}
