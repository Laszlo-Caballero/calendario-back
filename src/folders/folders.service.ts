import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FolderDto } from './dto/folder.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { JwtPayload } from '../common/interface/type';
import { FolderQueryDto } from './dto/folder-query.dto';

@Injectable()
export class FoldersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllFolders(query: FolderQueryDto, user?: JwtPayload) {
    const { name } = query;

    if (name) {
      const findFolder = await this.prisma.folder.findFirst({
        where: {
          name,
        },
        include: {
          folders: {
            where: {
              isPublic: user?.role === 'ADMIN' ? undefined : true,
            },
          },
          archives: true,
          parent: true,
        },
      });

      if (!findFolder) {
        throw new NotFoundException(`Folder with name ${name} not found`);
      }

      if (!findFolder.isPublic && user?.role !== 'ADMIN') {
        throw new NotFoundException(`Folder with name ${name} not found`);
      }

      return findFolder;
    }

    const findFolders = await this.prisma.folder.findMany({
      where: {
        parentFolderId: null,
        isPublic: user?.role === 'ADMIN' ? undefined : true,
      },
    });

    const filesRoot = await this.prisma.archives.findMany({
      where: {
        folderId: null,
      },
    });

    return { folders: findFolders, archives: filesRoot };
  }

  async createFolder(folderDto: FolderDto) {
    const { name, isPublic, folderId } = folderDto;

    if (folderId) {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { folderId },
      });
      if (!parentFolder) {
        throw new NotFoundException(
          `Parent folder with id ${folderId} not found`,
        );
      }
    }

    return this.prisma.folder.create({
      data: {
        name,
        isPublic,
        parentFolderId: folderId ?? null,
      },
    });
  }

  async updateFolder(id: number, folderDto: FolderDto) {
    const { name, isPublic, folderId } = folderDto;

    const findFolder = await this.prisma.folder.findUnique({
      where: {
        folderId: id,
      },
    });

    if (!findFolder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }

    if (folderId) {
      if (folderId === id) {
        throw new NotFoundException(`A folder cannot be its own parent`);
      }
      const parentFolder = await this.prisma.folder.findUnique({
        where: { folderId },
      });
      if (!parentFolder) {
        throw new NotFoundException(
          `Parent folder with id ${folderId} not found`,
        );
      }
    }

    return this.prisma.folder.update({
      where: {
        folderId: id,
      },
      data: {
        name,
        isPublic,
        parentFolderId: folderId !== undefined ? (folderId ?? null) : undefined,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,

    user: JwtPayload,
    folderId?: string,
  ) {
    if (!file) {
      throw new NotFoundException(`File not found`);
    }
    const [name, ext] = file.originalname.split('.');
    if (!ext || !name) {
      throw new InternalServerErrorException(`Error uploading file`);
    }

    console.log({ folderId, user });

    if (user.role !== 'ADMIN' && !folderId) {
      throw new NotFoundException(`Only admin can upload files to root`);
    }

    if (folderId) {
      const sanitizedFolderId = parseInt(folderId);

      if (isNaN(sanitizedFolderId)) {
        throw new NotFoundException(`Folder with id ${folderId} not found`);
      }

      const findFolder = await this.prisma.folder.findUnique({
        where: {
          folderId: sanitizedFolderId,
        },
      });

      if (!findFolder) {
        throw new NotFoundException(`Folder with id ${folderId} not found`);
      }

      if (!findFolder.isPublic && user.role !== 'ADMIN') {
        throw new NotFoundException(`Folder with id ${folderId} not found`);
      }

      const [error, res] = await this.cloudinaryService.uploadFile(file);

      if (error) {
        throw new NotFoundException(`Error uploading file`);
      }

      const { secure_url, public_id } = res;
      return this.prisma.archives.create({
        data: {
          url: secure_url,
          public_id,
          type: ext,
          name: name,
          folder: {
            connect: {
              folderId: sanitizedFolderId,
            },
          },
        },
      });
    }
    const [error, res] = await this.cloudinaryService.uploadFile(file);

    if (error) {
      throw new NotFoundException(`Error uploading file`);
    }

    const { secure_url, public_id } = res;

    return this.prisma.archives.create({
      data: {
        url: secure_url,
        public_id,
        type: ext,
      },
    });
  }

  async deleteFile(id: number) {
    const findArchive = await this.prisma.archives.findUnique({
      where: {
        archiveId: id,
      },
    });

    if (!findArchive) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    const { public_id } = findArchive;

    const [error, res] = await this.cloudinaryService.deleteImage(public_id);

    if (error) {
      throw new NotFoundException(`Error deleting file`);
    }

    return this.prisma.archives.delete({
      where: {
        archiveId: id,
      },
    });
  }
}
