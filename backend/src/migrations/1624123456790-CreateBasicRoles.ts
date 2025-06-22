import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBasicRoles1624123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу ролей
    await queryRunner.query(`
            CREATE TABLE "roles"
            (
                "id"   SERIAL PRIMARY KEY,
                "code" VARCHAR NOT NULL UNIQUE,
                "name" VARCHAR NOT NULL
            )
        `);

    // Добавляем базовые роли
    await queryRunner.query(`
            INSERT INTO "roles" (code, name)
            VALUES ('user', 'Пользователь'),
                   ('admin', 'Администратор'),
                   ('moderator', 'Модератор'),
                   ('nikita', 'Никита')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
