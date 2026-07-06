import React, { useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function MiPerfil() {
  const { isDarkMode, theme } = useTheme();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const userDni = localStorage.getItem("userDni");

  const fetchPerfil = async () => {
    try {
      const response = await axiosInstance.get(`/users/${userDni}`);
      const usuarioActual = response.data.data || response.data;
      
      setUsuario(usuarioActual);
      setFormData(usuarioActual);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      const { dni, ...datosParaActualizar } = formData;
      await axiosInstance.put(`/users/${userDni}`, datosParaActualizar);
      setEditando(false);
      setModalTitle("¡Éxito!");
      setModalMessage("Datos actualizados exitosamente");
      setModalType("success");
      setModalShow(true);
      fetchPerfil();
    } catch (error) {
      console.error("Error al actualizar:", error);
      setModalTitle("Error");
      setModalMessage("Error al actualizar los datos");
      setModalType("error");
      setModalShow(true);
    }
  };

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: theme.bg, color: theme.text, minHeight: "100vh" }}>
      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />
      
      {/* ENCABEZADO */}
      <div className="mb-5">
        <h1 className="fw-bold mb-2" style={{ color: theme.text }}>Mi Perfil</h1>
        <p style={{ color: theme.muted }}>Visualiza y edita tus datos personales</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className={`spinner-border text-${theme.accent}`}></div>
          <p className="mt-3">Cargando datos...</p>
        </div>
      ) : usuario ? (
        <div className="row">
          {/* TARJETA PRINCIPAL CON AVATAR */}
          <div className="col-lg-4 mb-4">
            <div className="card shadow-lg border-0 h-100" style={{ backgroundColor: theme.cardBg, borderRadius: "25px", overflow: "hidden" }}>
              {/* CABECERA CON DEGRADADO */}
              <div style={{
                background: `linear-gradient(135deg, ${theme.accentHex} 0%, ${theme.accentHex}dd 100%)`,
                height: "120px"
              }}></div>

              <div className="card-body text-center p-4" style={{ marginTop: "-50px", position: "relative" }}>
                {/* AVATAR GRANDE */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-lg"
                  style={{
                    width: "120px",
                    height: "120px",
                    backgroundColor: theme.accentHex,
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "3rem",
                    border: `4px solid ${theme.cardBg}`
                  }}
                >
                  {(usuario.names || "U").charAt(0)}{(usuario.last_names || "").charAt(0)}
                </div>

                {/* NOMBRE COMPLETO */}
                <h2 className="fw-bold mb-1" style={{ color: theme.text }}>
                  {usuario.names} {usuario.last_names}
                </h2>

                {/* ROL CON BADGE - SOLO PARA ADMINS */}
                {usuario.role === 'admin' && (
                  <div className="mb-4">
                    <span className="badge px-4 py-2" style={{ backgroundColor: theme.accentHex, color: "#fff", fontSize: "0.9rem" }}>
                      <i className="bi bi-shield-check me-1"></i>
                      Administrador
                    </span>
                  </div>
                )}

                {/* DIVIDER */}
                <hr style={{ opacity: 0.2 }} />

                {/* DATOS CLAVE */}
                <div className="text-start">
                  <div className="mb-3">
                    <p className="small mb-1" style={{ color: theme.muted }}>
                      <i className="bi bi-credit-card me-2" style={{ color: theme.accentHex }}></i>
                      Número de DNI
                    </p>
                    <p className="fw-bold fs-5" style={{ color: theme.text }}>{usuario.dni}</p>
                  </div>

                  <div className="mb-3">
                    <p className="small mb-1" style={{ color: theme.muted }}>
                      <i className="bi bi-telephone me-2" style={{ color: theme.accentHex }}></i>
                      Teléfono
                    </p>
                    <p className="fw-bold fs-5" style={{ color: theme.text }}>{usuario.phone || "No registrado"}</p>
                  </div>

                  <div>
                    <p className="small mb-1" style={{ color: theme.muted }}>
                      <i className="bi bi-envelope me-2" style={{ color: theme.accentHex }}></i>
                      Email
                    </p>
                    <p className="fw-bold fs-5" style={{ color: theme.text }}>{usuario.email || "No registrado"}</p>
                  </div>
                </div>

                {/* BOTÓN EDITAR */}
                <button
                  className={`btn btn-${editando ? "danger" : theme.accent} w-100 mt-4 fw-bold py-2`}
                  onClick={() => (editando ? setEditando(false) : setEditando(true))}
                  style={{ borderRadius: "12px" }}
                >
                  <i className={`bi bi-${editando ? "x-circle" : "pencil-square"} me-2`}></i>
                  {editando ? "Cancelar Edición" : "Editar Perfil"}
                </button>
              </div>
            </div>
          </div>

          {/* FORMULARIO O INFORMACIÓN DETALLADA */}
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 h-100" style={{ backgroundColor: theme.cardBg, borderRadius: "25px" }}>
              <div className="card-header bg-transparent border-0 p-4">
                <h3 className="mb-0 fw-bold" style={{ color: theme.text }}>
                  <i className={`bi bi-${editando ? 'pencil-fill' : 'info-circle'} me-2`} style={{ color: theme.accentHex }}></i>
                  {editando ? 'Editar Información Personal' : 'Información Completa'}
                </h3>
              </div>

              <div className="card-body p-4">
                {editando ? (
                  // MODO EDICIÓN
                  <form>
                    {/* NOMBRES Y APELLIDOS */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold small" style={{ color: theme.text }}>
                            <i className="bi bi-person me-2" style={{ color: theme.accentHex }}></i>
                            Nombres
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="names"
                            value={formData.names || ""}
                            onChange={handleChange}
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text,
                              borderColor: theme.border,
                              borderRadius: "12px",
                              borderWidth: "2px"
                            }}
                            placeholder="Ingresa tus nombres"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold small" style={{ color: theme.text }}>
                            <i className="bi bi-person me-2" style={{ color: theme.accentHex }}></i>
                            Apellidos
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="last_names"
                            value={formData.last_names || ""}
                            onChange={handleChange}
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text,
                              borderColor: theme.border,
                              borderRadius: "12px",
                              borderWidth: "2px"
                            }}
                            placeholder="Ingresa tus apellidos"
                          />
                        </div>
                      </div>
                    </div>

                    {/* EMAIL Y TELÉFONO */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold small" style={{ color: theme.text }}>
                            <i className="bi bi-envelope me-2" style={{ color: theme.accentHex }}></i>
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control form-control-lg"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text,
                              borderColor: theme.border,
                              borderRadius: "12px",
                              borderWidth: "2px"
                            }}
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-bold small" style={{ color: theme.text }}>
                            <i className="bi bi-telephone me-2" style={{ color: theme.accentHex }}></i>
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            className="form-control form-control-lg"
                            name="phone"
                            value={formData.phone || ""}
                            onChange={handleChange}
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text,
                              borderColor: theme.border,
                              borderRadius: "12px",
                              borderWidth: "2px"
                            }}
                            placeholder="987654321"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEXO */}
                    <div className="mb-4">
                      <label className="form-label fw-bold small" style={{ color: theme.text }}>
                        <i className="bi bi-person-fill me-2" style={{ color: theme.accentHex }}></i>
                        Sexo
                      </label>
                      <select
                        className="form-select form-select-lg"
                        name="sexo"
                        value={formData.sexo || ""}
                        onChange={handleChange}
                        style={{
                          backgroundColor: theme.bg,
                          color: theme.text,
                          borderColor: theme.border,
                          borderRadius: "12px",
                          borderWidth: "2px"
                        }}
                      >
                        <option value="">Sin especificar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="O">Otro</option>
                      </select>
                    </div>

                    {/* DNI (NO EDITABLE) */}
                    <div className="mb-4">
                      <label className="form-label fw-bold small" style={{ color: theme.text }}>
                        <i className="bi bi-credit-card me-2" style={{ color: theme.accentHex }}></i>
                        DNI (No editable)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={usuario.dni}
                        disabled
                        style={{
                          backgroundColor: theme.bg,
                          color: theme.text,
                          borderColor: theme.border,
                          borderRadius: "12px",
                          opacity: 0.6
                        }}
                      />
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="d-flex gap-3 mt-5">
                      <button
                        type="button"
                        className={`btn btn-${theme.accent} btn-lg fw-bold flex-grow-1`}
                        onClick={handleGuardar}
                        style={{ borderRadius: "12px" }}
                      >
                        <i className="bi bi-check-circle me-2"></i> Guardar Cambios
                      </button>
                    </div>
                  </form>
                ) : (
                  // MODO VISUALIZACIÓN
                  <div>
                    {/* GRID DE INFORMACIÓN */}
                    <div className="row g-4">
                      {/* NOMBRES */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className="bi bi-person me-2" style={{ color: theme.accentHex }}></i>
                            Nombre
                          </p>
                          <p className="fw-bold fs-5">{usuario.names}</p>
                        </div>
                      </div>

                      {/* APELLIDOS */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className="bi bi-person me-2" style={{ color: theme.accentHex }}></i>
                            Apellidos
                          </p>
                          <p className="fw-bold fs-5">{usuario.last_names}</p>
                        </div>
                      </div>

                      {/* DNI */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className="bi bi-credit-card me-2" style={{ color: theme.accentHex }}></i>
                            Número de DNI
                          </p>
                          <p className="fw-bold fs-5">{usuario.dni}</p>
                        </div>
                      </div>

                      {/* TELÉFONO */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className="bi bi-telephone me-2" style={{ color: theme.accentHex }}></i>
                            Teléfono
                          </p>
                          <p className="fw-bold fs-5">{usuario.phone || "No registrado"}</p>
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className="bi bi-envelope me-2" style={{ color: theme.accentHex }}></i>
                            Email
                          </p>
                          <p className="fw-bold fs-5">{usuario.email || "No registrado"}</p>
                        </div>
                      </div>

                      {/* SEXO */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className="bi bi-person-fill me-2" style={{ color: theme.accentHex }}></i>
                            Sexo
                          </p>
                          <p className="fw-bold fs-5">
                            {usuario.sexo === 'M' ? 'Masculino' : usuario.sexo === 'F' ? 'Femenino' : usuario.sexo === 'O' ? 'Otro' : 'No especificado'}
                          </p>
                        </div>
                      </div>

                      {/* ROL */}
                      <div className="col-md-6">
                        <div style={{
                          backgroundColor: theme.bg,
                          padding: "20px",
                          borderRadius: "15px",
                          borderLeft: `4px solid ${theme.accentHex}`,
                          color: theme.text
                        }}>
                          <p className="small mb-2" style={{ color: theme.muted }}>
                            <i className={`bi bi-${usuario.role === 'admin' ? 'shield-check' : 'person'} me-2`} style={{ color: theme.accentHex }}></i>
                            Rol de Usuario
                          </p>
                          <p className="fw-bold fs-5">
                            <span className="badge px-3 py-1" style={{ backgroundColor: theme.accentHex, color: "#fff" }}>
                              {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 opacity-50">
          <i className="bi bi-inbox fs-1"></i>
          <p className="mt-3">No se encontraron datos del usuario</p>
        </div>
      )}
    </div>
  );
}

export default MiPerfil;
