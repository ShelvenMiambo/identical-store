import { db } from './db';
import {
    users, products, collections, categories,
    orders, orderItems, coupons,
    type User, type InsertUser,
    type Product, type InsertProduct,
    type Collection, type InsertCollection,
    type Category, type InsertCategory,
    type Order, type InsertOrder,
    type OrderItem, type InsertOrderItem,
    type Coupon, type InsertCoupon,
} from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import type { Store } from 'express-session';
import type { IStorage, SiteSettings } from './storage';

const PgSession = connectPgSimple(session);

// Settings em memória (pode migrar para tabela depois)
let siteSettings: SiteSettings = {
    heroTitle: 'Be Different, Be Classic',
    heroSubtitle: 'Streetwear moçambicano autêntico. Raízes urbanas com forte identidade local.',
    banners: [],
    highlights: [],
};

export class PostgresStorage implements IStorage {
    sessionStore: Store;

    constructor() {
        this.sessionStore = new PgSession({
            conString: process.env.DATABASE_URL,
            tableName: 'session',
            createTableIfMissing: true,
        });
    }

    // ===== USERS =====
    async getUser(id: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const result = await db.insert(users).values({
            ...insertUser,
            isAdmin: false,
        }).returning();
        return result[0];
    }

    async makeUserAdmin(username: string): Promise<User | undefined> {
        const user = await this.getUserByUsername(username);
        if (!user) return undefined;
        const result = await db.update(users)
            .set({ isAdmin: true })
            .where(eq(users.username, username))
            .returning();
        return result[0];
    }

    async getUsers(): Promise<User[]> {
        return db.select().from(users).orderBy(desc(users.createdAt));
    }

    async updateUser(id: string, updates: Partial<InsertUser & { isAdmin: boolean }>): Promise<User | undefined> {
        const result = await db.update(users)
            .set(updates)
            .where(eq(users.id, id))
            .returning();
        return result[0];
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await db.delete(users).where(eq(users.id, id)).returning();
        return result.length > 0;
    }

    // ===== PRODUCTS =====
    async getProducts(): Promise<Product[]> {
        return db.select().from(products).orderBy(desc(products.createdAt));
    }

    async getProduct(id: string): Promise<Product | undefined> {
        const result = await db.select().from(products).where(eq(products.id, id));
        return result[0];
    }

    async getProductBySlug(slug: string): Promise<Product | undefined> {
        const result = await db.select().from(products).where(eq(products.slug, slug));
        return result[0];
    }

    async createProduct(insertProduct: InsertProduct): Promise<Product> {
        const result = await db.insert(products).values({
            ...insertProduct,
            views: 0,
        }).returning();
        return result[0];
    }

