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
    const childInclude = {
      where: {
        status: true,
      },
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
      },
      orderBy: {
        createdAt: 'asc' as const,
      },
    };

    if (user?.role === 'ADMIN') {
      return this.prisma.todos.findMany({
        where: {
          parentTodosId: null,
        },
        include: {
          childTodos: childInclude,
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
        orderBy: {
          createdAt: 'asc',
        },
      });
    }

    return this.prisma.todos.findMany({
      where: {
        parentTodosId: null,
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
        childTodos: childInclude,
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createTodo(data: CreateTodoDto, user: JwtPayload) {
    return this.prisma.todos.create({
      data: {
        title: data.name,
        isPublic: data.isPublic,
        userId: user.idUser,
        parentTodosId: data.parentId ?? null,
      },
      include: {
        childTodos: true,
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
        ...(updateDto.parentId !== undefined ? { parentTodosId: updateDto.parentId } : {}),
      },
      include: {
        childTodos: true,
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

    await this.prisma.todos.updateMany({
      where: { parentTodosId: id },
      data: {
        status: false,
      },
    });

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
