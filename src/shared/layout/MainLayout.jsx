import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; 
import Header from "./Header";   

export default function MainLayout() {
  return (
    <div className="dashboard-container">
      <Header />
      <main className="dashboard-main">
        <Sidebar />
        <section className="dashboard-content">
          <Outlet /> {/* Aquí se renderizarán las páginas hijas */}
        </section>
      </main>
    </div>
  );
}