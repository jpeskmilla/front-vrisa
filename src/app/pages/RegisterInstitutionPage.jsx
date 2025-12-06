/**
 * Página de registro para instituciones.
 * Permite ingresar información institucional.
 *
 * @component
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../shared/api";
import "./registerinstitutionpage-styles.css";

export default function RegisterInstitutionPage() {
  const navigate = useNavigate();

  /** @state Manejo de errores del formulario */
  const [error, setError] = useState("");

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
   * Maneja el cambio de un color específico
   *
   * @param {number} index - Índice del color en el array
   * @param {string} value - Nuevo valor hexadecimal
   */
  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData({ ...formData, colors: newColors });
  };

  /**
   * Agrega un nuevo color al array
   */
  const addColor = () => {
    setFormData({ ...formData, colors: [...formData.colors, "#FFFFFF"] });
  };

  /**
   * Elimina un color del array
   *
   * @param {number} index - Índice del color a eliminar
   */
  const removeColor = (index) => {
    if (formData.colors.length > 1) {
      const newColors = formData.colors.filter((_, i) => i !== index);
      setFormData({ ...formData, colors: newColors });
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
    setError("");

    if (!formData.logo) {
      setError("Debes adjuntar el logo de la institución");
      return;
    }

    if (!formData.name || !formData.physicAddress) {
      setError("Todos los campos obligatorios deben estar completos");
      return;
    }

    if (formData.colors.length === 0) {
      setError("Debes agregar al menos un color");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("institute_name", formData.name);
      payload.append("physic_address", formData.physicAddress);
      payload.append("institute_logo", formData.logo);
      payload.append("colors", JSON.stringify(formData.colors));

      await AuthAPI.registerInstitution(payload);

      alert("Registro enviado correctamente. Espera validación.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar institución");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="institution-container">
      <header className="header">
        <button className="back-button" onClick={() => navigate("/mainpage")}>
          <span>‹</span> Volver
        </button>
        <div className="logo">VriSA</div>
      </header>

      <div className="form-card">
        <h1 className="form-title">Registro de Institución</h1>
        <p className="form-subtitle">
          Ingresa la información para validar la solicitud como institución.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nombre de la institución */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Nombre oficial de la institución
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Ingresa el nombre oficial de la institución"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Dirección física */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Dirección física
            </label>
            <input
              type="text"
              name="physicAddress"
              className="form-input"
              placeholder="Ingresa la dirección física"
              value={formData.physicAddress}
              onChange={handleChange}
              required
            />
          </div>

          {/* Logo de la institución */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Logo
            </label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={(e) => handleFileUpload(e, "logo")}
              required
            />
          </div>

          {/* Colores de la institución */}
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Colores institucionales
            </label>
            <p className="color-hint">
              Elige un color de la paleta o ingresa su código hexadecimal (ej: #4339F2, #000000)
            </p>

            <div className="colors-container">
              {formData.colors.map((color, index) => (
                <div key={index} className="color-input-group">
                  <div className="color-preview" style={{ backgroundColor: color }}></div>
                  <input
                    type="text"
                    className="form-input color-text-input"
                    placeholder="#FFFFFF"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    title="Debe ser un código hexadecimal válido (ej: #FFFFFF)"
                  />
                  <input
                    type="color"
                    className="color-picker"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                  />
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      className="remove-color-btn"
                      onClick={() => removeColor(index)}
                      title="Eliminar color"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="add-color-btn"
                onClick={addColor}
              >
                + Agregar otro color
              </button>
            </div>
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
            {loading ? "Enviando..." : "Enviar solicitud de registro"}
          </button>
        </form>
      </div>
    </div>
  );
}