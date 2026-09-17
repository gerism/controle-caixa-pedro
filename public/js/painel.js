function formatarReal(numero) {
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function checarLogin() {
  const resposta = await fetch('/api/auth/me');
  if (!resposta.ok) {
    window.location.href = '/login.html';
  }
}

async function carregarResumoDia() {
  const resposta = await fetch('/api/lancamentos/resumo/dia');
  const dados = await resposta.json();
  document.getElementById('resumo-entradas').textContent = formatarReal(dados.entradas);
  document.getElementById('resumo-saidas').textContent = formatarReal(dados.saidas);
  document.getElementById('resumo-saldo').textContent = formatarReal(dados.saldo);
}

async function carregarResumoMes() {
  const resposta = await fetch('/api/lancamentos/resumo/mes');
  const dados = await resposta.json();
  document.getElementById('mes-entradas').textContent = formatarReal(dados.entradas);
  document.getElementById('mes-saidas').textContent = formatarReal(dados.saidas);
  document.getElementById('mes-saldo').textContent = formatarReal(dados.saldo);
}

async function carregarLista() {
  const resposta = await fetch('/api/lancamentos');
  const itens = await resposta.json();
  const lista = document.getElementById('lista-lancamentos');
  lista.innerHTML = '';

  if (itens.length === 0) {
    lista.innerHTML = '<div style="color: #8A8272; font-size: 14px;">Nenhum lançamento hoje ainda.</div>';
    return;
  }

  itens.forEach((item) => {
    const hora = new Date(item.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const cor = item.tipo === 'entrada' ? 'entrada-cor' : 'saida-cor';
    const sinal = item.tipo === 'entrada' ? '+' : '-';

    const linha = document.createElement('div');
    linha.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F1EDE3; font-size: 14px;';
    linha.innerHTML = `
      <span style="color: #8A8272; width: 50px;">${hora}</span>
      <span style="flex: 1;">${item.descricao} <span style="color: #8A8272;">· ${item.categoria}</span></span>
      <span class="${cor}" style="font-weight: 600;">${sinal}${formatarReal(Number(item.valor)).replace('R$', '').trim()}</span>
    `;
    lista.appendChild(linha);
  });
}

async function atualizarTudo() {
  await Promise.all([carregarResumoDia(), carregarResumoMes(), carregarLista()]);
}

// Alternar entre Entrada / Saída
const botoesTipo = document.querySelectorAll('.botao-tipo');
const campoTipo = document.getElementById('tipo');
botoesTipo.forEach((botao) => {
  botao.addEventListener('click', () => {
    campoTipo.value = botao.dataset.tipo;
    botoesTipo.forEach((b) => {
      const ativo = b === botao;
      b.style.background = ativo ? (b.dataset.tipo === 'entrada' ? '#2E6B4F' : '#B4432E') : 'transparent';
      b.style.color = ativo ? '#FFFFFF' : '#6E6656';
    });
  });
});
// Marca "Entrada" como padrão selecionado ao carregar a página
document.querySelector('[data-tipo="entrada"]').click();

// Envio do formulário
const form = document.getElementById('form-lancamento');
const mensagemErro = document.getElementById('mensagem-erro');

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = '';

  const corpo = {
    tipo: campoTipo.value,
    valor: document.getElementById('valor').value,
    descricao: document.getElementById('descricao').value,
    categoria: document.getElementById('categoria').value,
  };

  const resposta = await fetch('/api/lancamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });

  if (resposta.ok) {
    form.reset();
    document.querySelector('[data-tipo="entrada"]').click();
    await atualizarTudo();
  } else {
    const dados = await resposta.json().catch(() => ({}));
    mensagemErro.textContent = dados.erro || 'Não foi possível salvar';
  }
});

// Sair
document.getElementById('btn-sair').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

// Trocar senha
const formSenha = document.getElementById('form-senha');
const mensagemSenha = document.getElementById('mensagem-senha');

formSenha.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemSenha.textContent = '';
  mensagemSenha.style.color = '';

  const senhaAtual = document.getElementById('senha-atual').value.trim();
  const novaSenha = document.getElementById('senha-nova').value.trim();

  const resposta = await fetch('/api/auth/trocar-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senhaAtual, novaSenha }),
  });

  if (resposta.ok) {
    formSenha.reset();
    mensagemSenha.style.color = '#2E6B4F';
    mensagemSenha.textContent = 'Senha alterada com sucesso.';
  } else {
    const dados = await resposta.json().catch(() => ({}));
    mensagemSenha.textContent = dados.erro || 'Não foi possível trocar a senha';
  }
});

checarLogin().then(atualizarTudo);
