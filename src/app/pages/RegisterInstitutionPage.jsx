import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI } from "../../shared/api";
import { formatApiErrors } from "../../shared/utils";
import "./registerinstitutionpage-styles.css";

/**
 * Página de registro para instituciones.
 * Permite ingresar información institucional.
 *
 * @component
 */
export default function RegisterInstitutionPage() {
  const navigate = useNavigate();

  /** @state Manejo de errores del formulario */
  const [errorMessages, setErrorMessages] = useState([]);

  /** @state Indicador de carga al enviar el formulario */
  const [loading, setLoading] = useState(false);

  /**
   * @state formData
   * Contiene todos los campos ingresados por la institución.
   */
  const [formData, setFormData] = useState({
    name: "",
    physicAddress: "",
    logo: null,
    colors: ["#FFFFFF", "#000000"], // Colores por defecto
  });

  /**
   * Maneja los cambios de los inputs de texto.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento del input
   */
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  /**
   * Maneja los archivos cargados (imágenes)
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input File
   * @param {string} field - Nombre del campo del formData a actualizar
   */
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    setFormData({...formData, [field]: file});
  };

  /**
   * Maneja el cambio de un color específico
   *
   * @param {number} index - Índice del color en el array
   * @param {string} value - Nuevo valor hexadecimal
   */
  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData({...formData, colors: newColors});
  };

  /**
   * Agrega un nuevo color al array
   */
  const addColor = () => {
    setFormData({...formData, colors: [...formData.colors, "#FFFFFF"]});
  };

  /**
   * Elimina un color del array
   *
   * @param {number} index - Índice del color a eliminar
   */
  const removeColor = (index) => {
    if (formData.colors.length > 1) {
      const newColors = formData.colors.filter((_, i) => i !== index);
      setFormData({...formData, colors: newColors});
    }
  };

  /**
   * Envía el formulario al backend.
   *
   * @async
   * @param {React.FormEvent} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages("");

    if (!formData.logo) {
      setErrorMessages("Debes adjuntar el logo de la institución");
      return;
    }

    if (!formData.name || !formData.physicAddress) {
      setErrorMessages("Todos los campos obligatorios deben estar completos");
      return;
    }

    if (formData.colors.length === 0) {
      setErrorMessages("Debes agregar al menos un color");
      return;
    }

    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    const uniqueColors = [...new Set(formData.colors)];
    const invalidColors = uniqueColors.filter((color) => !hexPattern.test(color));

    if (invalidColors.length > 0) {
      setErrorMessages([`Los siguientes colores no son válidos: ${invalidColors.join(", ")}.`, "Usa el formato hexadecimal completo (ej: #FFFFFF)"]);
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("institute_name", formData.name);
      payload.append("physic_address", formData.physicAddress);
      payload.append("institute_logo", formData.logo);
      payload.append("colors", JSON.stringify(uniqueColors));

      await InstitutionAPI.registerInstitution(payload);

      alert("Registro enviado correctamente. Espera validación.");
      navigate("/home");
    } catch (err) {
      const messages = formatApiErrors(err, "Error al registrar institución");
      setErrorMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-institution-container">
      <header className="register-institution-header">
        <button className="register-institution-back-button" onClick={() => navigate("/home")}>
          <span>‹</span> Volver
        </button>
        <div className="register-institution-logo">VriSA</div>
      </header>

      <div className="register-institution-form-card">
        <h1 className="register-institution-form-title">Registro de Institución</h1>
        <p className="register-institution-form-subtitle">Ingresa la información para validar la solicitud como institución.</p>

        <form onSubmit={handleSubmit} className="register-institution-form">
          {/* Nombre de la institución */}
          <div className="register-institution-form-group">
            <label className="register-institution-form-label">
              <span className="register-institution-required">*</span> Nombre oficial de la institución
            </label>
            <input
              type="text"
              name="name"
              className="register-institution-form-input"
              placeholder="Ingresa el nombre oficial de la institución"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Dirección física */}
          <div className="register-institution-form-group">
            <label className="register-institution-form-label">
              <span className="register-institution-required">*</span> Dirección física
            </label>
            <input
              type="text"
              name="physicAddress"
              className="register-institution-form-input"
              placeholder="Ingresa la dirección física"
              value={formData.physicAddress}
              onChange={handleChange}
              required
            />
          </div>

          {/* Logo de la institución */}
          <div className="register-institution-form-group">
            <label className="register-institution-form-label">
              <span className="register-institution-required">*</span> Logo
            </label>
            <input type="file" accept="image/*" className="register-institution-form-input" onChange={(e) => handleFileUpload(e, "logo")} required />
          </div>

          {/* Colores de la institución */}
          <div className="register-institution-form-group">
            <label className="register-institution-form-label">
              <span className="register-institution-required">*</span> Colores institucionales
            </label>
            <p className="register-institution-color-hint">Elige un color de la paleta o ingresa su código hexadecimal (ej: #4339F2, #000000)</p>

            <div className="register-institution-colors-container">
              {formData.colors.map((color, index) => (
                <div key={index} className="register-institution-color-input-group">
                  <div className="register-institution-color-preview" style={{backgroundColor: color}}></div>
                  <input
                    type="text"
                    className="register-institution-form-input register-institution-color-text-input"
                    placeholder="#FFFFFF"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Debe ser un código hexadecimal válido (ej: #FFFFFF)"
                  />
                  <input type="color" className="register-institution-color-picker" value={color} onChange={(e) => handleColorChange(index, e.target.value)} />
                  {formData.colors.length > 1 && (
                    <button type="button" className="register-institution-remove-color-btn" onClick={() => removeColor(index)} title="Eliminar color">
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="register-institution-add-color-btn" onClick={addColor}>
                + Agregar otro color
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMessages.length > 0 && (
            <div className="register-institution-alert-error-container">
              <ul className="register-institution-alert-list">
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón */}
          <button type="submit" className="register-institution-submit-button" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
            {loading ? "Enviando..." : "Enviar solicitud de registro"}
          </button>
        </form>
      </div>
    </div>
  );
}
