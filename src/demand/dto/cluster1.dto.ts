import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Cluster1Dto {
  @ApiProperty()
  @IsNumber()
  propertyId: number;

  @ApiProperty()
  @IsNumber()
  metroCategory: number;

  @ApiProperty()
  @IsNumber()
  yearCategory: number;

  @ApiProperty()
  @IsNumber()
  roomsCategory: number;

  @ApiProperty()
  @IsNumber()
  floorCategory: number;

  @ApiProperty()
  @IsNumber()
  renovationCategory: number;
}
