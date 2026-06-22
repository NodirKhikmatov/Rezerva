import {
  BusinessCategory,
  BusinessMemberRole,
  BusinessStatus,
  OnboardingStep,
  PlatformRole,
  PricingModel,
  PrismaClient,
  ResourceStatus,
  ResourceType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedGeo() {
  const country = await prisma.country.upsert({
    where: { code: 'UZ' },
    update: {},
    create: {
      code: 'UZ',
      name: "O'zbekiston",
      isActive: true,
    },
  });

  const region = await prisma.region.upsert({
    where: {
      countryId_code: {
        countryId: country.id,
        code: 'TK',
      },
    },
    update: {},
    create: {
      countryId: country.id,
      name: 'Tashkent',
      code: 'TK',
      isActive: true,
    },
  });

  const district = await prisma.district.upsert({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      regionId: region.id,
      name: 'Chilanzar',
      isActive: true,
    },
  });

  const city = await prisma.city.upsert({
    where: { slug: 'tashkent' },
    update: {},
    create: {
      countryId: country.id,
      districtId: district.id,
      name: 'Tashkent',
      slug: 'tashkent',
      latitude: 41.2995,
      longitude: 69.2401,
      isActive: true,
    },
  });

  return { country, region, district, city };
}

async function seedArenaFootball(cityId: string, districtId: string) {
  const owner = await prisma.user.upsert({
    where: { phone: '+998901112233' },
    update: {},
    create: {
      phone: '+998901112233',
      firstName: 'Arena',
      lastName: 'Owner',
      role: PlatformRole.consumer,
    },
  });

  const business = await prisma.business.upsert({
    where: { slug: 'arena-football' },
    update: {},
    create: {
      ownerId: owner.id,
      cityId,
      slug: 'arena-football',
      name: 'Arena Football',
      description: 'Premium football fields in Tashkent',
      category: BusinessCategory.football,
      status: BusinessStatus.active,
      phone: '+998712345678',
      onboardingStep: OnboardingStep.verification,
      averageRating: 4.7,
      reviewCount: 128,
    },
  });

  await prisma.businessMember.upsert({
    where: {
      businessId_userId: {
        businessId: business.id,
        userId: owner.id,
      },
    },
    update: {},
    create: {
      businessId: business.id,
      userId: owner.id,
      role: BusinessMemberRole.owner,
      acceptedAt: new Date(),
    },
  });

  await prisma.businessPolicy.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      cancellationHoursBefore: 24,
      cancellationFeePercent: 50,
      depositPercent: 30,
      requiresApproval: false,
    },
  });

  const venue = await prisma.businessLocation.upsert({
    where: { id: '00000000-0000-4000-8000-000000000201' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      businessId: business.id,
      districtId,
      name: 'Main Branch',
      addressLine: 'Chilanzar 9',
      latitude: 41.2856,
      longitude: 69.2034,
      phone: '+998712345678',
      isPrimary: true,
    },
  });

  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek += 1) {
    await prisma.businessWorkingHour.upsert({
      where: {
        locationId_dayOfWeek: {
          locationId: venue.id,
          dayOfWeek,
        },
      },
      update: {
        openTime: '08:00',
        closeTime: '23:00',
        isClosed: false,
      },
      create: {
        locationId: venue.id,
        dayOfWeek,
        openTime: '08:00',
        closeTime: '23:00',
        isClosed: false,
      },
    });
  }

  const pitchA = await prisma.resource.upsert({
    where: { id: '00000000-0000-4000-8000-000000000301' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000301',
      businessId: business.id,
      locationId: venue.id,
      name: 'Pitch A',
      type: ResourceType.football_pitch,
      status: ResourceStatus.active,
      capacity: 14,
      metadata: {
        surfaceType: 'artificial_turf',
        dimensions: '40x20m',
        lighting: true,
      },
    },
  });

  const pitchB = await prisma.resource.upsert({
    where: { id: '00000000-0000-4000-8000-000000000302' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000302',
      businessId: business.id,
      locationId: venue.id,
      name: 'Pitch B',
      type: ResourceType.football_pitch,
      status: ResourceStatus.active,
      capacity: 14,
      metadata: {
        surfaceType: 'artificial_turf',
        dimensions: '40x20m',
        lighting: true,
      },
    },
  });

  const service = await prisma.service.upsert({
    where: { id: '00000000-0000-4000-8000-000000000401' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000401',
      businessId: business.id,
      locationId: venue.id,
      name: '2-hour pitch rental',
      description: 'Full pitch for 2 hours',
      durationMinutes: 120,
      price: 300000,
      currency: 'UZS',
      pricingModel: PricingModel.fixed,
      maxPartySize: 14,
      isActive: true,
    },
  });

  for (const resourceId of [pitchA.id, pitchB.id]) {
    await prisma.serviceResource.upsert({
      where: {
        serviceId_resourceId: {
          serviceId: service.id,
          resourceId,
        },
      },
      update: {},
      create: {
        serviceId: service.id,
        resourceId,
      },
    });
  }

  return { business, venue, service, owner };
}

async function main() {
  const { district, city } = await seedGeo();
  await seedArenaFootball(city.id, district.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
