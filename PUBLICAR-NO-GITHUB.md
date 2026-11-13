# Publicar o portfólio no GitHub

Passo a passo para subir este projeto (`C:\dev\portfolio-v2`) para o GitHub e, se quiser, colocar o site no ar.

O redesign já está salvo num commit local, no branch `master`. Falta só criar o repositório no GitHub e enviar.

---

## 1. Antes de publicar: o que vai ficar público

Um repositório **público** mostra tudo que está aqui para qualquer pessoa, inclusive:

- os currículos em `public/cv/` e `scripts/cv/` (e-mail, LinkedIn, cidade);
- os certificados em `public/certificates/`;
- as fotos em `public/about/` e `public/journey/`.

Tudo isso já aparece no próprio site, então não muda nada. Mas, se preferir, crie o repositório como **privado**: o site pode ir ao ar mesmo assim (passo 5).

## 2. Criar o repositório no GitHub (pelo site)

1. Entre em <https://github.com/new> com a sua conta (`kevinhsdev`).
2. **Repository name:** por exemplo `portfolio`.
3. Escolha **Public** ou **Private**.
4. **Não** marque "Add a README", ".gitignore" nem "license". O projeto já tem os arquivos e o repositório precisa nascer vazio.
5. Clique em **Create repository**.

## 3. Ligar o projeto ao repositório

No terminal (PowerShell ou Git Bash), dentro da pasta do projeto:

```bash
cd C:\dev\portfolio-v2
git remote add origin https://github.com/kevinhsdev/portfolio.git
```

Troque `portfolio` pelo nome que você escolheu no passo 2.

Confira:

```bash
git remote -v
```

As duas linhas devem mostrar o endereço do seu repositório.

## 4. Enviar

O GitHub usa `main` como nome padrão. Para seguir o padrão, renomeie o branch e envie:

```bash
git branch -M main
git push -u origin main
```

Na primeira vez, o Git abre uma janela para entrar na conta do GitHub. Faça o login e autorize. Depois disso o envio continua sozinho.

Atualize a página do repositório: os arquivos devem aparecer lá.

### Próximas atualizações

Depois de mudar algo no site:

```bash
git add -A
git commit -m "Describe the change in English"
git push
```

## 5. (Opcional) Colocar o site no ar com a Vercel

A Vercel é feita pela mesma empresa do Next.js e hospeda grátis projetos pessoais.

1. Entre em <https://vercel.com> com **Continue with GitHub**.
2. **Add New → Project** e escolha o repositório do portfólio.
3. A Vercel reconhece o Next.js sozinha. Não precisa mudar nada: clique em **Deploy**.
4. Em um ou dois minutos sai um endereço `https://<nome>.vercel.app`.

A partir daí, cada `git push` publica a nova versão do site automaticamente.

Para usar um domínio próprio (ex.: `kevinhenrique.dev`): na Vercel, **Settings → Domains**, adicione o domínio e siga as instruções de DNS do lugar onde você o comprou.

---

## Se algo der errado

| Mensagem                                    | O que fazer                                                                                                                                               |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `remote origin already exists`              | `git remote set-url origin https://github.com/kevinhsdev/<nome>.git`                                                                                      |
| `failed to push ... rejected (fetch first)` | O repositório não nasceu vazio (tem README). Rode `git pull origin main --allow-unrelated-histories`, depois `git push`.                                  |
| `Authentication failed`                     | Na janela de login, entre de novo pelo navegador. Ou gere um token em GitHub → Settings → Developer settings → Personal access tokens e use-o como senha. |
| Arquivo maior que 100 MB                    | O GitHub recusa. Hoje nenhum arquivo do projeto passa de 20 MB.                                                                                           |

## Antes de cada publicação

```bash
npm run check          # testes, tipos e lint
npx playwright test    # testes de navegador e acessibilidade
```
