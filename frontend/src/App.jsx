import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar"; 
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Sedes from "./pages/Sedes";
import Medicos from "./pages/Medicos";
import Especialidades from "./pages/Especialidades";
import Citas from "./pages/Citas";
import Usuarios from "./pages/Usuarios";
import MiPerfil from "./pages/MiPerfil";
import NotFound from "./pages/NotFound";
import AgendarCita from "./pages/AgendarCita";
import MisCitas from "./pages/MisCitas";
import MisCitasMedico from "./pages/MisCitasMedico";
import { useTheme } from "./ThemeContext";

function AppContent() {
  const location = useLocation();
  const { theme } = useTheme();
  
  // Páginas que no llevan Sidebar
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  return (
    <div className="d-flex" style={{ backgroundColor: theme.bg, minHeight: "100vh" }}>
      
      {!isAuthPage && <Sidebar />}

      <div 
        className="flex-grow-1" 
        style={{ 
          marginLeft: isAuthPage ? "0" : "260px", 
          transition: "0.3s" 
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mis-citas" element={<ProtectedRoute element={<MisCitas />} />} />
          <Route path="/mis-citas-medico" element={<ProtectedRoute element={<MisCitasMedico />} />} />
          <Route path="/mi-perfil" element={<ProtectedRoute element={<MiPerfil />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/usuarios" element={<ProtectedRoute element={<Usuarios />} />} />
          <Route path="/sedes" element={<ProtectedRoute element={<Sedes />} />} />
          <Route path="/medicos" element={<ProtectedRoute element={<Medicos />} />} />
          <Route path="/especialidades" element={<ProtectedRoute element={<Especialidades />} />} />
          <Route path="/citas" element={<ProtectedRoute element={<Citas />} />} />
          <Route path="/agendar" element={<ProtectedRoute element={<AgendarCita />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;