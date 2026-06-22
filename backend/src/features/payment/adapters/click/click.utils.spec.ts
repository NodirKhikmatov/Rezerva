import { createHash, timingSafeEqual } from 'crypto';
import { buildClickCheckoutUrl, verifyClickSignature } from './click.utils';

describe('verifyClickSignature', () => {
  const secretKey = 'test-secret';
  const payload = {
    click_trans_id: '12345',
    service_id: '67890',
    merchant_trans_id: 'payment-uuid',
    amount: '100000',
    action: '1',
    sign_time: '2026-06-22 10:00:00',
  };

  function sign(body: typeof payload): string {
    return createHash('md5')
      .update(
        `${body.click_trans_id}${body.service_id}${secretKey}${body.merchant_trans_id}${body.amount}${body.action}${body.sign_time}`,
      )
      .digest('hex');
  }

  it('accepts valid signature', () => {
    const signString = sign(payload);

    expect(
      verifyClickSignature({ ...payload, sign_string: signString }, secretKey),
    ).toBe(true);
  });

  it('rejects tampered amount', () => {
    const signString = sign(payload);

    expect(
      verifyClickSignature(
        { ...payload, amount: '999999', sign_string: signString },
        secretKey,
      ),
    ).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(verifyClickSignature({ click_trans_id: '1' }, secretKey)).toBe(
      false,
    );
  });
});

describe('buildClickCheckoutUrl', () => {
  it('builds checkout URL with required params', () => {
    const url = buildClickCheckoutUrl(
      'merchant-1',
      'service-1',
      'payment-uuid',
      150000,
      'https://rezerva.uz/success',
    );

    expect(url).toContain('https://my.click.uz/services/pay?');
    expect(url).toContain('merchant_id=merchant-1');
    expect(url).toContain('merchant_trans_id=payment-uuid');
    expect(url).toContain('amount=150000');
  });
});

describe('timingSafeEqual usage', () => {
  it('compares equal digests safely', () => {
    const left = Buffer.from('abc');
    const right = Buffer.from('abc');

    expect(timingSafeEqual(left, right)).toBe(true);
  });
});
