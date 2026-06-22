import { IsString, MaxLength, MinLength } from 'class-validator';

export class SuspendBusinessDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  reason!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}
