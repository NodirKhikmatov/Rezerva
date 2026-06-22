import { Injectable } from '@nestjs/common';
import { PaymentProvider, TransactionType } from '@prisma/client';
import { PaymentRepository } from '../repository/payment.repository';

type LedgerChargeInput = {
  paymentId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerTxnId?: string;
  idempotencyKey: string;
  rawPayload?: unknown;
};

@Injectable()
export class LedgerService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  recordInitiateAttempt(input: LedgerChargeInput) {
    return this.paymentRepository.appendTransaction({
      paymentId: input.paymentId,
      type: TransactionType.charge,
      amount: input.amount,
      currency: input.currency,
      provider: input.provider,
      providerTxnId: input.providerTxnId,
      idempotencyKey: input.idempotencyKey,
      rawPayload: input.rawPayload as object | undefined,
    });
  }
}
