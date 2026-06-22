import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { PaymentProviderRegistry } from '../adapters/payment-provider.registry';

@Injectable()
export class PaymeWebhookGuard implements CanActivate {
  constructor(private readonly registry: PaymentProviderRegistry) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      body: unknown;
    }>();

    const adapter = this.registry.resolve(PaymentProvider.payme);
    const verification = adapter.verifyWebhook(request.headers, request.body);

    if (!verification.valid) {
      throw new UnauthorizedException('Invalid Payme signature');
    }

    Object.assign(request, { webhookVerification: verification });
    return true;
  }
}

@Injectable()
export class ClickWebhookGuard implements CanActivate {
  constructor(private readonly registry: PaymentProviderRegistry) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      body: unknown;
    }>();

    const adapter = this.registry.resolve(PaymentProvider.click);
    const verification = adapter.verifyWebhook(request.headers, request.body);

    if (!verification.valid) {
      throw new UnauthorizedException('Invalid Click signature');
    }

    Object.assign(request, { webhookVerification: verification });
    return true;
  }
}
