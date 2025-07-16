# Guía para la Creación de Usuarios y Roles en la API REST con Postman

Esta guía detallada le proporcionará las instrucciones paso a paso para crear usuarios con diferentes roles dentro de su API REST, utilizando la colección de Postman previamente suministrada. La correcta configuración y el entendimiento de este proceso son fundamentales para realizar pruebas exhaustivas y asegurar la funcionalidad de su sistema de autenticación y autorización.

## 1. Configuración Inicial de Postman y Obtención del Token de Administrador

Antes de proceder con la creación de usuarios, es imperativo configurar su entorno de Postman y obtener un token de autenticación válido para un usuario con privilegios de administrador. Este token será utilizado en todas las solicitudes subsiguientes que requieran autorización.

### 1.1. Importar la Colección de Postman

Si aún no lo ha hecho, el primer paso consiste en importar la colección de Postman `JWT_API_Testing.postman_collection.json` en su aplicación Postman. Puede hacerlo siguiendo estos pasos:

1.  Abra Postman.
2.  Haga clic en el botón `Import` en la esquina superior izquierda.
3.  Seleccione la opción `Upload Files` y navegue hasta la ubicación donde guardó el archivo `JWT_API_Testing.postman_collection.json`.
4.  Confirme la importación. Verá una nueva colección llamada `JWT API Testing` en su barra lateral izquierda.

### 1.2. Configurar las Variables de Entorno

La colección de Postman utiliza variables de entorno para facilitar la gestión de la URL base de su API. Esto le permite cambiar la dirección del servidor sin modificar cada solicitud individualmente.

1.  En Postman, haga clic en el icono de `Environment Quick Look` (el ojo) en la esquina superior derecha, cerca del selector de entorno.
2.  Seleccione `Manage Environments`.
3.  Haga clic en `Add` para crear un nuevo entorno o seleccione el entorno `Local` si ya existe.
4.  Defina una variable llamada `baseUrl` con el valor de la URL base de su API. Por ejemplo, si su API se ejecuta localmente en el puerto 8080, el valor sería `http://localhost:8080/api`.

    | Variable | Valor Inicial (Ejemplo)    |
    | :------- | :------------------------- |
    | `baseUrl`  | `http://localhost:8080/api` |

5.  Guarde el entorno y asegúrese de seleccionarlo en el selector de entorno de Postman.

### 1.3. Obtener el Token de Administrador

Para crear nuevos usuarios y asignar roles, necesitará un token JWT de un usuario con rol de administrador. Este token se obtiene a través del endpoint de login.

1.  Dentro de la colección `JWT API Testing`, navegue hasta la carpeta `Authentication`.
2.  Seleccione la solicitud `Login` (POST).
3.  En la pestaña `Body`, asegúrese de que el tipo de cuerpo sea `raw` y el formato sea `JSON`.
4.  Ingrese las credenciales de un usuario administrador existente en el cuerpo de la solicitud. Por ejemplo:

    ```json
    {
        "username": "admin",
        "password": "1234"
    }
    ```

