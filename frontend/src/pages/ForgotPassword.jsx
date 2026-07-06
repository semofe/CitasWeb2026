import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import NotificationModal from "../components/NotificationModal";
import axiosInstance from "../api/axiosInstance";

// Paso 1: Ingresar email
// Paso 2: Ingresar código OTP (6 dígitos)
// Paso 3: Ingresar nueva contraseña

function ForgotPassword() {
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("error");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const otpRefs = useRef([]);

  const showModal = (type, title, message) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalShow(true);
  };

  // ── PASO 1: Enviar email ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return showModal("error", "Campo requerido", "Por favor ingresa tu correo electrónico.");

    setLoading(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Error al enviar el código. Intenta de nuevo.";
      showModal("error", "Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // ── PASO 2: Verificar OTP ─────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return showModal("error", "Código incompleto", "Ingresa los 6 dígitos del código.");
    setStep(3);
  };

  // ── PASO 3: Nueva contraseña ──────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return showModal("error", "Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres.");
    if (newPassword !== confirmPassword) return showModal("error", "No coinciden", "Las contraseñas no coinciden.");

    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        otp: otp.join(""),
        newPassword,
      });
      showModal("success", "¡Listo!", "Tu contraseña fue actualizada. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Error al actualizar la contraseña.";
      showModal("error", "Error", msg);
      // Si el OTP expiró, volver al paso 2
      if (msg.toLowerCase().includes("expiró") || msg.toLowerCase().includes("inválido")) {
        setOtp(["", "", "", "", "", ""]);
        setStep(2);
      }
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

  const stepTitles = ["Ingresa tu correo", "Código de verificación", "Nueva contraseña"];
  const stepIcons  = ["bi-envelope-at", "bi-shield-lock", "bi-key"];

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: theme.bg, transition: "0.3s", position: "relative" }}
    >
      {/* Botón tema */}
      <button
        onClick={toggleTheme}
        className="btn btn-sm position-absolute top-0 end-0 m-4 shadow-sm border px-3 py-2"
        style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border, borderRadius: "10px" }}
      >
        <i className={`bi ${isDarkMode ? "bi-sun-fill text-info" : "bi-moon-fill"} me-2`}
          style={{ color: isDarkMode ? undefined : "#1a7a3c" }}></i>
        {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
      </button>

      <NotificationModal
        show={modalShow}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalShow(false)}
      />

      <div className="col-md-4 col-sm-8 col-11">
        <div
          className="card shadow-lg border-0 p-4"
          style={{ backgroundColor: theme.cardBg, borderRadius: "25px", transition: "0.3s" }}
        >
          <div className="card-body">
            {/* Logo */}
            <div className="text-center mb-4">
              <img src="/logolp.png" alt="Clínica Ricardo Palma" style={{ height: "70px", objectFit: "contain" }} />
            </div>

            {/* Indicador de pasos */}
            <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                    style={{
                      width: "34px", height: "34px",
                      backgroundColor: step >= s ? theme.accentHex : theme.bg,
                      color: step >= s ? "#fff" : theme.muted,
                      border: `2px solid ${step >= s ? theme.accentHex : theme.border}`,
                      fontSize: "13px",
                      transition: "0.3s",
                    }}
                  >
                    {step > s ? <i className="bi bi-check-lg"></i> : s}
                  </div>
                  {s < 3 && (
                    <div style={{
                      height: "2px", width: "32px",
                      backgroundColor: step > s ? theme.accentHex : theme.border,
                      transition: "0.3s"
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Título del paso */}
            <div className="text-center mb-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "56px", height: "56px", backgroundColor: `${theme.accentHex}20` }}
              >
                <i className={`bi ${stepIcons[step - 1]} fs-4`} style={{ color: theme.accentHex }}></i>
              </div>
              <h5 className="fw-bold mb-1" style={{ color: theme.text }}>Recuperar contraseña</h5>
              <p className="small" style={{ color: theme.muted }}>{stepTitles[step - 1]}</p>
            </div>

            {/* ── PASO 1 ── */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="mb-4">
                  <label className="form-label small fw-bold" style={{ color: theme.text }}>
                    Correo electrónico
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: theme.border }}>
                      <i className="bi bi-envelope" style={{ color: theme.muted }}></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 shadow-none"
                      placeholder="nombre@ejemplo.com"
                      style={inputStyle}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="small mt-2" style={{ color: theme.muted }}>
                    Te enviaremos un código de 6 dígitos a este correo.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-lg w-100 fw-bold text-white"
                  style={{ backgroundColor: theme.accentHex, border: "none", borderRadius: "12px", padding: "12px" }}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Enviando...</>
                    : <><i className="bi bi-send me-2"></i>Enviar código</>}
                </button>
              </form>
            )}

            {/* ── PASO 2 ── */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <p className="small text-center mb-3" style={{ color: theme.muted }}>
                  Ingresa el código enviado a <strong style={{ color: theme.text }}>{email}</strong>
                </p>

                {/* Celdas OTP */}
                <div className="d-flex justify-content-center gap-2 mb-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="form-control text-center fw-bold fs-4 shadow-none"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{
                        width: "46px", height: "56px",
                        backgroundColor: digit ? `${theme.accentHex}18` : theme.bg,
                        color: theme.text,
                        borderColor: digit ? theme.accentHex : theme.border,
                        borderRadius: "10px",
                        borderWidth: "2px",
                        padding: "0",
                        transition: "0.2s",
                      }}
                    />
                  ))}
                </div>

                <p className="small text-center mb-4" style={{ color: theme.muted }}>
                  <i className="bi bi-clock me-1"></i>El código expira en 10 minutos
                </p>

                <button
                  type="submit"
                  className="btn btn-lg w-100 fw-bold text-white mb-3"
                  style={{ backgroundColor: theme.accentHex, border: "none", borderRadius: "12px", padding: "12px" }}
                >
                  <i className="bi bi-arrow-right me-2"></i>Continuar
                </button>

                <button
                  type="button"
                  className="btn w-100"
                  style={{ color: theme.muted, borderRadius: "12px" }}
                  onClick={() => setStep(1)}
                >
                  <i className="bi bi-arrow-left me-1"></i>Cambiar correo
                </button>
              </form>
            )}

            {/* ── PASO 3 ── */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label className="form-label small fw-bold" style={{ color: theme.text }}>
                    Nueva contraseña
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: theme.border }}>
                      <i className="bi bi-lock" style={{ color: theme.muted }}></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-start-0 border-end-0 shadow-none"
                      placeholder="Mínimo 6 caracteres"
                      style={inputStyle}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-transparent"
                      style={{ borderColor: theme.border, color: theme.muted, cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold" style={{ color: theme.text }}>
                    Confirmar contraseña
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: theme.border }}>
                      <i className="bi bi-lock-fill" style={{ color: theme.muted }}></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-start-0 shadow-none"
                      placeholder="Repite la contraseña"
                      style={inputStyle}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="small mt-1" style={{ color: "#dc3545" }}>
                      <i className="bi bi-x-circle me-1"></i>Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-lg w-100 fw-bold text-white"
                  style={{ backgroundColor: theme.accentHex, border: "none", borderRadius: "12px", padding: "12px" }}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Actualizando...</>
                    : <><i className="bi bi-check-circle me-2"></i>Actualizar contraseña</>}
                </button>
              </form>
            )}

            {/* Link volver al login */}
            <div className="text-center mt-4">
              <Link to="/" style={{ color: theme.muted, fontSize: "13px", textDecoration: "none" }}>
                <i className="bi bi-arrow-left me-1"></i>Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
