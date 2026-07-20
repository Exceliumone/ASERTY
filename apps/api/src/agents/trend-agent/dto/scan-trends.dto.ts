import { IsArray, IsOptional, IsString } from 'class-validator';

export class ScanTrendsDto {
  /** Raw signals to analyze: headlines, social snippets, on-chain notes, etc. */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  signals?: string[];
}
