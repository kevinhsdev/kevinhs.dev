# Portfólio v2 do Kevin — design

Data: 2026-11-07 · Domínio: kevinhs.dev · Dono: Kevin Henrique (estudante de Engenharia de Software, São Paulo)

## 1. Intenção

Um portfólio novo, feito do zero. Quem abrir (principalmente recrutadores) deve sair pensando que nunca viu um portfólio tão bem desenhado e com tanto movimento. O nível de referência são as landing pages da ProfitizeBuild (ex.: o prompt do "G 63"), das quais vale **só a técnica**, nunca o conteúdo nem a estética específica.

O site atual (`C:\dev\portfolio`) ficou "bagunçado e fora de contexto": componentes empilhados, conteúdo repetido em várias seções, seções com cores de outro site e demos coladas sem adaptação. O v2 existe para corrigir isso com uma estrutura pensada de cima para baixo.

## 2. Objetivos, não-objetivos e anti-objetivos

**Objetivos**

- Movimento de nível "site premiado": seções presas ao scroll calibradas com números, transições de câmera, nada cortado, nada mole.
- Uma história clara sobre o Kevin, com cada informação morando em **um lugar só**.
- CTAs (baixar CV, LinkedIn, copiar e-mail) sempre a um clique.
- Português e inglês.

**Não-objetivos**

- Reaproveitar código do site atual (exceto os dados de conteúdo e as fotos, ver §5).
- Tema de jogos/arcade (removido de vez).
- Blog, CMS, painel de admin.

**Anti-objetivos (falhou mesmo que funcione)**

- O mesmo conteúdo aparecendo em duas seções (ex.: projetos listados duas vezes, cursos na trajetória e nos certificados, a mesma frase na hero e logo abaixo).
- Uma seção com paleta própria que "parece de outro site" (laranja, prata, fundo `#0a0a0a` de demo).
- Componente de prompt colado com a cara da demo (molduras brancas quadradas, céu de crepúsculo, apps fictícios).
- Letra cortada quando a pessoa para de rolar; animação presa ao scrub que trava.
- Dock/elementos fixos no meio da tela atrapalhando a leitura.
- Fatos inventados.

## 3. Visual

- **Cor:** azul elétrico como acento sobre fundo azul-noite (a paleta do site atual: claro `#eef2f9`/`#1f4fd6`, escuro `#070d1f`/`#4d8dff`). Todas as cores saem de tokens (claro e escuro). Uma variante em **vermelho** deve ser fácil de testar trocando só os tokens de acento (critério: trocar 2–4 variáveis muda o site inteiro, shaders incluídos).
- **Tema:** claro e escuro, com o escuro como vitrine principal.
- **Shaders** (Kevin gostou muito): Fluxo (ondas de tinta), Tipos (fumaça de letras ASCII) e Nebulosa, sempre recoloridos para a paleta do site via tokens. Cada shader aparece em **um** lugar.
- Fontes self-hosted (sem Google Fonts em runtime: a rede do Kevin já falhou ao baixá-las).

## 4. Estrutura e conteúdo

Rotas: `/[locale]` (home), `/[locale]/projects/[slug]`, `/[locale]/about`. `locale` ∈ {pt, en}.

### 4.1 Home (nesta ordem)

1. **Hero** — a estrutura que o Kevin aprovou: nome e texto à esquerda (olá / KEVIN. / cargo / frase / CTAs / localização), os 3 números reais à direita num cartão de vidro, status ("aberto a estágio") no alto. Fundo: **shader Fluxo** em tela cheia, com uma sombra suave atrás da coluna da esquerda para leitura. **Agentes (cursores) montam a hero** a cada visita, camada por camada, e **somem quando ela termina** (a barra deles também). A montagem é a "intro" do site; `?pronto` e movimento reduzido abrem já montada.
2. **A viagem pelo globo (peça principal)** — uma seção presa ao scroll por várias telas, com um parâmetro `s` e uma função `render(s)` pura (como no G 63). Roteiro aprovado:
   - O globo (Cobe) aparece pequeno e gira até São Paulo; a câmera mergulha.
   - **São Paulo:** capítulos um por vez — escola, UMC, trabalho na secretaria (os sistemas citados de passagem, sem virar o assunto). Fotos reais surgem presas a pontos, com fio que se desenha.
   - **Voo até Malta:** um arco sai de SP e a câmera segue o arco. Em Malta: o intercâmbio (EF, 2025) e as fotos de Malta no varal (Polaroid Line), presas na tela.
   - **Planos:** arcos tracejados para Espanha e EUA, marcados como planejados.
   - **Recuo:** a câmera volta ao globo inteiro, com uma frase do tipo "o próximo destino é o seu time" levando ao contato.
