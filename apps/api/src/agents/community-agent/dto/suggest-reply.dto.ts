import { IsNotEmpty, IsString } from 'class-validator';

export class SuggestReplyDto {
  @IsString()
  @IsNotEmpty()
  originalMessageId!: string;

  @IsString()
  @IsNotEmpty()
  originalAuthor!: string;

  @IsString()
  @IsNotEmpty()
  originalText!: string;
}
