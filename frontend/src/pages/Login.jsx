import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, theme, toggleTheme } = useTheme();

  // Limpiar error cuando el usuario empieza a escribir
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setShowModal(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
    setShowModal(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validar que los campos no estén vacíos
    if (!email.trim()) {
      setError("⚠️ Por favor ingresa tu correo electrónico");
      setShowModal(true);
      return;
    }
    
    if (!password.trim()) {
      setError("⚠️ Por favor ingresa tu contraseña");
      setShowModal(true);
      return;
    }

    setLoading(true);
    setError("");
    setShowModal(false);
    
    // Limpiar COMPLETAMENTE el localStorage al iniciar login
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDni");
    localStorage.removeItem("userName");

    try {
      const response = await axiosInstance.post("/auth/login", { email, password });

      if (response.data && response.data.data && response.data.data.token && response.data.data.user) {
        // Guardamos el token de seguridad para poder crear Sedes, Médicos, etc.
        localStorage.setItem("token", response.data.data.token); 
        
        localStorage.setItem("userRole", response.data.data.user.role || "usuario"); 
        localStorage.setItem("userDni", response.data.data.user.dni);
        localStorage.setItem("userName", response.data.data.user.names);

        // Navegar solo si las credenciales son correctas y el token se guardó
        navigate("/dashboard");
      } else {
        // Si la respuesta no tiene los datos necesarios, no dejar pasar
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userDni");
        localStorage.removeItem("userName");
        setError("❌ Respuesta del servidor inválida. Intenta de nuevo.");
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error de login:", error);
      
      // Limpiar token si existe error
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userDni");
      localStorage.removeItem("userName");
      
      // Mostrar mensaje de error específico
      if (error.response?.status === 401) {
        setError("❌ Credenciales incorrectas. Email o contraseña no válidos.");
      } else if (error.response?.status === 404) {
        setError("❌ Este usuario no está registrado en el sistema.");
      } else if (error.response?.data?.message) {
        setError(`❌ ${error.response.data.message}`);
      } else {
        setError("❌ Error de conexión. Intenta de nuevo más tarde.");
      }
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "transparent",
    color: theme.text,
    borderColor: theme.border,
    caretColor: theme.accentHex,
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100" 
      style={{ backgroundColor: theme.bg, transition: "0.3s", position: "relative" }}
    >
      <button 
        onClick={toggleTheme}
        className="btn btn-sm position-absolute top-0 end-0 m-4 shadow-sm border px-3 py-2"
        style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border, borderRadius: "10px" }}
      >
        <i className={`bi ${isDarkMode ? 'bi-sun-fill text-info' : 'bi-moon-fill text-danger'} me-2`}></i>
        {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
      </button>

      <div className="col-md-4 col-sm-8 col-11">
        <div 
          className="card shadow-lg border-0 p-4" 
          style={{ backgroundColor: theme.cardBg, borderRadius: "25px", transition: "0.3s" }}
        >
          <div className="card-body text-center">
            <div className="mb-4">
              <img src="/logolp.png" alt="Clínica Ricardo Palma" style={{ height: "90px", objectFit: "contain" }} />
            </div>

            <h2 className="fw-bold mb-1" style={{ color: theme.text }}>Clínica Ricardo Palma</h2>
            <p className="small mb-4" style={{ color: theme.muted }}>Registro de Citas Médicas</p>

            <form onSubmit={handleLogin} className="text-start">
              {/* MODAL DE NOTIFICACIÓN */}
              <NotificationModal
                show={showModal}
                type="error"
                title="Error de Acceso"
                message={error.replace(/❌ /g, "")}
                onClose={() => setShowModal(false)}
                confirmText="Entendido"
              />

              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: theme.border }}>
                    <i className="bi bi-envelope" style={{ color: theme.muted }}></i>
                  </span>
                  <input type="email" className="form-control border-start-0 shadow-none" placeholder="nombre@ejemplo.com" style={inputStyle} value={email} onChange={handleEmailChange} required />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold" style={{ color: theme.text }}>Contraseña</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: theme.border }}>
                    <i className="bi bi-lock" style={{ color: theme.muted }}></i>
                  </span>
                  <input type="password" className="form-control border-start-0 shadow-none" placeholder="••••••••" style={inputStyle} value={password} onChange={handlePasswordChange} required />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-lg w-100 fw-bold shadow-sm text-white mb-3" style={{ backgroundColor: theme.accentHex, border: "none", borderRadius: "15px", padding: "12px" }}>
                {loading ? "Verificando..." : "Ingresar al Sistema"}
              </button>
            </form>

            <div className="mt-3 text-center">
              <p className="small mb-2" style={{ color: theme.text }}>¿No tienes una cuenta? <Link to="/register" style={{ color: theme.accentHex, fontWeight: "bold", textDecoration: "none" }}>Regístrate aquí</Link></p>
              <p className="small mb-0" style={{ color: theme.muted, opacity: 0.8 }}>UPN © 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;