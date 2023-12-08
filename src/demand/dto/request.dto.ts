import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly url: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly userId: number;

  @ApiProperty()
  @IsNotEmpty()
  readonly limit: number;
}
