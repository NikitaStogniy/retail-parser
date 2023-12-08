import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Plan extends Model {
  @Column
  name: string;

  @Column
  price: number;

  @Column
  description: string;

  @Column
  period: number;

  @Column
  createdAt: Date;

  @Column
  updatedAt: Date;

  @Column
  requestsCount: number;
}
