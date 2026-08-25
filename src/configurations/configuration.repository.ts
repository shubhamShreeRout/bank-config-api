import { Injectable } from '@nestjs/common';
import { Prisma, HistoryAction } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
@Injectable()
export class ConfigurationRepository {
  constructor(private prisma: PrismaService) {}
  findBank(code: string) {
    return this.prisma.bank.findUnique({ where: { bankCode: code } });
  }
  findOne(bankId: string, serviceName: string) {
    return this.prisma.serviceConfiguration.findUnique({
      where: { bankId_serviceName: { bankId, serviceName } },
    });
  }
  findAll(bankId: string) {
    return this.prisma.serviceConfiguration.findMany({ where: { bankId, status: 'ACTIVE' } });
  }
  async upsert(
    bankId: string,
    serviceName: string,
    config: Prisma.InputJsonValue,
    changedBy?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.serviceConfiguration.findUnique({
        where: { bankId_serviceName: { bankId, serviceName } },
      });
      const item = previous
        ? await tx.serviceConfiguration.update({
            where: { id: previous.id },
            data: { config, status: 'ACTIVE', version: { increment: 1 } },
          })
        : await tx.serviceConfiguration.create({ data: { bankId, serviceName, config } });
      await tx.configurationHistory.create({
        data: {
          configurationId: item.id,
          version: item.version,
          action: previous ? HistoryAction.UPDATE : HistoryAction.CREATE,
          previousConfig: previous?.config ?? undefined,
          newConfig: config,
          changedBy,
        },
      });
      return item;
    });
  }
  async softDelete(bankId: string, serviceName: string, changedBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.serviceConfiguration.findUnique({
        where: { bankId_serviceName: { bankId, serviceName } },
      });
      if (!previous || previous.status !== 'ACTIVE') return null;
      const item = await tx.serviceConfiguration.update({
        where: { id: previous.id },
        data: { status: 'INACTIVE', version: { increment: 1 } },
      });
      await tx.configurationHistory.create({
        data: {
          configurationId: item.id,
          version: item.version,
          action: HistoryAction.DELETE,
          previousConfig: previous.config ?? undefined,
          changedBy,
        },
      });
      return item;
    });
  }
}
