const senha = document.getElementById("senha");
const olho = document.getElementById("olhoSenha");

olho.addEventListener("click", function () {
    // Alterna o tipo do input entre password e text
    if (senha.type === "password") {
        senha.type = "text";
        olho.textContent = "visibility_off"; // Altera o ícone para olho fechado
    } else {
        senha.type = "password";
        olho.textContent = "visibility"; // Altera o ícone para olho aberto
    }
});

