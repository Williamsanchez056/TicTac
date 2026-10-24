namespace TicTac.Shared.Contracts;

public sealed class Partida
{
    public string Id { get; set; } = "";
    public string[] Tablero { get; set; } = Enumerable.Repeat("", 9).ToArray();
    public List<Movimiento> Movimientos { get; set; } = [];
    public string JugadorActual { get; set; } = "X";
    public string Estado { get; set; } = "Esperando jugadores";
    public string? Ganador { get; set; }
    public List<string> Jugadores { get; set; } = [];
    public int JugadoresConectados { get; set; }
}

public sealed record Movimiento(
    int Numero,
    string Jugador,
    int Fila,
    int Columna,
    DateTime Fecha);

public sealed record MovimientoRequest(
    string PartidaId,
    string Jugador,
    int Fila,
    int Columna);

public sealed record JugadorRequest(string Jugador);
