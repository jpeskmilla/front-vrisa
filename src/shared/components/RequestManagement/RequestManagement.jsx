import { Building, MapPin, UserCheck, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import TableDataset from "../TableDataset/TableDataset";

/**
 * Componente unificado para gestionar solicitudes.
 * 
 * @param {string} role - 'super_admin' | 'institution_head'
 * @param {Array} entityRequests - Lista de solicitudes de entidades (Instituciones o Estaciones)
 * @param {Array} researcherRequests - Lista de solicitudes de investigadores
 * @param {Function} onApprove - Callback (item, type) => void
 * @param {Function} onReject - Callback (item, type) => void
 * @param {boolean} loading - Estado de carga
 */
export default function RequestsManagement({ 
  role, 
  entityRequests, 
  researcherRequests, 
  onApprove, 
  onReject,
  loading 
}) {
  const [activeTab, setActiveTab] = useState("ENTITIES"); // ENTITIES | RESEARCHERS

  // Configuración dinámica según el rol
  const config = {
    super_admin: {
      entityLabel: "Instituciones",
      entityIcon: <Building size={18} />,
      entityColor: "#4339F2", // Azul
      emptyMsg: "No hay instituciones pendientes de aprobación.",
    },
    institution_head: {
      entityLabel: "Estaciones",
      entityIcon: <MapPin size={18} />,
      entityColor: "#059669", // Verde
      emptyMsg: "No hay solicitudes de estaciones pendientes.",
    }
  };

  const currentConfig = config[role] || config.super_admin;

  // --- COLUMNAS PARA ENTIDADES (Instituciones o Estaciones) ---
  const entityColumns = [
    {
      header: role === 'super_admin' ? "Institución" : "Estación",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: `${currentConfig.entityColor}20`, // Color con transparencia
            color: currentConfig.entityColor,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {currentConfig.entityIcon}
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#1e293b" }}>
                {role === 'super_admin' ? row.institute_name : row.station_name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {role === 'super_admin' ? row.physic_address : row.location ? "Ubicación Georreferenciada" : "Sin ubicación"}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Fecha Solicitud",
      cell: (row) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <ActionButton onClick={() => onApprove(row, 'ENTITY')} type="approve" />
          <ActionButton onClick={() => onReject(row, 'ENTITY')} type="reject" />
        </div>
      )
    }
  ];

  // --- COLUMNAS PARA INVESTIGADORES ---
  const researcherColumns = [
    {
      header: "Investigador",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            background: "#f3e8ff", color: "#7e22ce",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <UserCheck size={18} />
          </div>
          <div>
            <div style={{ fontWeight: "600", color: "#1e293b" }}>{row.full_name}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{row.user_email}</div>
          </div>
        </div>
      )
    },
    {
        header: "Contexto",
        cell: (row) => (
            role === 'super_admin' 
                ? <span style={{fontSize: '0.75rem', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px'}}>Independiente</span>
                : <span style={{fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '4px 8px', borderRadius: '4px'}}>Institucional</span>
        )
    },
    {
      header: "Fecha",
      cell: (row) => new Date(row.assigned_at).toLocaleDateString()
    },
    {
      header: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <ActionButton onClick={() => onApprove(row, 'RESEARCHER')} type="approve" />
          <ActionButton onClick={() => onReject(row, 'RESEARCHER')} type="reject" />
        </div>
      )
    }
  ];

  return (
    <div className="requests-management-container" style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      {/* HEADER CON TABS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Gestión de Solicitudes</h3>
        
        <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
          <TabButton 
            active={activeTab === "ENTITIES"} 
            onClick={() => setActiveTab("ENTITIES")}
            icon={currentConfig.entityIcon}
            label={currentConfig.entityLabel}
            count={entityRequests.length}
          />
          <TabButton 
            active={activeTab === "RESEARCHERS"} 
            onClick={() => setActiveTab("RESEARCHERS")}
            icon={<UserCheck size={16} />}
            label="Investigadores"
            count={researcherRequests.length}
          />
        </div>
      </div>

      {/* CONTENIDO DE LA TABLA */}
      {activeTab === "ENTITIES" ? (
        <TableDataset 
          columns={entityColumns} 
          data={entityRequests} 
          isLoading={loading}
          emptyMessage={currentConfig.emptyMsg}
        />
      ) : (
        <TableDataset 
          columns={researcherColumns} 
          data={researcherRequests} 
          isLoading={loading}
          emptyMessage="No hay solicitudes de investigadores pendientes."
        />
      )}
    </div>
  );
}

// Sub-componentes para estilos limpios
function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px', border: 'none', borderRadius: '6px',
        background: active ? 'white' : 'transparent',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        color: active ? '#1e293b' : '#64748b',
        fontWeight: active ? '600' : '500',
        cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span style={{ 
            background: '#ef4444', color: 'white', fontSize: '0.7rem', 
            padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' 
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

function ActionButton({ onClick, type }) {
  const isApprove = type === 'approve';
  return (
    <button
      onClick={onClick}
      title={isApprove ? "Aprobar" : "Rechazar"}
      style={{
        width: '32px', height: '32px', borderRadius: '6px',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isApprove ? '#dcfce7' : '#fee2e2',
        color: isApprove ? '#16a34a' : '#dc2626',
        transition: 'transform 0.1s'
      }}
    >
      {isApprove ? <CheckCircle size={16} /> : <XCircle size={16} />}
    </button>
  );
}
