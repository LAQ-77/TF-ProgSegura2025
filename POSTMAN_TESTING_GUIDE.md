# Guía de Testing con Postman - API JWT con Alumnos y Cursos

## Descripción General

Esta guía proporciona instrucciones detalladas para realizar testing de la API TF-JWT que incluye las entidades Alumnos y Cursos con una relación de muchos a muchos. La colección de Postman incluye todos los endpoints necesarios para probar la funcionalidad completa del sistema.

## Configuración Inicial

### 1. Importar la Colección

1. Abrir Postman
2. Hacer clic en "Import"
3. Seleccionar el archivo `JWT_API_Testing.postman_collection.json`
4. La colección se importará con todas las carpetas y requests organizados

### 2. Configurar Variables de Entorno

La colección utiliza las siguientes variables:

- `base_url`: URL base de la API (por defecto: `http://localhost:8080`)
- `jwt_token`: Token JWT obtenido después del login (se actualiza automáticamente)

Para configurar las variables:

1. Crear un nuevo Environment en Postman
2. Agregar las variables mencionadas
3. Seleccionar el environment antes de ejecutar los requests

### 3. Iniciar la Aplicación

Antes de ejecutar los tests, asegúrate de que la aplicación Spring Boot esté ejecutándose:

```bash
cd jwt_project/TF-jwt
mvn spring-boot:run
```

## Estructura de la Colección

### 1. Authentication
- **Login**: Autenticación con usuario y contraseña
- **Register**: Registro de nuevos usuarios

### 2. Users
- Gestión completa de usuarios (CRUD)
- Endpoints protegidos con permisos específicos

### 3. Roles
- Gestión de roles del sistema
- Asignación de permisos a roles

### 4. Permissions
- Gestión de permisos del sistema
- CRUD completo de permisos

### 5. Alumnos
- Gestión completa de alumnos (CRUD)
- Búsquedas por DNI, email, nombre/apellido
- Activación/desactivación de alumnos
- **Nuevos endpoints para relación muchos a muchos:**
  - Inscribir alumno en curso
  - Desinscribir alumno de curso
  - Obtener cursos de un alumno

### 6. Cursos
- Gestión completa de cursos (CRUD)
- Búsquedas por nombre, instructor, rango de fechas
- Activación/desactivación de cursos
- **Nuevos endpoints para relación muchos a muchos:**
  - Obtener alumnos de un curso
  - Agregar alumno a curso
  - Remover alumno de curso

### 7. OAuth2
- Autenticación con Google OAuth2

### 8. Hello World
- Endpoints de prueba (con y sin autenticación)

## Flujo de Testing Recomendado

### Paso 1: Autenticación

1. Ejecutar el request **Authentication > Login** con credenciales válidas
2. Copiar el token JWT de la respuesta
3. Actualizar la variable `jwt_token` en el environment

### Paso 2: Testing de Entidades Básicas

#### Crear un Curso
```json
POST /api/cursos
{
    "nombre": "Java Básico",
    "descripcion": "Curso introductorio de programación en Java",
    "fechaInicio": "2024-03-01",
    "fechaFin": "2024-05-31",
    "duracionHoras": 120,
    "instructor": "María García",
    "activo": true
}
```

#### Crear un Alumno
```json
POST /api/alumnos
{
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "email": "juan.perez@example.com",
    "telefono": "1234567890",
    "fechaNacimiento": "1995-05-15",
    "direccion": "Calle Falsa 123",
    "activo": true
}
```

### Paso 3: Testing de Relación Muchos a Muchos

#### Inscribir Alumno en Curso
```
POST /api/alumnos/{alumnoId}/cursos/{cursoId}
```

#### Verificar Inscripción
```
GET /api/alumnos/{alumnoId}/cursos
GET /api/cursos/{cursoId}/alumnos
```

#### Desinscribir Alumno
```
DELETE /api/alumnos/{alumnoId}/cursos/{cursoId}
```

## Casos de Prueba Específicos

### 1. Relación Muchos a Muchos

#### Caso 1: Inscripción Exitosa
1. Crear un alumno
2. Crear un curso
3. Inscribir el alumno en el curso
4. Verificar que el alumno aparece en la lista de alumnos del curso
5. Verificar que el curso aparece en la lista de cursos del alumno

