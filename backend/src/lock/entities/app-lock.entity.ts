import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('app_locks')
export class AppLock {
  @PrimaryColumn()
  lockKey: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lockedAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
