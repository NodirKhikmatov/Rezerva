import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BusinessCategory } from '@prisma/client';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class SearchBusinessesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BusinessCategory)
  category?: BusinessCategory;

  @IsOptional()
  @IsUUID()
  cityId?: string;

  @IsOptional()
  @IsUUID()
  districtId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radiusKm?: number;
}
