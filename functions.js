// Este arquivo contém as funções auxiliares
// Incluir no index.html antes de app.js

// ========== FUNÇÕES DE CARREGAMENTO DE DADOS ==========

async function loadFeaturedNews() {
    try {
        const response = await fetch('/api/news?featured=true');
        const news = await response.json();

        const container = document.getElementById('featured-news');
        container.innerHTML = '';

        if (news.length === 0) {
            container.innerHTML = '<p>Nenhuma notícia em destaque.</p>';
            return;
        }

        news.forEach(item => {
            const card = createNewsCard(item);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
    }
}

async function loadAllNews() {
    try {
        const response = await fetch('/api/news');
        const news = await response.json();

        const container = document.getElementById('all-news');
        container.innerHTML = '';

        if (news.length === 0) {
            container.innerHTML = '<p>Nenhuma notícia disponível.</p>';
            return;
        }

        news.forEach(item => {
            const card = createNewsCard(item);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
    }
}

async function loadClubs() {
    try {
        const response = await fetch('/api/clubs');
        const clubs = await response.json();

        const container = document.getElementById('clubs-list');
        container.innerHTML = '';

        if (clubs.length === 0) {
            container.innerHTML = '<p>Nenhum clube cadastrado.</p>';
            return;
        }

        clubs.forEach(club => {
            const card = createClubCard(club);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar clubes:', error);
    }
}

async function loadPlayers() {
    try {
        const name = document.getElementById('filter-player-name')?.value || '';
        const club = document.getElementById('filter-player-club')?.value || '';

        const params = new URLSearchParams();
        if (name) params.append('name', name);
        if (club) params.append('club', club);

        const response = await fetch(`/api/players?${params}`);
        const players = await response.json();

        const container = document.getElementById('players-list');
        container.innerHTML = '';

        if (players.length === 0) {
            container.innerHTML = '<p>Nenhum jogador encontrado.</p>';
            return;
        }

        players.forEach(player => {
            const card = createPlayerCard(player);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
    }
}

async function loadMatches() {
    try {
        const date = document.getElementById('filter-match-date')?.value || '';
        const clubId = document.getElementById('filter-match-club')?.value || '';

        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (clubId) params.append('club_id', clubId);

        const response = await fetch(`/api/matches?${params}`);
        const matches = await response.json();

        const container = document.getElementById('matches-list');
        container.innerHTML = '';

        if (matches.length === 0) {
            container.innerHTML = '<p>Nenhuma partida encontrada.</p>';
            return;
        }

        matches.forEach(match => {
            const card = createMatchCard(match);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar partidas:', error);
    }
}

async function loadChampionships() {
    try {
        const response = await fetch('/api/championships');
        const championships = await response.json();

        const container = document.getElementById('championships-list');
        container.innerHTML = '';

        if (championships.length === 0) {
            container.innerHTML = '<p>Nenhum campeonato cadastrado.</p>';
            return;
        }

        for (const championship of championships) {
            const card = await createChampionshipCard(championship);
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Erro ao carregar campeonatos:', error);
    }
}

async function loadChat() {
    try {
        const response = await fetch('/api/chat');
        const messages = await response.json();

        const container = document.getElementById('chat-messages');
        container.innerHTML = '';

        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message';
            msgDiv.innerHTML = `
                <strong>${msg.user_name}</strong>
                <p>${msg.message}</p>
                <small>${formatDate(msg.created_at)}</small>
            `;
            container.appendChild(msgDiv);
        });

        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Erro ao carregar chat:', error);
    }
}

async function loadPendingUsers() {
    try {
        const response = await fetch('/api/users/pending');
        const users = await response.json();

        const container = document.getElementById('pending-users-list');
        container.innerHTML = '';

        if (users.length === 0) {
            container.innerHTML = '<p>Nenhum usuário pendente.</p>';
            return;
        }

        users.forEach(user => {
            const card = createPendingUserCard(user);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários pendentes:', error);
    }
}

async function loadAllUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();

        const container = document.getElementById('all-users-list');
        container.innerHTML = '';

        users.forEach(user => {
            const card = createUserManagementCard(user);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

async function loadClubsForFilter() {
    try {
        const response = await fetch('/api/clubs');
        const clubs = await response.json();

        const select = document.getElementById('filter-match-club');
        select.innerHTML = '<option value="">Todos os times</option>';

        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club.id;
            option.textContent = club.full_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar clubes:', error);
    }
}

// ========== CRIAÇÃO DE CARDS ==========

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        ${news.image_url ? `<img src="${news.image_url}" alt="${news.title}">` : ''}
        <h3>${news.title}</h3>
        ${news.content ? `<p>${news.content.substring(0, 150)}...</p>` : ''}
        ${news.journalist_name ? `<p><strong>Por:</strong> ${news.journalist_name}</p>` : ''}
        <small>${formatDate(news.created_at)}</small>
    `;
    return card;
}

function createClubCard(club) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>${club.full_name}</h3>
        <p><strong>Apelido:</strong> ${club.nickname || 'N/A'}</p>
        <p><strong>Fundado:</strong> ${club.founded_year || 'N/A'}</p>
        <p><strong>Cidade:</strong> ${club.city || 'N/A'} - ${club.state || 'N/A'}</p>
        <p><strong>Presidente:</strong> ${club.president || 'N/A'}</p>
    `;
    card.addEventListener('click', () => showClubDetails(club.id));
    return card;
}

function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        ${player.image_url ? `<img src="${player.image_url}" alt="${player.full_name}">` : ''}
        <h3>${player.nickname}</h3>
        <p><strong>Nome:</strong> ${player.full_name}</p>
        <p><strong>Posição:</strong> ${player.position}</p>
        <p><strong>Idade:</strong> ${player.age} anos</p>
        <p><strong>Clube:</strong> ${player.club_name || 'Sem clube'}</p>
        <p><strong>Jogo:</strong> ${player.game}</p>
    `;
    return card;
}

function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
        <div class="match-header">
            <p><strong>Estádio:</strong> ${match.stadium}</p>
            <p>${formatDate(match.match_date)} - ${match.match_time}</p>
        </div>
        <div class="match-teams">${match.club_name} x ${match.opponent}</div>
        ${match.finished ? `
            <div class="match-score">${match.home_score} - ${match.away_score}</div>
        ` : `
            <p style="text-align: center; color: var(--warning);">Aguardando resultado</p>
        `}
        <p style="text-align: center;"><strong>${match.championship}</strong></p>
    `;
    return card;
}

async function createChampionshipCard(championship) {
    try {
        const response = await fetch(`/api/championships/${championship.id}`);
        const data = await response.json();

        const card = document.createElement('div');
        card.className = 'card';
        card.style.gridColumn = '1 / -1';

        let tableHTML = '';
        if (data.teams && data.teams.length > 0) {
            tableHTML = `
                <table class="championship-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Time</th>
                            <th>Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.teams.map(team => `
                            <tr>
                                <td>${team.position}º</td>
                                <td>${team.full_name}</td>
                                <td>${team.points}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        card.innerHTML = `
            <h3>${championship.name}</h3>
            ${tableHTML}
        `;

        return card;
    } catch (error) {
        console.error('Erro ao criar card de campeonato:', error);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${championship.name}</h3><p>Erro ao carregar dados</p>`;
        return card;
    }
}

function createPendingUserCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
        <h4>${user.name}</h4>
        <p><strong>Tipo:</strong> ${user.user_type}</p>
        ${user.other_description ? `<p><strong>Descrição:</strong> ${user.other_description}</p>` : ''}
        <p><strong>Código:</strong> ${user.code}</p>
        <p><strong>Cadastrado em:</strong> ${formatDate(user.created_at)}</p>
        <div class="actions">
            <button class="btn btn-success" onclick="approveUser(${user.id})">Aprovar</button>
        </div>
    `;
    return card;
}

function createUserManagementCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
        <h4>${user.name}</h4>
        <p><strong>Tipo:</strong> ${user.user_type}</p>
        <p><strong>Perfil:</strong> ${user.role}</p>
        <p><strong>Status:</strong> ${user.approved ? 'Aprovado' : 'Pendente'}</p>
        <p><strong>Código:</strong> ${user.code}</p>
        <div class="actions">
            <button class="btn btn-secondary" onclick="changeUserRole(${user.id})">Alterar Perfil</button>
            <button class="btn btn-secondary" onclick="changeUserPassword(${user.id})">Alterar Senha</button>
        </div>
    `;
    return card;
}

// ========== AÇÕES DO USUÁRIO ==========

async function approveUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/approve`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Usuário aprovado com sucesso!', 'success');
            loadPendingUsers();
        } else {
            showAlert(data.error || 'Erro ao aprovar usuário', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao aprovar usuário', 'error');
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();

    if (!message) return;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            input.value = '';
            loadChat();
        } else {
            const data = await response.json();
            showAlert(data.error || 'Erro ao enviar mensagem', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao enviar mensagem', 'error');
    }
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    if (tabName === 'pending-users') {
        loadPendingUsers();
    } else if (tabName === 'all-users') {
        loadAllUsers();
    }
}

// ========== FUNÇÕES AUXILIARES ==========

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const container = document.querySelector('.auth-form.active') || document.querySelector('.page.active');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

function closeModal() {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = '';
}

// Funções de modal (serão implementadas conforme necessário)
function showClubModal(club = null) {
    showAlert('Funcionalidade de adicionar/editar clube em desenvolvimento', 'info');
}

function showPlayerModal(player = null) {
    showAlert('Funcionalidade de adicionar/editar jogador em desenvolvimento', 'info');
}

function showNewsModal(news = null) {
    showAlert('Funcionalidade de adicionar/editar notícia em desenvolvimento', 'info');
}

function showMatchModal(match = null) {
    showAlert('Funcionalidade de adicionar/editar partida em desenvolvimento', 'info');
}

function showChampionshipModal(championship = null) {
    showAlert('Funcionalidade de adicionar/editar campeonato em desenvolvimento', 'info');
}

function showClubDetails(clubId) {
    showAlert('Detalhes do clube em desenvolvimento', 'info');
}

function changeUserRole(userId) {
    showAlert('Funcionalidade de alterar perfil em desenvolvimento', 'info');
}

function changeUserPassword(userId) {
    showAlert('Funcionalidade de alterar senha em desenvolvimento', 'info');
}
