import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useTheme } from "../ThemeContext";
import axiosInstance from "../api/axiosInstance";
import NotificationModal from "../components/NotificationModal";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

function Dashboard() {
  const { isDarkMode, theme } = useTheme();

  // OBTENEMOS DATOS DEL USUARIO LOGUEADO
  const role = localStorage.getItem("userRole") || "usuario";
  const userName = localStorage.getItem("userName") || "Usuario";

  // 1. ESTADOS PARA LOS DATOS REALES
  const [counts, setCounts] = useState({ medicos: 0, pacientes: 0, especialidades: 0, citasHoy: 0 });
  const [ultimasCitas, setUltimasCitas] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCitas, setAllCitas] = useState([]);
  const [citasDiaSeleccionado, setCitasDiaSeleccionado] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalDetalleShow, setModalDetalleShow] = useState(false);
  const [exporting, setExporting] = useState(null);
  
  // ESTADOS PARA GRÁFICOS
  const [citasPorEstado, setCitasPorEstado] = useState({ programada: 0, completada: 0, cancelada: 0 });
  const [citasPorMes, setCitasPorMes] = useState({});

  // 2. FUNCIÓN PARA CARGAR TODO DESDE EL BACKEND (RUTAS CORREGIDAS A PLURAL)
  const loadDashboardData = async () => {
    try {
      // Determinamos el endpoint de citas según el rol
      const citasEndpoint = role === 'admin' ? "/citas" : role === 'medico' ? "/citas/mis-citas-medico" : "/citas/mis-citas";
      console.log("Cargando citas desde:", citasEndpoint, "- Rol:", role); // DEBUG
      
      // Para admin: cargar todo. Para usuario: solo citas, médicos y especialidades
      const requestsArray = [
        axiosInstance.get("/medicos"),
        axiosInstance.get("/especialidades"),
        axiosInstance.get(citasEndpoint)
      ];
      
      // Solo admin carga usuarios
      if (role === 'admin') {
        requestsArray.splice(1, 0, axiosInstance.get("/users"));
      }
      
      const responses = await Promise.all(requestsArray);
      
      let medicos, users, especialidades, citas;
      if (role === 'admin') {
        [medicos, users, especialidades, citas] = responses;
      } else {
        [medicos, especialidades, citas] = responses;
        users = { data: [] }; // Usuario normal no tiene acceso a usuarios
      }

      console.log("Citas recibidas:", citas.data); // DEBUG

      const medicosList = Array.isArray(medicos.data) ? medicos.data : medicos.data.data || [];
      const usersList = Array.isArray(users.data) ? users.data : users.data?.data || [];
      const especialidadesList = Array.isArray(especialidades.data) ? especialidades.data : especialidades.data.data || [];
      const citasList = Array.isArray(citas.data) ? citas.data : citas.data.data || [];

      console.log("Citas procesadas (lista):", citasList); // DEBUG

      const hoy = new Date().toISOString().split('T')[0];
      const hoyCitas = citasList.filter(c => c.fecha === hoy).length;

      setCounts({
        medicos: medicosList.length,
        pacientes: usersList.length,
        especialidades: especialidadesList.length,
        citasHoy: hoyCitas
      });

      // Guardar todas las citas para búsqueda por día
      setAllCitas(citasList);

      // Tomamos las últimas 4 para la vista previa
      setUltimasCitas(citasList.slice(-4).reverse());

      // Cargamos los eventos al calendario
      const events = citasList.map(c => ({
        title: `${c.slot}`, // Mostrar hora de la cita
        date: c.fecha,
        color: theme.accentHex,
        extendedProps: { cita: c } // Pasar datos de la cita
      }));
      setCalendarEvents(events);
      
      // Calcular estadísticas para gráficos
      const estadoCounts = { programada: 0, completada: 0, cancelada: 0 };
      const mesCounts = {};
      
      citasList.forEach(cita => {
        // Contar por estado
        const estado = cita.estado || 'programada';
        if (estado in estadoCounts) {
          estadoCounts[estado]++;
        }
        
        // Contar por mes
        const fecha = new Date(cita.fecha);
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        mesCounts[mesKey] = (mesCounts[mesKey] || 0) + 1;
      });
      
      setCitasPorEstado(estadoCounts);
      setCitasPorMes(mesCounts);

      setLoading(false);
    } catch (error) {
      console.error("Error cargando el dashboard:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Dashboard cargando con rol:", role); // DEBUG
    loadDashboardData();
  }, [theme.accentHex, role]);

  const handleDateClick = (info) => {
    const fechaSeleccionada = info.dateStr;
    const citas = allCitas.filter(c => c.fecha === fechaSeleccionada);
    
    setDiaSeleccionado(fechaSeleccionada);
    setCitasDiaSeleccionado(citas);
    setModalShow(true);
  };

  const handleClickCita = (cita) => {
    setCitaSeleccionada(cita);
    setModalDetalleShow(true);
  };

  const downloadCsv = async (endpoint, filename, label) => {
    try {
      setExporting(label);
      const response = await axiosInstance.get(endpoint, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exportando ${label}:`, error);
    } finally {
      setExporting(null);
    }
  };

  const cards = [
    { titulo: "Médicos", cantidad: counts.medicos, color: `border-${theme.accent}` },
    { titulo: "Pacientes", cantidad: counts.pacientes, color: isDarkMode ? "border-light" : "border-dark" },
    { titulo: "Especialidades", cantidad: counts.especialidades, color: "border-secondary" },
    { titulo: "Citas Hoy", cantidad: counts.citasHoy, color: `border-${theme.accent}` }
  ];

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", transition: "0.3s" }}>
      
      {/* SALUDO PERSONALIZADO */}
      <div className="mb-4">
        <h2 className="fw-bold mb-0">Hola, {userName} 👋</h2>
        <p className="opacity-75">Bienvenido al Sistema de Gestión de la Clínica Ricardo Palma.</p>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold border-bottom border-3 d-inline-block pb-2" style={{ borderColor: theme.accentHex }}>
          {role === 'admin' ? 'Panel de Control Global' : 'Mi Resumen Médico'}
        </h4>
        <span className="badge shadow-sm p-2 border" style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }}>
          {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {role === 'admin' && (
        <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold mb-1">Exportación de datos</h5>
                <p className="mb-0 opacity-75 small">Descarga CSV listos para Excel con tablas individuales y combinadas.</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-outline-${theme.accent} btn-sm`}
                  onClick={() => downloadCsv("/exports/users", "usuarios.csv", "usuarios")}
                  disabled={exporting !== null}
                >
                  {exporting === "usuarios" ? "Exportando..." : "Usuarios"}
                </button>
                <button
                  className={`btn btn-outline-${theme.accent} btn-sm`}
                  onClick={() => downloadCsv("/exports/medicos", "medicos.csv", "medicos")}
                  disabled={exporting !== null}
                >
                  {exporting === "medicos" ? "Exportando..." : "Médicos"}
                </button>
                <button
                  className={`btn btn-outline-${theme.accent} btn-sm`}
                  onClick={() => downloadCsv("/exports/citas", "citas.csv", "citas")}
                  disabled={exporting !== null}
                >
                  {exporting === "citas" ? "Exportando..." : "Citas"}
                </button>
                <button
                  className={`btn btn-outline-${theme.accent} btn-sm`}
                  onClick={() => downloadCsv("/exports/citas-historial", "citas_historial.csv", "historial")}
                  disabled={exporting !== null}
                >
                  {exporting === "historial" ? "Exportando..." : "Historial"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. SECCIÓN DE TARJETAS CONDICIONALES POR ROL */}
      <div className="row mb-4">
        {role === 'admin' ? (
          cards.map((card, index) => (
            <div className="col-md-3" key={index}>
              <div className={`card shadow-sm border-0 border-start border-4 ${card.color}`} style={{ backgroundColor: theme.cardBg, color: theme.text }}>
                <div className="card-body">
                  <h6 className="opacity-75 text-uppercase small fw-bold">{card.titulo}</h6>
                  <h3 className="fw-bold mb-0">{loading ? "..." : card.cantidad}</h3>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className={`card border-0 shadow-sm p-4 text-white bg-${theme.accent}`} style={{ borderRadius: '20px' }}>
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h3 className="fw-bold">¿Necesitas una consulta médica?</h3>
                  <p className="mb-0 opacity-75">Reserva tu cita hoy mismo con nuestros mejores especialistas.</p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <Link to="/agendar" className="btn btn-light btn-lg fw-bold px-4 shadow-sm">
                    <i className="bi bi-calendar-plus me-2"></i> Agendar Cita
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row">
        {/* 2. TABLA DE CITAS REALES */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
            <div className="card-header bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">{role === 'admin' ? 'Últimas Citas Registradas' : 'Mis Citas Recientes'}</h5>
              <Link to={role === 'admin' ? "/citas" : "/mis-citas"} className={`btn btn-sm btn-outline-${theme.accent} px-3`}>
                Ver todas
              </Link>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle`}>
                  <thead>
                    <tr><th>Fecha</th><th>DNI Paciente</th><th>Horario</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {!loading && ultimasCitas.length > 0 ? (
                      ultimasCitas.map((cita, i) => (
                        <tr 
                          key={i}
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                          onClick={() => handleClickCita(cita)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f9f9f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td className="small"><strong>{cita.fecha}</strong></td>
                          <td className="fw-bold">{cita.paciente?.dni || cita.pacienteDni}</td>
                          <td>{cita.slot} ({cita.turno})</td>
                          <td>
                            <span className={`badge px-3 py-2 border bg-${cita.estado === 'programada' ? 'success' : 'warning'}-subtle text-${cita.estado === 'programada' ? 'success' : 'warning'}`}>
                              {cita.estado?.charAt(0).toUpperCase() + cita.estado?.slice(1) || 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" className="text-center py-4 opacity-50">No hay citas registradas en el sistema.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 3. CALENDARIO DINÁMICO */}
        <div className="col-lg-4 mb-4">
          <style>{`
            .dashboard-calendar {
              border-radius: 12px;
              overflow: hidden;
            }
            
            .dashboard-calendar .fc {
              font-family: inherit;
            }
            
            .dashboard-calendar .fc-button-primary {
              background-color: ${theme.accentHex} !important;
              border-color: ${theme.accentHex} !important;
              border-radius: 8px;
              font-weight: 500;
              transition: all 0.2s ease;
              box-shadow: 0 2px 4px ${theme.accentHex}30;
            }
            
            .dashboard-calendar .fc-button-primary:hover {
              background-color: ${theme.accentHex}dd !important;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px ${theme.accentHex}40;
            }
            
            .dashboard-calendar .fc-button-primary.fc-button-active {
              background-color: ${theme.accentHex} !important;
              box-shadow: 0 0 0 3px ${theme.accentHex}30;
            }
            
            .dashboard-calendar .fc-col-header-cell {
              background-color: ${theme.accentHex}15 !important;
              color: ${theme.text} !important;
              font-weight: 600;
              border-color: ${theme.border};
              padding: 12px 4px !important;
            }
            
            .dashboard-calendar .fc-daygrid-day {
              cursor: pointer;
              transition: all 0.3s ease;
              border-color: ${theme.border};
            }
            
            .dashboard-calendar .fc-daygrid-day:hover {
              background-color: ${theme.accentHex}20;
              box-shadow: inset 0 0 8px ${theme.accentHex}40;
            }
            
            .dashboard-calendar .fc-daygrid-day-number {
              color: ${theme.text};
              padding: 8px;
              font-weight: 500;
            }
            
            .dashboard-calendar .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
              color: ${theme.muted};
              opacity: 0.5;
            }
            
            .dashboard-calendar .fc-daygrid-day.fc-day-other:hover {
              background-color: ${isDarkMode ? '#333333' : '#f5f5f5'};
            }
            
            .dashboard-calendar .fc-daygrid-day.fc-day-today {
              background-color: ${theme.accentHex}15;
            }
            
            .dashboard-calendar .fc-daygrid-day.fc-day-today:hover {
              background-color: ${theme.accentHex}30;
              box-shadow: inset 0 0 10px ${theme.accentHex}50;
            }
            
            .dashboard-calendar .fc-event {
              border-radius: 6px;
              border: none !important;
              box-shadow: 0 2px 6px ${theme.accentHex}40;
              transition: all 0.2s ease;
            }
            
            .dashboard-calendar .fc-event:hover {
              box-shadow: 0 4px 12px ${theme.accentHex}60;
              transform: translateY(-1px);
            }
            
            .dashboard-calendar .fc-event-title {
              color: white;
              font-weight: 600;
              padding: 4px 2px;
            }
            
            .dashboard-calendar .fc .fc-timegrid-slot {
              height: 2.5em;
              border-color: ${theme.border};
            }
            
            .dashboard-calendar .fc .fc-col-time-cell {
              vertical-align: middle;
              color: ${theme.muted};
            }
            
            .dashboard-calendar .fc .fc-daygrid-day-frame {
              min-height: 120px;
            }
            
            .dashboard-calendar .fc .fc-now-indicator-line {
              border-color: ${theme.accentHex};
              border-width: 2px;
            }
          `}</style>
          <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
            <div className="card-body p-3">
              <h5 className="fw-bold mb-3 small" style={{ color: theme.accentHex }}>Calendario de Actividades</h5>
              <div className="dashboard-calendar">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  height="auto"
                  locale={esLocale}
                  eventColor={theme.accentHex}
                  events={calendarEvents}
                  dateClick={handleDateClick}
                  eventClick={(info) => {
                    if (info.event.extendedProps?.cita) {
                      setCitaSeleccionada(info.event.extendedProps.cita);
                      setModalDetalleShow(true);
                    }
                  }}
                  headerToolbar={{
                    left: 'prev,today,next',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día'
                  }}
                  slotLabelFormat={{
                    meridiem: 'short',
                    hour: 'numeric',
                    minute: '2-digit'
                  }}
                  contentHeight="auto"
                />
              </div>
            </div>
          </div>

          <div className={`card border-0 bg-${theme.accent} text-white shadow-sm`}>
            <div className="card-body text-center">
              <h6 className="fw-bold">{role === 'admin' ? 'Actividad de Hoy' : 'Recordatorio'}</h6>
              <h2 className="mb-0">{counts.citasHoy}</h2>
              <p className="small mb-0 opacity-75">Citas para el día de hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CITAS DEL DÍA */}
      <div
        className={`modal fade ${modalShow ? 'show' : ''}`}
        style={{ display: modalShow ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
            <div className="modal-header border-0" style={{ borderColor: theme.border }}>
              <h5 className="modal-title fw-bold">
                <i className="bi bi-calendar-event me-2"></i>
                Citas del {diaSeleccionado && new Date(diaSeleccionado).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalShow(false)}
                style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
              ></button>
            </div>
            <div className="modal-body">
              {citasDiaSeleccionado.length > 0 ? (
                <div className="table-responsive">
                  <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle mb-0`}>
                    <thead>
                      <tr>
                        <th className="fw-bold">Hora</th>
                        <th className="fw-bold">Paciente</th>
                        <th className="fw-bold">Médico</th>
                        <th className="fw-bold">Especialidad</th>
                        <th className="fw-bold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasDiaSeleccionado.map((cita, i) => (
                        <tr
                          key={i}
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                          onClick={() => handleClickCita(cita)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#444' : '#f9f9f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td>
                            <strong>{cita.slot}</strong>
                            <br />
                            <small className="opacity-75">({cita.turno})</small>
                          </td>
                          <td>{cita.paciente?.nombres || 'N/A'}</td>
                          <td>
                            {cita.medico?.nombres} {cita.medico?.apellidos}
                            <br />
                            <small className="opacity-75">{cita.medico?.sede?.nombre}</small>
                          </td>
                          <td>{cita.medico?.especialidad?.nombre || 'N/A'}</td>
                          <td>
                            <span
                              className={`badge px-3 py-2 border bg-${
                                cita.estado === 'programada'
                                  ? 'success'
                                  : cita.estado === 'completada'
                                  ? 'info'
                                  : 'warning'
                              }-subtle text-${
                                cita.estado === 'programada'
                                  ? 'success'
                                  : cita.estado === 'completada'
                                  ? 'info'
                                  : 'warning'
                              }`}
                            >
                              {cita.estado?.charAt(0).toUpperCase() + cita.estado?.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 opacity-50">
                  <i className="bi bi-calendar-x display-6 d-block mb-3"></i>
                  <p className="mb-0">No hay citas programadas para este día</p>
                </div>
              )}
            </div>
            <div className="modal-footer border-0" style={{ borderColor: theme.border }}>
              <button
                type="button"
                className={`btn btn-outline-${theme.accent}`}
                onClick={() => setModalShow(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE DE CITA */}
      <div
        className={`modal fade ${modalDetalleShow ? 'show' : ''}`}
        style={{ display: modalDetalleShow ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
            <div className="modal-header border-0" style={{ borderColor: theme.border }}>
              <h5 className="modal-title fw-bold">
                <i className="bi bi-file-earmark-text me-2"></i>
                Detalles de la Cita
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalDetalleShow(false)}
                style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}
              ></button>
            </div>
            <div className="modal-body">
              {citaSeleccionada && (
                <div>
                  {/* INFORMACIÓN GENERAL */}
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase small mb-3" style={{ color: theme.accentHex }}>
                      <i className="bi bi-calendar-check me-2"></i>Información General
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Fecha de Cita</label>
                        <p className="fw-bold mb-0">{new Date(citaSeleccionada.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Horario</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.slot} ({citaSeleccionada.turno})</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Estado</label>
                        <span className={`badge px-3 py-2 border bg-${
                          citaSeleccionada.estado === 'programada'
                            ? 'success'
                            : citaSeleccionada.estado === 'completada'
                            ? 'info'
                            : citaSeleccionada.estado === 'cancelada'
                            ? 'danger'
                            : 'warning'
                        }-subtle text-${
                          citaSeleccionada.estado === 'programada'
                            ? 'success'
                            : citaSeleccionada.estado === 'completada'
                            ? 'info'
                            : citaSeleccionada.estado === 'cancelada'
                            ? 'danger'
                            : 'warning'
                        }`}>
                          {citaSeleccionada.estado?.charAt(0).toUpperCase() + citaSeleccionada.estado?.slice(1)}
                        </span>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">ID Cita</label>
                        <p className="fw-bold mb-0 small text-monospace">{citaSeleccionada.id}</p>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: theme.border }} />

                  {/* INFORMACIÓN DEL PACIENTE */}
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase small mb-3" style={{ color: theme.accentHex }}>
                      <i className="bi bi-person me-2"></i>Paciente
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Nombre</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.paciente?.nombres || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Apellido</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.paciente?.apellidos || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">DNI</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.pacienteDni}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Email</label>
                        <p className="fw-bold mb-0 small">{citaSeleccionada.paciente?.email || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Teléfono</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.paciente?.telefono || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: theme.border }} />

                  {/* INFORMACIÓN DEL MÉDICO */}
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase small mb-3" style={{ color: theme.accentHex }}>
                      <i className="bi bi-stethoscope me-2"></i>Médico
                    </h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Nombre</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.medico?.nombres || 'N/A'}</p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="small opacity-75 d-block">Apellido</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.medico?.apellidos || 'N/A'}</p>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="small opacity-75 d-block">Especialidad</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.medico?.especialidad?.nombre || 'N/A'}</p>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="small opacity-75 d-block">Sede/Clínica</label>
                        <p className="fw-bold mb-0">
                          {citaSeleccionada.medico?.sede?.nombre || 'N/A'}
                          <br />
                          <small className="opacity-75">{citaSeleccionada.medico?.sede?.direccion || ''}</small>
                        </p>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="small opacity-75 d-block">Teléfono Sede</label>
                        <p className="fw-bold mb-0">{citaSeleccionada.medico?.sede?.telefono || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* MOTIVO DE LA CITA */}
                  {citaSeleccionada.motivo && (
                    <>
                      <hr style={{ borderColor: theme.border }} />
                      <div className="mb-4">
                        <h6 className="fw-bold text-uppercase small mb-3" style={{ color: theme.accentHex }}>
                          <i className="bi bi-chat-left-text me-2"></i>Motivo de Consulta
                        </h6>
                        <p className="mb-0">{citaSeleccionada.motivo}</p>
                      </div>
                    </>
                  )}

                  {/* FECHAS */}
                  <hr style={{ borderColor: theme.border }} />
                  <div className="row text-muted small">
                    <div className="col-md-6">
                      <label className="opacity-75 d-block">Registrada el:</label>
                      <p className="mb-0">{new Date(citaSeleccionada.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {citaSeleccionada.updatedAt && (
                      <div className="col-md-6">
                        <label className="opacity-75 d-block">Última actualización:</label>
                        <p className="mb-0">{new Date(citaSeleccionada.updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-0" style={{ borderColor: theme.border }}>
              <button
                type="button"
                className={`btn btn-outline-${theme.accent}`}
                onClick={() => setModalDetalleShow(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN DE ESTADÍSTICAS CON GRÁFICOS */}
      {role === 'admin' && (
        <div className="row mt-5 mb-4">
          <h4 className="fw-bold mb-4">
            <i className="bi bi-graph-up me-2"></i>Estadísticas
          </h4>

          {/* Gráfico de Citas por Estado */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-pie-chart me-2"></i>Citas por Estado
                </h5>
              </div>
              <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                {allCitas.length > 0 ? (
                  <div style={{ width: '100%', maxWidth: '300px' }}>
                    <Doughnut
                      data={{
                        labels: ['Programada', 'Completada', 'Cancelada'],
                        datasets: [
                          {
                            label: 'Cantidad de Citas',
                            data: [citasPorEstado.programada, citasPorEstado.completada, citasPorEstado.cancelada],
                            backgroundColor: [
                              `${theme.accentHex}`,
                              '#28a74520',
                              '#dc354520'
                            ],
                            borderColor: [
                              `${theme.accentHex}`,
                              '#28a745',
                              '#dc3545'
                            ],
                            borderWidth: 2,
                            hoverOffset: 10
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: theme.text,
                              font: { size: 12, weight: '500' },
                              padding: 15,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            backgroundColor: `${theme.accentHex}99`,
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: theme.accentHex,
                            borderWidth: 1,
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-center opacity-50">Sin datos disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de Citas por Mes */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
              <div className="card-header bg-transparent border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bar-chart me-2"></i>Citas por Mes
                </h5>
              </div>
              <div className="card-body" style={{ minHeight: '300px' }}>
                {allCitas.length > 0 ? (
                  <Bar
                    data={{
                      labels: Object.keys(citasPorMes).sort().map(mes => {
                        const [año, mesNum] = mes.split('-');
                        const fecha = new Date(año, parseInt(mesNum) - 1);
                        return fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
                      }),
                      datasets: [
                        {
                          label: 'Cantidad de Citas',
                          data: Object.keys(citasPorMes).sort().map(mes => citasPorMes[mes]),
                          backgroundColor: `${theme.accentHex}`,
                          borderColor: `${theme.accentHex}`,
                          borderWidth: 2,
                          borderRadius: 8,
                          hoverBackgroundColor: `${theme.accentHex}dd`,
                          hoverBorderWidth: 3
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      indexAxis: 'x',
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: `${theme.border}`,
                            drawBorder: true
                          },
                          ticks: {
                            color: theme.muted,
                            stepSize: 1
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                            drawBorder: false
                          },
                          ticks: {
                            color: theme.muted
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: theme.text,
                            font: { size: 12, weight: '500' },
                            padding: 15
                          }
                        },
                        tooltip: {
                          backgroundColor: `${theme.accentHex}99`,
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: theme.accentHex,
                          borderWidth: 1,
                          padding: 12,
                          titleFont: { size: 13, weight: 'bold' },
                          bodyFont: { size: 12 },
                          callbacks: {
                            label: function(context) {
                              return `Citas: ${context.parsed.y}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-center opacity-50">Sin datos disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de Estadísticas */}
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ backgroundColor: theme.cardBg, color: theme.text }}>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3 mb-3">
                    <h6 className="text-muted small fw-bold mb-2">Total Pacientes</h6>
                    <h3 className="fw-bold" style={{ color: theme.accentHex }}>
                      {counts.pacientes}
                    </h3>
                  </div>
                  <div className="col-md-3 mb-3">
                    <h6 className="text-muted small fw-bold mb-2">Total Citas</h6>
                    <h3 className="fw-bold" style={{ color: theme.accentHex }}>
                      {allCitas.length}
                    </h3>
                  </div>
                  <div className="col-md-3 mb-3">
                    <h6 className="text-muted small fw-bold mb-2">Citas Programadas</h6>
                    <h3 className="fw-bold" style={{ color: theme.accentHex }}>
                      {citasPorEstado.programada}
                    </h3>
                  </div>
                  <div className="col-md-3 mb-3">
                    <h6 className="text-muted small fw-bold mb-2">Tasa de Completación</h6>
                    <h3 className="fw-bold" style={{ color: theme.accentHex }}>
                      {allCitas.length > 0 ? Math.round((citasPorEstado.completada / allCitas.length) * 100) : 0}%
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;