import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  id?: string;
};

export default function Container({
  children,
  as: Component = "div",
  className,
  id,
}: ContainerProps) {
  return (
    <Component
      id={id}
      className={cn("mx-auto w-full max-w-7xl px-6", className)}
    >
      {children}
    </Component>
  );
}
