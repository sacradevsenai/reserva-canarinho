// Pega os elemntos do resumo

const elMesa = document.getElementById("resumo-mesa");
const elJogo = document.getElementById("resumo-jogo");
const elPessoas = document.getElementById("resumo-pessoas");
const elCaucao = document.getElementById("resumo-caucao");

LIMITE_PAGAMENTO_MS = 10 * 60 * 1000

// ler a reserva em andamento
const reservaAtual = JSON.parse(localStorage.getItem("reservaAtual"));

// sem reserva, volta para páginas de mesas

if (!reservaAtual) {
    window.location.href = "mesas.html";
}


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

// CONFIGURAÇÃO BOTÃO VOLTAR NA PÁGINA DE PE PAGAMENTOS

const btnVoltar = document.getElementById("btn-voltar");

btnVoltar.addEventListener("click", function (e) {
    e.preventDefault();

    const reservaAtual = JSON.parse(localStorage.getItem("reservaAtual"));
    if (!reservaAtual) {
        window.location.href = "mesas.html";
        return;
    }

    //  libera a mesa
    alterarStatusMesa(reservaAtual.mesaId, "livre");

    //  remove a reserva pendente da lista
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const reservasAtualizadas = reservas.filter(r => r.id !== reservaAtual.id);
    localStorage.setItem("reservas", JSON.stringify(reservasAtualizadas));

    //  apaga a reservaAtual (checkout cancelado)
    localStorage.removeItem("reservaAtual");

    window.location.href = "mesas.html";
    // expiração do pagamento (10 min)
    const criadoMs = new Date(reservas[idx].dataCriacao).getTime();
    const expirou = Date.now() > criadoMs + (10 * 1000);

    if (expirou) {
        reservas[idx].status = "cancelada-expirada";
        reservas[idx].caucao.status = "nao-paga";

        alterarStatusMesa(reservas[idx].mesaId, "livre");

        localStorage.setItem("reservas", JSON.stringify(reservas));
        localStorage.setItem("reservaAtual", JSON.stringify(reservas[idx]));

        alert("Tempo para pagamento expirou (10 minutos). A mesa foi liberada.");
        window.location.href = "mesas.html";
        return;
    }

});

const btnConfirmar = document.getElementById("btn-confirmar-pagamento");

btnConfirmar.addEventListener("click", function (e) {
    e.preventDefault();

    const reservaAtual = JSON.parse(localStorage.getItem("reservaAtual"));
    if (!reservaAtual) {
        window.location.href = "mesas.html";
        return;
    }

    const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    const idx = reservas.findIndex(r => r.id === reservaAtual.id);

    if (idx === -1) {
        alert("Erro: reserva não encontrada.");
        window.location.href = "mesas.html";
        return;
    }

    if (reservas[idx].status !== "pendente") {
        alert("Esta reserva não está mais pendente.");
        window.location.href = "users.html";
        return;
    }

    // ---- Expiração de pagamento (pendente por tempo demais) ----
    const criadoMs = new Date(reservas[idx].dataCriacao).getTime();
    const expirou = Date.now() > criadoMs + LIMITE_PAGAMENTO_MS;

    if (expirou) {
        reservas[idx].status = "cancelada-expirada";
        reservas[idx].caucao.status = "nao-paga";

        alterarStatusMesa(reservas[idx].mesaId, "livre");

        localStorage.setItem("reservas", JSON.stringify(reservas));
        localStorage.setItem("reservaAtual", JSON.stringify(reservas[idx]));

        alert("Tempo para pagamento expirou. A mesa foi liberada.");
        window.location.href = "mesas.html";
        return;
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));

    reservas[idx].status = "confirmada";
    reservas[idx].caucao.status = "pago";
    reservas[idx].codigoCheckin = codigo;
    reservas[idx].dataConfirmacao = new Date().toISOString();
    reservas[idx].checkinUrl = `checkin.html?codigo=${codigo}`;

    localStorage.setItem("reservas", JSON.stringify(reservas));
    localStorage.setItem("reservaAtual", JSON.stringify(reservas[idx]));

    window.location.href = "users.html";
});