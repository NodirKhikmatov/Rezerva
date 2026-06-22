import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export enum BookingListFilter {
  upcoming = 'upcoming',
  past = 'past',
  cancelled = 'cancelled',
}

export class ListMyBookingsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BookingListFilter)
  status?: BookingListFilter;
}
