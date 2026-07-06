import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import ConfirmModal from "../components/ConfirmModal";
import axiosInstance from "../api/axiosInstance";

function Usuarios() {
  const { isDarkMode, theme } = useTheme();
  const role = localStorage.getItem("userRole") || "usuario";
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState(null);
  const [editForm, setEditForm] = useState({
    names: "",
    last_names: "",
    email: "",
    phone: "",
    sexo: "",
  });
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const fetchPacientes = async () => {
    try {
      const result = await axiosInstance.get("/users");
      
      // ESTO ES PARA TI: Mira en la consola (F12) qué nombres traen las columnas
      console.log("Datos de pacientes:", result.data);
      const lista = Array.isArray(result.data) ? result.data : (result.data.data || []);
      const soloPacientes = lista.filter(u => u.role === "usuario");
      setPacientes(soloPacientes);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchPacientes(); }, []);

  const openEditModal = (paciente) => {
    setSelectedPaciente(paciente);
    setEditForm({
      names: paciente.user_names || paciente.names || "",
      last_names: paciente.user_lastns || paciente.last_names || "",
      email: paciente.user_email || paciente.email || "",
      phone: paciente.user_phone || paciente.phone || "",
      sexo: paciente.sexo || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPaciente(null);
  };

  const handleUpdatePaciente = async (e) => {
    e.preventDefault();

    if (!selectedPaciente?.dni) return;

    try {
      await axiosInstance.put(`/users/${selectedPaciente.dni}`, {
        names: editForm.names,
        last_names: editForm.last_names,
        email: editForm.email,
        phone: editForm.phone,
        sexo: editForm.sexo || null,
      });

      setModalTitle("¡Éxito!");
      setModalMessage("Información del paciente actualizada correctamente");
      setModalType("success");
      setModalShow(true);
      closeEditModal();
      fetchPacientes();
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "No se pudo actualizar al paciente");
      setModalType("error");
      setModalShow(true);
    }
  };

  const openDeleteModal = (paciente) => {
    setPacienteToDelete(paciente);
    setDeleteModalShow(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalShow(false);
    setPacienteToDelete(null);
  };

  const confirmarEliminarPaciente = async () => {
    if (!pacienteToDelete?.dni) return;

    try {
      await axiosInstance.delete(`/users/${pacienteToDelete.dni}`);
      closeDeleteModal();
      setModalTitle("¡Éxito!");
      setModalMessage("Paciente desactivado correctamente. Sus datos se conservan para auditoría.");
      setModalType("success");
      setModalShow(true);
      fetchPacientes();
    } catch (error) {
      closeDeleteModal();
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "No se pudo desactivar el paciente");
      setModalType("error");
      setModalShow(true);
    }
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

      <h2 className="fw-bold border-bottom border-3 d-inline-block pb-2 mb-4" style={{ borderColor: theme.accentHex }}>
        Directorio de Pacientes
      </h2>

      <div className="card shadow-sm border-0" style={{ backgroundColor: theme.cardBg, borderRadius: "20px" }}>
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5"><div className={`spinner-border text-${theme.accent}`}></div></div>
          ) : (
            <div className="table-responsive">
              <table className={`table ${isDarkMode ? 'table-dark' : 'table-hover'} align-middle`}>
                <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                  <tr>
                    <th className="ps-3">DNI</th>
                    <th>Nombre del Paciente</th>
                    <th>Correo de Contacto</th>
                    <th>Teléfono</th>
                    <th>Sexo</th>
                    {role === "admin" && <th className="text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {pacientes.length > 0 ? pacientes.map((p) => {
                    // Lógica para capturar nombres aunque el backend cambie las llaves
                    const nombre = p.user_names || p.names || "Sin Nombre";
                    const apellido = p.user_lastns || p.last_names || "";
                    const email = p.user_email || p.email || "No registrado";
                    const telefono = p.user_phone || p.phone || "---";

                    return (
                      <tr key={p.dni} style={{ color: theme.text }}>
                        <td className="small opacity-75">{p.dni}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {/* Avatar con iniciales en color contrastado */}
                            <div className={`rounded-circle d-flex align-items-center justify-content-center me-2`} 
                                 style={{ width: "35px", height: "35px", backgroundColor: theme.accentHex, color: "#fff", fontWeight: "bold", fontSize: "0.8rem" }}>
                              {nombre.charAt(0)}{apellido.charAt(0)}
                            </div>
                            <span className="fw-bold">{nombre} {apellido}</span>
                          </div>
                        </td>
                        <td className="small">{email}</td>
                        <td className="small">{telefono}</td>
                        <td className="small">{p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Femenino' : p.sexo === 'O' ? 'Otro' : '---'}</td>
                        {role === "admin" && (
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-decoration-none p-0 me-3"
                              style={{ color: theme.muted }}
                              onClick={() => openEditModal(p)}
                              aria-label={`Editar paciente ${nombre} ${apellido}`}
                            >
                              <i className="bi bi-pencil-square fs-5"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                              onClick={() => openDeleteModal(p)}
                              aria-label={`Eliminar paciente ${nombre} ${apellido}`}
                            >
                              <i className="bi bi-trash3 fs-5"></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={role === "admin" ? "6" : "5"} className="text-center py-4 opacity-50">No hay pacientes registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEditModal && role === "admin" && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ backgroundColor: theme.cardBg, color: theme.text, borderRadius: "25px" }}>
              <div className="modal-header border-0 pb-0 p-4">
                <h5 className="fw-bold">Editar Paciente</h5>
                <button onClick={closeEditModal} className="btn-close" style={{ filter: isDarkMode ? "invert(1)" : "none" }}></button>
              </div>
              <form onSubmit={handleUpdatePaciente}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Nombres</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={editForm.names}
                      onChange={(e) => setEditForm({ ...editForm, names: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Apellidos</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={editForm.last_names}
                      onChange={(e) => setEditForm({ ...editForm, last_names: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-1">
                    <label className="form-label small fw-bold">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="9XXXXXXXX"
                    />
                  </div>
                  <div className="mb-1 mt-3">
                    <label className="form-label small fw-bold">Sexo</label>
                    <select
                      className="form-select"
                      style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}
                      value={editForm.sexo}
                      onChange={(e) => setEditForm({ ...editForm, sexo: e.target.value })}
                    >
                      <option value="">Sin especificar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="submit" className={`btn btn-${theme.accent} w-100 py-2 fw-bold text-white shadow-sm`} style={{ borderRadius: "12px" }}>
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
        title="Eliminar paciente"
        message={`¿Seguro que deseas eliminar al paciente ${(pacienteToDelete?.names || pacienteToDelete?.user_names || "")} ${(pacienteToDelete?.last_names || pacienteToDelete?.user_lastns || "")}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminarPaciente}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

export default Usuarios;