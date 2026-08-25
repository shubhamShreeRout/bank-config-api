import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { ok } from '../common/api-response';
@ApiTags('banks')
@Controller('api/v1/banks')
export class BanksController {
  constructor(private service: BanksService) {}
  @Post() async create(@Body() dto: CreateBankDto) {
    return ok(await this.service.create(dto));
  }
}
