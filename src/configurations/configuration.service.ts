import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheService } from '../cache/cache.service';
import { UpsertConfigurationDto } from './dto/upsert-configuration.dto';
import { ConfigurationRepository } from './configuration.repository';
import { ConfigValidatorService } from './config-validator.service';
@Injectable()
export class ConfigurationService {
  constructor(
    private repo: ConfigurationRepository,
    private validator: ConfigValidatorService,
    private cache: CacheService,
  ) {}
  private key(bank: string, service: string) {
    return `config:${bank}:${service}`;
  }
  async upsert(dto: UpsertConfigurationDto, changedBy?: string) {
    this.validator.validate(dto.serviceName, dto.config);
    const bank = await this.repo.findBank(dto.bankCode);
    if (!bank) throw new NotFoundException({ code: 'BANK_NOT_FOUND', message: 'Bank not found' });
    const item = await this.repo.upsert(
      bank.id,
      dto.serviceName,
      dto.config as Prisma.InputJsonValue,
      changedBy,
    );
    await this.cache.del(this.key(dto.bankCode, dto.serviceName));
    return {
      bankCode: bank.bankCode,
      serviceName: item.serviceName,
      config: item.config,
      version: item.version,
      updatedAt: item.updatedAt,
    };
  }
  async findOne(bankCode: string, serviceName: string) {
    const cached = await this.cache.get<{ data: unknown; meta: Record<string, unknown> }>(
      this.key(bankCode, serviceName),
    );
    if (cached) return cached;
    const bank = await this.repo.findBank(bankCode);
    if (!bank) throw new NotFoundException({ code: 'BANK_NOT_FOUND', message: 'Bank not found' });
    const item = await this.repo.findOne(bank.id, serviceName);
    if (!item || item.status !== 'ACTIVE')
      throw new NotFoundException({
        code: 'CONFIGURATION_NOT_FOUND',
        message: 'Configuration not found',
      });
    const result = {
      data: { bankCode: bank.bankCode, serviceName: item.serviceName, config: item.config },
      meta: { version: item.version, updatedAt: item.updatedAt.toISOString() },
    };
    await this.cache.set(this.key(bankCode, serviceName), result);
    return result;
  }
  async findAll(bankCode: string) {
    const bank = await this.repo.findBank(bankCode);
    if (!bank) throw new NotFoundException({ code: 'BANK_NOT_FOUND', message: 'Bank not found' });
    const configs = await this.repo.findAll(bank.id);
    return {
      bankCode: bank.bankCode,
      services: Object.fromEntries(configs.map((c) => [c.serviceName, c.config])),
    };
  }
  async remove(bankCode: string, serviceName: string, changedBy?: string) {
    const bank = await this.repo.findBank(bankCode);
    if (!bank) throw new NotFoundException({ code: 'BANK_NOT_FOUND', message: 'Bank not found' });
    const item = await this.repo.softDelete(bank.id, serviceName, changedBy);
    if (!item) {
      throw new NotFoundException({
        code: 'CONFIGURATION_NOT_FOUND',
        message: 'Configuration not found',
      });
    }
    await this.cache.del(this.key(bankCode, serviceName));
    return { bankCode: bank.bankCode, serviceName: item.serviceName, version: item.version };
  }
}
