'use client';

import { useEffect, useRef } from 'react';

import { loginWithTelegram } from '../api/auth.api';
import type { AuthSession } from '../types/auth.types';

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

type TelegramLoginButtonProps = {
  botUsername: string;
  onSuccess: (session: AuthSession) => void;
  onError?: (error: Error) => void;
};

export function TelegramLoginButton({
  botUsername,
  onSuccess,
  onError,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        const session = await loginWithTelegram(user);
        onSuccess(session);
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error('Telegram login failed'),
        );
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    containerRef.current?.replaceChildren(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, onSuccess, onError]);

  return <div ref={containerRef} className="flex justify-center" />;
}
