# Gu�a de Testing con Postman - API JWT con Alumnos y Cursos

## Descripci�n General

Esta gu�a proporciona instrucciones detalladas para realizar testing de la API TF-JWT que incluye las entidades Alumnos y Cursos con una relaci�n de muchos a muchos. La colecci�n de Postman incluye todos los endpoints necesarios para probar la funcionalidad completa del sistema.

## Configuraci�n Inicial

### 1. Importar la Colecci�n

1. Abrir Postman
2. Hacer clic en "Import"
3. Seleccionar el archivo `JWT_API_Testing.postman_collection.json`
4. La colecci�n se importar� con todas las carpetas y requests organizados

### 2. Configurar Variables de Entorno

La colecci�n utiliza las siguientes variables:

- `base_url`: URL base de la API (por defecto: `http://localhost:8080`)
- `jwt_token`: Token JWT obtenido despu�s del login (se actualiza autom�ticamente)

Para configurar las variables:

1. Crear un nuevo Environment en Postman
2. Agregar las variables mencionadas
3. Seleccionar el environment antes de ejecutar los requests

### 3. Iniciar la Aplicaci�n

Antes de ejecutar los tests, aseg�rate de que la aplicaci�n Spring Boot est� ejecut�ndose:

```bash
cd jwt_project/TF-jwt
mvn spring-boot:run
```

## Estructura de la Colecci�n

### 1. Authentication
- **Login**: Autenticaci�n con usuario y contrase�a
- **Register**: Registro de nuevos usuarios

### 2. Users
- Gesti�n completa de usuarios (CRUD)
- Endpoints protegidos con permisos espec�ficos

### 3. Roles
- Gesti�n de roles del sistema
- Asignaci�n de permisos a roles

### 4. Permissions
- Gesti�n de permisos del sistema
- CRUD completo de permisos

### 5. Alumnos
- Gesti�n completa de alumnos (CRUD)
- B�squedas por DNI, email, nombre/apellido
- Activaci�n/desactivaci�n de alumnos
- **Nuevos endpoints para relaci�n muchos a muchos:**
  - Inscribir alumno en curso
  - Desinscribir alumno de curso
  - Obtener cursos de un alumno

### 6. Cursos
- Gesti�n completa de cursos (CRUD)
- B�squedas por nombre, instructor, rango de fechas
- Activaci�n/desactivaci�n de cursos
- **Nuevos endpoints para relaci�n muchos a muchos:**
  - Obtener alumnos de un curso
  - Agregar alumno a curso
  - Remover alumno de curso

### 7. OAuth2
- Autenticaci�n con Google OAuth2

### 8. Hello World
- Endpoints de prueba (con y sin autenticaci�n)

## Flujo de Testing Recomendado

### Paso 1: Autenticaci�n

1. Ejecutar el request **Authentication > Login** con credenciales v�lidas
2. Copiar el token JWT de la respuesta
3. Actualizar la variable `jwt_token` en el environment

### Paso 2: Testing de Entidades B�sicas

#### Crear un Curso
```json
POST /api/cursos
{
    "nombre": "Java B�sico",
    "descripcion": "Curso introductorio de programaci�n en Java",
    "fechaInicio": "2024-03-01",
    "fechaFin": "2024-05-31",
    "duracionHoras": 120,
    "instructor": "Mar�a Garc�a",
    "activo": true
}
```

#### Crear un Alumno
```json
POST /api/alumnos
{
    "nombre": "Juan",
    "apellido": "P�rez",
    "dni": "12345678",
    "email": "juan.perez@example.com",
    "telefono": "1234567890",
    "fechaNacimiento": "1995-05-15",
    "direccion": "Calle Falsa 123",
    "activo": true
}
```

### Paso 3: Testing de Relaci�n Muchos a Muchos

#### Inscribir Alumno en Curso
```
POST /api/alumnos/{alumnoId}/cursos/{cursoId}
```

#### Verificar Inscripci�n
```
GET /api/alumnos/{alumnoId}/cursos
GET /api/cursos/{cursoId}/alumnos
```

#### Desinscribir Alumno
```
DELETE /api/alumnos/{alumnoId}/cursos/{cursoId}
```

## Casos de Prueba Espec�ficos

