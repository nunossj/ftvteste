const express = require('express');
const bcrypt = require('bcryptjs');
const { db, generateUniqueCode } = require('../database');
const router = express.Router();

// Registro de novo usuário
router.post('/register', (req, res) => {
  try {
    const { name, user_type, other_description, password, confirm_password } = req.body;

    // Validações
    if (!name || !user_type || !password || !confirm_password) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    if (user_type === 'Outros' && !other_description) {
      return res.status(400).json({ error: 'Descrição é obrigatória para tipo "Outros"' });
    }

    // Verificar se é o primeiro usuário (será admin)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const isFirstUser = userCount.count === 0;

    // Hash da senha
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Gerar código único
    const code = generateUniqueCode();

    // Extrair sobrenome
    const nameParts = name.trim().split(' ');
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    // Inserir usuário
    const result = db.prepare(`
      INSERT INTO users (name, user_type, other_description, password, role, code, approved, surname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      user_type,
      other_description || null,
      hashedPassword,
      isFirstUser ? 'admin' : 'viewer',
      code,
      isFirstUser ? 1 : 0,
      surname
    );

    res.json({
      success: true,
      message: isFirstUser
        ? 'Primeiro usuário criado como Administrador!'
        : `Agora é só aguardar um administrador liberar seu acesso. Seu código é ${code}`,
      code,
      isAdmin: isFirstUser
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = db.prepare('SELECT * FROM users WHERE name = ?').get(name);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se está aprovado
    if (!user.approved) {
      return res.status(403).json({ error: 'Usuário ainda não foi aprovado por um administrador' });
    }

    // Verificar senha
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Criar sessão
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.userType = user.user_type;

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Verificar sessão
router.get('/session', (req, res) => {
  if (req.session.userId) {
    const user = db.prepare('SELECT id, name, role, user_type FROM users WHERE id = ?').get(req.session.userId);
    res.json({ authenticated: true, user });
  } else {
    res.json({ authenticated: false });
  }
});

// Recuperação de senha - Validar código e sobrenome
router.post('/forgot-password/validate', (req, res) => {
  try {
    const { code, surname } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código é obrigatório' });
    }

    // Buscar usuário pelo código
    const user = db.prepare('SELECT * FROM users WHERE code = ?').get(code);

    if (!user) {
      return res.status(404).json({ error: 'Código não encontrado' });
    }

    // Se sobrenome foi fornecido, validar
    if (surname) {
      if (user.surname.toLowerCase() !== surname.toLowerCase()) {
        return res.status(401).json({ error: 'Sobrenome incorreto' });
      }

      // Sobrenome correto, permitir redefinição
      return res.json({
        success: true,
        validated: true,
        userId: user.id
      });
    }

    // Gerar opções de sobrenome (1 correto + 2 falsos)
    const allSurnames = db.prepare('SELECT DISTINCT surname FROM users WHERE surname IS NOT NULL AND surname != ""').all();
    const correctSurname = user.surname;

    let options = [correctSurname];
    const otherSurnames = allSurnames
      .map(s => s.surname)
      .filter(s => s !== correctSurname);

    // Adicionar 2 sobrenomes falsos aleatórios
    while (options.length < 3 && otherSurnames.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherSurnames.length);
      const randomSurname = otherSurnames.splice(randomIndex, 1)[0];
      options.push(randomSurname);
    }

    // Se não houver sobrenomes suficientes, adicionar genéricos
    if (options.length < 3) {
      const genericSurnames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Ferreira'];
      while (options.length < 3) {
        const random = genericSurnames[Math.floor(Math.random() * genericSurnames.length)];
        if (!options.includes(random)) {
          options.push(random);
        }
      }
    }

    // Embaralhar opções
    options = options.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      options
    });
  } catch (error) {
    console.error('Erro ao validar:', error);
    res.status(500).json({ error: 'Erro ao validar código' });
  }
});

// Redefinir senha
router.post('/forgot-password/reset', (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    if (!userId || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

    res.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

module.exports = router;
