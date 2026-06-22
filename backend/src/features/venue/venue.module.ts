import { Module } from '@nestjs/common';
import { VenueController } from './venue.controller';
import { VenueRepository } from './venue.repository';
import { VenueService } from './venue.service';

@Module({
  controllers: [VenueController],
  providers: [VenueRepository, VenueService],
  exports: [VenueRepository, VenueService],
})
export class VenueModule {}
