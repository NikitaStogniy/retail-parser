import { IsDate, IsLatitude, IsLongitude, IsNumber } from 'class-validator';

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

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;

  @IsNumber()
  pricePerMeter: number;

  @IsDate()
  dateposted: Date;
}
