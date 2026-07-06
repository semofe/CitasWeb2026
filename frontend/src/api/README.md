# API Configuration

Este archivo `axiosInstance.js` centraliza todas las llamadas HTTP de la aplicación.

## Uso

### Importar en tu componente:
```javascript
import axiosInstance from '@/api/axiosInstance';
```

### GET - Obtener datos
```javascript
// Obtener lista
const response = await axiosInstance.get('/citas');
const citas = response.data;

// Con parámetros
const response = await axiosInstance.get('/usuarios', { 
  params: { role: 'doctor', activo: true } 
});
```

### POST - Crear datos
```javascript
const response = await axiosInstance.post('/medicos', {
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@example.com'
});
```

### PUT - Actualizar datos
```javascript
const response = await axiosInstance.put(`/medicos/${id}`, {
  nombres: 'Juan',
  apellidos: 'García'
});
```

### DELETE - Eliminar datos
```javascript
const response = await axiosInstance.delete(`/medicos/${id}`);
```

## Características

✅ **Token automático**: Agrega el token de `localStorage` en cada request
✅ **Headers por defecto**: Content-Type application/json configurado
✅ **Manejo de errores**: Redirige a login si token expira (401)
✅ **Variable de entorno**: Usa `VITE_API_BASE_URL` desde `.env`

## Configurar para Producción

1. Crear `.env.production`:
```
VITE_API_BASE_URL=https://api.tudominio.com/api
```

2. Vite usará automáticamente este archivo en `npm run build`

## Cambiar URL en Desarrollo

Editar `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

Luego reinicia el servidor (`npm run dev`).
