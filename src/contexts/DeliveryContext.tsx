import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { getDriverDeliveries, updateDeliveryStatus as apiUpdateStatus } from "../services/api";
import type { Delivery, DeliveryStatus } from "../types";

/* ─── Types ─── */

interface IncomingAlert {
  delivery: Delivery;
  receivedAt: number;
}

interface DeliveryState {
  deliveries: Delivery[];
  loading: boolean;
  /** Delivery currently being tracked (live location sent to admin) */
  activeDeliveryId: string | null;
  /** Pending alerts for new assignments */
  alerts: IncomingAlert[];
}

type DeliveryAction =
  | { type: "SET_DELIVERIES"; deliveries: Delivery[] }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "UPDATE_STATUS"; deliveryId: string; status: DeliveryStatus }
  | { type: "NEW_ASSIGNMENT"; delivery: Delivery }
  | { type: "DISMISS_ALERT"; deliveryId: string }
  | { type: "SET_ACTIVE_DELIVERY"; deliveryId: string | null };

interface DeliveryContextValue extends DeliveryState {
  acceptDelivery: (deliveryId: string) => void;
  rejectDelivery: (deliveryId: string) => void;
  pickUpDelivery: (deliveryId: string) => void;
  startDelivery: (deliveryId: string) => void;
  completeDelivery: (deliveryId: string) => void;
  failDelivery: (deliveryId: string) => void;
  handOffDelivery: (deliveryId: string) => void;
  dismissAlert: (deliveryId: string) => void;
  refreshDeliveries: () => void;
}

/* ─── Reducer ─── */

function reducer(state: DeliveryState, action: DeliveryAction): DeliveryState {
  switch (action.type) {
    case "SET_DELIVERIES":
      return { ...state, deliveries: action.deliveries, loading: false };

    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "UPDATE_STATUS":
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.deliveryId ? { ...d, status: action.status } : d,
        ),
        activeDeliveryId:
          (action.status === "delivered" || action.status === "failed" || action.status === "handed_off") &&
          state.activeDeliveryId === action.deliveryId
            ? null
            : state.activeDeliveryId,
      };

    case "NEW_ASSIGNMENT":
      return {
        ...state,
        deliveries: [action.delivery, ...state.deliveries],
        alerts: [...state.alerts, { delivery: action.delivery, receivedAt: Date.now() }],
      };

    case "DISMISS_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((a) => a.delivery.id !== action.deliveryId),
      };

    case "SET_ACTIVE_DELIVERY":
      return { ...state, activeDeliveryId: action.deliveryId };

    default:
      return state;
  }
}

/* ─── Context ─── */

const DeliveryContext = createContext<DeliveryContextValue | null>(null);

export function useDeliveries() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDeliveries must be used inside DeliveryProvider");
  return ctx;
}