### 1. Relaci�n Muchos a Muchos

#### Caso 1: Inscripci�n Exitosa
1. Crear un alumno
2. Crear un curso
3. Inscribir el alumno en el curso
4. Verificar que el alumno aparece en la lista de alumnos del curso
5. Verificar que el curso aparece en la lista de cursos del alumno

#### Caso 2: Inscripci�n Duplicada
1. Inscribir un alumno en un curso
2. Intentar inscribir el mismo alumno en el mismo curso
3. Verificar que se retorna error 400 (Bad Request)

#### Caso 3: M�ltiples Inscripciones
1. Crear varios cursos
2. Inscribir un alumno en m�ltiples cursos
3. Verificar que el alumno aparece en todos los cursos
4. Crear varios alumnos
5. Inscribir m�ltiples alumnos en un curso
6. Verificar que todos los alumnos aparecen en el curso

### 2. Validaciones de Negocio

#### Caso 1: Alumno Inexistente
1. Intentar inscribir un alumno que no existe
2. Verificar error 400 (Bad Request)

#### Caso 2: Curso Inexistente
1. Intentar inscribir un alumno en un curso que no existe
2. Verificar error 400 (Bad Request)

#### Caso 3: Desinscripci�n de Alumno No Inscrito
1. Intentar desinscribir un alumno que no est� inscrito en el curso
2. Verificar error 400 (Bad Request)

### 3. Permisos y Autorizaci�n

#### Caso 1: Sin Token JWT
1. Intentar acceder a cualquier endpoint protegido sin token
2. Verificar error 401 (Unauthorized)

#### Caso 2: Token Inv�lido
1. Usar un token JWT inv�lido o expirado
2. Verificar error 401 (Unauthorized)

#### Caso 3: Permisos Insuficientes
1. Usar un token con permisos insuficientes
2. Verificar error 403 (Forbidden)

## Endpoints Nuevos para Relaci�n Muchos a Muchos

### Desde Alumnos

| M�todo | Endpoint | Descripci�n |
|--------|----------|-------------|
| POST | `/api/alumnos/{alumnoId}/cursos/{cursoId}` | Inscribir alumno en curso |
| DELETE | `/api/alumnos/{alumnoId}/cursos/{cursoId}` | Desinscribir alumno de curso |
| GET | `/api/alumnos/{alumnoId}/cursos` | Obtener cursos de un alumno |

### Desde Cursos

| M�todo | Endpoint | Descripci�n |
|--------|----------|-------------|
| GET | `/api/cursos/{cursoId}/alumnos` | Obtener alumnos de un curso |
| POST | `/api/cursos/{cursoId}/alumnos/{alumnoId}` | Agregar alumno a curso |
| DELETE | `/api/cursos/{cursoId}/alumnos/{alumnoId}` | Remover alumno de curso |

## Respuestas Esperadas

### �xito (200/201)
```json
{
    "status": "success",
    "data": { ... }
}
```

### Error de Validaci�n (400)
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 400,
    "error": "Bad Request",
    "message": "El alumno ya est� inscrito en este curso",
    "path": "/api/alumnos/1/cursos/1"
}
```

### Error de Autorizaci�n (401)
```json
{
    "timestamp": "2024-01-15T10:30:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "Token JWT inv�lido o expirado",
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

## Scripts de Automatizaci�n

### Script para Extraer Token JWT

Agregar este script en la pesta�a "Tests" del request de Login:

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
**Soluci�n**: Verificar que el token JWT est� configurado correctamente en las variables de entorno.

### Problema: Error 403 en requests espec�ficos
**Soluci�n**: Verificar que el usuario tenga los permisos necesarios para el endpoint.

### Problema: Error de conexi�n
**Soluci�n**: Verificar que la aplicaci�n Spring Boot est� ejecut�ndose en el puerto correcto.

### Problema: Datos no se persisten
**Soluci�n**: Verificar la configuraci�n de la base de datos en `application.properties`.

## Conclusi�n

Esta colecci�n de Postman proporciona una cobertura completa para testing de la API JWT con las nuevas funcionalidades de relaci�n muchos a muchos entre Alumnos y Cursos. Siguiendo esta gu�a, podr�s realizar testing exhaustivo de todas las funcionalidades del sistema.

