# IDENTICAL - Loja de Streetwear Moçambicano

![IDENTICAL Logo](./attached_assets/Imagem%20WhatsApp%202025-11-10%20às%2018.29.32_92ebaa02_1763061428729.jpg)

> **Be Different, Be Classic** - Streetwear moçambicano autêntico com forte identidade urbana local

## 📋 Sobre o Projeto

IDENTICAL é uma loja e-commerce de streetwear moçambicano que valoriza a cultura urbana, autenticidade e a influência da arte, música e estilo de vida das ruas. Este projeto foi desenvolvido para vender coleções "raízes urbanas" com forte identidade local através de uma experiência UX simples e eficiente.

## ✨ Funcionalidades

### Loja Online
- **Homepage** com banner rotativo de coleções, produtos em destaque e seção "Sobre a IDENTICAL"
- **Página de Coleções** com grid de produtos, filtros por coleção/tamanho/cor e ordenação
- **Página de Produto** com galeria de imagens (zoom), seleção de variantes, tabela de tamanhos
- **Carrinho de Compras** persistente (localStorage) com drawer lateral
- **Checkout** simplificado em 2 passos com integração PaySuite preparada
- **Páginas legais**: FAQ, Contacto, Política de Privacidade, Termos e Condições

### Autenticação e Conta
- Sistema de registro/login com email e senha
- Área de conta do usuário para ver pedidos e endereços salvos
- Perfil editável

### Admin Dashboard
- Gestão completa de produtos (CRUD)
- Gestão de coleções
- Visualização e atualização de pedidos com status
- Gestão de cupões de desconto
- Relatórios de vendas

### Integração de Pagamentos
- **PaySuite** para pagamentos locais (M-Pesa, eMola, cartões)
- Endpoint webhook preparado para confirmações automáticas
- Sistema de status de pedidos: pendente → confirmado → enviado → entregue

## 🚀 Tecnologias

### Frontend
- **React** com Vite
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Shadcn UI** para componentes
- **Wouter** para roteamento
- **React Query** para gestão de estado e cache
- **React Hook Form** + **Zod** para formulários e validação

### Backend
- **Node.js** + **Express.js**
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **Drizzle ORM** para database
- **JWT** para autenticação
- **Bcrypt** para hash de passwords

### Integrações
- **PaySuite** - Gateway de pagamento moçambicano
- **SMTP** - Envio de emails transacionais (SendGrid/Gmail)

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 20+ instalado
- Conta PaySuite (sandbox ou produção)
- Servidor SMTP configurado (opcional para emails)

### Variáveis de Ambiente

Crie um ficheiro `.env` com as seguintes variáveis:

```env
# Sessão
SESSION_SECRET=your-session-secret-here

# PaySuite (opcional - deixar vazio para desenvolvimento)
PAYSUITE_API_KEY=your-paysuite-api-key
PAYSUITE_SECRET=your-paysuite-secret

# SMTP para emails (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-smtp-password
```

### Executar o Projeto

1. **Instalar dependências** (já instaladas no Replit)
```bash
npm install
```

2. **Executar em modo desenvolvimento**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000` (ou porta configurada pelo Replit).

## 🎨 Design

O design segue rigorosamente o **design_guidelines.md**, inspirado na estrutura do site lerramz.com com identidade streetwear urbana moçambicana:

- **Tipografia**: Inter (sans-serif), Space Grotesk (logo/headings)
- **Cores**: Palette urbana com primary orange (#D94A18)
- **Layout**: Mobile-first, responsivo (320px - 1440px)
- **Componentes**: Shadcn UI com customização streetwear
- **Navegação**: Header fixo com backdrop blur, footer estruturado

## 📁 Estrutura do Projeto

```
/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   │   ├── ui/       # Componentes Shadcn
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── pages/        # Páginas da aplicação
│   │   │   ├── home-page.tsx
│   │   │   ├── collections-page.tsx
│   │   │   ├── product-page.tsx
│   │   │   ├── checkout-page.tsx
│   │   │   ├── auth-page.tsx
│   │   │   ├── user-account-page.tsx
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── about-page.tsx
│   │   │   ├── faq-page.tsx
│   │   │   ├── contact-page.tsx
│   │   │   ├── privacy-page.tsx
│   │   │   └── terms-page.tsx
│   │   ├── lib/          # Utilitários
│   │   ├── App.tsx       # Componente principal
│   │   └── index.css     # Estilos globais
│   └── index.html
├── server/               # Backend Express
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Storage interface
├── shared/              # Código partilhado
│   └── schema.ts        # Schemas Drizzle + Zod
├── attached_assets/     # Imagens fornecidas
└── design_guidelines.md # Guidelines de design
```

## 🔐 Autenticação

O sistema usa **sessões com cookies** geridas pelo Passport.js:
- Registro de novos usuários com hash bcrypt
- Login com username/password
- Proteção de rotas sensíveis (conta, admin)
- Campo `isAdmin` para acesso ao dashboard

## 💳 Integração PaySuite

O checkout está preparado para integração PaySuite:

1. Cliente preenche dados de entrega
2. Backend cria pagamento via API PaySuite
3. Cliente é redirecionado para `checkout_url` do PaySuite
4. Após pagamento, PaySuite envia webhook para `/api/paysuite/webhook`
5. Sistema atualiza status do pedido automaticamente

### Configurar PaySuite

1. Obtenha credenciais em [docs.paysuite.co.mz](https://docs.paysuite.co.mz)
2. Configure `PAYSUITE_API_KEY` e `PAYSUITE_SECRET`
3. Configure webhook URL no painel PaySuite
4. Teste em modo sandbox antes de produção

## 📧 Emails Transacionais

Emails são enviados via SMTP para:
- Confirmação de pedido
- Atualizações de status de envio
- Reset de password (futuro)

Configure `SMTP_*` nas variáveis de ambiente.

## 🎯 Roadmap

### Fase 1 - MVP (Atual)
- [x] Frontend completo com todas as páginas
- [x] Schemas e tipos TypeScript
- [ ] Backend API completo
- [ ] Integração PaySuite
- [ ] Emails transacionais

### Fase 2 - Melhorias
- [ ] Sistema de reviews/avaliações
- [ ] Blog/Notícias
- [ ] SMS para notificações M-Pesa
- [ ] Analytics (Google Analytics)
- [ ] Relatórios avançados admin

### Fase 3 - Escalabilidade
- [ ] Migração para PostgreSQL
- [ ] Upload de imagens para cloud storage
- [ ] Integração com logística local
- [ ] App mobile (React Native)

## 👥 Contribuir

Este é um projeto comercial privado. Para questões ou sugestões, contacte a equipa IDENTICAL.

## 📄 Licença

© 2025 IDENTICAL. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a comunidade streetwear moçambicana**
