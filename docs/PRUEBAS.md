# Pruebas manuales de TicTacToe y SignalR

Ejecuta las pruebas despues de restaurar LibMan, compilar y arrancar el servidor y el cliente. Registra el resultado real; no marques una prueba como aprobada sin haberla realizado.

| Prueba | Pasos | Resultado esperado | Resultado real |
|---|---|---|---|
| Dos clientes | Abre el cliente en dos dispositivos y entra con el mismo codigo, uno como X y otro como O. | Ambos quedan en la misma partida. | Pendiente de ejecutar |
| Actualizacion en tiempo real | Haz un movimiento desde un dispositivo. | El tablero del otro cliente se actualiza sin recargar la pagina. | Pendiente de ejecutar |
| Turno incorrecto | Intenta registrar un movimiento fuera del turno correspondiente. | El servidor rechaza el movimiento. | Pendiente de ejecutar |
| Casilla ocupada | Intenta jugar en una casilla que ya tiene una marca. | El servidor rechaza el movimiento. | Pendiente de ejecutar |
| Coordenadas invalidas | Envia una fila o columna fuera del rango 0 a 2 a la API. | El servidor rechaza el movimiento. | Pendiente de ejecutar |
| Codigo inexistente | Consulta los movimientos de un codigo que no existe. | La API devuelve 404. | Pendiente de ejecutar |
| Ganador | Completa tres marcas en linea. | La partida finaliza y se muestra el ganador. | Pendiente de ejecutar |
| Empate | Completa el tablero sin formar una linea ganadora. | La partida finaliza en empate. | Pendiente de ejecutar |
| Aislamiento de partidas | Abre dos codigos de partida distintos y realiza un movimiento en uno. | La otra partida no recibe ese cambio. | Pendiente de ejecutar |
| Reconexion | Desconecta temporalmente la conexion y vuelve a habilitarla. | El cliente intenta reconectar y volver a unirse al grupo. | Pendiente de ejecutar |
| Notificacion de pedido | Abre `/Pedidos` en dos pestañas, usa el pedido `pedido-001` y cambia de Pendiente a En preparación. | Las dos pestañas muestran la notificacion sin recargar. | Pendiente de ejecutar |
| Orden de estados | Para el mismo pedido, intenta pasar directamente a Entregado antes de Enviado. | La API rechaza el salto y explica el estado actual. | Pendiente de ejecutar |
| Estados validos | Para el mismo pedido, cambia en orden a En preparación, Enviado y Entregado. | Cada estado nuevo se muestra en las dos pestañas. | Pendiente de ejecutar |
| Codigo invalido | Envia un codigo de pedido vacio o de mas de 40 caracteres. | La API rechaza la solicitud. | Pendiente de ejecutar |
| Estado invalido | Envia un estado que no este en la lista permitida. | La API rechaza la solicitud. | Pendiente de ejecutar |

## Evidencias

Guarda capturas reales que muestren:

1. Los dos clientes conectados a la misma partida.
2. Un movimiento reflejado en ambos tableros.
3. El resultado de una partida terminada.
4. La pagina `/Pedidos` abierta en dos pestañas y una notificacion reflejada en ambas.
5. Una solicitud invalida rechazada por la API.

Añade las capturas al repositorio despues de ejecutar las pruebas. No incluyas datos privados en las imagenes.
