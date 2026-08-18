"use client";

import {
  createContext,
  useContext,
  useEffect,
} from "react";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";

const SocketContext = createContext(socket);

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log("Connected:", socket.id);

      socket.emit("register", {
        userId: session.user.id,
      });
    };

    const onDisconnect = () => {
      console.log("Disconnected");
    };

    const onError = (err: Error) => {
      console.error(err);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
    };
  }, [status, session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}