import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/auth.types';
import { ok } from '../common/api-response';
@ApiTags('banks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/banks')
export class BanksController {
  constructor(private service: BanksService) {}
  @Post() @Roles(Role.ADMIN) async create(@Body() dto: CreateBankDto) {
    return ok(await this.service.create(dto));
  }
}
