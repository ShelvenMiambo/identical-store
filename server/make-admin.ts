
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Configuração do usuário admin
const ADMIN_USER = {
  username: "admin",
  email: "admin@identical.co.mz",
  nome: "Administrador",
  password: "admin123", // Altere esta senha!
  telefone: "+258 84 000 0000",
};

async function createAdmin() {
  try {
    console.log("\n🔧 Criando usuário administrador...\n");
    
    // Verificar se já existe
    const existing = await storage.getUserByUsername(ADMIN_USER.username);
    
    if (existing) {
      console.log(`⚠️  Usuário '${ADMIN_USER.username}' já existe!`);
      console.log(`📧 Email: ${existing.email}`);
      console.log(`👤 Nome: ${existing.nome}`);
      console.log(`🔑 Admin: ${existing.isAdmin ? 'Sim' : 'Não'}`);
      
      if (!existing.isAdmin) {
        console.log("\n🔄 Promovendo usuário existente a admin...");
        await storage.db
          .update(storage.users)
          .set({ isAdmin: true })
          .where(storage.eq(storage.users.username, ADMIN_USER.username));
        console.log("✅ Usuário promovido a admin com sucesso!");
      }
    } else {
      // Criar novo usuário admin
      const hashedPassword = await hashPassword(ADMIN_USER.password);
      
      const user = await storage.createUser({
        username: ADMIN_USER.username,
        email: ADMIN_USER.email,
        nome: ADMIN_USER.nome,
        telefone: ADMIN_USER.telefone,
        password: hashedPassword,
        isAdmin: true,
      });
      
      console.log("✅ Usuário admin criado com sucesso!\n");
      console.log("📋 Detalhes do acesso:");
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${ADMIN_USER.password}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nome: ${user.nome}`);
    }
    
    console.log("\n🚀 Próximos passos:");
    console.log("   1. Acesse /auth");
    console.log("   2. Faça login com as credenciais acima");
    console.log("   3. Acesse /admin para gerenciar o sistema");
    console.log("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    process.exit(1);
  }
}

createAdmin();
