import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, InstitutionAPI } from "../../../../shared/api";
import { formatApiErrors } from "../../../../shared/utils";
import "./RegisterResearcherPage.css";

/**
 * Página para completar el registro de investigadores.
 * Distingue entre Investigador Institucional e Independiente.
 *  - Un investigador institucional debe seleccionar su institución de un dropdown.
 *  - Un investigador independiente no selecciona institución y su perfil es validado por administradores globales.
 * Ambos tipos deben subir la tarjeta profesional.
 * @returns Componente de la página de registro de investigadores.
 */
export default function RegisterResearcherPage() {
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [belongsToInstitution, setBelongsToInstitution] = useState(null); 

  const [formData, setFormData] = useState({
    fullName: "",
    documentType: "",
    documentNumber: "",
    institutionId: "",
    frontCard: null,
    backCard: null,
  });

  const documentTypes = ["Cédula de ciudadanía", "Cédula de extranjería", "Pasaporte"];

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) setUserData(JSON.parse(storedUserData));

    const loadInstitutions = async () => {
      try {
        const data = await InstitutionAPI.getInstitutions();
        const activeInstitutions = data.filter(i => i.validation_status === 'ACCEPTED');
        setInstitutions(activeInstitutions);
      } catch (error) {
        console.error("Error cargando instituciones", error);
      }
    };
    loadInstitutions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [field]: file });
  };

  // Manejador para la selección Sí/No
  const handleAffiliationChange = (doesBelong) => {
    setBelongsToInstitution(doesBelong);
    
    if (!doesBelong) {
      // Si dice NO (es independiente), limpiamos la institución seleccionada
      setFormData(prev => ({ ...prev, institutionId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages("");

    if (!formData.frontCard || !formData.backCard) {
      setErrorMessages("Debes adjuntar ambos lados de la tarjeta profesional.");
      return;
    }

    // Validación: El usuario debe haber respondido la pregunta
    if (belongsToInstitution === null) {
      setErrorMessages("Por favor indica si perteneces a una institución ambiental.");
      return;
    }

    // Si dijo SÍ, debe haber seleccionado una del dropdown
    if (belongsToInstitution === true && !formData.institutionId) {
      setErrorMessages("Debes seleccionar una institución de la lista.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("full_name", formData.fullName || userData?.full_name || "");
      payload.append("document_type", formData.documentType);
      payload.append("document_number", formData.documentNumber);
      
      if (belongsToInstitution && formData.institutionId) {
          payload.append("institution_id", formData.institutionId); 
      }
      
      payload.append("front_card", formData.frontCard);
      payload.append("back_card", formData.backCard);
      payload.append("is_independent", !belongsToInstitution); 

      await AuthAPI.registerResearcher(payload);

      alert(!belongsToInstitution 
        ? "Solicitud enviada. Un administrador del sistema validará tu perfil independiente." 
        : "Solicitud enviada. El administrador de la institución seleccionada validará tu perfil.");
      
      navigate("/home");
    } catch (err) {
      const messages = formatApiErrors(err, "Ocurrió un error inesperado");
      setErrorMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-researcher-container">
      <header className="register-researcher-header">
        <button className="register-researcher-back-button" onClick={() => navigate("/home")}>
          <span>‹</span> Volver
        </button>
        <div className="register-researcher-logo">VriSA</div>
      </header>

      <div className="register-researcher-form-card">
        <h1 className="register-researcher-form-title">Completar Perfil Investigador</h1>
        <p className="register-researcher-form-subtitle">
          Completa tu información profesional.
        </p>

        <form onSubmit={handleSubmit} className="register-researcher-form">
          {/* Campos Personales */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">Nombre completo</label>
            <input
              type="text"
              name="fullName"
              className="register-researcher-form-input"
              value={formData.fullName}
              onChange={handleChange}
              placeholder={userData?.full_name || "Nombre completo"}
            />
          </div>

          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label"><span className="register-researcher-required">*</span> Tipo de documento</label>
            <select name="documentType" className="register-researcher-form-input" value={formData.documentType} onChange={handleChange} required>
              <option value="">Selecciona...</option>
              {documentTypes.map(doc => <option key={doc} value={doc}>{doc}</option>)}
            </select>
          </div>

          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label"><span className="register-researcher-required">*</span> Número de documento</label>
            <input type="text" name="documentNumber" className="register-researcher-form-input" value={formData.documentNumber} onChange={handleChange} required />
          </div>

          {/* --- Sección de afiliación --- */}
          <div className="register-researcher-form-group" style={{marginTop: '24px'}}>
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> ¿Pertenece usted a una institución ambiental?
            </label>
            
            {/* Radio Group similar al de RegisterUserPage */}
            <div className="register-researcher-radio-group">
              <div 
                className={`register-researcher-radio-option ${belongsToInstitution === true ? "selected" : ""}`}
                onClick={() => handleAffiliationChange(true)}
              >
                <span className="register-researcher-radio-circle"></span>
                <span className="register-researcher-radio-label">Sí</span>
              </div>
              <div 
                className={`register-researcher-radio-option ${belongsToInstitution === false ? "selected" : ""}`}
                onClick={() => handleAffiliationChange(false)}
              >
                <span className="register-researcher-radio-circle"></span>
                <span className="register-researcher-radio-label">No</span>
              </div>
            </div>

            {/* Lógica Condicional */}
            <div className="register-researcher-dynamic-content">
                {belongsToInstitution === true && (
                    <div className="fade-in-up">
                        <label className="register-researcher-form-label" style={{marginTop: '16px'}}>Seleccione su institución</label>
                        <select 
                            name="institutionId" 
                            className="register-researcher-form-input" 
                            value={formData.institutionId} 
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona una institución...</option>
                            {institutions.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.institute_name}
                                </option>
                            ))}
                        </select>
                        <small style={{display: 'block', marginTop: '6px', color: '#64748b', fontSize: '0.8rem'}}>
                            * Tu solicitud será enviada al administrador de esta institución.
                        </small>
                    </div>
                )}

                {belongsToInstitution === false && (
                    <div className="fade-in-up" style={{marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '0.9rem'}}>
                        ℹ️ <strong>Investigador Independiente:</strong> Se procesará tu registro como investigador independiente (Freelance/Tesista). Tu solicitud será validada directamente por los administradores globales de VriSA.
                    </div>
                )}
            </div>
          </div>

          {/* Carga de Archivos */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label"><span className="register-researcher-required">*</span> Tarjeta profesional (frontal)</label>
            <input type="file" accept="image/*" className="register-researcher-form-input" onChange={(e) => handleFileUpload(e, "frontCard")} required />
          </div>

          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label"><span className="register-researcher-required">*</span> Tarjeta profesional (trasera)</label>
            <input type="file" accept="image/*" className="register-researcher-form-input" onChange={(e) => handleFileUpload(e, "backCard")} required />
          </div>

          {errorMessages.length > 0 && (
             <div className="register-researcher-error-box">
                {Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages}
             </div>
          )}

          <button type="submit" className="register-researcher-submit-button" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}
