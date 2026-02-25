const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clubRoutes = require('./routes/clubs');
const playerRoutes = require('./routes/players');
const newsRoutes = require('./routes/news');
const matchRoutes = require('./routes/matches');
const championshipRoutes = require('./routes/championships');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Configuração de sessão
app.use(session({
  secret: 'federacao-futebol-virtual-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Mudar para true em produção com HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/championships', championshipRoutes);
app.use('/api/chat', chatRoutes);

// Rota principal - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Inicializar banco de dados
db.initialize();
db.createDefaultAdmin();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Banco de dados inicializado`);
});
