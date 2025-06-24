import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TapService } from './tap.service';
import { JwtAuthGuard } from '@ThLOG/auth/guards';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@ThLOG/auth/entities';
import { RolesGuard } from '@ThLOG/auth/guards/roles.guard';

@ApiTags('game')
@Controller('game')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GameController {
  constructor(private readonly tapService: TapService) {}

  @Post('rounds/:roundId/tap')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SURVIVOR, UserRole.NIKITA, UserRole.ADMIN)
  @ApiOperation({ summary: 'Тап по гусю в раунде' })
  @ApiResponse({ status: 200, description: 'Тап успешно обработан' })
  @ApiResponse({
    status: 400,
    description: 'Раунд неактивен или другая ошибка',
  })
  async tapGoose(
    @Param('roundId') roundId: string,
    @Request() req: any,
  ): Promise<boolean> {
    return await this.tapService.recordTap(req.user.id, roundId);
  }

  @Get('rounds/:roundId/my-stats')
  @ApiOperation({ summary: 'Получить свою статистику в раунде' })
  @ApiResponse({ status: 200, description: 'Статистика пользователя' })
  async getMyStats(
    @Param('roundId') roundId: string,
    @Request() req: any,
  ): Promise<{ taps: number; score: number }> {
    return await this.tapService.getUserStats(req.user.id, roundId);
  }

  @Get('rounds/:roundId/stats')
  @ApiOperation({ summary: 'Получить статистику раунда' })
  @ApiResponse({ status: 200, description: 'Статистика раунда' })
  getRoundStats(@Param('roundId') roundId: string): Promise<{
    totalTaps: number;
    totalScore: number;
    isComplete: boolean;
  }> {
    return this.tapService.getRoundStats(roundId);
  }

  @Get('rounds/:roundId/leaderboard')
  @ApiOperation({ summary: 'Получить таблицу лидеров раунда' })
  @ApiResponse({ status: 200, description: 'Таблица лидеров' })
  async getLeaderboard(@Param('roundId') roundId: string): Promise<
    Array<{
      userId: string;
      username: string;
      taps: number;
      score: number;
    }>
  > {
    return await this.tapService.getRoundLeaderboard(roundId);
  }

  @Get('rounds/:roundId/winner')
  @ApiOperation({ summary: 'Получить победителя раунда' })
  @ApiResponse({ status: 200, description: 'Победитель раунда' })
  async getRoundWinner(@Param('roundId') roundId: string): Promise<{
    userId: string;
    username: string;
    score: number;
  } | null> {
    return await this.tapService.getRoundWinner(roundId);
  }
}
