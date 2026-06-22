import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { Public } from '../../shared/decorators/public.decorator';
import {
  ClickWebhookGuard,
  PaymeWebhookGuard,
} from './guards/webhook-signature.guards';
import { PaymentWebhookService } from './services/payment-webhook.service';
import { WebhookRequest } from './types/webhook-request.type';

@ApiTags('webhooks')
@Controller('webhooks')
export class PaymentWebhookController {
  constructor(private readonly webhookService: PaymentWebhookService) {}

  @Public()
  @Post('payme')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PaymeWebhookGuard)
  @ApiOperation({ summary: 'Payme payment webhook' })
  handlePayme(@Req() request: WebhookRequest, @Body() body: unknown) {
    return this.webhookService.handleProviderWebhook(
      PaymentProvider.payme,
      request.webhookVerification,
      body,
    );
  }

  @Public()
  @Post('click')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClickWebhookGuard)
  @ApiOperation({ summary: 'Click payment webhook' })
  handleClick(@Req() request: WebhookRequest, @Body() body: unknown) {
    return this.webhookService.handleProviderWebhook(
      PaymentProvider.click,
      request.webhookVerification,
      body,
    );
  }
}
