import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import ConfirmModal from "../components/ConfirmModal";
import axiosInstance from "../api/axiosInstance";

function Especialidades() {
  const { isDarkMode, theme } = useTheme();
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);

  // ESTADOS PARA EL MODAL Y NUEVA ESPECIALIDAD
  const [showModal, setShowModal] = useState(false);
  const [editingEspecialidad, setEditingEspecialidad] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [especialidadToDelete, setEspecialidadToDelete] = useState(null);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
    nombre: "",
    descripcion: "",
    activo: true
  });

  const resetForm = () => {
    setNuevaEspecialidad({ nombre: "", descripcion: "", activo: true });
    setEditingEspecialidad(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (especialidad) => {
    setEditingEspecialidad(especialidad);
    setNuevaEspecialidad({
      nombre: especialidad.nombre || "",
      descripcion: especialidad.descripcion || "",
      activo: Boolean(especialidad.activo),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // 1. CARGAR ESPECIALIDADES (CON TOKEN)
  const fetchEspecialidades = async () => {
    try {
      const result = await axiosInstance.get("/especialidades");
      
      const listaFinal = Array.isArray(result.data) ? result.data : (result.data.data || []);
      setEspecialidades(listaFinal);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchEspecialidades(); }, []);

  // 2. GUARDAR ESPECIALIDAD (CON TOKEN)
  const handleGuardar = async (e) => {
    e.preventDefault();

    try {
      const response = editingEspecialidad
        ? await axiosInstance.put(`/especialidades/${editingEspecialidad.id}`, nuevaEspecialidad)
        : await axiosInstance.post("/especialidades", nuevaEspecialidad);

      if (response.data) {
        setModalTitle("¡Éxito!");
        setModalMessage(editingEspecialidad ? "Especialidad actualizada con éxito" : "Especialidad creada con éxito");
        setModalType("success");
        setModalShow(true);
        closeModal();
        setTimeout(() => fetchEspecialidades(), 1500);
      }
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Error de conexión con el backend.");
      setModalType("error");
      setModalShow(true);
    }
  };

  const openDeleteModal = (especialidad) => {
    setEspecialidadToDelete(especialidad);
    setDeleteModalShow(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalShow(false);
    setEspecialidadToDelete(null);
  };

  const confirmarEliminar = async () => {
    if (!especialidadToDelete) return;

    try {
      await axiosInstance.delete(`/especialidades/${especialidadToDelete.id}`);
      closeDeleteModal();
      setModalTitle("¡Éxito!");
      setModalMessage("Especialidad eliminada con éxito");
      setModalType("success");
      setModalShow(true);
      setTimeout(() => fetchEspecialidades(), 1000);
    } catch (error) {
      closeDeleteModal();
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "No se pudo eliminar la especialidad.");
      setModalType("error");
      setModalShow(true);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", transition: "0.3s" }}>
      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />

      <ConfirmModal
        show={deleteModalShow}
        title="Eliminar especialidad"
        message={`¿Seguro que deseas eliminar la especialidad ${especialidadToDelete?.nombre || "seleccionada"}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={closeDeleteModal}
      />
      
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2" style={{ borderColor: theme.accentHex }}>
            Especialidades Médicas
          </h2>
          <p className="small mb-0 opacity-75">Configuración del catálogo de ramas médicas de la clínica.</p>
        </div>
        
        <button onClick={openCreateModal} className={`btn btn-${theme.accent} shadow-sm px-4 fw-bold text-white`}>
          <i className="bi bi-plus-circle-fill me-2"></i> Nueva Especialidad
        </button>
      </div>

      {/* TABLA */}
      <div className="card shadow-sm border-0" style={{ backgroundColor: theme.cardBg, borderRadius: "20px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle mb-0`}>
            <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
              <tr>
                <th className="ps-4">Nombre Especialidad</th>
                <th>Descripción</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.length > 0 ? (
                especialidades.map((e) => (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className={`bg-${theme.accent}-subtle p-2 rounded me-3`} style={{ color: theme.accentHex }}>
                          <i className="bi bi-patch-check-fill"></i>
                        </div>
                        <span className="fw-bold">{e.nombre}</span>
                      </div>
                    </td>
                    <td className="small" style={{ maxWidth: "300px" }}>{e.descripcion || 'Sin descripción.'}</td>
                    <td className="text-center">
                      <span className={`badge px-3 py-2 border ${e.activo ? 'bg-success-subtle text-success border-success-subtle' : 'bg-secondary-subtle text-secondary'}`}>
                        {e.activo ? 'Habilitada' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(e)}
                        className="btn btn-sm btn-link text-decoration-none p-0 me-2"
                        style={{ color: theme.muted }}
                        aria-label={`Editar especialidad ${e.nombre}`}
                      >
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(e)}
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                        aria-label={`Eliminar especialidad ${e.nombre}`}
                      >
                        <i className="bi bi-trash3 fs-5"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-5 opacity-50">{loading ? "Cargando catálogo..." : "No hay especialidades registradas."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE CREACIÓN --- */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: theme.cardBg, color: theme.text, borderRadius: "25px" }}>
              <div className="modal-header border-0 pb-0 p-4">
                <h5 className="fw-bold">{editingEspecialidad ? "Editar Especialidad" : "Registrar Especialidad"}</h5>
                <button onClick={closeModal} className="btn-close" style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}></button>
              </div>
              <form onSubmit={handleGuardar}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombre de la Especialidad</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={nuevaEspecialidad.nombre}
                      onChange={(e) => setNuevaEspecialidad({...nuevaEspecialidad, nombre: e.target.value})}
                      placeholder="Ej: Cardiología"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Descripción Corta</label>
                    <textarea
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      value={nuevaEspecialidad.descripcion}
                      onChange={(e) => setNuevaEspecialidad({...nuevaEspecialidad, descripcion: e.target.value})}
                      placeholder="Breve detalle de la rama médica..."
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="especialidadActiva"
                      checked={nuevaEspecialidad.activo}
                      onChange={(e) => setNuevaEspecialidad({...nuevaEspecialidad, activo: e.target.checked})}
                    />
                    <label className="form-check-label small fw-bold" htmlFor="especialidadActiva">
                      Especialidad activa
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="submit" className={`btn btn-${theme.accent} w-100 py-2 fw-bold text-white shadow-sm`} style={{ borderRadius: "12px" }}>
                    {editingEspecialidad ? "Guardar Cambios" : "Crear Especialidad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Especialidades;