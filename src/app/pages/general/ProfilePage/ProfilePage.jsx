import { Briefcase, Building, Mail, Phone, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../../../../shared/api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);

  const [userInfo, setUserInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    institution: null,
    roles: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storageData = localStorage.getItem("userData");
        if (!storageData) {
          navigate("/");
          return;
        }

        const parsedData = JSON.parse(storageData);
        const userId = parsedData.user_id;

        if (userId) {
          const data = await UserAPI.getUserById(userId);

          setUserInfo({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            job_title: data.job_title || "Sin cargo definido",
            institution: data.institution ? data.institution.institute_name : "Sin Institución",
            roles: data.roles || [],
          });
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) return <div className="loading-screen">Cargando perfil...</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-body">
        {/* --- Contenido principal --- */}
        <main className="profile-content">
          <div className="content-wrapper">
            {activeTab === "personal" ? (
              <div className="info-card fade-in">
                <div className="card-header">
                  <h2>Información Personal</h2>
                  <p>Gestiona tu información básica y de contacto.</p>
                </div>

                <form className="info-grid">
                  <div className="form-group">
                    <label>
                      <User size={16} /> Nombres
                    </label>
                    <input type="text" value={userInfo.first_name} readOnly className="readonly-input" />
                  </div>
                  <div className="form-group">
                    <label>
                      <User size={16} /> Apellidos
                    </label>
                    <input type="text" value={userInfo.last_name} readOnly className="readonly-input" />
                  </div>
                  <div className="form-group">
                    <label>
                      <Mail size={16} /> Correo Electrónico
                    </label>
                    <input type="email" value={userInfo.email} readOnly className="readonly-input" />
                  </div>
                  <div className="form-group">
                    <label>
                      <Phone size={16} /> Teléfono
                    </label>
                    <input type="text" value={userInfo.phone} readOnly className="readonly-input" />
                  </div>
                  <div className="form-group full-width">
                    <label>
                      <Briefcase size={16} /> Cargo / Rol
                    </label>
                    <input type="text" value={userInfo.job_title} readOnly className="readonly-input" />
                  </div>
                  <div className="form-group full-width">
                    <label>
                      <Building size={16} /> Institución Asociada
                    </label>
                    <input type="text" value={userInfo.institution} readOnly className="readonly-input" />
                  </div>
                </form>
              </div>
            ) : (
              <div className="info-card fade-in">
                <div className="card-header">
                  <h2>Seguridad</h2>
                  <p>Configuración de acceso y contraseña.</p>
                </div>
                <div className="security-placeholder">
                  <Shield size={48} className="text-gray" />
                  <p>Para cambiar tu contraseña, contacta al administrador o usa el flujo de recuperación.</p>
                  <button className="btn-secondary">Solicitar cambio de clave</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
