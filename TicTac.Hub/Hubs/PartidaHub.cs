using Microsoft.AspNetCore.SignalR;
using TicTac.HubServer.Services;

namespace TicTac.HubServer.Hubs;

public sealed class PartidaHub(PartidaService partidas) : Hub
{
    public async Task UnirsePartida(string partidaId, string jugador)
    {
        if (string.IsNullOrWhiteSpace(partidaId) || jugador is not ("X" or "O"))
            throw new HubException("El codigo de partida y el jugador son obligatorios.");

        var partida = partidas.Obtener(partidaId.Trim());
        if (partida is null || !partida.Jugadores.Contains(jugador))
            throw new HubException("Primero debes entrar a la partida con ese jugador.");

        await Groups.AddToGroupAsync(Context.ConnectionId, partida.Id);
        await Clients.Caller.SendAsync("EstadoPartida", partida);
    }
}
