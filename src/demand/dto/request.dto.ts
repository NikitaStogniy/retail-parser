import { IsString, IsNotEmpty } from 'class-validator';

export class RequestDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly url: string;

  @IsNotEmpty()
  readonly limit: number;
}
