import { IsNumber, IsString } from 'class-validator';

export class PropertyDto {
  @IsNumber()
  propid: number;

  @IsString()
  link: string;

  @IsString()
  phone: string;

  @IsNumber()
  requestId: number;
}
