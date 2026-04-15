import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { User } from '../common/decorator/user/user.decorator';
import type { JwtPayload } from '../common/interface/type';
import { TodoQueryDto } from './dto/query.dto';
import { TodoDto } from './dto/todo.dto';
import { ChangeStatusDto } from './dto/changeStatus.dto';

@Auth()
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getAllTodos(@Query() query: TodoQueryDto, @User() user?: JwtPayload) {
    return this.todoService.getAllTodos(query, user);
  }

  @Post()
  async createTodo(@Body() todo: TodoDto) {
    return this.todoService.createTodo(todo);
  }

  @Patch(':id')
  async updateTodo(@Param('id') id: number, @Body() data: TodoDto) {
    return this.todoService.updateTodo(id, data);
  }

  @Put(':id')
  async changeStatus(@Param('id') id: number, @Body() data: ChangeStatusDto) {
    return this.todoService.changeStatus(id, data);
  }
}
