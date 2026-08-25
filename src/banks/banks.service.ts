import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBankDto) {
    try {
      return await this.prisma.bank.create({ data: dto });
    } catch (error: any) {
      if (error.code === 'P2002')
        throw new ConflictException({
          code: 'DUPLICATE_BANK',
          message: 'Bank code already exists',
        });
      throw error;
    }
  }
}
