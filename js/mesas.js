// mesas.js
// Responsável por: dados de mesas e jogos, lógica de reserva e caução
// Implementação completa na quarta.


// ─── Dados iniciais (mock) ───────────────────────────────────────────────────
const mesas = [
    { id: 1, numero: 1, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 2, numero: 2, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 3, numero: 3, capacidade: 6, categoria: "comum", status: "livre" },
    { id: 4, numero: 4, capacidade: 6, categoria: "comum", status: "livre" },
    { id: 5, numero: 5, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 6, numero: 6, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 7, numero: 7, capacidade: 8, categoria: "vip", status: "livre" },
    { id: 8, numero: 8, capacidade: 8, categoria: "vip", status: "livre" },
    { id: 9, numero: 9, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 10, numero: 10, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 11, numero: 11, capacidade: 6, categoria: "comum", status: "livre" },
    { id: 12, numero: 12, capacidade: 6, categoria: "comum", status: "livre" },
];

const jogos = [
    { id: 1, descricao: "Brasil x Argentina", dataHora: "2026-06-20T18:00", tipo: "brasil" },
    { id: 2, descricao: "Brasil x França", dataHora: "2026-06-24T15:00", tipo: "brasil" },
    { id: 3, descricao: "Final da Copa", dataHora: "2026-06-28T20:00", tipo: "final" },
];

// ─── Cálculo de caução (RN03) ────────────────────────────────────────────────
function calcularCaucao(jogo, mesa, numeroPessoas) {
    const valorBase = jogo.tipo === "final" ? 30 : 20;
    const fatorVip = mesa.categoria === "vip" ? 0.5 : 0;
    return valorBase * numeroPessoas * (1 + fatorVip);
}

// ─── Alteração de status de mesa ─────────────────────────────────────────────
function alterarStatusMesa(mesaId, novoStatus) {
    const mesa = mesas.find(m => m.id === mesaId);
    if (mesa) {
        mesa.status = novoStatus;
        salvarMesas();
    }
}

// ─── Persistência ────────────────────────────────────────────────────────────
function salvarMesas() {
    localStorage.setItem("mesas", JSON.stringify(mesas));
}

function carregarMesas() {
    const salvas = localStorage.getItem("mesas");
    if (salvas) {
        const dadosSalvos = JSON.parse(salvas);
        dadosSalvos.forEach((m, i) => { mesas[i].status = m.status; });
    }
}

// ─── Modal de reserva ─────────────────────────────────────────────────────────

// Guarda a mesa selecionada enquanto o modal está aberto
let mesaSelecionada = null;

function abrirModal(mesa) {
    mesaSelecionada = mesa;

    // Preenche cabeçalho do modal
    document.getElementById("modal-titulo").textContent =
        `Mesa ${mesa.numero}`;
    document.getElementById("modal-subtitulo").textContent =
        `${mesa.capacidade} pessoas · ${mesa.categoria === "vip" ? "VIP" : "Comum"}`;

    // Reseta campos
    document.getElementById("select-jogo").value = "";
    document.getElementById("input-pessoas").value = "";
    document.getElementById("input-pessoas").max = mesa.capacidade;
    document.getElementById("aviso-capacidade").textContent = "";
    document.getElementById("modal-caucao").style.display = "none";
    document.getElementById("btn-reservar").disabled = true;

    // Exibe o modal
    document.getElementById("modal-overlay").style.display = "flex";
}

function fecharModal() {
    mesaSelecionada = null;
    document.getElementById("modal-overlay").style.display = "none";
}

