import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UpsertBoardDocDto } from './dto/upsert-board-doc.dto';
import { ImportTasksToDocDto } from './dto/import-tasks-to-doc.dto';

interface DocBlockItem {
  id: string;
  type: string;
  content: string;
  checklistItems?: Array<{
    id: string;
    text: string;
    completed: boolean;
    syncedTodoId?: number;
  }>;
  [key: string]: unknown;
}

interface ParsedDocContent {
  title: string;
  subtitle: string;
  updatedAt: string;
  blocks: DocBlockItem[];
}

@Injectable()
export class BoardDocService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const [error, uploadResult] = await this.cloudinary.uploadImage(file);

    if (error || !uploadResult) {
      throw new HttpException(
        'Error al subir la imagen a Cloudinary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    };
  }

  private getDefaultInitialContent(title: string): string {
    const initialState: ParsedDocContent = {
      title,
      subtitle: 'Documento interactivo con tareas sincronizadas y vistas Kanban.',
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'callout',
          content: '',
          calloutData: {
            style: 'info',
            title: 'Hoja de Trabajo Inteligente',
            text: 'Escribe notas, inserta tareas del tablero o un tablero Kanban embebido en tiempo real.',
          },
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'heading-1',
          content: 'Planificación del Tablero',
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'paragraph',
          content: 'Detalla aquí las decisiones, notas y alcances generales.',
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'heading-2',
          content: 'Tareas & Seguimiento',
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'checklist',
          content: '',
          checklistItems: [
            {
              id: Math.random().toString(36).substring(2, 9),
              text: 'Revisar requerimientos del equipo',
              completed: false,
            },
          ],
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'divider',
          content: '',
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'heading-2',
          content: 'Tablero Kanban en Vivo',
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'kanban',
          content: '',
          kanbanConfig: {
            columnsToShow: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
            title: 'Tablero en Tiempo Real',
          },
        },
      ],
    };
    return JSON.stringify(initialState);
  }

  async findByTodoId(todosId: number) {
    const todoBoard = await this.prisma.todos.findUnique({
      where: { todosId },
      include: {
        boardDoc: true,
      },
    });

    if (!todoBoard) {
      throw new NotFoundException(`Tablero con ID ${todosId} no encontrado`);
    }

    if (todoBoard.boardDoc) {
      return this.syncLiveTasksToDoc(todoBoard.boardDoc);
    }

    const defaultTitle = `${todoBoard.title} - Hoja de Trabajo`;
    const defaultContent = this.getDefaultInitialContent(defaultTitle);

    return this.prisma.boardDoc.create({
      data: {
        todosId,
        title: defaultTitle,
        subtitle: 'Documento interactivo del tablero',
        content: defaultContent,
      },
    });
  }

  private async syncLiveTasksToDoc(boardDoc: any) {
    if (!boardDoc || !boardDoc.content) return boardDoc;
    try {
      const parsed = JSON.parse(boardDoc.content) as ParsedDocContent;
      if (!parsed || !Array.isArray(parsed.blocks)) return boardDoc;

      const syncedTodoIds = new Set<number>();
      for (const block of parsed.blocks) {
        if (block.type === 'checklist' && Array.isArray(block.checklistItems)) {
          for (const item of block.checklistItems) {
            if (item.syncedTodoId) syncedTodoIds.add(item.syncedTodoId);
          }
        }
        if (block.type === 'synced-task' && block.syncedTodoId) {
          syncedTodoIds.add(block.syncedTodoId as number);
        }
      }

      if (syncedTodoIds.size === 0) return boardDoc;

      const liveTasks = await this.prisma.todo.findMany({
        where: { todoId: { in: Array.from(syncedTodoIds) } },
      });
      const taskMap = new Map(liveTasks.map((t) => [t.todoId, t]));

      let changed = false;
      parsed.blocks = parsed.blocks.map((block) => {
        if (block.type === 'checklist' && Array.isArray(block.checklistItems)) {
          const updatedItems = block.checklistItems.map((item) => {
            if (item.syncedTodoId && taskMap.has(item.syncedTodoId)) {
              const liveTask = taskMap.get(item.syncedTodoId)!;
              const isCompleted = liveTask.status === 'COMPLETED';
              if (item.completed !== isCompleted || item.text !== liveTask.title) {
                changed = true;
                return {
                  ...item,
                  completed: isCompleted,
                  text: liveTask.title,
                };
              }
            }
            return item;
          });
          return { ...block, checklistItems: updatedItems };
        }
        return block;
      });

      if (changed) {
        parsed.updatedAt = new Date().toISOString();
        return await this.prisma.boardDoc.update({
          where: { todosId: boardDoc.todosId },
          data: {
            content: JSON.stringify(parsed),
          },
        });
      }
    } catch (err) {
      console.error('Error synchronizing live tasks in BoardDocService:', err);
    }
    return boardDoc;
  }

  async upsert(todosId: number, dto: UpsertBoardDocDto) {
    const todoBoard = await this.prisma.todos.findUnique({
      where: { todosId },
    });

    if (!todoBoard) {
      throw new NotFoundException(`Tablero con ID ${todosId} no encontrado`);
    }

    return this.prisma.boardDoc.upsert({
      where: { todosId },
      update: {
        title: dto.title,
        subtitle: dto.subtitle ?? '',
        content: dto.content,
      },
      create: {
        todosId,
        title: dto.title,
        subtitle: dto.subtitle ?? '',
        content: dto.content,
      },
    });
  }

  async importTasks(todosId: number, dto: ImportTasksToDocDto) {
    const todoBoard = await this.prisma.todos.findUnique({
      where: { todosId },
      include: {
        boardDoc: true,
      },
    });

    if (!todoBoard) {
      throw new NotFoundException(`Tablero con ID ${todosId} no encontrado`);
    }

    const whereClause: { todosId: number; isArchived: boolean; todoId?: { in: number[] } } = {
      todosId,
      isArchived: false,
    };

    if (dto.todoIds && dto.todoIds.length > 0) {
      whereClause.todoId = { in: dto.todoIds };
    }

    const tasksToImport = await this.prisma.todo.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    });

    let currentDoc = todoBoard.boardDoc;
    if (!currentDoc) {
      currentDoc = await this.findByTodoId(todosId);
    }

    if (!currentDoc) {
      throw new NotFoundException(`Hoja de trabajo no encontrada`);
    }

    let parsedContent: ParsedDocContent;
    try {
      parsedContent = JSON.parse(currentDoc.content) as ParsedDocContent;
      if (!Array.isArray(parsedContent.blocks)) {
        parsedContent = JSON.parse(this.getDefaultInitialContent(currentDoc.title)) as ParsedDocContent;
      }
    } catch {
      parsedContent = JSON.parse(this.getDefaultInitialContent(currentDoc.title)) as ParsedDocContent;
    }

    const importedChecklistItems = tasksToImport.map((task) => ({
      id: Math.random().toString(36).substring(2, 9),
      text: task.title,
      completed: task.status === 'COMPLETED',
      syncedTodoId: task.todoId,
    }));

    const newBlock: DocBlockItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'checklist',
      content: '',
      checklistItems: importedChecklistItems,
    };

    parsedContent.blocks.push(newBlock);
    parsedContent.updatedAt = new Date().toISOString();

    const updatedDoc = await this.prisma.boardDoc.update({
      where: { todosId },
      data: {
        content: JSON.stringify(parsedContent),
      },
    });

    return {
      doc: updatedDoc,
      importedCount: tasksToImport.length,
      tasks: tasksToImport,
    };
  }
}
