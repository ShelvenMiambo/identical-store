# Documentação Técnica: Preparação para Produção (IDENTICAL)

Este documento detalha todas as alterações estruturais e configurações feitas no projeto IDENTICAL para o transformar de um protótipo com dados em memória numa aplicação robusta e pronta para produção.

---

## 🎯 1. Objetivos Atingidos (O que já está feito e a funcionar)

✅ **Arquitetura e Persistência de Dados (PostgreSQL)**
*   Migração concluída de "Armazenamento em Memória" para uma base de dados real na Nuvem (Neon.tech).
*   Implementação do `PostgresStorage` e ligação correta via Drizzle ORM.
*   Criação automática das tabelas de utilizadores, produtos, categorias, encomendas e cupões.
*   Sessões de utilizadores agora guardadas na base de dados (`connect-pg-simple`), garantindo que o Admin não perde a sessão se o servidor reiniciar.
*   Criação inicial e segura do utilizador "Admin" persistido na base de dados.

✅ **Armazenamento de Media (Cloudinary)**
*   Configuração de conta Cloudinary para alojar imagens estáticas indefinidamente.
*   Atualização da rota `/api/admin/upload-base64` para enviar imagens de produtos (e coleções) diretamente para o Cloudinary, obtendo um Link HTTPS pronto para a web.
*   Fallback de segurança criado: Se o Cloudinary falhar ou não estiver no `.env`, guarda no disco local (`/attached_assets`).

✅ **Sistema de Emails Transacionais (Resend)**
*   Substituição do Formspree (muito limitado) pelo Resend (100 emails/dia grátis e sem spam aparente).
*   Lógica rescrita no ficheiro `server/email.ts` para enviar emails formais (ex. Códigos de Rastreio, Atualizações de Encomendas).

✅ **Segurança, Variáveis de Ambiente e Configuração**
*   Criação do ficheiro `.env` com integração total (Neon, Cloudinary, Resend, PaySuite).
*   Ajuste dos Cookies de Sessão (`auth.ts`) para forçarem uso do HTTPS em ambiente de produção (`NODE_ENV=production`).
*   Configuração do servidor atualizada para exigir pacotes modulares como `dotenv`, injetando de forma segura as variáveis ocultas.

---

## 🚧 2. Objetivos em Falta (Próximos Passos Obrigatórios)

⏳ **Testes de Funcionalidade Locais (Quality Assurance)**
*   Realizar um teste manual completo no browser (`localhost:5000`).
*   Carregar imagens pelo painel de Admin para confirmar 100% que o Cloudinary responde bem de todas as partes.
*   Testar um fluxo de compras até ao fim (adicionar ao Carrinho, fazer Checkout).

⏳ **Segurança do Gateway PaySuite (Webhooks)**
*   Confirmar que o endpoint de webhook (`/api/paysuite/webhook`) no ficheiro `server/paysuite.ts` responde aos pings da PaySuite.
*   O webhook deve baixar o *stock* do produto automaticamente aquando do sucesso do pagamento.

⏳ **Deploy e Lançamento (Produção)**
*   Upload ou ligação do código ao serviço de Alojamento Final (Railway ou Render).
*   Copiar e criar as variáveis do `.env` no painel de controlo do Serviço de Alojamento.

⏳ **Auditoria Final de Bugs**
*   Corrigir pequenas inconsistências residuais de nomes de campos (ex: assegurar que usamos `nomeCliente` e `emailCliente` tanto no formulário Front-end como nos Emails e na Base de Dados, e não `nomeCompleto`).

---

## 🚀 3. Possíveis Melhorias (Evoluções Futuras do Sistema)

💡 **Experiência do Cliente Front-end**
*   **Contas/Login para Clientes:** Permitir que o cliente crie conta para não ter que inserir os seus dados sempre que compra, e ter uma página "A Minha Conta" com o histórico das compras.
*   **Lazy Loading e Otimização Cloudinary:** Usar os parâmetros automáticos do Cloudinary nos URL das imagens (`q_auto,f_auto`) para converter e servir as fotos no tamanho exato, poupando dados dos clientes móveis.