function atualizarCaucao() {
    const jogoId = parseInt(document.getElementById("select-jogo").value);
    const pessoas = parseInt(document.getElementById("input-pessoas").value);
    const aviso = document.getElementById("aviso-capacidade");
    const btnRes = document.getElementById("btn-reservar");
    const divCaucao = document.getElementById("modal-caucao");

    // Valida campos
    if (!jogoId || !pessoas || pessoas < 1) {
        divCaucao.style.display = "none";
        btnRes.disabled = true;
        return;
    }

    // Valida capacidade da mesa
    if (pessoas > mesaSelecionada.capacidade) {
        aviso.textContent = `Capacidade máxima: ${mesaSelecionada.capacidade} pessoas.`;
        divCaucao.style.display = "none";
        btnRes.disabled = true;
        return;
    }

    aviso.textContent = "";

    // Calcula e exibe caução (RN03)
    const jogo = jogos.find(j => j.id === jogoId);
    const valor = calcularCaucao(jogo, mesaSelecionada, pessoas);

    document.getElementById("caucao-valor").textContent =
        `R$ ${valor.toFixed(2).replace(".", ",")}`;
    divCaucao.style.display = "flex";
    btnRes.disabled = false;
}

function confirmarReserva() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
        window.location.href = "login.html";
    }

    const jogoId = parseInt(document.getElementById("select-jogo").value);
    const pessoas = parseInt(document.getElementById("input-pessoas").value);
    const jogo = jogos.find(j => j.id === jogoId);
    const valor = calcularCaucao(jogo, mesaSelecionada, pessoas);

    // Monta objeto de reserva e salva no localStorage (RF11, RF12, RF16)
    const reserva = {
        id: Date.now().toString(),
        mesaId: mesaSelecionada.id,
        jogoId: jogoId,
        numeroPessoas: pessoas,
        dataCriacao: new Date().toISOString(),
        status: "pendente", // pendente até confirmação em pagamento.html
        caucao: {
            valor: valor,
            status: "pendente"
        },
        codigoCheckin: null // gerado em pagamento.html após confirmação
    };

    // Salva reserva pendente
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    localStorage.setItem("reservaAtual", JSON.stringify(reserva));

    // Altera status da mesa para reservada
    alterarStatusMesa(mesaSelecionada.id, "reservada");

    fecharModal();

    // Redireciona para pagamento
    window.location.href = "pagamento.html";
}

// ─── Listeners do modal ───────────────────────────────────────────────────────
document.getElementById("modal-fechar")
    ?.addEventListener("click", fecharModal);
document.getElementById("btn-cancelar-modal")
    ?.addEventListener("click", fecharModal);
document.getElementById("modal-overlay")
    ?.addEventListener("click", function (e) {
        // Fecha ao clicar fora do card (no overlay)
        if (e.target === this) fecharModal();
    });
document.getElementById("select-jogo")
    ?.addEventListener("change", atualizarCaucao);
document.getElementById("input-pessoas")
    ?.addEventListener("input", atualizarCaucao);
document.getElementById("btn-reservar")
    ?.addEventListener("click", confirmarReserva);

// ─── Listeners do grid de mesas ──────────────────────────────────────────────
document.querySelectorAll(".area-das-mesas button").forEach(btn => {
    btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        const status = this.dataset.status || "livre";

        // Só abre modal em mesas livres
        if (status !== "livre") return;

        const mesa = mesas.find(m => m.id === id);
        if (mesa) abrirModal(mesa);
    });
});

// ─── Listeners das abas de filtro ────────────────────────────────────────────
document.querySelectorAll(".status button").forEach(btn => {
    btn.addEventListener("click", function () {
        // Marca aba ativa
        document.querySelectorAll(".status button")
            .forEach(b => b.classList.remove("aba-ativa"));
        this.classList.add("aba-ativa");

        const filtro = this.id; // "todos", "livre", "reservado", "ocupado"

        document.querySelectorAll(".area-das-mesas button").forEach(mesa => {
            const status = mesa.dataset.status || "livre";

            if (filtro === "todos") {
                mesa.classList.remove("oculta");
            } else if (filtro === "reservado" && status === "reservada") {
                mesa.classList.remove("oculta");
            } else if (filtro === "ocupado" && status === "ocupada") {
                mesa.classList.remove("oculta");
            } else if (filtro === "livre" && status === "livre") {
                mesa.classList.remove("oculta");
            } else {
                mesa.classList.add("oculta");
            }
        });
    });
});

// ─── Inicializa ──────────────────────────────────────────────────────────────
carregarMesas();