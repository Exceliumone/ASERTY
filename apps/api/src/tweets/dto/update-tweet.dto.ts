import { TweetStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTweetDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(TweetStatus)
  @IsOptional()
  status?: TweetStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];
}
