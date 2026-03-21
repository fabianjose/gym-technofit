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

  @IsString()
  @IsOptional()
  logoBase64?: string;

  @IsString()
  @IsOptional()
  reminderTime?: string;

  @IsString()
  @IsOptional()
  smtpHost?: string;

  @IsOptional()
  smtpPort?: number;

  @IsString()
  @IsOptional()
  smtpUser?: string;

  @IsString()
  @IsOptional()
  smtpPass?: string;

  @IsString()
  @IsOptional()
  smtpFrom?: string;
}
