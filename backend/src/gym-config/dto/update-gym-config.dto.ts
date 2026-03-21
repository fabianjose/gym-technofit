import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateGymConfigDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ownerPhones?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ownerEmails?: string[];

  @IsString()
  @IsOptional()
  gymName?: string;

  @IsString()
  @IsOptional()
  nit?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
