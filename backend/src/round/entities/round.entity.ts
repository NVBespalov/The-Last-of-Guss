import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoundParticipation } from '@ThLOG/round/entities/round-participations.entity';

export enum RoundStatus {
  COOLDOWN = 'cooldown',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

@Entity('rounds')
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @OneToMany(() => RoundParticipation, (participation) => participation.round)
  participations: RoundParticipation[];

  get status(): RoundStatus {
    const now = new Date();
    if (now < this.startTime) {
      return RoundStatus.COOLDOWN;
    } else if (now <= this.endTime) {
      return RoundStatus.ACTIVE;
    } else {
      return RoundStatus.FINISHED;
    }
  }

  @Column({ default: false })
  calculationComplete: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
