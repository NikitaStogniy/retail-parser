import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly propertyId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly link: string;
}
