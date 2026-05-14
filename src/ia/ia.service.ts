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
          content: `Tienes que autocompletar la descripcion de una tarea en base a un titulo y un contenido, 
            con informacion mas detalladas y precisa, y con un tono mas formal y profesional.

            Solo tiene que se texto sin markdown, sin emojis y sin codigo html.
            sin repetir el titulo, sin incluir el titulo, sin incluir el contenido, solo la descripcion de la tarea.`,
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
