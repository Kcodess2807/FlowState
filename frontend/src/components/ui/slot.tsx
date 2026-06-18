import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils";

export const Slot = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => {
    if (!isValidElement(children)) return null;
    const child = Children.only(children);
    const childProps = child.props as Record<string, unknown>;
    return cloneElement(child, {
      ...props,
      ...childProps,
      ref,
      className: cn(className, childProps.className as string | undefined),
    } as Record<string, unknown>);
  },
);
Slot.displayName = "Slot";
