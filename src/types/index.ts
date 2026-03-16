export type DeliveryStatus = "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "failed";

export interface Delivery {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: DeliveryStatus;
  scheduledAt: string;
  estimatedArrival: string | null;
  distance: number;
  earnings: number;
  notes: string;
  weight: number;
  items: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  rating: number;
  totalDeliveries: number;
  vehicleType: string;
  vehiclePlate: string;
  status: "online" | "offline" | "on_delivery";
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isDriver: boolean;
  read: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string | null;
  online: boolean;
}

export interface Notification {
  id: string;
  type: "delivery" | "message" | "earnings" | "system";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface EarningsSummary {
  today: number;
  week: number;
  month: number;
  pending: number;
}

export interface EarningsDay {
  day: string;
  amount: number;
  deliveries: number;
}

export interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  mileage: number;
  lastService: string;
  nextService: string;
  fuelLevel: number;
  status: "active" | "maintenance" | "inactive";
  insurance: string;
}

export const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  assigned: { label: "Assigned", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  picked_up: { label: "Picked Up", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  in_transit: { label: "In Transit", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  delivered: { label: "Delivered", color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
  failed: { label: "Failed", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};
