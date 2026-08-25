import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { UpsertConfigurationDto } from './dto/upsert-configuration.dto';
import { ok } from '../common/api-response';
@ApiTags('configurations')
@Controller('api/v1/configurations')
export class ConfigurationController {
  constructor(private service: ConfigurationService) {}
  @Post()
  @ApiOperation({ summary: 'Create or update a service configuration' })
  @ApiCreatedResponse({ description: 'Configuration persisted' })
  async upsert(@Body() dto: UpsertConfigurationDto) {
    const result = await this.service.upsert(dto);
    return ok(
      { bankCode: result.bankCode, serviceName: result.serviceName, config: result.config },
      { version: result.version, updatedAt: result.updatedAt.toISOString() },
    );
  }
  @Delete(':bankCode/:serviceName')
  @ApiOperation({ summary: 'Soft-delete a service configuration and preserve its audit history' })
  @ApiOkResponse({ description: 'Configuration deleted' })
  async remove(@Param('bankCode') bankCode: string, @Param('serviceName') serviceName: string) {
    const result = await this.service.remove(
      bankCode.trim().toUpperCase(),
      serviceName.trim().toLowerCase(),
    );
    return ok(result);
  }
  @Get(':bankCode/:serviceName')
  @ApiOperation({ summary: 'Fetch one service configuration' })
  async findOne(@Param('bankCode') bankCode: string, @Param('serviceName') serviceName: string) {
    const r = await this.service.findOne(
      bankCode.trim().toUpperCase(),
      serviceName.trim().toLowerCase(),
    );
    return ok(r.data, r.meta);
  }
  @Get(':bankCode')
  @ApiOperation({ summary: 'Fetch all active configurations for a bank' })
  async findAll(@Param('bankCode') bankCode: string) {
    return ok(await this.service.findAll(bankCode.trim().toUpperCase()));
  }
}
