import type React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between",
        className
      )}>
      <div>
        <h1 className="text-h4Bold md:text-h3Bold text-foreground">{title}</h1>
        {description && (
          <p className="text-body text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