5.  Haga clic en `Send`.
6.  La respuesta exitosa contendrá un objeto JSON con el token JWT. Copie el valor del token (la cadena larga después de `Bearer `).

    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiJ9..."
    }
    ```

7.  **Almacenar el Token**: Para facilitar su uso, puede almacenar este token como una variable de entorno en Postman. En la pestaña `Tests` de la solicitud `Login`, puede agregar el siguiente script para extraer automáticamente el token y guardarlo como una variable de entorno llamada `admin_token`:

    ```javascript
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.token);
    ```

    Después de ejecutar la solicitud `Login` con este script, el token estará disponible como `{{admin_token}}` en sus otras solicitudes.

Con el token de administrador obtenido y configurado, está listo para proceder con la creación de usuarios con diferentes roles.



## 2. Creación de Usuarios con Diferentes Roles

Una vez que ha obtenido el token de administrador, puede proceder a la creación de usuarios y la asignación de roles. Su API REST probablemente tiene un endpoint específico para la gestión de usuarios, y es crucial entender cómo interactuar con él para asignar los roles correctos.

### 2.1. Entender los Roles Disponibles

Antes de crear usuarios, es importante conocer los roles que su sistema soporta. Generalmente, estos roles se definen en el backend y controlan los permisos de acceso a diferentes funcionalidades. Para este ejemplo, asumiremos los siguientes roles comunes:

-   **ADMIN**: Acceso completo a todas las funcionalidades del sistema, incluyendo la gestión de usuarios y roles.
-   **USER**: Acceso a funcionalidades básicas, como la gestión de su propio perfil o la visualización de datos permitidos.
-   **ALUMNO**: Rol específico para la entidad Alumno, con permisos relacionados a sus cursos y datos personales.
-   **PROFESOR**: Rol específico para la entidad Profesor (si existiera), con permisos para gestionar cursos o alumnos a su cargo.

### 2.2. Crear un Usuario Básico

Para crear un nuevo usuario, utilizará el endpoint de registro o creación de usuarios. Este endpoint generalmente requiere un nombre de usuario, una contraseña y, opcionalmente, una lista de roles.

1.  Dentro de la colección `JWT API Testing`, navegue hasta la carpeta `User Management` (o similar).
2.  Seleccione la solicitud `Register User` (POST) o `Create User`.
3.  En la pestaña `Headers`, asegúrese de que haya un header `Authorization` con el valor `Bearer {{admin_token}}`. Si utilizó el script de Postman en el paso anterior, `{{admin_token}}` se resolverá automáticamente al token que obtuvo.
4.  En la pestaña `Body`, asegúrese de que el tipo de cuerpo sea `raw` y el formato sea `JSON`.
5.  Ingrese los detalles del nuevo usuario en el cuerpo de la solicitud. Para un usuario básico sin roles específicos (o con un rol por defecto si su API lo asigna automáticamente), podría ser:

    ```json
    {
        "username": "usuario_prueba",
        "password": "password123",
        "email": "usuario.prueba@example.com"
    }
    ```

6.  Haga clic en `Send`.
7.  Verifique la respuesta para confirmar que el usuario ha sido creado exitosamente. La respuesta podría incluir el ID del nuevo usuario o un mensaje de confirmación.

### 2.3. Crear un Usuario con Rol Específico (ADMIN)

Para crear un usuario con el rol `ADMIN`, deberá incluir el rol en la solicitud de creación de usuario. La forma en que se especifican los roles puede variar según la implementación de su API (por ejemplo, un array de strings, un ID de rol, etc.). Asumiremos que se espera un array de nombres de roles.

1.  Duplique la solicitud `Register User` o `Create User` para crear una nueva.
2.  Modifique el cuerpo de la solicitud para incluir el rol `ADMIN`:

    ```json
    {
        "username": "admin_test",
        "password": "adminpass",
        "email": "admin.test@example.com",
        "roles": ["ADMIN"]
    }
    ```

3.  Asegúrese de que el header `Authorization` siga siendo `Bearer {{admin_token}}`.
4.  Haga clic en `Send`.
5.  Confirme la creación exitosa del usuario `admin_test` con el rol `ADMIN`.

### 2.4. Crear un Usuario con Rol Específico (USER)

De manera similar, puede crear un usuario con el rol `USER`.

1.  Duplique la solicitud anterior.
2.  Modifique el cuerpo de la solicitud para incluir el rol `USER`:

    ```json
    {
        "username": "user_test",
        "password": "userpass",
        "email": "user.test@example.com",
        "roles": ["USER"]
    }
    ```

3.  Asegúrese de que el header `Authorization` siga siendo `Bearer {{admin_token}}`.
4.  Haga clic en `Send`.
5.  Confirme la creación exitosa del usuario `user_test` con el rol `USER`.

### 2.5. Crear un Usuario con Rol Específico (ALUMNO)

Para la entidad `Alumno`, si su sistema maneja un rol específico para ellos, el proceso es el mismo.

1.  Duplique la solicitud anterior.
2.  Modifique el cuerpo de la solicitud para incluir el rol `ALUMNO`:

    ```json
    {
        "username": "alumno_test",
        "password": "alumnopass",
        "email": "alumno.test@example.com",
        "roles": ["ALUMNO"]
    }
    ```

3.  Asegúrese de que el header `Authorization` siga siendo `Bearer {{admin_token}}`.
4.  Haga clic en `Send`.
5.  Confirme la creación exitosa del usuario `alumno_test` con el rol `ALUMNO`.

### 2.6. Asignar Múltiples Roles a un Usuario

Si su API permite que un usuario tenga múltiples roles, simplemente incluya todos los roles deseados en el array `roles`.

1.  Duplique la solicitud de creación de usuario.
2.  Modifique el cuerpo de la solicitud para incluir múltiples roles:

    ```json
    {
        "username": "multi_role_user",
        "password": "multipass",
        "email": "multi.role@example.com",
        "roles": ["USER", "ALUMNO"]
    }
    ```

3.  Asegúrese de que el header `Authorization` siga siendo `Bearer {{admin_token}}`.
4.  Haga clic en `Send`.
5.  Confirme la creación exitosa del usuario `multi_role_user` con los roles `USER` y `ALUMNO`.

**Nota Importante**: La disponibilidad y los nombres exactos de los roles (`ADMIN`, `USER`, `ALUMNO`, etc.) dependen de la implementación de su backend. Asegúrese de consultar la documentación de su API o el código fuente para verificar los roles válidos.



## 3. Resumen y Consejos Adicionales para las Pruebas

La creación de usuarios con roles específicos es un paso fundamental para validar la lógica de autorización de su API. A continuación, se presentan un resumen de los pasos clave y algunos consejos adicionales para optimizar sus pruebas.

### 3.1. Flujo de Trabajo Recomendado

1.  **Iniciar Sesión como Administrador**: Siempre comience obteniendo un token de administrador válido. Este token es su "llave maestra" para la gestión de usuarios y roles.
2.  **Crear Usuarios con Roles Específicos**: Utilice el token de administrador para crear usuarios para cada rol que desee probar (ADMIN, USER, ALUMNO, etc.). Asegúrese de que cada usuario tenga credenciales únicas y fáciles de recordar para las pruebas.
3.  **Probar Permisos por Rol**: Una vez creados los usuarios, inicie sesión con cada uno de ellos (obteniendo un nuevo token para cada rol) y pruebe los endpoints de su API. Verifique que cada rol solo pueda acceder a los recursos y funcionalidades para los que tiene permiso.
    -   Por ejemplo, un usuario con rol `USER` no debería poder acceder a los endpoints de administración de usuarios.
    -   Un usuario con rol `ALUMNO` debería poder ver sus cursos, pero no modificar los cursos de otros alumnos.
4.  **Casos de Borde**: Pruebe escenarios donde los permisos se superponen o donde un usuario intenta acceder a un recurso sin la autorización adecuada. Asegúrese de que la API devuelva los códigos de estado HTTP correctos (por ejemplo, `401 Unauthorized` o `403 Forbidden`).

### 3.2. Gestión de Tokens en Postman

Postman ofrece excelentes funcionalidades para gestionar tokens JWT, lo que simplifica enormemente el proceso de prueba:

-   **Variables de Entorno**: Como se mencionó, almacenar el token en una variable de entorno (`{{admin_token}}`, `{{user_token}}`, etc.) es la forma más eficiente de reutilizarlo en múltiples solicitudes.
-   **Scripts de Pruebas**: Utilice la pestaña `Tests` en Postman para escribir scripts que automáticamente extraigan el token de la respuesta de login y lo guarden en una variable de entorno. Esto automatiza el proceso y reduce errores manuales.

    ```javascript
    // Ejemplo de script para guardar el token de un usuario normal
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("user_token", jsonData.token);
    }
    ```

-   **Pre-request Scripts**: Para solicitudes que requieren autenticación, puede usar un `Pre-request Script` para configurar automáticamente el header `Authorization` con el token adecuado.

    ```javascript
    // Ejemplo de Pre-request Script para usar el token de usuario
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get("user_token")
    });
    ```

### 3.3. Consideraciones de Seguridad

Al realizar pruebas de autorización, tenga en cuenta los siguientes puntos:

-   **Exposición de Datos**: Nunca exponga credenciales o tokens sensibles en logs o en entornos de producción.
-   **Rotación de Tokens**: En un entorno real, los tokens JWT tienen una vida útil limitada. Asegúrese de que su frontend y sus pruebas manejen la expiración y la renovación de tokens adecuadamente.
-   **Validación del Lado del Servidor**: Aunque el frontend pueda ocultar ciertas funcionalidades, la validación de permisos siempre debe realizarse en el lado del servidor para evitar accesos no autorizados.

### 3.4. Pruebas Adicionales

Considere realizar las siguientes pruebas adicionales:

-   **Creación de Usuarios Duplicados**: Intente crear un usuario con un nombre de usuario o correo electrónico ya existente para verificar que la API maneje correctamente estos casos (por ejemplo, devolviendo un `409 Conflict`).
-   **Asignación de Roles Inválidos**: Intente asignar un rol que no existe en su sistema para verificar la respuesta de la API.
-   **Eliminación de Usuarios**: Pruebe la funcionalidad de eliminación de usuarios y asegúrese de que los permisos asociados también se eliminen o se manejen correctamente.

Siguiendo estos pasos y consejos, podrá realizar pruebas exhaustivas de la gestión de usuarios y roles en su API REST, asegurando la robustez y seguridad de su sistema de autenticación y autorización.

