import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Plan } from './plan.model';

@Table
export class UserPlan extends Model<UserPlan> {
  @ForeignKey(() => User)
  @Column
  UserId: number;

  @BelongsTo(() => User)
  User: User;

  @ForeignKey(() => Plan)
  @Column
  PlanId: number;

  @BelongsTo(() => Plan)
  Plan: Plan;

  @Column
  expiryDate: Date;

  @Column
  usage: number;

  @Column
  limit: number;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;
}
