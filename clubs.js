const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Listar todos os clubes
router.get('/', (req, res) => {
  try {
    const clubs = db.prepare(`
      SELECT c.*, u.name as owner_name
      FROM clubs c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.full_name
    `).all();

    res.json(clubs);
  } catch (error) {
    console.error('Erro ao listar clubes:', error);
    res.status(500).json({ error: 'Erro ao listar clubes' });
  }
});

// Buscar clube por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const club = db.prepare(`
      SELECT c.*, u.name as owner_name
      FROM clubs c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(id);

    if (!club) {
      return res.status(404).json({ error: 'Clube não encontrado' });
    }

    res.json(club);
  } catch (error) {
    console.error('Erro ao buscar clube:', error);
    res.status(500).json({ error: 'Erro ao buscar clube' });
  }
});

// Criar novo clube
router.post('/', isAuthenticated, (req, res) => {
  try {
    const {
      full_name,
      short_name,
      nickname,
      founded_year,
      state,
      city,
      country,
      president
    } = req.body;

    // Validações
    if (!full_name || !short_name) {
      return res.status(400).json({ error: 'Nome completo e nome abreviado são obrigatórios' });
    }

    // Verificar se usuário tipo "Clube" já tem um clube
    if (req.session.userType === 'Time') {
      const existingClub = db.prepare('SELECT id FROM clubs WHERE user_id = ?').get(req.session.userId);
      if (existingClub) {
        return res.status(400).json({ error: 'Você já possui um clube cadastrado' });
      }
    }

    // Inserir clube
    const result = db.prepare(`
      INSERT INTO clubs (user_id, full_name, short_name, nickname, founded_year, state, city, country, president)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.session.userId,
      full_name,
      short_name,
      nickname || null,
      founded_year || null,
      state || null,
      city || null,
      country || null,
      president || null
    );

    res.json({
      success: true,
      message: 'Clube criado com sucesso!',
      clubId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Erro ao criar clube:', error);
    res.status(500).json({ error: 'Erro ao criar clube' });
  }
});

// Atualizar clube
router.put('/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      short_name,
      nickname,
      founded_year,
      state,
      city,
      country,
      president
    } = req.body;

    // Verificar permissão
    const club = db.prepare('SELECT user_id FROM clubs WHERE id = ?').get(id);

    if (!club) {
      return res.status(404).json({ error: 'Clube não encontrado' });
    }

    if (club.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar este clube' });
    }

    // Atualizar
    db.prepare(`
      UPDATE clubs
      SET full_name = ?, short_name = ?, nickname = ?, founded_year = ?,
          state = ?, city = ?, country = ?, president = ?
      WHERE id = ?
    `).run(
      full_name,
      short_name,
      nickname,
      founded_year,
      state,
      city,
      country,
      president,
      id
    );

    res.json({ success: true, message: 'Clube atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar clube:', error);
    res.status(500).json({ error: 'Erro ao atualizar clube' });
  }
});

// Excluir clube
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissão
    const club = db.prepare('SELECT user_id FROM clubs WHERE id = ?').get(id);

    if (!club) {
      return res.status(404).json({ error: 'Clube não encontrado' });
    }

    if (club.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para excluir este clube' });
    }

    db.prepare('DELETE FROM clubs WHERE id = ?').run(id);

    res.json({ success: true, message: 'Clube excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir clube:', error);
    res.status(500).json({ error: 'Erro ao excluir clube' });
  }
});

module.exports = router;
