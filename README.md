# TicTacToe en tiempo real

Juego de tres en raya para dos jugadores conectados desde computadoras diferentes.

## Tecnologias
- .NET 10 y ASP.NET Core
- SignalR para actualizar el tablero en tiempo real
- API REST para consultar partidas y registrar movimientos
- HTML, CSS y JavaScript para la interfaz

## Funcionalidades
- Crear o entrar a una partida con su identificador.
- Registrar movimientos con `POST /api/Movimientos`.
- Consultar movimientos con `GET /api/Movimientos/{partidaId}`.
- Recibir movimientos y cambios de estado mediante SignalR.
- Validar turnos, coordenadas, casillas ocupadas y partidas terminadas en el servidor.
- Intentar reconectar automaticamente y volver a unirse a la partida.

## Ejecucion
Abre la solucion en Visual Studio con .NET 10, restaura los paquetes y ejecuta el proyecto web. Consulta los puertos configurados en `Properties/launchSettings.json`; la URL del Hub y la URL usada por el cliente deben coincidir con la configuracion local.

## Nota
La partida se mantiene en memoria durante la ejecucion del servidor. Reiniciar la aplicacion borra las partidas activas.
