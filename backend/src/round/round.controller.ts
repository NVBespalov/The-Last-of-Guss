import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateRoundDto } from './dto/create-round.dto';
import {
  RoundResponseDto,
  RoundListResponseDto,
} from './dto/round-response.dto';
import { JwtAuthGuard } from '@ThLOG/auth/guards';

import { Roles } from '../auth/decorators/roles.decorator';
import { RoundsService } from '@ThLOG/round/round.service';
import { UserRole } from '@ThLOG/auth/entities';
import { RolesGuard } from '@ThLOG/auth/guards/roles.guard';

@ApiTags('rounds')
@Controller('rounds')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создать новый раунд' })
  @ApiResponse({
    status: 201,
    description: 'Раунд успешно создан',
    type: RoundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или уже существует активный раунд',
  })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав доступа',
  })
  async createRound(
    @Body() createRoundDto: CreateRoundDto,
  ): Promise<RoundResponseDto> {
    return this.roundsService.createRound(createRoundDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех раундов' })
  @ApiResponse({
    status: 200,
    description: 'Список раундов',
    type: [RoundListResponseDto],
  })
  async getRounds(): Promise<RoundListResponseDto[]> {
    return this.roundsService.getRounds();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить информацию о раунде' })
  @ApiResponse({
    status: 200,
    description: 'Информация о раунде',
    type: RoundResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Раунд не найден',
  })
  async getRoundById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<RoundResponseDto> {
    return this.roundsService.getRoundById(id, req.user);
  }
}
