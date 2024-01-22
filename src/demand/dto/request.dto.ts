import { IsString, IsNotEmpty } from 'class-validator';

export class RequestDto {

  @IsNotEmpty()
  @IsString()
  readonly url: string;

}
