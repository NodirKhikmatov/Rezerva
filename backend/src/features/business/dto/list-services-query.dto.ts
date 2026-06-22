import { IsOptional, IsUUID } from 'class-validator';

export class ListServicesQueryDto {
  @IsOptional()
  @IsUUID()
  venueId?: string;
}
