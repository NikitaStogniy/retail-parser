import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class ParserDto {
  @IsNotEmpty()
  @IsString()
  readonly price: number;

  @IsNotEmpty()
  @IsString()
  readonly propertyId: string;

  @IsNotEmpty()
  @IsString()
  readonly spacem2: bigint;

  @IsNotEmpty()
  @IsString()
  readonly m2price: number;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly link: string;

  @IsNotEmpty()
  @IsDate()
  readonly dateposted: Date;
}
