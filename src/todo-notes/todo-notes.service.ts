import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoNoteDto } from './dto/create-todo-note.dto';
import { UpdateTodoNoteDto } from './dto/update-todo-note.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TodoNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTodoNoteDto: CreateTodoNoteDto) {
    const { title, content, isPinned, isArchived, todosId } = createTodoNoteDto;

    const findTodo = await this.prisma.todos.findUnique({
      where: {
        todosId,
      },
    });

    if (!findTodo) {
      throw new NotFoundException(`Todo with id ${todosId} not found`);
    }

    return this.prisma.todoNote.create({
      data: {
        title,
        content,
        isPinned,
        isArchived,
        todos: {
          connect: {
            todosId,
          },
        },
      },
    });
  }

  findAll(todosId: number) {
    const findTodo = this.prisma.todos.findUnique({
      where: {
        todosId,
      },
    });

    if (!findTodo) {
      throw new NotFoundException(`Todo with id ${todosId} not found`);
    }

    return this.prisma.todoNote.findMany({
      where: {
        todosTodosId: todosId,
      },
    });
  }

  async update(id: number, updateTodoNoteDto: UpdateTodoNoteDto) {
    const { title, content, isPinned, isArchived } = updateTodoNoteDto;

    const findTodoNote = await this.prisma.todoNote.findUnique({
      where: {
        todoNoteId: id,
      },
    });

    if (!findTodoNote) {
      throw new NotFoundException(`TodoNote with id ${id} not found`);
    }

    return this.prisma.todoNote.update({
      where: {
        todoNoteId: id,
      },
      data: {
        title,
        content,
        isPinned,
        isArchived,
      },
    });
  }

  async remove(id: number) {
    const findTodoNote = await this.prisma.todoNote.findUnique({
      where: {
        todoNoteId: id,
      },
    });

    if (!findTodoNote) {
      throw new NotFoundException(`TodoNote with id ${id} not found`);
    }

    return this.prisma.todoNote.update({
      where: {
        todoNoteId: id,
      },
      data: {
        status: false,
      },
    });
  }
}
