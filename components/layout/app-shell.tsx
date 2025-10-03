"use client";

import * as React from "react";
import { cn } from "@/utils/misc";

const AppShell = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
  }
>(({ className, sidebar, header, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex min-h-screen bg-background", className)}
      {...props}
    >
      {sidebar}
      <div className="flex flex-1 flex-col min-w-0">
        {header}
        <main 
          className="flex-1 overflow-auto"
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
    </div>
  );
});
AppShell.displayName = "AppShell";

export { AppShell };