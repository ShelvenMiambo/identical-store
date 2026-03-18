import "dotenv/config";
import { db } from "./server/db";
import { orderItems, orders, orderHistory } from "./shared/schema";

async function main() {
  console.log("A apagar todos os orderItems...");
  await db.delete(orderItems);
  
  console.log("A apagar todos os orders...");
  await db.delete(orders);

  console.log("A apagar todo o orderHistory...");
  await db.delete(orderHistory);

  console.log("Limpeza concluída com sucesso!");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
