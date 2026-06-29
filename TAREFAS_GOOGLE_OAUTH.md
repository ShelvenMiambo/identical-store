# Tarefas — Criar login Google (Google Cloud Console)

## Nota importante
Estes passos são feitos **à mão** na consola do Google, dentro da TUA conta Google.
Não podem ser automatizados (o Google não tem API para criar OAuth Client IDs de Web, e
é preciso a tua sessão autenticada). Um agente só pode guiar-te.

O resultado final são **dois valores** — `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` —
que depois colas no Railway.

## Dados a usar (copia daqui)
- Domínio do site: `https://identicalmz.com`
- URI de redirecionamento: `https://identicalmz.com/api/auth/google/callback`

## Passos
- [ ] Abrir https://console.cloud.google.com e entrar com a conta Google da loja.
- [ ] Criar um projeto novo (ex.: "Identical Loja") e selecioná-lo no topo.
- [ ] Menu (☰) → **APIs e Serviços → Ecrã de consentimento OAuth**
  - [ ] Tipo de utilizador: **Externo** → Criar
  - [ ] Nome da app: `ID≠NTICAL`
  - [ ] Email de apoio ao utilizador: (o teu email)
  - [ ] Email de contacto do programador: (o teu email)
  - [ ] Guardar e continuar até ao fim
  - [ ] **Publicar a app** (botão "Publicar app"). Se ficar em "Teste", só os emails
        adicionados como "utilizadores de teste" conseguem fazer login.
- [ ] Menu → **APIs e Serviços → Credenciais → Criar credenciais → ID de cliente OAuth**
  - [ ] Tipo de aplicação: **Aplicação Web**
  - [ ] Nome: `Identical Web`
  - [ ] Origens JavaScript autorizadas: `https://identicalmz.com`
  - [ ] URIs de redirecionamento autorizados: `https://identicalmz.com/api/auth/google/callback`
  - [ ] Criar
- [ ] Copiar os dois valores que aparecem na janela:
  - [ ] **ID de cliente** → guardar como `GOOGLE_CLIENT_ID`
  - [ ] **Segredo do cliente** → guardar como `GOOGLE_CLIENT_SECRET`

## Pôr no Railway (serviço da app → Variables)
- [ ] `GOOGLE_CLIENT_ID` = (o ID de cliente copiado)
- [ ] `GOOGLE_CLIENT_SECRET` = (o segredo copiado)
- [ ] `GOOGLE_CALLBACK_URL` = `https://identicalmz.com/api/auth/google/callback`
- [ ] `EMAIL_FROM` = `noreply@identicalmz.com`

## Cuidados
- [ ] O "URI de redirecionamento" no Google tem de ser **exatamente igual** ao
      `GOOGLE_CALLBACK_URL` (mesmo `https://`, mesmo domínio, mesmo caminho).
- [ ] O domínio `identicalmz.com` tem de estar já ligado ao serviço no Railway (Custom Domain),
      senão o callback não resolve.
- [ ] Estas variáveis só fazem efeito depois do código novo (login Google) estar no Railway.
