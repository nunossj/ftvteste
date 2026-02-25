// Estado Global da Aplicação
const AppState = {
    user: null,
    currentPage: 'home'
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    initEventListeners();
});

// Verificar sessão
async function checkSession() {
    try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.authenticated) {
            AppState.user = data.user;
            showMainScreen();
            loadPage('home');
        } else {
            showAuthScreen();
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        showAuthScreen();
    }
}

// Mostrar tela de autenticação
function showAuthScreen() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('main-screen').classList.remove('active');
}

// Mostrar tela principal
function showMainScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    updateUIPermissions();
}

// Atualizar permissões da UI
function updateUIPermissions() {
    const role = AppState.user?.role;
    const userType = AppState.user?.user_type;

    // Mostrar/ocultar elementos baseado nas permissões
    if (role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.journalist-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.club-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.player-only').forEach(el => el.style.display = '');
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');

        if (role === 'jornalista') {
            document.querySelectorAll('.journalist-only').forEach(el => el.style.display = '');
        }

        if (userType === 'Time' || role === 'clube') {
            document.querySelectorAll('.club-only').forEach(el => el.style.display = '');
        }

        if (userType === 'Jogador' || role === 'jogador') {
            document.querySelectorAll('.player-only').forEach(el => el.style.display = '');
        }
    }
}

// ========== EVENT LISTENERS ==========
function initEventListeners() {
    // Autenticação
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('forgotForm').addEventListener('submit', handleForgotPassword);

    // Navegação entre forms
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('register');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });

    document.getElementById('show-forgot')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('forgot');
    });

    document.getElementById('back-to-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });

    // Tipo de cadastro
    document.getElementById('register-type')?.addEventListener('change', (e) => {
        const otherField = document.getElementById('register-other');
        if (e.target.value === 'Outros') {
            otherField.style.display = 'block';
            otherField.required = true;
        } else {
            otherField.style.display = 'none';
            otherField.required = false;
        }
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Navegação do menu
    document.querySelectorAll('#main-menu a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            loadPage(page);
        });
    });

    // Botões de adicionar
    document.getElementById('add-club-btn')?.addEventListener('click', () => showClubModal());
    document.getElementById('add-player-btn')?.addEventListener('click', () => showPlayerModal());
    document.getElementById('add-news-btn')?.addEventListener('click', () => showNewsModal());
    document.getElementById('add-match-btn')?.addEventListener('click', () => showMatchModal());
    document.getElementById('add-championship-btn')?.addEventListener('click', () => showChampionshipModal());

    // Filtros
    document.getElementById('filter-players-btn')?.addEventListener('click', loadPlayers);
    document.getElementById('filter-matches-btn')?.addEventListener('click', loadMatches);

    // Chat
    document.getElementById('send-message-btn')?.addEventListener('click', sendChatMessage);
    document.getElementById('chat-message-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            switchAdminTab(tab);
        });
    });
}

// ========== AUTENTICAÇÃO ==========
function switchAuthForm(formName) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`${formName}-form`).classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();

    const name = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });

        const data = await response.json();

        if (response.ok) {
            AppState.user = data.user;
            showMainScreen();
            loadPage('home');
            showAlert('Login realizado com sucesso!', 'success');
        } else {
            showAlert(data.error || 'Erro ao fazer login', 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showAlert('Erro ao fazer login', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('register-name').value;
    const user_type = document.getElementById('register-type').value;
    const other_description = document.getElementById('register-other').value;
    const password = document.getElementById('register-password').value;
    const confirm_password = document.getElementById('register-confirm').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, user_type, other_description, password, confirm_password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(data.message, 'success');

            if (data.isAdmin) {
                // Fazer login automaticamente se for admin
                setTimeout(() => {
                    document.getElementById('login-name').value = name;
                    document.getElementById('login-password').value = password;
                    switchAuthForm('login');
                }, 2000);
            } else {
                setTimeout(() => switchAuthForm('login'), 3000);
            }
        } else {
            showAlert(data.error || 'Erro ao registrar', 'error');
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        showAlert('Erro ao registrar', 'error');
    }
}

let resetUserId = null;

async function handleForgotPassword(e) {
    e.preventDefault();

    const code = document.getElementById('forgot-code').value;
    const surnameOptions = document.getElementById('surname-options');
    const resetFields = document.getElementById('reset-password-fields');
    const submitBtn = document.getElementById('forgot-submit-btn');

    // Se estamos no estágio de redefinir senha
    if (resetUserId) {
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-confirm').value;

        try {
            const response = await fetch('/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: resetUserId, newPassword, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Senha redefinida com sucesso!', 'success');
                resetUserId = null;
                setTimeout(() => switchAuthForm('login'), 2000);
            } else {
                showAlert(data.error || 'Erro ao redefinir senha', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            showAlert('Erro ao redefinir senha', 'error');
        }
        return;
    }

    // Validar código
    try {
        const response = await fetch('/api/auth/forgot-password/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (response.ok && data.options) {
            // Mostrar opções de sobrenome
            const buttonsContainer = document.getElementById('surname-buttons');
            buttonsContainer.innerHTML = '';

            data.options.forEach(surname => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-secondary';
                btn.textContent = surname;
                btn.addEventListener('click', () => validateSurname(code, surname));
                buttonsContainer.appendChild(btn);
            });

            surnameOptions.style.display = 'block';
            submitBtn.style.display = 'none';
        } else {
            showAlert(data.error || 'Código inválido', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao validar código', 'error');
    }
}

async function validateSurname(code, surname) {
    try {
        const response = await fetch('/api/auth/forgot-password/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, surname })
        });

        const data = await response.json();

        if (response.ok && data.validated) {
            resetUserId = data.userId;
            document.getElementById('surname-options').style.display = 'none';
            document.getElementById('reset-password-fields').style.display = 'block';
            document.getElementById('forgot-submit-btn').textContent = 'Redefinir Senha';
            document.getElementById('forgot-submit-btn').style.display = 'block';
            showAlert('Sobrenome correto! Agora defina sua nova senha.', 'success');
        } else {
            showAlert('Sobrenome incorreto. Tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao validar sobrenome', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        AppState.user = null;
        showAuthScreen();
        switchAuthForm('login');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// ========== NAVEGAÇÃO DE PÁGINAS ==========
function loadPage(pageName) {
    AppState.currentPage = pageName;

    // Ocultar todas as páginas
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    // Mostrar página selecionada
    document.getElementById(`${pageName}-page`).classList.add('active');

    // Atualizar menu ativo
    document.querySelectorAll('#main-menu a').forEach(link => {
        link.style.background = '';
        link.style.color = '';
    });
    document.querySelector(`#main-menu a[data-page="${pageName}"]`)?.style.setProperty('background', 'var(--light-blue)');

    // Carregar dados da página
    switch(pageName) {
        case 'home':
            loadFeaturedNews();
            break;
        case 'clubs':
            loadClubs();
            break;
        case 'players':
            loadPlayers();
            break;
        case 'news':
            loadAllNews();
            break;
        case 'matches':
            loadMatches();
            loadClubsForFilter();
            break;
        case 'championships':
            loadChampionships();
            break;
        case 'contact':
            loadChat();
            break;
        case 'admin':
            if (AppState.user?.role === 'admin') {
                loadPendingUsers();
            }
            break;
    }
}

// Continua no próximo comentário...
