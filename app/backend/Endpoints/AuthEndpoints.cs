using Dapper;

namespace PainelEnade.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuth(this RouteGroupBuilder api)
    {
        api.MapPost("/auth/login", Login);
        api.MapPost("/auth/logout", Logout);
        api.MapGet("/auth/me", Me);
    }

    static IResult Logout(HttpRequest req, Sessoes sessoes)
    {
        var auth = req.Headers.Authorization.ToString();
        if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            sessoes.Revogar(auth[7..].Trim());
        return Results.NoContent();
    }

    static IResult Me(HttpContext ctx, Db db)
    {
        using var conn = db.Abrir();
        var u = conn.QuerySingleOrDefault<Usuario>("select id, nome, login from usuario where login = @login",
            new { login = ctx.Items["login"] as string });
        return u is null ? Results.Json(new { erro = "Não autenticado." }, statusCode: 401)
                         : Results.Ok(new { nome = u.Nome, login = u.Login });
    }

    static IResult Login(LoginRequest req, Db db, Sessoes sessoes)
    {
        if (string.IsNullOrWhiteSpace(req.Login) || string.IsNullOrWhiteSpace(req.Senha))
            return Results.BadRequest(new { erro = "Informe login e senha." });

        using var conn = db.Abrir();
        var u = conn.QuerySingleOrDefault<Usuario>(
            "select id, nome, login, senha_hash from usuario where login = @Login",
            new { req.Login });

        if (u is null || !BCrypt.Net.BCrypt.Verify(req.Senha, u.SenhaHash))
            return Results.Json(new { erro = "Login ou senha inválidos." }, statusCode: 401);

        var token = sessoes.Criar(u.Id);
        return Results.Ok(new { token, usuario = new { nome = u.Nome, login = u.Login } });
    }
}
