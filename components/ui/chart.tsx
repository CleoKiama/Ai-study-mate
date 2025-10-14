"use client";

import * as React from "react";
import { cn } from "@/utils/misc";

interface ChartProps extends React.ComponentProps<"div"> {
  children?: React.ReactNode;
  config?: Record<string, { label: string; color?: string }>;
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-[200px] w-full", className)}
        {...props}
      >
        {children || (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground">
            Chart placeholder - connect your data here
          </div>
        )}
      </div>
    );
  }
);
Chart.displayName = "Chart";

export { Chart };