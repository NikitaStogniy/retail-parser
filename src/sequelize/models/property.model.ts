import {
  Table,
  Column,
  Model,
  AutoIncrement,
  PrimaryKey,
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
  phone: string;

  @Column
  requestId: number;
}
