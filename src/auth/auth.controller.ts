import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok } from '../common/api-response';
import { AuthService } from './auth.service';
import { CreateDevelopmentTokenDto } from './dto/create-development-token.dto';

@ApiTags('authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('development-token')
  @ApiOperation({ summary: 'Create a local-development JWT; disabled in production' })
  async createDevelopmentToken(@Body() dto: CreateDevelopmentTokenDto) {
    return ok(await this.authService.createDevelopmentToken(dto));
  }
}