💡 **Operação do Administrador**
*   **Recuperação de Senha (Admin/Cliente):** Criar um fluxo de "Esqueci-me da Senha" enviando um link de recuperação pelo Resend.
*   **Dashboard Visual (Analytics):** Substituir/melhorar as tabelas de encomendas no `/admin` adicionando gráficos mensais de vendas (Receita, Quantidade de Produtos).
*   **Paginação e Filtros Nativos:** No `server/storage-pg.ts`, adicionar opções de `LIMIT` e `OFFSET` para a base de dados não descarregar todos os produtos e encomendas de uma só vez caso a loja cresça para milhares de pedidos, deixando o site mais leve e económico.

💡 **Ferramentas de Marketing**
*   Integração profunda de SEO: Metadata dinâmica nas páginas de detalhes do produto para que, ao partilhar o URL de um Hoodie no WhatsApp, a imagem apareça corretamente nos chats (Open Graph).
*   Envio automático de cupões (pelo Resend) para quem deixa o carrinho de lado (Abandoned Cart Recovery).

---

## 🔗 4. Integrações de Serviços de Terceiros e APIs (Credenciais)

Para que a loja IDENTICAL seja totalmente funcional, ela está acoplada a várias plataformas cruciais. A documentação completa destas contas garante fácil acesso à gestão das mesmas:

### 🗄️ Neon.tech (Base de Dados PostgreSQL)
*   **Site:** [https://neon.tech](https://neon.tech)
*   **Propósito:** Hospedagem gratuita (Tier Gratuito) da base de dados PostgreSQL que detém todos os dados da loja (Sessões, Produtos, Coleções, Compras e Admin).
*   **Conta Utilizada:** `shelvenmarlonnaftal43@gmail.com`
*   **Variável Lançada (`.env`):**
    *   `DATABASE_URL=postgresql://neondb_owner:npg_acG7AiDj9nlf@ep-summer-rain-ahluin7g.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
*   **Nome do Projeto:** `Identical`

### 🖼️ Cloudinary (Alojamento e Otimização de Vídeos/Imagens)
*   **Site:** [https://cloudinary.com](https://cloudinary.com)
*   **Propósito:** Servir e guardar imagens em alta velocidade na Cloud, evitando saturar o servidor de alojamento ou perda de anexos no deploy.
*   **Conta Utilizada:** `shelvenmarlonnaftal43@gmail.com`
*   **Variáveis Lançadas (`.env`):**
    *   `CLOUDINARY_CLOUD_NAME=drn08btzl`
    *   `CLOUDINARY_API_KEY=935716524615986`
    *   `CLOUDINARY_API_SECRET=PScAedkmXOAabiFyznzNhj1cN1M`

### 📧 Resend (Envio de Emails Transacionais)
*   **Site:** [https://resend.com](https://resend.com)
*   **Propósito:** Ferramenta dedicada a developers para o envio rápido (sem taxa agressiva de spam) de emails informativos e faturas para o utilizador. Limite de 100 envios grátis dia.
*   **Conta Utilizada:** `shelvenmarlonnaftal43@gmail.com`
*   **Variável Lançada (`.env`):**
    *   `RESEND_API_KEY=re_6BwrEryz_JsPbDaa8uTnVoMgBhMx9BSC9`

### 🇲🇿 PaySuite (Pagamentos via M-Pesa / E-Mola)
*   **Site / Documentação:** [https://docs.paysuite.co.mz](https://docs.paysuite.co.mz)
*   **Propósito:** Processamento centralizado de pagamentos mobile money Moçambicanos durante a fase final do Checkout pelo cliente.
*   **Variáveis Lançadas (`.env`):**
    *   `PAYSUITE_BASE_URL=https://api.paysuite.co.mz`
    *   `PAYSUITE_TOKEN=1287|52ykHJu8FgD7HKjY9rtns7jNEBDTW0ORnt6pHbkA6b47c7e6`

### 📩 Formspree (Fallback de Emails — Segurança)
*   **Site:** [https://formspree.io](https://formspree.io)
*   **Propósito:** Funciona como a nossa "segunda opção" (fallback), ou seja, se a quota do dia do Resend for ultrapassada ou a API cair, a aplicação comuta para este serviço que opera via fetch nativo e não vai ao ar.
*   **Variável Lançada (`.env`):**
    *   `FORMSPREE_ENDPOINT=https://formspree.io/f/mldledjn`
