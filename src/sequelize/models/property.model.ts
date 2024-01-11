import {
  Table,
  Column,
  Model,
  AutoIncrement,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

@Table
export class Property extends Model<Property> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  propid: number;

  @Column
  link: string;

  @Column
  address: string;

  @Column
  city: string;

  @Column
  district: string;

  @Column
  historicalDistrict: string;

  @Column
  metro: string;

  @Column
  street: string;

  @Column
  houseNumber: string;

  @Column
  description: string;

  @Column
  footMetro: number;

  @Column
  carMetro: number;

  @Column
  price: number;

  @Column
  dateposted: Date;

  @Column
  ownerID: number;

  @Column
  phone: string;

  @Column
  housingType: string;

  @Column
  totalArea: number;

  @Column
  livingArea: number;

  @Column
  kitchenArea: number;

  @Column
  ceilingHeight: number;

  @Column
  bathroom: string;

  @Column
  balcony: boolean;

  @Column
  viewFromWindows: string;

  @Column
  renovation: string;

  @Column
  year: number;

  @Column
  buildingSeries: string;

  @Column
  elevatorCount: number;

  @Column
  buildingType: string;

  @Column
  overlapType: string;

  @Column
  parking: string;

  @Column
  entrances: number;

  @Column
  heating: string;

  @Column
  emergency: boolean;

  @Column
  floor: number;

  @Column
  totalFloors: number;

  @Column
  cianPrice: number;

  @Column
  rooms: number;

  @Column
  pricePerMeter: number;

  @Column
  isByOwner: boolean;

  @Column
  updated: Date;

  @Column
  scrapedAt: Date;

  @Column
  serviceName: string;

  @Column(DataType.FLOAT)
  lat: number;

  @Column(DataType.FLOAT)
  lng: number;
}
