import {
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Collection, type InsertCollection,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Coupon, type InsertCoupon,
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import type { Store } from "express-session";

const MemoryStore = createMemoryStore(session);

// Storage interface with all CRUD operations
export interface IStorage {
  // Session store
  sessionStore: Store;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Collections
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;
  incrementCouponUses(id: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: Store;

  private users: Map<string, User>;
  private products: Map<string, Product>;
  private collections: Map<string, Collection>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private coupons: Map<string, Coupon>;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    this.users = new Map();
    this.products = new Map();
    this.collections = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.coupons = new Map();

    // Initialize with some data
    this.seedData();
  }

  private async seedData() {
    // Seed collections
    const sampleCollections: Omit<Collection, "createdAt">[] = [
      {
        id: "1",
        nome: "Raízes Urbanas",
        slug: "raizes-urbanas",
        descricao: "Coleção inspirada nas origens da cultura urbana moçambicana",
        imagem: "/attached_assets/Imagem WhatsApp 2025-11-10 às 18.29.32_92ebaa02_1763061428729.jpg",
        ativo: true,
        ordem: 0
      },
      {
        id: "2",
        nome: "Black Edition",
        slug: "black-edition",
        descricao: "Linha minimalista em preto",
        imagem: "/attached_assets/IMG-20251110-WA0104_1763061428739.jpg",
        ativo: true,
        ordem: 1
      }
    ];

    const createdCollections: Collection[] = [];
    for (const collection of sampleCollections) {
      const created = await this.createCollection(collection);
      createdCollections.push(created);
    }

    // Seed products
    const sampleProducts: Omit<Product, "createdAt">[] = [
      {
        id: "1",
        nome: "HUSTLE EVERY DAY",
        slug: "hustle-every-day",
        descricao: "T-shirt Coleção / Raízes Urbanas",
        preco: "1899.00",
        imagens: [
          "/attached_assets/IMG-20251110-WA0115_1763061428731.jpg",
          "/attached_assets/IMG-20251110-WA0109_1763061428732.jpg"
        ],
        tamanhos: ["S", "M", "L", "XL", "XXL"],
        cores: ["Branco", "Preto", "Cinza"],
        estoque: 50,
        ativo: true,
        novo: true,
        destaque: true,
        collectionId: "1"
      },
      {
        id: "2",
        nome: "YASUKE",
        slug: "yasuke",
        descricao: "T-shirt Coleção / Raízes Urbanas",
        preco: "1899.00",
        imagens: [
          "/attached_assets/IMG-20251110-WA0110_1763061428733.jpg",
          "/attached_assets/IMG-20251110-WA0111_1763061428734.jpg"
        ],
        tamanhos: ["S", "M", "L", "XL", "XXL"],
        cores: ["Branco", "Preto"],
        estoque: 30,
        ativo: true,
        novo: true,
        destaque: true,
        collectionId: "1"
      },
      {
        id: "3",
        nome: "MBILA",
        slug: "mbila",
        descricao: "T-shirt Coleção / Raízes Urbanas",
        preco: "1899.00",
        imagens: [
          "/attached_assets/IMG-20251110-WA0112_1763061428737.jpg",
          "/attached_assets/IMG-20251110-WA0113_1763061428738.jpg"
        ],
        tamanhos: ["S", "M", "L", "XL", "XXL"],
        cores: ["Branco", "Preto", "Cinza"],
        estoque: 40,
        ativo: true,
        novo: true,
        destaque: true,
        collectionId: "1"
      },
      {
        id: "4",
        nome: "BLACK EDITION",
        slug: "black-edition",
        descricao: "T-shirt Coleção / Raízes Urbanas - ID≠NTICAL",
        preco: "1899.00",
        imagens: [
          "/attached_assets/IMG-20251110-WA0104_1763061428739.jpg",
          "/attached_assets/IMG-20251110-WA0105_1763061428740.jpg"
        ],
        tamanhos: ["S", "M", "L", "XL"],
        cores: ["Preto"],
        estoque: 25,
        ativo: true,
        novo: true,
        destaque: true,
        collectionId: "2"
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      telefone: insertUser.telefone ?? null,
      endereco: insertUser.endereco ?? null,
      cidade: insertUser.cidade ?? null,
      provincia: insertUser.provincia ?? null,
      id,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find((p) => p.slug === slug);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      descricao: insertProduct.descricao ?? null,
      collectionId: insertProduct.collectionId ?? null,
      ativo: insertProduct.ativo ?? true,
      destaque: insertProduct.destaque ?? false,
      novo: insertProduct.novo ?? false,
      estoque: insertProduct.estoque ?? 0,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated = { ...product, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Collections
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values()).sort((a, b) => a.ordem - b.ordem);
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    return Array.from(this.collections.values()).find((c) => c.slug === slug);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = {
      ...insertCollection,
      descricao: insertCollection.descricao ?? null,
      imagem: insertCollection.imagem ?? null,
      ativo: insertCollection.ativo ?? true,
      ordem: insertCollection.ordem ?? 0,
      id,
      createdAt: new Date(),
    };
    this.collections.set(id, collection);
    return collection;
  }

  async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;

    const updated = { ...collection, ...updates };
    this.collections.set(id, updated);
    return updated;
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.collections.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter((order) => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      userId: insertOrder.userId ?? null,
      status: insertOrder.status ?? "pendente",
      desconto: insertOrder.desconto ?? "0",
      metodoPagamento: insertOrder.metodoPagamento ?? null,
      paysuiteTransactionId: insertOrder.paysuiteTransactionId ?? null,
      paysuiteStatus: insertOrder.paysuiteStatus ?? null,
      cupomCodigo: insertOrder.cupomCodigo ?? null,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updated = {
      ...order,
      status,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    return this.coupons.get(id);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(
      (coupon) => coupon.codigo.toLowerCase() === code.toLowerCase()
    );
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = {
      ...insertCoupon,
      ativo: insertCoupon.ativo ?? true,
      minimoCompra: insertCoupon.minimoCompra ?? null,
      limiteUsos: insertCoupon.limiteUsos ?? null,
      dataFim: insertCoupon.dataFim ?? null,
      id,
      usos: 0,
      createdAt: new Date(),
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;

    const updated = { ...coupon, ...updates };
    this.coupons.set(id, updated);
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  async incrementCouponUses(id: string): Promise<void> {
    const coupon = this.coupons.get(id);
    if (coupon) {
      coupon.usos += 1;
      this.coupons.set(id, coupon);
    }
  }
}

export const storage = new MemStorage();