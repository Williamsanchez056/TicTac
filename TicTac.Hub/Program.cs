using Microsoft.AspNetCore.SignalR;
using TicTac.HubServer.Hubs;
using TicTac.HubServer.Services;
using TicTac.Shared.Contracts;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientPolicy", policy =>
    {
        policy
            .SetIsOriginAllowed(origen =>
                Uri.TryCreate(origen, UriKind.Absolute, out var uri) &&
                uri.Port == 7002)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSignalR();
builder.Services.AddSingleton<PartidaService>();

var app = builder.Build();

app.UseRouting();
app.UseCors("ClientPolicy");

app.MapGet("/api/Movimientos/{partidaId}", (string partidaId, PartidaService partidas) =>
{
    var partida = partidas.Obtener(partidaId);
    if (partida is null)
        return (IResult)Results.NotFound(new { mensaje = "No existe esa partida." });

    return (IResult)Results.Ok(partida.Movimientos);
});

app.MapPost("/api/Movimientos", async (
    MovimientoRequest request,
    PartidaService partidas,
    IHubContext<PartidaHub> hub) =>
{
    var resultado = partidas.Jugar(
        request.PartidaId,
        request.Jugador,
        request.Fila,
        request.Columna);

    if (!resultado.Exito)
        return (IResult)Results.BadRequest(new { mensaje = resultado.Mensaje });

    await hub.Clients
        .Group(resultado.Partida!.Id)
        .SendAsync("MovimientoActualizado", resultado.Partida);

    return (IResult)Results.Ok(resultado.Partida);
});

app.MapPost("/api/Partidas/{partidaId}/entrar", async (
    string partidaId,
    JugadorRequest request,
    PartidaService partidas,
    IHubContext<PartidaHub> hub) =>
{
    var resultado = partidas.Entrar(partidaId, request.Jugador);

    if (!resultado.Exito)
        return (IResult)Results.BadRequest(new { mensaje = resultado.Mensaje });

    await hub.Clients
        .Group(resultado.Partida!.Id)
        .SendAsync("EstadoPartida", resultado.Partida);

    return (IResult)Results.Ok(resultado.Partida);
});

app.MapHub<PartidaHub>("/partidaHub");

app.Run();
