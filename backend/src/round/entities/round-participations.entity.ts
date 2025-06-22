import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Round } from './round.entity';
import { User } from '@ThLOG/auth/entities';

@Entity('round_participations')
@Index(['roundId', 'userId'], { unique: true })
export class RoundParticipation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roundId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  taps: number;

  @ManyToOne(() => Round, (round) => round.participations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roundId' })
  round: Round;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
