import { Injectable } from '@nestjs/common';
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
}
