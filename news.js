const express = require('express');
const multer = require('multer');
const path = require('path');
const { db } = require('../database');
const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/images'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

// Listar todas as notícias
router.get('/', (req, res) => {
  try {
    const { featured, club_id } = req.query;

    let query = `
      SELECT n.*, u.name as author_name, c.full_name as club_name
      FROM news n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN clubs c ON n.club_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (featured === 'true') {
      query += ` AND n.is_featured = 1`;
    }

    if (club_id) {
      query += ` AND n.club_id = ?`;
      params.push(club_id);
    }

    query += ` ORDER BY n.created_at DESC`;

    const news = db.prepare(query).all(...params);

    res.json(news);
  } catch (error) {
    console.error('Erro ao listar notícias:', error);
    res.status(500).json({ error: 'Erro ao listar notícias' });
  }
});

// Buscar notícia por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const news = db.prepare(`
      SELECT n.*, u.name as author_name, c.full_name as club_name
      FROM news n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN clubs c ON n.club_id = c.id
      WHERE n.id = ?
    `).get(id);

    if (!news) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    res.json(news);
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).json({ error: 'Erro ao buscar notícia' });
  }
});

// Criar notícia
router.post('/', isAuthenticated, upload.single('image'), (req, res) => {
  try {
    const { title, content, journalist_name, club_id, is_featured } = req.body;

    // Validações
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ error: 'A notícia deve ter texto, imagem ou ambos' });
    }

    // Verificar permissão
    const canPost = req.session.role === 'admin' ||
                    req.session.role === 'jornalista' ||
                    req.session.userType === 'Time';

    if (!canPost) {
      return res.status(403).json({ error: 'Sem permissão para criar notícias' });
    }

    // Jornalista precisa informar o nome
    if (req.session.role === 'jornalista' && !journalist_name) {
      return res.status(400).json({ error: 'Nome do jornalista é obrigatório' });
    }

    const imageUrl = req.file ? `/images/${req.file.filename}` : null;

    // Inserir notícia
    const result = db.prepare(`
      INSERT INTO news (user_id, club_id, title, content, image_url, journalist_name, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.session.userId,
      club_id || null,
      title,
      content || null,
      imageUrl,
      journalist_name || null,
      is_featured ? 1 : 0
    );

    res.json({
      success: true,
      message: 'Notícia criada com sucesso!',
      newsId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.status(500).json({ error: 'Erro ao criar notícia' });
  }
});

// Atualizar notícia
router.put('/:id', isAuthenticated, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, journalist_name, is_featured } = req.body;

    // Verificar permissão
    const news = db.prepare('SELECT user_id FROM news WHERE id = ?').get(id);

    if (!news) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    if (news.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar esta notícia' });
    }

    const imageUrl = req.file ? `/images/${req.file.filename}` : undefined;

    // Atualizar
    if (imageUrl) {
      db.prepare(`
        UPDATE news
        SET title = ?, content = ?, journalist_name = ?, is_featured = ?, image_url = ?
        WHERE id = ?
      `).run(title, content, journalist_name, is_featured ? 1 : 0, imageUrl, id);
    } else {
      db.prepare(`
        UPDATE news
        SET title = ?, content = ?, journalist_name = ?, is_featured = ?
        WHERE id = ?
      `).run(title, content, journalist_name, is_featured ? 1 : 0, id);
    }

    res.json({ success: true, message: 'Notícia atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);
    res.status(500).json({ error: 'Erro ao atualizar notícia' });
  }
});

// Excluir notícia
router.delete('/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;

    // Verificar permissão
    const news = db.prepare('SELECT user_id FROM news WHERE id = ?').get(id);

    if (!news) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    if (news.user_id !== req.session.userId && req.session.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para excluir esta notícia' });
    }

    db.prepare('DELETE FROM news WHERE id = ?').run(id);

    res.json({ success: true, message: 'Notícia excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir notícia:', error);
    res.status(500).json({ error: 'Erro ao excluir notícia' });
  }
});

module.exports = router;
