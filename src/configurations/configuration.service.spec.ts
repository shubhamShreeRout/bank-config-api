import { NotFoundException } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
describe('ConfigurationService', () => {
  const repo: any = {
    findBank: jest.fn(),
    upsert: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    softDelete: jest.fn(),
  };
  const validator: any = { validate: jest.fn() };
  const cache: any = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
  let service: ConfigurationService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigurationService(repo, validator, cache);
  });
  it('upserts, versions, audits through repository, and invalidates cache', async () => {
    repo.findBank.mockResolvedValue({ id: 'b1', bankCode: 'BANK001' });
    repo.upsert.mockResolvedValue({
      serviceName: 'top-nav',
      config: { theme: {} },
      version: 2,
      updatedAt: new Date(),
    });
    const r = await service.upsert(
      { bankCode: 'BANK001', serviceName: 'top-nav', config: { theme: {} } },
      'admin',
    );
    expect(r.version).toBe(2);
    expect(cache.del).toHaveBeenCalledWith('config:BANK001:top-nav');
  });
  it('returns cache hit without database lookup', async () => {
    cache.get.mockResolvedValue({ data: { bankCode: 'BANK001' }, meta: { version: 1 } });
    expect(await service.findOne('BANK001', 'login')).toEqual({
      data: { bankCode: 'BANK001' },
      meta: { version: 1 },
    });
    expect(repo.findBank).not.toHaveBeenCalled();
  });
  it('throws BANK_NOT_FOUND', async () => {
    cache.get.mockResolvedValue(undefined);
    repo.findBank.mockResolvedValue(null);
    await expect(service.findOne('BANK404', 'login')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('soft-deletes, records audit through repository, and invalidates cache', async () => {
    repo.findBank.mockResolvedValue({ id: 'b1', bankCode: 'BANK001' });
    repo.softDelete.mockResolvedValue({ serviceName: 'top-nav', version: 3 });
    await expect(service.remove('BANK001', 'top-nav', 'admin')).resolves.toEqual({
      bankCode: 'BANK001',
      serviceName: 'top-nav',
      version: 3,
    });
    expect(cache.del).toHaveBeenCalledWith('config:BANK001:top-nav');
  });
});
