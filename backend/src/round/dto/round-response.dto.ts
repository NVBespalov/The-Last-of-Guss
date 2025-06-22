import { RoundStatus } from '../entities/round.entity';

export class RoundResponseDto {
  id: string;
  createdAt: Date;
  startTime: Date;
  endTime: Date;
  totalScore: number;
  totalTaps: number;
  status: RoundStatus;
  myScore?: number;
  myTaps?: number;
  winner?: {
    username: string;
    score: number;
  };
}

export class RoundListResponseDto {
  id: string;
  startTime: Date;
  endTime: Date;
  status: RoundStatus;
  totalScore: number;
}
