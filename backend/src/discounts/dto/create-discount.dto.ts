import { IsString, IsNotEmpty, IsNumber, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
