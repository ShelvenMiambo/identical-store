// Based on javascript_auth_all_persistance blueprint
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendPasswordResetEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser { }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const suppliedClean = supplied.trim();
  console.log(`🔍 [comparePasswords] Supplied password: "${suppliedClean}"`);
  console.log(`🔍 [comparePasswords] Stored hash: ${stored.substring(0, 40)}...`);

  const [hashed, salt] = stored.split(".");
  console.log(`🔍 [comparePasswords] Extracted salt: ${salt.substring(0, 20)}...`);

  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(suppliedClean, salt, 64)) as Buffer;

  console.log(`🔍 [comparePasswords] Supplied buf (first 20): ${suppliedBuf.toString("hex").substring(0, 40)}...`);
  console.log(`🔍 [comparePasswords] Stored buf (first 20): ${hashedBuf.toString("hex").substring(0, 40)}...`);

  const result = timingSafeEqual(hashedBuf, suppliedBuf);
  console.log(`🔍 [comparePasswords] Result: ${result}`);

  return result;
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "identical-secret-key-change-in-production";

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      console.log(`🔐 [Login Attempt] Username: ${username}`);
      const user = await storage.getUserByUsername(username);
      console.log(`👤 [Login] User found:`, !!user);
      if (user) {
        console.log(`   User ID: ${user.id}`);
        console.log(`   isAdmin: ${user.isAdmin}`);
        console.log(`   Password hash (first 20): ${user.password.substring(0, 20)}...`);
      }

      if (!user) {
        console.log(`❌ [Login] User not found`);
        return done(null, false);
      }

      const passwordMatch = await comparePasswords(password, user.password);
      console.log(`🔑 [Login] Password match:`, passwordMatch);

      if (!passwordMatch) {
        console.log(`❌ [Login] Password mismatch`);
        return done(null, false);
      } else {
        console.log(`✅ [Login] Successful login for ${username}`);
        return done(null, user);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).send("Username já existe");
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email já está registado");
      }

      const user = await storage.createUser({
        username: req.body.username,
        email: req.body.email,
        nome: req.body.nome,
        telefone: req.body.telefone,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("📥 [/api/login] Request body:", JSON.stringify(req.body));
    console.log("📥 [/api/login] Username:", req.body.username);
    console.log("📥 [/api/login] Password:", req.body.password);
    console.log("📥 [/api/login] Password length:", req.body.password?.length);
    console.log("📥 [/api/login] Password type:", typeof req.body.password);
    next();
  }, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // ── Alterar password ──────────────────────────────────────────────
  app.post("/api/user/change-password", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Preenche todos os campos." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "A nova password deve ter pelo menos 6 caracteres." });
    }

    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user) return res.status(404).json({ message: "Utilizador não encontrado." });

      const passwordMatch = await comparePasswords(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "A password actual está incorrecta." });
      }

      const hashed = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashed } as any);

      res.json({ message: "Password alterada com sucesso." });
    } catch (err) {
      next(err);
    }
  });

  // ── Recuperar password (Forgot) ───────────────────────────────────
  app.post("/api/forgot-password", async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório." });
    }

    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Modo de Teste: Este email não existe na base de dados!" });
      }

      // 1 hora de validade
      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); 

      await storage.setResetToken(user.id, token, expiry);

      // Link para o frontend
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
      
      const emailSent = await sendPasswordResetEmail(user.email, resetUrl);
      if (!emailSent) {
          return res.status(500).json({ message: "Modo de Teste: Falhou o envio de email! Verifica o 'Deploy Logs' no Railway para ver o erro exacto." });
      }

      res.json({ message: "Modo de Teste: O Email foi enviado com sucesso!" });
    } catch (err) {
      next(err);
    }
  });

  // ── Redefinir password (Reset) ────────────────────────────────────
  app.post("/api/reset-password", async (req, res, next) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Dados incompletos." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "A nova password deve ter pelo menos 6 caracteres." });
    }

    try {
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Link inválido ou expirado. Pede um novo link de recuperação." });
      }

      const hashed = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashed } as any);
      // Apagar o token
      await storage.setResetToken(user.id, null, null);

      res.json({ message: "A tua password foi redefinida com sucesso." });
    } catch (err) {
      next(err);
    }
  });
}
