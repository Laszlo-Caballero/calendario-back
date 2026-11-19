import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/interface/type';
import { TodoQueryDto } from './dto/query.dto';
import { TodoDto } from './dto/todo.dto';
import { ChangeStatusDto } from './dto/changeStatus.dto';
import { ImportsTodoDto } from './dto/imports-todo.dto';
import { ImageUploadDto } from './dto/image.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { DeleteImagenDto } from './dto/delete-image.dto';
import { TodoStatus } from '../generated/prisma/enums';

@Injectable()
export class TodoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getAllTodos(query: TodoQueryDto, user?: JwtPayload) {
    const { todosId } = query;

    const findTodos = await this.prisma.todos.findUnique({
      where: {
        todosId,
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
      },
    });

    if (!findTodos) {
      throw new NotFoundException(`Todos with id ${todosId} not found`);
    }

    const isUserAssigned = findTodos.todosAsigments.some(
      (assignment) => assignment.userId === user?.idUser,
    );

    if (!isUserAssigned && user?.role !== 'ADMIN') {
      if (!findTodos.isPublic) {
        throw new ForbiddenException(`Todos with id ${todosId} not found`);
      }

      if (!findTodos.status) {
        throw new ForbiddenException(`Todos with id ${todosId} not found`);
      }
    }

