import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============ USERS ============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  provincia: text("provincia"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============ COLLECTIONS ============
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  descricao: text("descricao"),
  imagem: text("imagem"),
  ativo: boolean("ativo").default(true).notNull(),
  ordem: integer("ordem").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

// ============ CATEGORIES ============
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ============ PRODUCTS ============
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  descricao: text("descricao"),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  collectionId: varchar("collection_id").references(() => collections.id),
  categoryId: varchar("category_id").references(() => categories.id),
  imagens: text("imagens").array().notNull(),
  tamanhos: text("tamanhos").array().notNull(), // ["XS", "S", "M", "L", "XL"]
  cores: text("cores").array().notNull(), // ["Branco", "Preto"]
  estoque: integer("estoque").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  destaque: boolean("destaque").default(false).notNull(),
  novo: boolean("novo").default(false).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ============ ORDERS ============
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("pendente"), // pendente, confirmado, enviado, entregue, cancelado
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  desconto: decimal("desconto", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),

  // Dados de envio
  nomeCliente: text("nome_cliente").notNull(),
  emailCliente: text("email_cliente").notNull(),
  telefoneCliente: text("telefone_cliente").notNull(),
  enderecoEntrega: text("endereco_entrega").notNull(),
  cidadeEntrega: text("cidade_entrega").notNull(),
  provinciaEntrega: text("provincia_entrega").notNull(),

  // Pagamento
  metodoPagamento: text("metodo_pagamento"), // mpesa, emola, mbim
  comprovanteUrl: text("comprovante_url"),   // proof of payment image/pdf URL
  paysuiteTransactionId: text("paysuite_transaction_id"),
  paysuiteStatus: text("paysuite_status"),

  cupomCodigo: text("cupom_codigo"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ============ ORDER ITEMS ============
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  nomeProduto: text("nome_produto").notNull(),
  precoProduto: decimal("preco_produto", { precision: 10, scale: 2 }).notNull(),
  quantidade: integer("quantidade").notNull(),
  tamanho: text("tamanho").notNull(),
  cor: text("cor").notNull(),
  imagemProduto: text("imagem_produto").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// ============ HISTORICO DE PEDIDOS ============
// Registo permanente de todos os pedidos finalizados (entregues ou cancelados)
// Mantido mesmo após o pedido ser apagado da tabela orders (após 1 hora)
export const orderHistory = pgTable("order_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),              // ID original do pedido
  nomeCliente: text("nome_cliente").notNull(),
  telefoneCliente: text("telefone_cliente").notNull(),
  emailCliente: text("email_cliente"),
  enderecoEntrega: text("endereco_entrega"),
  provinciaEntrega: text("provincia_entrega"),
  metodoPagamento: text("metodo_pagamento"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  desconto: decimal("desconto", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  statusFinal: text("status_final").notNull(),          // entregue | cancelado
  itens: jsonb("itens").notNull(),                      // snapshot dos itens do pedido
  dataPedido: timestamp("data_pedido").notNull(),       // quando foi criado
  dataFinalizacao: timestamp("data_finalizacao").defaultNow().notNull(), // quando foi finalizado
});

export type OrderHistoryRow = typeof orderHistory.$inferSelect;

export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: text("codigo").notNull().unique(),
  tipo: text("tipo").notNull(), // percentual, fixo
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  minimoCompra: decimal("minimo_compra", { precision: 10, scale: 2 }),
  usos: integer("usos").default(0).notNull(),
  limiteUsos: integer("limite_usos"),
  ativo: boolean("ativo").default(true).notNull(),
  dataInicio: timestamp("data_inicio").notNull(),
  dataFim: timestamp("data_fim"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usos: true,
});

export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

// ============ SITE SETTINGS ============
export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  heroTitle: text("hero_title").notNull().default("Be Different, Be Classic"),
  heroSubtitle: text("hero_subtitle").notNull().default("Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local."),
  banners: text("banners").array().notNull().default(sql`ARRAY[]::text[]`),
  highlights: jsonb("highlights").notNull().default(sql`'[]'::jsonb`),
  paymentContacts: jsonb("payment_contacts").notNull().default(sql`'{"mpesa":"","emola":"","mbim":""}'::jsonb`),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SiteSettingsRow = typeof siteSettingsTable.$inferSelect;

// ============ CART TYPES (Frontend only) ============
export const cartItemSchema = z.object({
  productId: z.string(),
  nomeProduto: z.string(),
  precoProduto: z.string(),
  quantidade: z.number().min(1),
  tamanho: z.string(),
  cor: z.string(),
  imagemProduto: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
