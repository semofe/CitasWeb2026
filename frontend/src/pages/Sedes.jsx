import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import ConfirmModal from "../components/ConfirmModal";
import axiosInstance from "../api/axiosInstance";

function Sedes() {
  const { isDarkMode, theme } = useTheme();
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ESTADOS PARA EL FORMULARIO DE NUEVA SEDE
  const [showModal, setShowModal] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [sedeToDelete, setSedeToDelete] = useState(null);
  const [nuevaSede, setNuevaSede] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    activo: true
  });

  const resetForm = () => {
    setNuevaSede({ nombre: "", direccion: "", telefono: "", activo: true });
    setEditingSede(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (sede) => {
    setEditingSede(sede);
    setNuevaSede({
      nombre: sede.nombre || "",
      direccion: sede.direccion || "",
      telefono: sede.telefono || "",
      activo: Boolean(sede.activo),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // 1. FUNCIÓN PARA CARGAR LISTADO (INTELIGENTE)
  const fetchSedes = async () => {
    try {
      const result = await axiosInstance.get("/sedes");
      
      // Extraemos la lista del paquete 'data'
      const listaFinal = Array.isArray(result.data) ? result.data : (result.data.data || []);
      
      setSedes(listaFinal);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchSedes(); }, []);

  // 2. FUNCIÓN PARA GUARDAR (CON TOKEN DE SEGURIDAD)
  const handleGuardarSede = async (e) => {
    e.preventDefault();

    try {
      const response = editingSede
        ? await axiosInstance.put(`/sedes/${editingSede.id}`, nuevaSede)
        : await axiosInstance.post("/sedes", nuevaSede);

      if (response.data) {
        setModalTitle("¡Éxito!");
        setModalMessage(editingSede ? "Sede actualizada correctamente" : "Sede creada correctamente");
        setModalType("success");
        setModalShow(true);
        closeModal();
        fetchSedes();
      }
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Error de conexión con el servidor.");
      setModalType("error");
      setModalShow(true);
    }
  };

  const openDeleteModal = (sede) => {
    setSedeToDelete(sede);
    setDeleteModalShow(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalShow(false);
    setSedeToDelete(null);
  };

  const confirmarEliminarSede = async () => {
    if (!sedeToDelete) return;

    try {
      await axiosInstance.delete(`/sedes/${sedeToDelete.id}`);
      closeDeleteModal();
      setModalTitle("¡Éxito!");
      setModalMessage("Sede eliminada correctamente");
      setModalType("success");
      setModalShow(true);
      fetchSedes();
    } catch (error) {
      closeDeleteModal();
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "No se pudo eliminar la sede.");
      setModalType("error");
      setModalShow(true);
    }
  };

  // Filtrado por búsqueda
  const sedesFiltradas = Array.isArray(sedes) ? sedes.filter((s) =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh", transition: "0.3s" }}>
      
      {/* CABECERA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2" style={{ borderColor: theme.accentHex }}>
            Sedes Institucionales
          </h2>
          <p className="small mb-0 opacity-75">Administración de centros médicos y sucursales.</p>
        </div>
        
        <button onClick={openCreateModal} className={`btn btn-${theme.accent} shadow-sm px-4 fw-bold text-white`}>
          <i className="bi bi-building-add me-2"></i> Nueva Sede
        </button>
      </div>

      {/* FILTRO */}
      <div className="mb-4">
        <div className="input-group shadow-sm" style={{ maxWidth: "350px" }}>
          <span className="input-group-text bg-transparent" style={{ borderColor: theme.border }}>
            <i className="bi bi-search" style={{ color: theme.muted }}></i>
          </span>
          <input 
            type="text" 
            className="form-control" 
            style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }} 
            placeholder="Buscar sede por nombre..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="card shadow-sm border-0" style={{ backgroundColor: theme.cardBg, borderRadius: "20px", overflow: "hidden" }}>
        <div className="table-responsive">
          <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle mb-0`}>
            <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
              <tr>
                <th className="ps-4">Sede</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sedesFiltradas.length > 0 ? (
                sedesFiltradas.map((s) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td className="ps-4 fw-bold">
                      <i className={`bi bi-geo-alt-fill me-2 text-${theme.accent}`}></i>
                      {s.nombre}
                    </td>
                    <td className="small">{s.direccion}</td>
                    <td className="small">{s.telefono}</td>
                    <td className="text-center">
                      <span className={`badge bg-${s.activo ? 'success' : 'secondary'}-subtle text-${s.activo ? 'success' : 'secondary'} border px-3`}>
                        {s.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="btn btn-sm btn-link text-decoration-none p-0 me-2"
                        style={{ color: theme.muted }}
                        aria-label={`Editar sede ${s.nombre}`}
                      >
                        <i className="bi bi-pencil-square fs-5"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(s)}
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                        aria-label={`Eliminar sede ${s.nombre}`}
                      >
                        <i className="bi bi-trash3 fs-5"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 opacity-50">{loading ? "Cargando sedes..." : "No se encontraron sedes."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />

      <ConfirmModal
        show={deleteModalShow}
        title="Eliminar sede"
        message={`¿Seguro que deseas eliminar la sede ${sedeToDelete?.nombre || "seleccionada"}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminarSede}
        onCancel={closeDeleteModal}
      />

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: theme.cardBg, color: theme.text, borderRadius: "25px" }}>
              <div className="modal-header border-0 pb-0 p-4">
                <h5 className="fw-bold">{editingSede ? "Editar Sede" : "Registrar Nueva Sede"}</h5>
                <button onClick={closeModal} className="btn-close" style={{ filter: isDarkMode ? 'invert(1)' : 'none' }}></button>
              </div>
              <form onSubmit={handleGuardarSede}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={nuevaSede.nombre}
                      onChange={(e) => setNuevaSede({...nuevaSede, nombre: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Dirección</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={nuevaSede.direccion}
                      onChange={(e) => setNuevaSede({...nuevaSede, direccion: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={nuevaSede.telefono}
                      onChange={(e) => setNuevaSede({...nuevaSede, telefono: e.target.value})}
                    />
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sedeActiva"
                      checked={nuevaSede.activo}
                      onChange={(e) => setNuevaSede({...nuevaSede, activo: e.target.checked})}
                    />
                    <label className="form-check-label small fw-bold" htmlFor="sedeActiva">
                      Sede activa
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="submit" className={`btn btn-${theme.accent} w-100 py-2 fw-bold text-white shadow-sm`} style={{ borderRadius: "12px" }}>
                    {editingSede ? "Guardar Cambios" : "Guardar Sede"}
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

export default Sedes;