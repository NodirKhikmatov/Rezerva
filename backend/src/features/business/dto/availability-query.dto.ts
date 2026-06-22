import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AvailabilityQueryDto {
  @IsUUID()
  serviceId!: string;

  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  partySize?: number;
}
