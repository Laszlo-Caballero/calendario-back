import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/interface/type';
import { TodoQueryDto } from './dto/query.dto';
import { TodoDto } from './dto/todo.dto';
import { ChangeStatusDto } from './dto/changeStatus.dto';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTodos(query: TodoQueryDto, user?: JwtPayload) {
    const { todosId } = query;

    const findTodos = await this.prisma.todos.findUnique({
      where: {
        todosId,
      },
    });

    if (!findTodos) {
      throw new NotFoundException(`Todos with id ${todosId} not found`);
    }

    if (!findTodos.isPublic && user?.role !== 'ADMIN') {
      throw new ForbiddenException(`Todos with id ${todosId} not found`);
    }

    if (!findTodos.status && user?.role != 'ADMIN') {
      throw new ForbiddenException(`Todos with id ${todosId} not found`);
    }

    return this.prisma.todo.findMany({
      where: {
        todosId,
      },
    });
  }

  async createTodo(todo: TodoDto) {
    const { todosId } = todo;

    const findTodos = await this.prisma.todos.findUnique({
      where: {
        todosId,
      },
    });

    if (!findTodos) {
      throw new NotFoundException(`Todos with id ${todosId} not found`);
    }

    if (!findTodos.status) {
      throw new ForbiddenException(`Todos with id ${todosId} not found`);
    }

    return this.prisma.todo.create({
      data: {
        ...todo,
        todosId,
      },
    });
  }

  async updateTodo(id: number, todo: TodoDto) {
    const { todosId, ...rest } = todo;

    const findTodo = await this.prisma.todo.findUnique({
      where: {
        todoId: id,
      },
    });

    if (!findTodo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    return this.prisma.todo.update({
      where: {
        todoId: id,
      },
      data: {
        ...rest,
        todosId,
      },
    });
  }

  changeStatus(id: number, status: ChangeStatusDto) {
    return this.prisma.todo.update({
      where: {
        todoId: id,
      },
      data: {
        status: status.status,
      },
    });
  }
}
