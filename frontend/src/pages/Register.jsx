import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function Register() {
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    dni: "",
    user_names: "",
    user_lastns: "",
    user_email: "",
    user_password: "",
    user_phone: "",
    user_sexo: ""
  });

  // Estado para capturar y mostrar errores de validación
  const [errorMessage, setErrorMessage] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    setErrorMessage(""); // Limpia el error al empezar a escribir
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. VALIDACIÓN EN EL FRONTEND (Espejo de tu backend)
  const validateInputs = () => {
    const { user_email, user_password, dni } = formData;

    // Email (Regex de tu backend)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(user_email)) return "El formato de correo no es válido.";

    // Password (Reglas de tu backend: 8 chars, 1 Mayus, 1 Num)
    if (user_password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(user_password)) return "La contraseña debe tener al menos una letra mayúscula.";
    if (!/[0-9]/.test(user_password)) return "La contraseña debe tener al menos un número.";

    if (dni.length < 8) return "El DNI debe tener al menos 8 dígitos.";

    return null; // Todo bien
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Ejecutar validación local primero
    const localError = validateInputs();
    if (localError) return setErrorMessage(localError);

    try {
      const response = await axiosInstance.post("/auth/register", {
        // Mapeamos los nombres a los que espera tu RegisterUserService.js
        dni: formData.dni,
        names: formData.user_names,
        last_names: formData.user_lastns,
        email: formData.user_email,
        password: formData.user_password,
        phone: formData.user_phone,
        sexo: formData.user_sexo || null
      });

      if (response.data) {
        setModalTitle("¡Éxito!");
        setModalMessage("Cuenta creada con éxito.");
        setModalType("success");
        setModalShow(true);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      // 2. CAPTURA DE ERROR DEL BACKEND (Ej: "DNI already registered")
      setErrorMessage(error.response?.data?.message || "Error al registrar.");
    }
  };

  const inputStyle = {
    backgroundColor: "transparent",
    color: theme.text,
    borderColor: theme.border,
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: theme.bg }}>
      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />
      
      <div className="col-md-5 col-sm-8 col-11">
        <div className="card shadow-lg border-0 p-4" style={{ backgroundColor: theme.cardBg, borderRadius: "25px" }}>
          <div className="card-body text-center">
            
            <div className="d-flex align-items-center justify-content-center rounded-circle mb-3 text-white mx-auto" style={{ backgroundColor: theme.accentHex, width: "72px", height: "72px" }}>
              <i className="bi bi-person-plus-fill fs-2"></i>
            </div>
            
            <h2 className="fw-bold mb-1" style={{ color: theme.text }}>Crear Cuenta</h2>
            <p className="small mb-4" style={{ color: theme.muted }}>Clínica Ricardo Palma</p>

            {/* ALERTA DE ERROR DINÁMICA */}
            {errorMessage && (
              <div className="alert alert-danger py-2 small mb-4 animate__animated animate__shakeX">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleRegister} className="text-start">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold" style={{ color: theme.text }}>DNI</label>
                  <input name="dni" type="text" className="form-control" style={inputStyle} placeholder="12345678" onChange={handleChange} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold" style={{ color: theme.text }}>Teléfono</label>
                  <input name="user_phone" type="text" className="form-control" style={inputStyle} placeholder="999..." onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Nombres</label>
                <input name="user_names" type="text" className="form-control" style={inputStyle} placeholder="Ej: Juan Carlos" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Apellidos</label>
                <input name="user_lastns" type="text" className="form-control" style={inputStyle} placeholder="Ej: Pérez Ochoa" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Sexo</label>
                <select name="user_sexo" className="form-select" style={inputStyle} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Email</label>
                <input name="user_email" type="email" className="form-control" style={inputStyle} placeholder="usuario@gmail.com" onChange={handleChange} required />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Contraseña</label>
                <input name="user_password" type="password" className="form-control" style={inputStyle} placeholder="Mín. 8 caracteres, 1 mayús, 1 núm" onChange={handleChange} required />
              </div>

              <button type="submit" className="btn btn-lg w-100 fw-bold text-white shadow-sm" style={{ backgroundColor: theme.accentHex, border: "none", borderRadius: "15px" }}>
                Registrarme ahora
              </button>
            </form>

            <p className="small mt-3 mb-0" style={{ color: theme.text }}>
              ¿Ya tienes cuenta? <Link to="/" style={{ color: theme.accentHex, fontWeight: "bold", textDecoration: "none" }}>Logueate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;