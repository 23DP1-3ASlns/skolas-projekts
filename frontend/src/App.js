import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PublicLayout from "@/components/PublicLayout";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import News from "@/pages/News";
import History from "@/pages/History";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import Schedule from "@/pages/Schedule";
import Contacts from "@/pages/Contacts";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminNews from "@/pages/admin/AdminNews";
import AdminSchedule from "@/pages/admin/AdminSchedule";
import AdminContent from "@/pages/admin/AdminContent";
import AdminUsers from "@/pages/admin/AdminUsers";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/jaunumi" element={<News />} />
              <Route path="/vesture" element={<History />} />
              <Route path="/skoleniem" element={<Students />} />
              <Route path="/skolotajiem" element={<Teachers />} />
              <Route path="/stundas" element={<Schedule />} />
              <Route path="/kontakti" element={<Contacts />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="jaunumi" element={<AdminNews />} />
              <Route path="stundas" element={<AdminSchedule />} />
              <Route path="lapas" element={<AdminContent />} />
              <Route path="lietotaji" element={<AdminUsers />} />
            </Route>
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
