import { Request } from 'express';
import { Role } from '../../generated/prisma/enums';

export interface JwtPayload {
  idUser: number;
  role: Role;
}

export interface RequestUser extends Request {
  user: JwtPayload;
}
export interface ResponseApi<T> {
  message: string;
  body: T;
  status: number;
  token?: string;
  errors?: string[];
}

export interface ResponseExtras<T> {
  data: T;
  token?: string;
}
