import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertCredentialDto {
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}
