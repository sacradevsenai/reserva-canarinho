// auth.js
// Responsável por: login, cadastro, logout e controle de perfil (cliente/admin)
// Lógica de redirecionamento e exibição de visão será implementada na quarta.

// ─── Constante de domínio admin ─────────────────────────────────────────────
const DOMINIO_ADMIN = "reservacanarinho.com";

// ─── Verifica se usuário está logado (chamado por todas as páginas protegidas) ─
function verificarSessao() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
        window.location.href = "login.html";
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

// Só roda a proteção de tela se NÃO for a página de login e NÃO for a página de cadastro
if (!document.getElementById("form-login") && !document.getElementById("form-cadastro")) {
    exibirVisao();
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

function fazerLogout() {
    // 1. Apaga a credencial do usuário logado
    localStorage.removeItem("usuarioLogado");
    
    // 2. Redireciona imediatamente para o login ou index
    window.location.href = "login.html";
}