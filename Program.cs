using Microsoft.AspNetCore.SignalR;
using TicTac.Hubs;
using TicTac.Models;
using TicTac.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddSingleton<PartidaService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/Movimientos/{partidaId}", (string partidaId, PartidaService partidas) =>
{
    var partida = partidas.Obtener(partidaId);
    if (partida is null)
        return (IResult)Results.NotFound(new { mensaje = "No existe esa partida." });

    return Results.Ok(partida.Movimientos);
});

app.MapPost("/api/Movimientos", async (MovimientoRequest request, PartidaService partidas, IHubContext<PartidaHub> hub) =>
{
    var resultado = partidas.Jugar(request.PartidaId, request.Jugador, request.Fila, request.Columna);

    if (!resultado.Exito)
    {
        return (IResult)Results.BadRequest(new { mensaje = resultado.Mensaje });
    }

    await hub.Clients.Group(request.PartidaId).SendAsync("MovimientoActualizado", resultado.Partida);
    return Results.Ok(resultado.Partida);
});

app.MapPost("/api/Partidas/{partidaId}/entrar", async (string partidaId, JugadorRequest request, PartidaService partidas, IHubContext<PartidaHub> hub) =>
{
    var resultado = partidas.Entrar(partidaId, request.Jugador);
    if (!resultado.Exito)
    {
        return (IResult)Results.BadRequest(new { mensaje = resultado.Mensaje });
    }

    await hub.Clients.Group(partidaId).SendAsync("EstadoPartida", resultado.Partida);
    return Results.Ok(resultado.Partida);
});

app.MapHub<PartidaHub>("/partidaHub");

app.Run();
