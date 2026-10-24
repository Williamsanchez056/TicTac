const partidaInput = document.querySelector("#partidaId");
const jugadorInput = document.querySelector("#jugador");
const entrarBtn = document.querySelector("#entrar");
const conexionTexto = document.querySelector("#conexion");
const estadoTexto = document.querySelector("#estado");
const turnoTexto = document.querySelector("#turno");
const mensajeTexto = document.querySelector("#mensaje");
const movimientosLista = document.querySelector("#movimientos");
const casillas = [...document.querySelectorAll(".casilla")];

const servidorBase = `${window.location.protocol}//${window.location.hostname}:7001`;
let partidaActual = null;
let conexionLista = false;
let inicioConexion = null;

const conexion = new signalR.HubConnectionBuilder()
  .withUrl(`${servidorBase}/partidaHub`)
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

async function obtenerRespuesta(respuesta) {
  const texto = await respuesta.text();
  let datos = {};
  try {
    datos = texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error(`El servidor respondio con HTTP ${respuesta.status}. Comprueba que el Hub este ejecutandose en el puerto 7001.`);
  }

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || `Error HTTP ${respuesta.status} al comunicarse con el servidor.`);
  }
  return datos;
}

async function iniciarConexion() {
  if (conexion.state === signalR.HubConnectionState.Connected) {
    conexionLista = true;
    return;
  }

  if (inicioConexion) return inicioConexion;

  inicioConexion = (async () => {
    if (conexion.state === signalR.HubConnectionState.Disconnected) {
      await conexion.start();
    } else if (conexion.state !== signalR.HubConnectionState.Connected) {
      throw new Error("La conexion esta iniciandose. Espera unos segundos y vuelve a pulsar Entrar.");
    }

    conexionLista = true;
    conexionTexto.textContent = "Conectado al servidor";
  })();

  try {
    await inicioConexion;
  } finally {
    inicioConexion = null;
  }
}

async function unirsePartida() {
  const partidaId = partidaInput.value.trim();
  const jugador = jugadorInput.value;

  if (!partidaId) {
    mostrarMensaje("Escribe un codigo de partida.");
    return;
  }

  if (entrarBtn.disabled) return;
  entrarBtn.disabled = true;
  conexionTexto.textContent = "Conectando...";
  mostrarMensaje("Intentando entrar a la partida...");

  try {
    // Inicia SignalR una sola vez para evitar dos llamadas simultaneas a start().
    await iniciarConexion();

    const respuesta = await fetch(
      `${servidorBase}/api/Partidas/${encodeURIComponent(partidaId)}/entrar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jugador })
      }
    );
    const partida = await obtenerRespuesta(respuesta);

    await conexion.invoke("UnirsePartida", partidaId, jugador);

    const historial = await fetch(
      `${servidorBase}/api/Movimientos/${encodeURIComponent(partidaId)}`
    );
    if (historial.ok) partida.movimientos = await historial.json();

    partidaInput.dataset.partida = partidaId;
    jugadorInput.dataset.jugador = jugador;
    actualizarTablero(partida);
    conexionTexto.textContent = "Conectado";
    mostrarMensaje(partida.estado === "En curso"
      ? `Entraste como ${jugador}. La partida esta lista.`
      : `Entraste como ${jugador}. Esperando al otro jugador.`);
  } catch (error) {
    conexionLista = conexion.state === signalR.HubConnectionState.Connected;
    conexionTexto.textContent = "No se pudo conectar";
    mostrarMensaje(error.message || "No se pudo entrar. Comprueba que el Hub este ejecutandose en el puerto 7001.");
  } finally {
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
    const respuesta = await fetch(`${servidorBase}/api/Movimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(solicitud)
    });
    const partida = await obtenerRespuesta(respuesta);
    actualizarTablero(partida);

    mostrarMensaje(partida.estado === "Finalizada"
      ? `Gano el jugador ${partida.ganador}.`
      : partida.estado === "Empate"
        ? "La partida termino en empate."
        : "Movimiento registrado.");
  } catch (error) {
    mostrarMensaje(error.message || "No se pudo registrar el movimiento.");
    if (partidaActual) actualizarTablero(partidaActual);
  }
}

entrarBtn.addEventListener("click", unirsePartida);
casillas.forEach(casilla => casilla.addEventListener("click", () => jugar(casilla)));

document.querySelector("#reiniciar").addEventListener("click", () => {
  partidaInput.dataset.partida = "";
  jugadorInput.dataset.jugador = "";
  partidaActual = null;
  actualizarTablero({
    tablero: Array(9).fill(""),
    movimientos: [],
    estado: "Entra a una partida",
    jugadorActual: "",
    ganador: null
  });
  mostrarMensaje("Saliste de la partida. Para jugar de nuevo, usa otro codigo.");
});

conexion.on("MovimientoActualizado", partida => {
  if (partida && partida.id === partidaInput.dataset.partida) {
    actualizarTablero(partida);
    if (partida.estado === "Finalizada") mostrarMensaje(`Gano el jugador ${partida.ganador}.`);
    else if (partida.estado === "Empate") mostrarMensaje("La partida termino en empate.");
  }
});

conexion.on("EstadoPartida", partida => {
  if (partida && partida.id === partidaInput.dataset.partida) {
    actualizarTablero(partida);
  }
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
      const respuesta = await fetch(
        `${servidorBase}/api/Movimientos/${encodeURIComponent(partidaId)}`
      );
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

iniciarConexion().catch(error => {
  conexionLista = false;
  conexionTexto.textContent = "Sin conexion. Pulsa Entrar para reintentar.";
  mostrarMensaje(error.message || "No se pudo conectar con el Hub en el puerto 7001.");
});
