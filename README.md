# 🏆 FEDERAÇÃO DE FUTEBOL VIRTUAL

Sistema web completo para gerenciamento de uma federação de futebol virtual, com autenticação, cadastro de clubes, jogadores, notícias, partidas e campeonatos.

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- Login e cadastro de usuários
- Primeiro usuário registrado é automaticamente Admin
- Sistema de aprovação de novos usuários
- Recuperação de senha com validação de sobrenome
- Diferentes níveis de permissão (Admin, Jornalista, Jogador, Clube, Visualizador)

### 👥 Gestão de Usuários
- Painel administrativo para aprovar usuários
- Alterar perfil e senha de usuários
- Código único de 6 dígitos para cada usuário

### 🏟️ Clubes
- Cadastro completo de clubes virtuais
- Informações: nome, apelido, fundação, localização, presidente
- Cada usuário tipo "Clube" pode cadastrar apenas 1 clube
- Página individual para cada clube

### 🧍 Jogadores
- Cadastro de jogadores com foto
- Informações: nome, apelido, idade, posição, clube, jogo (PES/FIFA)
- Filtros por nome e clube
- Usuário tipo "Jogador" pode cadastrar apenas 1 jogador

### 📰 Notícias
- Criação de notícias com texto e/ou imagem
- Notícias em destaque na home
- Jornalistas precisam assinar as notícias
- Clubes podem postar notícias internas

### ⚽ Partidas
- Cadastro de partidas com data, horário, estádio
- Atualização de resultados após o jogo
- Filtros por data e time

### 🏆 Campeonatos
- Criação de campeonatos
- Tabela editável com posições e pontos
- Gerenciamento manual das colocações

### 💬 Chat Interno
- Sistema de chat em tempo real
- Disponível para jogadores e clubes
- Histórico de mensagens

### 🌐 Redes Sociais
- Link direto para Instagram da federação

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passo 1: Instalar Dependências
```bash
cd federacao-futebol-virtual
npm install
```

### Passo 2: Executar o Projeto
```bash
npm start
```

O servidor será iniciado em `http://localhost:3000`

### Passo 3: Primeiro Acesso
Ao acessar pela primeira vez:
1. Clique em "Cadastre-se"
2. Preencha seus dados
3. O primeiro usuário será automaticamente criado como **Administrador**
4. Anote o código de 6 dígitos gerado

**Credenciais do Admin (se criado automaticamente):**
- Usuário: Administrador
- Senha: admin123

## 📂 Estrutura do Projeto

```
federacao-futebol-virtual/
├── public/                 # Arquivos estáticos (front-end)
│   ├── css/
│   │   └── style.css      # Estilos da aplicação
│   ├── js/
│   │   ├── app.js         # JavaScript principal
│   │   └── functions.js   # Funções auxiliares
│   ├── images/            # Imagens enviadas pelos usuários
│   └── index.html         # Página principal
├── server/                # Back-end Node.js
│   ├── routes/           # Rotas da API
│   │   ├── auth.js       # Autenticação
│   │   ├── users.js      # Usuários
│   │   ├── clubs.js      # Clubes
│   │   ├── players.js    # Jogadores
│   │   ├── news.js       # Notícias
│   │   ├── matches.js    # Partidas
│   │   ├── championships.js # Campeonatos
│   │   └── chat.js       # Chat
│   ├── database.js       # Configuração do banco de dados
│   └── server.js         # Servidor Express
├── package.json          # Dependências do projeto
└── README.md            # Este arquivo
```

## 🎨 Design

- **Paleta de Cores:** Azul (#0066CC) e Branco (#FFFFFF)
- **Responsivo:** Funciona em desktop e mobile
- **Moderno:** Interface limpa e intuitiva

## 🔑 Tipos de Usuário e Permissões

### 🔧 Administrador
- Acesso total ao sistema
- Aprovar novos usuários
- Criar, editar e excluir qualquer conteúdo
- Alterar senhas e perfis de usuários
- Gerenciar campeonatos

### 📝 Jornalista
- Criar notícias (obrigatório assinar com nome)
- Visualizar todo o conteúdo
- Acesso de leitura ao sistema

### ⚽ Jogador
- Cadastrar 1 jogador (com foto obrigatória)
- Acesso ao chat
- Visualização do conteúdo

### 🏟️ Clube (Time)
- Cadastrar 1 clube
- Cadastrar múltiplos jogadores do clube
- Criar partidas do clube
- Postar notícias internas
- Acesso ao chat

### 👁️ Visualizador
- Apenas visualização
- Acesso básico ao sistema

## 🌐 Publicação Online

### Opção 1: Render.com (Gratuito)
1. Crie uma conta em https://render.com
2. Conecte seu repositório GitHub
3. Crie um novo "Web Service"
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Deploy!

### Opção 2: Heroku (Gratuito)
1. Instale o Heroku CLI
2. Execute:
```bash
heroku login
heroku create nome-da-sua-app
git push heroku main
```

### Opção 3: Vercel (Front-end) + Railway (Back-end)
- Vercel para hospedar os arquivos estáticos
- Railway para hospedar o servidor Node.js

## 🗄️ Banco de Dados

O sistema utiliza **SQLite** (arquivo local) que é criado automaticamente na primeira execução.

**Localização:** `server/federacao.db`

**Tabelas:**
- users (usuários)
- clubs (clubes)
- players (jogadores)
- news (notícias)
- matches (partidas)
- championships (campeonatos)
- championship_teams (times nos campeonatos)
- chat_messages (mensagens do chat)

## 📱 Recursos Responsivos

O sistema foi desenvolvido para funcionar perfeitamente em:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🛠️ Tecnologias Utilizadas

### Front-end
- HTML5
- CSS3 (com variáveis CSS)
- JavaScript (Vanilla)

### Back-end
- Node.js
- Express.js
- better-sqlite3 (banco de dados)
- bcryptjs (criptografia de senhas)
- express-session (gerenciamento de sessões)
- multer (upload de arquivos)

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Sessões gerenciadas com express-session
- Validação de permissões em todas as rotas
- Proteção contra SQL Injection (prepared statements)
- Upload de imagens com validação de tipo

## 📝 Notas Importantes

1. **Banco de Dados:** Os dados são salvos localmente em SQLite
2. **Imagens:** Armazenadas na pasta `public/images`
3. **Primeiro Usuário:** É automaticamente Admin
4. **Aprovação:** Novos usuários precisam ser aprovados pelo Admin
5. **Código de Recuperação:** Guardar o código de 6 dígitos para recuperação de senha

## 🐛 Resolução de Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port already in use"
Altere a porta no arquivo `server/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Mude para 3001 ou outra porta
```

### Banco de dados corrompido
Delete o arquivo `server/federacao.db` e reinicie o servidor (será criado novamente).

## 📧 Suporte

Para dúvidas ou problemas, entre em contato através do Instagram: [@cbffvirtuall](https://www.instagram.com/cbffvirtuall)

## 📄 Licença

MIT License - Livre para uso e modificação.

---

**Desenvolvido para a Federação de Futebol Virtual** ⚽🎮
