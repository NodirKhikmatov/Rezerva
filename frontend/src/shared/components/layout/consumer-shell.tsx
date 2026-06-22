'use client';

import { AppShell } from './app-shell';
import { ConsumerFooter } from './consumer-footer';
import { ConsumerHeader } from './consumer-header';
import { MobileTabBar } from '../navigation/mobile-tab-bar';

type ConsumerShellProps = {
  children: React.ReactNode;
};

export function ConsumerShell({ children }: ConsumerShellProps) {
  return (
    <AppShell
      navbar={<ConsumerHeader />}
      footer={<ConsumerFooter />}
      mainClassName="pb-20 md:pb-0"
    >
      {children}
      <MobileTabBar />
    </AppShell>
  );
}
