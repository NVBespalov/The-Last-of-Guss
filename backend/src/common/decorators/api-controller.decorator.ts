import { applyDecorators, Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ApiController(path: string, name: string) {
  return applyDecorators(Controller(path), ApiTags(name));
}
