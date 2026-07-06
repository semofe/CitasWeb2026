import { Navigate } from "react-router-dom";

function ProtectedRoute({ element }) {
  const token = localStorage.getItem("token");
  const userDni = localStorage.getItem("userDni");
  const userRole = localStorage.getItem("userRole");

  // Si NO hay token, userDni O userRole, redirigir a login
  if (!token || !userDni || !userRole) {
    // Limpiar localStorage si algo está incompleto
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDni");
    localStorage.removeItem("userName");
    return <Navigate to="/" replace />;
  }

  // Validar que el token no esté vacío
  if (token.trim() === "" || userDni.trim() === "") {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userDni");
    localStorage.removeItem("userName");
    return <Navigate to="/" replace />;
  }

  return element;
}

export default ProtectedRoute;
