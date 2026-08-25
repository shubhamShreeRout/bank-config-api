import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateDevelopmentTokenDto } from './dto/create-development-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async createDevelopmentToken(dto: CreateDevelopmentTokenDto) {
    const enabled = this.config.get<boolean>('DEV_TOKEN_ISSUER_ENABLED', false);
    if (this.config.get<string>('NODE_ENV') === 'production' || !enabled) {
      throw new NotFoundException();
    }

    const accessToken = await this.jwt.signAsync({ sub: dto.subject, roles: dto.roles });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '1h'),
    };
  }
}
