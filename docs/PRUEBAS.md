# Pruebas manuales de TicTacToe

Ejecuta las pruebas después de restaurar LibMan, compilar y arrancar el servidor y el cliente. Registra el resultado real; no marques una prueba como aprobada sin haberla realizado.

| Prueba | Pasos | Resultado esperado | Resultado real |
|---|---|---|---|
| Dos clientes | Abre el cliente en dos dispositivos y entra con el mismo código, uno como X y otro como O. | Ambos quedan en la misma partida. | Pendiente de ejecutar |
| Actualización en tiempo real | Haz un movimiento desde un dispositivo. | El tablero del otro cliente se actualiza sin recargar la página. | Pendiente de ejecutar |
| Turno incorrecto | Intenta registrar un movimiento fuera del turno correspondiente. | El servidor rechaza el movimiento. | Pendiente de ejecutar |
| Casilla ocupada | Intenta jugar en una casilla que ya tiene una marca. | El servidor rechaza el movimiento. | Pendiente de ejecutar |
| Coordenadas inválidas | Envía una fila o columna fuera del rango 0 a 2 a la API. | El servidor rechaza el movimiento. | Pendiente de ejecutar |
| Código inexistente | Consulta los movimientos de un código que no existe. | La API devuelve 404. | Pendiente de ejecutar |
| Ganador | Completa tres marcas en línea. | La partida finaliza y se muestra el ganador. | Pendiente de ejecutar |
| Empate | Completa el tablero sin formar una línea ganadora. | La partida finaliza en empate. | Pendiente de ejecutar |
| Aislamiento de partidas | Abre dos códigos de partida distintos y realiza un movimiento en uno. | La otra partida no recibe ese cambio. | Pendiente de ejecutar |
| Reconexión | Desconecta temporalmente la conexión y vuelve a habilitarla. | El cliente intenta reconectar y volver a unirse al grupo. | Pendiente de ejecutar |

## Evidencias

Guarda capturas reales que muestren:

1. Los dos clientes conectados a la misma partida.
2. Un movimiento reflejado en ambos tableros.
3. El resultado de una partida terminada.

Añade las capturas al repositorio después de ejecutar las pruebas. No incluyas datos privados en las imágenes.
