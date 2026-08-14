# James Allen: Mentalidade — Progressive Web App (PWA)

> **Missão:** Moldar a mente pelo pensamento. 21 dias para cultivar disciplina mental, sair do piloto automático e assumir responsabilidade pelo que você pensa — porque o homem é aquilo que ele pensa.

Aplicação Progressive Web App (PWA) moderna, instalável e 100% compatível com uso offline, baseada na obra de domínio público de **James Allen** (*As a Man Thinketh*, 1902).

---

## 🚀 Tecnologias & Arquitetura

- **Frontend Core**: Vite + React 19 + TypeScript
- **Gerenciamento de Estado & Rotas**: TanStack Query (cache com revalidação de 1h) + React Context State Machine
- **Estilização & Design System**: Tailwind CSS + Google Fonts (*Cormorant Garamond*, *Plus Jakarta Sans*)
- **Animações & Micro-interações**: Framer Motion + Canvas Confetti
- **Ícones**: Lucide React
- **Banco de Dados Local (Offline)**: IndexedDB via **Dexie** (persistência do diário, streaks, quizzes e favoritos sem necessidade de autenticação)
- **Integração Backend**: Consumo dos endpoints `/health`, `/content/<n>` e `/chat` (RAG com Professor Mentor)
- **PWA & Cache**: `vite-plugin-pwa` com manifesto WebApp, ícone vetorial e cache StaleWhileRevalidate

---

## 🛠️ Scripts NPM

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento local na porta 3000 |
| `npm run build` | Compila a aplicação para produção na pasta `dist/` |
| `npm run preview` | Testa localmente a build de produção |
| `npm run lint` | Executa validação de tipagem com TypeScript |

---

## 📱 Instalação PWA

O app inclui manifesto e Service Worker configurados:
- **No celular (iOS/Safari)**: Toque no botão de Compartilhar e selecione *"Adicionar à Tela de Início"*.
- **No celular (Android/Chrome)**: Toque no banner inteligente *"Instalar James Allen no celular"* ou no menu de 3 pontos > *"Instalar aplicativo"*.

---

## 🌟 Principais Funcionalidades

1. **Jornada de 21 Dias Estruturada em 8 Módulos**:
   - Pensamento e Caráter (Dias 1 a 3)
   - O Jardim Mental (Dias 4 e 5)
   - Pensamento e Circunstâncias (Dias 6 a 8)
   - Pensamento e Saúde (Dias 9 e 10)
   - Pensamento e Propósito (Dias 11 a 13)
   - O Fator-Pensamento na Realização (Dias 14 a 16)
   - Visões e Ideais (Dias 17 e 18)
   - A Mente em Harmonia (Dias 19 a 21)

2. **Quiz de Fixação Guiado**:
   - Perguntas de reflexão profunda (sem punição ou "decoreba"), com insights explicativos após cada escolha e opção de refazer.

3. **Diário & Espelho Pessoal (IndexedDB)**:
   - Registro reflexivo ao fim de cada capítulo com salvamento automático local, busca por palavra-chave e exportação em Markdown.

4. **Cartão de Compartilhamento ("Pensamento do Dia")**:
   - Geração de imagem PNG de alta resolução via Canvas para redes sociais ou compartilhamento nativo via Web Share API.

5. **Professor Mentor (RAG via `/chat`)**:
   - Assistente inteligente em painel lateral com sugestões de perguntas e aplicação prática de cada lição.

6. **Leitor com Síntese de Voz (TTS)**:
   - Reprodução em áudio do capítulo com controle de velocidade (1.0x, 1.25x, 1.5x) e alternador de tamanho da fonte.

7. **Acompanhamento de Sequência (Streak)**:
   - Contador de dias consecutivos (🔥), recorde pessoal e modal de acolhimento em caso de quebra de sequência.
