import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

export async function createAdminRuntime(storage: any) {
    try {
        console.log("\n🔧 [createAdminRuntime] Iniciando criação do admin...");

        const existing = await storage.getUserByUsername("admin");
        console.log(`🔍 [createAdminRuntime] Usuário existente:`, existing ? 'SIM' : 'NÃO');

        if (!existing) {
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const adminUsername = process.env.ADMIN_USERNAME || 'admin';
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@identical.co.mz';

            const hashedPassword = await hashPassword(adminPassword);
            console.log(`🔐 [createAdminRuntime] Password hasheado: ${hashedPassword.substring(0, 20)}...`);

            const user = await storage.createUser({
                username: adminUsername,
                email: adminEmail,
                nome: 'Administrador',
                telefone: '+258 84 000 0000',
                password: hashedPassword,
            });

            console.log(`👤 [createAdminRuntime] Usuário criado:`, user.id);

            const promoted = await storage.makeUserAdmin(user.username);
            console.log(`⬆️  [createAdminRuntime] Promovido a admin:`, promoted?.isAdmin);

            const verifyAdmin = await storage.getUserByUsername(adminUsername);
            console.log(`✔️  [createAdminRuntime] Verificação final:`, {
                exists: !!verifyAdmin,
                isAdmin: verifyAdmin?.isAdmin,
                id: verifyAdmin?.id
            });

            console.log('\u2705 Admin user created successfully!');
            console.log(`   Username: ${adminUsername}`);
            console.log(`   Password: ${adminPassword}`);
            console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
            return user;
        } else {
            if (!existing.isAdmin) {
                await storage.makeUserAdmin(existing.username);
                console.log("✅ User promoted to admin!");
            } else {
                console.log("✅ Admin user already exists");
                console.log(`   ID: ${existing.id}`);
                console.log(`   isAdmin: ${existing.isAdmin}`);
            }
            return existing;
        }
    } catch (error) {
        console.error("❌ Error creating admin:", error);
        throw error;
    }
}
