import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'john_doe',
    minLength: 3,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Имя пользователя обязательно' })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @Length(3, 20, {
    message: 'Имя пользователя должно содержать от 3 до 20 символов',
  })
  username: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'Qwert1!',
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString({ message: 'Пароль должен быть строкой' })
  password: string;
}
