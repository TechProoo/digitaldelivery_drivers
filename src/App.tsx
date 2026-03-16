import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Deliveries from "./pages/Deliveries";
import Tracking from "./pages/Tracking";
import Messages from "./pages/Messages";
import Earnings from "./pages/Earnings";
import Fleet from "./pages/Fleet";

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="messages" element={<Messages />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="fleet" element={<Fleet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
