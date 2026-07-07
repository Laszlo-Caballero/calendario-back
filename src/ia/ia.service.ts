import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class IaService {
  private cerebras: Cerebras;

  constructor() {
    this.cerebras = new Cerebras({
      apiKey: process.env.CEREBRAS_API_KEY || '',
    });
  }

  async generateResponse(messageDto: MessageDto) {
    const completion = await this.cerebras.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `Tu tarea es generar una descripcion profesional y detallada para una tarea a partir de un titulo y un contenido base.

La respuesta debe estar optimizada para renderizarse correctamente en TipTap usando HTML simple y limpio.

Reglas importantes:
- Responde SOLO con HTML valido compatible con TipTap.
- No uses markdown.
- No uses emojis.
- No uses etiquetas <html>, <body> ni <head>.
- Usa solamente etiquetas simples como:
  <p>, <ul>, <ol>, <li>, <strong>, <em>, <br>
- No incluyas codigo.
- No repitas el titulo.
- No copies literalmente el contenido recibido.
- No menciones frases como "descripcion de la tarea".
- Redacta en tono profesional, claro y preciso.
- Expande la informacion con contexto util, objetivos, detalles tecnicos y posibles consideraciones relevantes.
- Organiza el contenido en parrafos y listas cuando sea necesario para mejorar la legibilidad en TipTap.
- Mantén una estructura limpia y bien separada.
- Evita texto redundante o demasiado generico.

La salida debe ser directamente renderizable dentro de un editor TipTap.`,
        },
        {
          role: 'user',
          content: `Titulo: ${messageDto.title}\nContenido: ${messageDto.content}`,
        },
      ],
      model: 'gpt-oss-120b',
      max_completion_tokens: 1024,
      temperature: 0.2,
      top_p: 1,
      stream: false,
    });

    return (completion.choices as any)[0].message.content;
  }

  async generateSubtask(messageDto: MessageDto) {
    const completion = await this.cerebras.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `Tu tarea es generar subtareas estructuradas a partir de un titulo y una descripcion principal de una tarea.

Debes inferir pasos logicos, acciones necesarias, validaciones y procesos relacionados principalmente usando el contenido proporcionado.

REGLA CRITICA DE IDIOMA:
- TODA la respuesta DEBE estar completamente en ESPAÑOL.
- TODOS los campos "title" y "description" deben escribirse exclusivamente en español.
- NO uses ingles bajo ninguna circunstancia.
- Incluso si el contenido original esta en ingles, traduce e interpreta todo al español profesional.

Reglas IMPORTANTES:
- Responde SOLO con un array JSON valido.
- NO uses markdown.
- NO agregues explicaciones.
- NO agregues texto antes ni despues del JSON.
- El resultado debe ser parseable con JSON.parse().
- Cada elemento del array debe seguir exactamente la estructura del DTO proporcionado.
- Genera subtareas claras, concretas y accionables.
- Las subtareas deben representar pasos reales de implementacion o ejecucion.
- Evita subtareas genericas como:
  "hacer tarea",
  "terminar proyecto",
  "revisar todo".
- Usa un lenguaje profesional y tecnico.
- El campo "status" SIEMPRE debe ser "PENDING".
- Genera entre 3 y 10 subtareas dependiendo de la complejidad.
- Prioriza inferir subtareas desde el contenido antes que desde el titulo.
- No repitas informacion entre subtareas.
- Las subtareas deben tener sentido como una secuencia de trabajo real.
- Cada descripcion debe ampliar tecnicamente la accion de la subtarea.
- Usa verbos de accion profesionales en español.

Estructura exacta requerida:
[
  {
    "title": "string",
    "description": "string",
    "status": "PENDING"
  }
]

Estados permitidos:
- PENDING
- IN_PROGRESS
- COMPLETED`,
        },
        {
          role: 'user',
          content: `Titulo: ${messageDto.title}
Contenido: ${messageDto.content}`,
        },
      ],
      model: 'gpt-oss-120b',
      max_completion_tokens: 2048,
      temperature: 0.2,
      top_p: 1,
      stream: false,
    });
    const res = (completion.choices as any)[0].message.content;

    try {
      const parsed = JSON.parse(res);
      return parsed;
    } catch (error) {
      throw new HttpException(
        'Error parsing IA response: ' + res,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateTasks(message: string) {
    const completion = await this.cerebras.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
Eres un analista funcional especializado en proyectos de desarrollo de software.

Tu tarea consiste en convertir una lista de requerimientos, incidencias o mejoras en tareas listas para almacenarse en una base de datos.

REGLAS

- Toda la respuesta debe estar completamente en español.
- Responde únicamente con un JSON válido.
- No utilices markdown.
- No escribas explicaciones.
- No agregues texto antes ni después del JSON.
- El resultado debe poder procesarse mediante JSON.parse().

La estructura de cada tarea debe ser exactamente:

[
  {
    "title": "string",
    "description": "string",
    "status": "PENDING",
    "importance": 0
  }
]

IMPORTANCE

Asigna un valor entre 0 y 5.

0 = Sin prioridad
1 = Muy baja
2 = Baja
3 = Media
4 = Alta
5 = Crítica

Para asignar importance considera:

5
- Errores que impiden trabajar.
- Pérdida de información.
- Errores médicos.
- Errores que afectan consultas o pacientes.

4
- Funcionalidades importantes.
- Restricciones de negocio.
- Validaciones importantes.

3
- Mejoras funcionales.

2
- Ajustes menores.

1
- Cambios visuales.
- UX.
- Mejoras estéticas.

REGLAS DE GENERACIÓN

- Cada viñeta recibida debe convertirse en una tarea.
- Si una viñeta contiene dos funcionalidades independientes, genera dos tareas.
- No omitas ningún requerimiento.
- No inventes funcionalidades.
- Corrige errores ortográficos del texto recibido.
- El título debe ser corto (máximo 80 caracteres).
- La descripción debe explicar claramente qué debe implementarse y cuál es el comportamiento esperado.
- No repitas el título dentro de la descripción.
- Usa verbos de acción.
- El campo status siempre será "PENDING".`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'gpt-oss-120b',
      temperature: 0.2,
      top_p: 1,
      max_completion_tokens: 4096,
      stream: false,
    });

    const res = (completion.choices as any)[0].message.content;

    try {
      return JSON.parse(res);
    } catch {
      throw new HttpException(
        'Error parsing IA response: ' + res,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
