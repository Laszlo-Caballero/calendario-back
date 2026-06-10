import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ROLE_KEY } from './role.decorator';
import { Role } from '../../../generated/prisma/enums';
import { JwtAuthGuard, JwtRequiredGuard } from '../../auth/jwt-auth.guard';
import { RoleGuard } from '../../auth/role.guard';

interface AuthOptions {
  role?: Role[];
  jwtRequired?: boolean;
}

export const Auth = (options?: AuthOptions) => {
  const role = options?.role
  const jwtRequired = options?.jwtRequired ?? false;
  return applyDecorators(
    SetMetadata(ROLE_KEY, role),
    UseGuards(jwtRequired ? JwtRequiredGuard : JwtAuthGuard, RoleGuard),
  );
};
