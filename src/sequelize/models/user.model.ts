import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Plan } from './plan.model';

@Table
export class User extends Model {
  @Column
  name: string;

  @Column
  email: string;

  @Column
  password: string;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;

  @Column
  access_token?: string;

  @ForeignKey(() => Plan)
  @Column
  PlanId: number;

  @BelongsTo(() => Plan)
  Plan: Plan;
}
