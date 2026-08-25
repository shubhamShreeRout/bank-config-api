import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client?: Redis;
  private available = false;
  constructor(private config: ConfigService) {}
  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) return;
    try {
      this.client = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
      });
      this.client.on('error', () => {
        this.available = false;
      });
      await this.client.connect();
      this.available = true;
    } catch {
      this.logger.warn('Redis unavailable; cache disabled');
    }
  }
  async onModuleDestroy() {
    await this.client?.quit().catch(() => undefined);
  }
  get isAvailable() {
    return this.available;
  }
  async get<T>(key: string): Promise<T | undefined> {
    if (!this.available || !this.client) return;
    try {
      const v = await this.client.get(key);
      return v ? (JSON.parse(v) as T) : undefined;
    } catch {
      return;
    }
  }
  async set(key: string, value: unknown, seconds = 300) {
    if (!this.available || !this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', seconds);
    } catch {
      /* database remains primary */
    }
  }
  async del(key: string) {
    if (!this.available || !this.client) return;
    try {
      await this.client.del(key);
    } catch {
      /* database remains primary */
    }
  }
}
