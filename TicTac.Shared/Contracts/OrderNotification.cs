namespace TicTac.Shared.Contracts;

public sealed record OrderNotification(
    string PedidoId,
    string Estado,
    DateTime SentAt);

public sealed record PedidoEstadoRequest(string Estado);
