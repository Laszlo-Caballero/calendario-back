import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/interface/type';
import { CreateTodoDto } from './dto/todos.dto';
import { UpdateTodoDto } from './dto/updateTodos.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTodos(user?: JwtPayload) {
    if (user?.role === 'ADMIN') {
      return this.prisma.todos.findMany();
    }

    return this.prisma.todos.findMany({
      where: {
        isPublic: true,
        status: true,
      },
    });
  }

  async createTodo(data: CreateTodoDto) {
    return this.prisma.todos.create({
      data: {
        title: data.name,
        isPublic: data.isPublic,
      },
    });
  }

  async updateTodo(id: number, updateDto: UpdateTodoDto) {
    const findTodo = await this.prisma.todos.findUnique({
      where: { todosId: id },
    });

    if (!findTodo) {
      throw new NotFoundException('Todo not found');
    }

    return this.prisma.todos.update({
      where: { todosId: id },
      data: {
        title: updateDto.name,
        isPublic: updateDto.isPublic,
      },
    });
  }

  async deleteTodo(id: number) {
    const findTodo = await this.prisma.todos.findUnique({
      where: { todosId: id },
    });

    if (!findTodo) {
      throw new NotFoundException('Todo not found');
    }

    return this.prisma.todos.update({
      where: { todosId: id },
      data: {
        status: false,
      },
    });
  }
}
