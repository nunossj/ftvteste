const express = require('express');
const multer = require('multer');
const path = require('path');
const { db } = require('../database');
const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Listar todos os jogadores
router.get('/', (req, res) => {
  try {
    const { name, club } = req.query;

    let query = `
      SELECT p.*, c.full_name as club_name
      FROM players p
      LEFT JOIN clubs c ON p.club_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (name) {
      query += ` AND (p.full_name LIKE ? OR p.nickname LIKE ?)`;
      params.push(`%${name}%`, `%${name}%`);
    }

    if (club) {
      query += ` AND c.full_name LIKE ?`;
      params.push(`%${club}%`);
    }

    query += ` ORDER BY p.full_name`;

    const players = db.prepare(query).all(...params);

    res.json(players);
  } catch (error) {
    console.error('Erro ao listar jogadores:', error);
    res.status(500).json({ error: 'Erro ao listar jogadores' });
  }
});

// Buscar jogador por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const player = db.prepare(`
      SELECT p.*, c.full_name as club_name
      FROM players p
      LEFT JOIN clubs c ON p.club_id = c.id
      WHERE p.id = ?
    `).get(id);

    if (!player) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    res.json(player);
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    res.status(500).json({ error: 'Erro ao buscar jogador' });
  }
});

// Criar novo jogador
router.post('/', isAuthenticated, upload.single('image'), (req, res) => {
  try {
    const {
      full_name,
      nickname,
      age,
      position,
      secondary_position,
      birth_date,
      club_id,
      game,
      career_type
    } = req.body;

    // Validações
    if (!full_name || !nickname || !age || !position || !birth_date || !game || !career_type) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Se usuário tipo "Jogador", pode cadastrar apenas 1 jogador
    if (req.session.userType === 'Jogador') {
      const existingPlayer = db.prepare('SELECT id FROM players WHERE user_id = ?').get(req.session.userId);
      if (existingPlayer) {
        return res.status(400).json({ error: 'Você já possui um jogador cadastrado' });
      }

      // Imagem é obrigatória para tipo Jogador
      if (!req.file) {
        return res.status(400).json({ error: 'Imagem do jogador é obrigatória' });
      }
    }

    const imageUrl = req.file ? `/images/${req.file.filename}` : null;

    // Inserir jogador
    const result = db.prepare(`
      INSERT INTO players (user_id, club_id, full_name, nickname, age, position, secondary_position, birth_date, game, career_type, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.session.userId,
      club_id || null,
      full_name,
      nickname,
      age,
      position,
      secondary_position || null,
      birth_date,
      game,
      career_type,
      imageUrl
    );

    res.json({
      success: true,
      message: 'Jogador cadastrado com sucesso!',
      playerId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    res.status(500).json({ error: 'Erro ao criar jogador' });
  }
});

// Atualizar jogador
router.put('/:id', isAuthenticated, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      nickname,
      age,
      position,
      secondary_position,
      birth_date,
      club_id,
      game,
      career_type
    } = req.body;

    // Verificar permissão
    const player = db.prepare('SELECT user_id FROM players WHERE id = ?').get(id);

    if (!player) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    if (player.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar este jogador' });
    }

    const imageUrl = req.file ? `/images/${req.file.filename}` : undefined;

    // Atualizar
    if (imageUrl) {
      db.prepare(`
        UPDATE players
        SET full_name = ?, nickname = ?, age = ?, position = ?, secondary_position = ?,
            birth_date = ?, club_id = ?, game = ?, career_type = ?, image_url = ?
        WHERE id = ?
      `).run(
        full_name, nickname, age, position, secondary_position,
        birth_date, club_id, game, career_type, imageUrl, id
      );
    } else {
      db.prepare(`
        UPDATE players
        SET full_name = ?, nickname = ?, age = ?, position = ?, secondary_position = ?,
            birth_date = ?, club_id = ?, game = ?, career_type = ?
        WHERE id = ?
      `).run(
        full_name, nickname, age, position, secondary_position,
        birth_date, club_id, game, career_type, id
      );
    }

    res.json({ success: true, message: 'Jogador atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    res.status(500).json({ error: 'Erro ao atualizar jogador' });
  }
});

// Excluir jogador
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissão
    const player = db.prepare('SELECT user_id FROM players WHERE id = ?').get(id);

    if (!player) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    if (player.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para excluir este jogador' });
    }

    db.prepare('DELETE FROM players WHERE id = ?').run(id);

    res.json({ success: true, message: 'Jogador excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir jogador:', error);
    res.status(500).json({ error: 'Erro ao excluir jogador' });
  }
});

// Listar jogadores de um clube específico
router.get('/club/:clubId', (req, res) => {
  try {
    const { clubId } = req.params;

    const players = db.prepare(`
      SELECT p.*, c.full_name as club_name
      FROM players p
      LEFT JOIN clubs c ON p.club_id = c.id
      WHERE p.club_id = ?
      ORDER BY p.full_name
    `).all(clubId);

    res.json(players);
  } catch (error) {
    console.error('Erro ao listar jogadores do clube:', error);
    res.status(500).json({ error: 'Erro ao listar jogadores' });
  }
});

module.exports = router;
