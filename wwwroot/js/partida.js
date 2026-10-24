const partidaInput = document.querySelector("#partidaId");
const jugadorInput = document.querySelector("#jugador");
const entrarBtn = document.querySelector("#entrar");
const conexionTexto = document.querySelector("#conexion");
const estadoTexto = document.querySelector("#estado");
const turnoTexto = document.querySelector("#turno");
const mensajeTexto = document.querySelector("#mensaje");
const movimientosLista = document.querySelector("#movimientos");
const casillas = [...document.querySelectorAll(".casilla")];

let partidaActual = null;
let conexionLista = false;
let uniendo = false;

const conexion = new signalR.HubConnectionBuilder()
  .withUrl("/partidaHub")
  .withAutomaticReconnect()
  .build();

function mostrarMensaje(texto) {
  mensajeTexto.textContent = texto;
}

function actualizarTablero(partida) {
  if (!partida) return;
  partidaActual = partida;
  estadoTexto.textContent = partida.estado;
  turnoTexto.textContent = partida.estado === "En curso" ? partida.jugadorActual : "—";

  casillas.forEach((casilla, indice) => {
    const marca = partida.tablero[indice] || "";
    casilla.textContent = marca;
    casilla.dataset.marca = marca;
    casilla.disabled = !conexionLista || partida.estado !== "En curso" ||
      marca !== "" || partida.jugadorActual !== jugadorInput.value;
  });

  movimientosLista.replaceChildren();
  if (!partida.movimientos || partida.movimientos.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Aun no hay movimientos.";
    movimientosLista.append(item);
  } else {
    partida.movimientos.forEach(movimiento => {
      const item = document.createElement("li");
      item.textContent = `Jugador ${movimiento.jugador}: fila ${movimiento.fila + 1}, columna ${movimiento.columna + 1}`;
      movimientosLista.append(item);
    });
  }
}

async function unirsePartida() {
  const partidaId = partidaInput.value.trim();
  const jugador = jugadorInput.value;
  if (!partidaId) {
    mostrarMensaje("Escribe un codigo de partida.");
    return;
  }

  uniendo = true;
  entrarBtn.disabled = true;
  try {
    const respuesta = await fetch(`/api/Partidas/${encodeURIComponent(partidaId)}/entrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jugador })
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "No se pudo entrar a la partida.");

    if (conexion.state !== signalR.HubConnectionState.Connected) {
      await conexion.start();
      conexionLista = true;
    }
    await conexion.invoke("UnirsePartida", partidaId, jugador);

    const historial = await fetch(`/api/Movimientos/${encodeURIComponent(partidaId)}`);
    if (historial.ok) {
      const movimientos = await historial.json();
      datos.movimientos = movimientos;
    }
    partidaInput.dataset.partida = partidaId;
    jugadorInput.dataset.jugador = jugador;
    actualizarTablero(datos);
    conexionTexto.textContent = "Conectado";
    mostrarMensaje(`Estas jugando como ${jugador}.`);
  } catch (error) {
    mostrarMensaje(error.message || "No se pudo conectar. Intenta de nuevo.");
  } finally {
    uniendo = false;
    entrarBtn.disabled = false;
  }
}

async function jugar(casilla) {
  if (!partidaActual || !conexionLista || !partidaInput.dataset.partida) {
    mostrarMensaje("Entra a una partida primero.");
    return;
  }
  if (partidaActual.jugadorActual !== jugadorInput.value) {
    mostrarMensaje("Espera tu turno.");
    return;
  }

  const indice = Number(casilla.dataset.pos);
  const solicitud = {
    partidaId: partidaInput.dataset.partida,
    jugador: jugadorInput.value,
    fila: Math.floor(indice / 3),
    columna: indice % 3
  };

  casillas.forEach(boton => boton.disabled = true);
  try {
    const respuesta = await fetch("/api/Movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solicitud)
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || "Movimiento rechazado.");
    actualizarTablero(datos);
    mostrarMensaje(datos.estado === "Finalizada"
      ? `Gano el jugador ${datos.ganador}.`
      : datos.estado === "Empate" ? "La partida termino en empate." : "Movimiento registrado.");
  } catch (error) {
    mostrarMensaje(error.message || "No se pudo registrar el movimiento.");
    if (partidaActual) actualizarTablero(partidaActual);
  }
}

entrarBtn.addEventListener("click", unirsePartida);
casillas.forEach(casilla => casilla.addEventListener("click", () => jugar(casilla)));
document.querySelector("#reiniciar").addEventListener("click", () => {
  actualizarTablero({
    id: "",
    tablero: Array(9).fill(""),
    movimientos: [],
    estado: "Entra a una partida",
    jugadorActual: "",
    ganador: null
  });
  mostrarMensaje("La pantalla se limpio. Para iniciar otra partida usa otro codigo.");
  partidaActual = null;
});

conexion.on("MovimientoActualizado", partida => {
  if (partida && partida.id === partidaInput.dataset.partida) {
    actualizarTablero(partida);
    if (partida.estado === "Finalizada") mostrarMensaje(`Gano el jugador ${partida.ganador}.`);
    else if (partida.estado === "Empate") mostrarMensaje("La partida termino en empate.");
  }
});

conexion.on("EstadoPartida", partida => {
  if (partida && partida.id === partidaInput.dataset.partida) actualizarTablero(partida);
});

conexion.onreconnecting(() => {
  conexionLista = false;
  conexionTexto.textContent = "Reconectando...";
  casillas.forEach(casilla => casilla.disabled = true);
});

conexion.onreconnected(async () => {
  conexionLista = true;
  conexionTexto.textContent = "Conectado";
  const partidaId = partidaInput.dataset.partida;
  const jugador = jugadorInput.dataset.jugador;
  if (partidaId && jugador) {
    try {
      await conexion.invoke("UnirsePartida", partidaId, jugador);
      const respuesta = await fetch(`/api/Movimientos/${encodeURIComponent(partidaId)}`);
      if (respuesta.ok && partidaActual) {
        const movimientos = await respuesta.json();
        actualizarTablero({ ...partidaActual, movimientos });
      }
    } catch {
      mostrarMensaje("Se reconecto, pero no se pudo recuperar la partida.");
    }
  }
});

conexion.onclose(() => {
  conexionLista = false;
  conexionTexto.textContent = "Desconectado";
  casillas.forEach(casilla => casilla.disabled = true);
});

conexion.start().then(() => {
  conexionLista = true;
  conexionTexto.textContent = "Conectado al servidor";
}).catch(() => {
  conexionTexto.textContent = "Sin conexion. Pulsa Entrar para reintentar.";
});
