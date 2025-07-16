// Archivo de configuración de ejemplo para GitHub OAuth
// Copie este archivo como 'config.github.js' y configure sus valores

const GITHUB_CONFIG = {
    // Configuración de GitHub OAuth
    GITHUB: {
        // ID de la aplicación GitHub OAuth (obténgalo de GitHub Developer Settings)
        CLIENT_ID: 'your_github_client_id_here',
        
        // URL de redirección después del login (debe coincidir con la configurada en GitHub)
        REDIRECT_URI: 'http://localhost:8080/auth/github/callback',
        
        // Scopes solicitados a GitHub
        SCOPES: ['user:email', 'read:user'],
        
        // URL de autorización de GitHub
        AUTHORIZATION_URL: 'https://github.com/login/oauth/authorize'
    }
};

// Instrucciones para configurar GitHub OAuth:
// 
// 1. Vaya a GitHub.com y acceda a su cuenta
// 2. Navegue a Settings > Developer settings > OAuth Apps
// 3. Haga clic en "New OAuth App"
// 4. Complete el formulario:
//    - Application name: Nombre de su aplicación
//    - Homepage URL: URL de su aplicación (ej: http://localhost:8080)
//    - Authorization callback URL: http://localhost:8080/auth/github/callback
// 5. Haga clic en "Register application"
// 6. Copie el "Client ID" y reemplace 'your_github_client_id_here' arriba
// 7. Configure el backend con el "Client Secret" (NO lo incluya en el frontend)
// 8. Asegúrese de que la REDIRECT_URI coincida con la configurada en GitHub
//
// Nota: Para producción, cambie las URLs a su dominio real

// Exportar configuración
window.GITHUB_CONFIG = GITHUB_CONFIG;

