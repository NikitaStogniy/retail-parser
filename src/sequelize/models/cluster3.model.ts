import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Property } from './property.model';

@Table
export class Cluster3 extends Model<Cluster3> {
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

  @Column
  lat: number;

  @Column
  lng: number;

  @Column
  pricePerMeter: number;
}
