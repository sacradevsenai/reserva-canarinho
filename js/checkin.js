// checkin.js
// Responsável por: validação de código de check-in e cancelamento automático

// ─── Pré-preenche o código se vier pela URL (?codigo=XXXXXX) ───────────────
const inputCodigo = document.getElementById("codigo-checkin");
const params = new URLSearchParams(window.location.search);
const codigoUrl = params.get("codigo");

if (inputCodigo && codigoUrl) {
    inputCodigo.value = codigoUrl.trim();
}

// ─── Validação de check-in ───────────────────────────────────────────────────
function validarCheckin(codigo) {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    // Busca reserva com esse código e status confirmada
    const reserva = reservas.find(r =>
        r.codigoCheckin === codigo && r.status === "confirmada"
    );

    if (!reserva) return { sucesso: false, mensagem: "Código inválido ou reserva não confirmada." };

    // Verifica prazo limite (RF21): não permite check-in após horário limite
    const jogo = jogos.find(j => j.id === reserva.jogoId);
    const horarioLimite = new Date(new Date(jogo.dataHora).getTime() - 30 * 60 * 1000);
    if (new Date() > horarioLimite) {
        return { sucesso: false, mensagem: "Prazo para check-in encerrado." };
    }

    // Atualiza status da reserva e da mesa
    reserva.status = "checkin";
    reserva.horarioCheckin = new Date().toISOString();
    alterarStatusMesa(reserva.mesaId, "ocupada");
    localStorage.setItem("reservas", JSON.stringify(reservas));

    return { sucesso: true, reserva };
}

// ─── Cancelamento automático (RN02 / RF13) ───────────────────────────────────
// Varredura a cada 30s: cancela reservas "confirmada" que passaram do prazo
function rotinaCancelamentoAutomatico() {
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    let houveCancelamento = false;

    const agoraMs = Date.now();
    const LIMITE_PAGAMENTO_MS = 10 * 60 * 1000; // 10 minutos

    reservas.forEach(reserva => {

        // --- (A) EXPIRAÇÃO DE PAGAMENTO: reserva pendente por +10min ---
        if (reserva.status === "pendente") {
            const criadoMs = new Date(reserva.dataCriacao).getTime();

            if (agoraMs > criadoMs + LIMITE_PAGAMENTO_MS) {
                reserva.status = "cancelada-expirada";
                // não pagou, então não retém caução; só marca como não paga
                if (reserva.caucao) reserva.caucao.status = "nao-paga";

                alterarStatusMesa(reserva.mesaId, "livre");
                houveCancelamento = true;
            }

            return; // não precisa checar no-show se ainda era pendente
        }

        // --- (B) NO-SHOW: reserva confirmada e passou do prazo (30 min antes do jogo) ---
        if (reserva.status !== "confirmada") return;

        const jogo = jogos.find(j => j.id === reserva.jogoId);
        if (!jogo) return;

        const horarioLimite = new Date(new Date(jogo.dataHora).getTime() - 30 * 60 * 1000);

        if (new Date() > horarioLimite) {
            reserva.status = "cancelada-noshow";
            reserva.caucao.status = "retida";

            alterarStatusMesa(reserva.mesaId, "livre");
            houveCancelamento = true;
        }
    });

    if (houveCancelamento) {
        localStorage.setItem("reservas", JSON.stringify(reservas));

        // Atualiza o mapa (se estiver na página de mesas)
        if (typeof aplicarStatusNoGrid === "function") aplicarStatusNoGrid();

        // Sincroniza reservaAtual (para o users deixar de mostrar reserva ativa)
        const rawReservaAtual = localStorage.getItem("reservaAtual");
        if (rawReservaAtual) {
            const reservaAtual = JSON.parse(rawReservaAtual);
            const atualizada = reservas.find(r => r.id === reservaAtual.id);

            if (atualizada) {
                localStorage.setItem("reservaAtual", JSON.stringify(atualizada));
            } else {
                localStorage.removeItem("reservaAtual");
            }
        }
    }
}

// ─── Inicia a rotina automática ao carregar qualquer página com este script ──
// Intervalo em 30s (pode ser reduzido para demonstração)
setInterval(rotinaCancelamentoAutomatico, 30000);
rotinaCancelamentoAutomatico(); // executa imediatamente ao carregar

// ─── Listener do botão de check-in (só ativo em checkin.html) ───────────────
const btnCheckin = document.getElementById("btn-fazer-checkin");
if (btnCheckin) {
    btnCheckin.addEventListener("click", function () {
        const codigo = document.getElementById("codigo-checkin").value.trim().toUpperCase();
        const feedback = document.getElementById("checkin-feedback");
        const mensagem = document.getElementById("checkin-mensagem");

        const resultado = validarCheckin(codigo);

        feedback.style.display = "block";
        feedback.className = "checkin-feedback " + (resultado.sucesso ? "sucesso" : "erro");
        mensagem.textContent = resultado.sucesso
            ? "Check-in realizado com sucesso!"
            : resultado.mensagem;

        if (resultado.sucesso) {
            // Exibe card de confirmação
            const cardConfirmado = document.getElementById("card-confirmado");
            if (cardConfirmado) {
                cardConfirmado.style.display = "block";
                const jogo = jogos.find(j => j.id === resultado.reserva.jogoId);
                document.getElementById("confirmado-mesa").textContent = `Mesa ${resultado.reserva.mesaId}`;
                document.getElementById("confirmado-jogo").textContent = jogo ? jogo.descricao : "—";
            }
        }
    });
}

