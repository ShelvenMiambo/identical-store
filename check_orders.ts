import { db } from "./server/db";
import { orders } from "./shared/schema";
import { count, desc } from "drizzle-orm";

async function run() {
  const result = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
  console.log("Last 5 orders:", result.map(o => ({ id: o.id, userId: o.userId, client: o.nomeCliente })));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
