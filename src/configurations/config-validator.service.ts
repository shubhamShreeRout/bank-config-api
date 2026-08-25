import { BadRequestException, Injectable } from '@nestjs/common';
import { isSupportedService } from './supported-services';
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const requireObject = (v: unknown, field: string) => {
  if (!isObject(v))
    throw new BadRequestException({
      code: 'INVALID_CONFIGURATION',
      message: `${field} must be an object`,
    });
};
@Injectable()
export class ConfigValidatorService {
  validate(service: string, config: Record<string, unknown>) {
    if (!isSupportedService(service))
      throw new BadRequestException({
        code: 'INVALID_SERVICE',
        message: `Unsupported service: ${service}`,
      });
    if (['login', 'dashboard', 'top-nav', 'left-nav'].includes(service)) {
      requireObject(config.theme, 'config.theme');
    }
    if (
      service === 'top-nav' &&
      config.imageUrl !== undefined &&
      typeof config.imageUrl !== 'string'
    )
      throw new BadRequestException({
        code: 'INVALID_CONFIGURATION',
        message: 'config.imageUrl must be a string',
      });
    if (service === 'login') {
      for (const field of ['logoUrl', 'backgroundImageUrl', 'authenticationType'])
        if (config[field] !== undefined && typeof config[field] !== 'string')
          throw new BadRequestException({
            code: 'INVALID_CONFIGURATION',
            message: `config.${field} must be a string`,
          });
      if (config.showForgotPassword !== undefined && typeof config.showForgotPassword !== 'boolean')
        throw new BadRequestException({
          code: 'INVALID_CONFIGURATION',
          message: 'config.showForgotPassword must be a boolean',
        });
    }
    if (service === 'device-delivery-status') {
      if (typeof config.enabled !== 'boolean' || !Array.isArray(config.statuses))
        throw new BadRequestException({
          code: 'INVALID_CONFIGURATION',
          message: 'enabled (boolean) and statuses (array) are required',
        });
      for (const item of config.statuses) {
        if (
          !isObject(item) ||
          typeof item.code !== 'string' ||
          typeof item.label !== 'string' ||
          typeof item.displayOrder !== 'number'
        )
          throw new BadRequestException({
            code: 'INVALID_CONFIGURATION',
            message: 'Each status needs code, label, and displayOrder',
          });
      }
    }
    if (
      service === 'device-mapping' &&
      (typeof config.enabled !== 'boolean' ||
        !Array.isArray(config.mappingFields) ||
        !config.mappingFields.every((x) => typeof x === 'string'))
    )
      throw new BadRequestException({
        code: 'INVALID_CONFIGURATION',
        message: 'enabled (boolean) and mappingFields (string array) are required',
      });
  }
}
