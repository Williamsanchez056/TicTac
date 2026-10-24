using Microsoft.AspNetCore.SignalR;

namespace TicTac.Hubs;

public sealed class PartidaHub : Hub
{
    public async Task UnirsePartida(string partidaId, string jugador)
    {
        if (string.IsNullOrWhiteSpace(partidaId) || jugador is not ("X" or "O"))
            throw new HubException("El codigo de partida y el jugador son obligatorios.");

        await Groups.AddToGroupAsync(Context.ConnectionId, partidaId.Trim());
        await Clients.Caller.SendAsync("ConectadoPartida", new
        {
            partidaId = partidaId.Trim(),
            jugador,
            conectado = true
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
