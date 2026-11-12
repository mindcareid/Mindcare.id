"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import type { Session } from "next-auth";
import SocketProvider from "@/providers/SocketProvider";
import NotificationProvider from "@/providers/NotificationProvider";

/**
 * Provider klien global.
 *
 * Ini SATU-SATUNYA `SessionProvider` aplikasi. Area yang punya session
 * dari server (dashboard) meneruskan session lewat `SessionBootstrap`
 * (lihat `app/components/SessionBootstrap.tsx`), sehingga hanya ada
 * satu sumber kebenaran untuk `status` session. Halaman publik yang
 * tidak mengirim `session` akan mengambilnya sekali dari
 * `/api/auth/session`.
 */
export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  /** Session dari server, atau `undefined` untuk fetch sekali di klien. */
  session?: Session | null;
}) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <NotificationProvider>{children}</NotificationProvider>

              <Toaster
            position="top-right"
            richColors
            toastOptions={{ className: "z-[9999]" }}
          />
        </SocketProvider>

        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
