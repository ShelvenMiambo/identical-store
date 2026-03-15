import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertProductSchema, insertCollectionSchema, insertCouponSchema } from "@shared/schema";
import { insertCategorySchema } from "@shared/schema";
import { deleteImages, getCloudinaryFolder } from "./media";
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

  // Get order by ID — public (guest tracking by UUID) or authenticated user/admin
  app.get("/api/orders/:id", async (req, res, next) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      // Authenticated non-admin users can only see their own orders
      if (req.user && !req.user.isAdmin && order.userId && order.userId !== req.user.id) {
        return res.sendStatus(403);
      }
      // Include order items in the response
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      next(error);
    }
  });

  // Export Receipt PDF for a specific order
  app.get("/api/orders/:id/receipt", async (req, res, next) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).send("Pedido não encontrado");
      }
      
      // Verification
      if (req.user && !req.user.isAdmin && order.userId && order.userId !== req.user.id) {
        return res.sendStatus(403);
      }
      
      const items = await storage.getOrderItems(order.id);
      const fmt = (v: string | null | undefined) =>
        v ? parseFloat(v).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" }) : "—";
      const fmtDate = (d: Date | string) =>
        new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

      const itemRows = items.map((item) => `
        <tr>
          <td>${item.nomeProduto} <br><small style="color:#64748b">Tam: ${item.tamanho} | Cor: ${item.cor}</small></td>
          <td style="text-align:center">${item.quantidade}</td>
          <td style="text-align:right">${fmt(item.precoProduto)}</td>
          <td style="text-align:right">${fmt((parseFloat(item.precoProduto) * item.quantidade).toString())}</td>
        </tr>
      `).join("");

      const html = `
        <!DOCTYPE html><html lang="pt">
        <head>
          <meta charset="UTF-8">
          <title>Recibo — Pedido #${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 40px; background: #fff; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { font-size: 28px; font-weight: 800; letter-spacing: 2px; }
            .header-info { text-align: right; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .details-col p { margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #0f172a; color: white; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .totals-row.final { font-size: 16px; font-weight: bold; border-bottom: none; border-top: 2px solid #0f172a; padding-top: 12px; }
            .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 11px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>ID<span style="font-size: 1.2em; line-height: 1;">≠</span>NTICAL</h1>
              <p style="color: #64748b; margin-top: 4px;">Cultura Urbana Autêntica</p>
            </div>
            <div class="header-info">
              <h2 style="font-size: 24px; color: #64748b; text-transform: uppercase;">Recibo</h2>
              <p><strong>Nº do Pedido:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>Data:</strong> ${fmtDate(order.createdAt)}</p>
            </div>
          </div>

          <div class="details">
            <div class="details-col">
              <strong>Faturado a:</strong>
              <p>${order.nomeCliente}</p>
              <p>${order.enderecoEntrega}</p>
              <p>${order.cidadeEntrega}, ${order.provinciaEntrega}</p>
              <p>${order.emailCliente || ""}</p>
              <p>${order.telefoneCliente}</p>
            </div>
            <div class="details-col" style="text-align:right">
              <strong>Pagamento:</strong>
              <p style="text-transform: uppercase">${order.metodoPagamento || "—"}</p>
              <p><strong>Estado:</strong> <span style="text-transform: uppercase; color: ${order.status === 'cancelado' ? '#dc2626' : (order.status === 'entregue' ? '#16a34a' : '#0f172a')}">${order.status}</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th style="text-align:center">Qtd</th>
                <th style="text-align:right">Preço Unitário</th>
                <th style="text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${fmt(order.subtotal)}</span>
            </div>
            ${parseFloat(order.desconto?.toString() || "0") > 0 ? `
            <div class="totals-row">
              <span>Desconto:</span>
              <span style="color: #16a34a;">-${fmt(order.desconto.toString())}</span>
            </div>
            ` : ""}
            <div class="totals-row final">
              <span>Total Pago:</span>
              <span>${fmt(order.total)}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Obrigado pela sua compra!</strong></p>
            <p style="margin-top: 8px;">Para questões sobre o envio ou pagamento, contacte o suporte: +258 84 875 5045</p>
            <p style="margin-top: 15px;">ID<span style="font-size: 1.2em; line-height: 1;">≠</span>NTICAL &copy; ${new Date().getFullYear()} — Todos os direitos reservados.</p>
          </div>
          <script>window.onload = () => window.print();</script>
        </body></html>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
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

      // Extract explicitly passed userId from body as a fallback
      const checkoutUserId = req.body.userId || null;

      // Create order (includes metodoPagamento + comprovanteUrl from body)
      const order = await storage.createOrder({
        userId: req.user?.id || checkoutUserId,
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

      // Enviar emails (best-effort — não bloqueia a resposta ao cliente)
      try {
        const { enviarEmailConfirmacaoPedido, enviarEmailComprovanteAdmin, enviarEmailNovoAdmin } = await import("./email");
        // Email ao cliente (se tem email)
        if (orderData.emailCliente) {
          enviarEmailConfirmacaoPedido(order, items).catch(() => { });
        }
        // Email ao admin — SEMPRE (com ou sem comprovativo)
        if (orderData.comprovanteUrl) {
          enviarEmailComprovanteAdmin(order, items, orderData.comprovanteUrl).catch(() => { });
        } else {
          enviarEmailNovoAdmin(order, items).catch(() => { });
        }
      } catch (emailError) {
        console.error('⚠️ Erro ao enviar email:', emailError);
      }

      // Return order info — PaySuite is in standby, always go to order status page
      res.json({
        order,
        checkout_url: null,
        payment_id: null,
        success: true,
        order_url: `/pedido/${order.id}`,
        message: "Pedido criado com sucesso! A equipa irá confirmar o pagamento em breve.",
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
            if (order.emailCliente) {
              const { enviarEmailPagamentoConfirmado } = await import("./email");
              await enviarEmailPagamentoConfirmado(order);
              console.log(`📧 Email de pagamento confirmado enviado para: ${order.emailCliente}`);
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
  // - Guarda no histórico permanente quando finalizado (entregue | cancelado)
  // - Agenda eliminação do pedido após 1 hora quando status = "entregue"
  // - Apaga comprovativo do Cloudinary quando confirmado | cancelado
  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const { status } = req.body;
      const currentOrder = await storage.getOrder(req.params.id);
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).send("Pedido não encontrado");
      }

      // ── Guardar no histórico quando pedido for finalizado ──
      if (status === "entregue" || status === "cancelado") {
        try {
          const itens = await storage.getOrderItems(order.id);
          await storage.saveOrderHistory(order, itens);
        } catch (histErr: any) {
          console.error("[⚠️] Erro ao guardar histórico:", histErr.message);
        }
      }

      // ── Auto-eliminar pedido 1 hora após ser marcado como "entregue" ──
      if (status === "entregue") {
        const ONE_HOUR = 60 * 60 * 1000;
        setTimeout(async () => {
          try {
            await storage.deleteOrder(order.id);
            console.log(`🗑️ [Auto] Pedido ${order.id.slice(0, 8)} eliminado após 1h (entregue)`);
          } catch (delErr: any) {
            console.error(`[⚠️] Erro ao auto-eliminar pedido ${order.id.slice(0, 8)}:`, delErr.message);
          }
        }, ONE_HOUR);
        console.log(`⏱️ [Auto] Pedido ${order.id.slice(0, 8)} agendado para eliminação em 1h`);
      }

      // ── Apagar comprovativo quando pedido é confirmado ou cancelado ──
      if ((status === "confirmado" || status === "cancelado") && currentOrder?.comprovanteUrl) {
        deleteImages([currentOrder.comprovanteUrl]).catch((e) =>
          console.error("[⚠️] Erro ao apagar comprovativo:", e.message)
        );
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Histórico de pedidos (admin) — todos os pedidos entregues e cancelados
  app.get("/api/admin/orders/history", requireAdmin, async (req, res, next) => {
    try {
      const history = await storage.getOrderHistory();
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  // Export PDF do histórico — devolve HTML formatado para impressão/PDF
  app.get("/api/admin/orders/export-pdf", requireAdmin, async (req, res, next) => {
    try {
      const history = await storage.getOrderHistory();
      const fmt = (v: string | null | undefined) =>
        v ? parseFloat(v).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" }) : "—";
      const fmtDate = (d: Date | string) =>
        new Date(d).toLocaleDateString("pt-MZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

      // Gerar linhas da tabela de itens por pedido
      const rows = history.map((h) => {
        const itens: any[] = Array.isArray(h.itens) ? h.itens : [];
        return itens.map((item) => `
          <tr>
            <td>${fmtDate(h.dataFinalizacao)}</td>
            <td>${h.orderId.slice(0, 8).toUpperCase()}</td>
            <td>${h.nomeCliente}</td>
            <td>${h.telefoneCliente}</td>
            <td>${item.nomeProduto ?? "—"}</td>
            <td style="text-align:center">${item.quantidade ?? 1}</td>
            <td style="text-align:center">${item.tamanho ?? "—"}</td>
            <td style="text-align:center; color:${h.statusFinal === 'entregue' ? '#16a34a' : '#dc2626'}; font-weight:600">
              ${h.statusFinal === 'entregue' ? 'Entregue' : 'Cancelado'}
            </td>
            <td style="text-align:right">${fmt(h.total)}</td>
          </tr>
        `).join("");
      }).join("");

      const html = `
        <!DOCTYPE html><html lang="pt">
        <head>
          <meta charset="UTF-8">
          <title>Histórico de Pedidos — IDENTICAL</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 24px; }
            h1 { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
            .subtitle { color: #64748b; font-size: 11px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
            thead { background: #0f172a; color: white; }
            th { padding: 8px 10px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            tr:nth-child(even) td { background: #f8fafc; }
            .total-row td { font-weight: 700; background: #f1f5f9; border-top: 2px solid #0f172a; }
            .footer { margin-top: 20px; color: #94a3b8; font-size: 10px; }
            @media print {
              body { padding: 12px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>IDENTICAL</h1>
          <p class="subtitle">Histórico de Pedidos — Gerado em ${fmtDate(new Date())}</p>
          <table>
            <thead>
              <tr>
                <th>Data</th><th>Pedido #</th><th>Cliente</th><th>Telef.</th>
                <th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:center">Tam.</th>
                <th style="text-align:center">Estado</th><th style="text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="9" style="text-align:center;padding:20px;color:#94a3b8">Sem registos no histórico</td></tr>'}</tbody>
          </table>
          <p class="footer">Total de registos: ${history.length} pedido(s) | IDENTICAL &copy; ${new Date().getFullYear()}</p>
          <script>window.onload = () => window.print();<\/script>
        </body></html>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
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
      const body = {
        ...req.body,
        collectionId: req.body.collectionId || null,
        categoryId: req.body.categoryId || null,
        imagens: Array.isArray(req.body.imagens) ? req.body.imagens : [],
        tamanhos: Array.isArray(req.body.tamanhos) ? req.body.tamanhos : [],
        cores: Array.isArray(req.body.cores) ? req.body.cores : [],
        estoque: req.body.estoque !== undefined ? Number(req.body.estoque) : undefined,
      };

      // Guardar imagens antigas antes de atualizar
      const current = await storage.getProduct(req.params.id);
      const product = await storage.updateProduct(req.params.id, body);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      // Apagar imagens que foram removidas (existiam antes mas já não existem)
      if (current?.imagens?.length && req.body.imagens) {
        const removidas = current.imagens.filter(
          (url) => !req.body.imagens.includes(url)
        );
        if (removidas.length > 0) {
          deleteImages(removidas).catch((e) =>
            console.error("[⚠️] Erro ao apagar imagens removidas:", e.message)
          );
        }
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Delete product (admin)
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
    try {
      // Buscar produto antes de apagar para ter as URLs das imagens
      const product = await storage.getProduct(req.params.id);
      let deleted;
      try {
        deleted = await storage.deleteProduct(req.params.id);
      } catch (err: any) {
        if (err.message === "PRODUTO_COM_PEDIDOS") {
           return res.status(400).json({ message: "Não é possível eliminar: O produto já possui pedidos associados. Para evitar quebrar o histórico, por favor, edite o produto e desative-o em vez de eliminar." });
        }
        throw err;
      }
      if (!deleted) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      // Apagar imagens do Cloudinary/local (best-effort)
      if (product?.imagens?.length) {
        deleteImages(product.imagens).catch((e) =>
          console.error("[⚠️] Erro ao apagar imagens do produto:", e.message)
        );
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
      // Guardar imagem antiga antes de atualizar
      const current = await storage.getCollection(req.params.id);
      const collection = await storage.updateCollection(req.params.id, req.body);
      if (!collection) {
        return res.status(404).send("Coleção não encontrada");
      }
      // Apagar imagem antiga se foi substituída
      if (current?.imagem && req.body.imagem !== undefined && current.imagem !== req.body.imagem) {
        deleteImages([current.imagem]).catch((e) =>
          console.error("[⚠️] Erro ao apagar imagem da coleção:", e.message)
        );
      }
      res.json(collection);
    } catch (error) {
      next(error);
    }
  });

  // Delete collection (admin)
  app.delete("/api/admin/collections/:id", requireAdmin, async (req, res, next) => {
    try {
      // Guardar imagem antes de apagar
      const current = await storage.getCollection(req.params.id);
      const deleted = await storage.deleteCollection(req.params.id);
      if (!deleted) {
        return res.status(404).send("Coleção não encontrada");
      }
      // Apagar imagem de capa do Cloudinary/local
      if (current?.imagem) {
        deleteImages([current.imagem]).catch((e) =>
          console.error("[⚠️] Erro ao apagar imagem da coleção eliminada:", e.message)
        );
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Update site settings (admin) + limpeza de slides removidos
  app.put("/api/admin/settings", requireAdmin, async (req, res, next) => {
    try {
      // Ler settings actuais para comparar banners
      const current = await storage.getSettings();
      const updated = await storage.updateSettings(req.body ?? {});

      // Apagar slides que foram removidos do Cloudinary/local
      if (Array.isArray(req.body?.banners) && Array.isArray(current.banners)) {
        const slidesRemovidos = current.banners.filter(
          (url) => !req.body.banners.includes(url)
        );
        if (slidesRemovidos.length > 0) {
          deleteImages(slidesRemovidos).catch((e) =>
            console.error("[⚠️] Erro ao apagar slides removidos:", e.message)
          );
        }
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // Base64 image upload (admin) — Cloudinary quando configurado, local como fallback
  // Aceita parâmetro opcional `tipo` para organizar pastas: produto | colecao | slideshow | comprovativo
  app.post("/api/admin/upload-base64", requireAdmin, async (req, res, next) => {
    try {
      const { filename, dataUrl, tipo } = req.body || {};
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ message: "dataUrl obrigatório" });
      }

      // Pasta Cloudinary baseada no tipo de ficheiro
      const folder = getCloudinaryFolder(tipo ?? "produto");

      // Se Cloudinary está configurado, usar Cloudinary
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await cloudinary.uploader.upload(dataUrl, {
          folder,
          resource_type: 'auto',
        });

        return res.status(201).json({ url: result.secure_url });
      }

      // Fallback: guardar localmente
      const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (!match) {
        return res.status(400).json({ message: "Formato de dataUrl inválido" });
      }
      const mime = match[1];
      const base64 = match[2];
      const buffer = Buffer.from(base64, "base64");

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

  // Upload público de comprovativo de pagamento (não requer admin)
  // Usado pelo checkout do cliente
  app.post("/api/upload/comprovativo", async (req, res, next) => {
    try {
      const { filename, dataUrl } = req.body || {};
      if (!dataUrl || typeof dataUrl !== "string") {
        return res.status(400).json({ message: "dataUrl obrigatório" });
      }
      // Validar que é mesmo uma imagem ou PDF
      if (!dataUrl.match(/^data:(image\/|application\/pdf)/)) {
        return res.status(400).json({ message: "Apenas imagens ou PDF são aceites" });
      }

      const folder = getCloudinaryFolder("comprovativo");

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const result = await cloudinary.uploader.upload(dataUrl, {
          folder,
          resource_type: 'auto',
        });
        return res.status(201).json({ url: result.secure_url });
      }

      // Fallback local
      const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (!match) return res.status(400).json({ message: "dataUrl inválido" });
      const mime = match[1];
      const base64 = match[2];
      const buffer = Buffer.from(base64, "base64");
      const ext = mime.includes("pdf") ? ".pdf" : ".jpg";
      const safeName = "comprovativo_" + Date.now() + ext;
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
