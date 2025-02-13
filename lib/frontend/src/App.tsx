import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import "./App.css";
import SideNav from "./components/layout/SideNav";

import Dashboard from "./components/dashboard/dashboard";
import Customers from "./components/customers/customers";
import Devices from "./components/devices/devices";
import Header from "./components/layout/Header";
import Login from "./components/auth/Login";
import MonthlyPayment from "./components/monthlyPayment/MonthlyPayment";
import Orders from "./components/orders/Orders";
import Branches from "./components/branches/Branches";
import Permissions from "./components/Permissions/Permissions";
import ProtectedRoute from "./components/ProtectedRoute";

import dashboardIconWhite from "../src/assets/dashboardIcon-white.svg";
import dashboardIconBlue from "../src/assets/dashboardIcon-blue.svg";
import customerIconWhite from "../src/assets/customerIcon-white.svg";
import customerIconBlue from "../src/assets/customerIcon-blue.svg";
import devicesIconWhite from "../src/assets/deviceIcon-white.svg";
import devicesIconBlue from "../src/assets/deviceIcon-blue.svg";
import ordersIconWhite from "../src/assets/orders-white.svg";
import ordersIconBlue from "../src/assets/orders-blue.svg";
import branchesIconWhite from "../src/assets/branches-white.svg";
import branchesIconBlue from "../src/assets/branches-blue.svg";
import monthlyPaymentIconWhite from "../src/assets/monthlyPayment-white.svg";
import monthlyPaymentIconBlue from "../src/assets/monthlyPayment-blue.svg";
import permissionsIconWhite from "../src/assets/permissions-white.svg";
import permissionsIconBlue from "../src/assets/permissions-blue.svg";

import { setupAxiosInterceptors } from "./api/axiosInterceptor";
import { colors, theme } from "./styles/theme";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <ProtectedRoute>
        <Header />
      </ProtectedRoute>

      <div style={{ display: "flex" }}>
        <ProtectedRoute>
          <SideNav
            listItems={[
              {
                iconWhite: dashboardIconWhite,
                iconBlue: dashboardIconBlue,
                link: "../dashboard",
                text: t('dashboard'),
              },
              {
                iconWhite: customerIconWhite,
                iconBlue: customerIconBlue,
                link: "../customers",
                text: t('customers'),
              },
              {
                iconWhite: devicesIconWhite,
                iconBlue: devicesIconBlue,
                link: "../devices",
                text: t('devices'),
              },
              {
                iconWhite: ordersIconWhite,
                iconBlue: ordersIconBlue,
                link: "../orders",
                text: t('orders'),
              },
              {
                iconWhite: branchesIconWhite,
                iconBlue: branchesIconBlue,
                link: "../branches",
                text: t('branches'),
              },
              {
                iconWhite: monthlyPaymentIconWhite,
                iconBlue: monthlyPaymentIconBlue,
                link: "../monthlyPayment",
                text: t('standingOrder'),
              },
              {
                iconWhite: permissionsIconWhite,
                iconBlue: permissionsIconBlue,
                link: "../permissions",
                text: t('permissions'),
              },
            ]}
          />
        </ProtectedRoute>
        <main style={{ flexGrow: 1, padding: "20px", overflow: 'auto', background: colors.brand.color_14 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/devices" element={
              <ProtectedRoute>
                <Devices />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/branches" element={
              <ProtectedRoute>
                <Branches />
              </ProtectedRoute>
            } />
            <Route path="/monthlyPayment" element={
              <ProtectedRoute>
                <MonthlyPayment />
              </ProtectedRoute>
            } />
            <Route path="/permissions" element={
              <ProtectedRoute>
                <Permissions />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </ThemeProvider >
  );
}

export default App;
