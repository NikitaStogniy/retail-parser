import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class PropertyDto {
  @IsNumber()
  propid: number;

  @IsString()
  link: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsString()
  historicalDistrict: string;

  @IsString()
  metro: string;

  @IsString()
  street: string;

  @IsString()
  houseNumber: string;

  @IsString()
  description: string;

  @IsNumber()
  footMetro: number;

  @IsNumber()
  carMetro: number;

  @IsNumber()
  price: number;

  @IsDate()
  dateposted: Date;

  @IsNumber()
  ownerID: number;

  @IsString()
  phone: string;

  @IsString()
  housingType: string;

  @IsNumber()
  totalArea: number;

  @IsNumber()
  livingArea: number;

  @IsNumber()
  kitchenArea: number;

  @IsNumber()
  ceilingHeight: number;

  @IsString()
  bathroom: string;

  @IsBoolean()
  balcony: boolean;

  @IsString()
  viewFromWindows: string;

  @IsString()
  renovation: string;

  @IsNumber()
  year: number;

  @IsString()
  buildingSeries: string;

  @IsNumber()
  elevatorCount: number;

  @IsString()
  buildingType: string;

  @IsString()
  overlapType: string;

  @IsString()
  parking: string;

  @IsNumber()
  entrances: number;

  @IsString()
  heating: string;

  @IsBoolean()
  emergency: boolean;

  @IsNumber()
  floor: number;

  @IsNumber()
  totalFloors: number;

  @IsNumber()
  cianPrice: number;

  @IsNumber()
  rooms: number;

  @IsNumber()
  pricePerMeter: number;

  @IsBoolean()
  isByOwner: boolean;

  @IsDate()
  updated: Date;

  @IsDate()
  scrapedAt: Date;

  @IsString()
  serviceName: string;
}