    return this.prisma.todo.findMany({
      where: {
        todosId,
      },
      orderBy: [{ order: 'asc' }, { todoId: 'asc' }],
      include: {
        images: {
          include: {
            image: true,
          },
        },
        assignmentTodos: true,
      },
    });
  }

  async createTodo(todo: TodoDto) {
    const { todosId, assignmentUserIds, ...todoData } = todo;

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

    const newTodo = await this.prisma.todo.create({
      data: {
        ...todoData,
        todosId,
      },
    });

    let assignmentTodos: Array<{
      todoId: number;
      userId: number;
      createdAt: Date;
      assignmentTodoId: number;
    }> = [];

    if (assignmentUserIds && assignmentUserIds.length > 0) {
      const existingUsers = await this.prisma.user.findMany({
        where: {
          userId: {
            in: assignmentUserIds,
          },
        },
        select: { userId: true },
      });

      const validUserIds = existingUsers.map((u) => u.userId);

      if (validUserIds.length > 0) {
        assignmentTodos = await Promise.all(
          validUserIds.map((userId) => {
            return this.prisma.assignmentTodo.create({
              data: {
                todo: {
                  connect: {
                    todoId: newTodo.todoId,
                  },
                },
                user: {
                  connect: {
                    userId,
                  },
                },
              },
            });
          }),
        );
      }
    }

    return {
      ...newTodo,
      assignmentTodos,
    };
  }

  async updateTodo(id: number, todo: TodoDto) {
    const { todosId, assignmentUserIds, ...rest } = todo;

    const findTodo = await this.prisma.todo.findUnique({
      where: {
        todoId: id,
      },
      include: {
        assignmentTodos: true,
      },
    });

    if (!findTodo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    const updatedTodo = await this.prisma.todo.update({
      where: {
        todoId: id,
      },
      data: {
        ...rest,
        todosId,
      },
    });

    if (assignmentUserIds !== undefined) {
      const currentUserIds = findTodo.assignmentTodos.map(
        (assignment) => assignment.userId,
      );
      const uniqueAssignmentUserIds = [...new Set(assignmentUserIds)];

      const userIdsToCreate = uniqueAssignmentUserIds.filter(
        (userId) => !currentUserIds.includes(userId),
      );
      const userIdsToDelete = currentUserIds.filter(
        (userId) => !uniqueAssignmentUserIds.includes(userId),
      );

      if (userIdsToDelete.length > 0) {
        await this.prisma.assignmentTodo.deleteMany({
          where: {
            todoId: id,
            userId: {
              in: userIdsToDelete,
            },
          },
        });
      }

      if (userIdsToCreate.length > 0) {
        const existingUsers = await this.prisma.user.findMany({
          where: {
            userId: {
              in: userIdsToCreate,
            },
          },
          select: { userId: true },
        });

        const validUserIdsToCreate = existingUsers.map((u) => u.userId);

        if (validUserIdsToCreate.length > 0) {
          await Promise.all(
            validUserIdsToCreate.map((userId) => {
              return this.prisma.assignmentTodo.create({
                data: {
                  todo: {
                    connect: {
                      todoId: id,
                    },
                  },
                  user: {
                    connect: {
                      userId,
                    },
                  },
                },
              });
            }),
          );
        }
      }
    }

    return updatedTodo;
  }

  changeStatus(id: number, status: ChangeStatusDto) {
    return this.prisma.todo.update({
      where: {
        todoId: id,
      },
      data: {
        status: status.status,
        completedAt: status.status == TodoStatus.COMPLETED ? new Date() : null,
      },
    });
  }

  async deleteTodo(id: number, user?: JwtPayload) {
    const findTodo = await this.prisma.todo.findUnique({
      where: {
        todoId: id,
      },
      include: {
        todos: true,
      },
    });

    if (!findTodo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    const { todos } = findTodo;

    if (!todos.isPublic && user?.role !== 'ADMIN') {
      throw new ForbiddenException(`Todo with id ${id} not found`);
    }

    await this.prisma.assignmentTodo.deleteMany({
      where: {
        todoId: id,
      },
    });

    const deletedImages = await this.prisma.todoImage.deleteMany({
      where: {
        todoId: id,
      },
    });

    const deletedTodo = await this.prisma.todo.delete({
      where: {
        todoId: id,
      },
    });

    return {
      deletedTodo,
      deletedImages,
    };
  }

  async importTodo(data: ImportsTodoDto) {
    const { todoIds, todosId } = data;

    const findTodos = await this.prisma.todo.findMany({
      where: {
        todoId: {
          in: todoIds,
        },
      },
      include: {
        images: true,
      },
    });

    if (findTodos.length !== todoIds.length) {
      throw new NotFoundException(`One or more Todos not found`);
    }

    const createImports = findTodos.map((todo) => {
      return this.prisma.todo.create({
        data: {
          title: todo.title,
          description: todo.description,
          status: 'PENDING',
          todosId: todosId,
        },
      });
    });

    const newTodos = await this.prisma.$transaction(createImports);

    const updateImages = findTodos
      .map((todo, index) => {
        const images = todo.images.map((image) => {
          return this.prisma.todoImage.update({
            where: {
              todoImageId: image.todoImageId,
            },
            data: {
              todo: {
                connect: {
                  todoId: newTodos[index].todoId,
                },
              },
            },
          });
        });
        return images;
      })
      .flat();

    const deletedImports = todoIds.map((id) => {
      return this.prisma.todo.delete({
        where: {
          todoId: id,
        },
      });
    });

    return this.prisma.$transaction([...updateImages, ...deletedImports]);
  }

  async uploadImage(file: Express.Multer.File, body: ImageUploadDto) {
    if (!file) {
      throw new NotFoundException(`File not found`);
    }

    const { todoId } = body;

    const findTodo = await this.prisma.todo.findUnique({
      where: {
        todoId,
      },
    });

    if (!findTodo) {
      throw new NotFoundException(`Todo with id ${todoId} not found`);
    }

    const [error, res] = await this.cloudinary.uploadImage(file);

    if (error) {
      throw new HttpException(`Error uploading image: ${error.message}`, 500);
    }

    const { secure_url, public_id } = res;

    const newImage = await this.prisma.images.create({
      data: {
        url: secure_url,
        public_id,
      },
    });

    return this.prisma.todoImage.create({
      data: {
        todo: {
          connect: {
            todoId,
          },
        },
        image: {
          connect: {
            imageId: newImage.imageId,
          },
        },
      },
    });
  }

  async deleteImage(body: DeleteImagenDto) {
    const { todoId, imageId } = body;

    const imageTodo = await this.prisma.todoImage.findFirst({
      where: {
        todoId,
        imageId,
      },
    });

    if (!imageTodo) {
      throw new NotFoundException(
        `Image with id ${imageId} not found for todo with id ${todoId}`,
      );
    }

    const deletedTodoImage = await this.prisma.todoImage.delete({
      where: {
        todoImageId: imageTodo.todoImageId,
      },
    });

    return deletedTodoImage;
  }

  async archiveTodo(id: number) {
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
        isArchived: !findTodo.isArchived,
      },
    });
  }

  async togglePinned(id: number) {
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
        pinned: !findTodo.pinned,
      },
    });
  }

  async getNotCompleteTodos(user: JwtPayload) {
    const [count, todos] = await this.prisma.$transaction([
      this.prisma.todo.count({
        where: {
          status: {
            notIn: [TodoStatus.COMPLETED, TodoStatus.ARCHIVED],
          },
          isArchived: false,
          todos: {
            status: true,
            OR: [
              {
                todosAsigments: {
                  some: {
                    userId: user.idUser,
                  },
                },
              },
              {
                userId: user.idUser,
              },
            ],
          },
        },
      }),
      this.prisma.todos.findMany({
        where: {
          OR: [
            {
              todosAsigments: {
                some: {
                  userId: user.idUser,
                },
              },
            },
            {
              userId: user.idUser,
            },
          ],
          todos: {
            some: {
              status: {
                notIn: [TodoStatus.COMPLETED, TodoStatus.ARCHIVED],
              },
              isArchived: false,
            },
          },
          status: true,
        },
        include: {
          todos: {
            where: {
              status: {
                notIn: [TodoStatus.COMPLETED, TodoStatus.ARCHIVED],
              },
              isArchived: false,
            },
            include: {
              images: {
                include: {
                  image: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      count,
      todos,
    };
  }

  async getTodosByImportance(num: number, user: JwtPayload) {
    const [count, todos] = await this.prisma.$transaction([
      this.prisma.todo.count({
        where: {
          importance: num,
          isArchived: false,
          todos: {
            status: true,
            OR: [
              {
                todosAsigments: {
                  some: {
                    userId: user.idUser,
                  },
                },
              },
              {
                userId: user.idUser,
              },
            ],
          },
        },
      }),
      this.prisma.todo.findMany({
        where: {
          importance: num,
          isArchived: false,
          todos: {
            status: true,
            OR: [
              {
                todosAsigments: {
                  some: {
                    userId: user.idUser,
                  },
                },
              },
              {
                userId: user.idUser,
              },
            ],
          },
        },
        include: {
          images: {
            include: {
              image: true,
            },
          },
        },
      }),
    ]);

    return {
      count,
      todos,
    };
  }

  async getResume(user: JwtPayload) {
    return this.prisma.todo.findMany({
      where: {
        isArchived: false,
        status: {
          notIn: [TodoStatus.COMPLETED, TodoStatus.ARCHIVED],
        },
        todos: {
          status: true,
          OR: [
            {
              todosAsigments: {
                some: {
                  userId: user.idUser,
                },
              },
            },
            {
              userId: user.idUser,
            },
          ],
        },
        OR: [
          {
            pinned: true,
          },
          {
            importance: {
              in: [3, 2],
            },
          },
          {
            status: TodoStatus.IN_PROGRESS,
          },
        ],
      },
      include: {
        images: {
          include: {
            image: true,
          },
        },
        assignmentTodos: {
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
        todos: {
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
}
