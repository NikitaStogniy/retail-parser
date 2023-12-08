import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';

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

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
