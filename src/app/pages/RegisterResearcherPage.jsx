import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../shared/api";
import { formatApiErrors } from "../../shared/utils";
import "./registerresearcherpage-styles.css";

/**
 * Página de registro para investigadores.
 * Permite ingresar información personal, institucional y cargar
 * imágenes de la tarjeta profesional (frontal y trasera).
 *
 * @component
 */
export default function RegisterResearcherPage() {
  const navigate = useNavigate();

  /** @state Manejo de errores del formulario */
  const [error, setError] = useState("");

  /** @state Indicador de carga al enviar el formulario */
  const [loading, setLoading] = useState(false);

  /**
   * @state formData
   * Contiene todos los campos ingresados por el investigador.
   */
  const [formData, setFormData] = useState({
    fullName: "",
    documentType: "",
    documentNumber: "",
    institution: "",
    email: "",
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
   * Envía el formulario al backend.
   *
   * @async
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.frontCard || !formData.backCard) {
      setError("Debes adjuntar ambos lados de la tarjeta profesional.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("full_name", formData.fullName);
      payload.append("document_type", formData.documentType);
      payload.append("document_number", formData.documentNumber);
      payload.append("institution", formData.institution);
      payload.append("email", formData.email);
      payload.append("front_card", formData.frontCard);
      payload.append("back_card", formData.backCard);

      await AuthAPI.registerResearcher(payload);

      alert("Registro enviado correctamente. Espera validación.");
      navigate("/");
    } catch (err) {
      const messages = formatApiErrors(err, "Ocurrió un error inesperado");
      setErrorMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="researcher-container">
      <header className="header">
        <button className="back-button" onClick={() => navigate("/home")}>
          <span>‹</span> Volver
        </button>
        <div className="logo">VriSA</div>
      </header>

      <div className="form-card">
        <h1 className="form-title">Registro de Investigador</h1>
        <p className="form-subtitle">
          Ingresa tu información para validar tu perfil como investigador.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nombre completo */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Nombre completo
            </label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              placeholder="Ingresa tu nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tipo de documento*/}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Tipo de documento
            </label>

          <select
            name="documentType"
            className="form-input"
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
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Número de documento
            </label>
            <input
              type="text"
              name="documentNumber"
              className="form-input"
              placeholder="Ingresa tu número de documento"
              value={formData.documentNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Institución */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Institución a a la que pertenece
            </label>
            <input
              type="text"
              name="institution"
              className="form-input"
              placeholder="Ingrese la institución a la que pertenece"
              value={formData.institution}
              onChange={handleChange}
              required
            />
          </div>

          {/* Correo institucional */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Correo institucional
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="correo@institucion.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tarjeta profesional frontal */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Tarjeta profesional (frontal)
            </label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={(e) => handleFileUpload(e, "frontCard")}
              required
            />
          </div>

          {/* Tarjeta profesional trasera */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Tarjeta profesional (trasera)
            </label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={(e) => handleFileUpload(e, "backCard")}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="submit-button"
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