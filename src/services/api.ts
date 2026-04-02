const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * The backend wraps every response in { success, data, message }.
 * This helper unwraps `.data` automatically.
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("driver_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || res.statusText);
  }
  const json = await res.json();
  // Backend ResponseInterceptor wraps in { success, data, message }
  return json.data !== undefined ? json.data : json;
}

/* ── Auth ── */

export async function driverLogin(email: string, password: string) {
  const data = await request<{ access_token: string; driver: any }>("/driver-auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("driver_token", data.access_token);
  localStorage.setItem("driver_data", JSON.stringify(data.driver));
  return data;
}

export function driverLogout() {
  localStorage.removeItem("driver_token");
  localStorage.removeItem("driver_data");
}

export function getStoredDriver() {
  const raw = localStorage.getItem("driver_data");
  return raw ? JSON.parse(raw) : null;
}

export function getStoredToken() {
  return localStorage.getItem("driver_token");
}

/* ── Deliveries ── */

export function getDriverDeliveries(driverId: string) {
  return request<any[]>(`/delivery/driver/${driverId}`);
}

export function getActiveDeliveries(driverId: string) {
  return request<any[]>(`/delivery/driver/${driverId}/active`);
}

export function updateDeliveryStatus(shipmentId: string, driverId: string, action: string) {
  return request<any>(`/delivery/${shipmentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ driverId, action }),
  });
}

/* ── Messaging ── */

export function getMessages(driverId: string) {
  return request<any[]>(`/messaging/${driverId}`);
}

export function sendMessage(driverId: string, sender: "admin" | "driver", text: string) {
  return request<any>(`/messaging/${driverId}`, {
    method: "POST",
    body: JSON.stringify({ sender, text }),
  });
}

export function markMessagesRead(driverId: string, readBy: "admin" | "driver") {
  return request<void>(`/messaging/${driverId}/read`, {
    method: "PATCH",
    body: JSON.stringify({ readBy }),
  });
}

export function getUnreadCount(driverId: string, forUser: "admin" | "driver") {
  return request<{ count: number }>(`/messaging/${driverId}/unread?for=${forUser}`);
}

export function getConversations() {
  return request<any[]>("/messaging/conversations");
}

/* ── Bank Details ── */

export function getBankDetails(driverId: string) {
  return request<{ id: string; bankName: string | null; bankAccount: string | null; bankAccountName: string | null }>(`/drivers/${driverId}/bank-details`);
}

export function updateBankDetails(driverId: string, data: { bankName: string; bankAccount: string; bankAccountName: string }) {
  return request<{ id: string; bankName: string; bankAccount: string; bankAccountName: string }>(`/drivers/${driverId}/bank-details`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
