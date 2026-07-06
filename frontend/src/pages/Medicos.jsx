import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import HorarioSelector from "../components/HorarioSelector";
import NotificationModal from "../components/NotificationModal";
import ConfirmModal from "../components/ConfirmModal";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../api/axiosInstance";

function Medicos() {
  const { isDarkMode, theme } = useTheme();
  
  // 1. IDENTIFICACIÓN DE ROL
  const role = localStorage.getItem("userRole") || "usuario";

  // 2. ESTADOS DE DATOS
  const [medicos, setMedicos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. ESTADOS PARA FILTROS
  const [filterName, setFilterName] = useState("");
  const [filterSede, setFilterSede] = useState("");
  const [filterEsp, setFilterEsp] = useState("");

  // 5. NOTIFICACIÓN MODAL
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // 6. ESTADOS PARA EL REGISTRO (ADMIN)
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [medicoToDelete, setMedicoToDelete] = useState(null);


  const [nuevoMedico, setNuevoMedico] = useState({
    nombres: "", apellidos: "", email: "", telefono: "",
    sedeId: "", especialidadId: "", turno: "mañana", activo: true,
    crearAcceso: true, dni: "", password: "", sexo: ""
  });
  const [editMedico, setEditMedico] = useState({
    id: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    sedeId: "",
    especialidadId: "",
    turno: "mañana",
    diasAtencion: "",
    activo: true,
  });

  // 7. ESTADOS PARA HORARIOS (Nuevo selector visual)
  const [horariosList, setHorariosList] = useState([]);

  // CARGAR TODA LA INFORMACIÓN DESDE EL BACKEND
  const loadAllData = async () => {
    try {
      const [resMed, resSed, resEsp] = await Promise.all([
        axiosInstance.get("/medicos"),
        axiosInstance.get("/sedes"),
        axiosInstance.get("/especialidades")
      ]);

      const dMed = resMed.data;
      const dSed = resSed.data;
      const dEsp = resEsp.data;

      setMedicos(Array.isArray(dMed) ? dMed : (dMed.data || []));
      setSedes(Array.isArray(dSed) ? dSed : (dSed.data || []));
      setEspecialidades(Array.isArray(dEsp) ? dEsp : (dEsp.data || []));
      
      setLoading(false);
    } catch (error) { 
      console.error("Error cargando datos:", error);
      setLoading(false); 
    }
  };

  useEffect(() => { loadAllData(); }, []);

  // Manejar cambios en la selección de horarios
  const handleHorarioSelectionChange = (bloques) => {
    setHorariosList(bloques);
  };

  // AYUDANTES PARA TRADUCIR IDs A NOMBRES (Soluciona el problema de los "---")
  const getSedeNombre = (m) => {
    if (m.sede?.nombre) return m.sede.nombre;
    const idABuscar = m.sede_id || m.sedeId;
    const encontrada = sedes.find(s => String(s.id) === String(idABuscar));
    return encontrada ? encontrada.nombre : "—";
  };

  const getEspNombre = (m) => {
    if (m.especialidad?.nombre) return m.especialidad.nombre;
    const idABuscar = m.especialidad_id || m.especialidadId;
    const encontrada = especialidades.find(e => String(e.id) === String(idABuscar));
    return encontrada ? encontrada.nombre : "—";
  };

  // LÓGICA DE FILTRADO DINÁMICO
  const medicosFiltrados = medicos.filter((m) => {
    const nombresFull = `${m.nombres || m.names || ""} ${m.apellidos || m.last_names || ""}`.toLowerCase();
    const coincideNombre = nombresFull.includes(filterName.toLowerCase());
    const sId = m.sede_id || m.sedeId || m.sede?.id;
    const coincideSede = filterSede === "" || sId === filterSede;
    const eId = m.especialidad_id || m.especialidadId || m.especialidad?.id;
    const coincideEsp = filterEsp === "" || eId === filterEsp;
    return coincideNombre && coincideSede && coincideEsp;
  });

  // FUNCIÓN DE GUARDADO FINAL
  const handleGuardarMedico = async (e) => {
    e.preventDefault();
    
    // Validar que haya horarios seleccionados
    if (horariosList.length === 0) {
      setModalTitle("Selección Incompleta");
      setModalMessage("Por favor, selecciona al menos un turno y un día de atención.");
      setModalType("warning");
      setModalShow(true);
      return;
    }

    const todosLosDias = [...new Set(horariosList.flatMap(h => h.diasArray))];
    const scheduleArray = horariosList.map(h => `${h.dias}: ${h.rango}`);
    
    // Derivar turno de los horarios seleccionados
    const turnosPresentes = [...new Set(horariosList.map(h => h.turno))];
    const turnoFinal = turnosPresentes.join(",");

    const medicoPayload = { 
      nombres: nuevoMedico.nombres, 
      apellidos: nuevoMedico.apellidos,
      email: nuevoMedico.email, 
      telefono: nuevoMedico.telefono,
      sedeId: nuevoMedico.sedeId, 
      especialidadId: nuevoMedico.especialidadId,
      turno: turnoFinal, 
      diasAtencion: todosLosDias, 
      dias_atencion: scheduleArray, 
      activo: true
    };

    if (nuevoMedico.crearAcceso) {
      if (!nuevoMedico.dni || !nuevoMedico.password) {
        setModalTitle("Datos incompletos");
        setModalMessage("Para crear acceso, completa DNI y contraseña del médico.");
        setModalType("warning");
        setModalShow(true);
        return;
      }
    }

    try {
      const endpoint = nuevoMedico.crearAcceso ? "/medicos/con-acceso" : "/medicos";
      const payload = nuevoMedico.crearAcceso
        ? {
            ...medicoPayload,
            dni: nuevoMedico.dni,
            password: nuevoMedico.password,
            names: nuevoMedico.nombres,
            last_names: nuevoMedico.apellidos,
            phone: nuevoMedico.telefono,
            sexo: nuevoMedico.sexo || null,
          }
        : medicoPayload;

      const response = await axiosInstance.post(endpoint, payload);
      if (response.data) {
        setModalTitle("¡Éxito!");
        setModalMessage(nuevoMedico.crearAcceso ? "Médico y acceso creados con éxito" : "Médico registrado con éxito");
        setModalType("success");
        setModalShow(true);
        
        setShowModal(false);
        setHorariosList([]);
        setNuevoMedico({
          nombres: "", apellidos: "", email: "", telefono: "", 
          sedeId: "", especialidadId: "", turno: "mañana", activo: true,
          crearAcceso: true, dni: "", password: "", sexo: ""
        });
        
        setTimeout(() => loadAllData(), 1500);
      }
    } catch (error) { 
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Error al guardar el médico");
      setModalType("error");
      setModalShow(true);
    }
  };

  const abrirModalEdicion = (medico) => {
    const diasAtencion = Array.isArray(medico.diasAtencion)
      ? medico.diasAtencion.join(",")
      : (Array.isArray(medico.dias_atencion) ? medico.dias_atencion.join(",") : "");

    setEditMedico({
      id: medico.id,
      nombres: medico.nombres || medico.names || "",
      apellidos: medico.apellidos || medico.last_names || "",
      email: medico.email || "",
      telefono: medico.telefono || medico.phone || "",
      sedeId: medico.sede?.id || medico.sedeId || medico.sede_id || "",
      especialidadId: medico.especialidad?.id || medico.especialidadId || medico.especialidad_id || "",
      turno: medico.turno || "mañana",
      diasAtencion,
      activo: medico.activo !== false,
    });

    setShowEditModal(true);
  };

  const cerrarModalEdicion = () => {
    setShowEditModal(false);
  };

  const handleEditarMedico = async (e) => {
    e.preventDefault();

    const diasNormalizados = editMedico.diasAtencion
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    if (diasNormalizados.length === 0) {
      setModalTitle("Datos incompletos");
      setModalMessage("Debes registrar al menos un día de atención separado por comas.");
      setModalType("warning");
      setModalShow(true);
      return;
    }

    try {
      await axiosInstance.put(`/medicos/${editMedico.id}`, {
        nombres: editMedico.nombres,
        apellidos: editMedico.apellidos,
        email: editMedico.email,
        telefono: editMedico.telefono,
        sedeId: editMedico.sedeId,
        especialidadId: editMedico.especialidadId,
        turno: editMedico.turno,
        diasAtencion: diasNormalizados,
        activo: editMedico.activo,
      });

      setModalTitle("¡Éxito!");
      setModalMessage("Datos del médico actualizados correctamente");
      setModalType("success");
      setModalShow(true);
      cerrarModalEdicion();
      setTimeout(() => loadAllData(), 800);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "No se pudo actualizar el médico");
      setModalType("error");
      setModalShow(true);
    }
  };

  const abrirModalEliminar = (medico) => {
    setMedicoToDelete(medico);
    setDeleteModalShow(true);
  };

  const cerrarModalEliminar = () => {
    setDeleteModalShow(false);
    setMedicoToDelete(null);
  };

  const confirmarEliminarMedico = async () => {
    if (!medicoToDelete) return;
    try {
      await axiosInstance.delete(`/medicos/${medicoToDelete.id}`);
      cerrarModalEliminar();
      setModalTitle("¡Éxito!");
      setModalMessage("Médico eliminado correctamente");
      setModalType("success");
      setModalShow(true);
      setTimeout(() => loadAllData(), 800);
    } catch (error) {
      cerrarModalEliminar();
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "No se pudo eliminar el médico");
      setModalType("error");
      setModalShow(true);
    }
  };

  const handleToggleActivo = async (medico) => {
    const accion = medico.activo ? "desactivar" : "activar";
    try {
      await axiosInstance.patch(`/medicos/${medico.id}/toggle`);
      setModalTitle("¡Éxito!");
      setModalMessage(`Médico ${accion === "desactivar" ? "desactivado" : "activado"} correctamente`);
      setModalType("success");
      setModalShow(true);
      setTimeout(() => loadAllData(), 800);
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || `No se pudo ${accion} el médico`);
      setModalType("error");
      setModalShow(true);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", transition: "0.3s" }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2" style={{ borderColor: theme.accentHex }}>
            {role === 'admin' ? 'Gestión de Staff' : 'Directorio Médico'}
        </h2>
        {role === 'admin' && (
          <button onClick={() => setShowModal(true)} className={`btn btn-${theme.accent} shadow px-4 fw-bold text-white`}>+ Registrar Médico</button>
        )}
      </div>

      {/* BARRA DE FILTROS (Visible para todos) */}
      <div className="card shadow-sm border-0 mb-4 p-3" style={{ backgroundColor: theme.cardBg, borderRadius: "15px" }}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="small fw-bold mb-1 opacity-75">Nombre del Médico</label>
            <input type="text" className="form-control" style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }} value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Buscar..." />
          </div>
          <div className="col-md-4">
            <label className="small fw-bold mb-1 opacity-75">Especialidad</label>
            <select className="form-select" style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }} value={filterEsp} onChange={e => setFilterEsp(e.target.value)}>
              <option value="">Todas</option>
              {especialidades.map(esp => <option key={esp.id} value={esp.id}>{esp.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="small fw-bold mb-1 opacity-75">Sede</label>
            <select className="form-select" style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }} value={filterSede} onChange={e => setFilterSede(e.target.value)}>
              <option value="">Todas</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="card shadow-sm border-0" style={{ backgroundColor: theme.cardBg, borderRadius: "20px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle mb-0`}>
            <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
              <tr>
                <th className="ps-4">Médico</th>
                <th>Especialidad</th>
                <th>Sede</th>
                <th>Horarios</th>
                <th>Contacto</th>
                {role === "admin" && <th className="text-center">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {medicosFiltrados.map((m) => {
                const rawHorario = m.dias_atencion || m.diasAtencion || "";
                const bloques = Array.isArray(rawHorario) ? rawHorario : (typeof rawHorario === 'string' && rawHorario !== "" ? rawHorario.split('|') : []);
                const inactivo = m.activo === false;
                return (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${theme.border}`, opacity: inactivo ? 0.5 : 1, filter: inactivo ? "grayscale(1)" : "none" }}>
                    <td className="ps-4 py-3">
                      <div className="fw-bold" style={{ color: inactivo ? "#888" : undefined }}>
                        {m.nombres || m.names} {m.apellidos || m.last_names}
                      </div>
                      <div className="small opacity-50">ID: {m.id.substring(0,5)}</div>
                      {inactivo && <span className="badge bg-secondary mt-1" style={{ fontSize: "0.6rem" }}>Inactivo</span>}
                    </td>
                    <td><span className={`badge bg-${theme.accent}-subtle text-${theme.accent} border border-${theme.accent}-subtle px-3 py-2`}>{getEspNombre(m)}</span></td>
                    <td><i className="bi bi-geo-alt-fill me-1 text-danger"></i> {getSedeNombre(m)}</td>
                    <td>{bloques.map((h, i) => (<div key={i} className="small bg-light text-dark px-2 py-1 rounded border mb-1" style={{ fontSize: "0.65rem", fontWeight: "500" }}>{h}</div>))}</td>
                    <td><i className="bi bi-telephone-fill me-2 text-success"></i>{m.telefono || m.phone}</td>
                    {role === "admin" && (
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => abrirModalEdicion(m)}
                          className="btn btn-sm btn-link text-decoration-none p-0 me-3"
                          style={{ color: theme.muted }}
                          aria-label={`Editar médico ${(m.nombres || m.names || "") + " " + (m.apellidos || m.last_names || "")}`}
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalEliminar(m)}
                          className="btn btn-sm btn-link text-danger text-decoration-none p-0 me-2"
                          aria-label={`Eliminar médico ${(m.nombres || m.names || "") + " " + (m.apellidos || m.last_names || "")}`}
                        >
                          <i className="bi bi-trash3 fs-5"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(m)}
                          className={`btn btn-sm btn-link text-decoration-none p-0 ${inactivo ? "text-success" : "text-warning"}`}
                          aria-label={`${inactivo ? "Activar" : "Desactivar"} médico ${(m.nombres || m.names || "") + " " + (m.apellidos || m.last_names || "")}`}
                          title={inactivo ? "Activar médico" : "Desactivar médico"}
                        >
                          <i className={`bi ${inactivo ? "bi-toggle-off" : "bi-toggle-on"} fs-5`}></i>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REGISTRO (PARA ADMIN) */}
      {showModal && role === 'admin' && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: theme.cardBg, color: theme.text, borderRadius: "25px" }}>
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold">Nuevo Especialista</h5>
                <button onClick={() => setShowModal(false)} className="btn-close"></button>
              </div>
              <form onSubmit={handleGuardarMedico}>
                <div className="modal-body p-4">
                  <div className="row mb-3">
                    <div className="col-md-6 mb-2">
                      <label className="small fw-bold">Nombres</label>
                      <input type="text" className="form-control" required onChange={e => setNuevoMedico({...nuevoMedico, nombres: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="small fw-bold">Apellidos</label>
                      <input type="text" className="form-control" required onChange={e => setNuevoMedico({...nuevoMedico, apellidos: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="small fw-bold">Email</label>
                      <input type="email" className="form-control" required onChange={e => setNuevoMedico({...nuevoMedico, email: e.target.value})} />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="small fw-bold">Teléfono</label>
                      <input type="text" className="form-control" placeholder="9xxxxxxxx" required onChange={e => setNuevoMedico({...nuevoMedico, telefono: e.target.value})} />
                    </div>
                    <div className="col-12 mb-2">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="crearAccesoMedico"
                          checked={nuevoMedico.crearAcceso}
                          onChange={e => setNuevoMedico({ ...nuevoMedico, crearAcceso: e.target.checked })}
                        />
                        <label className="form-check-label small fw-bold" htmlFor="crearAccesoMedico">
                          Crear acceso al sistema para este médico
                        </label>
                      </div>
                    </div>
                    {nuevoMedico.crearAcceso && (
                      <>
                        <div className="col-md-6 mb-2">
                          <label className="small fw-bold">DNI de Acceso</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="8 dígitos"
                            maxLength={8}
                            required
                            value={nuevoMedico.dni}
                            onChange={e => setNuevoMedico({ ...nuevoMedico, dni: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="small fw-bold">Contraseña Inicial</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Mínimo 8 caracteres"
                            required
                            value={nuevoMedico.password}
                            onChange={e => setNuevoMedico({ ...nuevoMedico, password: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 mb-2">
                          <label className="small fw-bold">Sexo</label>
                          <select
                            className="form-select"
                            value={nuevoMedico.sexo}
                            onChange={e => setNuevoMedico({ ...nuevoMedico, sexo: e.target.value })}
                          >
                            <option value="">Sin especificar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                            <option value="O">Otro</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div className="col-md-4 mb-2">
                      <label className="small fw-bold">Sede</label>
                      <select className="form-select" required onChange={e => setNuevoMedico({...nuevoMedico, sedeId: e.target.value})}>
                        <option value="">Elegir Sede</option>
                        {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="small fw-bold">Especialidad</label>
                      <select className="form-select" required onChange={e => setNuevoMedico({...nuevoMedico, especialidadId: e.target.value})}>
                        <option value="">Elegir Especialidad</option>
                        {especialidades.map(esp => <option key={esp.id} value={esp.id}>{esp.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* NUEVO SELECTOR DE HORARIOS */}
                  <div className="mb-3">
                    <h6 className="fw-bold mb-3">Horarios de Atención</h6>
                    <HorarioSelector 
                      onSelectionChange={handleHorarioSelectionChange}
                      theme={theme}
                    />
                  </div>

                  {/* RESUMEN DE BLOQUES SELECCIONADOS */}
                  {horariosList.length > 0 && (
                    <div className="mt-3 p-3 rounded-2" style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}>
                      <h6 className="fw-bold mb-2">Bloques Configurados:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {horariosList.map((h, i) => (
                          <span key={i} className="badge" style={{ backgroundColor: theme.accentHex }}>
                            {h.dias}: {h.rango}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="submit" className={`btn btn-${theme.accent} w-100 py-3 fw-bold text-white shadow`}>
                    Confirmar Registro Completo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN (ADMIN) */}
      {showEditModal && role === "admin" && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: theme.cardBg, color: theme.text, borderRadius: "25px" }}>
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold">Editar Médico</h5>
                <button onClick={cerrarModalEdicion} className="btn-close"></button>
              </div>
              <form onSubmit={handleEditarMedico}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="small fw-bold">Nombres</label>
                      <input type="text" className="form-control" required value={editMedico.nombres} onChange={(e) => setEditMedico({ ...editMedico, nombres: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="small fw-bold">Apellidos</label>
                      <input type="text" className="form-control" required value={editMedico.apellidos} onChange={(e) => setEditMedico({ ...editMedico, apellidos: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="small fw-bold">Email</label>
                      <input type="email" className="form-control" required value={editMedico.email} onChange={(e) => setEditMedico({ ...editMedico, email: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="small fw-bold">Teléfono</label>
                      <input type="text" className="form-control" value={editMedico.telefono} onChange={(e) => setEditMedico({ ...editMedico, telefono: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="small fw-bold">Sede</label>
                      <select className="form-select" required value={editMedico.sedeId} onChange={(e) => setEditMedico({ ...editMedico, sedeId: e.target.value })}>
                        <option value="">Elegir Sede</option>
                        {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="small fw-bold">Especialidad</label>
                      <select className="form-select" required value={editMedico.especialidadId} onChange={(e) => setEditMedico({ ...editMedico, especialidadId: e.target.value })}>
                        <option value="">Elegir Especialidad</option>
                        {especialidades.map((esp) => <option key={esp.id} value={esp.id}>{esp.nombre}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="small fw-bold">Turno</label>
                      <select className="form-select" value={editMedico.turno} onChange={(e) => setEditMedico({ ...editMedico, turno: e.target.value })}>
                        <option value="mañana">Mañana</option>
                        <option value="tarde">Tarde</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="small fw-bold">Días de atención (separados por coma)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editMedico.diasAtencion}
                        onChange={(e) => setEditMedico({ ...editMedico, diasAtencion: e.target.value })}
                        placeholder="lunes,martes,miercoles"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch mt-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="medicoActivo"
                          checked={editMedico.activo}
                          onChange={(e) => setEditMedico({ ...editMedico, activo: e.target.checked })}
                        />
                        <label className="form-check-label small fw-bold" htmlFor="medicoActivo">
                          Médico activo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="submit" className={`btn btn-${theme.accent} w-100 py-3 fw-bold text-white shadow`}>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={deleteModalShow}
        title="Eliminar médico"
        message={`¿Seguro que deseas eliminar al médico ${(medicoToDelete?.nombres || medicoToDelete?.names || "")} ${(medicoToDelete?.apellidos || medicoToDelete?.last_names || "")}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminarMedico}
        onCancel={cerrarModalEliminar}
      />

      {/* MODAL DE NOTIFICACIÓN */}
      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />
    </div>
  );
}

export default Medicos;