# Frontend - Sistema de Gestión de Alumnos y Cursos

Este es un frontend desarrollado con HTML, CSS y JavaScript puro que consume la API RESTful del sistema de gestión de alumnos y cursos con autenticación JWT.

## Características

### 🔐 Autenticación
- Login con usuario y contraseña
- Manejo automático de tokens JWT
- Logout seguro
- Redirección automática si no está autenticado

### 👥 Gestión de Alumnos
- Listar todos los alumnos
- Crear nuevos alumnos
- Editar información de alumnos existentes
- Activar/desactivar alumnos
- Buscar alumnos por nombre, apellido o DNI

### 📚 Gestión de Cursos
- Listar todos los cursos
- Crear nuevos cursos
- Editar información de cursos existentes
- Activar/desactivar cursos
- Buscar cursos por nombre

### 🔗 Gestión de Inscripciones (Relación Muchos a Muchos)
- Ver cursos de un alumno específico
- Ver alumnos de un curso específico
- Inscribir alumnos en cursos
- Desinscribir alumnos de cursos
- Interfaz intuitiva para gestionar inscripciones

## Estructura del Proyecto

```
jwt_frontend/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos CSS
├── js/
│   ├── config.js           # Configuración de la API
│   ├── auth.js             # Módulo de autenticación
│   ├── api.js              # Módulo de API
│   ├── ui.js               # Módulo de UI
│   ├── alumnos.js          # Gestión de alumnos
│   ├── cursos.js           # Gestión de cursos
│   ├── inscripciones.js    # Gestión de inscripciones
│   └── app.js              # Aplicación principal
└── README.md               # Este archivo
```

## Configuración

### 1. Configurar la URL de la API

Edita el archivo `js/config.js` y ajusta la URL base de tu API:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api', // Cambia por tu URL
    // ...
};
```

### 2. Ejecutar el Frontend

#### Opción 1: Servidor HTTP Simple (Python)
```bash
cd jwt_frontend
python3 -m http.server 8080
```

#### Opción 2: Servidor HTTP Simple (Node.js)
```bash
cd jwt_frontend
npx http-server -p 8080
```

#### Opción 3: Live Server (VS Code)
Si usas VS Code, instala la extensión "Live Server" y haz clic derecho en `index.html` → "Open with Live Server"

### 3. Acceder a la Aplicación

Abre tu navegador y ve a: `http://localhost:8080`

## Uso de la Aplicación

### Iniciar Sesión

1. Ingresa tu usuario y contraseña
2. Haz clic en "Ingresar"
3. Si las credenciales son correctas, serás redirigido al dashboard

### Gestión de Alumnos

1. **Ver Alumnos**: La lista se carga automáticamente al iniciar sesión
2. **Crear Alumno**: Haz clic en "Nuevo Alumno" y completa el formulario
3. **Editar Alumno**: Haz clic en el botón "Editar" junto al alumno
4. **Activar/Desactivar**: Usa el switch de estado
5. **Buscar**: Usa la barra de búsqueda para filtrar alumnos

### Gestión de Cursos

1. **Ver Cursos**: Haz clic en la pestaña "Cursos"
2. **Crear Curso**: Haz clic en "Nuevo Curso" y completa el formulario
3. **Editar Curso**: Haz clic en el botón "Editar" junto al curso
4. **Activar/Desactivar**: Usa el switch de estado
5. **Buscar**: Usa la barra de búsqueda para filtrar cursos

### Gestión de Inscripciones

1. **Ver Inscripciones**: Haz clic en la pestaña "Inscripciones"
2. **Inscribir Alumno**: 
   - Selecciona un alumno de la lista
   - Selecciona un curso de la lista
   - Haz clic en "Inscribir"
3. **Desinscribir Alumno**:
   - En la lista de inscripciones, haz clic en "Desinscribir"
4. **Ver por Alumno**: Selecciona un alumno para ver sus cursos
5. **Ver por Curso**: Selecciona un curso para ver sus alumnos

## Características Técnicas

### Responsive Design
- Diseño adaptable para desktop, tablet y móvil
- Interfaz moderna con gradientes y sombras
- Animaciones suaves y transiciones

### Manejo de Errores
- Validación de formularios en el frontend
- Manejo de errores de la API
- Mensajes informativos para el usuario
- Toasts para notificaciones

### Seguridad
- Tokens JWT almacenados de forma segura
- Validación de sesión en cada request
- Logout automático cuando el token expira
- Headers de autorización en todas las peticiones

### Performance
- Carga lazy de datos
- Debounce en búsquedas
- Caché local de datos frecuentes
- Optimización de requests HTTP

## API Endpoints Utilizados

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Alumnos
- `GET /api/alumnos` - Listar alumnos
- `POST /api/alumnos` - Crear alumno
- `PUT /api/alumnos/{id}` - Actualizar alumno
- `PATCH /api/alumnos/{id}/activar` - Activar alumno
- `PATCH /api/alumnos/{id}/desactivar` - Desactivar alumno

### Cursos
- `GET /api/cursos` - Listar cursos
- `POST /api/cursos` - Crear curso
- `PUT /api/cursos/{id}` - Actualizar curso
- `PATCH /api/cursos/{id}/activar` - Activar curso
- `PATCH /api/cursos/{id}/desactivar` - Desactivar curso

### Inscripciones (Relación Muchos a Muchos)
- `GET /api/alumnos/{id}/cursos` - Cursos de un alumno
- `GET /api/cursos/{id}/alumnos` - Alumnos de un curso
- `POST /api/alumnos/{alumnoId}/cursos/{cursoId}` - Inscribir alumno
- `DELETE /api/alumnos/{alumnoId}/cursos/{cursoId}` - Desinscribir alumno

## Solución de Problemas

### Error de CORS
Si encuentras errores de CORS, asegúrate de que tu API backend tenga configurado CORS para permitir requests desde el origen del frontend.

### Token Expirado
Si el token JWT expira, la aplicación te redirigirá automáticamente al login. Simplemente vuelve a iniciar sesión.

### API No Disponible
Verifica que:
1. El backend esté ejecutándose
2. La URL en `config.js` sea correcta
3. No haya problemas de red

## Desarrollo

### Agregar Nuevas Funcionalidades

1. **Nuevo Módulo**: Crea un archivo JS en la carpeta `js/`
2. **Nuevos Estilos**: Agrega CSS en `css/styles.css`
3. **Nueva Página**: Crea HTML adicional si es necesario
4. **Integración**: Importa y usa en `app.js`

### Estructura de Módulos

Cada módulo sigue esta estructura:
```javascript
class ModuleName {
    constructor() {
        this.init();
    }
    
    init() {
        // Inicialización
    }
    
    // Métodos del módulo
}
```

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript ES6+**: Lógica de la aplicación
- **Fetch API**: Comunicación con el backend
- **LocalStorage**: Almacenamiento del token JWT

## Licencia

Este proyecto es parte del sistema de gestión de alumnos y cursos con autenticación JWT.

