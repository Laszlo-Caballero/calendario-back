import { SetMetadata } from '@nestjs/common';
import { Role as RoleEnum } from '../../../generated/prisma/enums';

export const ROLE_KEY = 'role';

export const Role = (roles: RoleEnum[]) => SetMetadata(ROLE_KEY, roles);
