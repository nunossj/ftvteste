const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Middleware
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Listar mensagens do chat
router.get('/', isAuthenticated, (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const messages = db.prepare(`
      SELECT cm.*, u.name as user_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT ?
    `).all(parseInt(limit));

    // Reverter para ordem cronológica
    res.json(messages.reverse());
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
});

// Enviar mensagem
router.post('/', isAuthenticated, (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Mensagem não pode estar vazia' });
    }

    // Verificar permissão (Jogador e Clube podem usar o chat)
    const canChat = req.session.userType === 'Jogador' ||
                    req.session.userType === 'Time' ||
                    req.session.role === 'admin';

    if (!canChat) {
      return res.status(403).json({ error: 'Sem permissão para enviar mensagens' });
    }

    const result = db.prepare(`
      INSERT INTO chat_messages (user_id, message)
      VALUES (?, ?)
    `).run(req.session.userId, message.trim());

    // Buscar a mensagem recém criada com o nome do usuário
    const newMessage = db.prepare(`
      SELECT cm.*, u.name as user_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `).get(result.lastInsertRowid);

    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Excluir mensagem (apenas admin)
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;

    if (req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem excluir mensagens' });
    }

    db.prepare('DELETE FROM chat_messages WHERE id = ?').run(id);

    res.json({ success: true, message: 'Mensagem excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir mensagem:', error);
    res.status(500).json({ error: 'Erro ao excluir mensagem' });
  }
});

module.exports = router;
