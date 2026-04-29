import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// In useHRChat.js
export const useHRChat = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use ref to always have latest callbacks
  const callbacksRef = useRef({
    onEvent: null,
    onComplete: null,
    onError: null
  });

  useEffect(() => {
    console.log("[HR CHAT] Initializing socket");

    const newSocket = io("https://curki-test-prod-auhyhehcbvdmh3ef.canadacentral-01.azurewebsites.net", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on("connect", () => {
      console.log("[HR CHAT] Connected", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[HR CHAT] Disconnected", reason);
      setIsConnected(false);
    });

    // Single handler for all events
    const handleEvent = (eventName, data) => {
      console.log(`[HR CHAT] ${eventName}`, data);
      
      if (callbacksRef.current.onEvent) {
        callbacksRef.current.onEvent(eventName, data);
      }
    };

    newSocket.on("hr_status", (data) => handleEvent("status", data));
    newSocket.on("hr_event", (data) => handleEvent("event", data));
    newSocket.on("hr_email_prepared", (data) => handleEvent("email_prepared", data));
    newSocket.on("hr_email_sent", (data) => handleEvent("email_sent", data));
    newSocket.on("hr_complete", (data) => {
      if (callbacksRef.current.onComplete) {
        callbacksRef.current.onComplete(data);
      }
    });
    newSocket.on("hr_error", (data) => {
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(data);
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const sendHRChat = ({ payload, onEvent, onComplete, onError }) => {
    if (!socket || !isConnected) {
      console.log("[HR CHAT] Socket not connected. isConnected:", isConnected);
      return false;
    }

    // Update callbacks
    callbacksRef.current = { onEvent, onComplete, onError };

    console.log("[HR CHAT] Emitting payload:", payload);
    socket.emit("hr_chat", payload);
    
    return true;
  };

  return { isConnected, sendHRChat };
};