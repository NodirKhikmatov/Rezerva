import { IsEnum, IsUrl } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class InitiatePaymentDto {
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsUrl({ require_tld: false })
  returnUrl!: string;

  @IsUrl({ require_tld: false })
  cancelUrl!: string;
}
