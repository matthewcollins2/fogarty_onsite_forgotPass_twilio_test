import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoutes from "./routes/publicroutes";
import AdminRoutes from "./routes/adminroutes";
import Login from "./pages/public/UserLogin";
import ProtectedRoute from "./component/ProtectedRoute";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ForgotPassword from "./pages/public/ForgotPassword";



const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <Routes>
          {/* Public portal: Home, Request Quote, etc. */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* Login page */}
          <Route path="/userlogin" element={<Login />} />

          {/* For forgetpassword ... email works */}
          <Route path="/userver" element={<ForgotPassword />} />

          {/* ADD THIS LINE HERE */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* PROTECTED: Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default App;