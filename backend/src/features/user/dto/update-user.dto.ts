import { ApiPropertyOptional } from '@nestjs/swagger';
import { Locale } from '@prisma/client';
import { LOCALES } from '@rezerva/shared-constants';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimOptional(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 100, example: 'Ali' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => trimOptional(value))
  firstName?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 100, example: 'Karimov' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => trimOptional(value))
  lastName?: string;

  @ApiPropertyOptional({ example: 'ali@example.com', maxLength: 255 })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => trimOptional(value))
  email?: string | null;

  @ApiPropertyOptional({ enum: LOCALES, example: Locale.uz })
  @IsOptional()
  @IsEnum(Locale)
  locale?: Locale;
}