3. **Projetos** — os 3 marcados como `featured` no conteúdo (SEK, PDF Renamer, Sistema Hemocentro) em destaque (SEK e PDF Renamer com poster/vídeo), e os outros 4 numa lista enxuta. Cada um leva à sua página. **Uma** lista, sem repetição.
4. **Skills (curto)** — só o que o Kevin usa no dia a dia (tier "uso no dia a dia" do conteúdo), com os logos de `public/skills`.
5. **Contato** — e-mail grande, os CTAs e um campo de mensagem que envia de verdade.

### 4.2 Página de projeto

Abre com **o vídeo de apresentação e o problema que o projeto resolveu** (nessa ordem de importância). Depois: o que foi construído, números (contando), stack, links (repo/demo quando houver; código privado quando `privateCode`). Projetos sem vídeo abrem com o problema e uma imagem/painel (`TODO(kevin)` onde faltar mídia).

### 4.3 Página Sobre

Quem é o Kevin (texto, fotos, música, vôlei, línguas), **certificados** (concluídos: Idiomas — CNA C1, EF Malta; Cursos — DIO, Alura), **eventos** (GDG Cloud SP na FIAP, SouJava × Oracle, Claude/Oracle, palestra Carreira e Código, coffee break), o que está estudando agora (AWS, bootcamps Santander e Itaú, Spring Data JPA) e a **lista completa de skills**.

### 4.4 Regra de não-repetição (onde cada coisa mora)

| Conteúdo                                                          | Lugar único                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Projetos                                                          | Home (lista) → página do projeto (detalhe)                               |
| Trajetória SP → Malta → planos                                    | Globo da home                                                            |
| Fotos de Malta                                                    | Capítulo Malta do globo                                                  |
| Certificados, eventos, estudando agora, skills completas, hobbies | Sobre                                                                    |
| Skills do dia a dia                                               | Home (seção curta)                                                       |
| Números (3×, 3→1, ~535)                                           | Hero (resumo) e página do projeto (contexto) — única repetição permitida |

## 5. Restrições

- **Fatos:** nunca inventar. Todo dado vem de `C:\dev\portfolio\src\content\*.ts` (profile, projects, timeline, gallery, skills, about, now, case-studies) e das imagens de `C:\dev\portfolio\public\` (about, journey, projects, skills, cv). Esses arquivos são **copiados** para o v2 (é conteúdo, não código de interface). O que faltar vira `TODO(kevin)`.
- Cidades na Espanha e nos EUA ainda não definidas: `TODO(kevin)` (até lá, Madri e o centro dos EUA).
- PDFs dos certificados ainda não enviados: `TODO(kevin)`.
- Código, comentários e commits em inglês; conversa em pt-BR. Mensagens pt/en com chaves idênticas.
- Cores só por tokens. Alvos de toque ≥ 44 px. `prefers-reduced-motion` respeitado em tudo (sem Lenis, sem intro, cortes no lugar de transições).
- Nada de download sem permissão explícita do Kevin. Sem imagens de banco (Unsplash etc.): só fotos reais dele.
- Componentes ProfitizeBuild são copiados **literalmente** dos prompts para `src/components/ui/` (podem levar `// @ts-nocheck` se o TS estrito reclamar) e adaptados **por fora** (props, wrapper, CSS do site com tokens), nunca com a cara da demo.
- Commit/push só quando o Kevin pedir. Parar com screenshots ao fim de cada fase.
- Celular tão caprichado quanto o desktop.

## 6. Como (decidido)

- **Projeto novo** num repositório próprio, separado do site atual.
- **Movimento:** GSAP + ScrollTrigger (pins sem scrub; `onUpdate` → `render(s)`), Lenis (só depois da montagem da hero), canvas/SVG, texto que entra com tempo próprio e nunca preso ao scrub, seções que sobem por cima da anterior presa, elementos presos a pontos via um helper de geometria "cover".
- **Componentes dos prompts e onde entram:**

