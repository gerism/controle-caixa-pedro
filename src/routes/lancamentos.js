const express = require('express');
const pool = require('../db');
const { exigirLogin } = require('../middleware/auth');

const router = express.Router();
router.use(exigirLogin);

const CATEGORIAS = ['Venda', 'Serviço', 'Conta', 'Aluguel', 'Outros'];

// Cria um novo lançamento (entrada ou saída)
router.post('/', async (req, res) => {
  const { tipo, valor, descricao, categoria } = req.body;

  if (!['entrada', 'saida'].includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo deve ser "entrada" ou "saida"' });
  }
  const valorNumero = Number(valor);
  if (!valorNumero || valorNumero <= 0) {
    return res.status(400).json({ erro: 'Valor inválido' });
  }
  if (!descricao || !descricao.trim()) {
    return res.status(400).json({ erro: 'Descrição é obrigatória' });
  }
  const categoriaFinal = CATEGORIAS.includes(categoria) ? categoria : 'Outros';

  const resultado = await pool.query(
    `INSERT INTO lancamentos (usuario_id, tipo, valor, descricao, categoria)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.usuario.id, tipo, valorNumero, descricao.trim(), categoriaFinal]
  );

  res.status(201).json(resultado.rows[0]);
});

// Lista os lançamentos de um dia específico (padrão: hoje)
router.get('/', async (req, res) => {
  const data = req.query.data || new Date().toISOString().slice(0, 10);

  const resultado = await pool.query(
    `SELECT id, tipo, valor, descricao, categoria, criado_em
     FROM lancamentos
     WHERE criado_em::date = $1::date
     ORDER BY criado_em DESC`,
    [data]
  );

  res.json(resultado.rows);
});

// Resumo do dia: total de entradas, saídas e saldo
router.get('/resumo/dia', async (req, res) => {
  const data = req.query.data || new Date().toISOString().slice(0, 10);

  const resultado = await pool.query(
    `SELECT
       COALESCE(SUM(valor) FILTER (WHERE tipo = 'entrada'), 0) AS entradas,
       COALESCE(SUM(valor) FILTER (WHERE tipo = 'saida'), 0) AS saidas
     FROM lancamentos
     WHERE criado_em::date = $1::date`,
    [data]
  );

  const { entradas, saidas } = resultado.rows[0];
  res.json({
    data,
    entradas: Number(entradas),
    saidas: Number(saidas),
    saldo: Number(entradas) - Number(saidas),
  });
});

// Fechamento do mês: total de entradas, saídas e saldo
router.get('/resumo/mes', async (req, res) => {
  const hoje = new Date();
  const ano = Number(req.query.ano) || hoje.getFullYear();
  const mes = Number(req.query.mes) || hoje.getMonth() + 1; // 1-12

  const resultado = await pool.query(
    `SELECT
       COALESCE(SUM(valor) FILTER (WHERE tipo = 'entrada'), 0) AS entradas,
       COALESCE(SUM(valor) FILTER (WHERE tipo = 'saida'), 0) AS saidas
     FROM lancamentos
     WHERE EXTRACT(YEAR FROM criado_em) = $1
       AND EXTRACT(MONTH FROM criado_em) = $2`,
    [ano, mes]
  );

  const { entradas, saidas } = resultado.rows[0];
  res.json({
    ano,
    mes,
    entradas: Number(entradas),
    saidas: Number(saidas),
    saldo: Number(entradas) - Number(saidas),
  });
});

module.exports = router;
