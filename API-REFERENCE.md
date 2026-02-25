# 📡 Referência da API

## Endpoints Disponíveis

### 🔐 Autenticação (`/api/auth`)

#### POST `/api/auth/register`
Registrar novo usuário
```json
{
  "name": "João Silva",
  "user_type": "Jogador",
  "other_description": "Opcional",
  "password": "senha123",
  "confirm_password": "senha123"
}
```

#### POST `/api/auth/login`
Fazer login
```json
{
  "name": "João Silva",
  "password": "senha123"
}
```

#### POST `/api/auth/logout`
Fazer logout

#### GET `/api/auth/session`
Verificar sessão atual

#### POST `/api/auth/forgot-password/validate`
Validar código de recuperação
```json
{
  "code": "123456",
  "surname": "Silva"
}
```

#### POST `/api/auth/forgot-password/reset`
Redefinir senha
```json
{
  "userId": 1,
  "newPassword": "novaSenha123",
  "confirmPassword": "novaSenha123"
}
```

---

### 👥 Usuários (`/api/users`)

#### GET `/api/users/pending`
Listar usuários pendentes de aprovação (Admin)

#### GET `/api/users`
Listar todos os usuários (Admin)

#### POST `/api/users/:id/approve`
Aprovar usuário (Admin)

#### PUT `/api/users/:id/role`
Alterar tipo de usuário (Admin)
```json
{
  "role": "jornalista"
}
```

#### PUT `/api/users/:id/password`
Alterar senha de usuário (Admin)
```json
{
  "newPassword": "novaSenha123"
}
```

#### DELETE `/api/users/:id`
Excluir usuário (Admin)

---

### 🏟️ Clubes (`/api/clubs`)

#### GET `/api/clubs`
Listar todos os clubes

#### GET `/api/clubs/:id`
Buscar clube por ID

#### POST `/api/clubs`
Criar novo clube
```json
{
  "full_name": "Santos FC Virtual",
  "short_name": "SAN",
  "nickname": "Peixe",
  "founded_year": 2020,
  "state": "SP",
  "city": "Santos",
  "country": "Brasil",
  "president": "João Silva"
}
```

#### PUT `/api/clubs/:id`
Atualizar clube

#### DELETE `/api/clubs/:id`
Excluir clube

---

### ⚽ Jogadores (`/api/players`)

#### GET `/api/players`
Listar todos os jogadores
Parâmetros query: `?name=João&club=Santos`

#### GET `/api/players/:id`
Buscar jogador por ID

#### GET `/api/players/club/:clubId`
Listar jogadores de um clube

#### POST `/api/players`
Criar novo jogador (multipart/form-data)
```
full_name: "João Silva"
nickname: "Joãozinho"
age: 25
position: "Atacante"
secondary_position: "Meia"
birth_date: "1998-05-15"
club_id: 1
game: "PES"
career_type: "Clube Virtual"
image: [arquivo]
```

#### PUT `/api/players/:id`
Atualizar jogador

#### DELETE `/api/players/:id`
Excluir jogador

---

### 📰 Notícias (`/api/news`)

#### GET `/api/news`
Listar todas as notícias
Parâmetros query: `?featured=true&club_id=1`

#### GET `/api/news/:id`
Buscar notícia por ID

#### POST `/api/news`
Criar nova notícia (multipart/form-data)
```
title: "Título da Notícia"
content: "Conteúdo..."
journalist_name: "João Repórter"
club_id: 1 (opcional)
is_featured: true/false
image: [arquivo]
```

#### PUT `/api/news/:id`
Atualizar notícia

#### DELETE `/api/news/:id`
Excluir notícia

---

### 🥅 Partidas (`/api/matches`)

#### GET `/api/matches`
Listar todas as partidas
Parâmetros query: `?date=2024-01-15&club_id=1`

#### GET `/api/matches/:id`
Buscar partida por ID

#### GET `/api/matches/club/:clubId`
Listar partidas de um clube

#### POST `/api/matches`
Criar nova partida
```json
{
  "club_id": 1,
  "stadium": "Vila Belmiro",
  "match_date": "2024-01-20",
  "match_time": "16:00",
  "opponent": "Corinthians",
  "championship": "Brasileirão Virtual"
}
```

#### PUT `/api/matches/:id/result`
Atualizar resultado
```json
{
  "home_score": 3,
  "away_score": 1
}
```

#### DELETE `/api/matches/:id`
Excluir partida

---

### 🏆 Campeonatos (`/api/championships`)

#### GET `/api/championships`
Listar todos os campeonatos

#### GET `/api/championships/:id`
Buscar campeonato por ID (com tabela)

#### POST `/api/championships`
Criar novo campeonato (Admin)
```json
{
  "name": "Brasileirão Virtual 2024",
  "teams": [
    {
      "club_id": 1,
      "position": 1,
      "points": 45
    }
  ]
}
```

#### PUT `/api/championships/:id/table`
Atualizar tabela (Admin)
```json
{
  "teams": [
    {
      "club_id": 1,
      "position": 1,
      "points": 48
    }
  ]
}
```

#### DELETE `/api/championships/:id`
Excluir campeonato (Admin)

---

### 💬 Chat (`/api/chat`)

#### GET `/api/chat`
Listar mensagens
Parâmetros query: `?limit=50`

#### POST `/api/chat`
Enviar mensagem
```json
{
  "message": "Olá, pessoal!"
}
```

#### DELETE `/api/chat/:id`
Excluir mensagem (Admin)

---

## 🔒 Autenticação

Todas as rotas que requerem autenticação utilizam sessões.
O cookie de sessão é automaticamente enviado pelo navegador.

## 📤 Upload de Arquivos

Rotas que aceitam upload de imagens:
- `POST /api/players`
- `PUT /api/players/:id`
- `POST /api/news`
- `PUT /api/news/:id`

Usar `multipart/form-data` e campo `image`.

## 🎯 Códigos de Status

- `200` - Sucesso
- `201` - Criado
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro do servidor

## 📋 Exemplos de Uso

### Login e criação de notícia
```javascript
// 1. Fazer login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João Silva',
    password: 'senha123'
  })
});

// 2. Criar notícia com imagem
const formData = new FormData();
formData.append('title', 'Minha Notícia');
formData.append('content', 'Conteúdo da notícia');
formData.append('journalist_name', 'João Silva');
formData.append('image', fileInput.files[0]);

const newsResponse = await fetch('/api/news', {
  method: 'POST',
  body: formData
});
```

### Filtrar jogadores
```javascript
const params = new URLSearchParams({
  name: 'João',
  club: 'Santos'
});

const response = await fetch(`/api/players?${params}`);
const players = await response.json();
```

## 🛡️ Permissões por Endpoint

| Endpoint | Público | Autenticado | Admin |
|----------|---------|-------------|-------|
| GET `/api/clubs` | ✅ | ✅ | ✅ |
| POST `/api/clubs` | ❌ | ✅ | ✅ |
| GET `/api/players` | ✅ | ✅ | ✅ |
| POST `/api/players` | ❌ | ✅* | ✅ |
| GET `/api/news` | ✅ | ✅ | ✅ |
| POST `/api/news` | ❌ | ✅** | ✅ |
| POST `/api/chat` | ❌ | ✅*** | ✅ |
| GET `/api/users` | ❌ | ❌ | ✅ |

*Apenas Jogador e Clube
**Apenas Jornalista e Clube
***Apenas Jogador e Clube

---

**Desenvolvido para a Federação de Futebol Virtual** ⚽
