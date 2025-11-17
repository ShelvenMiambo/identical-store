import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertCollectionSchema, insertCouponSchema } from "@shared/schema";

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
      const { items, ...orderData } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).send("Carrinho vazio");
      }

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.precoProduto) * item.quantidade;
      }, 0);

      const desconto = 0; // TODO: Apply coupon discount
      const total = subtotal - desconto;

      // Create order
      const order = await storage.createOrder({
        userId: req.user?.id || null,
        status: "pendente",
        subtotal: subtotal.toString(),
        desconto: desconto.toString(),
        total: total.toString(),
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

      // TODO: Integrate with PaySuite
      // const paysuiteResponse = await createPaySuitePayment({
      //   amount: total,
      //   reference: order.id,
      //   callback_url: `${process.env.BASE_URL}/api/paysuite/webhook`,
      //   return_url: `${process.env.BASE_URL}/pedido/${order.id}`,
      // });

      // For now, return order without payment integration
      res.json({
        order,
        // checkout_url: paysuiteResponse.checkout_url, // Will be added when PaySuite is integrated
        message: "Pedido criado com sucesso. Integração PaySuite pendente.",
      });
    } catch (error) {
      next(error);
    }
  });

  // ============ PAYSUITE WEBHOOK ============

  app.post("/api/paysuite/webhook", async (req, res, next) => {
    try {
      // TODO: Verify PaySuite signature
      const { reference, status } = req.body;

      if (status === "completed") {
        await storage.updateOrderStatus(reference, "confirmado");
      } else if (status === "failed") {
        await storage.updateOrderStatus(reference, "cancelado");
      }

      res.sendStatus(200);
    } catch (error) {
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
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
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
      const { code } = req.body;
      const coupon = await storage.getCouponByCode(code);

      if (!coupon || !coupon.ativo) {
        return res.status(404).send("Cupão inválido");
      }

      // Check if coupon has expired
      if (coupon.dataFim && new Date(coupon.dataFim) < new Date()) {
        return res.status(400).send("Cupão expirado");
      }

      // Check if coupon has reached usage limit
      if (coupon.limiteUsos && coupon.usos >= coupon.limiteUsos) {
        return res.status(400).send("Cupão esgotado");
      }

      res.json({
        valid: true,
        tipo: coupon.tipo,
        valor: coupon.valor,
        minimoCompra: coupon.minimoCompra,
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
