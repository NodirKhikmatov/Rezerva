'use client';

const STEPS = ['Service', 'Date & time', 'Confirm'] as const;

type BookingStepperProps = {
  currentStep: number;
};

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                isActive || isComplete
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNumber}
            </span>
            <span
              className={`hidden text-sm sm:inline ${
                isActive
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-border sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
