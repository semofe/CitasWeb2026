import React, { useState } from "react";

function HorarioSelector({ onSelectionChange, theme }) {
  const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  
  const TURNOS_DATA = {
    mañana: {
      label: "🌅 MAÑANA",
      inicio: "07:30",
      fin: "12:30",
      slots: [
        "07:30-08:00", "08:00-08:30", "08:30-09:00",
        "09:30-10:00", "10:00-10:30", "10:30-11:00",
        "11:00-11:30", "11:30-12:00", "12:00-12:30"
      ]
    },
    tarde: {
      label: "🌆 TARDE",
      inicio: "12:30",
      fin: "17:30",
      slots: [
        "12:30-13:00", "13:00-13:30", "13:30-14:00",
        "14:00-14:30", "14:30-15:00", "15:00-15:30",
        "15:30-16:00", "16:30-17:00", "17:00-17:30"
      ]
    }
  };

  // Estado para guardar qué turnos están activados
  const [horariosSeleccionados, setHorariosSeleccionados] = useState({
    mañana: false,
    tarde: false
  });

  // Estado para guardar qué días están activados
  const [diasSeleccionados, setDiasSeleccionados] = useState({
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false
  });

  // Actualizar cuando cambia la selección
  const handleTurnoToggle = (turno) => {
    const nuevoEstado = {
      ...horariosSeleccionados,
      [turno]: !horariosSeleccionados[turno]
    };
    setHorariosSeleccionados(nuevoEstado);
    emitirCambios(nuevoEstado, diasSeleccionados);
  };

  const handleDiaToggle = (dia) => {
    const nuevoEstado = {
      ...diasSeleccionados,
      [dia]: !diasSeleccionados[dia]
    };
    setDiasSeleccionados(nuevoEstado);
    emitirCambios(horariosSeleccionados, nuevoEstado);
  };

  const emitirCambios = (turnos, dias) => {
    const diasArray = Object.keys(dias).filter(d => dias[d]);
    const turnosArray = Object.keys(turnos).filter(t => turnos[t]);
    
    // Generar bloques de horarios
    const bloques = turnosArray.map(turno => ({
      dias: diasArray.join(", "),
      diasArray,
      rango: `${TURNOS_DATA[turno].inicio} - ${TURNOS_DATA[turno].fin}`,
      inicioRaw: TURNOS_DATA[turno].inicio,
      finRaw: TURNOS_DATA[turno].fin,
      turno
    }));

    onSelectionChange(bloques);
  };

  const toggleTodosDias = () => {
    const todosActivados = Object.values(diasSeleccionados).every(v => v);
    const nuevoEstado = Object.keys(diasSeleccionados).reduce((acc, dia) => {
      acc[dia] = !todosActivados;
      return acc;
    }, {});
    setDiasSeleccionados(nuevoEstado);
    emitirCambios(horariosSeleccionados, nuevoEstado);
  };

  const toggleTodosTurnos = () => {
    const todosActivados = Object.values(horariosSeleccionados).every(v => v);
    const nuevoEstado = Object.keys(horariosSeleccionados).reduce((acc, turno) => {
      acc[turno] = !todosActivados;
      return acc;
    }, {});
    setHorariosSeleccionados(nuevoEstado);
    emitirCambios(nuevoEstado, diasSeleccionados);
  };

  return (
    <div className="horario-selector p-4 rounded-3 border" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
      {/* SECCIÓN TURNOS */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0" style={{ color: theme.text }}>Selecciona Turnos</h6>
          <button 
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleTodosTurnos}
          >
            {Object.values(horariosSeleccionados).every(v => v) ? "Desseleccionar" : "Seleccionar"} todos
          </button>
        </div>

        <div className="row g-2">
          {Object.keys(TURNOS_DATA).map(turno => (
            <div key={turno} className="col-md-6">
              <div
                className="p-3 rounded-2 border-2 cursor-pointer transition"
                style={{
                  backgroundColor: horariosSeleccionados[turno] 
                    ? theme.accentHex + "20" 
                    : "transparent",
                  borderColor: horariosSeleccionados[turno]
                    ? theme.accentHex
                    : theme.border,
                  cursor: "pointer"
                }}
                onClick={() => handleTurnoToggle(turno)}
              >
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={horariosSeleccionados[turno]}
                    onChange={() => {}}
                    id={`turno-${turno}`}
                  />
                  <label className="form-check-label fw-bold ms-2" htmlFor={`turno-${turno}`} style={{ color: theme.text }}>
                    {TURNOS_DATA[turno].label}
                  </label>
                </div>
                <p className="small mb-0" style={{ color: theme.muted }}>
                  {TURNOS_DATA[turno].inicio} - {TURNOS_DATA[turno].fin}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DÍAS */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0" style={{ color: theme.text }}>Selecciona Días</h6>
          <button 
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleTodosDias}
          >
            {Object.values(diasSeleccionados).every(v => v) ? "Desseleccionar" : "Seleccionar"} todos
          </button>
        </div>

        <div className="row g-2">
          {DIAS.map(dia => (
            <div key={dia} className="col-6 col-md-4 col-lg-2">
              <button
                type="button"
                className="w-100 p-2 rounded-2 border text-center fw-bold small"
                style={{
                  backgroundColor: diasSeleccionados[dia]
                    ? theme.accentHex + "20"
                    : "transparent",
                  borderColor: diasSeleccionados[dia]
                    ? theme.accentHex
                    : theme.border,
                  borderWidth: "1px",
                  color: diasSeleccionados[dia] ? theme.accentHex : theme.muted,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s ease",
                  padding: "8px 12px"
                }}
                onClick={() => handleDiaToggle(dia)}
              >
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RESUMEN */}
      <div className="mt-4 p-3 rounded-2" style={{ backgroundColor: theme.bg, borderLeft: `4px solid ${theme.accentHex}` }}>
        <p className="small mb-2" style={{ color: theme.text }}>
          <strong>Turno(s):</strong> {Object.keys(horariosSeleccionados).filter(t => horariosSeleccionados[t]).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ") || "Ninguno"}
        </p>
        <p className="small mb-0" style={{ color: theme.text }}>
          <strong>Día(s):</strong> {Object.keys(diasSeleccionados).filter(d => diasSeleccionados[d]).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ") || "Ninguno"}
        </p>
      </div>
    </div>
  );
}

export default HorarioSelector;
