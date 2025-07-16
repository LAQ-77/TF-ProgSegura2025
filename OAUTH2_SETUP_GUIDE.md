# Guía de Configuración OAuth2 con GitHub

## Pasos para configurar OAuth2 con GitHub

### 1. Crear una OAuth App en GitHub

1. Ve a tu perfil de GitHub
2. Navega a **Settings** > **Developer settings** > **OAuth Apps**
3. Haz clic en **"New OAuth App"**
4. Completa el formulario:
   - **Application name**: `JWT Sistema Gestión Cursos`
   - **Homepage URL**: `http://localhost:8080`
   - **Application description**: `Sistema de gestión de cursos y alumnos con autenticación JWT y OAuth2`
   - **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
5. Haz clic en **"Register application"**

### 2. Obtener credenciales

Después de crear la aplicación:
1. Copia el **Client ID**
2. Genera un **Client Secret** y cópialo

### 3. Configurar application.properties

Reemplaza las credenciales en `src/main/resources/application.properties`:

```properties
# OAuth2 GitHub Configuration
spring.security.oauth2.client.registration.github.client-id=TU_CLIENT_ID_AQUI
spring.security.oauth2.client.registration.github.client-secret=TU_CLIENT_SECRET_AQUI
spring.security.oauth2.client.registration.github.redirect-uri={baseUrl}/login/oauth2/code/github
spring.security.oauth2.client.registration.github.scope=read:user,user:email
```

### 4. Configurar variables de entorno JWT

También asegúrate de configurar las variables de entorno para JWT:

```properties
# Config de JWT
security.jwt.private.key=3dd76886d75471fcc8422c68a8980ab692d452b29424d6a481b49b2c8e46ce8e
security.jwt.user.generator=CENTRO8-SEC
```

### 5. Iniciar la aplicación

```bash
./mvnw spring-boot:run
```

### 6. Probar la autenticación OAuth2

1. **Autenticación tradicional**: `POST http://localhost:8080/auth/login`
2. **Autenticación OAuth2**: `GET http://localhost:8080/oauth2/authorization/github`

### URLs importantes

- **Inicio OAuth2**: `http://localhost:8080/oauth2/authorization/github`
- **Información usuario OAuth2**: `http://localhost:8080/oauth2/user`
- **Éxito OAuth2**: `http://localhost:8080/oauth2/success`

### Flujo de autenticación

1. Usuario accede a `/oauth2/authorization/github`
2. Es redirigido a GitHub para autorizar
3. GitHub redirige de vuelta con código de autorización
4. El sistema procesa el código y crea/actualiza el usuario
5. Se genera un JWT token
6. El usuario queda autenticado

### Notas importantes

- Los usuarios OAuth2 reciben automáticamente el rol "USER"
- Si el usuario no existe en la base de datos, se crea automáticamente
- El JWT generado tiene una duración de 5 horas
- Los endpoints OAuth2 están excluidos de la validación JWT

### Troubleshooting

**Error: "Usuario no encontrado en la base de datos"**
- Verifica que el servicio `CustomOAuth2UserService` esté creando usuarios correctamente
- Revisa los logs de la aplicación

**Error: "Invalid redirect URI"**
- Verifica que la URL de callback en GitHub coincida exactamente con la configurada
- Asegúrate de usar `http://localhost:8080/login/oauth2/code/github`

**Error de compilación**
- Verifica que todas las dependencias estén correctamente configuradas en `pom.xml`
- Ejecuta `./mvnw clean compile` para limpiar y recompilar

