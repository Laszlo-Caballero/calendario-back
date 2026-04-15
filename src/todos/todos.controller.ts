import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Auth()
  @Get()
  async getAllTodos(@User() user: JwtPayload) {
    return this.todosService.getAllTodos(user);
  }

  @Auth([Role.ADMIN])
  @Post()
  async createTodo(@Body() data: CreateTodoDto) {
    return this.todosService.createTodo(data);
  }

  @Auth([Role.ADMIN])
  @Patch(':id')
  async updateTodo(@Param('id') id: number, @Body() updateDto: UpdateTodoDto) {
    return this.todosService.updateTodo(id, updateDto);
  }

  @Auth([Role.ADMIN])
  @Delete(':id')
  async deleteTodo(@Param('id') id: number) {
    return this.todosService.deleteTodo(id);
  }
}