    async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
        const result = await db.update(products)
            .set(updates)
            .where(eq(products.id, id))
            .returning();
        return result[0];
    }

    async deleteProduct(id: string): Promise<boolean> {
        const result = await db.delete(products).where(eq(products.id, id)).returning();
        return result.length > 0;
    }

    async incrementProductViews(id: string): Promise<Product | undefined> {
        const result = await db.update(products)
            .set({ views: sql`${products.views} + 1` })
            .where(eq(products.id, id))
            .returning();
        return result[0];
    }

    async decrementProductStock(id: string, quantity: number): Promise<Product | undefined> {
        const product = await this.getProduct(id);
        if (!product) return undefined;
        const newStock = Math.max(0, (product.estoque ?? 0) - quantity);
        const result = await db.update(products)
            .set({ estoque: newStock })
            .where(eq(products.id, id))
            .returning();
        return result[0];
    }

    // ===== COLLECTIONS =====
    async getCollections(): Promise<Collection[]> {
        return db.select().from(collections).orderBy(collections.ordem);
    }

    async getCollection(id: string): Promise<Collection | undefined> {
        const result = await db.select().from(collections).where(eq(collections.id, id));
        return result[0];
    }

    async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
        const result = await db.select().from(collections).where(eq(collections.slug, slug));
        return result[0];
    }

    async createCollection(insertCollection: InsertCollection): Promise<Collection> {
        const result = await db.insert(collections).values(insertCollection).returning();
        return result[0];
    }

    async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
        const result = await db.update(collections)
            .set(updates)
            .where(eq(collections.id, id))
            .returning();
        return result[0];
    }

    async deleteCollection(id: string): Promise<boolean> {
        const result = await db.delete(collections).where(eq(collections.id, id)).returning();
        return result.length > 0;
    }

    // ===== CATEGORIES =====
    async getCategories(): Promise<Category[]> {
        return db.select().from(categories);
    }

    async getCategory(id: string): Promise<Category | undefined> {
        const result = await db.select().from(categories).where(eq(categories.id, id));
        return result[0];
    }

    async getCategoryBySlug(slug: string): Promise<Category | undefined> {
        const result = await db.select().from(categories).where(eq(categories.slug, slug));
        return result[0];
    }

    async createCategory(insertCategory: InsertCategory): Promise<Category> {
        const result = await db.insert(categories).values(insertCategory).returning();
        return result[0];
    }

    async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
        const result = await db.update(categories)
            .set(updates)
            .where(eq(categories.id, id))
            .returning();
        return result[0];
    }

    async deleteCategory(id: string): Promise<boolean> {
        const result = await db.delete(categories).where(eq(categories.id, id)).returning();
        return result.length > 0;
    }

    // ===== ORDERS =====
    async getOrders(): Promise<Order[]> {
        return db.select().from(orders).orderBy(desc(orders.createdAt));
    }

    async getOrder(id: string): Promise<Order | undefined> {
        const result = await db.select().from(orders).where(eq(orders.id, id));
        return result[0];
    }

    async getOrdersByUser(userId: string): Promise<Order[]> {
        return db.select().from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt));
    }

    async createOrder(insertOrder: InsertOrder): Promise<Order> {
        const result = await db.insert(orders).values(insertOrder).returning();
        return result[0];
    }

    async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
        const result = await db.update(orders)
            .set({ status, updatedAt: new Date() })
            .where(eq(orders.id, id))
            .returning();
        return result[0];
    }

    // ===== ORDER ITEMS =====
    async getOrderItems(orderId: string): Promise<OrderItem[]> {
        return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    }

    async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
        const result = await db.insert(orderItems).values(insertOrderItem).returning();
        return result[0];
    }

    // ===== COUPONS =====
    async getCoupons(): Promise<Coupon[]> {
        return db.select().from(coupons);
    }

    async getCoupon(id: string): Promise<Coupon | undefined> {
        const result = await db.select().from(coupons).where(eq(coupons.id, id));
        return result[0];
    }

    async getCouponByCode(code: string): Promise<Coupon | undefined> {
        const all = await db.select().from(coupons);
        return all.find(c => c.codigo.toLowerCase() === code.toLowerCase());
    }

    async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
        const result = await db.insert(coupons).values({
            ...insertCoupon,
            usos: 0,
        }).returning();
        return result[0];
    }

    async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined> {
        const result = await db.update(coupons)
            .set(updates)
            .where(eq(coupons.id, id))
            .returning();
        return result[0];
    }

    async deleteCoupon(id: string): Promise<boolean> {
        const result = await db.delete(coupons).where(eq(coupons.id, id)).returning();
        return result.length > 0;
    }

    async incrementCouponUses(id: string): Promise<void> {
        await db.update(coupons)
            .set({ usos: sql`${coupons.usos} + 1` })
            .where(eq(coupons.id, id));
    }

    // ===== SETTINGS =====
    async getSettings(): Promise<SiteSettings> {
        return siteSettings;
    }

    async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
        siteSettings = {
            heroTitle: settings.heroTitle ?? siteSettings.heroTitle,
            heroSubtitle: settings.heroSubtitle ?? siteSettings.heroSubtitle,
            banners: Array.isArray(settings.banners)
                ? settings.banners.filter((s) => typeof s === 'string')
                : siteSettings.banners,
            highlights: Array.isArray(settings.highlights)
                ? settings.highlights.map((h) => ({
                    title: String(h.title ?? ''),
                    description: h.description ?? undefined,
                    image: h.image ?? undefined,
                }))
                : siteSettings.highlights,
        };
        return siteSettings;
    }
}
