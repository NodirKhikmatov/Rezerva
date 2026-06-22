import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { ClickPaymentAdapter } from '../adapters/click/click-payment.adapter';
import { PaymePaymentAdapter } from '../adapters/payme/payme-payment.adapter';
import { PaymentProviderAdapter } from '../types/payment-provider.types';

@Injectable()
export class PaymentProviderRegistry {
  private readonly adapters: Map<PaymentProvider, PaymentProviderAdapter>;

  constructor(
    paymeAdapter: PaymePaymentAdapter,
    clickAdapter: ClickPaymentAdapter,
  ) {
    this.adapters = new Map<PaymentProvider, PaymentProviderAdapter>([
      [PaymentProvider.payme, paymeAdapter],
      [PaymentProvider.click, clickAdapter],
    ]);
  }

  resolve(provider: PaymentProvider): PaymentProviderAdapter {
    const adapter = this.adapters.get(provider);

    if (!adapter?.isEnabled()) {
      throw new ServiceUnavailableException('Payment provider unavailable');
    }

    return adapter;
  }

  listEnabledMethods(): PaymentProviderAdapter[] {
    return [...this.adapters.values()].filter((adapter) => adapter.isEnabled());
  }
}
