using System.Security.Cryptography;
using System.Text.Json;
using Dapper;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.FileProviders;
using PainelEnade.Api;
using PainelEnade.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

DefaultTypeMap.MatchNamesWithUnderscores = true;

builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var cs = builder.Configuration.GetConnectionString("Banco")
    ?? throw new InvalidOperationException("Defina ConnectionStrings:Banco em appsettings.json");
builder.Services.AddSingleton(new Db(cs));
builder.Services.AddSingleton<Sessoes>();

builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 5 * 1024 * 1024);

var app = builder.Build();

InicializarBanco(app.Services.GetRequiredService<Db>(), app.Environment.ContentRootPath, cs);

app.UseCors();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

var uploadsPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "uploads"));
Directory.CreateDirectory(uploadsPath);
app.Services.GetRequiredService<Sessoes>().UploadsPath = uploadsPath;

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.Use(async (ctx, next) =>
{
    var p = ctx.Request.Path;
    if (p.StartsWithSegments("/api")
        && !p.StartsWithSegments("/api/auth/login")
        && !HttpMethods.IsOptions(ctx.Request.Method))
    {
        var auth = ctx.Request.Headers.Authorization.ToString();
        var token = auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? auth[7..].Trim() : "";
        var login = app.Services.GetRequiredService<Sessoes>().Validar(token);
        if (login is null)
        {
            ctx.Response.StatusCode = 401;
            await ctx.Response.WriteAsJsonAsync(new { erro = "Não autenticado." });
            return;
        }
        ctx.Items["login"] = login;
    }
    await next();
});

var api = app.MapGroup("/api");
api.MapAuth();
api.MapPainel();
api.MapAcoes();

app.Run();

static void InicializarBanco(Db db, string contentRoot, string cs)
{
    var arquivo = new SqliteConnectionStringBuilder(cs).DataSource;
    var caminho = Path.IsPathRooted(arquivo) ? arquivo : Path.Combine(contentRoot, arquivo);
    if (File.Exists(caminho) && new FileInfo(caminho).Length > 0) return;

    var banco = Path.GetFullPath(Path.Combine(contentRoot, "..", "..", "banco"));
    using var conn = db.Abrir();
    foreach (var sql in new[] { "estrutura.sql", "dados_iniciais.sql" })
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = File.ReadAllText(Path.Combine(banco, sql));
        cmd.ExecuteNonQuery();
    }
    Console.WriteLine($"Banco criado em {caminho}");
}

public class Db(string cs)
{
    public SqliteConnection Abrir()
    {
        var c = new SqliteConnection(cs);
        c.Open();
        return c;
    }
}

public class Sessoes(Db db)
{
    static readonly TimeSpan Validade = TimeSpan.FromHours(8);
    public string UploadsPath { get; set; } = "";

    public string Criar(long usuarioId)
    {
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(24));
        using var conn = db.Abrir();
        conn.Execute("delete from sessao where expira_em <= datetime('now')");
        conn.Execute("insert into sessao (token, usuario_id, expira_em) values (@token, @usuarioId, @exp)",
            new { token, usuarioId, exp = DateTime.UtcNow.Add(Validade).ToString("yyyy-MM-dd HH:mm:ss") });
        return token;
    }

    public string? Validar(string token)
    {
        if (string.IsNullOrEmpty(token)) return null;
        using var conn = db.Abrir();
        return conn.QuerySingleOrDefault<string>(
            "select u.login from sessao s join usuario u on u.id = s.usuario_id where s.token = @token and s.expira_em > datetime('now')",
            new { token });
    }

    public void Revogar(string token)
    {
        using var conn = db.Abrir();
        conn.Execute("delete from sessao where token = @token", new { token });
    }
}
