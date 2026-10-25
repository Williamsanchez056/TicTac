using TicTac.Shared.Contracts;

namespace TicTac.HubServer.Services;

public sealed class PedidoService
{
    private static readonly string[] Estados =
    [
        "Pendiente",
        "En preparación",
        "Enviado",
        "Entregado"
    ];

    private readonly Dictionary<string, string> _estados =
        new(StringComparer.OrdinalIgnoreCase);

    private readonly object _candado = new();

    public (bool Exito, string Mensaje, OrderNotification? Notificacion) ActualizarEstado(
        string pedidoId,
        string estado)
    {
        if (string.IsNullOrWhiteSpace(pedidoId))
            return (false, "El codigo del pedido es obligatorio.", null);

        pedidoId = pedidoId.Trim();
        if (pedidoId.Length > 40)
            return (false, "El codigo del pedido no puede superar 40 caracteres.", null);

        if (string.IsNullOrWhiteSpace(estado))
            return (false, "Selecciona el nuevo estado del pedido.", null);

        var estadoValido = Estados.FirstOrDefault(opcion =>
            string.Equals(opcion, estado.Trim(), StringComparison.OrdinalIgnoreCase));

        if (estadoValido is null)
            return (false, "El estado debe ser Pendiente, En preparación, Enviado o Entregado.", null);

        lock (_candado)
        {
            var estadoActual = _estados.TryGetValue(pedidoId, out var guardado)
                ? guardado
                : Estados[0];

            var indiceActual = Array.IndexOf(Estados, estadoActual);
            var indiceNuevo = Array.IndexOf(Estados, estadoValido);

            if (indiceNuevo != indiceActual + 1)
                return (false,
                    $"El pedido debe avanzar un estado a la vez. Estado actual: {estadoActual}.",
                    null);

            _estados[pedidoId] = estadoValido;

            var notificacion = new OrderNotification(
                pedidoId,
                estadoValido,
                DateTime.UtcNow);

            return (true, "Estado actualizado.", notificacion);
        }
    }
}
