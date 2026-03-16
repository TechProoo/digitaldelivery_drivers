import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface UseLocationTrackingOptions {
  /** Driver ID to broadcast with */
  driverId: string;
  /** Active delivery ID (null = not tracking) */
  activeDeliveryId: string | null;
  /** How often to emit location (ms). Default: 5000 */
  interval?: number;
}

export function useLocationTracking({
  driverId,
  activeDeliveryId,
  interval = 5000,
}: UseLocationTrackingOptions) {
  const { socket, connected } = useSocket();
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const emitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPositionRef = useRef<GeoPosition | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError(null);
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const geo: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        };
        setPosition(geo);
        latestPositionRef.current = geo;
      },
      (err) => {
        setError(err.message);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (emitIntervalRef.current !== null) {
      clearInterval(emitIntervalRef.current);
      emitIntervalRef.current = null;
    }
    setTracking(false);
  }, []);

  // Emit location to server via socket at regular intervals
  useEffect(() => {
    if (!tracking || !socket || !connected || !activeDeliveryId) {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
        emitIntervalRef.current = null;
      }
      return;
    }

    // Emit immediately on start
    if (latestPositionRef.current) {
      socket.emit("driver:location", {
        driverId,
        deliveryId: activeDeliveryId,
        position: latestPositionRef.current,
      });
    }

    emitIntervalRef.current = setInterval(() => {
      if (latestPositionRef.current) {
        socket.emit("driver:location", {
          driverId,
          deliveryId: activeDeliveryId,
          position: latestPositionRef.current,
        });
      }
    }, interval);

    return () => {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
        emitIntervalRef.current = null;
      }
    };
  }, [tracking, socket, connected, activeDeliveryId, driverId, interval]);

  // Auto-start tracking when there's an active delivery
  useEffect(() => {
    if (activeDeliveryId && !tracking) {
      startTracking();
    }
    if (!activeDeliveryId && tracking) {
      stopTracking();
      // Notify server driver stopped tracking
      socket?.emit("driver:tracking-stopped", { driverId });
    }
  }, [activeDeliveryId, tracking, startTracking, stopTracking, socket, driverId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
      }
    };
  }, []);

  return {
    position,
    tracking,
    error,
    startTracking,
    stopTracking,
  };
}
