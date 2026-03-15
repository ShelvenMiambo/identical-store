CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text,
	"imagem" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"tipo" text NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"minimo_compra" numeric(10, 2),
	"usos" integer DEFAULT 0 NOT NULL,
	"limite_usos" integer,
	"ativo" boolean DEFAULT true NOT NULL,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "order_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"nome_cliente" text NOT NULL,
	"telefone_cliente" text NOT NULL,
	"email_cliente" text,
	"endereco_entrega" text,
	"provincia_entrega" text,
	"metodo_pagamento" text,
	"subtotal" numeric(10, 2),
	"desconto" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) NOT NULL,
	"status_final" text NOT NULL,
	"itens" jsonb NOT NULL,
	"data_pedido" timestamp NOT NULL,
	"data_finalizacao" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"nome_produto" text NOT NULL,
	"preco_produto" numeric(10, 2) NOT NULL,
	"quantidade" integer NOT NULL,
	"tamanho" text NOT NULL,
	"cor" text NOT NULL,
	"imagem_produto" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"status" text DEFAULT 'pendente' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"desconto" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"nome_cliente" text NOT NULL,
	"email_cliente" text NOT NULL,
	"telefone_cliente" text NOT NULL,
	"endereco_entrega" text NOT NULL,
	"cidade_entrega" text NOT NULL,
	"provincia_entrega" text NOT NULL,
	"metodo_pagamento" text,
	"comprovante_url" text,
	"paysuite_transaction_id" text,
	"paysuite_status" text,
	"cupom_codigo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"slug" text NOT NULL,
	"descricao" text,
	"preco" numeric(10, 2) NOT NULL,
	"preco_promocional" numeric(10, 2),
	"collection_id" varchar,
	"category_id" varchar,
	"imagens" text[] NOT NULL,
	"tamanhos" text[] NOT NULL,
	"cores" text[] NOT NULL,
	"estoque" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"destaque" boolean DEFAULT false NOT NULL,
	"novo" boolean DEFAULT false NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"hero_title" text DEFAULT 'Be Different, Be Classic' NOT NULL,
	"hero_subtitle" text DEFAULT 'Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local.' NOT NULL,
	"banners" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"payment_contacts" jsonb DEFAULT '{"mpesa":"","emola":"","mbim":""}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"endereco" text,
	"cidade" text,
	"provincia" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"reset_token" text,
	"reset_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;