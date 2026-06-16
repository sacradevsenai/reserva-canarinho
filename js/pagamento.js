// Pega os elemntos do resumo

const elMesa = document.getElementById("resumo-mesa");
const elJogo = document.getElementById("resumo-jogo");
const elPessoas = document.getElementById("resumo-pessoas");
const elCaucao = document.getElementById("resumo-caucao");

// ler a reserva em andamento
const reservaAtual = JSON.parse(localStorage.getItem("reservaAtual"));

// sem reserva, volta para páginas de mesas

if (!reservaAtual) {
  window.location.href = "mesas.html";
}

// preenchendo o card resumo


//formatação de moeda
function formatarBRL(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

if (reservaAtual) {
  const mesa = mesas.find(m => m.id === reservaAtual.mesaId);
  const jogo = jogos.find(j => j.id === reservaAtual.jogoId);

  elMesa.textContent = mesa ? `Mesa ${mesa.numero} (${mesa.categoria})` : `Mesa ${reservaAtual.mesaId}`;
  elJogo.textContent = jogo ? jogo.descricao : `Jogo ${reservaAtual.jogoId}`;
  elPessoas.textContent = String(reservaAtual.numeroPessoas);
  elCaucao.textContent = formatarBRL(reservaAtual.caucao.valor);
}