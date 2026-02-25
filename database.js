const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'federacao.db'));

// Função para inicializar o banco de dados
function initialize() {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      user_type TEXT NOT NULL,
      other_description TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      code TEXT UNIQUE NOT NULL,
      approved INTEGER DEFAULT 0,
      surname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de clubes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      full_name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      nickname TEXT,
      founded_year INTEGER,
      state TEXT,
      city TEXT,
      country TEXT,
      president TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Tabela de jogadores
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      club_id INTEGER,
      full_name TEXT NOT NULL,
      nickname TEXT NOT NULL,
      age INTEGER NOT NULL,
      position TEXT NOT NULL,
      secondary_position TEXT,
      birth_date TEXT NOT NULL,
      game TEXT NOT NULL,
      career_type TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    )
  `);

  // Tabela de notícias
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      club_id INTEGER,
      title TEXT NOT NULL,
      content TEXT,
      image_url TEXT,
      journalist_name TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    )
  `);

  // Tabela de partidas
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id INTEGER,
      stadium TEXT NOT NULL,
      match_date TEXT NOT NULL,
      match_time TEXT NOT NULL,
      opponent TEXT NOT NULL,
      championship TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      finished INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    )
  `);

  // Tabela de campeonatos
  db.exec(`
    CREATE TABLE IF NOT EXISTS championships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de times no campeonato
  db.exec(`
    CREATE TABLE IF NOT EXISTS championship_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      championship_id INTEGER,
      club_id INTEGER,
      position INTEGER,
      points INTEGER DEFAULT 0,
      FOREIGN KEY (championship_id) REFERENCES championships(id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    )
  `);

  // Tabela de chat
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Banco de dados inicializado com sucesso!');
}

// Função para criar o primeiro usuário admin se não existir
function createDefaultAdmin() {
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const code = generateUniqueCode();

    db.prepare(`
      INSERT INTO users (name, user_type, password, role, code, approved, surname)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('Administrador', 'Outros', hashedPassword, 'admin', code, 1, 'Admin');

    console.log(`✅ Usuário Admin criado com sucesso!`);
    console.log(`   Login: Administrador`);
    console.log(`   Senha: admin123`);
    console.log(`   Código: ${code}`);
  }
}

// Gerar código único de 6 dígitos
function generateUniqueCode() {
  let code;
  let exists = true;

  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const check = db.prepare('SELECT id FROM users WHERE code = ?').get(code);
    exists = !!check;
  }

  return code;
}

module.exports = {
  db,
  initialize,
  createDefaultAdmin,
  generateUniqueCode
};
