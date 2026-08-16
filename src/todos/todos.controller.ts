import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { User } from '../common/decorator/user/user.decorator';
import type { JwtPayload } from '../common/interface/type';
import { Role } from '../generated/prisma/enums';
import { CreateTodoDto } from './dto/todos.dto';
import { UpdateTodoDto } from './dto/updateTodos.dto';
import { InviteTodoDto } from './dto/invite-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Auth()
  @Get()
  async getAllTodos(@User() user: JwtPayload) {
    return this.todosService.getAllTodos(user);
  }

  @Auth({
    role: [Role.ADMIN, Role.USER],
  })
  @Post()
  async createTodo(@Body() data: CreateTodoDto, @User() user: JwtPayload) {
    return this.todosService.createTodo(data, user);
  }

  @Auth({
    role: [Role.ADMIN, Role.USER],
  })
  @Patch(':id')
  async updateTodo(
    @Param('id') id: number,
    @Body() updateDto: UpdateTodoDto,
    @User() user: JwtPayload,
  ) {
    return this.todosService.updateTodo(id, updateDto, user);
  }

  @Auth({
    role: [Role.ADMIN, Role.USER],
  })
  @Delete(':id')
  async deleteTodo(@Param('id') id: number, @User() user: JwtPayload) {
    return this.todosService.deleteTodo(id, user);
  }

  @Auth({
    role: [Role.ADMIN, Role.USER],
  })
  @Get('/with-todo')
  async getAllTodosWithTodo(@User() user: JwtPayload) {
    return this.todosService.getAllTodosWithTodo(user);
  }

  @Auth({
    role: [Role.ADMIN, Role.USER],
  })
  @Post('/invite-todos')
  async inviteTodos(@Body() data: InviteTodoDto, @User() user: JwtPayload) {
    return this.todosService.inviteTodos(data, user);
  }

  @Auth({
    role: [Role.ADMIN, Role.USER],
  })
  @Delete('/invite-todos/:id')
  async deleteInviteTodos(
    @Param('id', new ParseIntPipe()) id: number,
    @User() user: JwtPayload,
  ) {
    return this.todosService.deleteInviteTodos(id, user);
  }
}
