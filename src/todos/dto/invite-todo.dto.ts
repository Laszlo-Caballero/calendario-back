import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class InviteTodoDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  todosId: number;
}
