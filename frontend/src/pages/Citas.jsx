import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { useNavigate } from "react-router-dom";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function Citas() {
  const { isDarkMode, theme } = useTheme();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("error");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedCitaId, setSelectedCitaId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ fecha: "", slot: "", medicoId: null });
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);

  // CONEXIÓN AL BACKEND
  const fetchCitas = async () => {
    try {
      const response = await axiosInstance.get("/citas");
      setCitas(Array.isArray(response.data) ? response.data : response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      setLoading(false);
    }
  };

  const handleCancelarCita = (citaId) => {
    setSelectedCitaId(citaId);
    setConfirmTitle("Cancelar Cita");
    setConfirmMessage("¿Deseas cancelar esta cita? Esta acción no se puede deshacer.");
    setConfirmAction("cancelar");
    setConfirmModal(true);
  };

  const handleCompletarCita = (citaId) => {
    setSelectedCitaId(citaId);
    setConfirmTitle("Completar Cita");
    setConfirmMessage("¿Deseas marcar esta cita como completada?");
    setConfirmAction("completar");
    setConfirmModal(true);
  };

  const cargarSlotsDisponibles = async (medicoId, fecha) => {
    if (!medicoId || !fecha) {
      setSlotsDisponibles([]);
      return;
    }
    
    try {
      console.log("Cargando slots para médico:", medicoId, "fecha:", fecha);
      const response = await axiosInstance.get("/citas/slots", {
        params: { medicoId, fecha }
      });
      console.log("Slots cargados:", response.data);
      setSlotsDisponibles(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar slots:", error);
      setSlotsDisponibles([]);
    }
  };

  const handleEditarCita = async (cita) => {
    setSelectedCitaId(cita.id);
    const medicoId = cita.medico?.id || cita.medicoId;
    setEditData({ fecha: cita.fecha, slot: cita.slot, medicoId });
    
    // Cargar slots disponibles para la fecha actual
    await cargarSlotsDisponibles(medicoId, cita.fecha);
    
    setEditModal(true);
  };;

  const procesarEdicion = async () => {
    try {
      if (!editData.fecha || !editData.slot) {
        setModalTitle("Campos Incompletos");
        setModalMessage("Por favor completa la fecha y el horario");
        setModalType("warning");
        setModalShow(true);
        return;
      }

      setEditModal(false);
      await axiosInstance.patch(`/citas/${selectedCitaId}`, {
        fecha: editData.fecha,
        slot: editData.slot
      });

      setModalTitle("¡Éxito!");
      setModalMessage("Cita reprogramada correctamente");
      setModalType("success");
      setModalShow(true);

      setTimeout(() => fetchCitas(), 1500);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Error al actualizar la cita");
      setModalType("error");
      setModalShow(true);
    }
  };

  const procesarAccion = async () => {
    try {
      setConfirmModal(false);
      const endpoint = confirmAction === "cancelar" ? "/cancelar" : "/completar";
      await axiosInstance.patch(`/citas/${selectedCitaId}${endpoint}`);
      
      setModalTitle("¡Éxito!");
      setModalMessage(`Cita ${confirmAction === "cancelar" ? "cancelada" : "completada"} correctamente`);
      setModalType("success");
      setModalShow(true);
      
      // Recargar citas después de 1.5 segundos
      setTimeout(() => fetchCitas(), 1500);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Error al procesar la acción");
      setModalType("error");
      setModalShow(true);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  return (
    <div className="container-fluid py-4" 
         style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", transition: "0.3s" }}>
      
      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />

      {confirmModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="card shadow-lg border-0" style={{ borderRadius: "15px", maxWidth: "400px", backgroundColor: theme.cardBg }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-2">{confirmTitle}</h5>
              <p className="mb-4" style={{ color: theme.muted }}>{confirmMessage}</p>
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  className="btn btn-light border" 
                  onClick={() => setConfirmModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className={`btn btn-${confirmAction === "cancelar" ? "danger" : "success"}`}
                  onClick={procesarAccion}
                >
                  {confirmAction === "cancelar" ? "Cancelar Cita" : "Completar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {editModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
          <div className="card shadow-lg border-0" style={{ borderRadius: "15px", maxWidth: "500px", backgroundColor: theme.cardBg }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Reprogramar Cita</h5>
              <div className="mb-3">
                <label className="small fw-bold mb-2 d-block">Nueva Fecha</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={editData.fecha}
                  onChange={(e) => {
                    const nuevaFecha = e.target.value;
                    setEditData({...editData, fecha: nuevaFecha, slot: ""});
                    cargarSlotsDisponibles(editData.medicoId, nuevaFecha);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="mb-4">
                <label className="small fw-bold mb-2 d-block">Nuevo Horario</label>
                <select 
                  className="form-select"
                  value={editData.slot}
                  onChange={(e) => setEditData({...editData, slot: e.target.value})}
                >
                  <option value="">Seleccionar horario...</option>
                  {slotsDisponibles.length > 0 ? (
                    slotsDisponibles.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))
                  ) : (
                    <option disabled>No hay horarios disponibles</option>
                  )}
                </select>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  className="btn btn-light border" 
                  onClick={() => setEditModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={procesarEdicion}
                >
                  Reprogramar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2" 
              style={{ borderColor: theme.accentHex }}>
            Agenda de Citas
          </h2>
          <p className="small mb-0" style={{ color: theme.muted }}>
            Control y seguimiento de consultas médicas programadas.
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary shadow-sm px-3 fw-bold bg-white">
            <i className="bi bi-printer me-2"></i> Reporte
          </button>
          <button onClick={() => navigate("/agendar")} className={`btn btn-${theme.accent} shadow-sm px-4 fw-bold`}>
            <i className="bi bi-calendar-plus me-2"></i> Agendar Nueva Cita
          </button>
        </div>
      </div>

      {/* LISTADO DE CITAS (Diseño tipo Tarjetas en Tabla) */}
      <div className="card shadow-sm border-0" 
           style={{ backgroundColor: theme.cardBg, borderRadius: "20px", overflow: "hidden" }}>
        <div className="card-body p-0">
          
          {loading ? (
            <div className="text-center py-5">
              <div className={`spinner-border text-${theme.accent}`} role="status"></div>
              <p className="mt-2" style={{ color: theme.muted }}>Sincronizando agenda...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle mb-0`}>
                <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                  <tr style={{ height: "60px" }}>
                    <th className="ps-4">Paciente (DNI)</th>
                    <th>Médico Asignado</th>
                    <th>Fecha y Horario</th>
                    <th>Motivo de Consulta</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length > 0 ? (
                    citas.map((c) => (
                      <tr key={c.id} style={{ height: "80px", borderBottom: `1px solid ${theme.border}` }}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                              <i className="bi bi-person-fill text-secondary"></i>
                            </div>
                            <div>
                              <span className="fw-bold d-block">{c.paciente?.names || 'Paciente'}</span>
                              <span className="small text-muted">DNI: {c.paciente?.dni || c.pacienteDni}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className={`bi bi-stethoscope me-2 text-${theme.accent}`}></i>
                            <span className="small fw-semibold text-truncate" style={{ maxWidth: "150px" }} title={c.medico?.nombres}>
                              Dr. {c.medico?.nombres} {c.medico?.apellidos}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-bold"><i className="bi bi-calendar-event me-2 text-muted"></i>{c.fecha}</span>
                            <span className="badge bg-light text-dark border mt-1" style={{ width: "fit-content" }}>
                               <i className="bi bi-clock me-1"></i> {c.slot} ({c.turno})
                            </span>
                          </div>
                        </td>
                        <td>
                          <p className="mb-0 small text-truncate" style={{ maxWidth: "200px" }} title={c.motivo}>
                            {c.motivo || 'Consulta general'}
                          </p>
                        </td>
                        <td className="text-center">
                          <span className={`badge px-3 py-2 border shadow-sm ${
                            c.estado === 'programada' ? `bg-success-subtle text-success border-success-subtle` : 
                            c.estado === 'cancelada' ? `bg-danger-subtle text-danger border-danger-subtle` :
                            `bg-warning-subtle text-warning border-warning-subtle`
                          }`}>
                            <i className={`bi bi-circle-fill me-1 small`}></i> {c.estado?.charAt(0).toUpperCase() + c.estado?.slice(1) || 'Pendiente'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group shadow-sm" style={{ borderRadius: "10px", overflow: "hidden" }}>
                            <button 
                              className="btn btn-white btn-sm border" 
                              title="Reprogramar Cita"
                              onClick={() => handleEditarCita(c)}
                              disabled={c.estado !== 'programada'}
                            >
                              <i className="bi bi-pencil text-primary"></i>
                            </button>
                            <button 
                              className="btn btn-white btn-sm border" 
                              title="Cancelar Cita"
                              onClick={() => handleCancelarCita(c.id)}
                              disabled={c.estado !== 'programada'}
                            >
                              <i className="bi bi-x-circle text-danger"></i>
                            </button>
                            {c.estado === 'programada' && (
                              <button 
                                className="btn btn-white btn-sm border" 
                                title="Marcar como Completada"
                                onClick={() => handleCompletarCita(c.id)}
                              >
                                <i className="bi bi-check-circle text-success"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="opacity-25 mb-3"><i className="bi bi-calendar-x fs-1"></i></div>
                        <p className="fw-bold opacity-50">No hay citas registradas para este periodo.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Citas;