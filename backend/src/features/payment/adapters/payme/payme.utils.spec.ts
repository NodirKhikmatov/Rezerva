import { Buffer } from 'buffer';
import { buildPaymeCheckoutUrl, verifyPaymeAuthorization } from './payme.utils';

describe('verifyPaymeAuthorization', () => {
  const merchantId = 'merchant-123';
  const apiKey = 'secret-key';
  const authorization = `Basic ${Buffer.from(`${merchantId}:${apiKey}`).toString('base64')}`;

  it('accepts valid basic auth', () => {
    expect(verifyPaymeAuthorization(authorization, merchantId, apiKey)).toBe(
      true,
    );
  });

  it('rejects invalid credentials', () => {
    expect(
      verifyPaymeAuthorization(authorization, merchantId, 'wrong-key'),
    ).toBe(false);
  });

  it('rejects missing header', () => {
    expect(verifyPaymeAuthorization(undefined, merchantId, apiKey)).toBe(false);
  });
});

describe('buildPaymeCheckoutUrl', () => {
  it('builds encoded checkout URL', () => {
    const url = buildPaymeCheckoutUrl(
      'merchant-123',
      'payment-uuid',
      9000000,
      'https://rezerva.uz/success',
    );

    expect(url.startsWith('https://checkout.paycom.uz/')).toBe(true);
    expect(url.length).toBeGreaterThan('https://checkout.paycom.uz/'.length);
  });
});
