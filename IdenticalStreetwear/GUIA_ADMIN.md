
# Guia de Administração - IDENTICAL

## Como Aceder ao Painel de Administração

1. Vá para: `https://seu-site.replit.dev/admin`
2. Faça login com a conta de administrador

---

## Gestão de Produtos

### Adicionar um Novo Produto

1. Clique no separador **"Produtos"**
2. Clique em **"Adicionar Produto"**
3. Preencha os campos:
   - **Nome do Produto**: Ex: "T-Shirt IDENTICAL Black"
   - **Slug**: URL do produto (gerado automaticamente, pode editar)
   - **Descrição**: Descrição detalhada do produto
   - **Preço**: Preço normal em MZN (Ex: 1399)
   - **Preço Promocional**: Deixe vazio se não houver promoção
   - **Estoque**: Quantidade disponível
   - **Categoria**: Ex: "T-Shirts", "Hoodies"
   - **Coleção**: Selecione uma coleção existente
   - **Tamanhos**: Clique nos tamanhos disponíveis (XS, S, M, L, XL, XXL)
   - **Cores**: Clique nas cores disponíveis
   - **Imagem Principal**: URL da imagem (Ex: `/attached_assets/produto1.jpg`)
   - **Imagens Adicionais**: Uma URL por linha

4. Ative os interruptores:
   - **Produto em Destaque**: Aparece na página inicial
   - **Produto Novo**: Mostra badge "NOVO"
   - **Produto Ativo**: Visível no site

5. Clique em **"Criar Produto"**

### Editar um Produto

1. Na lista de produtos, clique no ícone de lápis (Editar)
2. Altere os campos necessários
3. Clique em **"Atualizar Produto"**

### Eliminar um Produto

1. Clique no ícone de lixo (vermelho)
2. Confirme a eliminação

---

## Como Fazer Upload de Imagens

### Passo 1: Enviar Imagens para o Replit

1. No Replit, abra a pasta **`attached_assets`**
2. Clique com o botão direito → **"Upload file"**
3. Selecione as fotos dos produtos
4. Aguarde o upload concluir

### Passo 2: Usar as Imagens nos Produtos

Copie o caminho da imagem:
```
/attached_assets/nome-da-imagem.jpg
```

Cole esse caminho no campo **"URL da Imagem Principal"** ou **"Imagens Adicionais"**.

---

## Gestão de Coleções

### Adicionar uma Coleção

1. Vá ao separador **"Coleções"**
2. Clique em **"Adicionar Coleção"**
3. Preencha:
   - **Nome**: Ex: "Verão 2025"
   - **Slug**: URL da coleção
   - **Descrição**: Descrição da coleção
   - **Imagem de Capa**: URL da imagem
   - **Ativo**: Se a coleção está visível

4. Clique em **"Criar Coleção"**

---

## Gestão de Pedidos

### Ver Detalhes de um Pedido

1. Vá ao separador **"Pedidos"**
2. Clique em **"Ver Detalhes"** num pedido
3. Verá:
   - Informações do cliente
   - Endereço de entrega
   - Produtos comprados
   - Valores

### Alterar Status de um Pedido

No diálogo de detalhes, use o menu **"Alterar Status"**:
- **Pendente**: Pedido recebido, aguarda pagamento
- **Confirmado**: Pagamento confirmado
- **Enviado**: Pedido a caminho
- **Entregue**: Pedido entregue ao cliente
- **Cancelado**: Pedido cancelado

O status será atualizado automaticamente.

---

## Dicas Importantes

### Preços
- Use apenas números (Ex: 1399 para 1.399,00 MZN)
- Não use vírgulas ou pontos
- O sistema formatará automaticamente

### Imagens
- Use imagens de alta qualidade
- Formato recomendado: JPG ou PNG
- Tamanho ideal: 1000x1000 pixels
- Nomes sem espaços (use `-` ou `_`)

### Produtos Inativos
- Produtos inativos não aparecem no site
- Use para produtos temporariamente indisponíveis

### Backup
- Os dados ficam guardados na base de dados
- Não elimine produtos a menos que tenha certeza

---

## Problemas Comuns

**P: A imagem não aparece**
- Verifique se o caminho está correto
- Certifique-se que começa com `/attached_assets/`
- Verifique se o ficheiro foi enviado

**P: Não consigo aceder ao admin**
- Certifique-se que a sua conta tem privilégios de administrador
- Contacte o suporte técnico

**P: Alterações não aparecem no site**
- Recarregue a página (F5)
- Limpe a cache do navegador

---

## Suporte

Para qualquer dúvida ou problema, contacte o desenvolvedor.
