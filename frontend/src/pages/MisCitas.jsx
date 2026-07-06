import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function MisCitas() {
  const { isDarkMode, theme } = useTheme();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalNotificationShow, setModalNotificationShow] = useState(false);
  const [modalNotificationType, setModalNotificationType] = useState("info");
  const [modalNotificationTitle, setModalNotificationTitle] = useState("");
  const [modalNotificationMessage, setModalNotificationMessage] = useState("");
  const [modalEditarShow, setModalEditarShow] = useState(false);
  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [accionConfirm, setAccionConfirm] = useState(null);
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [editData, setEditData] = useState({ fecha: "", slot: "", motivo: "" });

  // Obtenemos el DNI del paciente logueado
  const userDni = localStorage.getItem("userDni");

  const fetchMisCitas = async () => {
    try {
      // Usar el endpoint correcto para obtener solo mis citas
      const response = await axiosInstance.get("/citas/mis-citas");
      const misCitas = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      console.log("Citas recibidas COMPLETAS:", misCitas);
      if (misCitas.length > 0) {
        console.log("Primera cita estructura:", JSON.stringify(misCitas[0], null, 2));
      }
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

  const cargarSlotsDisponibles = async (medicoId, fecha) => {
    try {
      const response = await axiosInstance.get(`/citas/slots?medicoId=${medicoId}&fecha=${fecha}`);
      setSlotsDisponibles(response.data.data || []);
    } catch (error) {
      console.error("Error cargando slots:", error);
      setSlotsDisponibles([]);
    }
  };

  const handleEditarCita = () => {
    if (citaSeleccionada) {
      setEditData({ fecha: citaSeleccionada.fecha, slot: citaSeleccionada.slot, motivo: citaSeleccionada.motivo || "" });
      cargarSlotsDisponibles(citaSeleccionada.medicoId, citaSeleccionada.fecha);
      setModalEditarShow(true);
    }
  };

  const procesarEdicion = async () => {
    try {
      const response = await axiosInstance.patch(`/citas/${citaSeleccionada.id}`, {
        fecha: editData.fecha,
        slot: editData.slot,
        motivo: editData.motivo,
      });

      setModalNotificationTitle("¡Éxito!");
      setModalNotificationMessage("Cita actualizada correctamente");
      setModalNotificationType("success");
      setModalNotificationShow(true);

      setModalEditarShow(false);
      setCitaSeleccionada(null);
      setTimeout(() => fetchMisCitas(), 1500);
    } catch (error) {
      setModalNotificationTitle("Error");
      setModalNotificationMessage(error.response?.data?.message || "No se pudo actualizar la cita");
      setModalNotificationType("error");
      setModalNotificationShow(true);
    }
  };

  const handleEliminarCita = () => {
    setAccionConfirm("cancelar");
    setModalConfirmShow(true);
  };

  const procesarAccion = async () => {
    try {
      if (accionConfirm === "cancelar") {
        await axiosInstance.patch(`/citas/${citaSeleccionada.id}/cancelar`);
        setModalNotificationTitle("Cita Cancelada");
        setModalNotificationMessage("Tu cita ha sido cancelada exitosamente");
        setModalNotificationType("warning");
      }

      setModalNotificationShow(true);
      setModalConfirmShow(false);
      setCitaSeleccionada(null);
      setTimeout(() => fetchMisCitas(), 1500);
    } catch (error) {
      setModalNotificationTitle("Error");
      setModalNotificationMessage(error.response?.data?.message || "No se pudo cancelar la cita");
      setModalNotificationType("error");
      setModalNotificationShow(true);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2 mb-4" style={{ borderColor: theme.accentHex }}>
        Mi Historial de Citas
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
                    <th>Especialidad</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
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
                        {c.medico?.especialidad?.nombre || 'Consulta General'}
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 border ${
                          c.estado === 'programada' || c.estado === 'Confirmada' ? 'bg-success-subtle text-success' : 
                          c.estado === 'cancelada' ? 'bg-danger-subtle text-danger' :
                          'bg-warning-subtle text-warning'
                        }`}>
                          {c.estado?.charAt(0).toUpperCase() + c.estado?.slice(1) || 'Pendiente'}
                        </span>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        {c.estado === 'programada' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Cancelar cita"
                            onClick={() => {
                              setCitaSeleccionada(c);
                              setAccionConfirm("cancelar");
                              setModalConfirmShow(true);
                            }}
                          >
                            <i className="bi bi-x-circle me-1"></i>Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5 opacity-50">
              <i className="bi bi-calendar-x fs-1"></i>
              <p className="mt-2">Aún no tienes citas programadas.</p>
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
              {/* HEADER */}
              <div 
                className="modal-header border-0 p-4 text-white"
                style={{ backgroundColor: theme.accentHex, borderRadius: "25px 25px 0 0" }}
              >
                <h4 className="modal-title fw-bold">
                  <i className="bi bi-calendar-check me-2"></i>Detalles de tu Cita
                </h4>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setCitaSeleccionada(null)}
                  style={{ filter: "brightness(0) invert(1)" }}
                ></button>
              </div>

              {/* BODY */}
              <div className="modal-body p-4" style={{ color: theme.text }}>
                <div className="row mb-4">
                  {/* SECCIÓN IZQUIERDA - CITA */}
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
                            citaSeleccionada.estado === 'programada' || citaSeleccionada.estado === 'Confirmada' ? 'bg-success-subtle text-success' : 
                            citaSeleccionada.estado === 'cancelada' ? 'bg-danger-subtle text-danger' :
                            'bg-warning-subtle text-warning'
                          }`}>
                            {citaSeleccionada.estado?.charAt(0).toUpperCase() + citaSeleccionada.estado?.slice(1) || 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN DERECHA - MOTIVO */}
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

                {/* MÉDICO */}
                <div 
                  className="p-4 rounded-3 mb-3"
                  style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: theme.accentHex }}>👨‍⚕️ Información del Médico</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <small className="opacity-75">Nombre</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.medico?.nombres && citaSeleccionada.medico?.apellidos 
                          ? `Dr. ${citaSeleccionada.medico.nombres} ${citaSeleccionada.medico.apellidos}`
                          : 'Por confirmar'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <small className="opacity-75">Especialidad</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.medico?.especialidad?.nombre || 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* UBICACIÓN/SEDE */}
                <div 
                  className="p-4 rounded-3 mb-3"
                  style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: theme.accentHex }}>📍 Ubicación de la Sede</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <small className="opacity-75">Sede</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.medico?.sede?.nombre || 'No especificada'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <small className="opacity-75">Dirección</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.medico?.sede?.direccion || 'Por confirmar'}
                      </p>
                    </div>
                    <div className="col-md-6 mt-2">
                      <small className="opacity-75">Teléfono</small>
                      <p className="fw-bold mb-0">
                        {citaSeleccionada.medico?.sede?.telefono || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RECOMENDACIONES */}
                <div 
                  className="p-4 rounded-3 alert alert-info mb-0"
                  style={{ backgroundColor: "#e3f2fd", borderLeft: `4px solid ${theme.accentHex}` }}
                >
                  <h6 className="fw-bold mb-2" style={{ color: theme.accentHex }}>⚠️ Recomendaciones</h6>
                  <ul className="mb-0 small" style={{ color: theme.text }}>
                    <li>Llega 10 minutos antes de tu cita</li>
                    <li>Si no puedes asistir, avisa con anticipación</li>
                    <li>Trae tu documento de identidad</li>
                  </ul>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0 p-4 d-flex gap-2 justify-content-end">
                {citaSeleccionada.estado === "programada" && (
                  <>
                    <button 
                      type="button" 
                      className={`btn btn-outline-${theme.accent}`}
                      onClick={handleEditarCita}
                    >
                      <i className="bi bi-pencil me-2"></i>Editar
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={handleEliminarCita}
                    >
                      <i className="bi bi-trash me-2"></i>Cancelar
                    </button>
                  </>
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

      {/* MODAL EDITAR CITA */}
      <div
        className={`modal fade ${modalEditarShow ? 'show' : ''}`}
        style={{ display: modalEditarShow ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-pencil me-2"></i>Editar Cita
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalEditarShow(false)}
                style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={editData.fecha}
                  onChange={(e) => {
                    setEditData({...editData, fecha: e.target.value, slot: ""});
                    cargarSlotsDisponibles(citaSeleccionada.medicoId, e.target.value);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Horario</label>
                <select
                  className="form-select"
                  value={editData.slot}
                  onChange={(e) => setEditData({...editData, slot: e.target.value})}
                  disabled={!editData.fecha}
                >
                  <option value="">Seleccionar horario...</option>
                  {slotsDisponibles.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Motivo de la Consulta</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe el motivo de tu consulta..."
                  value={editData.motivo}
                  onChange={(e) => setEditData({...editData, motivo: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalEditarShow(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`btn btn-${theme.accent}`}
                onClick={procesarEdicion}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>

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
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalConfirmShow(false)}
              >
                Atrás
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={procesarAccion}
              >
                Sí, Cancelar Cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisCitas;