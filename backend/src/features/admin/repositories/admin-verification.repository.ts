import { Injectable } from '@nestjs/common';
import { BusinessStatus, Prisma, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListVerificationsQueryDto } from '../dto/list-verifications-query.dto';

@Injectable()
export class AdminVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ListVerificationsQueryDto, skip: number, take: number) {
    const where: Prisma.BusinessVerificationWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    return Promise.all([
      this.prisma.businessVerification.findMany({
        where,
        skip,
        take,
        orderBy: { submittedAt: 'desc' },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              status: true,
              phone: true,
              email: true,
              city: { select: { name: true } },
              locations: {
                where: { deletedAt: null, isPrimary: true },
                take: 1,
                select: {
                  addressLine: true,
                  district: { select: { name: true } },
                },
              },
              members: {
                where: { role: 'owner', deletedAt: null },
                take: 1,
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phone: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          documents: { select: { id: true } },
        },
      }),
      this.prisma.businessVerification.count({ where }),
    ]);
  }

  findById(verificationId: string) {
    return this.prisma.businessVerification.findUnique({
      where: { id: verificationId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            status: true,
            description: true,
            phone: true,
            email: true,
            onboardingStep: true,
            ownerId: true,
            city: { select: { name: true } },
            locations: {
              where: { deletedAt: null, isPrimary: true },
              take: 1,
              select: {
                addressLine: true,
                district: { select: { name: true } },
              },
            },
            members: {
              where: { role: 'owner', deletedAt: null },
              take: 1,
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        documents: true,
      },
    });
  }

  findOwner(ownerId: string) {
    return this.prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });
  }

  approve(input: {
    verificationId: string;
    reviewerId: string;
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const verification = await tx.businessVerification.findUnique({
        where: { id: input.verificationId },
        include: { business: { select: { id: true, status: true } } },
      });

      if (!verification) {
        return null;
      }

      const reviewedAt = new Date();

      await tx.businessVerification.update({
        where: { id: input.verificationId },
        data: {
          status: VerificationStatus.approved,
          reviewedAt,
          reviewedById: input.reviewerId,
          notes: input.notes,
          rejectReason: null,
          rejectMessage: null,
        },
      });

      await tx.business.update({
        where: { id: verification.businessId },
        data: { status: BusinessStatus.active },
      });

      return {
        businessId: verification.businessId,
        previousBusinessStatus: verification.business.status,
        approvedAt: reviewedAt,
      };
    });
  }

  reject(input: {
    verificationId: string;
    reviewerId: string;
    reason: string;
    message: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const verification = await tx.businessVerification.findUnique({
        where: { id: input.verificationId },
        include: { business: { select: { id: true, status: true } } },
      });

      if (!verification) {
        return null;
      }

      const reviewedAt = new Date();

      await tx.businessVerification.update({
        where: { id: input.verificationId },
        data: {
          status: VerificationStatus.rejected,
          reviewedAt,
          reviewedById: input.reviewerId,
          rejectReason: input.reason,
          rejectMessage: input.message,
        },
      });

      await tx.business.update({
        where: { id: verification.businessId },
        data: { status: BusinessStatus.rejected },
      });

      return {
        businessId: verification.businessId,
        previousBusinessStatus: verification.business.status,
        reviewedAt,
      };
    });
  }
}
