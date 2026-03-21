import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Messages from "./pages/Messages";
import Earnings from "./pages/Earnings";
import Fleet from "./pages/Fleet";
import Login from "./pages/Login";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0b1118", color: "var(--text-tertiary)" }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="deliveries" element={<Deliveries />} />
              <Route path="messages" element={<Messages />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="fleet" element={<Fleet />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
