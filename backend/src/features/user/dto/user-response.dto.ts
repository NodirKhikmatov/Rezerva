import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdentityProvider, Locale, PlatformRole } from '@prisma/client';

export class UserIdentityResponseDto {
  @ApiProperty({ enum: IdentityProvider, example: IdentityProvider.telegram })
  provider: IdentityProvider;

  @ApiProperty({ example: '123456789' })
  providerId: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiPropertyOptional({ example: '+998901234567', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ example: 'ali@example.com', nullable: true })
  email: string | null;

  @ApiPropertyOptional({ example: 'Ali', nullable: true })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Karimov', nullable: true })
  lastName: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.rezerva.uz/avatars/abc.jpg',
    nullable: true,
  })
  photoUrl: string | null;

  @ApiProperty({ enum: Locale, example: Locale.uz })
  locale: Locale;

  @ApiProperty({ enum: PlatformRole, example: PlatformRole.consumer })
  role: PlatformRole;

  @ApiProperty({ type: [UserIdentityResponseDto] })
  identities: UserIdentityResponseDto[];

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;
}
