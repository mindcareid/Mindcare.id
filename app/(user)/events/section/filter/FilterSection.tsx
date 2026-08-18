"use client";

import { memo } from "react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

function FilterSection({
  title,
  children,
}: Props) {
  return (
    <section>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>

      {children}
    </section>
  );
}

export default memo(FilterSection);