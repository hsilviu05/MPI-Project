import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AssetsPage } from "./pages/AssetsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PortfolioHoldingsPage } from "./pages/PortfolioHoldingsPage";
import { PortfoliosPage } from "./pages/PortfoliosPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolios" element={<PortfoliosPage />} />
          <Route path="/portfolios/:portfolioId/holdings" element={<PortfolioHoldingsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
