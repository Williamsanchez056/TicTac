"use strict";

const servidorBase = `${window.location.protocol}//${window.location.hostname}:7001`;
const formulario = document.querySelector("#pedidoForm");
const pedidoInput = document.querySelector("#pedidoId");
const estadoInput = document.querySelector("#estadoPedido");
const botonActualizar = document.querySelector("#actualizarPedido");
const conexionTexto = document.querySelector("#conexionPedidos");
const mensajeTexto = document.querySelector("#mensajePedido");
const listaNotificaciones = document.querySelector("#notificacionesPedidos");

const conexion = new signalR.HubConnectionBuilder()
  .withUrl(`${servidorBase}/partidaHub`)
  .withAutomaticReconnect()
  .build();

function mostrarMensaje(texto) {
  mensajeTexto.textContent = texto;
}

function agregarNotificacion(notificacion) {
  if (!notificacion) return;

  const primera = listaNotificaciones.querySelector("li");
  if (primera && primera.textContent === "Esperando cambios de estado...") {
    listaNotificaciones.replaceChildren();
  }

  const item = document.createElement("li");
  const hora = new Date(notificacion.sentAt).toLocaleTimeString();
  item.textContent = `Pedido ${notificacion.pedidoId}: ${notificacion.estado} (${hora})`;
  listaNotificaciones.prepend(item);
}

conexion.on("PedidoActualizado", agregarNotificacion);

conexion.onreconnecting(() => {
  conexionTexto.textContent = "Conexion perdida. Reconectando...";
  botonActualizar.disabled = true;
});

conexion.onreconnected(() => {
  conexionTexto.textContent = "Conectado a SignalR";
  botonActualizar.disabled = false;
});

conexion.onclose(() => {
  conexionTexto.textContent = "Desconectado. Recarga la pagina para volver a conectar.";
  botonActualizar.disabled = true;
});

async function conectar() {
  try {
    await conexion.start();
    conexionTexto.textContent = "Conectado a SignalR";
    botonActualizar.disabled = false;
  } catch {
    conexionTexto.textContent = "No se pudo conectar. Recarga la pagina para reintentar.";
    botonActualizar.disabled = true;
  }
}

formulario.addEventListener("submit", async evento => {
  evento.preventDefault();

  const pedidoId = pedidoInput.value.trim();
  if (!pedidoId) {
    mostrarMensaje("Escribe el codigo del pedido.");
    return;
  }

  botonActualizar.disabled = true;
  mostrarMensaje("Actualizando estado...");

  try {
    if (conexion.state !== signalR.HubConnectionState.Connected) {
      await conexion.start();
    }

    const respuesta = await fetch(
      `${servidorBase}/api/Pedidos/${encodeURIComponent(pedidoId)}/estado`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estadoInput.value })
      }
    );

    const texto = await respuesta.text();
    let datos = {};
    try {
      datos = texto ? JSON.parse(texto) : {};
    } catch {
      throw new Error(`El servidor respondio con HTTP ${respuesta.status}.`);
    }

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || "No se pudo actualizar el pedido.");
    }

    mostrarMensaje(`Pedido ${datos.pedidoId} actualizado a: ${datos.estado}.`);
  } catch (error) {
    mostrarMensaje(error.message || "No se pudo actualizar el pedido.");
  } finally {
    botonActualizar.disabled = conexion.state !== signalR.HubConnectionState.Connected;
  }
});

conectar();
