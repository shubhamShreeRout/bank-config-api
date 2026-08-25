import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { BankStatus } from '@prisma/client';
export class CreateBankDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toUpperCase())
  @Matches(/^[A-Z0-9_-]{2,50}$/)
  bankCode!: string;
  @IsString() @IsNotEmpty() @Transform(({ value }) => value?.trim()) bankName!: string;
  @IsEnum(BankStatus) status: BankStatus = BankStatus.ACTIVE;
}
