import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ROLE_KEY } from './role.decorator';
import { Role } from '../../../generated/prisma/enums';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RoleGuard } from '../../auth/role.guard';

export const Auth = (role?: Role[]) => {
  return applyDecorators(
    SetMetadata(ROLE_KEY, role),
    UseGuards(JwtAuthGuard, RoleGuard),
  );
};
