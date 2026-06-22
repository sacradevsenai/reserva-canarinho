# ReservaCanarinho — Gestão Dinâmica de Mesas e No-Show

Protótipo funcional **Front-End (HTML/CSS/JS puro)** para simular um sistema de reservas de mesas em dias de jogo do Brasil, com foco em reduzir **no-show** (clientes que reservam e não aparecem).

Este projeto não possui backend/banco de dados: os dados são persistidos no navegador via **localStorage**.

---

## Link (GitHub Pages)
> (https://sacradevsenai.github.io/reserva-canarinho/index.html)

---

## Tecnologias
- HTML5 + CSS3
- JavaScript (DOM + localStorage)
- Biblioteca local: **qrcode.min.js** (geração de QR Code)

---

## Perfis e Acesso
O sistema possui dois perfis:

### Cliente
- Cria reserva
- Realiza pagamento simulado
- Visualiza reserva confirmada no perfil (código + QR)
- Pode cancelar reserva confirmada no perfil

### Admin (Garçom/Operacional)
- Painel operacional (métricas + mini-mapa)
- Check-in (validação de código)
- Rotina de no-show (cancelamento automático)
- Encerrar mesa ocupada (liberar mesa)
- Gerenciar fila de espera (alocar cliente em mesa livre)

### Como virar Admin
No cadastro, qualquer usuário com e-mail no domínio:
- `@reservacanarinho.com`
é cadastrado como **admin**.

---

## Fluxo Principal (Cliente)
1. **Mesas**: visualizar mapa e selecionar mesa livre  
2. **Reserva**: selecionar jogo (Jogo do Dia) e número de pessoas  
3. **Pagamento (simulado)**: confirmar pagamento  
4. **Perfil (users.html)**: ver resumo, **código de check-in** e **QR Code**  
5. (Opcional) Cancelar reserva confirmada no perfil

---

## Regras de Negócio Implementadas (resumo)
### Estados da Mesa
- `livre` → `reservada` → `ocupada` → `livre`
- A mesa pode ficar **reservada** ainda durante reserva **pendente**, para evitar dupla reserva.

### Caução (Sinal)
Cálculo:
- Base: R$ 20 (jogos do Brasil) / R$ 30 (final)
- VIP: +50% no valor  
Fórmula:
`valor = base × pessoas × (1 + fatorVIP)`

### Expiração do pagamento (anti-bloqueio)
Reservas **pendentes** expiram após **10 minutos**:
- status: `cancelada-expirada`
- mesa volta a `livre`
- pagamento fica bloqueado

### No-show (cancelamento automático)
Reservas **confirmadas** (pagas) sem check-in até o limite:
- limite = **30 min antes** do início do jogo
- status: `cancelada-noshow`
- caução: `retida`
- mesa volta a `livre`

### Check-in
- Código numérico é gerado após pagamento
- Admin valida o código em `checkin.html`
- Reserva vira `checkin` e mesa vira `ocupada`

### Encerramento manual (Admin)
- Admin pode encerrar mesa ocupada no mini-mapa
- Mesa volta a `livre`
- Reserva (se status `checkin`) vira `encerrada`

---

## Fila de Espera
- Quando **não há mesas livres**, aparece em `mesas.html` o botão **Entrar na fila de espera**
- O cliente entra na fila (dados persistidos no localStorage)
- O admin vê a fila no painel e pode **alocar o cliente na próxima mesa livre**
- Ao alocar:
  - mesa vira `ocupada`
  - é criado um registro em `reservas` com `status: "checkin"`
  - o cliente é removido da fila

---

## Jogo do Dia (dinâmica)
- Em `mesas.html`, existe um banner com o **Jogo do Dia** e uma lista de **próximos jogos**
- O sistema atualiza automaticamente o jogo ativo quando:
  - `agora >= (horário do jogo + 2h)`
- O modal de reserva usa o **jogo ativo** (travado), simulando a operação por “evento do dia”.

---

## Estrutura do Projeto

```text
.
.
├── css/
│   ├── checkin-styles.css    # Layout do painel de validação de códigos
│   ├── login-style.css       # Estilização das telas de acesso e cadastro
│   ├── mesas.css             # Matriz e grid dinâmico do mapa de mesas
│   ├── pagamento-style.css   # Mock da interface do gateway de pagamento
│   ├── style.css             # Identidade visual global e variáveis de cores
│   └── users-style.css       # Painel e área restrita do cliente (Perfil)
├── img/
│   └── logo.svg              # Identidade visual vetorizada do ReservaCanarinho
├── js/
│   ├── lib/
│   │   └── qrcode.min.js     # Engine de terceiros para renderização de QR Code
│   ├── auth.js               # Regras de login, registro e controle de sessão
│   ├── checkin.js            # Lógica de validação de tokens e querystrings
│   ├── mesas.js              # State machine das mesas, filtros e fluxos de reserva
│   ├── pagamento.js          # Cálculos de caução e geração de códigos pós-pago
│   └── script.js             # Inicializador global e triggers automáticos (setInterval)
├── cadastro.html             # View de registro de novas contas
├── checkin.html              # View operacional de recepção (Check-in)
├── index.html                # Landing page / Entrada da aplicação
├── login.html                # View de autenticação de usuários
├── mesas.html                # Mapa interativo de mesas e seleção de jogos
├── pagamento.html            # Módulo de checkout de segurança
├── README.md                 # Documentação técnica do repositório
└── users.html                # Painel do cliente e carteira de QR Codes
```

---

## Como rodar localmente
### Opção 1: VS Code + Live Server
1. Instale a extensão **Live Server**
2. Abra `index.html` com “Open with Live Server”

### Opção 2: servidor simples
Qualquer servidor estático funciona.

> Importante: por usar localStorage, o ideal é rodar sempre no **mesmo host/porta** (mesma origem).

---

## Reset/limpeza de dados (localStorage)
Se quiser começar do zero:
- Abra DevTools → Application → Local Storage
- Remova as chaves:
  - `usuarioLogado`, `usuarios`, `mesas`, `reservas`, `reservaAtual`, `filaEspera`, `jogoAtivoId`

---

## Observações / Limitações (escopo acadêmico)
- Sem backend: autenticação e persistência são simuladas no navegador (localStorage)
- QR Code é gerado no front-end e codifica um link para o check-in (ambiente local e GitHub Pages)
- “Do dia”/filtro por data real pode ser expandido, mas o protótipo demonstra as regras principais.

---

## Roteiro de Demonstração (rápido)
1) Cliente: reservar → pagar → visualizar QR no perfil  
2) Admin: validar check-in → mesa vira ocupada no mapa  
3) Sem check-in: no-show cancela e libera mesa automaticamente  
4) Lotação: cliente entra na fila → admin aloca em mesa livre  
5) Admin encerra mesa → volta a livre

---

## Autor(es)
- Victor Sacramento
- Erik Ferreira