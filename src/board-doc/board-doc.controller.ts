import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { BoardDocService } from './board-doc.service';
import { UpsertBoardDocDto } from './dto/upsert-board-doc.dto';
import { ImportTasksToDocDto } from './dto/import-tasks-to-doc.dto';

@Auth()
@Controller('board-doc')
export class BoardDocController {
  constructor(private readonly boardDocService: BoardDocService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.boardDocService.uploadImage(file);
  }

  @Get(':todosId')
  findByTodoId(@Param('todosId', ParseIntPipe) todosId: number) {
    return this.boardDocService.findByTodoId(todosId);
  }

  @Put(':todosId')
  upsert(
    @Param('todosId', ParseIntPipe) todosId: number,
    @Body() dto: UpsertBoardDocDto,
  ) {
    return this.boardDocService.upsert(todosId, dto);
  }

  @Post(':todosId/import-tasks')
  importTasks(
    @Param('todosId', ParseIntPipe) todosId: number,
    @Body() dto: ImportTasksToDocDto,
  ) {
    return this.boardDocService.importTasks(todosId, dto);
  }
}
