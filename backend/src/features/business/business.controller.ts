import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../shared/decorators/public.decorator';
import { BusinessService } from './business.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { SearchBusinessesQueryDto } from './dto/search-businesses-query.dto';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get business by slug (public)' })
  getBySlug(@Param('slug') slug: string) {
    return this.businessService.getBySlug(slug);
  }

  @Public()
  @Get(':businessId/services')
  @ApiOperation({ summary: 'List business services (public)' })
  listServices(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query() query: ListServicesQueryDto,
  ) {
    return this.businessService.listServices(businessId, query);
  }

  @Public()
  @Get(':businessId/availability')
  @ApiOperation({ summary: 'Get availability slots (public)' })
  getAvailability(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.businessService.getAvailability(businessId, query);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search businesses (public)' })
  search(@Query() query: SearchBusinessesQueryDto) {
    return this.businessService.search(query);
  }
}
