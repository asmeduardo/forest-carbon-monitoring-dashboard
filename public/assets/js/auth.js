/**
 * Authentication Service
 */
export class AuthService {
    constructor() {
        // Elements
        this.elements = {
            loginForm: document.getElementById('loginForm'),
            loginFormContainer: document.getElementById('loginFormContainer'),
            logoutSection: document.getElementById('logoutSection'),
            welcomeUser: document.getElementById('welcomeUser'),
            logoutBtn: document.getElementById('logoutBtn'),
            dataEntry: document.querySelector('.data-entry'),
            passwordResetForm: document.getElementById('senhaResetContainer'),
            newPasswordInput: document.getElementById('novaSenha'),
            savePasswordBtn: document.querySelector('#senhaResetContainer button')
        };
        
        // Current user ID for password reset
        this.resetUserId = null;
        
        // Initialize authentication
        this.init();
    }
    
    /**
     * Initialize authentication
     */
    init() {
        // Set up event listeners
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        if (this.elements.savePasswordBtn) {
            this.elements.savePasswordBtn.addEventListener('click', this.handlePasswordReset.bind(this));
        }
        
        // Check saved authentication
        this.checkSavedAuth();
    }
    
    /**
     * Check if user is authenticated based on saved token
     */
    isAuthenticated() {
        return !!this.getToken();
    }
    
    /**
     * Get authentication token from localStorage
     */
    getToken() {
        return localStorage.getItem('authToken');
    }
    
    /**
     * Get username from localStorage
     */
    getUsername() {
        return localStorage.getItem('username');
    }
    
    /**
     * Check for saved authentication in localStorage
     */
    checkSavedAuth() {
        const token = this.getToken();
        const username = this.getUsername();
        
        if (token && username) {
            this.toggleLoginUI(true, username);
        } else {
            this.toggleLoginUI(false);
        }
    }
    
    /**
     * Toggle login/logout UI elements
     */
    toggleLoginUI(isLoggedIn, username = '') {
        if (this.elements.dataEntry) {
            this.elements.dataEntry.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        if (this.elements.loginFormContainer) {
            this.elements.loginFormContainer.style.display = isLoggedIn ? 'none' : 'block';
        }
        
        if (this.elements.logoutSection) {
            this.elements.logoutSection.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        if (this.elements.welcomeUser) {
            this.elements.welcomeUser.textContent = `Bem-vindo, ${username}`;
        }
    }
    
    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, senha: password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                if (result.first_login) {
                    // Show password reset form
                    this.resetUserId = result.user_id;
                    this.showPasswordResetForm();
                } else {
                    // Save authentication data
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('username', username);
                    
                    // Update UI
                    this.toggleLoginUI(true, username);
                }
            } else {
                alert(result.error || 'Erro no login');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Erro ao processar o login. Tente novamente.');
        }
    }
    
    /**
     * Handle logout button click
     */
    async handleLogout() {
        try {
            // Call logout API
            await fetch('/api/user/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            // Clear local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            
            // Update UI
            this.toggleLoginUI(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    /**
     * Show password reset form
     */
    showPasswordResetForm() {
        if (this.elements.passwordResetForm) {
            this.elements.passwordResetForm.style.display = 'block';
        }
    }
    
    /**
     * Hide password reset form
     */
    hidePasswordResetForm() {
        if (this.elements.passwordResetForm) {
            this.elements.passwordResetForm.style.display = 'none';
        }
    }
    
    /**
     * Handle password reset
     */
    async handlePasswordReset() {
        if (!this.resetUserId) {
            alert('Erro: ID de usuário não definido para redefinição de senha.');
            return;
        }
        
        const newPassword = this.elements.newPasswordInput.value;
        
        if (!newPassword || newPassword.length < 8) {
            alert('A senha deve ter pelo menos 8 caracteres.');
            return;
        }
        
        try {
            const response = await fetch('/api/user/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: this.resetUserId,
                    nova_senha: newPassword
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Senha atualizada com sucesso! Faça login com sua nova senha.');
                this.hidePasswordResetForm();
                this.resetUserId = null;
            } else {
                alert(result.error || 'Erro ao redefinir senha');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Erro ao processar a redefinição de senha. Tente novamente.');
        }
    }
}