import { ImageStyle } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  context!: string;

  @IsEnum(ImageStyle)
  style!: ImageStyle;

  @IsString()
  @IsOptional()
  linkedTweetId?: string;
}
