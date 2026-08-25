import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { UpsertConfigurationDto } from './dto/upsert-configuration.dto';
import { ok } from '../common/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, JwtUser } from '../auth/auth.types';
import { Request } from 'express';
@ApiTags('configurations')
@Controller('api/v1/configurations')
export class ConfigurationController {
  constructor(private service: ConfigurationService) {}
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a service configuration' })
  @ApiCreatedResponse({ description: 'Configuration persisted' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONFIG_MANAGER)
  async upsert(@Body() dto: UpsertConfigurationDto, @Req() req: Request & { user: JwtUser }) {
    const result = await this.service.upsert(dto, req.user.sub);
    return ok(
      { bankCode: result.bankCode, serviceName: result.serviceName, config: result.config },
      { version: result.version, updatedAt: result.updatedAt.toISOString() },
    );
  }
  @Delete(':bankCode/:serviceName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a service configuration and preserve its audit history' })
  @ApiOkResponse({ description: 'Configuration deleted' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(
    @Param('bankCode') bankCode: string,
    @Param('serviceName') serviceName: string,
    @Req() req: Request & { user: JwtUser },
  ) {
    const result = await this.service.remove(
      bankCode.trim().toUpperCase(),
      serviceName.trim().toLowerCase(),
      req.user.sub,
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
