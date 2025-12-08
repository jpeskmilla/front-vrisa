import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./layout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">
          {/* Aquí se renderiza AirQualityPage, DashboardPage, etc. */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}