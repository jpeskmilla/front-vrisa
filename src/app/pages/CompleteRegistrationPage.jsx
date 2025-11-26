import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ORGANIZATION_ROLES } from '../../shared/constants/roles';
import './complete-registration-styles.css';

/**
 * Página para completar el registro de usuarios que solicitaron un rol de organización.
 * Muestra campos específicos según el rol solicitado:
 * - Administrador de estación: datos de la estación
 * - Investigador: información académica
 * - Trabajador de institución: datos institucionales
 */
export default function CompleteRegistrationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Formulario para Administrador de estación
  const [stationForm, setStationForm] = useState({
    station_name: '',
    station_location: '',
    station_address: '',
    latitude: '',
    longitude: '',
    institution_to_join: ''
  });

  // Formulario para Investigador
  const [researcherForm, setResearcherForm] = useState({
    academic_institution: '',
    research_area: '',
    academic_degree: '',
    research_purpose: '',
    orcid: ''
  });

  // Formulario para Trabajador de institución
  const [institutionWorkerForm, setInstitutionWorkerForm] = useState({
    institution_name: '',
    job_position: '',
    employee_id: '',
    department: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Datos de ejemplo para desarrollo
        setUser({
          first_name: 'Usuario',
          email: 'usuario@example.com',
          belongs_to_organization: true,
          requested_role: ORGANIZATION_ROLES.RESEARCHER,
          registration_complete: false
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (e) => {
    setStationForm({ ...stationForm, [e.target.name]: e.target.value });
  };

  const handleResearcherChange = (e) => {
    setResearcherForm({ ...researcherForm, [e.target.name]: e.target.value });
  };

  const handleInstitutionWorkerChange = (e) => {
    setInstitutionWorkerForm({ ...institutionWorkerForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Aquí iría la llamada a la API para completar el registro
      // Por ahora simulamos el éxito
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Actualizar datos del usuario en localStorage
      const updatedUser = { ...user, registration_complete: true };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al completar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ORGANIZATION_ROLES.STATION_ADMIN:
        return 'Administrador de estación';
      case ORGANIZATION_ROLES.RESEARCHER:
        return 'Investigador';
      case ORGANIZATION_ROLES.INSTITUTION_WORKER:
        return 'Trabajador de institución ambiental';
      default:
        return 'Usuario';
    }
  };

  if (loading) {
    return (
      <div className="complete-reg-loading">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="complete-reg-success">
        <div className="success-icon">✓</div>
        <h2>¡Registro completado!</h2>
        <p>Tu solicitud ha sido enviada. Serás redirigido al dashboard...</p>
      </div>
    );
  }

  return (
    <div className="complete-reg-container">
      <header className="complete-reg-header">
        <Link to="/dashboard" className="back-link">
          ← Volver al Dashboard
        </Link>
        <div className="logo">VriSA</div>
      </header>

      <div className="complete-reg-card">
        <div className="card-header">
          <h1>Completar registro</h1>
          <p className="role-badge">{getRoleLabel(user?.requested_role)}</p>
        </div>

        <p className="card-description">
          Para acceder a las funcionalidades de tu rol, necesitamos información adicional.
          Por favor completa los siguientes campos.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Formulario para Administrador de estación */}
          {user?.requested_role === ORGANIZATION_ROLES.STATION_ADMIN && (
            <div className="form-section">
              <h3 className="section-title">Información de la estación de monitoreo</h3>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Nombre de la estación
                </label>
                <input
                  type="text"
                  name="station_name"
                  className="form-input"
                  placeholder="Ej: Estación Norte Cali"
                  value={stationForm.station_name}
                  onChange={handleStationChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Ubicación / Zona
                </label>
                <input
                  type="text"
                  name="station_location"
                  className="form-input"
                  placeholder="Ej: Zona norte de Cali"
                  value={stationForm.station_location}
                  onChange={handleStationChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Dirección
                </label>
                <input
                  type="text"
                  name="station_address"
                  className="form-input"
                  placeholder="Dirección completa"
                  value={stationForm.station_address}
                  onChange={handleStationChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label className="form-label">
                    <span className="required">*</span> Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    className="form-input"
                    placeholder="Ej: 3.4516"
                    value={stationForm.latitude}
                    onChange={handleStationChange}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label className="form-label">
                    <span className="required">*</span> Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    className="form-input"
                    placeholder="Ej: -76.5320"
                    value={stationForm.longitude}
                    onChange={handleStationChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Institución a la que desea asociarse
                </label>
                <select
                  name="institution_to_join"
                  className="form-input form-select"
                  value={stationForm.institution_to_join}
                  onChange={handleStationChange}
                  required
                >
                  <option value="">Seleccione una institución</option>
                  <option value="dagma">DAGMA - Departamento Administrativo de Gestión del Medio Ambiente</option>
                  <option value="cvc">CVC - Corporación Autónoma Regional del Valle del Cauca</option>
                  <option value="ideam">IDEAM</option>
                  <option value="other">Otra institución</option>
                </select>
              </div>
            </div>
          )}

          {/* Formulario para Investigador */}
          {user?.requested_role === ORGANIZATION_ROLES.RESEARCHER && (
            <div className="form-section">
              <h3 className="section-title">Información académica</h3>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Institución académica
                </label>
                <input
                  type="text"
                  name="academic_institution"
                  className="form-input"
                  placeholder="Ej: Universidad del Valle"
                  value={researcherForm.academic_institution}
                  onChange={handleResearcherChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Área de investigación
                </label>
                <input
                  type="text"
                  name="research_area"
                  className="form-input"
                  placeholder="Ej: Calidad del aire, Meteorología"
                  value={researcherForm.research_area}
                  onChange={handleResearcherChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Grado académico
                </label>
                <select
                  name="academic_degree"
                  className="form-input form-select"
                  value={researcherForm.academic_degree}
                  onChange={handleResearcherChange}
                  required
                >
                  <option value="">Seleccione su grado</option>
                  <option value="undergraduate">Pregrado en curso</option>
                  <option value="bachelor">Profesional / Licenciado</option>
                  <option value="master_student">Maestría en curso</option>
                  <option value="master">Magíster</option>
                  <option value="phd_student">Doctorado en curso</option>
                  <option value="phd">Doctor (PhD)</option>
                  <option value="postdoc">Postdoctorado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Propósito de la investigación
                </label>
                <textarea
                  name="research_purpose"
                  className="form-input form-textarea"
                  placeholder="Describa brevemente el propósito de su investigación..."
                  value={researcherForm.research_purpose}
                  onChange={handleResearcherChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  ORCID (opcional)
                </label>
                <input
                  type="text"
                  name="orcid"
                  className="form-input"
                  placeholder="Ej: 0000-0002-1234-5678"
                  value={researcherForm.orcid}
                  onChange={handleResearcherChange}
                />
              </div>
            </div>
          )}

          {/* Formulario para Trabajador de institución */}
          {user?.requested_role === ORGANIZATION_ROLES.INSTITUTION_WORKER && (
            <div className="form-section">
              <h3 className="section-title">Información institucional</h3>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Institución ambiental
                </label>
                <select
                  name="institution_name"
                  className="form-input form-select"
                  value={institutionWorkerForm.institution_name}
                  onChange={handleInstitutionWorkerChange}
                  required
                >
                  <option value="">Seleccione una institución</option>
                  <option value="dagma">DAGMA - Departamento Administrativo de Gestión del Medio Ambiente</option>
                  <option value="cvc">CVC - Corporación Autónoma Regional del Valle del Cauca</option>
                  <option value="ideam">IDEAM</option>
                  <option value="minambiente">Ministerio de Ambiente</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Cargo / Posición
                </label>
                <input
                  type="text"
                  name="job_position"
                  className="form-input"
                  placeholder="Ej: Técnico de monitoreo"
                  value={institutionWorkerForm.job_position}
                  onChange={handleInstitutionWorkerChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Número de empleado / ID
                </label>
                <input
                  type="text"
                  name="employee_id"
                  className="form-input"
                  placeholder="Código de empleado institucional"
                  value={institutionWorkerForm.employee_id}
                  onChange={handleInstitutionWorkerChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Departamento / Área
                </label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  placeholder="Ej: Calidad del Aire"
                  value={institutionWorkerForm.department}
                  onChange={handleInstitutionWorkerChange}
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <Link to="/dashboard" className="cancel-btn">
              Cancelar
            </Link>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>

        <p className="form-note">
          <strong>Nota:</strong> Tu solicitud será revisada por un administrador. 
          Recibirás una notificación cuando sea aprobada.
        </p>
      </div>
    </div>
  );
}



