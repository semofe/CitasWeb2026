# CitasWeb2026

Sistema de gestión de citas médicas desarrollado con arquitectura limpia. Backend en Node.js/Express con TypeORM y PostgreSQL. Frontend en React + Vite.

---

## Características principales

### Roles de usuario
| Rol | Permisos |
|---|---|
| **admin** | Gestión completa: médicos, sedes, especialidades, usuarios y todas las citas |
| **medico** | Ver sus citas agendadas, marcar citas como completadas |
| **usuario** | Agendar, editar (fecha, slot, motivo) y cancelar sus propias citas |

### Módulos
- **Citas** — Agendamiento con validación de slots por turno y día de atención. Prevención de doble reserva. Cancelación y edición por el paciente. Auto-completado de citas vencidas.
- **Médicos** — Registro con o sin acceso al sistema. Gestión de turno (mañana/tarde), días de atención y sede. Activar/desactivar médicos.
- **Sedes** — CRUD de sedes con nombre, dirección y teléfono.
- **Especialidades** — CRUD de especialidades médicas.
- **Usuarios** — Registro, login con JWT, actualización de perfil.
- **Exportación** — Exportar datos de médicos y citas a CSV/Excel.
- **Emails** — Envío automático de confirmación de cita al paciente y al médico.
- **Dashboard** — Calendario de citas, estadísticas por estado y mes (gráficos Doughnut y Bar).

### Turnos y slots disponibles
- **Mañana:** 07:30 – 12:30 (slots de 30 min)
- **Tarde:** 12:30 – 17:30 (slots de 30 min)

---

## Instalación

Desde la raíz del proyecto:

```bash
npm run install-all
```

O manualmente:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## Variables de entorno

Crear un archivo `.env` en la raíz con:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=citasweb
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=24h

# Email
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password
```

## Ejecución en desarrollo

```bash
npm run dev
```

Levanta en paralelo:
- **Backend** en `http://localhost:3000`
- **Frontend** en `http://localhost:5173`

---

## Estructura del proyecto

```
CitasWeb2026/
├── backend/
│   └── src/
│       ├── cita/           # Módulo de citas
│       ├── medico/         # Módulo de médicos
│       ├── sede/           # Módulo de sedes
│       ├── especialidad/   # Módulo de especialidades
│       ├── user/           # Módulo de usuarios y autenticación
│       ├── export/         # Exportación de datos
│       ├── database/       # Conexión y factories
│       └── utils/          # Email service, jobs
└── frontend/
    └── src/
        ├── pages/          # AgendarCita, Dashboard, Medicos, MisCitas, etc.
        ├── components/     # HorarioSelector, NotificationModal, Sidebar, etc.
        └── api/            # axiosInstance configurado con token JWT
```

Cada módulo del backend sigue arquitectura limpia:
```
modulo/
├── application/   (DTOs, servicios)
├── domain/        (entidades, builders, repositorios interfaz)
├── infrastructure/ (repositorio TypeORM, mapper)
└── presentation/  (controladores, rutas)
```

---

## API — Endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login, devuelve JWT |
| POST | `/auth/register` | Registro de paciente |

### Citas
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/citas` | Paciente autenticado |
| GET | `/citas/mis-citas` | Paciente — sus citas |
| GET | `/citas/mis-citas-medico` | Médico — sus citas |
| GET | `/citas/slots?medicoId=&fecha=` | Slots disponibles |
| PATCH | `/citas/:id` | Editar fecha/slot/motivo |
| PATCH | `/citas/:id/cancelar` | Cancelar cita |
| PATCH | `/citas/:id/completar` | Admin / Médico |
| GET | `/citas` | Admin — todas las citas |

### Médicos
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/medicos` | Autenticado |
| POST | `/medicos` | Admin |
| POST | `/medicos/con-acceso` | Admin — crea médico + usuario |
| PUT | `/medicos/:id` | Admin |
| PATCH | `/medicos/:id/toggle` | Admin — activar/desactivar |
| DELETE | `/medicos/:id` | Admin |

---

## Dependencias principales

### Backend
`express` · `typeorm` · `pg` · `bcrypt` · `jsonwebtoken` · `nodemailer` · `dotenv` · `cors` · `morgan` · `nodemon`

### Frontend
`react` · `react-router-dom` · `axios` · `bootstrap` · `react-datepicker` · `@fullcalendar/react` · `chart.js` · `react-chartjs-2` · `vite`

---

## Notas
- No subir `node_modules/` ni `.env` a GitHub (ya excluidos en `.gitignore`).
- El token JWT se almacena en `localStorage` y se envía automáticamente en cada request via `axiosInstance`.
- Las citas vencidas se auto-completan mediante un job programado (`citaHistorialJob.js`).