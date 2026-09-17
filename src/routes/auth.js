const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { exigirLogin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ erro: 'Informe usuário e senha' });
  }

  const resultado = await pool.query(
    'SELECT id, usuario, senha_hash FROM usuarios WHERE usuario = $1',
    [usuario]
  );
  const linha = resultado.rows[0];

  if (!linha || !(await bcrypt.compare(senha, linha.senha_hash))) {
    return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
  }

  const token = jwt.sign(
    { id: linha.id, usuario: linha.usuario },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ ok: true, usuario: linha.usuario });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', exigirLogin, (req, res) => {
  res.json({ usuario: req.usuario.usuario });
});

module.exports = router;
