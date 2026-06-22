'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TelegramLogin } from '@/components/auth/telegram-login';
import type { AuthResponse, Product } from '@/lib/api';

type HeroProps = {
  products: Product[];
  user: AuthResponse['user'] | null;
  onLogin: (response: AuthResponse) => void;
};

export function Hero({ products, user, onLogin }: HeroProps) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? '';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShoppingBag className="size-7" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Order fast. Track live.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A modern ordering platform with Telegram login, real-time updates,
            and a polished web experience.
          </p>
        </div>

        {!user && botUsername ? (
          <TelegramLogin botUsername={botUsername} onSuccess={onLogin} />
        ) : user ? (
          <p className="text-sm text-muted-foreground">
            Signed in as {user.firstName ?? user.username ?? 'Telegram user'}
          </p>
        ) : (
          <Button disabled>Set NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</Button>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>No products yet</CardTitle>
              <CardDescription>
                Seed the database to populate the menu.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 * index }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>
                    {product.description ?? 'Fresh item from the menu'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.section>
    </div>
  );
}
