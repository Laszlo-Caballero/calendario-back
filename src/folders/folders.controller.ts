import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { Role } from '../generated/prisma/enums';
import { FolderDto } from './dto/folder.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '../common/decorator/user/user.decorator';
import type { JwtPayload } from '../common/interface/type';
import { FolderQueryDto } from './dto/folder-query.dto';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Auth()
  @Get()
  async getAllFolders(
    @Query() query: FolderQueryDto,
    @User() user?: JwtPayload,
  ) {
    return this.foldersService.getAllFolders(query, user);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Post()
  async createFolder(@Body() folderDto: FolderDto) {
    return this.foldersService.createFolder(folderDto);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Patch(':id')
  async updateFolder(
    @Param('id', ParseIntPipe) id: number,
    @Body() folderDto: FolderDto,
  ) {
    return this.foldersService.updateFolder(id, folderDto);
  }

  @Auth()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: JwtPayload,
    @Body('folderId') folderId?: string,
  ) {
    return this.foldersService.uploadFile(file, user, folderId);
  }

  @Auth({
    role: [Role.ADMIN],
  })
  @Delete(':id')
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    return this.foldersService.deleteFile(id);
  }
}
