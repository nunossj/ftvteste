const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const router = express.Router();

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Middleware para verificar se é admin
function isAdmin(req, res, next) {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

// Listar usuários pendentes de aprovação
router.get('/pending', isAuthenticated, isAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, user_type, other_description, code, created_at
      FROM users
      WHERE approved = 0
      ORDER BY created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários pendentes:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Listar todos os usuários
router.get('/', isAuthenticated, isAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, user_type, other_description, code, role, approved, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Aprovar usuário
router.post('/:id/approve', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare('UPDATE users SET approved = 1 WHERE id = ?').run(id);

    res.json({ success: true, message: 'Usuário aprovado com sucesso!' });
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error);
    res.status(500).json({ error: 'Erro ao aprovar usuário' });
  }
});

// Alterar tipo de usuário
router.put('/:id/role', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'jornalista', 'jogador', 'clube', 'viewer'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

    res.json({ success: true, message: 'Tipo de usuário alterado com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar tipo:', error);
    res.status(500).json({ error: 'Erro ao alterar tipo de usuário' });
  }
});

// Alterar senha de usuário
router.put('/:id/password', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: 'Nova senha é obrigatória' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// Excluir usuário
router.delete('/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir excluir a si mesmo
    if (parseInt(id) === req.session.userId) {
      return res.status(400).json({ error: 'Você não pode excluir sua própria conta' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ success: true, message: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

module.exports = router;
