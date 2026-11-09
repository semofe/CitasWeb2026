import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function AgendarCita() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const userMedicoId = localStorage.getItem("userMedicoId") || "";

  const [sedes, setSedes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [todosLosMedicos, setTodosLosMedicos] = useState([]); 
  const [medicosFiltrados, setMedicosFiltrados] = useState([]); 
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("error");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [reserva, setReserva] = useState({
    sedeId: "", especialidadId: "", medico_id: "", fecha: "", slot: "", motivo: ""
  });

  // Obtener el médico seleccionado para acceder a sus datos completos
  const medicoSeleccionado = todosLosMedicos.find(m => String(m.id) === String(reserva.medico_id));

  const fetchData = async () => {
    try {
      const [resSed, resEsp, resMed] = await Promise.all([
        axiosInstance.get("/sedes"),
        axiosInstance.get("/especialidades"),
        axiosInstance.get("/medicos")
      ]);

      setSedes(Array.isArray(resSed.data) ? resSed.data : (resSed.data.data || []));
      setEspecialidades(Array.isArray(resEsp.data) ? resEsp.data : (resEsp.data.data || []));
      setTodosLosMedicos(Array.isArray(resMed.data) ? resMed.data : (resMed.data.data || []));
      
      setLoading(false);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LÓGICA DE FILTRADO ULTRA-RESISTENTE ---
  useEffect(() => {
    if (!reserva.sedeId || !reserva.especialidadId) {
      setMedicosFiltrados([]);
    } else {
      const filtrados = todosLosMedicos.filter(m => {
        // Obtenemos los IDs del médico probando todas las llaves posibles de tu base de datos
        const mSedeId = m.sede_id || m.sedeId || m.sede?.id;
        const mEspId = m.especialidad_id || m.especialidadId || m.especialidad?.id;

        // Excluir al médico logueado para que no se pueda agendar consigo mismo
        if (userMedicoId && String(m.id) === String(userMedicoId)) return false;

        // Comparamos convirtiendo a String para evitar fallos de tipo
        return String(mSedeId) === String(reserva.sedeId) && 
               String(mEspId) === String(reserva.especialidadId);
      });

      setMedicosFiltrados(filtrados);
    }
  }, [reserva.sedeId, reserva.especialidadId, todosLosMedicos]);

  useEffect(() => {
    if (!reserva.medico_id || !reserva.fecha) {
      setSlotsDisponibles([]);
      return;
    }

    let active = true;
    const cargarSlots = async () => {
      setSlotsLoading(true);
      try {
        const response = await axiosInstance.get("/citas/slots", {
          params: { medicoId: reserva.medico_id, fecha: reserva.fecha }
        });
        if (active) setSlotsDisponibles(response.data?.data || []);
      } catch (error) {
        if (active) {
          setSlotsDisponibles([]);
          setModalTitle("No se pudieron cargar los horarios");
          setModalMessage(error.response?.data?.message || "Intenta nuevamente en unos segundos.");
          setModalType("error");
          setModalShow(true);
        }
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    cargarSlots();
    return () => { active = false; };
  }, [reserva.medico_id, reserva.fecha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reserva.medico_id || !reserva.fecha || !reserva.slot) {
      setModalTitle("Campos Incompletos");
      setModalMessage("Por favor completa todos los campos requeridos");
      setModalType("warning");
      setModalShow(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        medico_id: reserva.medico_id,
        fecha: reserva.fecha,
        slot: reserva.slot,
        turno: getTurnoDeSlot(reserva.slot),
        motivo: reserva.motivo || "Consulta general",
      };

      const response = await axiosInstance.post("/citas", payload);
      
      if (response.status === 201 || response.status === 200) {
        const citaId = response.data?.data?.id;
        const paymentResponse = await axiosInstance.post("/payments/checkout", { citaId });
        const paymentId = paymentResponse.data?.data?.id;
        if (!paymentId) throw new Error("No se pudo generar la orden de pago.");
        navigate(`/pago/${paymentId}`);
      }
    } catch (error) {
      const mensajeError = error.response?.data?.message || error.response?.data?.error || error.message || "Error desconocido";
      setModalTitle("Error al Registrar Cita");
      setModalMessage(mensajeError);
      setModalType("error");
      setModalShow(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Determinar turno a partir del slot seleccionado
  const getTurnoDeSlot = (slot) => {
    return Number(slot.slice(0, 2)) < 12 ? "mañana" : "tarde";
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />
      
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-2 mb-4">
        <div>
          <span className="text-uppercase fw-bold small" style={{ color: theme.accentHex, letterSpacing: ".12em" }}>Atención médica</span>
          <h2 className="fw-bold mb-1">Reserva tu cita</h2>
          <p className="mb-0 opacity-75">Elige la sede, especialista y horario que más te convenga.</p>
        </div>
        <div className="px-3 py-2 rounded-3 small fw-semibold" style={{ backgroundColor: `${theme.accentHex}14`, color: theme.accentHex }}>
          <i className="bi bi-shield-check me-2"></i>Reserva segura
        </div>
      </div>

      <div className="card shadow-lg border-0 p-4 p-md-5" style={{ backgroundColor: theme.cardBg, borderRadius: "20px" }}>
        {loading ? (
          <div className="text-center py-5">
            <div className={`spinner-border text-${theme.accent}`}></div>
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-4 mb-3">
                <label className="small fw-bold">1. Sede <span className="text-danger">*</span></label>
                <select className="form-select" required value={reserva.sedeId} onChange={e => setReserva({...reserva, sedeId: e.target.value, medico_id: "", especialidadId: ""})}>
                    <option value="">Elegir sede...</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
            </div>
            <div className="col-md-4 mb-3">
                <label className="small fw-bold">2. Especialidad <span className="text-danger">*</span></label>
                <select className={`form-select ${!reserva.sedeId ? 'disabled opacity-50' : ''}`} required disabled={!reserva.sedeId} value={reserva.especialidadId} onChange={e => setReserva({...reserva, especialidadId: e.target.value, medico_id: ""})}>
                    <option value="">Elegir especialidad...</option>
                    {especialidades.map(esp => <option key={esp.id} value={esp.id}>{esp.nombre}</option>)}
                </select>
            </div>
            <div className="col-md-4 mb-3">
                <label className="small fw-bold">3. Médico <span className="text-danger">*</span></label>
                <select className={`form-select ${!reserva.especialidadId ? 'disabled opacity-50' : ''}`} required disabled={!reserva.especialidadId} value={reserva.medico_id} onChange={e => setReserva({...reserva, medico_id: e.target.value, slot: ""})}>
                    <option value="">
                      {medicosFiltrados.length === 0 
                        ? (!reserva.especialidadId ? "Primero elige especialidad" : "No hay médicos disponibles")
                        : "Seleccionar médico..."}
                    </option>
                    {medicosFiltrados.map(m => <option key={m.id} value={m.id}>Dr. {m.nombres} {m.apellidos} ({m.turno || "Sin turno"})</option>)}
                </select>
            </div>
            <div className="col-md-4 mb-4">
                <label className="small fw-bold">4. Fecha <span className="text-danger">*</span></label>
                <style>{`
                  .react-datepicker-wrapper {
                    width: 100%;
                  }
                  .react-datepicker__input-container {
                    display: block;
                  }
                  .datepicker-input {
                    width: 100%;
                    padding: 0.375rem 0.75rem;
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    color: ${theme.text};
                    background-color: ${theme.cardBg};
                  }
                  .datepicker-input:focus {
                    outline: none;
                    border-color: ${theme.accentHex};
                    box-shadow: 0 0 0 0.2rem ${theme.accentHex}33;
                  }
                  .react-datepicker {
                    background-color: ${theme.cardBg};
                    border: 1px solid ${theme.border};
                    border-radius: 0.5rem;
                  }
                  .react-datepicker__header {
                    background-color: ${theme.accentHex}20;
                    border-bottom: 1px solid ${theme.border};
                  }
                  .react-datepicker__month {
                    color: ${theme.text};
                  }
                  .react-datepicker__day-names {
                    color: ${theme.text};
                  }
                  .react-datepicker__day {
                    color: ${theme.text};
                  }
                  .react-datepicker__day--selected {
                    background-color: ${theme.accentHex};
                    color: white;
                  }
                  .react-datepicker__day--today {
                    font-weight: bold;
                    color: ${theme.accentHex};
                  }
                  .react-datepicker__day--disabled {
                    cursor: not-allowed !important;
                    color: #999999 !important;
                    background-color: #f0f0f0 !important;
                  }
                  .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
                    background-color: ${theme.accentHex}40;
                  }
                `}</style>
                <DatePicker
                  selected={reserva.fecha ? new Date(reserva.fecha + "T12:00:00") : null}
                  onChange={(date) => {
                    if (date) {
                      const fechaStr = date.toISOString().split('T')[0];
                      setReserva({...reserva, fecha: fechaStr, slot: ""});
                    }
                  }}
                  filterDate={(date) => {
                    if (!medicoSeleccionado || !medicoSeleccionado.diasAtencion) {
                      return date >= new Date(new Date().setHours(0, 0, 0, 0));
                    }
                    
                    // Validar que sea futuro
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    if (date < hoy) return false;
                    
                    // Validar que sea un día que atiende
                    const diaElegido = date.toLocaleDateString("es-PE", { weekday: "long" })
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "");
                    
                    const diasNormalizados = medicoSeleccionado.diasAtencion.map(d => 
                      String(d).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    );
                    
                    return diasNormalizados.includes(diaElegido);
                  }}
                  disabled={!reserva.medico_id}
                  minDate={new Date()}
                  placeholderText="Selecciona una fecha"
                  className="datepicker-input"
                  dateFormat="yyyy-MM-dd"
                />
                {medicoSeleccionado && medicoSeleccionado.diasAtencion && (
                  <small className="d-block mt-2 opacity-75">
                    <i className="bi bi-info-circle me-1"></i>
                    Disponible: <strong>{medicoSeleccionado.diasAtencion.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}</strong>
                  </small>
                )}
            </div>
            <div className="col-md-8 mb-3">
                <label className="small fw-bold">Motivo de la Consulta <span className="text-muted">(Opcional)</span></label>
                <textarea className="form-control" placeholder="Describe brevemente el motivo de tu consulta..." value={reserva.motivo} onChange={e => setReserva({...reserva, motivo: e.target.value})} rows="2"></textarea>
            </div>
          </div>

          <div className={`mb-5 p-4 border rounded-4 ${(!reserva.medico_id || !reserva.fecha) ? 'bg-light opacity-50' : 'bg-light'}`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="small fw-bold mb-0">5. Horarios disponibles <span className="text-danger">*</span></label>
              {reserva.medico_id && reserva.fecha && <span className="small text-muted">Actualizado en tiempo real</span>}
            </div>
            {!reserva.medico_id || !reserva.fecha ? (
              <p className="text-muted small mb-0">⬆️ Completa los campos anteriores para ver horarios disponibles</p>
            ) : slotsLoading ? (
              <div className="d-flex align-items-center gap-2 small text-muted"><span className="spinner-border spinner-border-sm"></span>Consultando disponibilidad...</div>
            ) : slotsDisponibles.length === 0 ? (
              <p className="text-muted small mb-0">No quedan horarios disponibles para esta fecha. Elige otra fecha o especialista.</p>
            ) : (
              <div className="d-flex flex-wrap gap-2" style={{ backgroundColor: "transparent" }}>
                {slotsDisponibles.map(hora => {
                  const isSelected = reserva.slot === hora;
                  
                  return (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => setReserva({...reserva, slot: hora})}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: isSelected ? theme.accentHex : theme.cardBg,
                        color: isSelected ? "white" : theme.text,
                        border: `1px solid ${isSelected ? theme.accentHex : theme.border}`,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        transition: "0.2s",
                        fontSize: "0.85rem",
                        fontWeight: isSelected ? "bold" : "normal"
                      }}
                      title={`Reservar ${hora}`}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" disabled={!reserva.slot || submitting} className={`btn btn-${theme.accent} btn-lg w-100 fw-bold shadow`} style={{ borderRadius: "15px" }}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
              </>
            ) : "Confirmar Cita"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

export default AgendarCita;
