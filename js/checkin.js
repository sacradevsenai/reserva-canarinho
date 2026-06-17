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

    reservas.forEach(reserva => {
        if (reserva.status !== "confirmada") return;

        const jogo = jogos.find(j => j.id === reserva.jogoId);
        if (!jogo) return;

        const horarioLimite = new Date(new Date(jogo.dataHora).getTime() - 30 * 60 * 1000);
        if (new Date() > horarioLimite) {
            reserva.status = "cancelada-noshow";
            // Retém caução (apenas marca — sem integração real)
            reserva.caucao.status = "retida";
            alterarStatusMesa(reserva.mesaId, "livre");
            houveCancelamento = true;
        }
    });

    if (houveCancelamento) {
        localStorage.setItem("reservas", JSON.stringify(reservas));
        if (typeof aplicarStatusNoGrid === "function") aplicarStatusNoGrid();

        const rawReservaAtual = localStorage.getItem("reservaAtual");

        if (rawReservaAtual) {
            const reservaAtual = JSON.parse(rawReservaAtual);

            // Procura no array "reservas" a reserva com o mesmo id da reservaAtual
            const atualizada = reservas.find(r => r.id === reservaAtual.id);

            if (atualizada) {
                // Salva a versão atualizada (agora ela pode estar cancelada-noshow/retida)
                localStorage.setItem("reservaAtual", JSON.stringify(atualizada));
            } else {
                // Se por algum motivo não existir mais, remove
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
    
