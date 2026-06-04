import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { User } from '../common/decorator/user/user.decorator';
import type { JwtPayload } from '../common/interface/type';
import { TodoQueryDto } from './dto/query.dto';
import { TodoDto } from './dto/todo.dto';
import { ChangeStatusDto } from './dto/changeStatus.dto';
import { Role } from '../generated/prisma/enums';
import { ImportsTodoDto } from './dto/imports-todo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadDto } from './dto/image.dto';
import { DeleteImagenDto } from './dto/delete-image.dto';

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

  @Put(':id/archive')
  async archiveTodo(@Param('id') id: number) {
    return this.todoService.archiveTodo(id);
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: number, @User() user: JwtPayload) {
    return this.todoService.deleteTodo(id, user);
  }

  @Auth([Role.ADMIN])
  @Post('/import')
  async importTodo(@Body() data: ImportsTodoDto) {
    return this.todoService.importTodo(data);
  }

  @Auth([Role.ADMIN])
  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ImageUploadDto,
  ) {
    return this.todoService.uploadImage(file, body);
  }

  @Auth([Role.ADMIN])
  @Delete('image/delete')
  async deleteImage(@Body() body: DeleteImagenDto) {
    return this.todoService.deleteImage(body);
  }

  @Auth([Role.ADMIN])
  @Put(':id/pinned')
  async togglePinned(@Param('id') id: number) {
    return this.todoService.togglePinned(id);
  }

  @Auth()
  @Get('not-complete')
  async getNotCompleteTodos() {
    return this.todoService.getNotCompleteTodos();
  }

  @Auth()
  @Get('importance/:num')
  async getTodosByImportance(@Param('num') num: number) {
    return this.todoService.getTodosByImportance(num);
  }
}
