import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class ParserDto {
  @IsNotEmpty()
  @IsString()
  readonly propertyId: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly link: string;
}
