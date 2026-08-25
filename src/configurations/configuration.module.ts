import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { ConfigurationRepository } from './configuration.repository';
import { ConfigValidatorService } from './config-validator.service';
@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService, ConfigurationRepository, ConfigValidatorService],
})
export class ConfigurationModule {}