| Prompt                           | Onde                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Kairo (hero + enxame de agentes) | Hero da home                                                                     |
| Fluxo / Tipos / Nebulosa         | Fluxo: hero · Tipos e Nebulosa: um lugar cada (ver §7)                           |
| Cobe Globe                       | Peça principal da home                                                           |
| Polaroid Line Carousel           | Capítulo Malta                                                                   |
| Circular Navigation              | Menu do site                                                                     |
| Liquid Glass Dock                | CTAs fixos, **pequeno no canto inferior direito**, some sobre a hero e o contato |
| Mercúrio                         | CTA principal do contato                                                         |
| AI Prompt Box                    | Campo de mensagem do contato (envio real), na paleta do site                     |
| Esteira                          | Skills do dia a dia na home                                                      |
| Relevo                           | Página de projeto ("o produto por dentro") quando houver conteúdo real do painel |
| Glass Folder                     | Certificados (Sobre), arte do painel em azuis                                    |
| Interactive Selector             | Eventos (Sobre), cards arredondados com borda de token                           |
| Card Fan Carousel                | Fotos pessoais (Sobre)                                                           |
| Holo Card                        | Cartão de visita (Sobre ou contato)                                              |

- **Fora por enquanto:** Works Wheel (só 2 dos 7 projetos têm capa; volta quando houver capas reais), Apoteose (Kevin não viu sentido), Animated Mosaic Portrait (sem foto boa), Sticker Slap Footer e Holo Trading Card (prompts ainda não enviados).

## 7. Decisões minhas (o Kevin pode mudar)

- Stack: Next.js (App Router) + TypeScript estrito + Tailwind v4 + next-intl + next-themes, nas mesmas versões já validadas no site atual (Next 16, React 19, GSAP 3.15, Lenis, cobe 2, @paper-design/shaders 0.0.82, motion 13). Motivo: páginas de projeto e pt/en.
- Pasta: `C:\dev\portfolio-v2` (git novo). Este documento vai em `docs/superpowers/specs/` lá dentro.
- Tipos na abertura das páginas de projeto; Nebulosa no contato.
- A hero não ganha uma intro separada de logo: a montagem pelos agentes já é a intro.
- Holo Card na Sobre (perto de "quem sou").
- **Globo sem câmera 3D livre:** o Cobe só gira, escala e desenha arcos. A "câmera" é feita com rotação + escala do globo e, nos capítulos de São Paulo e Malta, uma transição (íris/cross-fade) para uma cena 2D com as fotos presas a pontos; o "voo pelo arco" é o globo girando e escalando enquanto o arco se desenha. Sem three.js.
- **Contato:** mesmo mecanismo do site atual (server action com Resend, `RESEND_API_KEY` e `CONTACT_TO_EMAIL` do `.env` atual, fallback para `mailto:` sem chave). Exige hospedagem com runtime de servidor (Vercel ou similar). Trocar o deploy de kevinhs.dev para o v2 só quando o Kevin pedir.

## 8. Fontes dos componentes

- Textos originais dos prompts (para copiar literalmente), na pasta de rascunho da sessão `C:\Users\Kevin\AppData\Local\Temp\claude\f11c271e52298181\a5d02c90-63a7-43fa-84e1-502b4c40e927\scratchpad\`: `prompts.txt` (Cobe Globe, Polaroid Line, Interactive Selector), `glass.txt` (Glass Folder), `new-prompts.txt` (Works Wheel, Relevo, Circular Navigation, Liquid Glass Dock, Mercúrio, Apoteose, Card Fan, Esteira, AI Prompt Box, Holo Card). Copiar para `docs/prompts/` do v2 logo no início, para não depender da pasta temporária.
- Kairo (hero + enxame): o pacote original em `C:\dev\kairo-demo` (`src/sections`, `src/motion/enxame.js`, CSS). A "estrutura aprovada" é o layout da hero do site atual (nome à esquerda, números à direita), reconstruída a partir do pacote.
- Shaders Fluxo/Tipos/Nebulosa: as versões em `C:\dev\portfolio\src\lib\shaders\` são cópias dos prompts e servem de fonte (exceção explícita à regra de não reaproveitar código).

## 9. Deixado para quem constrói

Calibração exata dos pins (quantas telas cada parte dura), curvas e durações, quais fotos entram em cada capítulo de SP (dentre as reais), tipografia de display (forte, condensada, self-hosted), layout fino de cada seção, versão de celular de cada pin, testes e checagens (typecheck, lint, build, console limpo, 60 fps).
