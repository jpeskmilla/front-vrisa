import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../../../shared/api";
import { formatApiErrors } from "../../../../shared/utils";
import "./RegisterResearcherPage.css";

/**
 * Página para completar el registro de investigadores.
 * El usuario ya está autenticado, solo debe completar información adicional
 * y cargar imágenes de la tarjeta profesional (frontal y trasera).
 *
 * @component
 */
export default function RegisterResearcherPage() {
  const navigate = useNavigate();

  /** @state Manejo de errores del formulario */
  const [errorMessages, setErrorMessages] = useState([]);

  /** @state Indicador de carga al enviar el formulario */
  const [loading, setLoading] = useState(false);

  /** @state Datos del usuario autenticado */
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Obtener datos del usuario autenticado
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  /**
   * @state formData
   * Contiene todos los campos ingresados por el investigador.
   */
  const [formData, setFormData] = useState({
    fullName: "",
    documentType: "",
    documentNumber: "",
    institution: "",
    frontCard: null,
    backCard: null,
  });

  /** @state Dropdown del tipo de documento */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /** @constant Opciones del campo tipo de documento */
  const documentTypes = [
    "Cédula de ciudadanía",
    "Cédula de extranjería",
    "Pasaporte",
  ];

  /**
   * Maneja los cambios de los inputs de texto.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento del input
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Maneja los archivos cargados (imágenes)
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input File
   * @param {string} field - Nombre del campo del formData a actualizar
   */
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [field]: file });
  };

  /**
   * Asigna un valor al select de tipo de documento.
   *
   * @param {string} value - Tipo de documento seleccionado
   */
  const handleSelect = (value) => {
    setFormData({ ...formData, documentType: value });
    setIsDropdownOpen(false);
  };

  /**
   * Envía el formulario al backend para completar el registro.
   *
   * @async
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages("");

    if (!formData.frontCard || !formData.backCard) {
      setErrorMessages("Debes adjuntar ambos lados de la tarjeta profesional.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("full_name", formData.fullName || userData?.full_name || "");
      payload.append("document_type", formData.documentType);
      payload.append("document_number", formData.documentNumber);
      payload.append("institution", formData.institution);
      payload.append("front_card", formData.frontCard);
      payload.append("back_card", formData.backCard);

      await AuthAPI.registerResearcher(payload);

      alert("Registro completado correctamente. Tu solicitud está pendiente de aprobación por un administrador.");
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
        <h1 className="register-researcher-form-title">Completar Registro de Investigador</h1>
        <p className="register-researcher-form-subtitle">
          Completa tu información para validar tu perfil como investigador.
          {userData && <><br/><strong>Usuario: {userData.email}</strong></>}
        </p>

        <form onSubmit={handleSubmit} className="register-researcher-form">
          {/* Nombre completo */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> Nombre completo
            </label>
            <input
              type="text"
              name="fullName"
              className="register-researcher-form-input"
              placeholder="Ingresa tu nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo de documento*/}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> Tipo de documento
            </label>

          <select
            name="documentType"
            className="register-researcher-form-input"
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            required
          >
            <option value="">Selecciona el tipo de documento</option>
            {documentTypes.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>


          {/* Número de documento */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> Número de documento
            </label>
            <input
              type="text"
              name="documentNumber"
              className="register-researcher-form-input"
              placeholder="Ingresa tu número de documento"
              value={formData.documentNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Institución */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> Institución a la que pertenece
            </label>
            <input
              type="text"
              name="institution"
              className="register-researcher-form-input"
              placeholder="Ingrese la institución a la que pertenece"
              value={formData.institution}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tarjeta profesional frontal */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> Tarjeta profesional (frontal)
            </label>
            <input
              type="file"
              accept="image/*"
              className="register-researcher-form-input"
              onChange={(e) => handleFileUpload(e, "frontCard")}
              required
            />
          </div>

          {/* Tarjeta profesional trasera */}
          <div className="register-researcher-form-group">
            <label className="register-researcher-form-label">
              <span className="register-researcher-required">*</span> Tarjeta profesional (trasera)
            </label>
            <input
              type="file"
              accept="image/*"
              className="register-researcher-form-input"
              onChange={(e) => handleFileUpload(e, "backCard")}
              required
            />
          </div>

          {/* Error */}
          {errorMessages && (
            <div className="register-researcher-error-box">
              {errorMessages}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="register-researcher-submit-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            Enviar solicitud de registro
          </button>
        </form>
      </div>
    </div>
  );
}
