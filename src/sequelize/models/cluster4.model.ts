import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
} from 'sequelize-typescript';
import { Property } from './property.model';

@Table
export class Cluster4 extends Model<Cluster4> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Property)
  @Column
  propertyId: number;

  @BelongsTo(() => Property)
  property: Property;

  @Column
  metroCategory: number;

  @Column
  yearCategory: number;

  @Column
  roomsCategory: number;

  @Column
  floorCategory: number;

  @Column
  renovationCategory: number;

  @Column(DataType.FLOAT)
  lat: number;

  @Column(DataType.FLOAT)
  lng: number;

  @Column
  pricePerMeter: number;
}
