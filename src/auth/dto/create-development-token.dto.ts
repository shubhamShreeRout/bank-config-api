import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../auth.types';

export class CreateDevelopmentTokenDto {
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles!: Role[];
}
