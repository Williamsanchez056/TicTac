using System.Collections.Concurrent;
using TicTac.Models;

namespace TicTac.Services;

public sealed class PartidaService
{
    private readonly ConcurrentDictionary<string, Partida> _partidas = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _candado = new();

    public Partida? Obtener(string partidaId) =>
        _partidas.TryGetValue(partidaId, out var partida) ? Copiar(partida) : null;

    public (bool Exito, string Mensaje, Partida? Partida) Entrar(string partidaId, string jugador)
    {
        if (string.IsNullOrWhiteSpace(partidaId))
            return (false, "Escribe el codigo de la partida.", null);

        if (jugador is not ("X" or "O"))
            return (false, "El jugador debe ser X u O.", null);

        var partida = _partidas.GetOrAdd(partidaId.Trim(), id => new Partida { Id = id });
        lock (_candado)
        {
            if (partida.Estado == "Finalizada" || partida.Estado == "Empate")
                return (false, "La partida ya termino. Usa otro codigo para jugar de nuevo.", Copiar(partida));

            if (!partida.Jugadores.Contains(jugador))
            {
                if (partida.Jugadores.Count >= 2)
                    return (false, "La partida ya tiene dos jugadores.", Copiar(partida));

                partida.Jugadores.Add(jugador);
            }

            partida.JugadoresConectados = partida.Jugadores.Count;
            partida.Estado = partida.Jugadores.Count == 2 ? "En curso" : "Esperando jugadores";
            return (true, "Te uniste a la partida.", Copiar(partida));
        }
    }

    public (bool Exito, string Mensaje, Partida? Partida) Jugar(string partidaId, string jugador, int fila, int columna)
    {
        if (string.IsNullOrWhiteSpace(partidaId))
            return (false, "El codigo de partida es obligatorio.", null);

        if (jugador is not ("X" or "O"))
            return (false, "El jugador debe ser X u O.", null);

        if (fila is < 0 or > 2 || columna is < 0 or > 2)
            return (false, "La fila y la columna deben estar entre 0 y 2.", null);

        if (!_partidas.TryGetValue(partidaId.Trim(), out var partida))
            return (false, "La partida no existe. Entra primero a la partida.", null);

        lock (_candado)
        {
            if (partida.Estado != "En curso")
                return (false, "La partida no esta lista para jugar.", Copiar(partida));

            if (partida.JugadorActual != jugador)
                return (false, "No es tu turno.", Copiar(partida));

            var indice = fila * 3 + columna;
            if (!string.IsNullOrEmpty(partida.Tablero[indice]))
                return (false, "Esa casilla ya esta ocupada.", Copiar(partida));

            partida.Tablero[indice] = jugador;
            partida.Movimientos.Add(new Movimiento(partida.Movimientos.Count + 1, jugador, fila, columna, DateTime.UtcNow));

            if (HayGanador(partida.Tablero, jugador))
            {
                partida.Estado = "Finalizada";
                partida.Ganador = jugador;
            }
            else if (partida.Tablero.All(casilla => !string.IsNullOrEmpty(casilla)))
            {
                partida.Estado = "Empate";
            }
            else
            {
                partida.JugadorActual = jugador == "X" ? "O" : "X";
            }

            return (true, "Movimiento registrado.", Copiar(partida));
        }
    }

    private static bool HayGanador(string[] tablero, string jugador)
    {
        int[][] lineas =
        [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return lineas.Any(linea => linea.All(indice => tablero[indice] == jugador));
    }

    private static Partida Copiar(Partida partida) => new()
    {
        Id = partida.Id,
        Tablero = [.. partida.Tablero],
        Movimientos = [.. partida.Movimientos],
        JugadorActual = partida.JugadorActual,
        Estado = partida.Estado,
        Ganador = partida.Ganador,
        Jugadores = [.. partida.Jugadores],
        JugadoresConectados = partida.JugadoresConectados
    };
}
