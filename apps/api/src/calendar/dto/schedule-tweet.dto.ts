import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ScheduleTweetDto {
  @IsString()
  @IsNotEmpty()
  tweetId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
