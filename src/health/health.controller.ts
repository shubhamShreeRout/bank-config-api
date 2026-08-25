import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ok } from '../common/api-response';
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}
  @Get() async health() {
    let postgres = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      postgres = 'down';
    }
    const data = { api: 'up', postgres, redis: this.cache.isAvailable ? 'up' : 'unavailable' };
    if (postgres === 'down')
      throw new ServiceUnavailableException({
        code: 'DATABASE_UNAVAILABLE',
        message: 'PostgreSQL unavailable',
      });
    return ok(data);
  }
}
