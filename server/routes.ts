import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertCollectionSchema, insertCouponSchema } from "@shared/schema";
import { insertCategorySchema } from "@shared/schema";
import fs from "fs";
import path from "path";

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  next();
}

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.sendStatus(403);
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // ============ SESSION & AUTH ROUTES ============

  // Get current session/user
  app.get("/api/session", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ user: null });
    }
    res.json({ user: req.user });
  });

  // ============ PUBLIC ROUTES ============

  // Get all products
  app.get("/api/products", async (req, res, next) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).send("Produto não encontrado");
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Get all collections
  app.get("/api/collections", async (req, res, next) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      next(error);
    }
  });

  // Get all categories
  app.get("/api/categories", async (_req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  // Site settings (public)
  app.get("/api/settings", async (_req, res, next) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  });

  // Get collection by ID
  app.get("/api/collections/:id", async (req, res, next) => {
    try {
      const collection = await storage.getCollection(req.params.id);
      if (!collection) {
        return res.status(404).send("Coleção não encontrada");
      }
      res.json(collection);
    } catch (error) {
      next(error);
    }
  });

  // ============ AUTHENTICATED USER ROUTES ============

  // Get user's orders
  app.get("/api/orders", requireAuth, async (req, res, next) => {
    try {
      const orders = await storage.getOrdersByUser(req.user!.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Get order by ID (must be user's order)
  app.get("/api/orders/:id", requireAuth, async (req, res, next) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).send("Pedido não encontrado");
      }
      if (order.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.sendStatus(403);
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Checkout - Create order and initiate payment
  app.post("/api/checkout", async (req, res, next) => {
    try {
      const { items, cupomCodigo, ...orderData } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Carrinho vazio" });
      }

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.precoProduto) * item.quantidade;
      }, 0);

      let desconto = 0;

      // Apply coupon if provided
      if (cupomCodigo) {
        const coupon = await storage.getCouponByCode(cupomCodigo);
        if (coupon && coupon.ativo) {
          // Verify coupon is valid
          const now = new Date();
          const isNotExpired = !coupon.dataFim || new Date(coupon.dataFim) >= now;
          const hasUsesLeft = !coupon.limiteUsos || coupon.usos < coupon.limiteUsos;
          const meetsMinimum = !coupon.minimoCompra || subtotal >= parseFloat(coupon.minimoCompra);

          if (isNotExpired && hasUsesLeft && meetsMinimum) {
            if (coupon.tipo === "percentual") {
              desconto = (subtotal * parseFloat(coupon.valor)) / 100;
            } else {
              desconto = parseFloat(coupon.valor);
            }
            // Increment coupon usage
            await storage.incrementCouponUses(coupon.id);
          }
        }
      }

      const total = subtotal - desconto;

      // Create order
      const order = await storage.createOrder({
        userId: req.user?.id || null,
        status: "pendente",
        subtotal: subtotal.toFixed(2),
        desconto: desconto.toFixed(2),
        total: total.toFixed(2),
        cupomCodigo: cupomCodigo || null,
        ...orderData,
      });

      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          nomeProduto: item.nomeProduto,
          precoProduto: item.precoProduto,
          quantidade: item.quantidade,
          tamanho: item.tamanho,
          cor: item.cor,
          imagemProduto: item.imagemProduto,
        });
      }

      // Integrate with PaySuite
      const { createPaySuitePayment } = await import("./paysuite");
      const paysuiteResponse = await createPaySuitePayment({
        amount: total,
        reference: order.id,
        // Use the correct field names from the checkout form
        customer_name: orderData.nomeCliente || orderData.nomeCompleto || "Cliente IDENTICAL",
        customer_email: orderData.emailCliente || orderData.email,
        customer_phone: orderData.telefoneCliente || orderData.telefone,
        callback_url: `${process.env.BASE_URL || 'https://identical-store-production.up.railway.app'}/api/paysuite/webhook`,
        return_url: `${process.env.BASE_URL || 'https://identical-store-production.up.railway.app'}/pedido/${order.id}`,
        description: `Pedido IDENTICAL #${order.id.slice(0, 8).toUpperCase()}`,
      });

      if (paysuiteResponse.success && paysuiteResponse.payment_id) {
        console.log('✅ Pagamento PaySuite criado:', paysuiteResponse.payment_id);
      } else {
        console.warn('⚠️ PaySuite falhou, pedido criado sem link de pagamento:', paysuiteResponse.error);
      }

      // Send confirmation email (best-effort)
      try {
        const { enviarEmailConfirmacaoPedido } = await import("./email");
        await enviarEmailConfirmacaoPedido(order, items);
        console.log('📧 Email de confirmação enviado para:', orderData.emailCliente || orderData.email);
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email:', emailError);
      }

      // Always return success with order info
      // If PaySuite fails, redirect to order status page instead of payment page
      res.json({
        order,
        checkout_url: paysuiteResponse.checkout_url || null,
        payment_id: paysuiteResponse.payment_id || null,
        // Consider success if order was created, even if PaySuite failed
        success: true,
        paysuite_success: paysuiteResponse.success,
        order_url: `/pedido/${order.id}`,
        message: paysuiteResponse.success
          ? "Pedido criado! Redirecionando para pagamento..."
          : "Pedido criado com sucesso! Siga as instruções para concluir o pagamento.",
      });
    } catch (error) {
      next(error);
    }
  });

  // ============ PAYSUITE WEBHOOK ============

  app.post("/api/paysuite/webhook", async (req, res, next) => {
    try {
      console.log('📩 [PaySuite Webhook] Recebido:', req.body);

      const { reference, status, payment_id, transaction_id } = req.body;

      if (!reference) {
        console.error('❌ [PaySuite Webhook] Referência não fornecida');
        return res.status(400).json({ error: 'Reference required' });
      }

      // Log the webhook for debugging
      console.log(`🔔 [PaySuite Webhook] Status: ${status}, Referência: ${reference}`);

      // Update order based on payment status
      if (status === 'completed' || status === 'paid' || status === 'success') {
        const order = await storage.getOrder(reference);
        if (order && order.status !== "confirmado") {
          await storage.updateOrderStatus(reference, "confirmado");
          console.log(`✅ [PaySuite Webhook] Pedido ${reference} confirmado`);

          // Decrement stock
          try {
            const items = await storage.getOrderItems(reference);
            for (const item of items) {
              await storage.decrementProductStock(item.productId, item.quantidade);
              console.log(`📉 Stock reduzido para produto ${item.productId}: -${item.quantidade}`);
            }
          } catch (stockError) {
            console.error('⚠️ Erro ao decrementar stock:', stockError);
          }

          // Send payment confirmation email
          try {
            if (order.email) {
              const { enviarEmailPagamentoConfirmado } = await import("./email");
              await enviarEmailPagamentoConfirmado(order);
              console.log(`📧 Email de pagamento confirmado enviado para: ${order.email}`);
            }
          } catch (emailError) {
            console.error('⚠️ Erro ao enviar email de confirmação:', emailError);
          }
        }
      } else if (status === 'failed' || status === 'cancelled' || status === 'canceled') {
        await storage.updateOrderStatus(reference, "cancelado");
        console.log(`❌ [PaySuite Webhook] Pedido ${reference} cancelado`);
      } else if (status === 'pending') {
        // Keep as pending
        console.log(`⏳ [PaySuite Webhook] Pedido ${reference} pendente`);
      } else {
        console.warn(`⚠️ [PaySuite Webhook] Status desconhecido: ${status}`);
      }

      // Respond to PaySuite
      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('❌ [PaySuite Webhook] Erro:', error);
      next(error);
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all orders (admin)
  app.get("/api/admin/orders", requireAdmin, async (req, res, next) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  // Update order status (admin)
  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).send("Pedido não encontrado");
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Create product (admin)
  app.post("/api/admin/products", requireAdmin, async (req, res, next) => {
    try {
      // Normalise input: empty strings for optional FK fields → null
      const body = {
        ...req.body,
        collectionId: req.body.collectionId || null,
        categoryId: req.body.categoryId || null,
        imagens: Array.isArray(req.body.imagens) ? req.body.imagens : [],
        tamanhos: Array.isArray(req.body.tamanhos) ? req.body.tamanhos : [],
        cores: Array.isArray(req.body.cores) ? req.body.cores : [],
        estoque: Number(req.body.estoque) || 0,
      };

      const parsed = insertProductSchema.safeParse(body);
      if (!parsed.success) {
        const msgs = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        return res.status(400).json({ message: `Dados inválidos: ${msgs}` });
      }

      const product = await storage.createProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  // Update product (admin)
  app.put("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).send("Produto não encontrado");
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Delete product (admin)
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).send("Produto não encontrado");
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Create collection (admin)
  app.post("/api/admin/collections", requireAdmin, async (req, res, next) => {
    try {
      const validated = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(validated);
      res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  });

  // Create category (admin)
  app.post("/api/admin/categories", requireAdmin, async (req, res, next) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  // Update category (admin)
  app.put("/api/admin/categories/:id", requireAdmin, async (req, res, next) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).send("Categoria não encontrada");
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  // Delete category (admin)
  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res, next) => {
    try {
      const deleted = await storage.deleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).send("Categoria não encontrada");
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Update collection (admin)
  app.put("/api/admin/collections/:id", requireAdmin, async (req, res, next) => {
    try {
      const collection = await storage.updateCollection(req.params.id, req.body);
      if (!collection) {
        return res.status(404).send("Coleção não encontrada");
      }
      res.json(collection);
    } catch (error) {
      next(error);
    }
  });

  // Delete collection (admin)
  app.delete("/api/admin/collections/:id", requireAdmin, async (req, res, next) => {
    try {
      const deleted = await storage.deleteCollection(req.params.id);
      if (!deleted) {
        return res.status(404).send("Coleção não encontrada");
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Update site settings (admin)
  app.put("/api/admin/settings", requireAdmin, async (req, res, next) => {
    try {
      const updated = await storage.updateSettings(req.body ?? {});
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // Base64 image upload (admin) - Cloudinary quando configurado, local como fallback
  app.post("/api/admin/upload-base64", requireAdmin, async (req, res, next) => {
    try {
      const { filename, dataUrl } = req.body || {};
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ message: "dataUrl obrigatório" });
      }

      // Se Cloudinary está configurado, usar Cloudinary (aceita qualquer formato nativo)
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await cloudinary.uploader.upload(dataUrl, {
          folder: 'identical',
          resource_type: 'auto',
        });

        return res.status(201).json({ url: result.secure_url });
      }

      // Fallback: guardar localmente - aceita qualquer tipo de imagem
      const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (!match) {
        return res.status(400).json({ message: "Formato de dataUrl inválido" });
      }
      const mime = match[1];
      const base64 = match[2];
      const buffer = Buffer.from(base64, "base64");

      // Derivar extensão de qualquer MIME do tipo image/*
      const mimeToExt: Record<string, string> = {
        "image/jpeg": ".jpg", "image/jpg": ".jpg",
        "image/png": ".png", "image/webp": ".webp",
        "image/gif": ".gif", "image/avif": ".avif",
        "image/heic": ".heic", "image/heif": ".heif",
        "image/svg+xml": ".svg", "image/bmp": ".bmp", "image/tiff": ".tiff",
      };
      const ext = mimeToExt[mime] ?? `.${(mime.split("/")[1] ?? "jpg").split("+")[0]}`;

      const safeName =
        (filename && typeof filename === "string"
          ? filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_")
          : "upload") +
        "_" + Date.now() + ext;

      const assetsDir = path.join(process.cwd(), "attached_assets");
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
      fs.writeFileSync(path.join(assetsDir, safeName), buffer);
      return res.status(201).json({ url: "/attached_assets/" + safeName });
    } catch (error) {
      next(error);
    }
  });

  // ============ ADMIN USER MANAGEMENT ============

  // Get all users (admin)
  app.get("/api/admin/users", requireAdmin, async (req, res, next) => {
    try {
      const allUsers = await storage.getUsers();
      // Never expose password hashes
      const safe = allUsers.map(({ password: _, ...u }) => u);
      res.json(safe);
    } catch (error) {
      next(error);
    }
  });

  // Update user (admin) - can change nome, email, isAdmin; password reset optional
  app.put("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const { password, ...rest } = req.body;
      let updates: any = { ...rest };

      // If a new password was provided, hash it
      if (password && typeof password === "string" && password.length > 0) {
        const { scrypt, randomBytes } = await import("crypto");
        const { promisify } = await import("util");
        const scryptAsync = promisify(scrypt);
        const salt = randomBytes(16).toString("hex");
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        updates.password = `${buf.toString("hex")}.${salt}`;
      }

      const user = await storage.updateUser(req.params.id, updates);
      if (!user) return res.status(404).send("Utilizador não encontrado");

      const { password: _, ...safe } = user;
      res.json(safe);
    } catch (error) {
      next(error);
    }
  });

  // Delete user (admin)
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res, next) => {
    try {
      // Prevent deleting yourself
      if (req.user?.id === req.params.id) {
        return res.status(400).json({ message: "Não pode apagar a sua própria conta." });
      }
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) return res.status(404).send("Utilizador não encontrado");
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });



  // Get all coupons (admin)
  app.get("/api/admin/coupons", requireAdmin, async (req, res, next) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      next(error);
    }
  });

  // Create coupon (admin)
  app.post("/api/admin/coupons", requireAdmin, async (req, res, next) => {
    try {
      const validated = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validated);
      res.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  });

  // Update coupon (admin)
  app.put("/api/admin/coupons/:id", requireAdmin, async (req, res, next) => {
    try {
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      if (!coupon) {
        return res.status(404).send("Cupão não encontrado");
      }
      res.json(coupon);
    } catch (error) {
      next(error);
    }
  });

  // Delete coupon (admin)
  app.delete("/api/admin/coupons/:id", requireAdmin, async (req, res, next) => {
    try {
      const deleted = await storage.deleteCoupon(req.params.id);
      if (!deleted) {
        return res.status(404).send("Cupão não encontrado");
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Validate coupon code
  app.post("/api/coupons/validate", async (req, res, next) => {
    try {
      const { code, subtotal } = req.body;
      const coupon = await storage.getCouponByCode(code);

      if (!coupon || !coupon.ativo) {
        return res.status(404).json({ error: "Cupão inválido" });
      }

      // Check if coupon has expired
      if (coupon.dataFim && new Date(coupon.dataFim) < new Date()) {
        return res.status(400).json({ error: "Cupão expirado" });
      }

      // Check if coupon has reached usage limit
      if (coupon.limiteUsos && coupon.usos >= coupon.limiteUsos) {
        return res.status(400).json({ error: "Cupão esgotado" });
      }

      // Check minimum purchase amount
      if (coupon.minimoCompra && parseFloat(subtotal) < parseFloat(coupon.minimoCompra)) {
        return res.status(400).json({
          error: `Compra mínima de ${coupon.minimoCompra} MZN necessária`
        });
      }

      // Calculate discount
      let desconto = 0;
      if (coupon.tipo === "percentual") {
        desconto = (parseFloat(subtotal) * parseFloat(coupon.valor)) / 100;
      } else {
        desconto = parseFloat(coupon.valor);
      }

      res.json({
        valid: true,
        codigo: coupon.codigo,
        tipo: coupon.tipo,
        valor: coupon.valor,
        desconto: desconto.toFixed(2),
      });
    } catch (error) {
      next(error);
    }
  });

  // Product views
  app.post("/api/products/:id/view", async (req, res, next) => {
    try {
      const product = await storage.incrementProductViews(req.params.id);
      if (!product) {
        return res.status(404).send("Produto não encontrado");
      }
      res.json({ views: product.views });
    } catch (error) {
      next(error);
    }
  });

  // Paysuite initiate (stub)
  app.post("/api/paysuite/initiate", async (req, res, next) => {
    try {
      const { total, reference } = req.body;
      // Prepare stub checkout url
      const checkout_url = `https://paysuite.example/checkout?ref=${encodeURIComponent(reference || "order")}`;
      res.json({ checkout_url, total });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
