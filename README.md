# Frontend - Sistema de Gestión de Alumnos y Cursos

Este es un frontend desarrollado con HTML, CSS y JavaScript puro que consume una API RESTful con autenticación JWT.

## Características

### ? Autenticación
- Inicio de sesión con usuario y contraseña.
- Manejo automático de tokens JWT.
- Cierre de sesión seguro.
- Redirección automática si no hay autenticación.

### ? Gestión de Alumnos
- Listado completo de alumnos.
- Alta de nuevos alumnos.
- Edición de información de alumnos existentes.
- Activación y desactivación de alumnos.
- Búsqueda por nombre, apellido o DNI.

### ? Gestión de Cursos
- Listado de todos los cursos.
- Creación de nuevos cursos.
- Edición de cursos existentes.
- Activación y desactivación de cursos.
- Búsqueda de cursos por nombre.

### ? Gestión de Inscripciones (Relación Muchos a Muchos)
- Visualización de cursos por alumno.
- Visualización de alumnos por curso.
- Inscripción y desinscripción de alumnos en cursos.
- Interfaz intuitiva para la gestión de inscripciones.

## Estructura del Proyecto


jwt_frontend/
+-- index.html              # Página principal
+-- css/
¦   +-- styles.css          # Estilos
+-- js/
¦   +-- config.js           # Configuración general
¦   +-- auth.js             # Módulo de autenticación
¦   +-- api.js              # Acceso a la API
¦   +-- ui.js               # Lógica de interfaz
¦   +-- alumnos.js          # Gestión de alumnos
¦   +-- cursos.js           # Gestión de cursos
¦   +-- inscripciones.js    # Gestión de inscripciones
¦   +-- app.js              # Lógica principal
+-- README.md               # Este archivo



## Configuración

### 1. URL de la API

Editá el archivo `js/config.js` y actualizá la URL base de tu API:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api', // Cambiar según el entorno
};
```

### 2. Ejecutar el Frontend

#### Live Server (VS Code)
Instalá la extensión “Live Server” y abrí `index.html` con clic derecho ? “Open with Live Server”.

### 3. Acceder a la Aplicación

Ingresá en tu navegador a: `http://localhost:8080`

## Uso de la Aplicación

### Inicio de Sesión

1. Ingresá tus credenciales.
2. Hacé clic en “Ingresar”.
3. Si son válidas, accederás al dashboard.

### Alumnos

- Visualización automática al iniciar sesión.
- Crear: botón “Nuevo Alumno”.
- Editar: botón “Editar” junto al alumno.
- Activar/desactivar: conmutador de estado.
- Buscar: por barra de búsqueda.

### Cursos

- Pestaña “Cursos”.
- Crear: botón “Nuevo Curso”.
- Editar: botón “Editar” junto al curso.
- Activar/desactivar: conmutador.
- Buscar: por nombre.

### Inscripciones

- Pestaña “Inscripciones”.
- Inscribir:
  - Seleccionar alumno.
  - Seleccionar curso.
  - Clic en “Inscribir”.
- Desinscribir: clic en “Desinscribir”.
- Ver cursos de un alumno o alumnos de un curso.

## Aspectos Técnicos

### Diseño Responsive
- Adaptación a escritorio, tablet y móvil.
- Interfaz moderna con animaciones suaves.

### Validación y Errores
- Validación en formularios.
- Gestión de errores de API.
- Notificaciones mediante toasts.

### Seguridad
- JWT almacenado de forma segura.
- Validación en cada request.
- Expiración automática y logout.
- Headers de autorización en todas las solicitudes.

### Rendimiento
- Carga diferida de datos.
- Búsquedas con debounce.
- Caché local de datos frecuentes.

## Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión.
- `POST /api/auth/logout` - Cerrar sesión.

### Alumnos
- `GET /api/alumnos`
- `POST /api/alumnos`
- `PUT /api/alumnos/{id}`
- `PATCH /api/alumnos/{id}/activar`
- `PATCH /api/alumnos/{id}/desactivar`

### Cursos
- `GET /api/cursos`
- `POST /api/cursos`
- `PUT /api/cursos/{id}`
- `PATCH /api/cursos/{id}/activar`
- `PATCH /api/cursos/{id}/desactivar`

### Inscripciones
- `GET /api/alumnos/{id}/cursos`
- `GET /api/cursos/{id}/alumnos`
- `POST /api/alumnos/{alumnoId}/cursos/{cursoId}`
- `DELETE /api/alumnos/{alumnoId}/cursos/{cursoId}`

## Problemas Comunes

### CORS
Asegurate de que el backend permita el origen del frontend.

### Token Expirado
La app redirige al login. Iniciá sesión nuevamente.

### API No Disponible
Verificá:
1. Que el backend esté funcionando.
2. Que la URL esté bien configurada.
3. Que no haya problemas de red.


## Tecnologías Utilizadas

- **HTML5**: estructura semántica.
- **CSS3**: Flexbox, Grid y animaciones.
- **JavaScript ES6+**: lógica y manipulación DOM.
- **Fetch API**: comunicación con backend.
- **LocalStorage**: almacenamiento de tokens.

## Licencia

Este proyecto forma parte del sistema de gestión de alumnos y cursos con autenticación TF-JWT.
