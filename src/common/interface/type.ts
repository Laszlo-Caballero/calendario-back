import { Request } from 'express';

export interface JwtPayload {
  idEmpleado: number;
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
