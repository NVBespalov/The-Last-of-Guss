import { IsOptional, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для создания нового раунда
 */
export class CreateRoundDto {
  @ApiProperty({
    description: 'Время начала раунда в формате ISO',
    required: false,
    example: '2025-06-20T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'Продолжительность раунда в секундах',
    required: false,
    minimum: 1,
    example: 3600,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration?: number;

  @ApiProperty({
    description: 'Время перерыва между раундами в секундах',
    required: false,
    minimum: 0,
    example: 300,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  cooldown?: number;
}
