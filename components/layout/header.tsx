"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/misc";

interface HeaderProps extends React.ComponentProps<"header"> {
  title?: string;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, title, breadcrumb, actions, onMenuClick, showMenuButton = true, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex h-14 items-center justify-between border-b bg-background px-4 md:px-6",
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <span className="sr-only">Open navigation menu</span>
              ☰
            </Button>
          )}
          <div className="flex flex-col">
            {breadcrumb}
            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
            {children}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2" role="toolbar" aria-label="Header actions">
            {actions}
          </div>
        )}
      </header>
    );
  }
);
Header.displayName = "Header";

export { Header };