import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function MisCitasMedico() {
  const { isDarkMode, theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalNotificationShow, setModalNotificationShow] = useState(false);
  const [modalNotificationType, setModalNotificationType] = useState("info");
  const [modalNotificationTitle, setModalNotificationTitle] = useState("");
  const [modalNotificationMessage, setModalNotificationMessage] = useState("");
  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [accionConfirm, setAccionConfirm] = useState(null);

  const fetchMisCitas = async () => {
    try {
      const response = await axiosInstance.get("/citas/mis-citas-medico");
      const misCitas = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCitas(misCitas);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisCitas();
  }, []);

  const handleCompletarCita = () => {
    setAccionConfirm("completar");
    setModalConfirmShow(true);
  };

  const procesarAccion = async () => {
    try {
      if (accionConfirm === "completar") {
        await axiosInstance.patch(`/citas/${citaSeleccionada.id}/completar`);
        setModalNotificationTitle("¡Cita Completada!");
        setModalNotificationMessage("La cita ha sido marcada como completada");
        setModalNotificationType("success");
      }

      setModalNotificationShow(true);
      setModalConfirmShow(false);
      setCitaSeleccionada(null);
      setTimeout(() => fetchMisCitas(), 1500);
    } catch (error) {
      setModalNotificationTitle("Error");
      setModalNotificationMessage(error.response?.data?.message || "No se pudo procesar la acción");
      setModalNotificationType("error");
      setModalNotificationShow(true);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2 mb-4" style={{ borderColor: theme.accentHex }}>
        Mis Citas Agendadas
      </h2>

      <div className="card shadow-sm border-0" style={{ backgroundColor: theme.cardBg, borderRadius: "20px" }}>
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5"><div className={`spinner-border text-${theme.accent}`}></div></div>
          ) : citas.length > 0 ? (
            <div className="table-responsive">
              <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle`}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora/Turno</th>
                    <th>Paciente</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => (
                    <tr 
                      key={c.id}
                      onClick={() => setCitaSeleccionada(c)}
                      style={{ cursor: "pointer", transition: "0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.accentHex + "20"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td className="fw-bold">{c.fecha}</td>
                      <td><span className="badge bg-light text-dark border">{c.slot}</span></td>
                      <td>
                        {c.paciente?.nombres || 'N/A'} {c.paciente?.apellidos || ''}
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 border ${
                          c.estado === 'programada' ? 'bg-success-subtle text-success' : 
                          c.estado === 'completada' ? 'bg-info-subtle text-info' :
                          c.estado === 'cancelada' ? 'bg-danger-subtle text-danger' :
                          'bg-warning-subtle text-warning'
                        }`}>
                          {c.estado?.charAt(0).toUpperCase() + c.estado?.slice(1) || 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 opacity-50">
              <i className="bi bi-calendar-x fs-1"></i>
              <p className="mt-2">No hay citas agendadas para hoy.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CON DETALLES DE LA CITA */}
      {citaSeleccionada && (
        <div 
          className="modal d-block"
          style={{ 
            backgroundColor: "rgba(0,0,0,0.5)", 
            backdropFilter: "blur(3px)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
          onClick={() => setCitaSeleccionada(null)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="modal-content border-0 shadow-lg"
              style={{ backgroundColor: theme.cardBg, borderRadius: "25px" }}
            >
              <div 
                className="modal-header border-0 p-4 text-white"
                style={{ backgroundColor: theme.accentHex, borderRadius: "25px 25px 0 0" }}
              >
                <h4 className="modal-title fw-bold">
                  <i className="bi bi-calendar-check me-2"></i>Detalles de la Cita
                </h4>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setCitaSeleccionada(null)}
                  style={{ filter: "brightness(0) invert(1)" }}
                ></button>
              </div>

              <div className="modal-body p-4" style={{ color: theme.text }}>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div 
                      className="p-4 rounded-3 mb-3"
                      style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}
                    >
                      <h6 className="fw-bold mb-3" style={{ color: theme.accentHex }}>📅 Información de la Cita</h6>
                      <div className="mb-2">
                        <small className="opacity-75">Fecha</small>
                        <p className="fw-bold mb-0">{new Date(citaSeleccionada.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="mb-2">
                        <small className="opacity-75">Hora</small>
                        <p className="fw-bold mb-0">{citaSeleccionada.slot}</p>
                      </div>
                      <div className="mb-2">
                        <small className="opacity-75">Turno</small>
                        <p className="fw-bold mb-0 text-uppercase">{citaSeleccionada.turno}</p>
                      </div>
                      <div className="mb-0">
                        <small className="opacity-75">Estado</small>
                        <div className="mt-1">
                          <span className={`badge px-3 py-2 border ${
                            citaSeleccionada.estado === 'programada' ? 'bg-success-subtle text-success' : 
                            citaSeleccionada.estado === 'completada' ? 'bg-info-subtle text-info' :
                            'bg-danger-subtle text-danger'
                          }`}>
                            {citaSeleccionada.estado?.charAt(0).toUpperCase() + citaSeleccionada.estado?.slice(1) || 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div 
                      className="p-4 rounded-3"
                      style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}
                    >
                      <h6 className="fw-bold mb-3" style={{ color: theme.accentHex }}>💬 Motivo de Consulta</h6>
                      <p className="mb-0" style={{ color: theme.text }}>
                        {citaSeleccionada.motivo || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-3 mb-3"
                  style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: theme.accentHex }}>👤 Información del Paciente</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <small className="opacity-75">Nombre</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.paciente?.nombres || 'N/A'} {citaSeleccionada.paciente?.apellidos || ''}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <small className="opacity-75">DNI</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.pacienteDni || 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-6 mt-3">
                      <small className="opacity-75">Email</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.paciente?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="col-md-6 mt-3">
                      <small className="opacity-75">Teléfono</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.paciente?.telefono || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-3 alert alert-info mb-0"
                  style={{ backgroundColor: "#e3f2fd", borderLeft: `4px solid ${theme.accentHex}` }}
                >
                  <h6 className="fw-bold mb-2" style={{ color: theme.accentHex }}>ℹ️ Información Adicional</h6>
                  <ul className="mb-0 small" style={{ color: theme.text }}>
                    <li>Cita ID: <code>{citaSeleccionada.id}</code></li>
                    <li>Especialidad: <strong>{citaSeleccionada.medico?.especialidad?.nombre || 'N/A'}</strong></li>
                    <li>Sede: <strong>{citaSeleccionada.medico?.sede?.nombre || 'N/A'}</strong></li>
                  </ul>
                </div>
              </div>

              <div className="modal-footer border-0 p-4 d-flex gap-2 justify-content-end">
                {citaSeleccionada.estado === "programada" && (
                  <button 
                    type="button" 
                    className={`btn btn-${theme.accent}`}
                    onClick={handleCompletarCita}
                  >
                    <i className="bi bi-check-circle me-2"></i>Marcar como Completada
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setCitaSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        show={modalNotificationShow}
        type={modalNotificationType}
        title={modalNotificationTitle}
        message={modalNotificationMessage}
        onClose={() => setModalNotificationShow(false)}
      />

      {/* MODAL CONFIRMAR ACCIÓN */}
      <div
        className={`modal fade ${modalConfirmShow ? 'show' : ''}`}
        style={{ display: modalConfirmShow ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex={-1}
      >
        <div className="modal-dialog">
          <div className="modal-content" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-exclamation-triangle me-2 text-warning"></i>Confirmar Acción
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalConfirmShow(false)}
                style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">
                ¿Estás seguro de que deseas marcar esta cita como completada?
              </p>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalConfirmShow(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={procesarAccion}
              >
                Sí, Completar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisCitasMedico;
