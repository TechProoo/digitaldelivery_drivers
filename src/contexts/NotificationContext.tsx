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
import type { Notification } from "../types";

interface NotificationState {
  notifications: Notification[];
}

type NotificationAction =
  | { type: "ADD"; notification: Notification }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "LOAD"; notifications: Notification[] };

interface NotificationContextValue extends NotificationState {
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const STORAGE_KEY = "dd_driver_notifications";
const MAX_NOTIFICATIONS = 50;

function reducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case "ADD":
      return {
        notifications: [action.notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
      };
    case "MARK_READ":
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };
    case "MARK_ALL_READ":
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "LOAD":
      return { notifications: action.notifications };
    default:
      return state;
  }
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const { driver } = useAuth();

  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[];
        dispatch({ type: "LOAD", notifications: parsed.slice(0, MAX_NOTIFICATIONS) });
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notifications));
    } catch {
      // ignore
    }
  }, [state.notifications]);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const notification: Notification = {
        ...n,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      dispatch({ type: "ADD", notification });
    },
    [],
  );

  // Listen for socket events and generate notifications
  useEffect(() => {
    if (!socket || !driver) return;

    // New delivery assigned
    const onDeliveryAssigned = (delivery: any) => {
      addNotification({
        type: "delivery",
        title: "New Delivery Assigned",
        body: `Pickup from ${delivery.pickupAddress || delivery.pickupLocation || "pickup location"} to ${delivery.dropoffAddress || delivery.destinationLocation || "destination"}.`,
      });
    };

    // Delivery status updated by admin
    const onStatusUpdate = (data: any) => {
      const statusLabels: Record<string, string> = {
        PENDING: "Pending",
        QUOTED: "Quoted",
        ACCEPTED: "Accepted",
        PICKED_UP: "Picked Up",
        IN_TRANSIT: "In Transit",
        HANDED_OFF: "Handed Off",
        IN_AIR: "In Air",
        AT_SEA: "At Sea",
        ARRIVED_HUB: "Arrived at Hub",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
      };
      const status = data.newStatus || data.status || "";
      const label = statusLabels[status] || status;
      addNotification({
        type: "delivery",
        title: "Delivery Status Updated",
        body: `Delivery status changed to ${label}.`,
      });
    };

    // New message from admin
    const onNewMessage = (msg: any) => {
      if (msg.sender === "admin") {
        addNotification({
          type: "message",
          title: "New Message from Admin",
          body: msg.text?.length > 80 ? msg.text.substring(0, 80) + "..." : msg.text || "You have a new message.",
        });
      }
    };

    socket.on("delivery:assigned", onDeliveryAssigned);
    socket.on("delivery:status-updated", onStatusUpdate);
    socket.on("delivery:status-confirmed", onStatusUpdate);
    socket.on("message:new", onNewMessage);

    return () => {
      socket.off("delivery:assigned", onDeliveryAssigned);
      socket.off("delivery:status-updated", onStatusUpdate);
      socket.off("delivery:status-confirmed", onStatusUpdate);
      socket.off("message:new", onNewMessage);
    };
  }, [socket, driver, addNotification]);

  const markRead = useCallback((id: string) => dispatch({ type: "MARK_READ", id }), []);
  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ ...state, unreadCount, addNotification, markRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
