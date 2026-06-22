'use client';

import { cn } from '@/lib/utils';

type ChartTooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
};

type AdminChartTooltipProps = {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  formatter?: (value: number) => string;
};

export function AdminChartTooltip({
  active,
  payload,
  label,
  formatter,
}: AdminChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const items = payload as ChartTooltipPayloadItem[];

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-md">
      {label && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const numericValue =
            typeof item.value === 'number' ? item.value : Number(item.value);

          return (
            <li
              key={item.name}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn('size-2 rounded-full')}
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                {item.name}
              </span>
              <span className="font-medium tabular-nums">
                {formatter && Number.isFinite(numericValue)
                  ? formatter(numericValue)
                  : item.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
