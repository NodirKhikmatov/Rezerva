import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { VenueService } from './venue.service';

@ApiTags('venues')
@Controller()
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Public()
  @Get('businesses/:businessId/venues')
  @ApiOperation({ summary: 'List venues for business (public)' })
  listByBusiness(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.venueService.listByBusiness(businessId);
  }

  @Public()
  @Get('venues/:venueId')
  @ApiOperation({ summary: 'Get venue detail (public)' })
  getVenue(@Param('venueId', ParseUUIDPipe) venueId: string) {
    return this.venueService.getById(venueId);
  }

  @Public()
  @Get('venues/:venueId/resources')
  @ApiOperation({ summary: 'List venue resources (public)' })
  listResources(@Param('venueId', ParseUUIDPipe) venueId: string) {
    return this.venueService.listResources(venueId);
  }
}
