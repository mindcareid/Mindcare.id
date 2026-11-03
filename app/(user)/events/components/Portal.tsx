"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
};

const emptySubscribe = () => () => {};

export default function Portal({ children }: Props) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isClient) return null;

  return createPortal(children, document.body);
}
