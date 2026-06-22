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

function simularRecuperacao(event) {
    // Evita que a página role para o topo ao clicar no "#"
    event.preventDefault(); 
    
    let email = prompt("Digite seu e-mail para recuperar a senha:");
    
    if (email) {
        alert("Sucesso! Um link fictício de recuperação foi enviado para: " + email);
        console.log("Simulação de backend para o e-mail:", email);
    }
}