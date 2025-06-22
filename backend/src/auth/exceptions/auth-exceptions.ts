import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor(username: string) {
    super(
      `Пользователь с именем ${username} уже существует`,
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Неверное имя пользователя или пароль', HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundException extends HttpException {
  constructor(username: string) {
    super(`Пользователь с именем ${username} не найден`, HttpStatus.NOT_FOUND);
  }
}

export class AccountDeactivatedException extends HttpException {
  constructor() {
    super('Данный аккаунт деактивирован', HttpStatus.FORBIDDEN);
  }
}

export class TokenExpiredException extends HttpException {
  constructor() {
    super('Токен авторизации истек', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends HttpException {
  constructor() {
    super('Недействительный токен авторизации', HttpStatus.UNAUTHORIZED);
  }
}

export class RefreshTokenExpiredException extends HttpException {
  constructor() {
    super('Refresh токен истек', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidRefreshTokenException extends HttpException {
  constructor() {
    super('Недействительный refresh токен', HttpStatus.UNAUTHORIZED);
  }
}
