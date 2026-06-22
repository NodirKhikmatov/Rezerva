'use client';

import { useEffect, useRef } from 'react';
import { api, type AuthResponse } from '@/lib/api';

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

type TelegramLoginProps = {
  botUsername: string;
  onSuccess: (response: AuthResponse) => void;
  onError?: (error: Error) => void;
};

export function TelegramLogin({
  botUsername,
  onSuccess,
  onError,
}: TelegramLoginProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      try {
        const response = await api.loginWithTelegram(user);
        onSuccess(response);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Login failed'));
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    containerRef.current?.replaceChildren(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, onSuccess, onError]);

  return <div ref={containerRef} className="flex justify-center" />;
}
