// mesas.js
// Responsável por: dados de mesas e jogos, lógica de reserva e caução

// ─── Dados iniciais (mock) ───────────────────────────────────────────────────
const mesas = [
    { id: 1, numero: 1, capacidade: 4, categoria: "vip", status: "livre" },
    { id: 2, numero: 2, capacidade: 4, categoria: "vip", status: "livre" },
    { id: 3, numero: 3, capacidade: 6, categoria: "vip", status: "livre" },
    { id: 4, numero: 4, capacidade: 6, categoria: "vip", status: "livre" },
    { id: 5, numero: 5, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 6, numero: 6, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 7, numero: 7, capacidade: 8, categoria: "comum", status: "livre" },
    { id: 8, numero: 8, capacidade: 8, categoria: "comum", status: "livre" },
    { id: 9, numero: 9, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 10, numero: 10, capacidade: 4, categoria: "comum", status: "livre" },
    { id: 11, numero: 11, capacidade: 6, categoria: "comum", status: "livre" },
    { id: 12, numero: 12, capacidade: 6, categoria: "comum", status: "livre" },
];



const jogos = [
    // Fase de Grupos (Grupo C)
    { id: 1, descricao: "Brasil x Marrocos", dataHora: "2026-06-13T18:00", tipo: "brasil" },
    { id: 2, descricao: "Brasil x Haiti", dataHora: "2026-06-19T21:00", tipo: "fase de grupos" },
    { id: 3, descricao: "Escócia x Brasil", dataHora: "2026-06-24T19:00", tipo: "fase de grupos" },

    // Fase do Mata-Mata (Cenário de classificação)
    { id: 4, descricao: "Brasil x 3º Colocado (Grupo A/B/F)", dataHora: "2026-06-29T16:00", tipo: "brasil" },
    { id: 5, descricao: "Brasil x Espanha", dataHora: "2026-07-04T20:00", tipo: "oitavas de final" },
    { id: 6, descricao: "Brasil x Alemanha", dataHora: "2026-07-10T17:00", tipo: "quartas de final" },
    { id: 7, descricao: "Brasil x Argentina", dataHora: "2026-07-15T21:00", tipo: "semifinal" },

    // A Grande Final
    { id: 8, descricao: "Brasil x França", dataHora: "2026-07-19T17:00", tipo: "final" },
];

// ─── ORGANIZAÇÃO DOS JOGOS ───────────────────────────────────────────────────

function jogosOrdenados() {
    return [...jogos].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
}

function calcularJogoAtivoId() {
    const lista = jogosOrdenados();
    const agora = Date.now();

    for (let i = 0; i < lista.length; i++) {
        const inicio = new Date(lista[i].dataHora).getTime();
        const fim = inicio + (2 * 60 * 60 * 1000); // +2h

        // jogo ativo é o primeiro que ainda não "terminou há 2h"
        if (agora < fim) return lista[i].id;
    }
    return lista[0].id;
}

function setJogoAtivo(id) {
    localStorage.setItem("jogoAtivoId", String(id));
}

function getJogoAtivoId() {
    const salvo = localStorage.getItem("jogoAtivoId");
    if (salvo) return parseInt(salvo, 10);
    return calcularJogoAtivoId();
}

function renderPainelJogos() {
    const titulo = document.getElementById("jogo-atual-titulo");
    const horario = document.getElementById("jogo-atual-horario");
    const listaDiv = document.getElementById("lista-proximos-jogos");

    // Se não estiver na mesas.html, não faz nada
    if (!titulo || !horario || !listaDiv) return;

    const lista = jogosOrdenados();

    // atualiza automaticamente se já passou do jogo+2h
    const novoAtivo = calcularJogoAtivoId();
    const ativoSalvo = getJogoAtivoId();
    if (ativoSalvo !== novoAtivo) setJogoAtivo(novoAtivo);

    const ativoId = getJogoAtivoId();
    const jogoAtivo = lista.find(j => j.id === ativoId) || lista[0];

    titulo.textContent = `Jogo do dia: ${jogoAtivo.descricao}`;
    horario.textContent = `Horário: ${new Date(jogoAtivo.dataHora).toLocaleString("pt-BR")}`;

    // próximos 2
    const idx = lista.findIndex(j => j.id === jogoAtivo.id);
    const proximos = [];
    if (idx + 1 < lista.length) proximos.push(lista[idx + 1]);
    if (idx + 2 < lista.length) proximos.push(lista[idx + 2]);

    listaDiv.innerHTML = "";
    if (proximos.length === 0) {
        listaDiv.textContent = "Sem próximos jogos cadastrados.";
        return;
    }

    proximos.forEach(j => {
        const item = document.createElement("div");
        item.className = "proximo-jogo";
        item.textContent = `${j.descricao} — ${new Date(j.dataHora).toLocaleString("pt-BR")}`;
        listaDiv.appendChild(item);
    });
}

