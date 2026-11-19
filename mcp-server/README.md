# Calendario MCP Server (Producción)

Servidor MCP oficial para conectar Antigravity con la API de producción de **Calendario / Tareas**.

## Características
- **Auto-login**: Se autentica automáticamente con JWT (`POST /api/auth/login`) y renueva el token ante expiración (401).
- **Tablones**: Crear, listar, actualizar y eliminar tablones de tareas (`Todos`).
- **Tareas**: Crear tareas en tablones, cambiar estados (`PENDING`, `IN_PROGRESS`, `COMPLETED`, etc.), listar y eliminar.
- **Calendario**: Crear y listar calendarios temáticos.
- **Eventos (Schedule)**: Crear citas/eventos con hora de inicio, fin, fecha y color, listar por rango de fechas y eliminar.

## Configuración en Antigravity (`~/.gemini/config/mcp_config.json`)

```json
{
  "mcpServers": {
    "calendario": {
      "command": "node",
      "args": ["D:\\eq\\calendario-back\\mcp-server\\index.mjs"],
      "env": {
        "CALENDARIO_API_URL": "https://calendario-back.vercel.app",
        "CALENDARIO_EMAIL": "laszlocaballero@gmail.com",
        "CALENDARIO_PASSWORD": "jade2314"
      }
    }
  }
}
```
