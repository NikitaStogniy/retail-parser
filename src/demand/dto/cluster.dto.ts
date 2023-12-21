import { IsNumber } from 'class-validator';

export class ClusterDto {
  @IsNumber()
  propertyId: number;

  @IsNumber()
  metroCategory: number;

  @IsNumber()
  yearCategory: number;

  @IsNumber()
  roomsCategory: number;

  @IsNumber()
  floorCategory: number;

  @IsNumber()
  renovationCategory: number;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  pricePerMeter: number;
}
