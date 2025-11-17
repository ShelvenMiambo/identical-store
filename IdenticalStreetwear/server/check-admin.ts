
import { storage } from "./storage";

async function checkAdmin() {
  try {
    console.log("\n🔍 Verificando usuário admin...\n");
    
    const admin = await storage.getUserByUsername("admin");
    
    if (admin) {
      console.log("✅ Usuário admin encontrado!");
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nome: ${admin.nome}`);
      console.log(`   Is Admin: ${admin.isAdmin}`);
      console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);
    } else {
      console.log("❌ Usuário admin NÃO encontrado!");
      console.log("\nListando todos os usuários:");
      
      const allUsers = await storage.db.select().from(storage.users);
      console.log(`\nTotal de usuários: ${allUsers.length}`);
      
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Admin: ${user.isAdmin}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

checkAdmin();
