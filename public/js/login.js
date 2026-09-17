const form = document.getElementById('form-login');
const mensagemErro = document.getElementById('mensagem-erro');

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensagemErro.textContent = '';

  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;

  const resposta = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha }),
  });

  if (resposta.ok) {
    window.location.href = '/painel.html';
  } else {
    const dados = await resposta.json().catch(() => ({}));
    mensagemErro.textContent = dados.erro || 'Não foi possível entrar';
  }
});
