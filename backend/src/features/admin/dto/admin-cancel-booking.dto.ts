import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum AdminRefundOverride {
  none = 'none',
  partial = 'partial',
  full = 'full',
}

export class AdminCancelBookingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  reason!: string;

  @IsEnum(AdminRefundOverride)
  refundOverride!: AdminRefundOverride;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
