import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
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
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Имя пользователя может содержать только буквы, цифры и знак подчеркивания',
  })
  username: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'Qwert1!',
    // minLength: 6,
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString({ message: 'Пароль должен быть строкой' })
  // @Length(6, 100, { message: 'Пароль должен содержать не менее 6 символов' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
  //     message: 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру',
  // })
  password: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'john@example.com',
  })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;
}
