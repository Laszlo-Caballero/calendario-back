import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE_URL = (process.env.CALENDARIO_API_URL || "https://calendario-back.vercel.app").replace(/\/$/, "");
const API_EMAIL = process.env.CALENDARIO_EMAIL || "laszlocaballero@gmail.com";
const API_PASSWORD = process.env.CALENDARIO_PASSWORD || "jade2314";

let cachedToken = null;

async function getAuthToken(forceRefresh = false) {
  if (cachedToken && !forceRefresh) {
    return cachedToken;
  }

  const loginUrl = `${API_BASE_URL}/api/auth/login`;
  try {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: API_EMAIL,
        password: API_PASSWORD,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`Error de autenticación (${res.status}): ${errData.message || res.statusText}`);
    }

    const data = await res.json();
    cachedToken = data.token;
    return cachedToken;
  } catch (error) {
    throw new Error(`Fallo al autenticar en la API (${loginUrl}): ${error.message}`);
  }
}

async function apiRequest(endpoint, options = {}) {
  let token = await getAuthToken();
  const url = `${API_BASE_URL}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  let res = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token expiró (401), renovar y reintentar una vez
  if (res.status === 401) {
    token = await getAuthToken(true);
    headers.Authorization = `Bearer ${token}`;
    res = await fetch(url, {
      ...options,
      headers,
    });
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const errMsg = json?.message || (Array.isArray(json?.errors) ? json.errors.join(", ") : json?.errors) || res.statusText;
    throw new Error(`Error en API [${options.method || "GET"} ${endpoint}] (${res.status}): ${errMsg}`);
  }

  return json?.body !== undefined ? json.body : json;
}

const server = new McpServer({
  name: "calendario-prod",
  version: "1.0.0",
});

// ==================== TABLONES (TODOS) ====================

server.tool(
  "listar_tablones",
  "Lista todos los tablones (tableros de proyectos o listas de tareas) de producción.",
  {},
  async () => {
    try {
      const tablones = await apiRequest("/todos");
      const resumen = Array.isArray(tablones)
        ? tablones.map((t) => ({
            id: t.todosId,
            titulo: t.title,
            esPublico: t.isPublic,
            activo: t.status,
            creador: t.user ? `${t.user.name} (${t.user.email})` : "Desconocido",
            tareasPendientes: t._count?.todos ?? 0,
          }))
        : tablones;

      return {
        content: [
          {
            type: "text",
            text: `Se encontraron ${resumen.length} tablones en producción:\n\n` + JSON.stringify(resumen, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al listar tablones: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "crear_tablon",
  "Crea un nuevo tablón (tablero de tareas/proyecto) en producción.",
  {
    nombre: z.string().describe("Nombre o título del tablón"),
    esPublico: z.boolean().optional().default(false).describe("Si el tablón es público para todos los usuarios o privado"),
  },
  async ({ nombre, esPublico }) => {
    try {
      const resultado = await apiRequest("/todos", {
        method: "POST",
        body: JSON.stringify({
          name: nombre,
          isPublic: esPublico,
        }),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Tablón creado con éxito:\n- ID: ${resultado.todosId}\n- Título: ${resultado.title}\n- Público: ${resultado.isPublic}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al crear tablón: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "actualizar_tablon",
  "Actualiza el nombre o visibilidad de un tablón existente.",
  {
    tablonId: z.number().describe("ID del tablón a modificar"),
    nombre: z.string().optional().describe("Nuevo nombre del tablón"),
    esPublico: z.boolean().optional().describe("Nuevo estado de visibilidad pública"),
  },
  async ({ tablonId, nombre, esPublico }) => {
    try {
      const body = {};
      if (nombre !== undefined) body.name = nombre;
      if (esPublico !== undefined) body.isPublic = esPublico;

      const resultado = await apiRequest(`/todos/${tablonId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Tablón ${tablonId} actualizado con éxito:\n` + JSON.stringify(resultado, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al actualizar tablón: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "eliminar_tablon",
  "Elimina un tablón de producción por su ID.",
  {
    tablonId: z.number().describe("ID del tablón a eliminar"),
  },
  async ({ tablonId }) => {
    try {
      await apiRequest(`/todos/${tablonId}`, {
        method: "DELETE",
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Tablón con ID ${tablonId} eliminado exitosamente.`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al eliminar tablón: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ==================== TAREAS (TODO) ====================

server.tool(
  "listar_tareas",
  "Lista todas las tareas de un tablón específico en producción.",
  {
    tablonId: z.number().describe("ID del tablón del que se quieren ver las tareas"),
  },
  async ({ tablonId }) => {
    try {
      const tareas = await apiRequest(`/todo?todosId=${tablonId}`);
      const resumen = Array.isArray(tareas)
        ? tareas.map((t) => ({
            id: t.todoId,
            titulo: t.title,
            descripcion: t.description,
            estado: t.status,
            fase: t.phase || "Sin fase",
            orden: t.order ?? 0,
            importancia: t.importance,
            archivado: t.isArchived,
            fijado: t.pinned,
            fechaCompletado: t.completedAt,
          }))
        : tareas;

      return {
        content: [
          {
            type: "text",
            text: `Se encontraron ${resumen.length} tareas en el tablón ${tablonId}:\n\n` + JSON.stringify(resumen, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al listar tareas: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "crear_tarea",
  "Crea una nueva tarea dentro de un tablón en producción.",
  {
    tablonId: z.number().describe("ID del tablón al que pertenece la tarea"),
    titulo: z.string().describe("Título o nombre breve de la tarea"),
    descripcion: z.string().describe("Descripción detallada o notas de la tarea"),
    grupo: z.string().optional().describe("Grupo, sección o agrupación de la tarea (ej. 'Configuración inicial', 'Seguridad de red', 'Sprint 1')"),
    fase: z.string().optional().describe("Alias alternativo para grupo"),
    orden: z.number().optional().default(0).describe("Orden dentro del grupo"),
    estado: z
      .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED", "DRAFT", "ARCHIVED"])
      .optional()
      .default("PENDING")
      .describe("Estado de la tarea"),
    importancia: z.number().optional().default(1).describe("Nivel de importancia o prioridad (ej. 1 normal, 2 alta, 3 urgente)"),
    fechaHoraNotificacion: z.string().optional().describe("Fecha y hora ISO para notificación/recordatorio (opcional)"),
  },
  async ({ tablonId, titulo, descripcion, grupo, fase, orden, estado, importancia, fechaHoraNotificacion }) => {
    try {
      const groupValue = grupo || fase;
      const body = {
        todosId: tablonId,
        title: titulo,
        description: descripcion,
        status: estado,
        importance: importancia,
        order: orden ?? 0,
      };

      if (groupValue) {
        body.phase = groupValue;
      }

      if (fechaHoraNotificacion) {
        body.hourNotification = new Date(fechaHoraNotificacion).toISOString();
      }

      const resultado = await apiRequest("/todo", {
        method: "POST",
        body: JSON.stringify(body),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Tarea creada con éxito:\n- ID: ${resultado.todoId}\n- Título: ${resultado.title}\n- Tablón: ${resultado.todosId}\n- Fase: ${resultado.phase || "Sin fase"}\n- Estado: ${resultado.status}\n- Prioridad: ${resultado.importance}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al crear tarea: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "cambiar_estado_tarea",
  "Cambia el estado de una tarea (ej. a COMPLETED, IN_PROGRESS, PENDING, CANCELED).",
  {
    tareaId: z.number().describe("ID de la tarea"),
    estado: z
      .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED", "DRAFT", "ARCHIVED"])
      .describe("Nuevo estado de la tarea"),
  },
  async ({ tareaId, estado }) => {
    try {
      const resultado = await apiRequest(`/todo/${tareaId}`, {
        method: "PUT",
        body: JSON.stringify({ status: estado }),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Estado de tarea ${tareaId} actualizado a ${estado}.\n` + JSON.stringify(resultado, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al cambiar estado de la tarea: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "eliminar_tarea",
  "Elimina una tarea de producción por su ID.",
  {
    tareaId: z.number().describe("ID de la tarea a eliminar"),
  },
  async ({ tareaId }) => {
    try {
      await apiRequest(`/todo/${tareaId}`, {
        method: "DELETE",
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Tarea con ID ${tareaId} eliminada correctamente.`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al eliminar tarea: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ==================== CALENDARIO Y EVENTOS (SCHEDULE) ====================

server.tool(
  "listar_calendarios",
  "Lista todos los calendarios disponibles en el sistema de producción.",
  {},
  async () => {
    try {
      const calendarios = await apiRequest("/calendar");
      return {
        content: [
          {
            type: "text",
            text: `Calendarios disponibles:\n\n` + JSON.stringify(calendarios, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al listar calendarios: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "crear_calendario",
  "Crea un nuevo calendario en producción.",
  {
    nombre: z.string().describe("Nombre del nuevo calendario"),
    esPublico: z.boolean().optional().default(true).describe("Si el calendario es visible públicamente"),
  },
  async ({ nombre, esPublico }) => {
    try {
      const resultado = await apiRequest("/calendar", {
        method: "POST",
        body: JSON.stringify({
          name: nombre,
          isPublic: esPublico,
        }),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Calendario creado:\n- ID: ${resultado.calendarId}\n- Nombre: ${resultado.name}\n- Público: ${resultado.isPublic}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al crear calendario: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "listar_eventos_calendario",
  "Lista los eventos de un calendario en un rango de fechas.",
  {
    calendarioId: z.number().describe("ID del calendario a consultar"),
    fechaInicio: z.string().describe("Fecha de inicio del rango (ej. '2026-11-01' o ISO)"),
    fechaFin: z.string().describe("Fecha de fin del rango (ej. '2026-11-30' o ISO)"),
  },
  async ({ calendarioId, fechaInicio, fechaFin }) => {
    try {
      const startIso = new Date(fechaInicio).toISOString();
      const endIso = new Date(fechaFin).toISOString();

      const eventos = await apiRequest(
        `/schedule?calendarId=${calendarioId}&startDate=${encodeURIComponent(startIso)}&endDate=${encodeURIComponent(endIso)}`
      );

      return {
        content: [
          {
            type: "text",
            text: `Eventos encontrados:\n\n` + JSON.stringify(eventos, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al consultar eventos: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "crear_evento_calendario",
  "Crea un evento o cita en un calendario en producción.",
  {
    calendarioId: z.number().describe("ID del calendario donde agendar"),
    titulo: z.string().describe("Título o asunto del evento"),
    descripcion: z.string().describe("Detalles o descripción del evento"),
    fecha: z.string().describe("Fecha del evento (YYYY-MM-DD o ISO)"),
    horaInicio: z.string().describe("Fecha y hora exacta de inicio en formato ISO (ej. '2026-11-20T10:00:00.000Z')"),
    horaFin: z.string().describe("Fecha y hora exacta de fin en formato ISO (ej. '2026-11-20T11:00:00.000Z')"),
    color: z.string().optional().default("#3b82f6").describe("Color hexadecimal del evento (ej. #3b82f6 azul, #ef4444 rojo, #10b981 verde)"),
  },
  async ({ calendarioId, titulo, descripcion, fecha, horaInicio, horaFin, color }) => {
    try {
      const body = {
        calendarId: calendarioId,
        title: titulo,
        description: descripcion,
        date: new Date(fecha).toISOString(),
        startTime: new Date(horaInicio).toISOString(),
        endTime: new Date(horaFin).toISOString(),
        color: color,
      };

      const resultado = await apiRequest("/schedule", {
        method: "POST",
        body: JSON.stringify(body),
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Evento agendado con éxito:\n- ID: ${resultado.scheduleId}\n- Título: ${resultado.title}\n- Calendario: ${resultado.calendarId}\n- Fecha: ${resultado.date}\n- Inicio: ${resultado.startTime}\n- Fin: ${resultado.endTime}\n- Color: ${resultado.color}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al crear evento: ${err.message}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "eliminar_evento_calendario",
  "Elimina un evento del calendario por su ID.",
  {
    eventoId: z.number().describe("ID del evento a eliminar"),
  },
  async ({ eventoId }) => {
    try {
      await apiRequest(`/schedule/${eventoId}`, {
        method: "DELETE",
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Evento con ID ${eventoId} eliminado correctamente.`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error al eliminar evento: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// Iniciar servidor MCP
const transport = new StdioServerTransport();
await server.connect(transport);
