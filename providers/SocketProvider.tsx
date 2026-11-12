"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    // Logout / session hilang: `return` kosong membuat cleanup effect
    // sebelumnya berjalan (disconnect + setSocket(null)).
    if (status !== "authenticated" || !userId) {
      return;
    }

    let active = true;
    let current: Socket | undefined;
    let cleanup: (() => void) | undefined;
    import("@/lib/socket")
      .then(({ socket }) => {
        if (!active) return;

        current = socket;
        setSocket(socket);

        if (!socket.connected) {
          socket.connect();
        }

        const onConnect = () => {
          socket.emit("register", { userId });
        };

        socket.on("connect", onConnect);
        cleanup = () => {
          socket.off("connect", onConnect);
        };

        // Koneksi mungkin sudah terbuka sebelum listener terpasang.
        if (socket.connected) onConnect();
      })
      .catch((err) => {
        console.error("Socket load failed", err);
      });

    return () => {
      active = false;
      cleanup?.();
      // Jangan biarkan koneksi (dan user terdaftar) hidup setelah
      // provider unmount atau user berganti.
      current?.disconnect();
      setSocket(null);
    };
  }, [status, userId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
