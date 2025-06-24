import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Round } from '@ThLOG/round/entities/round.entity';
import { User } from '@ThLOG/auth/entities';

@Entity('tap_logs')
export class TapLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  roundId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Round)
  round: Round;
}
