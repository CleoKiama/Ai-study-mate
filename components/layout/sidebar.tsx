"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/misc";

interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps extends React.ComponentProps<"aside"> {
  items: SidebarItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, items, open = true, onOpenChange, ...props }, ref) => {
    const pathname = usePathname();
    const sidebarRef = React.useRef<HTMLElement>(null);

    // Handle escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          onOpenChange?.(false);
        }
      };

      if (open) {
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, onOpenChange]);

    // Focus management
    React.useEffect(() => {
      if (open && sidebarRef.current) {
        const firstFocusable = sidebarRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    }, [open]);

    return (
      <>
        {/* Mobile backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => onOpenChange?.(false)}
            aria-hidden="true"
          />
        )}

        <aside
          ref={ref}
          className={cn(
            "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
            // Desktop styles
            "w-64 md:relative md:translate-x-0",
            // Mobile styles
            "fixed inset-y-0 left-0 z-50 md:z-auto",
            "transform transition-transform",
            !open && "-translate-x-full md:translate-x-0 md:w-16",
            className
          )}
          aria-label="Main navigation"
          role="navigation"
          {...props}
        >
          <div className="flex h-14 items-center justify-between border-b px-4">
            <Link 
              href="/" 
              className={cn(
                "flex items-center space-x-2",
                !open && "md:justify-center"
              )}
              aria-label="StudyMate home"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                SM
              </div>
              {open && <span className="font-semibold md:inline">StudyMate</span>}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange?.(!open)}
              className="md:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
            >
              <span className="sr-only">
                {open ? "Close navigation" : "Open navigation"}
              </span>
              ☰
            </Button>
          </div>
          
          <nav className="flex-1 space-y-1 p-4" role="navigation">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    onOpenChange?.(false);
                  }}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {open && <span className="md:inline">{item.label}</span>}
                  <span className="sr-only">
                    {isActive && "(current page)"}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar, type SidebarItem };