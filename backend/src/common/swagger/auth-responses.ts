import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Иван Иванов' })
  name: string;

  @ApiProperty({ example: 'user' })
  role: string;
}
export class LoginResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
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
      user: { type: UserResponse },
    },
  })
  data: Record<string, any>;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z' })
  timestamp: string;
}

export class TokensResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
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
  })
  data: Record<string, any>;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z' })
  timestamp: string;
}

export class ProfileResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
      userName: { type: 'string', example: 'Иван Иванов' },
      role: { type: 'string', example: 'user' },
      createdAt: { type: 'string', example: '2025-06-18T12:00:00.000Z' },
    },
  })
  data: Record<string, any>;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z' })
  timestamp: string;
}

export class MessageResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Операция выполнена успешно' })
  message: string;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z' })
  timestamp: string;
}

export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      type: { type: 'string', example: 'UnauthorizedException' },
      code: { type: 'string', example: '401' },
      message: { type: 'string', example: 'Unauthorized' },
      details: {
        type: 'object',
        nullable: true,
        additionalProperties: true,
        example: { reason: 'Token expired' },
      },
    },
  })
  error: Record<string, any>;

  @ApiProperty({ example: '2025-06-18T12:00:00.000Z' })
  timestamp: string;
}
