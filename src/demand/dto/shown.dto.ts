import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class ShownDto {
  @IsNotEmpty()
  @IsNumber()
  propertyId: number;

  @IsNotEmpty()
  @IsDate()
  date: Date;
}
