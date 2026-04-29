import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export const useHRChat = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const callbacksRef = useRef({
    onEvent: null,
    onComplete: null,
    onError: null
  });

  useEffect(() => {
    console.log("[HR CHAT] Initializing socket");

    const newSocket = io(
      "https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net",
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      }
    );

    newSocket.on("connect", () => {
      console.log("[HR CHAT] Connected", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[HR CHAT] Disconnected", reason);
      setIsConnected(false);
    });

    const handleEvent = (eventName, data) => {
      console.log(`[HR CHAT] ${eventName}`, data);

      if (callbacksRef.current.onEvent) {
        callbacksRef.current.onEvent(eventName, data);
      }
    };

    newSocket.on("hr_status", (data) => handleEvent("status", data));
    newSocket.on("hr_event", (data) => handleEvent("event", data));
    newSocket.on("hr_email_prepared", (data) =>
      handleEvent("email_prepared", data)
    );
    newSocket.on("hr_email_sent", (data) =>
      handleEvent("email_sent", data)
    );

    newSocket.on("hr_complete", (data) => {
      callbacksRef.current.onComplete?.(data);
    });

    newSocket.on("hr_error", (data) => {
      callbacksRef.current.onError?.(data);
    });

    setSocket(newSocket);

    return () => {
      callbacksRef.current = {
        onEvent: null,
        onComplete: null,
        onError: null
      };

      newSocket.disconnect();
    };
  }, []);

  const sendHRChat = ({ payload, onEvent, onComplete, onError }) => {
    if (!socket?.connected) {
      console.log("[HR CHAT] Socket not connected");
      return false;
    }

    callbacksRef.current = {
      onEvent,
      onComplete,
      onError
    };

    socket.emit("hr_chat", payload);
    return true;
  };

  return { isConnected, sendHRChat };
};