<p align="center">
  <img src="imgs/Logo_extensao_Hyper_Dark.png" width="200" alt="HyperDark Logo">
</p>

<h1 align="center">HyperDark</h1>

<p align="center">
  <strong>O Ambiente Cyberpunk Definitivo para Desenvolvedores Web</strong>
</p>

<p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=lucaskawatoko.hyperdark">
        <img src="https://img.shields.io/badge/Vers%C3%A3o-1.0.0-ff00ff?style=flat-square" alt="Version">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=lucaskawatoko.hyperdark">
        <img src="https://img.shields.io/badge/Instala%C3%A7%C3%B5es-Iniciando-00ffcc?style=flat-square" alt="Installs">
    </a>
    <a href="https://github.com/lucaskawatoko/HyperDark/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/lucaskawatoko/HyperDark?color=ffff00&style=flat-square" alt="License">
    </a>
</p>

<p align="center">
  Themes • Live Server • Smart Tools • Pomodoro • Cursor Control
</p>

---

## ⚡ O que é a HyperDark?

A **HyperDark** não é apenas um tema. É uma **suíte de produtividade All-in-One** projetada para o desenvolvedor moderno que busca estética e performance.

Combinamos um **Live Server** ultrarrápido, ferramentas inteligentes de **CSS**, controle avançado de **Editor** e um **Timer de Foco** em uma única extensão leve. Em vez de instalar 5 plugins diferentes que pesam no seu VS Code, a HyperDark entrega tudo o que você precisa.

---

## 🚀 Funcionalidades Principais

### 1. 🎨 Realce de Cores Neon (Neon Glass)
Esqueça os quadradinhos de cores opacos. A HyperDark aplica um efeito de **"Vidro Neon"** translúcido sobre as cores no seu código.

* **Suporte Total:** Funciona com HEX, RGB, HSL e nomes de cores (ex: `red`).
* **Detecção de Variáveis:** Reconhece e colore automaticamente variáveis CSS (`var(--primary)`) e SASS (`$color`).
* **Controle de Opacidade:** Você define se quer um brilho sutil (5%) ou uma cor sólida e vibrante.

### 2. ⚡ HyperServer (Live Server Integrado)
Inicie seus projetos HTML instantaneamente com zero configuração.

* **Auto Reload:** Salvou o arquivo? O navegador atualiza sozinho em milissegundos.
* **Smart Port:** Se a porta `5500` estiver ocupada, ele encontra outra automaticamente.

> **Como usar:** Clique no botão "Go Live" na barra inferior ou use o atalho `Alt + L`.

### 3. 🔍 Validador de Caminhos (Anti-404)
Evite quebrar links ou imagens em produção. A HyperDark escaneia seus atributos `src` e `href` enquanto você digita.

* **Feedback Visual:** Se o arquivo não existir na pasta, o caminho é sublinhado em **VERMELHO** imediatamente.
* **Suporte:** Funciona em HTML, CSS (`url()`), JS (`import`).

### 4. 📐 Conversor Inteligente (Px para Rem)
Abandone a calculadora. Ao passar o mouse sobre qualquer valor em `px` no seu CSS, a HyperDark calcula o equivalente em `rem` baseando-se em 16px.

**Exemplo de fluxo:**
1. Você digita: `font-size: 32px;`
2. Passa o mouse e vê o Tooltip: `Converter para 2rem`
3. Clica e o código é substituído automaticamente.

### 5. 🖱️ Customização Avançada do Cursor
Tenha controle total sobre a sensação de digitação sem precisar editar arquivos JSON complexos.

Nas configurações da extensão, você pode alterar:
* **Estilo:** Linha, Bloco, Sublinhado ou contornos.
* **Animação de Piscar:** Expandir (efeito respiração), Suave, Piscar seco ou Sólido.
* **Movimento Suave:** Ative o `Smooth Caret` para que o cursor deslize suavemente entre as letras ao digitar.

### 6. 🍅 Relógio de Foco (Pomodoro)
Mantenha o "Flow State". Um relógio discreto na barra de status que vira seu aliado de produtividade.

* **Modo Foco:** Clique no relógio para iniciar timers de 15, 25 ou 60 minutos.
* **Feedback Visual:** O ícone muda para 🔥 e fica **Rosa Neon** durante o foco.
* **Alerta de Descanso:** Quando o tempo acaba, um modal avisa que é hora de esticar as pernas.

### 7. 💻 Console Logs Neon
Debugar com estilo. Selecione uma variável no seu JS e use o comando para gerar um log colorido.

* **Comando:** `Botão Direito > HyperDark: Insert Neon Log`
* **Resultado:** Gera um `console.log` estilizado com cores de alto contraste para fácil leitura no DevTools.

---

## ⚙️ Personalização (Settings)

Você está no controle total. Acesse `Configurações > HyperDark` (`Ctrl + ,`) para ajustar:

### Aparência & Tema
| Configuração | Descrição | Padrão |
| :--- | :--- | :--- |
| `hyperdark.themeEnabled` | Ativa as cores do tema principal. | `true` |
| `hyperdark.selectedTheme` | Alterna entre modo `Dark` (Cyberpunk) ou `Light`. | `dark` |
| `hyperdark.enableGlow` | Ativa o efeito de brilho neon nas cores. | `true` |
| `hyperdark.opacity` | Intensidade do efeito vidro (0.05 a 1.0). | `0.15` |

### Editor & Cursor
| Configuração | Descrição | Padrão |
| :--- | :--- | :--- |
| `hyperdark.cursorStyle` | Formato do cursor (block, line, underline, etc). | `line` |
| `hyperdark.cursorBlinking` | Animação de espera (expand, blink, solid). | `expand` |
| `hyperdark.cursorSmoothAnimation` | Movimento suave ao digitar (`on`/`off`). | `on` |

### Ferramentas
| Configuração | Descrição | Padrão |
| :--- | :--- | :--- |
| `hyperdark.showClock` | Exibe o relógio/pomodoro na barra de status. | `true` |
| `hyperdark.enablePxToRem` | Ativa o conversor no hover do mouse. | `true` |
| `hyperdark.liveServerPort` | Define a porta preferencial do servidor. | `5500` |

---

## ⌨️ Atalhos de Teclado

| Ação | Atalho (Win/Linux) | Atalho (Mac) |
| :--- | :--- | :--- |
| **Iniciar Server** | `Alt + L` | `Opt + L` |
| **Parar Server** | `Alt + Q` | `Opt + Q` |
| **Ligar/Desligar Neon** | `Alt + G` | `Opt + G` |

---

## 🤝 Contribuição e Suporte

Encontrou um bug ou tem uma ideia para deixar a extensão ainda mais Cyberpunk?
Abra uma issue no nosso **[Repositório GitHub](https://github.com/lucaskawatoko/HyperDark)**.