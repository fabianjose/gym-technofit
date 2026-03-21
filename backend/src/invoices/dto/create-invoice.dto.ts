import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInvoiceDto {
  @IsNumber()
  @IsNotEmpty()
  memberId: number;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value || undefined)
  discountId?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  amountTotal: number;
}
