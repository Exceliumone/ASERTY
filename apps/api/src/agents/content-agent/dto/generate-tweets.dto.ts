import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateTweetsDto {
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  count?: number = 3;

  @IsString()
  @IsOptional()
  context?: string;
}
