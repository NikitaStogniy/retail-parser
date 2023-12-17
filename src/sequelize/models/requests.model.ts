import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

@Table
export class Requests extends Model {
  @Column
  name: string;

  @Column
  url: string;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;

  @Column
  status: string;

}
