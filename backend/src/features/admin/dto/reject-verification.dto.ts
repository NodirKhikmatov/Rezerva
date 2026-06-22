import { IsString, MaxLength, MinLength } from 'class-validator';

export class RejectVerificationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  reason!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}
