import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CianDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly propertyId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly spacem2: bigint;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly m2price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly link: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  readonly dateposted: Date;
}
