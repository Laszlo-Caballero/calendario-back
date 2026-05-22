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
      include: {
        images: {
          include: {
            image: true,
          },
        },
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

    const { secure_url } = res;

    const newImage = await this.prisma.images.create({
      data: {
        url: secure_url,
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
}