#### Caso 2: Inscripción Duplicada
1. Inscribir un alumno en un curso
2. Intentar inscribir el mismo alumno en el mismo curso
3. Verificar que se retorna error 400 (Bad Request)

#### Caso 3: Múltiples Inscripciones
1. Crear varios cursos
2. Inscribir un alumno en múltiples cursos
3. Verificar que el alumno aparece en todos los cursos
4. Crear varios alumnos
5. Inscribir múltiples alumnos en un curso
6. Verificar que todos los alumnos aparecen en el curso

### 2. Validaciones de Negocio

#### Caso 1: Alumno Inexistente
1. Intentar inscribir un alumno que no existe
2. Verificar error 400 (Bad Request)

#### Caso 2: Curso Inexistente
1. Intentar inscribir un alumno en un curso que no existe
2. Verificar error 400 (Bad Request)

#### Caso 3: Desinscripción de Alumno No Inscrito
1. Intentar desinscribir un alumno que no está inscrito en el curso
2. Verificar error 400 (Bad Request)

### 3. Permisos y Autorización

#### Caso 1: Sin Token JWT
1. Intentar acceder a cualquier endpoint protegido sin token
2. Verificar error 401 (Unauthorized)

#### Caso 2: Token Inválido
1. Usar un token JWT inválido o expirado
2. Verificar error 401 (Unauthorized)

#### Caso 3: Permisos Insuficientes
1. Usar un token con permisos insuficientes
2. Verificar error 403 (Forbidden)

## Endpoints Nuevos para Relación Muchos a Muchos

### Desde Alumnos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/alumnos/{alumnoId}/cursos/{cursoId}` | Inscribir alumno en curso |
| DELETE | `/api/alumnos/{alumnoId}/cursos/{cursoId}` | Desinscribir alumno de curso |
| GET | `/api/alumnos/{alumnoId}/cursos` | Obtener cursos de un alumno |

### Desde Cursos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cursos/{cursoId}/alumnos` | Obtener alumnos de un curso |
| POST | `/api/cursos/{cursoId}/alumnos/{alumnoId}` | Agregar alumno a curso |
| DELETE | `/api/cursos/{cursoId}/alumnos/{alumnoId}` | Remover alumno de curso |

## Respuestas Esperadas

### Éxito (200/201)
```json
{
    "status": "success",
    "data": { ... }
}
```

### Error de Validación (400)
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 400,
    "error": "Bad Request",
    "message": "El alumno ya está inscrito en este curso",
    "path": "/api/alumnos/1/cursos/1"
}
```

### Error de Autorización (401)
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "Token JWT inválido o expirado",
    "path": "/api/alumnos"
}
```

### Error de Permisos (403)
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 403,
    "error": "Forbidden",
    "message": "Acceso denegado",
    "path": "/api/alumnos"
}
```

## Scripts de Automatización

### Script para Extraer Token JWT

Agregar este script en la pestaña "Tests" del request de Login:

```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    
    var jsonData = pm.response.json();
    pm.expect(jsonData.jwt).to.not.be.undefined;
    
    // Guardar el token en la variable de entorno
    pm.environment.set("jwt_token", jsonData.jwt);
});
```

### Script para Validar Respuestas

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('nombre');
});
```

## Troubleshooting

### Problema: Error 401 en todos los requests
**Solución**: Verificar que el token JWT esté configurado correctamente en las variables de entorno.

### Problema: Error 403 en requests específicos
**Solución**: Verificar que el usuario tenga los permisos necesarios para el endpoint.

### Problema: Error de conexión
**Solución**: Verificar que la aplicación Spring Boot esté ejecutándose en el puerto correcto.

### Problema: Datos no se persisten
**Solución**: Verificar la configuración de la base de datos en `application.properties`.

## Conclusión

Esta colección de Postman proporciona una cobertura completa para testing de la API JWT con las nuevas funcionalidades de relación muchos a muchos entre Alumnos y Cursos. Siguiendo esta guía, podrás realizar testing exhaustivo de todas las funcionalidades del sistema.

