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

// Listar partidas
router.get('/', (req, res) => {
  try {
    const { date, club_id } = req.query;

    let query = `
      SELECT m.*, c.full_name as club_name
      FROM matches m
      LEFT JOIN clubs c ON m.club_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (date) {
      query += ` AND m.match_date = ?`;
      params.push(date);
    }

    if (club_id) {
      query += ` AND (m.club_id = ? OR m.opponent LIKE ?)`;
      const club = db.prepare('SELECT full_name FROM clubs WHERE id = ?').get(club_id);
      params.push(club_id, `%${club?.full_name || ''}%`);
    }

    query += ` ORDER BY m.match_date DESC, m.match_time DESC`;

    const matches = db.prepare(query).all(...params);

    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas:', error);
    res.status(500).json({ error: 'Erro ao listar partidas' });
  }
});

// Buscar partida por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const match = db.prepare(`
      SELECT m.*, c.full_name as club_name
      FROM matches m
      LEFT JOIN clubs c ON m.club_id = c.id
      WHERE m.id = ?
    `).get(id);

    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    res.json(match);
  } catch (error) {
    console.error('Erro ao buscar partida:', error);
    res.status(500).json({ error: 'Erro ao buscar partida' });
  }
});

// Criar partida
router.post('/', isAuthenticated, (req, res) => {
  try {
    const {
      club_id,
      stadium,
      match_date,
      match_time,
      opponent,
      championship
    } = req.body;

    // Validações
    if (!club_id || !stadium || !match_date || !match_time || !opponent || !championship) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o usuário tem permissão
    const club = db.prepare('SELECT user_id FROM clubs WHERE id = ?').get(club_id);

    if (!club) {
      return res.status(404).json({ error: 'Clube não encontrado' });
    }

    if (club.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para cadastrar partida para este clube' });
    }

    // Inserir partida
    const result = db.prepare(`
      INSERT INTO matches (club_id, stadium, match_date, match_time, opponent, championship)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(club_id, stadium, match_date, match_time, opponent, championship);

    res.json({
      success: true,
      message: 'Partida cadastrada com sucesso!',
      matchId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    res.status(500).json({ error: 'Erro ao criar partida' });
  }
});

// Atualizar resultado da partida
router.put('/:id/result', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const { home_score, away_score } = req.body;

    // Verificar permissão
    const match = db.prepare(`
      SELECT m.*, c.user_id
      FROM matches m
      LEFT JOIN clubs c ON m.club_id = c.id
      WHERE m.id = ?
    `).get(id);

    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    if (match.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para atualizar esta partida' });
    }

    // Atualizar resultado
    db.prepare(`
      UPDATE matches
      SET home_score = ?, away_score = ?, finished = 1
      WHERE id = ?
    `).run(home_score, away_score, id);

    res.json({ success: true, message: 'Resultado atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar resultado:', error);
    res.status(500).json({ error: 'Erro ao atualizar resultado' });
  }
});

// Excluir partida
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissão
    const match = db.prepare(`
      SELECT m.*, c.user_id
      FROM matches m
      LEFT JOIN clubs c ON m.club_id = c.id
      WHERE m.id = ?
    `).get(id);

    if (!match) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    if (match.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para excluir esta partida' });
    }

    db.prepare('DELETE FROM matches WHERE id = ?').run(id);

    res.json({ success: true, message: 'Partida excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
    res.status(500).json({ error: 'Erro ao excluir partida' });
  }
});

// Listar partidas de um clube
router.get('/club/:clubId', (req, res) => {
  try {
    const { clubId } = req.params;

    const matches = db.prepare(`
      SELECT m.*, c.full_name as club_name
      FROM matches m
      LEFT JOIN clubs c ON m.club_id = c.id
      WHERE m.club_id = ?
      ORDER BY m.match_date DESC, m.match_time DESC
    `).all(clubId);

    res.json(matches);
  } catch (error) {
    console.error('Erro ao listar partidas do clube:', error);
    res.status(500).json({ error: 'Erro ao listar partidas' });
  }
});

module.exports = router;