/* ─── Provider ─── */

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { driver } = useAuth();
  const driverId = driver?.id;

  const [state, dispatch] = useReducer(reducer, {
    deliveries: [],
    loading: true,
    activeDeliveryId: null,
    alerts: [],
  });

  /* ── Fetch deliveries from API ── */
  const refreshDeliveries = useCallback(() => {
    if (!driverId) return;
    dispatch({ type: "SET_LOADING", loading: true });
    getDriverDeliveries(driverId)
      .then((deliveries) => dispatch({ type: "SET_DELIVERIES", deliveries }))
      .catch((err) => {
        console.error("Failed to fetch deliveries:", err);
        dispatch({ type: "SET_LOADING", loading: false });
      });
  }, [driverId]);

  useEffect(() => {
    refreshDeliveries();
  }, [refreshDeliveries]);

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!socket || !driverId) return;

    const onNewAssignment = (delivery: Delivery) => {
      dispatch({ type: "NEW_ASSIGNMENT", delivery });
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    };

    const onStatusUpdate = (data: { deliveryId?: string; shipmentId?: string; newStatus?: string; status?: DeliveryStatus }) => {
      const id = data.deliveryId || data.shipmentId;
      if (!id) return;
      // Map backend status strings to frontend status
      const statusMap: Record<string, DeliveryStatus> = {
        PENDING: "pending",
        QUOTED: "pending",
        ACCEPTED: "assigned",
        PICKED_UP: "picked_up",
        IN_TRANSIT: "in_transit",
        HANDED_OFF: "handed_off",
        DELIVERED: "delivered",
        CANCELLED: "failed",
      };
      const raw = data.newStatus || data.status || "";
      const mapped = statusMap[raw] || (raw as DeliveryStatus);
      dispatch({ type: "UPDATE_STATUS", deliveryId: id, status: mapped });
    };

    socket.on("delivery:assigned", onNewAssignment);
    socket.on("delivery:status-updated", onStatusUpdate);
    socket.on("delivery:status-confirmed", onStatusUpdate);

    return () => {
      socket.off("delivery:assigned", onNewAssignment);
      socket.off("delivery:status-updated", onStatusUpdate);
      socket.off("delivery:status-confirmed", onStatusUpdate);
    };
  }, [socket, driverId]);

  /* ── Actions — call REST API + emit socket ── */

  const emitStatus = useCallback(
    (deliveryId: string, action: string, frontendStatus: DeliveryStatus) => {
      if (!driverId) return;
      // Optimistic update
      dispatch({ type: "UPDATE_STATUS", deliveryId, status: frontendStatus });
      // Call REST API
      apiUpdateStatus(deliveryId, driverId, action).catch((err) => {
        console.error(`Failed to update status (${action}):`, err);
        // Refresh to get real state on error
        refreshDeliveries();
      });
      // Also emit via socket for real-time
      socket?.emit("delivery:status-change", {
        shipmentId: deliveryId,
        driverId,
        action,
      });
    },
    [socket, driverId, refreshDeliveries],
  );

  const acceptDelivery = useCallback(
    (deliveryId: string) => {
      const hasActive = state.deliveries.some(
        (d) =>
          d.id !== deliveryId &&
          d.status !== "delivered" &&
          d.status !== "failed" &&
          d.status !== "pending",
      );
      if (hasActive) {
        alert("You must complete your current delivery before accepting a new one.");
        return;
      }
      emitStatus(deliveryId, "accept", "assigned");
      dispatch({ type: "DISMISS_ALERT", deliveryId });
    },
    [emitStatus, state.deliveries],
  );

  const rejectDelivery = useCallback(
    (deliveryId: string) => {
      dispatch({ type: "DISMISS_ALERT", deliveryId });
      if (!driverId) return;
      socket?.emit("delivery:rejected", {
        deliveryId,
        driverId,
        timestamp: new Date().toISOString(),
      });
      dispatch({ type: "UPDATE_STATUS", deliveryId, status: "failed" });
    },
    [socket, driverId],
  );

  const pickUpDelivery = useCallback(
    (deliveryId: string) => emitStatus(deliveryId, "pickup", "picked_up"),
    [emitStatus],
  );

  const startDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "start", "in_transit");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId });
    },
    [emitStatus],
  );

  const completeDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "complete", "delivered");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId: null });
    },
    [emitStatus],
  );

  const failDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "fail", "failed");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId: null });
    },
    [emitStatus],
  );

  const handOffDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "handoff", "handed_off");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId: null });
      socket?.emit("driver:tracking-stopped", { driverId });
    },
    [emitStatus, socket, driverId],
  );

  const dismissAlert = useCallback(
    (deliveryId: string) => dispatch({ type: "DISMISS_ALERT", deliveryId }),
    [],
  );

  return (
    <DeliveryContext.Provider
      value={{
        ...state,
        acceptDelivery,
        rejectDelivery,
        pickUpDelivery,
        startDelivery,
        completeDelivery,
        failDelivery,
        handOffDelivery,
        dismissAlert,
        refreshDeliveries,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}
