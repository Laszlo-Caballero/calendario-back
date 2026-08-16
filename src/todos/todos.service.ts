import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/interface/type';
import { CreateTodoDto } from './dto/todos.dto';
import { UpdateTodoDto } from './dto/updateTodos.dto';
import { TodoStatus } from '../generated/prisma/enums';
import { InviteTodoDto } from './dto/invite-todo.dto';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTodos(user?: JwtPayload) {
    if (user?.role === 'ADMIN') {
      return this.prisma.todos.findMany({
        include: {
          _count: {
            select: {
              todos: {
                where: {
                  status: {
                    in: [TodoStatus.PENDING, TodoStatus.IN_PROGRESS],
                  },
                  isArchived: false,
                },
              },
            },
          },
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
            },
          },
          todosAsigments: {
            include: {
              user: {
                select: {
                  userId: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }

    return this.prisma.todos.findMany({
      where: {
        OR: [
          {
            isPublic: true,
            status: true,
          },
          {
            user: {
              userId: user?.idUser,
            },
          },
          {
            todosAsigments: {
              some: {
                user: {
                  userId: user?.idUser,
                },
              },
            },
          },
        ],
      },
      include: {
        todosAsigments: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            todos: {
              where: {
                status: {
                  in: [TodoStatus.PENDING, TodoStatus.IN_PROGRESS],
                },
                isArchived: false,
              },
            },
          },
        },
      },
    });
  }

  async createTodo(data: CreateTodoDto, user: JwtPayload) {
    return this.prisma.todos.create({
      data: {
        title: data.name,
        isPublic: data.isPublic,
        user: {
          connect: {
            userId: user.idUser,
          },
        },
      },
    });
  }

  async updateTodo(id: number, updateDto: UpdateTodoDto, user: JwtPayload) {
    const findTodo = await this.prisma.todos.findUnique({
      where: { todosId: id },
      include: {
        user: true,
      },
    });

    if (!findTodo) {
      throw new NotFoundException('Todo not found');
    }

    if (user.role !== 'ADMIN' && findTodo.user.userId !== user.idUser) {
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

  async deleteTodo(id: number, user: JwtPayload) {
    const findTodo = await this.prisma.todos.findUnique({
      where: { todosId: id },
      include: {
        user: true,
      },
    });

    if (!findTodo) {
      throw new NotFoundException('Todo not found');
    }

    if (user.role !== 'ADMIN' && findTodo.user.userId !== user.idUser) {
      throw new NotFoundException('Todo not found');
    }

    return this.prisma.todos.update({
      where: { todosId: id },
      data: {
        status: false,
      },
    });
  }

  async getAllTodosWithTodo(user: JwtPayload) {
    return this.prisma.todos.findMany({
      where: {
        status: true,
        OR: [
          {
            user: {
              userId: user.idUser,
            },
          },
          {
            todosAsigments: {
              some: {
                user: {
                  userId: user.idUser,
                },
              },
            },
          },
        ],
      },
      include: {
        todos: true,
      },
    });
  }

  async inviteTodos(data: InviteTodoDto, user: JwtPayload) {
    const findTodo = await this.prisma.todos.findUnique({
      where: { todosId: data.todosId },
      include: {
        user: true,
        todosAsigments: true,
      },
    });

    if (!findTodo) {
      throw new NotFoundException('Todo not found');
    }

    if (user.role !== 'ADMIN' && findTodo.user.userId !== user.idUser) {
      throw new NotFoundException('Todo not found');
    }

    const findUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!findUser) {
      throw new NotFoundException('User not found');
    }

    const findUserInAssignment = findTodo.todosAsigments.find(
      (assignment) => assignment.userId === findUser.userId,
    );

    if (findUserInAssignment) {
      throw new NotFoundException('User already assigned to this todo');
    }

    return this.prisma.todosAsigment.create({
      data: {
        todosId: data.todosId,
        userId: findUser.userId,
      },
    });
  }

  async deleteInviteTodos(id: number, user: JwtPayload) {
    const findAssignment = await this.prisma.todosAsigment.findUnique({
      where: { todosAsigmentId: id },
      include: {
        todos: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!findAssignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (
      user.role !== 'ADMIN' &&
      findAssignment.todos.user.userId !== user.idUser
    ) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.todosAsigment.delete({
      where: { todosAsigmentId: id },
    });
  }
}
