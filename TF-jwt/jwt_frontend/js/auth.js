// Módulo de autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.init();
    }

    // Inicializar el manager de autenticación
    init() {
        this.loadUserFromStorage();
        this.setupTokenRefresh();
    }

    // Cargar usuario desde localStorage
    loadUserFromStorage() {
        try {
            const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
            const userInfo = localStorage.getItem(CONFIG.AUTH.USER_KEY);
            
            if (token && userInfo && isAuthenticated()) {
                this.token = token;
                this.currentUser = JSON.parse(userInfo);
                this.updateUI();
            } else {
                this.clearAuth();
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            this.clearAuth();
        }
    }

    // Configurar renovación automática del token
    setupTokenRefresh() {
        // Verificar el token cada 5 minutos
        setInterval(() => {
            if (!isAuthenticated()) {
                this.handleTokenExpiry();
            }
        }, 5 * 60 * 1000);
    }

    // Manejar expiración del token
    handleTokenExpiry() {
        this.clearAuth();
        showToast('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'warning');
        this.showLogin();
    }

    // Realizar login
    async login(username, password) {
        try {
            showLoading(true);
            
            const response = await fetch(buildUrl(CONFIG.ENDPOINTS.LOGIN), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.jwt) {
                // Guardar token y información del usuario
                this.token = data.jwt;
                this.currentUser = {
                    username: data.username || username,
                    roles: data.roles || [],
                    permissions: data.permissions || []
                };

                // Calcular tiempo de expiración (24 horas por defecto)
                const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);

                // Guardar en localStorage
                localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, this.token);
                localStorage.setItem(CONFIG.AUTH.USER_KEY, JSON.stringify(this.currentUser));
                localStorage.setItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY, expiryTime.toString());

                this.updateUI();
                this.showMainContent();
                
                showToast(CONFIG.MESSAGES.SUCCESS.LOGIN, 'success');
                
                // Cargar datos iniciales
                await this.loadInitialData();
                
                return true;
            } else {
                throw new Error(data.message || CONFIG.MESSAGES.ERROR.LOGIN_FAILED);
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = CONFIG.MESSAGES.ERROR.LOGIN_FAILED;
            
            if (error.message.includes('fetch')) {
                errorMessage = CONFIG.MESSAGES.ERROR.NETWORK_ERROR;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showToast(errorMessage, 'error');
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Realizar login con GitHub
    loginWithGitHub() {
        try {
            // Construir la URL de autorización de GitHub OAuth
            const githubAuthUrl = buildUrl(CONFIG.ENDPOINTS.GITHUB_OAUTH);
            
            // Guardar la URL actual para redirección después del login
            localStorage.setItem('github_redirect_url', window.location.href);
            
            // Redirigir a GitHub OAuth
            window.location.href = githubAuthUrl;
        } catch (error) {
            console.error('Error initiating GitHub login:', error);
            showToast('Error al iniciar sesión con GitHub. Inténtelo nuevamente.', 'error');
        }
    }

    // Manejar el callback de GitHub OAuth
    async handleGitHubCallback() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            
            if (error) {
                throw new Error(`GitHub OAuth error: ${error}`);
            }
            
            if (code) {
                showLoading(true);
                
                // Enviar el código al backend para obtener el token JWT
                const response = await fetch(buildUrl(CONFIG.ENDPOINTS.GITHUB_CALLBACK), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code: code })
                });

                const data = await response.json();

                if (response.ok && data.jwt) {
                    // Guardar token y información del usuario
                    this.token = data.jwt;
                    this.currentUser = {
                        username: data.username || data.login,
                        email: data.email,
                        avatar: data.avatar_url,
                        provider: 'github',
                        roles: data.roles || [],
                        permissions: data.permissions || []
                    };

                    // Calcular tiempo de expiración (24 horas por defecto)
                    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);

                    // Guardar en localStorage
                    localStorage.setItem(CONFIG.AUTH.TOKEN_KEY, this.token);
                    localStorage.setItem(CONFIG.AUTH.USER_KEY, JSON.stringify(this.currentUser));
                    localStorage.setItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY, expiryTime.toString());

                    // Limpiar la URL de los parámetros de OAuth
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);

                    this.updateUI();
                    this.showMainContent();
                    
                    showToast(`¡Bienvenido ${this.currentUser.username}! Has iniciado sesión con GitHub.`, 'success');
                    
                    // Cargar datos iniciales
                    await this.loadInitialData();
                    
                    return true;
                } else {
                    throw new Error(data.message || 'Error al procesar la autenticación con GitHub');
                }
            }
        } catch (error) {
            console.error('GitHub callback error:', error);
            showToast('Error al completar la autenticación con GitHub. Inténtelo nuevamente.', 'error');
            
            // Limpiar la URL de los parámetros de OAuth
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            this.showLogin();
            return false;
        } finally {
            showLoading(false);
        }
    }

    // Realizar logout
    logout() {
        this.clearAuth();
        this.showLogin();
        showToast(CONFIG.MESSAGES.SUCCESS.LOGOUT, 'info');
    }

    // Limpiar datos de autenticación
    clearAuth() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem(CONFIG.AUTH.TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH.USER_KEY);
        localStorage.removeItem(CONFIG.AUTH.TOKEN_EXPIRY_KEY);
    }

    // Actualizar UI con información del usuario
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        
        if (this.currentUser && userInfo && userName) {
            userName.textContent = `Bienvenido, ${this.currentUser.username}`;
            userInfo.style.display = 'flex';
        }
    }

    // Mostrar sección de login
    showLogin() {
        const loginSection = document.getElementById('loginSection');
        const mainContent = document.getElementById('mainContent');
        
        if (loginSection) loginSection.style.display = 'block';
        if (mainContent) mainContent.style.display = 'none';
        
        // Limpiar formulario
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
        
        // Ocultar mensaje de error
        const loginError = document.getElementById('loginError');
        if (loginError) loginError.style.display = 'none';
    }

    // Mostrar contenido principal
    showMainContent() {
        const loginSection = document.getElementById('loginSection');
        const mainContent = document.getElementById('mainContent');
        
        if (loginSection) loginSection.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
    }

    // Cargar datos iniciales después del login
    async loadInitialData() {
        try {
            // Cargar alumnos y cursos para los selectores
            await Promise.all([
                window.alumnosManager?.loadAlumnos(),
                window.cursosManager?.loadCursos()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Verificar si el usuario tiene un permiso específico
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }
        return this.currentUser.permissions.includes(permission);
    }

    // Verificar si el usuario tiene un rol específico
    hasRole(role) {
        if (!this.currentUser || !this.currentUser.roles) {
            return false;
        }
        return this.currentUser.roles.includes(role);
    }

    // Obtener token actual
    getToken() {
        return this.token;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si está autenticado
    isLoggedIn() {
        return this.token && this.currentUser && isAuthenticated();
    }
}

// Crear instancia global del manager de autenticación
const authManager = new AuthManager();

// Funciones globales para el manejo de autenticación
window.login = async function(username, password) {
    return await authManager.login(username, password);
};

window.loginWithGitHub = function() {
    authManager.loginWithGitHub();
};

window.logout = function() {
    authManager.logout();
};

window.isLoggedIn = function() {
    return authManager.isLoggedIn();
};

window.getCurrentUser = function() {
    return authManager.getCurrentUser();
};

window.hasPermission = function(permission) {
    return authManager.hasPermission(permission);
};

window.hasRole = function(role) {
    return authManager.hasRole(role);
};

window.getAuthToken = function() {
    return authManager.getToken();
};

// Event listeners para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es un callback de GitHub OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('error')) {
        authManager.handleGitHubCallback();
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            
            // Validaciones básicas
            if (!username || !password) {
                if (errorDiv) {
                    errorDiv.textContent = 'Por favor, complete todos los campos.';
                    errorDiv.style.display = 'block';
                }
                return;
            }
            
            // Ocultar mensaje de error previo
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
            
            // Intentar login
            const success = await login(username, password);
            
            if (!success && errorDiv) {
                errorDiv.textContent = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
                errorDiv.style.display = 'block';
            }
        });
    }
    
    // Verificar si ya está autenticado al cargar la página
    if (authManager.isLoggedIn()) {
        authManager.showMainContent();
        authManager.loadInitialData();
    } else {
        authManager.showLogin();
    }
});

// Interceptor para manejar respuestas de autenticación
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Si recibimos 401 (Unauthorized), el token probablemente expiró
    if (response.status === 401) {
        authManager.handleTokenExpiry();
    }
    
    return response;
};

// Exportar el manager para uso en otros módulos
window.authManager = authManager;

