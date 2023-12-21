import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UsersDto {
  @IsNotEmpty()
  @IsString()
  uid: string;
}
