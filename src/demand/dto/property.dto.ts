import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PropertyDto {
  @ApiProperty()
  @IsNumber()
  propid: number;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNumber()
  requestId: number;
}
