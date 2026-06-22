import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateHoldDto {
  @IsUUID()
  businessId!: string;

  @IsUUID()
  serviceId!: string;

  @IsUUID()
  resourceId!: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  partySize?: number;
}

export class BookingParticipantDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class ConfirmBookingDto {
  @IsUUID()
  holdId!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingParticipantDto)
  participants?: BookingParticipantDto[];

  @IsOptional()
  @IsArray()
  intakeResponses?: unknown[];
}
