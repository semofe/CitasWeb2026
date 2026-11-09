import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";

function Sidebar() {
  const location = useLocation();
  const { isDarkMode, toggleTheme, theme } = useTheme();

  // 1. OBTENEMOS EL ROL DEL USUARIO (Guardado al hacer login)
  // Si no hay nada, por defecto lo tratamos como paciente por seguridad
  const userRole = localStorage.getItem("userRole") || "paciente";

  // 2. DEFINIMOS TODOS LOS ITEMS CON SUS PERMISOS
  const menuItems = [
  { name: "Tablero", path: "/dashboard", icon: "bi-grid-1x2", roles: ["admin", "usuario", "medico"] },
  { name: "Pacientes", path: "/usuarios", icon: "bi-people", roles: ["admin"] },
  { name: "Sedes", path: "/sedes", icon: "bi-building", roles: ["admin"] },
  { name: "Médicos", path: "/medicos", icon: "bi-person-badge", roles: ["admin"] },
  { name: "Especialidades", path: "/especialidades", icon: "bi-journal-medical", roles: ["admin"] },
  { name: "Control de Citas", path: "/citas", icon: "bi-calendar-check", roles: ["admin"] },
  
  // Pacientes
  { name: "Agendar Cita", path: "/agendar", icon: "bi-calendar-plus", roles: ["usuario"] },
  { name: "Mis Citas", path: "/mis-citas", icon: "bi-person-lines-fill", roles: ["usuario"] },
  
  // Médicos
  { name: "Mis Citas", path: "/mis-citas-medico", icon: "bi-calendar2-check", roles: ["medico"] },
  
  // Ambos roles
  { name: "Mi Perfil", path: "/mi-perfil", icon: "bi-person-circle", roles: ["admin", "usuario", "medico"] },
];

  // 3. FILTRAMOS LOS BOTONES SEGÚN EL ROL DEL QUE ENTRÓ
  const itemsFiltrados = menuItems.filter(item => item.roles.includes(userRole));

  // Función para limpiar datos al salir
  const handleLogout = () => {
    localStorage.clear();
  };

  return (
    <aside className="app-sidebar d-flex flex-column p-3 shadow-sm" 
         style={{ 
            width: "260px", 
            height: "100vh", 
            position: "fixed", 
            top: 0, 
            left: 0, 
            backgroundColor: theme.sidebarBg, 
            borderRight: `1px solid ${theme.border}`, 
            transition: "0.3s",
            zIndex: 1000 
         }}>
      
      {/* LOGO DINÁMICO */}
      <div className="brand-wrap d-flex align-items-center justify-content-center mb-4">
        <img src="/logoprincipal.png" alt="Clínica R. Palma" style={{ width: "100%", maxHeight: "80px", objectFit: "contain" }} />
      </div>
      
      <hr style={{ opacity: 0.1, color: theme.text }} />

      {/* ROL ACTUAL (Pequeño indicador opcional) */}
      <div className="mb-3 px-2">
        <span className="role-badge" style={{ backgroundColor: isDarkMode ? '#30363d' : '#e9f8ee', color: theme.text }}>
          <span className="role-indicator"></span>{userRole.toUpperCase()}
        </span>
      </div>

      {/* MENU FILTRADO */}
      <ul className="nav nav-pills flex-column mb-auto">
        {itemsFiltrados.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li className="nav-item" key={item.path}>
              <Link to={item.path} 
                className={`nav-link sidebar-link mb-1 d-flex align-items-center ${isActive ? `active bg-${theme.accent}` : ""}`}
                style={{ color: isActive ? "#fff" : theme.text, transition: "0.2s" }}
              >
                <i className={`bi ${item.icon} me-3 fs-5 ${isActive ? "text-white" : `text-${theme.accent}`}`}></i>
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <hr style={{ opacity: 0.1, color: theme.text }} />

      {/* BOTÓN DE TEMA */}
      <button onClick={toggleTheme} className="btn btn-sm d-flex align-items-center mb-3 border-0" style={{ color: theme.text }}>
        <i className={`bi ${isDarkMode ? 'bi-sun-fill text-info' : 'bi-moon-fill'} me-3 fs-5`} style={{ color: isDarkMode ? undefined : '#1a7a3c' }}></i>
        {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
      </button>

      {/* CERRAR SESIÓN */}
      <Link to="/" onClick={handleLogout} className="sidebar-logout d-flex align-items-center text-decoration-none small" style={{ color: theme.text }}>
        <i className="bi bi-box-arrow-left me-2"></i> Cerrar Sesión
      </Link>
    </aside>
  );
}

export default Sidebar;
