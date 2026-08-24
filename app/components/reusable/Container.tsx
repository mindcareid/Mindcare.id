import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

export default function Container({
  children,
  as: Component = "div",
  className,
}: ContainerProps) {
  return (
    <Component className={cn("mx-auto w-full max-w-7xl px-6", className)}>
      {children}
    </Component>
  );
}
