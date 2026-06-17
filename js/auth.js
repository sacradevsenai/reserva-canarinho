// auth.js
// Responsável por: login, cadastro, logout e controle de perfil (cliente/admin)
// Lógica de redirecionamento e exibição de visão será implementada na quarta.

// ─── Constante de domínio admin ─────────────────────────────────────────────
const DOMINIO_ADMIN = "reservacanarinho.com";

// ORGANIZAÇÃO DO NAVBAR

function lerUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem("usuarioLogado"));
    } catch {
        return null;
    }
}

function setVisivelNav(idLink, visivel) {
    const link = document.getElementById(idLink);
    if (!link) return;

    // esconde o <li> inteiro (melhor que esconder só o <a>)
    const item = link.closest("li") || link;
    item.style.display = visivel ? "" : "none";
}

function atualizarNavbar() {
    const usuario = lerUsuarioLogado();
    const logado = !!usuario;
    const admin = logado && usuario.tipo === "admin";

    setVisivelNav("nav-login", !logado);
    setVisivelNav("nav-cadastro", !logado);

    setVisivelNav("nav-perfil", logado);
    setVisivelNav("btn-logout", logado);

    setVisivelNav("nav-checkin", admin); // só admin vê
}

// ─── Verifica se usuário está logado (chamado por todas as páginas protegidas) ─
function verificarSessao() {
    let usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    } catch {
        usuario = null;
    }

    if (!usuario) {
        window.location.replace("login.html"); // melhor que href para evitar “voltar” e cair no guard de novo
        return null;
    }

    return usuario;
}

// ─── Define o tipo de usuário com base no domínio do email ──────────────────
function definirTipoUsuario(email) {
    // Se o email for do domínio interno, é admin. Caso contrário, cliente.
    const dominio = email.split("@")[1];
    return dominio === DOMINIO_ADMIN ? "admin" : "cliente";
}

// ─── Exibe a visão correta em users.html ────────────────────────────────────
function exibirVisao() {
    const usuario = verificarSessao();
    const visaoCliente = document.getElementById("visao-cliente");
    const visaoAdmin = document.getElementById("visao-admin");

    if (!visaoCliente || !visaoAdmin) return; // não está em users.html

    if (usuario.tipo === "admin") {
        visaoAdmin.style.display = "block";
        visaoCliente.style.display = "none";
        carregarDadosAdmin();
    } else {
        visaoCliente.style.display = "block";
        visaoAdmin.style.display = "none";
        carregarPerfilCliente(usuario);
    }
}

// ─── Carrega dados do perfil do cliente ─────────────────────────────────────
function carregarPerfilCliente(usuario) {
    // Avatar com iniciais
    const iniciais = usuario.nome
        .split(" ")
        .map(p => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    document.getElementById("avatar-iniciais").textContent = iniciais;

    document.getElementById("perfil-nome").textContent = usuario.nome;
    document.getElementById("perfil-email").textContent = usuario.email;
    document.getElementById("perfil-telefone").textContent = usuario.telefone || "—";

    // Verifica reserva ativa
    const reservaAtual = JSON.parse(localStorage.getItem("reservaAtual"));

    const blocoReserva = document.getElementById("reserva-ativa");
    const blocoSemReserva = document.getElementById("sem-reserva");

    if (reservaAtual && reservaAtual.status === "confirmada") {
        blocoReserva.style.display = "block"; // mostra a reseva
        blocoSemReserva.style.display = "none";

        const elMesa = document.getElementById("reserva-mesa"); // pega as inforamções da reserva
        const elJogo = document.getElementById("reserva-jogo");
        const elPessoas = document.getElementById("reserva-pessoas");
        const elStatus = document.getElementById("reserva-status");
        const elCodigo = document.getElementById("reserva-codigo");

        const mesa = mesas.find(m => m.id === reservaAtual.mesaId);
        const jogo = jogos.find(j => j.id === reservaAtual.jogoId);

        elMesa.textContent = mesa ? `Mesa ${mesa.numero} (${mesa.categoria === "vip" ? "VIP" : "Comum"})` : `Mesa ${reservaAtual.mesaId}`;
        elJogo.textContent = jogo ? jogo.descricao : `Jogo ${reservaAtual.jogoId}`;
        elPessoas.textContent = String(reservaAtual.numeroPessoas);
        elStatus.textContent = String(reservaAtual.status);
        elCodigo.textContent = String(reservaAtual.codigoCheckin);

        // construção do qrcode 

        const qrArea = document.getElementById("qr-area");
        if (qrArea) {
            qrArea.innerHTML = "";
            new QRCode(qrArea, {
                text: reservaAtual.checkinUrl,
                width: 160,
                height: 160
            });
        }

        // Botão para cancelar reserva em user

        const btnCancelar = document.getElementById('btn-cancelar-reserva');

        btnCancelar.onclick = function (e) {
            e.preventDefault();

            const ok = confirm('Deseja cancelar sua reserva? Isso liberará a mesa.');
            if (!ok) return;

            if (!reservaAtual) return;

            // liberando a mesa

            alterarStatusMesa(reservaAtual.mesaId, 'livre');

            // removendo a reserva
            const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
            const reservasAtualizadas = reservas.filter(r => r.id !== reservaAtual.id);

            localStorage.setItem("reservas", JSON.stringify(reservasAtualizadas));

            // apaga a reserva atual

            localStorage.removeItem('reservaAtual');

            // Atualiza a tela

            blocoReserva.style.display = 'none';
            blocoSemReserva.style.display = 'block';

        };

    } else {
        blocoReserva.style.display = "none";
        blocoSemReserva.style.display = "block"; // mostra que não há reserva
    }


    // TODO (quarta): implementar com mesas.js
}


// ─── Carrega dados do painel admin ──────────────────────────────────────────
function carregarDadosAdmin() {
    // TODO (quarta): puxar mesas e reservas do localStorage e popular métricas/tabela
}

// ─── Logout ──────────────────────────────────────────────────────────────────
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
    });
}

