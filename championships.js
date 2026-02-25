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

function isAdmin(req, res, next) {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

// Listar campeonatos
router.get('/', (req, res) => {
  try {
    const championships = db.prepare(`
      SELECT * FROM championships ORDER BY created_at DESC
    `).all();

    res.json(championships);
  } catch (error) {
    console.error('Erro ao listar campeonatos:', error);
    res.status(500).json({ error: 'Erro ao listar campeonatos' });
  }
});

// Buscar campeonato por ID com tabela
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const championship = db.prepare('SELECT * FROM championships WHERE id = ?').get(id);

    if (!championship) {
      return res.status(404).json({ error: 'Campeonato não encontrado' });
    }

    // Buscar times do campeonato
    const teams = db.prepare(`
      SELECT ct.*, c.full_name, c.short_name
      FROM championship_teams ct
      LEFT JOIN clubs c ON ct.club_id = c.id
      WHERE ct.championship_id = ?
      ORDER BY ct.position
    `).all(id);

    res.json({
      ...championship,
      teams
    });
  } catch (error) {
    console.error('Erro ao buscar campeonato:', error);
    res.status(500).json({ error: 'Erro ao buscar campeonato' });
  }
});

// Criar campeonato
router.post('/', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { name, teams } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do campeonato é obrigatório' });
    }

    // Inserir campeonato
    const result = db.prepare('INSERT INTO championships (name) VALUES (?)').run(name);
    const championshipId = result.lastInsertRowid;

    // Inserir times
    if (teams && teams.length > 0) {
      const insertTeam = db.prepare(`
        INSERT INTO championship_teams (championship_id, club_id, position, points)
        VALUES (?, ?, ?, ?)
      `);

      teams.forEach((team, index) => {
        insertTeam.run(
          championshipId,
          team.club_id,
          team.position || index + 1,
          team.points || 0
        );
      });
    }

    res.json({
      success: true,
      message: 'Campeonato criado com sucesso!',
      championshipId
    });
  } catch (error) {
    console.error('Erro ao criar campeonato:', error);
    res.status(500).json({ error: 'Erro ao criar campeonato' });
  }
});

// Atualizar tabela do campeonato
router.put('/:id/table', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { teams } = req.body;

    if (!teams || teams.length === 0) {
      return res.status(400).json({ error: 'Lista de times é obrigatória' });
    }

    // Deletar times existentes
    db.prepare('DELETE FROM championship_teams WHERE championship_id = ?').run(id);

    // Inserir novos times
    const insertTeam = db.prepare(`
      INSERT INTO championship_teams (championship_id, club_id, position, points)
      VALUES (?, ?, ?, ?)
    `);

    teams.forEach(team => {
      insertTeam.run(
        id,
        team.club_id,
        team.position,
        team.points
      );
    });

    res.json({ success: true, message: 'Tabela atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar tabela:', error);
    res.status(500).json({ error: 'Erro ao atualizar tabela' });
  }
});

// Excluir campeonato
router.delete('/:id', isAuthenticated, isAdmin, (req, res) => {
  try {
    const { id } = req.params;

    // Deletar times do campeonato
    db.prepare('DELETE FROM championship_teams WHERE championship_id = ?').run(id);

    // Deletar campeonato
    db.prepare('DELETE FROM championships WHERE id = ?').run(id);

    res.json({ success: true, message: 'Campeonato excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir campeonato:', error);
    res.status(500).json({ error: 'Erro ao excluir campeonato' });
  }
});

module.exports = router;
