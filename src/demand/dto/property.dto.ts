import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PropertyDto {
  @ApiProperty()
  @IsNumber()
  propid: number;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsString()
  historicalDistrict: string;

  @ApiProperty()
  @IsString()
  metro: string;

  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  houseNumber: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  footMetro: number;

  @ApiProperty()
  @IsNumber()
  carMetro: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsDate()
  dateposted: Date;

  @ApiProperty()
  @IsNumber()
  ownerID: number;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  housingType: string;

  @ApiProperty()
  @IsNumber()
  totalArea: number;

  @ApiProperty()
  @IsNumber()
  livingArea: number;

  @ApiProperty()
  @IsNumber()
  kitchenArea: number;

  @ApiProperty()
  @IsNumber()
  ceilingHeight: number;

  @ApiProperty()
  @IsString()
  bathroom: string;

  @ApiProperty()
  @IsBoolean()
  balcony: boolean;

  @ApiProperty()
  @IsString()
  viewFromWindows: string;

  @ApiProperty()
  @IsString()
  renovation: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsString()
  buildingSeries: string;

  @ApiProperty()
  @IsNumber()
  elevatorCount: number;

  @ApiProperty()
  @IsString()
  buildingType: string;

  @ApiProperty()
  @IsString()
  overlapType: string;

  @ApiProperty()
  @IsString()
  parking: string;

  @ApiProperty()
  @IsNumber()
  entrances: number;

  @ApiProperty()
  @IsString()
  heating: string;

  @ApiProperty()
  @IsBoolean()
  emergency: boolean;

  @ApiProperty()
  @IsNumber()
  floor: number;

  @ApiProperty()
  @IsNumber()
  totalFloors: number;

  @ApiProperty()
  @IsNumber()
  cianPrice: number;

  @ApiProperty()
  @IsNumber()
  rooms: number;

  @ApiProperty()
  @IsNumber()
  pricePerMeter: number;

  @ApiProperty()
  @IsBoolean()
  isByOwner: boolean;

  @ApiProperty()
  @IsDate()
  updated: Date;

  @ApiProperty()
  @IsDate()
  scrapedAt: Date;

  @ApiProperty()
  @IsString()
  serviceName: string;
}