// ─── Inicializa ao carregar a página ────────────────────────────────────────

const formularioCadastro = document.getElementById("form-cadastro");

if (formularioCadastro) {
    formularioCadastro.addEventListener("submit", function (e) {
        e.preventDefault();
        const nomeUsuario = document.getElementById("nome").value;
        const emailUsuario = document.getElementById("emailCadastro").value;
        const telUsuario = document.getElementById("telefone").value;
        const senhaUsuario = document.getElementById("senha").value;

        const novoUsuario = {
            nome: nomeUsuario,
            email: emailUsuario,
            telefone: telUsuario,
            senha: senhaUsuario,
            tipo: "cliente" // Por padrão, todo mundo começa como cliente
        };

        // . USA A SUA CONSTANTE! Se o e-mail tiver o domínio do bar, muda o tipo para admin
        if (emailUsuario.includes(DOMINIO_ADMIN)) {
            novoUsuario.tipo = "admin";
        }

        // Tenta buscar a lista de usuários que já existe na caderneta
        let listaUsuarios = JSON.parse(localStorage.getItem("usuarios"));

        // Se a caderneta estiver totalmente em branco (null), cria uma lista vazia []
        if (listaUsuarios === null) {
            listaUsuarios = [];
        }

        // Coloca o pacote do "novoUsuario" dentro dessa lista
        listaUsuarios.push(novoUsuario);

        // Salva a lista atualizada de volta na caderneta (transformando em texto com stringify)
        localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));

        // Avisa que deu certo e manda o usuário para a tela de login
        alert("Usuário cadastrado com sucesso!");
        window.location.href = "login.html";
    });
}


// Captura o formulário de login do HTML usando o ID dele
const formularioLogin = document.getElementById("form-login");

if (formularioLogin) {

    // . Fica escutando o clique no botão "Entrar" (submit)
    formularioLogin.addEventListener("submit", function (e) {

        // . Trava o recarregamento automático da página
        e.preventDefault();

        // . Pega os valores digitados pelo usuário nas caixas de texto
        const emailDigitado = document.getElementById("login").value;
        const senhaDigitada = document.getElementById("senha").value;

        // Vai no localStorage e lê a lista de usuários que já cadastramos
        let listaUsuarios = JSON.parse(localStorage.getItem("usuarios"));

        if (listaUsuarios === null) {
            listaUsuarios = [];
        }

        // Cria uma caixinha vazia para guardar o usuário SE a gente encontrar ele
        let usuarioEncontrado = null;

        for (let i = 0; i < listaUsuarios.length; i++) {

            // Verifica se o e-mail e a senha da posição 'i' batem com o que foi digitado na tela
            if (listaUsuarios[i].email === emailDigitado && listaUsuarios[i].senha === senhaDigitada) {
                usuarioEncontrado = listaUsuarios[i];
                break; // Interrompe o laço imediatamente. Não precisa continuar procurando
            }
        }

        // Decisão final após o laço terminar de procurar
        if (usuarioEncontrado !== null) {

            // SE ACHOU: Cria a etiqueta "usuarioLogado" com os dados de quem entrou
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));

            window.location.href = "users.html"; // Manda para a dashboard protegida

        } else {
            // SE NÃO ACHOU (ou se a lista estava vazia e o laço nem rodou):
            alert("E-mail ou senha incorretos. Tente novamente.");
        }
    });
}

// 1) Navbar sempre (páginas públicas também)
// 1) Navbar sempre
atualizarNavbar();

// 2) Proteção só quando o HTML pedir
const paginaProtegida = document.body.dataset.protegida === "true";
const adminOnly = document.body.dataset.adminOnly === "true";

let usuarioSessao = lerUsuarioLogado();
let bloqueouNavegacao = false;

if (paginaProtegida) {
    usuarioSessao = verificarSessao(); // pode redirecionar

    if (!usuarioSessao) {
        bloqueouNavegacao = true; // não executa mais nada nesta carga
    } else if (adminOnly && usuarioSessao.tipo !== "admin") {
        window.location.replace("users.html");
        bloqueouNavegacao = true;
    }
}

// 3) Só monta visão users se não bloqueou
if (!bloqueouNavegacao) {
    const temVisaoUsers =
        document.getElementById("visao-cliente") || document.getElementById("visao-admin");

    if (temVisaoUsers) {
        exibirVisao();
    }
}