// montagem de options do select

function popularSelectJogos(selectEl) {
    // recria do zero (evita ficar desatualizado)
    selectEl.innerHTML = `<option value="" disabled>Selecione um jogo</option>`;

    jogos.forEach(j => {
        const opt = document.createElement("option");
        opt.value = String(j.id);
        opt.textContent = `${j.descricao} — ${new Date(j.dataHora).toLocaleString("pt-BR")}`;
        selectEl.appendChild(opt);
    });
}

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

    const select = document.getElementById("select-jogo");
    if (select) {
        popularSelectJogos(select);
        select.value = String(getJogoAtivoId());
        select.disabled = true; // trava: só reserva para o jogo do dia
    }
    atualizarCaucao();

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
        alert("Faça login para confirmar a reserva.");
        window.location.href = "login.html";
        return;
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
        codigoCheckin: null, // gerado em pagamento.html após confirmação

        clienteNome: usuario.nome,
        clienteEmail: usuario.email,
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

function aplicarStatusNoGrid() {
    const botoes = document.querySelectorAll(".area-das-mesas button");

    botoes.forEach(btn => {
        const id = parseInt(btn.dataset.id, 10);
        const mesa = mesas.find(m => m.id === id);
        if (!mesa) return;

        // atualiza o que seus filtros/cliques leem
        btn.dataset.status = mesa.status;

        // atualiza a classe visual (mantém vip-zone/commun-zone)
        btn.classList.remove("livre", "reservada", "ocupada");
        btn.classList.add(mesa.status);
    });
}

// FILA DE ESPERA

function carregarFilaEspera() {
    return JSON.parse(localStorage.getItem("filaEspera")) || [];
}

function salvarFilaEspera(fila) {
    localStorage.setItem("filaEspera", JSON.stringify(fila));
}

function atualizarUIFilaEspera() {
    const area = document.getElementById("fila-area");
    const btn = document.getElementById("btn-entrar-fila");
    if (!area || !btn) return;

    const livres = mesas.filter(m => m.status === "livre").length;

    if (livres === 0) {
        area.style.display = "block";
        btn.onclick = entrarNaFilaEspera;  // liga a ação aqui
    } else {
        area.style.display = "none";
        btn.onclick = null;                // desliga quando não precisa
    }
}

function entrarNaFilaEspera() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
        alert("Faça login para entrar na fila de espera.");
        window.location.href = "login.html";
        return;
    }

    if (usuario.tipo !== "cliente") {
        alert("A fila de espera é destinada aos clientes.");
        return;
    }

    const fila = carregarFilaEspera();

    // evita duplicar o mesmo cliente na fila
    const jaEsta = fila.some(p => p.clienteEmail === usuario.email);
    if (jaEsta) {
        alert("Você já está na fila de espera.");
        return;
    }

    // Dados mínimos (sem modal novo)
    const pessoas = parseInt(prompt("Quantas pessoas?", "2"), 10);
    if (!pessoas || pessoas < 1) {
        alert("Número de pessoas inválido.");
        return;
    }

    // escolhe um jogo por prompt simples (mantém seu nível)
    const jogoStr = prompt("Qual jogo? Digite 1, 2 ou 3", "1");
    const jogoId = parseInt(jogoStr, 10);
    if (![1, 2, 3].includes(jogoId)) {
        alert("Jogo inválido.");
        return;
    }

    fila.push({
        id: Date.now().toString(),
        clienteNome: usuario.nome,
        clienteEmail: usuario.email,
        numeroPessoas: pessoas,
        jogoId: jogoId,
        entrouEm: new Date().toISOString()
    });

    salvarFilaEspera(fila);
    alert("Você entrou na fila de espera. Aguarde liberação de mesa.");

}

// ─── Inicializa ──────────────────────────────────────────────────────────────
carregarMesas();
aplicarStatusNoGrid();
atualizarUIFilaEspera();

renderPainelJogos();
setInterval(renderPainelJogos, 10000); // atualiza painel a cada 10s (só UI)