import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useSocket } from "./SocketContext";
import { DELIVERIES, CURRENT_DRIVER } from "../data/mock";
import type { Delivery, DeliveryStatus } from "../types";

/* ─── Types ─── */

interface IncomingAlert {
  delivery: Delivery;
  receivedAt: number;
}

interface DeliveryState {
  deliveries: Delivery[];
  /** Delivery currently being tracked (live location sent to admin) */
  activeDeliveryId: string | null;
  /** Pending alerts for new assignments */
  alerts: IncomingAlert[];
}

type DeliveryAction =
  | { type: "SET_DELIVERIES"; deliveries: Delivery[] }
  | { type: "UPDATE_STATUS"; deliveryId: string; status: DeliveryStatus }
  | { type: "NEW_ASSIGNMENT"; delivery: Delivery }
  | { type: "DISMISS_ALERT"; deliveryId: string }
  | { type: "SET_ACTIVE_DELIVERY"; deliveryId: string | null };

interface DeliveryContextValue extends DeliveryState {
  /** Accept an assigned delivery */
  acceptDelivery: (deliveryId: string) => void;
  /** Reject / decline a delivery */
  rejectDelivery: (deliveryId: string) => void;
  /** Mark as picked up */
  pickUpDelivery: (deliveryId: string) => void;
  /** Start delivery — begins live location tracking */
  startDelivery: (deliveryId: string) => void;
  /** Complete / mark as delivered — stops tracking */
  completeDelivery: (deliveryId: string) => void;
  /** Report failed delivery */
  failDelivery: (deliveryId: string) => void;
  /** Hand off to carrier (AIR/SEA) — pauses GPS tracking */
  handOffDelivery: (deliveryId: string) => void;
  /** Dismiss the new-assignment alert toast */
  dismissAlert: (deliveryId: string) => void;
}

/* ─── Reducer ─── */

function reducer(state: DeliveryState, action: DeliveryAction): DeliveryState {
  switch (action.type) {
    case "SET_DELIVERIES":
      return { ...state, deliveries: action.deliveries };

    case "UPDATE_STATUS":
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.deliveryId ? { ...d, status: action.status } : d,
        ),
        // If delivered, failed, or handed off, clear active tracking
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

  const [state, dispatch] = useReducer(reducer, {
    deliveries: DELIVERIES,
    activeDeliveryId: null,
    alerts: [],
  });

  /* ── Socket listeners ── */
  useEffect(() => {
    if (!socket) return;

    // Admin assigns a new delivery to this driver
    const onNewAssignment = (delivery: Delivery) => {
      dispatch({ type: "NEW_ASSIGNMENT", delivery });
      // Play notification sound if available
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    };

    // Admin or system updates a delivery status
    const onStatusUpdate = (data: { deliveryId: string; status: DeliveryStatus }) => {
      dispatch({ type: "UPDATE_STATUS", deliveryId: data.deliveryId, status: data.status });
    };

    socket.on("delivery:assigned", onNewAssignment);
    socket.on("delivery:status-updated", onStatusUpdate);

    // Register driver with server
    socket.emit("driver:register", { driverId: CURRENT_DRIVER.id });

    return () => {
      socket.off("delivery:assigned", onNewAssignment);
      socket.off("delivery:status-updated", onStatusUpdate);
    };
  }, [socket]);

  /* ── Actions ── */

  const emitStatus = useCallback(
    (deliveryId: string, status: DeliveryStatus) => {
      dispatch({ type: "UPDATE_STATUS", deliveryId, status });
      socket?.emit("delivery:status-change", {
        deliveryId,
        driverId: CURRENT_DRIVER.id,
        status,
        timestamp: new Date().toISOString(),
      });
    },
    [socket],
  );

  const acceptDelivery = useCallback(
    (deliveryId: string) => {
      // Block accepting if driver already has an active delivery
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
      emitStatus(deliveryId, "assigned");
      dispatch({ type: "DISMISS_ALERT", deliveryId });
    },
    [emitStatus, state.deliveries],
  );

  const rejectDelivery = useCallback(
    (deliveryId: string) => {
      dispatch({ type: "DISMISS_ALERT", deliveryId });
      socket?.emit("delivery:rejected", {
        deliveryId,
        driverId: CURRENT_DRIVER.id,
        timestamp: new Date().toISOString(),
      });
      // Remove from list
      dispatch({ type: "UPDATE_STATUS", deliveryId, status: "failed" });
    },
    [socket],
  );

  const pickUpDelivery = useCallback(
    (deliveryId: string) => emitStatus(deliveryId, "picked_up"),
    [emitStatus],
  );

  const startDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "in_transit");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId });
      // The useLocationTracking hook in Tracking page will
      // automatically start broadcasting when activeDeliveryId is set
      socket?.emit("driver:delivery-started", {
        deliveryId,
        driverId: CURRENT_DRIVER.id,
        timestamp: new Date().toISOString(),
      });
    },
    [emitStatus, socket],
  );

  const completeDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "delivered");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId: null });
      socket?.emit("driver:delivery-completed", {
        deliveryId,
        driverId: CURRENT_DRIVER.id,
        timestamp: new Date().toISOString(),
      });
    },
    [emitStatus, socket],
  );

  const failDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "failed");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId: null });
    },
    [emitStatus],
  );

  const handOffDelivery = useCallback(
    (deliveryId: string) => {
      emitStatus(deliveryId, "handed_off");
      dispatch({ type: "SET_ACTIVE_DELIVERY", deliveryId: null });
      socket?.emit("driver:tracking-stopped", { driverId: CURRENT_DRIVER.id });
    },
    [emitStatus, socket],
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
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
}
