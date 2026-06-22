import { Injectable } from '@nestjs/common';
import { BusinessStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminBusinessRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(businessId: string) {
    return this.prisma.business.findFirst({
      where: { id: businessId, deletedAt: null },
      select: { id: true, status: true },
    });
  }

  suspend(businessId: string) {
    return this.prisma.business.update({
      where: { id: businessId },
      data: { status: BusinessStatus.suspended },
      select: { id: true, status: true },
    });
  }

  reinstate(businessId: string) {
    return this.prisma.business.update({
      where: { id: businessId },
      data: { status: BusinessStatus.active },
      select: { id: true, status: true },
    });
  }
}
