import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService, UsersService } from '@ThLOG/auth/services';
import { CurrentUser, Public } from '@ThLOG/auth/decorators';
import { JwtAuthGuard, LocalAuthGuard } from '@ThLOG/auth/guards';
import { HttpExceptionFilter } from '@ThLOG/common/filters';
import { RefreshTokenDto, RegisterDto } from '@ThLOG/auth/dto';
import { JwtPayload } from '@ThLOG/auth/utils';
import { RefreshTokenCookieInterceptor } from '@ThLOG/auth/interceptors';
import { Roles } from '@ThLOG/auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiController } from '@ThLOG/common/decorators';
import { UserRole } from '@ThLOG/auth/entities';
import { RolesGuard } from '@ThLOG/auth/guards/roles.guard';

@ApiController('auth', 'auth')
@Controller('auth')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UseInterceptors(RefreshTokenCookieInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Успешный вход в систему',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'user@example.com' },
                name: { type: 'string', example: 'Иван Иванов' },
                role: { type: 'string', example: 'user' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @UseInterceptors(RefreshTokenCookieInterceptor)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'user@example.com' },
                name: { type: 'string', example: 'Иван Иванов' },
                role: { type: 'string', example: 'user' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @UseInterceptors(RefreshTokenCookieInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов доступа' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Токены успешно обновлены',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Недействительный или истекший refresh токен',
  })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      // Декодируем refresh token для получения userId и username
      const decoded = (await this.authService.verifyToken(
        refreshTokenDto.refreshToken,
      )) as JwtPayload;

      // Обновляем токены
      return this.authService.refreshTokens(
        decoded.sub,
        refreshTokenDto.refreshToken,
      );
    } catch (error) {
      // Ошибки будут обработаны глобальным фильтром исключений
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiOkResponse({
    description: 'Успешный выход из системы',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Выход выполнен успешно' },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  async logout(@CurrentUser() user) {
    return this.authService.logout(user.id);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  @ApiOkResponse({
    description: 'Профиль пользователя',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Иван Иванов' },
            role: { type: 'string', example: 'user' },
            createdAt: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
          },
        },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  async getProfile(@CurrentUser() user) {
    const userEntity = await this.usersService.findOne(user.name, {
      select: { password: false },
    });
    return {
      success: true,
      data: userEntity,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('users/:id/role')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Изменение роли пользователя (только для администраторов)',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleCode: { type: 'string', example: 'moderator' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Роль пользователя успешно изменена',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Иван Иванов' },
            role: { type: 'string', example: 'moderator' },
          },
        },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для выполнения операции',
  })
  async changeUserRole(
    @Param('id') id: string,
    @Body('roleCode') roleCode: UserRole,
    @CurrentUser() currentUser,
  ) {
    // Проверка, чтобы админ не мог изменить свою роль
    if (currentUser.id === +id) {
      throw new ForbiddenException('Невозможно изменить свою собственную роль');
    }

    const updatedUser = await this.usersService.changeRole(id, roleCode);

    return {
      success: true,
      data: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        username: updatedUser?.username,
        role: updatedUser?.role,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Проверка валидности токена' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Информация о токене',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
            payload: {
              type: 'object',
              properties: {
                sub: { type: 'number', example: 1 },
                email: { type: 'string', example: 'user@example.com' },
                role: { type: 'string', example: 'user' },
                iat: { type: 'number', example: 1623938931 },
                exp: { type: 'number', example: 1623939831 },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Недействительный токен' })
  async verifyToken(@Body('token') token: string) {
    const decoded = await this.authService.verifyToken(token);
    return {
      success: true,
      data: {
        valid: true,
        payload: decoded,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
