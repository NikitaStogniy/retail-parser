import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
} from 'sequelize-typescript';
import { Property } from './property.model';

@Table
export class Cluster1 extends Model<Cluster1> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Property)
  @Column
  propertyId: number;

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
}
