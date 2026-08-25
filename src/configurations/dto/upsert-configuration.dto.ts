import { Transform } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString, Matches } from 'class-validator';
export class UpsertConfigurationDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toUpperCase())
  @Matches(/^[A-Z0-9_-]{2,50}$/)
  bankCode!: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  serviceName!: string;
  @IsObject()
  @IsNotEmpty()
  config!: Record<string, unknown>;
}
