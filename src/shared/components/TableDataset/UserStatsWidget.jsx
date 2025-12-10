import { Building, Shield, Radio, UserCheck, User } from "lucide-react";

export default function UserStatsWidget({ stats }) {
  const breakdown = stats.breakdown || {};
  
  const rows = [
    { label: "Super Admins", count: breakdown.super_admin || 0, icon: <Shield size={14} />, color: "#4339F2" },
    { label: "Instituciones", count: breakdown.institution_head || 0, icon: <Building size={14} />, color: "#059669" },
    { label: "Admin. Estación", count: breakdown.station_admin || 0, icon: <Radio size={14} />, color: "#7c3aed" },
    { label: "Investigadores", count: breakdown.researcher || 0, icon: <UserCheck size={14} />, color: "#db2777" },
    { label: "Ciudadanos", count: breakdown.citizen || 0, icon: <User size={14} />, color: "#64748b" },
  ];

  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1rem", color: "#1e293b", margin: 0, fontWeight: 700 }}>Usuarios por Rol</h3>
        <span style={{ fontSize: "0.8rem", background: "#f1f5f9", padding: "4px 8px", borderRadius: "12px", color: "#64748b" }}>
          Total: {stats.total_users}
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} style={{ borderBottom: "1px solid #f8fafc" }}>
              <td style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ color: row.color, background: `${row.color}15`, padding: "6px", borderRadius: "6px", display: 'flex' }}>
                  {row.icon}
                </div>
                <span style={{ fontSize: "0.9rem", color: "#475569", fontWeight: 500 }}>{row.label}</span>
              </td>
              <td style={{ textAlign: "right", fontWeight: "700", color: "#1e293b" }}>
                {row.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
